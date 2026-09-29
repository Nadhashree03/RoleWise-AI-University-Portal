import test from 'node:test';
import assert from 'node:assert';
import { db } from '../database/db.js';
import { validateTelemetryEvent, createTelemetryEvent, sanitizePayload } from '../telemetry/eventSchema.js';
import { SqliteTelemetrySink } from '../telemetry/sqliteSink.js';
import { StreamingTelemetrySink } from '../telemetry/streamingSink.js';
import { TelemetryService } from '../telemetry/telemetryService.js';
import express from 'express';
import eventRouter from '../routes/eventRoutes.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rolewise-academic-portal-jwt-secret-key-2026';

test.describe('RoleWise AI: REQ-25 Distributed Streaming Telemetry Sink Suite', () => {

  // Test 1: Event Schema Validation (Valid Event)
  test('1. Event Schema validation: Valid event passes with normalized fields', () => {
    const raw = createTelemetryEvent({
      id: 'EVT-TEST-VALID-001',
      role: 'student',
      feature_id: 'pay-fees',
      event_type: 'action_completed',
      discovered: 1,
      completed: 1,
      duration_ms: 12500,
      metadata: { semester: 'Spring 2026', method: 'UPI' }
    });

    const { valid, errors, sanitizedEvent } = validateTelemetryEvent(raw);
    assert.strictEqual(valid, true, 'Valid event must pass schema validation');
    assert.strictEqual(errors.length, 0, 'No errors for valid event');
    assert.strictEqual(sanitizedEvent.id, 'EVT-TEST-VALID-001');
    assert.strictEqual(sanitizedEvent.role, 'student');
    assert.strictEqual(sanitizedEvent.completed, 1);
    assert.strictEqual(sanitizedEvent.experiment_group, 'assistant');
    assert.strictEqual(sanitizedEvent.metadata.semester, 'Spring 2026');
  });

  // Test 2: Event Schema Rejection of Invalid Enums
  test('2. Event Schema validation: Rejects missing role or invalid event_type', () => {
    const invalidRole = validateTelemetryEvent({
      id: 'EVT-TEST-BAD-001',
      role: 'super_hacker',
      event_type: 'feature_view'
    });
    assert.strictEqual(invalidRole.valid, false);
    assert(invalidRole.errors.some(e => e.includes('Invalid role')));

    const invalidType = validateTelemetryEvent({
      id: 'EVT-TEST-BAD-002',
      role: 'faculty',
      event_type: 'unregistered_hack_event'
    });
    assert.strictEqual(invalidType.valid, false);
    assert(invalidType.errors.some(e => e.includes('Invalid event_type')));
  });

  // Test 3: Privacy & PII Leakage Protection
  test('3. Privacy Sanitizer: Strips sensitive credentials, tokens and masks emails', () => {
    const rawWithPII = {
      id: 'EVT-TEST-PII-001',
      role: 'student',
      event_type: 'action_started',
      password: 'PlaintextPassword123!',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sensitive',
      credit_card: '4111-2222-3333-4444',
      metadata: {
        userEmail: 'student.anonymous@rolewise.edu',
        auth_header: 'Bearer 987654321',
        cvv: 789,
        actionNotes: 'Contact user at dean.office@university.org regarding clearance'
      }
    };

    const sanitized = sanitizePayload(rawWithPII);

    // Assert sensitive fields are completely purged
    assert.strictEqual(sanitized.password, undefined, 'Password must be completely stripped');
    assert.strictEqual(sanitized.token, undefined, 'Token must be completely stripped');
    assert.strictEqual(sanitized.credit_card, undefined, 'Credit card must be stripped');
    assert.strictEqual(sanitized.metadata.auth_header, undefined, 'Auth header must be stripped');
    assert.strictEqual(sanitized.metadata.cvv, undefined, 'CVV must be stripped');

    // Assert emails are anonymized
    assert.strictEqual(sanitized.metadata.userEmail, '[ANONYMIZED_EMAIL]');
    assert(sanitized.metadata.actionNotes.includes('[ANONYMIZED_EMAIL]'));
  });

  // Test 4: SQLite Sink Live Persistence
  test('4. SQLite Sink: Accurately records live event into persistent SQLite table', async () => {
    const sink = new SqliteTelemetrySink(db);
    const testId = 'EVT-SQLITE-TEST-' + Date.now().toString().slice(-6);

    const event = createTelemetryEvent({
      id: testId,
      anonymous_user_id: 'anon-test-usr-42',
      role: 'faculty',
      feature_id: 'mark-attendance',
      event_type: 'action_completed',
      discovered: 1,
      completed: 1,
      duration_ms: 8200
    });

    const result = await sink.send(event);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.sink, 'sqlite');

    // Verify row was inserted into SQLite
    const row = db.prepare('SELECT * FROM feature_usage_events WHERE id = ?').get(testId);
    assert.ok(row, 'Row must exist in SQLite feature_usage_events');
    assert.strictEqual(row.feature_id, 'mark-attendance');
    assert.strictEqual(row.role, 'faculty');
    assert.strictEqual(row.completed, 1);
  });

  // Test 5: Streaming Sink Configuration (Kafka vs Kinesis)
  test('5. Streaming Sink: Correctly initializes configurations for Kafka and Kinesis providers', () => {
    const kafkaSink = new StreamingTelemetrySink({
      provider: 'kafka',
      kafkaBrokers: ['cluster-broker.rolewise.edu:9092'],
      kafkaTopic: 'custom-university-telemetry',
      maxRetries: 4
    });
    assert.strictEqual(kafkaSink.provider, 'kafka');
    assert.strictEqual(kafkaSink.kafkaTopic, 'custom-university-telemetry');
    assert.deepStrictEqual(kafkaSink.kafkaBrokers, ['cluster-broker.rolewise.edu:9092']);
    assert.strictEqual(kafkaSink.maxRetries, 4);

    const kinesisSink = new StreamingTelemetrySink({
      provider: 'kinesis',
      awsRegion: 'ap-south-1',
      kinesisStreamName: 'rolewise-kinesis-stream',
      maxRetries: 2
    });
    assert.strictEqual(kinesisSink.provider, 'kinesis');
    assert.strictEqual(kinesisSink.awsRegion, 'ap-south-1');
    assert.strictEqual(kinesisSink.kinesisStreamName, 'rolewise-kinesis-stream');
    assert.strictEqual(kinesisSink.maxRetries, 2);
  });

  // Test 6: Successful Streaming Path
  test('6. Successful Streaming Path: Delivers event to stream provider with proper payload', async () => {
    const dispatched = [];
    const mockClient = {
      send: async (payload) => {
        dispatched.push(payload);
        return { messageId: 'stream-ack-998877', partition: 0, offset: '102' };
      }
    };

    const streamingSink = new StreamingTelemetrySink({
      provider: 'kafka',
      kafkaTopic: 'campus-events-topic',
      client: mockClient
    });

    const event = createTelemetryEvent({
      id: 'EVT-STREAM-ACK-001',
      anonymous_user_id: 'anon-student-99',
      role: 'student',
      feature_id: 'download-certificate',
      event_type: 'feature_open'
    });

    const res = await streamingSink.send(event);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.sink, 'streaming');
    assert.strictEqual(res.attempts, 1);
    assert.strictEqual(dispatched.length, 1);
    assert.strictEqual(dispatched[0].topic, 'campus-events-topic');

    const message = dispatched[0].messages[0];
    assert.strictEqual(message.key, 'anon-student-99');
    const parsedValue = JSON.parse(message.value);
    assert.strictEqual(parsedValue.feature_id, 'download-certificate');
  });

  // Test 7: Streaming Failure & Bounded Retries
  test('7. Streaming Failure & Bounded Retries: Retries according to bounded policy before failing', async () => {
    let callCount = 0;
    const failingClient = {
      send: async () => {
        callCount++;
        throw new Error('Connection refused by Kafka broker [ECONNREFUSED]');
      }
    };

    const maxRetries = 3;
    const sink = new StreamingTelemetrySink({
      provider: 'kafka',
      client: failingClient,
      maxRetries,
      retryDelayMs: 5
    });

    const event = createTelemetryEvent({
      id: 'EVT-FAIL-TEST-001',
      role: 'student',
      feature_id: 'pay-fees',
      event_type: 'action_started'
    });

    const res = await sink.send(event);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.attempts, maxRetries, 'Must attempt exactly maxRetries times');
    assert(res.error.includes('ECONNREFUSED'));
    assert.strictEqual(callCount, maxRetries);
  });

  // Test 8: Graceful Fallback to SQLite (Zero Data Loss)
  test('8. Graceful Fallback: When streaming fails, event is preserved in SQLite without error', async () => {
    const failingStreamingClient = {
      send: async () => {
        throw new Error('Simulated AWS Kinesis ServiceUnavailableException (503)');
      }
    };

    const failingStreamingSink = new StreamingTelemetrySink({
      provider: 'kinesis',
      client: failingStreamingClient,
      maxRetries: 2,
      retryDelayMs: 5
    });

    const sqliteSink = new SqliteTelemetrySink(db);

    const service = new TelemetryService({
      mode: 'streaming',
      streamingSink: failingStreamingSink,
      sqliteSink
    });

    const fallbackEventId = 'EVT-FALLBACK-TEST-' + Date.now().toString().slice(-6);
    const event = createTelemetryEvent({
      id: fallbackEventId,
      anonymous_user_id: 'anon-resilience-user',
      role: 'admin',
      feature_id: 'manage-admissions',
      event_type: 'action_completed',
      discovered: 1,
      completed: 1
    });

    const result = await service.recordEvent(event);

    // Verify graceful fallback
    assert.strictEqual(result.success, true, 'Request must succeed via fallback');
    assert.strictEqual(result.sink, 'sqlite_fallback', 'Must identify sink as sqlite_fallback');
    assert.strictEqual(result.fallback, true, 'Fallback flag must be true');
    assert.strictEqual(result.streamed, false, 'Streamed flag must be false');
    assert(result.streamingError.includes('ServiceUnavailableException'));

    // Verify SQLite contains the event
    const saved = db.prepare('SELECT * FROM feature_usage_events WHERE id = ?').get(fallbackEventId);
    assert.ok(saved, 'Event MUST be preserved in SQLite storage during streaming outage');
    assert.strictEqual(saved.feature_id, 'manage-admissions');
    assert.strictEqual(saved.role, 'admin');

    // Verify service telemetry metrics
    const status = service.getStatus();
    assert.strictEqual(status.stats.fallbackDelivered, 1);
    assert.strictEqual(status.stats.streamingFailures, 1);
  });

  // Test 9: Invalid Configuration Handling
  test('9. Invalid Configuration: Unsupported provider triggers schema/config error and fails safely', async () => {
    const sink = new StreamingTelemetrySink({
      provider: 'unsupported-cloud-sink',
      maxRetries: 1
    });

    const res = await sink.send(createTelemetryEvent({ role: 'student', event_type: 'feature_view' }));
    assert.strictEqual(res.success, false);
    assert(res.error.includes('Unsupported streaming provider'));
  });

  // Test 10: Express Route Integration & Telemetry Status
  test('10. Live HTTP API Integration: /api/events/feature-usage and /api/events/telemetry-status', async () => {
    const app = express();
    app.use(express.json());
    app.use('/events', eventRouter);

    const server = app.listen(0);
    const port = server.address().port;
    const token = jwt.sign({ id: 'usr-student-e2e', role: 'student', name: 'Alex Student' }, JWT_SECRET);

    try {
      // 1. Check telemetry status
      const statusRes = await fetch(`http://localhost:${port}/events/telemetry-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      assert.strictEqual(statusRes.status, 200);
      const statusData = await statusRes.json();
      assert.strictEqual(statusData.success, true);
      assert.ok(statusData.activeMode);
      assert.ok(statusData.streamingConfig);

      // 2. Submit live feature-usage event
      const postRes = await fetch(`http://localhost:${port}/events/feature-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feature_id: 'view-attendance',
          event_type: 'feature_open',
          discovered: 1,
          completed: 0,
          source: 'assistant'
        })
      });

      assert.strictEqual(postRes.status, 200);
      const postData = await postRes.json();
      assert.strictEqual(postData.success, true);
      assert.ok(postData.eventId);
      assert.ok(postData.sink);
    } finally {
      server.close();
    }
  });

});
