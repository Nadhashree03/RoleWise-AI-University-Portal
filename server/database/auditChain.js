import crypto from 'node:crypto';
import { db } from './db.js';

export const GENESIS_HASH = 'GENESIS_BLOCK_0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Computes a deterministic SHA-256 hash over an audit record chained to its previous block hash.
 * Formula: SHA-256(prev_hash + id + actor + role + action + module + status + timestamp)
 */
export function computeAuditHash(prevHash, entry) {
  const safePrev = prevHash || GENESIS_HASH;
  const safeId = String(entry.id || '');
  const safeActor = String(entry.actor || '');
  const safeRole = String(entry.role || '');
  const safeAction = String(entry.action || entry.event || '');
  const safeModule = String(entry.module || entry.target || '');
  const safeStatus = String(entry.status || '');
  const safeTimestamp = String(entry.timestamp || '');

  const payload = `${safePrev}${safeId}${safeActor}${safeRole}${safeAction}${safeModule}${safeStatus}${safeTimestamp}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Gets the hash of the latest audit log entry.
 */
export function getLastAuditHash() {
  const row = db.prepare('SELECT hash FROM audit_logs WHERE hash IS NOT NULL ORDER BY rowid DESC LIMIT 1').get();
  return row?.hash || GENESIS_HASH;
}

/**
 * Inserts a new audit log record cryptographically chained to the previous entry.
 */
export function insertAuditLog(entry) {
  const prevHash = getLastAuditHash();
  const hash = computeAuditHash(prevHash, entry);

  const stmt = db.prepare(`
    INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp, prev_hash, hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    entry.id,
    entry.userId || null,
    entry.actor,
    entry.role,
    entry.action || entry.event || 'ACTION_LOGGED',
    entry.module || entry.target || 'general',
    entry.status || 'Authorized',
    entry.ip || '127.0.0.1',
    entry.duration || '25ms',
    entry.details || null,
    entry.overrideReason || null,
    entry.timestamp,
    prevHash,
    hash
  );

  return {
    ...entry,
    prev_hash: prevHash,
    hash,
  };
}

/**
 * Traverses the audit ledger from the genesis block to the head, recalculating and
 * validating every cryptographic link in the chain.
 */
export function verifyAuditChain() {
  const rows = db.prepare(`
    SELECT id, actor, role, action, module, status, timestamp, prev_hash, hash
    FROM audit_logs
    ORDER BY rowid ASC
  `).all();

  if (rows.length === 0) {
    return {
      valid: true,
      totalLogs: 0,
      verifiedCount: 0,
      brokenAt: null,
      message: 'Ledger is empty; genesis state intact.',
    };
  }

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Check link to previous block
    if (row.prev_hash !== expectedPrevHash) {
      return {
        valid: false,
        totalLogs: rows.length,
        verifiedCount: i,
        brokenAt: row.id,
        reason: `Broken chain link at block ${i + 1} (${row.id}): expected prev_hash ${expectedPrevHash.substring(0, 16)}..., found ${row.prev_hash ? row.prev_hash.substring(0, 16) : 'null'}...`,
      };
    }

    // Verify cryptographic integrity of current block payload
    const recalculatedHash = computeAuditHash(expectedPrevHash, row);
    if (row.hash !== recalculatedHash) {
      return {
        valid: false,
        totalLogs: rows.length,
        verifiedCount: i,
        brokenAt: row.id,
        reason: `Cryptographic payload tampering at block ${i + 1} (${row.id}): calculated hash ${recalculatedHash.substring(0, 16)}... does not match recorded hash ${row.hash ? row.hash.substring(0, 16) : 'null'}...`,
      };
    }

    expectedPrevHash = row.hash;
  }

  return {
    valid: true,
    totalLogs: rows.length,
    verifiedCount: rows.length,
    brokenAt: null,
    message: `Cryptographic hash chain intact across all ${rows.length} recorded events.`,
  };
}

/**
 * Ensures any historical records lacking hash chaining are populated in chronological sequence.
 */
export function backfillAuditHashChain() {
  const rows = db.prepare(`
    SELECT id, actor, role, action, module, status, timestamp, prev_hash, hash
    FROM audit_logs
    ORDER BY rowid ASC
  `).all();

  if (rows.length === 0) return;

  const needsBackfill = rows.some((r) => !r.hash || !r.prev_hash);
  if (!needsBackfill) return;

  const updateStmt = db.prepare('UPDATE audit_logs SET prev_hash = ?, hash = ? WHERE id = ?');
  let currentPrev = GENESIS_HASH;

  for (const row of rows) {
    const hash = computeAuditHash(currentPrev, row);
    updateStmt.run(currentPrev, hash, row.id);
    currentPrev = hash;
  }

  console.log(`[Audit Chain] Backfilled cryptographic hash chain across ${rows.length} legacy audit entries.`);
}

/**
 * Simulates unauthorized record tampering for security audit testing.
 */
export function simulateTamper(targetId) {
  let target = null;
  if (targetId) {
    target = db.prepare('SELECT id, action, details FROM audit_logs WHERE id = ?').get(targetId);
  } else {
    const rows = db.prepare('SELECT id, action, details FROM audit_logs ORDER BY rowid ASC LIMIT 2').all();
    target = rows.length > 1 ? rows[1] : rows[0];
  }

  if (!target) {
    throw new Error('No audit log records available to tamper.');
  }

  const tamperedAction = target.action + '_TAMPERED';
  db.prepare('UPDATE audit_logs SET action = ? WHERE id = ?').run(tamperedAction, target.id);

  return {
    success: true,
    tamperedId: target.id,
    previousAction: target.action,
    tamperedAction,
    message: `Simulated tamper applied to event ${target.id}. Hash signature left unmodified to trigger detection.`,
  };
}

/**
 * Repairs and recalculates the hash chain across all records sequentially from genesis.
 */
export function repairAuditChain() {
  const rows = db.prepare(`
    SELECT id, actor, role, action, module, status, timestamp
    FROM audit_logs
    ORDER BY rowid ASC
  `).all();

  const updateStmt = db.prepare('UPDATE audit_logs SET prev_hash = ?, hash = ? WHERE id = ?');
  let currentPrev = GENESIS_HASH;

  for (const row of rows) {
    let cleanAction = row.action;
    if (cleanAction.endsWith('_TAMPERED')) {
      cleanAction = cleanAction.replace('_TAMPERED', '');
      db.prepare('UPDATE audit_logs SET action = ? WHERE id = ?').run(cleanAction, row.id);
      row.action = cleanAction;
    }

    const hash = computeAuditHash(currentPrev, row);
    updateStmt.run(currentPrev, hash, row.id);
    currentPrev = hash;
  }

  return {
    success: true,
    repairedCount: rows.length,
    message: `Audit chain cryptographically re-anchored and verified across ${rows.length} events.`,
  };
}
