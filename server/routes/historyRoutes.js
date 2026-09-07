import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/change-history
router.get('/', authenticateJWT, (req, res) => {
  const changes = db.prepare(`
    SELECT * FROM change_history ORDER BY timestamp DESC LIMIT 50
  `).all();

  const formatted = changes.map((c) => ({
    id: c.id,
    targetFeature: c.entityType === 'fee' ? 'pay-fees' : c.entityType === 'admission' ? 'manage-admissions' : c.entityType,
    actionType: c.description.includes('Approved') ? 'ADMISSION_DECISION_FINALIZED' : c.description.includes('attendance') ? 'BATCH_ATTENDANCE_INGESTED' : 'STATE_MUTATION',
    description: c.description,
    actor: c.changedBy,
    timestamp: c.timestamp,
    isRolledBack: Boolean(c.isRolledBack),
    previousState: c.previousValue ? JSON.parse(c.previousValue) : null,
    newState: c.newValue ? JSON.parse(c.newValue) : null,
  }));

  res.json({
    success: true,
    changes: formatted,
  });
});

// POST /api/change-history/:id/rollback (Admin/Reviewer Authorized Only)
router.post('/:id/rollback', authenticateJWT, requireRole(['admin']), (req, res) => {
  const changeId = req.params.id;
  const change = db.prepare('SELECT * FROM change_history WHERE id = ?').get(changeId);

  if (!change) {
    return res.status(404).json({
      success: false,
      error: `Change record "${changeId}" not found.`,
      code: 'NOT_FOUND',
    });
  }

  if (change.isRolledBack) {
    return res.status(400).json({
      success: false,
      error: 'This action has already been rolled back.',
      code: 'ALREADY_ROLLED_BACK',
    });
  }

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Restore database state based on entityType
  if (change.entityType === 'admission') {
    const prev = change.previousValue ? JSON.parse(change.previousValue) : null;
    if (prev && prev.status) {
      db.prepare(`
        UPDATE admissions SET status = ?, updatedAt = ? WHERE id = ?
      `).run(prev.status, timestamp, change.entityId);
    }
  } else if (change.entityType === 'fee') {
    const prev = change.previousValue ? JSON.parse(change.previousValue) : null;
    if (prev) {
      db.prepare(`
        UPDATE student_fee_summary
        SET balance = ?, paidAmount = ?, status = ?, updatedAt = ?
        WHERE studentId = ?
      `).run(prev.balance || 185000, prev.paidAmount || 0, prev.status || 'Pending', timestamp, change.entityId);
    }
  }

  // Mark as rolled back
  db.prepare(`
    UPDATE change_history SET isRolledBack = 1 WHERE id = ?
  `).run(changeId);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `EVT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    req.user.id,
    `${req.user.name} (${req.user.role})`,
    req.user.role,
    'ROLLBACK_PERFORMED',
    change.entityType,
    'Rolled Back',
    req.ip || '127.0.0.1',
    '64ms',
    `Rollback of ${change.id}: Reverted "${change.description}" to prior state.`,
    req.body.reason || 'Point-in-time state rollback executed by administrator',
    timestamp
  );

  res.json({
    success: true,
    message: `Change ${changeId} successfully rolled back.`,
    changeId,
  });
});

export default router;
