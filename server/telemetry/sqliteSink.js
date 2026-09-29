// server/telemetry/sqliteSink.js
// Local SQLite Telemetry Sink using native node:sqlite DatabaseSync with WAL mode

import { BaseTelemetrySink } from './telemetrySink.js';
import { db } from '../database/db.js';

export class SqliteTelemetrySink extends BaseTelemetrySink {
  constructor(database = db) {
    super('sqlite');
    this.db = database;
  }

  async send(event) {
    try {
      this.db.prepare(`
        INSERT INTO feature_usage_events (
          id, anonymous_user_id, role, feature_id, task_goal, help_query,
          event_type, discovered, completed, success, source, experiment_group, duration_ms, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        event.id,
        event.anonymous_user_id,
        event.role,
        event.feature_id,
        event.task_goal || null,
        event.help_query || null,
        event.event_type,
        event.discovered ? 1 : 0,
        event.completed ? 1 : 0,
        event.success ? 1 : 0,
        event.source || 'portal',
        event.experiment_group || 'assistant',
        event.duration_ms || 0,
        event.timestamp
      );

      return {
        success: true,
        sink: 'sqlite',
        messageId: event.id
      };
    } catch (err) {
      return {
        success: false,
        sink: 'sqlite',
        error: err.message
      };
    }
  }
}
