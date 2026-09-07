import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/admissions/my-admission (Student)
router.get('/my-admission', authenticateJWT, requireRole(['student']), (req, res) => {
  const studentId = req.user.userId || '2023BCSE0142';

  let admission = db.prepare(`
    SELECT * FROM admissions WHERE studentId = ?
  `).get(studentId);

  if (!admission) {
    admission = {
      id: 'APP-2024-CS-0941',
      studentId,
      applicantName: req.user.name,
      program: 'B.Tech Computer Science & Engineering',
      score: '99.1%ile (GATE/JEE)',
      marks: '96.2% PCM Aggregate',
      quota: 'Merit Quota All-India',
      status: 'Approved',
      createdAt: '2024-06-15 10:00:00',
    };
  }

  res.json({
    success: true,
    admission,
    milestones: [
      { step: 1, label: 'Application Submitted', date: '2024-06-15', status: 'Completed', note: 'Form & Portfolio submitted' },
      { step: 2, label: 'Document Verification', date: '2024-06-22', status: 'Completed', note: '10th/12th & Identity approved' },
      { step: 3, label: 'Merit List Clearance', date: '2024-07-05', status: 'Completed', note: 'GATE/JEE Rank 412 Allotted' },
      { step: 4, label: 'Seat Allocation & Acceptance', date: '2024-07-18', status: 'Completed', note: 'B.Tech CSE Seat Confirmed' },
      { step: 5, label: 'Convocation / Clearance', date: 'Pending 2027', status: 'In Progress', note: 'Final semester graduation' },
    ],
  });
});

// GET /api/admissions (Admin)
router.get('/', authenticateJWT, requireRole(['admin']), (req, res) => {
  const { search = '', filter = 'All' } = req.query;

  let query = 'SELECT * FROM admissions';
  const conditions = [];
  const params = [];

  if (filter && filter !== 'All') {
    conditions.push('status = ?');
    params.push(filter);
  }

  if (search && search.trim()) {
    conditions.push('(applicantName LIKE ? OR id LIKE ? OR program LIKE ?)');
    const s = `%${search.trim()}%`;
    params.push(s, s, s);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY createdAt DESC';

  const rows = db.prepare(query).all(...params);

  res.json({
    success: true,
    applications: rows.map((r) => ({
      id: r.id,
      name: r.applicantName,
      program: r.program,
      score: r.score,
      marks: r.marks,
      quota: r.quota,
      status: r.status,
      previousStatus: r.previousStatus,
      date: r.createdAt.substring(0, 10),
    })),
    totalCount: rows.length,
  });
});

// PATCH /api/admissions/:id/status (Admin approval / rejection)
router.patch('/:id/status', authenticateJWT, requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  if (!newStatus || !['Approved', 'Rejected', 'Pending Review'].includes(newStatus)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid admission status. Must be "Approved", "Rejected", or "Pending Review".',
      code: 'INVALID_STATUS',
    });
  }

  const existing = db.prepare('SELECT * FROM admissions WHERE id = ?').get(id);

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: `Application "${id}" not found.`,
      code: 'NOT_FOUND',
    });
  }

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.prepare(`
    UPDATE admissions
    SET status = ?, previousStatus = ?, updatedAt = ?
    WHERE id = ?
  `).run(newStatus, existing.status, timestamp, id);

  // Record change history
  db.prepare(`
    INSERT INTO change_history (id, entityType, entityId, previousValue, newValue, changedBy, description, rollbackAvailable, isRolledBack, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `CHG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    'admission',
    id,
    JSON.stringify({ status: existing.status }),
    JSON.stringify({ status: newStatus }),
    `${req.user.name} (${req.user.role})`,
    `${newStatus === 'Approved' ? 'Approved' : 'Rejected'} admission candidate ${existing.applicantName} (${id})`,
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
    'ADMISSION_DECISION_FINALIZED',
    'admissions',
    'Authorized (200)',
    req.ip || '127.0.0.1',
    '60ms',
    `Admissions decision finalized: ${existing.applicantName} (${id}) transitioned from "${existing.status}" to "${newStatus}"`,
    null,
    timestamp
  );

  res.json({
    success: true,
    message: `Application ${id} status updated to "${newStatus}".`,
    updatedApplication: {
      id,
      name: existing.applicantName,
      status: newStatus,
      previousStatus: existing.status,
    },
  });
});

// POST /api/admissions/:id/rollback (Revert admission status)
router.post('/:id/rollback', authenticateJWT, requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM admissions WHERE id = ?').get(id);

  if (!existing || !existing.previousStatus) {
    return res.status(400).json({
      success: false,
      error: 'Cannot rollback: No previous status recorded for this application.',
      code: 'CANNOT_ROLLBACK',
    });
  }

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const revertedStatus = existing.previousStatus;

  db.prepare(`
    UPDATE admissions
    SET status = ?, previousStatus = NULL, updatedAt = ?
    WHERE id = ?
  `).run(revertedStatus, timestamp, id);

  // Log rollback audit event
  db.prepare(`
    INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `EVT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    req.user.id,
    `${req.user.name} (${req.user.role})`,
    req.user.role,
    'ROLLBACK_PERFORMED',
    'admissions',
    'Rolled Back',
    req.ip || '127.0.0.1',
    '50ms',
    `Rollback of admission ${id}: restored status to "${revertedStatus}"`,
    'Reversion to previous state',
    timestamp
  );

  res.json({
    success: true,
    message: `Application ${id} status rolled back to "${revertedStatus}".`,
    application: {
      id,
      name: existing.applicantName,
      status: revertedStatus,
    },
  });
});

export default router;
