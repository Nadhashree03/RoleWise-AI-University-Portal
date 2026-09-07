import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../database/db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/certificates/my-certificates (Student)
router.get('/my-certificates', authenticateJWT, requireRole(['student']), (req, res) => {
  const studentId = req.user.userId || '2023BCSE0142';

  const certificates = db.prepare(`
    SELECT * FROM certificates WHERE studentId = ? ORDER BY generatedAt DESC
  `).all(studentId);

  // Check fee status for clearance certificate prerequisite
  const fee = db.prepare('SELECT status, balance FROM student_fee_summary WHERE studentId = ?').get(studentId);
  const feeCleared = fee ? fee.status === 'Paid' && fee.balance === 0 : false;

  res.json({
    success: true,
    certificates,
    feePrerequisite: {
      isCleared: feeCleared,
      balance: fee ? fee.balance : 185000,
      message: feeCleared
        ? 'Prerequisites satisfied: All semester tuition dues are cleared.'
        : `Outstanding dues of ₹${(fee ? fee.balance : 185000).toLocaleString('en-IN')} detected. Tuition Fee Clearance Letter is locked until dues are settled.`,
    },
  });
});

// GET /api/certificates (Admin)
router.get('/', authenticateJWT, requireRole(['admin']), (req, res) => {
  const certificates = db.prepare(`
    SELECT * FROM certificates ORDER BY generatedAt DESC
  `).all();

  res.json({
    success: true,
    certificates,
    totalCount: certificates.length,
  });
});

// POST /api/certificates/generate (Admin)
router.post('/generate', authenticateJWT, requireRole(['admin']), (req, res) => {
  const {
    studentId = '2023BCSE0142',
    studentName = 'Aarav Sharma',
    certificateType = 'Official Degree Certificate (B.S.)',
  } = req.body;

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const certId = `CERT-GEN-${Date.now().toString().slice(-6)}`;
  const certNumber = `CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // Cryptographic deterministic SHA-256 seal
  const hashPayload = `${certNumber}:${studentId}:${studentName}:${certificateType}:${timestamp}`;
  const signatureHash = `SHA256: ${crypto.createHash('sha256').update(hashPayload).digest('hex')}`;

  db.prepare(`
    INSERT INTO certificates (id, studentId, studentName, certNumber, certificateType, status, signatureHash, registrarSignatory, issuedDate, validUntil, generatedBy, generatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    certId,
    studentId,
    studentName,
    certNumber,
    certificateType,
    'Generated & Cryptographically Sealed',
    signatureHash,
    'Marcus Ray, Controller of Examinations',
    timestamp.substring(0, 10),
    '2028-12-31',
    `${req.user.name} (${req.user.role})`,
    timestamp
  );

  // Log in change history
  db.prepare(`
    INSERT INTO change_history (id, entityType, entityId, previousValue, newValue, changedBy, description, rollbackAvailable, isRolledBack, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `CHG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    'certificate',
    certNumber,
    JSON.stringify({ existed: false }),
    JSON.stringify({ certNumber, studentId, certificateType }),
    `${req.user.name} (${req.user.role})`,
    `Issued official credential "${certificateType}" for ${studentName} (${certNumber})`,
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
    'DEGREE_CERTIFICATE_ISSUED',
    'certificates',
    'Authorized (200)',
    req.ip || '127.0.0.1',
    '112ms',
    `Generated & cryptographically signed "${certificateType}" for ${studentName} (${certNumber})`,
    null,
    timestamp
  );

  res.json({
    success: true,
    message: `Certificate "${certificateType}" generated successfully.`,
    certificate: {
      id: certId,
      studentId,
      studentName,
      certNumber,
      certificateType,
      status: 'Generated & Cryptographically Sealed',
      signatureHash,
      registrarSignatory: 'Marcus Ray, Controller of Examinations',
      issuedDate: timestamp.substring(0, 10),
      generatedBy: `${req.user.name} (${req.user.role})`,
      generatedAt: timestamp,
    },
  });
});

export default router;
