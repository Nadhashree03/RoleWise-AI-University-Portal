import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import {
  verifyAuditChain,
  simulateTamper,
  repairAuditChain,
  insertAuditLog,
} from '../database/auditChain.js';

const router = Router();

// GET /api/audit-logs
router.get('/', authenticateJWT, (req, res) => {
  const {
    role = 'all',
    action = 'all',
    status = 'all',
    search = '',
    page = 1,
    limit = 25,
  } = req.query;

  const conditions = [];
  const params = [];

  if (role && role.toLowerCase() !== 'all') {
    conditions.push('LOWER(role) = ?');
    params.push(role.toLowerCase());
  }

  if (status && status.toLowerCase() !== 'all') {
    if (status.toLowerCase() === 'authorized') {
      conditions.push("(LOWER(status) LIKE '%authorized%' OR LOWER(status) LIKE '%200%')");
    } else if (status.toLowerCase() === 'denied') {
      conditions.push("(LOWER(status) LIKE '%denied%' OR LOWER(status) LIKE '%403%' OR LOWER(status) LIKE '%401%')");
    } else if (status.toLowerCase() === 'override') {
      conditions.push("LOWER(status) LIKE '%override%'");
    } else if (status.toLowerCase() === 'rolled back') {
      conditions.push("LOWER(status) LIKE '%rolled back%'");
    }
  }

  if (action && action.toLowerCase() !== 'all') {
    const act = action.toLowerCase();
    if (act === 'login') conditions.push("(LOWER(action) LIKE '%login%' OR LOWER(action) LIKE '%logout%')");
    else if (act === 'attendance') conditions.push("(LOWER(action) LIKE '%attendance%' OR LOWER(module) LIKE '%attendance%')");
    else if (act === 'fee') conditions.push("(LOWER(action) LIKE '%fee%' OR LOWER(module) LIKE '%fee%')");
    else if (act === 'admission') conditions.push("(LOWER(action) LIKE '%admission%' OR LOWER(module) LIKE '%admission%')");
    else if (act === 'certificate') conditions.push("(LOWER(action) LIKE '%cert%' OR LOWER(module) LIKE '%cert%')");
    else if (act === 'override') conditions.push("(LOWER(action) LIKE '%override%' OR overrideReason IS NOT NULL)");
    else if (act === 'rollback') conditions.push("LOWER(action) LIKE '%rollback%'");
  }

  if (search && search.trim()) {
    const s = `%${search.trim().toLowerCase()}%`;
    conditions.push(`(
      LOWER(actor) LIKE ? OR
      LOWER(action) LIKE ? OR
      LOWER(module) LIKE ? OR
      LOWER(details) LIKE ? OR
      LOWER(ip) LIKE ? OR
      LOWER(id) LIKE ?
    )`);
    params.push(s, s, s, s, s, s);
  }

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = ' WHERE ' + conditions.join(' AND ');
  }

  const countQuery = `SELECT COUNT(*) as total FROM audit_logs${whereClause}`;
  const total = db.prepare(countQuery).get(...params).total;

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 25));
  const offset = (parsedPage - 1) * parsedLimit;

  const dataQuery = `
    SELECT * FROM audit_logs
    ${whereClause}
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `;

  const rawLogs = db.prepare(dataQuery).all(...params, parsedLimit, offset);

  const logs = rawLogs.map((l) => ({
    id: l.id,
    userId: l.userId,
    actor: l.actor,
    role: l.role,
    action: l.action,
    event: l.action, // alias for frontend compatibility
    module: l.module,
    target: l.module, // alias for frontend compatibility
    status: l.status,
    ip: l.ip,
    duration: l.duration,
    details: l.details,
    prev_hash: l.prev_hash,
    hash: l.hash,
    timestamp: l.timestamp,
  }));

  res.json({
    success: true,
    logs,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit),
    },
  });
});

// GET /api/audit-logs/verify - Cryptographic SHA-256 chain verification
router.get('/verify', authenticateJWT, (req, res) => {
  const result = verifyAuditChain();
  res.json({
    success: true,
    ...result,
  });
});

// POST /api/audit-logs/simulate-tamper - Admin-only endpoint to demonstrate hash failure
router.post('/simulate-tamper', authenticateJWT, requireRole(['admin']), (req, res) => {
  try {
    const result = simulateTamper(req.body?.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/audit-logs/repair-chain - Admin-only endpoint to recalculate and repair chain
router.post('/repair-chain', authenticateJWT, requireRole(['admin']), (req, res) => {
  try {
    const result = repairAuditChain();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/audit-logs - Append new cryptographically chained audit log
router.post('/', authenticateJWT, (req, res) => {
  const {
    event,
    action,
    target,
    module: mod,
    status = 'Authorized',
    details,
    overrideReason,
  } = req.body;

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const eventId = `EVT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const inserted = insertAuditLog({
    id: eventId,
    userId: req.user.id,
    actor: `${req.user.name} (${req.user.role})`,
    role: req.user.role,
    action: event || action || 'ACTION_LOGGED',
    module: target || mod || 'general',
    status,
    ip: req.ip || '127.0.0.1',
    duration: `${Math.floor(25 + Math.random() * 80)}ms`,
    details: details || `User executed ${action || event} on ${target || mod || 'system'}`,
    overrideReason: overrideReason || null,
    timestamp,
  });

  res.json({
    success: true,
    eventId,
    timestamp,
    hash: inserted.hash,
    prev_hash: inserted.prev_hash,
  });
});

export default router;
