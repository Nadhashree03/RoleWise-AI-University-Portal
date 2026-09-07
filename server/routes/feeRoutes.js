import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/fees/my-fee (Student)
router.get('/my-fee', authenticateJWT, requireRole(['student']), (req, res) => {
  const studentId = req.user.userId || '2023BCSE0142';

  let feeSummary = db.prepare(`
    SELECT * FROM student_fee_summary WHERE studentId = ?
  `).get(studentId);

  if (!feeSummary) {
    // Default fallback if not found
    feeSummary = {
      studentId,
      name: req.user.name,
      program: req.user.department,
      totalDue: 185000,
      paidAmount: 0,
      balance: 185000,
      status: 'Pending',
      dueDate: '2026-09-15',
    };
  }

  // Get past payments
  const payments = db.prepare(`
    SELECT * FROM payments WHERE studentId = ? ORDER BY createdAt DESC
  `).all(studentId);

  res.json({
    success: true,
    fee: feeSummary,
    payments,
    itemizedBreakdown: [
      { item: 'Undergraduate Tuition (Semester 6 - Core Engineering)', amount: 140000, term: 'Fall 2026' },
      { item: 'AI Systems & Distributed Systems Lab Access', amount: 30000, term: 'Fall 2026' },
      { item: 'Campus Health, Recreation & Amenities Charge', amount: 15000, term: 'Annual 2026-27' },
    ],
  });
});

// POST /api/fees/pay (Student)
router.post('/pay', authenticateJWT, requireRole(['student']), (req, res) => {
  const { amount = 185000, paymentMethod = 'Campus UPI / Net Banking', simulateFailure = false } = req.body;
  const studentId = req.user.userId || '2023BCSE0142';
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Failure simulation for test/demo
  if (simulateFailure) {
    db.prepare(`
      INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `EVT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
      req.user.id,
      `${req.user.name} (${req.user.role})`,
      req.user.role,
      'PAYMENT_GATEWAY_DECLINED',
      'fees',
      'Declined (402)',
      req.ip || '127.0.0.1',
      '312ms',
      `Simulated bank gateway decline: Insufficient balance or bank timeout during ₹${amount.toLocaleString('en-IN')} UPI transaction.`,
      null,
      timestamp
    );

    return res.status(402).json({
      success: false,
      error: 'Transaction declined by issuer bank (Gateway Simulation: Insufficient Funds / Auth Timeout). Please retry or select another payment method.',
      code: 'PAYMENT_DECLINED',
    });
  }

  const transactionRef = `SBI-UPI-${Date.now().toString().slice(-8)}`;
  const receiptNumber = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Insert into payments table
  const paymentId = `PAY-${Date.now().toString().slice(-6)}`;
  db.prepare(`
    INSERT INTO payments (id, studentId, amount, currency, paymentMethod, status, transactionReference, receiptNumber, itemsJson, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    paymentId,
    studentId,
    amount,
    'INR',
    paymentMethod,
    'Paid',
    transactionRef,
    receiptNumber,
    JSON.stringify([
      { item: 'Core Tuition', amount: 140000 },
      { item: 'AI Systems Lab', amount: 30000 },
      { item: 'Campus Amenities', amount: 15000 },
    ]),
    timestamp
  );

  // 2. Fetch previous fee state for rollback snapshot
  const prevFee = db.prepare('SELECT * FROM student_fee_summary WHERE studentId = ?').get(studentId);

  // 3. Update student fee summary
  db.prepare(`
    UPDATE student_fee_summary
    SET paidAmount = totalDue, balance = 0, status = 'Paid', dueDate = 'Cleared', updatedAt = ?
    WHERE studentId = ?
  `).run(timestamp, studentId);

  // 4. Record change history
  db.prepare(`
    INSERT INTO change_history (id, entityType, entityId, previousValue, newValue, changedBy, description, rollbackAvailable, isRolledBack, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `CHG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    'fee',
    studentId,
    JSON.stringify(prevFee || { status: 'Pending', balance: amount }),
    JSON.stringify({ status: 'Paid', balance: 0, receiptNumber }),
    `${req.user.name} (${req.user.role})`,
    `Settled Semester 6 tuition fee of ₹${amount.toLocaleString('en-IN')} via ${paymentMethod}`,
    1,
    0,
    timestamp
  );

  // 5. Log audit event
  db.prepare(`
    INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `EVT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    req.user.id,
    `${req.user.name} (${req.user.role})`,
    req.user.role,
    'TUITION_FEE_SETTLED',
    'fees',
    'Authorized (200)',
    req.ip || '127.0.0.1',
    '88ms',
    `Settled Semester 6 tuition fee of ₹${amount.toLocaleString('en-IN')} (Receipt #${receiptNumber})`,
    null,
    timestamp
  );

  const updatedFee = db.prepare('SELECT * FROM student_fee_summary WHERE studentId = ?').get(studentId);

  res.json({
    success: true,
    message: 'Tuition fee settled successfully.',
    fee: updatedFee,
    receipt: {
      receiptNumber,
      transactionRef,
      amount,
      currency: 'INR',
      studentId,
      studentName: req.user.name,
      paymentMethod,
      timestamp,
      status: 'Paid',
    },
  });
});

// GET /api/fees/records (Admin)
router.get('/records', authenticateJWT, requireRole(['admin']), (req, res) => {
  const { search = '', filter = 'All' } = req.query;

  let query = 'SELECT * FROM student_fee_summary';
  const params = [];
  const conditions = [];

  if (filter && filter !== 'All') {
    conditions.push('status = ?');
    params.push(filter);
  }

  if (search && search.trim()) {
    conditions.push('(name LIKE ? OR studentId LIKE ? OR program LIKE ?)');
    const s = `%${search.trim()}%`;
    params.push(s, s, s);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY studentId ASC';

  const records = db.prepare(query).all(...params);

  // Compute live KPIs
  const allRecords = db.prepare('SELECT * FROM student_fee_summary').all();
  const totalBilled = allRecords.reduce((acc, r) => acc + (r.totalDue || 0), 0);
  const totalCollected = allRecords.reduce((acc, r) => acc + (r.paidAmount || 0), 0);
  const totalPending = allRecords.reduce((acc, r) => acc + (r.balance || 0), 0);
  const overdueCount = allRecords.filter((r) => r.status === 'Overdue').length;
  const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : '0.0';

  res.json({
    success: true,
    records: records.map((r) => ({
      id: r.studentId,
      name: r.name,
      program: r.program,
      total: r.totalDue,
      paid: r.paidAmount,
      pending: r.balance,
      status: r.status,
      dueDate: r.dueDate,
    })),
    kpis: {
      totalBilled,
      totalCollected,
      totalPending,
      overdueCount,
      collectionRate,
    },
  });
});

// POST /api/fees/records/:id/settle (Admin offline settlement)
router.post('/records/:id/settle', authenticateJWT, requireRole(['admin']), (req, res) => {
  const studentId = req.params.id;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const prevFee = db.prepare('SELECT * FROM student_fee_summary WHERE studentId = ?').get(studentId);

  if (!prevFee) {
    return res.status(404).json({
      success: false,
      error: `Student fee account "${studentId}" not found.`,
      code: 'NOT_FOUND',
    });
  }

  db.prepare(`
    UPDATE student_fee_summary
    SET paidAmount = totalDue, balance = 0, status = 'Paid', dueDate = 'Cleared', updatedAt = ?
    WHERE studentId = ?
  `).run(timestamp, studentId);

  // Record change history
  db.prepare(`
    INSERT INTO change_history (id, entityType, entityId, previousValue, newValue, changedBy, description, rollbackAvailable, isRolledBack, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `CHG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    'fee',
    studentId,
    JSON.stringify(prevFee),
    JSON.stringify({ ...prevFee, status: 'Paid', balance: 0 }),
    `${req.user.name} (${req.user.role})`,
    `Administrative offline clearance for student ${prevFee.name} (${studentId})`,
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
    'FEE_BALANCE_SETTLED',
    'fees',
    'Authorized (200)',
    req.ip || '127.0.0.1',
    '65ms',
    `Bursar recorded offline payment settlement of ₹${prevFee.balance.toLocaleString('en-IN')} for ${prevFee.name} (${studentId})`,
    null,
    timestamp
  );

  res.json({
    success: true,
    message: `Fee record for ${prevFee.name} settled successfully.`,
    updatedRecord: {
      id: studentId,
      name: prevFee.name,
      total: prevFee.totalDue,
      paid: prevFee.totalDue,
      pending: 0,
      status: 'Paid',
    },
  });
});

export default router;
