import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateJWT } from '../middleware/auth.js';

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
    overrideReason: l.overrideReason,
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

// POST /api/audit-logs
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

  db.prepare(`
    INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    eventId,
    req.user.id,
    `${req.user.name} (${req.user.role})`,
    req.user.role,
    event || action || 'ACTION_LOGGED',
    target || mod || 'general',
    status,
    req.ip || '127.0.0.1',
    `${Math.floor(25 + Math.random() * 80)}ms`,
    details || `User executed ${action || event} on ${target || mod || 'system'}`,
    overrideReason || null,
    timestamp
  );

  res.json({
    success: true,
    eventId,
    timestamp,
  });
});

export default router;
