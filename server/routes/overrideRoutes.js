import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// GET /api/overrides
router.get('/', authenticateJWT, (req, res) => {
  const overrides = db.prepare('SELECT * FROM overrides ORDER BY createdAt DESC').all();

  // Convert to object mapping by featureId for quick frontend lookup
  const overrideMap = {};
  for (const o of overrides) {
    overrideMap[o.featureId] = {
      id: o.id,
      reason: o.reason,
      notes: o.notes,
      timestamp: o.createdAt,
      justifiedBy: `${o.userId} (${o.userRole})`,
      approved: Boolean(o.approved),
    };
  }

  res.json({
    success: true,
    overrides: overrideMap,
    list: overrides,
  });
});

// POST /api/overrides
router.post('/', authenticateJWT, (req, res) => {
  const { featureId, action = 'PERMISSION_OVERRIDE', reason, notes } = req.body;

  if (!featureId || !reason) {
    return res.status(400).json({
      success: false,
      error: 'Missing required override fields: featureId and reason.',
      code: 'MISSING_FIELDS',
    });
  }

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const overrideId = `OVR-${Date.now().toString().slice(-6)}`;

  db.prepare(`
    INSERT INTO overrides (id, userId, userRole, featureId, action, reason, notes, approved, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    overrideId,
    req.user.name || req.user.userId,
    req.user.role,
    featureId,
    action,
    reason,
    notes || null,
    1,
    timestamp
  );

  // Log in change history
  db.prepare(`
    INSERT INTO change_history (id, entityType, entityId, previousValue, newValue, changedBy, description, rollbackAvailable, isRolledBack, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `CHG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    'override',
    featureId,
    JSON.stringify({ accessible: false }),
    JSON.stringify({ accessible: true, reason }),
    `${req.user.name} (${req.user.role})`,
    `Administrative override authorized for restricted tool "${featureId}" under reason: "${reason}"`,
    1,
    0,
    timestamp
  );

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `EVT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    req.user.id,
    `${req.user.name} (${req.user.role})`,
    req.user.role,
    'OVERRIDE_REASON_CAPTURED',
    featureId,
    'Authorized (Override)',
    req.ip || '127.0.0.1',
    '38ms',
    `Administrative override granted for "${featureId}": ${reason}`,
    reason,
    timestamp
  );

  res.json({
    success: true,
    message: `Override authorized for ${featureId}.`,
    override: {
      id: overrideId,
      featureId,
      reason,
      notes,
      timestamp,
      justifiedBy: `${req.user.name} (${req.user.role})`,
    },
  });
});

export default router;
