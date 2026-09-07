import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/validation (Stakeholder Validation Cohort)
router.get('/validation', authenticateJWT, (req, res) => {
  const records = db.prepare('SELECT * FROM validation_records ORDER BY id ASC').all();

  const total = records.length || 1;
  const successful = records.filter((r) => r.success === 1).length;
  const taskSuccessRate = +((successful / total) * 100).toFixed(1);

  const avgDiscoveryBefore = +(records.reduce((acc, r) => acc + (r.discovery_time_sec || 0), 0) / total).toFixed(1);
  const avgDiscoveryAfter = +(records.reduce((acc, r) => acc + (r.completion_time_sec || 0), 0) / total).toFixed(1);

  const avgUsefulness = +(records.reduce((acc, r) => acc + (r.usefulness_score || 0), 0) / total).toFixed(1);
  const highSatisfaction = records.filter((r) => r.usefulness_score >= 4).length;
  const satisfactionRate = +((highSatisfaction / total) * 100).toFixed(1);

  res.json({
    success: true,
    disclaimer: 'Prototype validation using synthetic participants/tasks.',
    summary: {
      totalParticipants: records.length,
      taskSuccessRate: `${taskSuccessRate}%`,
      taskSuccessRateNum: taskSuccessRate,
      avgDiscoveryTimeBeforeSec: avgDiscoveryBefore,
      avgDiscoveryTimeAfterSec: avgDiscoveryAfter,
      timeReductionPct: `${(((avgDiscoveryBefore - avgDiscoveryAfter) / avgDiscoveryBefore) * 100).toFixed(1)}%`,
      recommendationHelpfulness: `${avgUsefulness} / 5.0`,
      userSatisfactionRate: `${satisfactionRate}%`,
    },
    records,
  });
});

// POST /api/validation (Submit new validation record)
router.post('/validation', authenticateJWT, (req, res) => {
  const {
    participant_type = 'student',
    role = req.user.role || 'student',
    task,
    before_flow,
    after_flow,
    discovery_time_sec = 60,
    completion_time_sec = 15,
    success = 1,
    usefulness_score = 5,
    feedback
  } = req.body;

  if (!task || !feedback) {
    return res.status(400).json({ success: false, error: 'Task and feedback are required.' });
  }

  const valId = `VAL-${Date.now().toString().slice(-4)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.prepare(`
    INSERT INTO validation_records (id, participant_type, role, task, before_flow, after_flow, discovery_time_sec, completion_time_sec, success, usefulness_score, feedback, is_synthetic, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    valId,
    participant_type,
    role,
    task,
    before_flow || 'Traditional manual portal navigation',
    after_flow || 'AI-assisted feature discovery and direct workflow modal',
    discovery_time_sec,
    completion_time_sec,
    success ? 1 : 0,
    usefulness_score,
    feedback,
    1,
    timestamp
  );

  res.json({
    success: true,
    message: 'Validation session record ingested successfully.',
    id: valId,
  });
});

// GET /api/risks (Enterprise University Risk Register)
router.get('/risks', authenticateJWT, (req, res) => {
  const risks = db.prepare('SELECT * FROM risk_register ORDER BY id ASC').all();

  const totalRisks = risks.length;
  const activeRisks = risks.filter((r) => r.status === 'Active').length;
  const mitigatedRisks = risks.filter((r) => r.status === 'Mitigated').length;
  const monitoringRisks = risks.filter((r) => r.status === 'Monitoring').length;

  res.json({
    success: true,
    summary: {
      total: totalRisks,
      active: activeRisks,
      mitigated: mitigatedRisks,
      monitoring: monitoringRisks,
    },
    risks,
  });
});

// PATCH /api/risks/:id (Admin update risk mitigation/status)
router.patch('/risks/:id', authenticateJWT, requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const { status, mitigation, owner } = req.body;

  const existing = db.prepare('SELECT * FROM risk_register WHERE id = ? OR risk_code = ?').get(id, id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Risk record not found.' });
  }

  const newStatus = status || existing.status;
  const newMitigation = mitigation || existing.mitigation;
  const newOwner = owner || existing.owner;

  db.prepare(`
    UPDATE risk_register
    SET status = ?, mitigation = ?, owner = ?
    WHERE id = ?
  `).run(newStatus, newMitigation, newOwner, existing.id);

  // Log in audit trail
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  db.prepare(`
    INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `EVT-${Date.now().toString().slice(-6)}`,
    req.user.id,
    `${req.user.name} (${req.user.role})`,
    req.user.role,
    'RISK_REGISTER_UPDATED',
    'governance',
    'Authorized (200)',
    req.ip || '127.0.0.1',
    '24ms',
    `Updated ${existing.risk_code} status to ${newStatus}`,
    null,
    timestamp
  );

  res.json({
    success: true,
    message: `Risk ${existing.risk_code} updated successfully.`,
  });
});

export default router;
