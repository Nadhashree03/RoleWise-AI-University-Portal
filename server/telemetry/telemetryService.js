// server/telemetry/telemetryService.js
// Central Telemetry Dispatcher & Fallback Service

import { SqliteTelemetrySink } from './sqliteSink.js';
import { StreamingTelemetrySink } from './streamingSink.js';
import { validateTelemetryEvent, createTelemetryEvent } from './eventSchema.js';

export class TelemetryService {
  constructor(options = {}) {
    this.mode = (options.mode || process.env.TELEMETRY_SINK || 'sqlite').toLowerCase();
    this.sqliteSink = options.sqliteSink || new SqliteTelemetrySink();
    this.streamingSink = options.streamingSink || new StreamingTelemetrySink(options.streamingOptions || {});

    // Metrics & Forensic ledger
    this.stats = {
      totalDispatched: 0,
      sqliteDelivered: 0,
      streamingDelivered: 0,
      fallbackDelivered: 0,
      validationFailures: 0,
      streamingFailures: 0,
      lastError: null,
      lastEventTimestamp: null
    };
  }

  /**
   * Primary entry point: Validates, sanitizes, and delivers telemetry event
   * through the configured sink with automatic SQLite fallback.
   */
  async recordEvent(rawEvent, options = {}) {
    this.stats.totalDispatched++;
    this.stats.lastEventTimestamp = new Date().toISOString();

    // 1. Build and validate event
    const eventCandidate = rawEvent.id ? rawEvent : createTelemetryEvent(rawEvent);
    const { valid, errors, sanitizedEvent } = validateTelemetryEvent(eventCandidate);

    if (!valid) {
      this.stats.validationFailures++;
      const errMessage = `Telemetry schema validation failed: ${errors.join('; ')}`;
      console.warn('[TelemetryService]', errMessage);
      return {
        success: false,
        error: errMessage,
        errors,
        code: 'SCHEMA_VALIDATION_ERROR'
      };
    }

    const event = sanitizedEvent;
    const targetMode = options.mode || this.mode;

    // 2. Direct SQLite Mode
    if (targetMode === 'sqlite') {
      const res = await this.sqliteSink.send(event);
      if (res.success) {
        this.stats.sqliteDelivered++;
      } else {
        this.stats.lastError = res.error;
      }
      return {
        ...res,
        eventId: event.id,
        streamed: false,
        fallback: false
      };
    }

    // 3. Streaming Mode (with bounded retries & automatic SQLite fallback)
    if (targetMode === 'streaming') {
      const streamRes = await this.streamingSink.send(event);

      if (streamRes.success) {
        this.stats.streamingDelivered++;
        return {
          success: true,
          sink: 'streaming',
          provider: this.streamingSink.provider,
          eventId: event.id,
          messageId: streamRes.messageId,
          streamed: true,
          fallback: false
        };
      }

      // Streaming Failed! Capture failure, do NOT lose event, fall back to SQLite
      this.stats.streamingFailures++;
      this.stats.lastError = streamRes.error;
      console.warn(`[TelemetryService] Streaming sink (${this.streamingSink.provider}) failed after ${streamRes.attempts} attempts. Falling back to SQLite sink. Reason: ${streamRes.error}`);

      const fallbackRes = await this.sqliteSink.send(event);
      this.stats.fallbackDelivered++;

      return {
        success: fallbackRes.success,
        sink: 'sqlite_fallback',
        streamed: false,
        fallback: true,
        streamingError: streamRes.error,
        eventId: event.id,
        attempts: streamRes.attempts
      };
    }

    // 4. Hybrid Mode (Dual Dispatch: both SQLite and Streaming)
    if (targetMode === 'hybrid') {
      const [sqliteRes, streamRes] = await Promise.all([
        this.sqliteSink.send(event),
        this.streamingSink.send(event)
      ]);

      if (sqliteRes.success) this.stats.sqliteDelivered++;
      if (streamRes.success) {
        this.stats.streamingDelivered++;
      } else {
        this.stats.streamingFailures++;
        this.stats.lastError = streamRes.error;
      }

      return {
        success: sqliteRes.success,
        sink: 'hybrid',
        eventId: event.id,
        sqliteDelivered: sqliteRes.success,
        streamed: streamRes.success,
        streamingError: streamRes.success ? null : streamRes.error
      };
    }

    // Default fallback
    const res = await this.sqliteSink.send(event);
    return { ...res, eventId: event.id };
  }

  getStatus() {
    return {
      activeMode: this.mode,
      streamingProvider: this.streamingSink.provider,
      streamingConfig: {
        provider: this.streamingSink.provider,
        kafkaTopic: this.streamingSink.kafkaTopic,
        kafkaBrokers: this.streamingSink.kafkaBrokers,
        awsRegion: this.streamingSink.awsRegion,
        kinesisStreamName: this.streamingSink.kinesisStreamName,
        maxRetries: this.streamingSink.maxRetries
      },
      stats: { ...this.stats }
    };
  }
}

// Global Singleton Instance
export const telemetryService = new TelemetryService();
