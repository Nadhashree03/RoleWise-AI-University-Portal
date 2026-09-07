import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

// Ensure data directory exists
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new DatabaseSync(config.dbPath);

export function initDatabase() {
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      secondaryEmail TEXT,
      userId TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT,
      avatar TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      studentName TEXT NOT NULL,
      facultyId TEXT NOT NULL,
      course TEXT NOT NULL,
      courseName TEXT,
      date TEXT NOT NULL,
      session TEXT NOT NULL,
      status TEXT NOT NULL,
      source TEXT DEFAULT 'manual',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      paymentMethod TEXT NOT NULL,
      status TEXT NOT NULL,
      transactionReference TEXT NOT NULL,
      receiptNumber TEXT,
      itemsJson TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admissions (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      applicantName TEXT NOT NULL,
      program TEXT NOT NULL,
      score TEXT,
      marks TEXT,
      quota TEXT,
      status TEXT NOT NULL,
      previousStatus TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      studentName TEXT NOT NULL,
      certNumber TEXT UNIQUE NOT NULL,
      certificateType TEXT NOT NULL,
      status TEXT NOT NULL,
      signatureHash TEXT NOT NULL,
      registrarSignatory TEXT NOT NULL,
      issuedDate TEXT NOT NULL,
      validUntil TEXT,
      generatedBy TEXT NOT NULL,
      generatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      actor TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      status TEXT NOT NULL,
      ip TEXT,
      duration TEXT,
      details TEXT,
      overrideReason TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS change_history (
      id TEXT PRIMARY KEY,
      entityType TEXT NOT NULL,
      entityId TEXT NOT NULL,
      previousValue TEXT,
      newValue TEXT,
      changedBy TEXT NOT NULL,
      description TEXT NOT NULL,
      rollbackAvailable INTEGER DEFAULT 1,
      isRolledBack INTEGER DEFAULT 0,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS overrides (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      userRole TEXT NOT NULL,
      featureId TEXT NOT NULL,
      action TEXT NOT NULL,
      reason TEXT NOT NULL,
      notes TEXT,
      approved INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recommendation_events (
      id TEXT PRIMARY KEY,
      userId TEXT,
      role TEXT NOT NULL,
      query TEXT NOT NULL,
      featureId TEXT NOT NULL,
      confidence INTEGER NOT NULL,
      confidenceLevel TEXT NOT NULL,
      ruleId TEXT,
      feedback TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_fee_summary (
      studentId TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      program TEXT,
      totalDue REAL NOT NULL,
      paidAmount REAL NOT NULL,
      balance REAL NOT NULL,
      status TEXT NOT NULL,
      dueDate TEXT,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feature_usage_events (
      id TEXT PRIMARY KEY,
      anonymous_user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      feature_id TEXT NOT NULL,
      task_goal TEXT,
      help_query TEXT,
      event_type TEXT NOT NULL,
      discovered INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      success INTEGER DEFAULT 1,
      source TEXT NOT NULL,
      experiment_group TEXT NOT NULL,
      duration_ms INTEGER DEFAULT 0,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS task_goals (
      id TEXT PRIMARY KEY,
      anonymous_user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      goal_text TEXT NOT NULL,
      normalized_goal TEXT NOT NULL,
      feature_id TEXT NOT NULL,
      success INTEGER DEFAULT 1,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS help_search_queries (
      id TEXT PRIMARY KEY,
      anonymous_user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      query_text TEXT NOT NULL,
      normalized_query TEXT NOT NULL,
      result_feature_id TEXT,
      result_type TEXT NOT NULL,
      success INTEGER DEFAULT 1,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS experiment_assignments (
      id TEXT PRIMARY KEY,
      anonymous_user_id TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      experiment_name TEXT NOT NULL DEFAULT 'RoleWise Feature Discovery Experiment',
      experiment_group TEXT NOT NULL,
      assigned_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS validation_records (
      id TEXT PRIMARY KEY,
      participant_type TEXT NOT NULL,
      role TEXT NOT NULL,
      task TEXT NOT NULL,
      before_flow TEXT NOT NULL,
      after_flow TEXT NOT NULL,
      discovery_time_sec REAL NOT NULL,
      completion_time_sec REAL NOT NULL,
      success INTEGER NOT NULL DEFAULT 1,
      usefulness_score INTEGER NOT NULL,
      feedback TEXT NOT NULL,
      is_synthetic INTEGER DEFAULT 1,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS risk_register (
      id TEXT PRIMARY KEY,
      risk_code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      probability TEXT NOT NULL,
      impact TEXT NOT NULL,
      severity TEXT NOT NULL,
      mitigation TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active'
    );
  `);

  console.log('[Database] SQLite schema verified and ready at', config.dbPath);
}
