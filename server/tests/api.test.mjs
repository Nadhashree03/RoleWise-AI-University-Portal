/**
 * RoleWise AI - Automated Backend API Integration Test Suite
 * Tests all 12 modules, authentication, role access control (403),
 * transactions, file processing, and SQLite persistence.
 */

process.env.NODE_ENV = 'test';

import app from '../server.js';
import { db } from '../database/db.js';

let server;
let port;
let BASE_URL;

let studentToken;
let facultyToken;
let adminToken;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('======================================================================');
  console.log('ROLEWISE AI: BACKEND API & PERSISTENT SQLITE INTEGRATION TESTS');
  console.log('======================================================================\n');

  // Start in-process ephemeral test server
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      BASE_URL = `http://localhost:${port}/api`;
      console.log(`[Test Server] Running on ephemeral port ${port}`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------------------
    // 1. HEALTH CHECK & DATABASE CONNECTIVITY
    // -------------------------------------------------------------------------
    console.log('\n### 1. HEALTH CHECK & SERVICE STATUS');
    console.log('----------------------------------------------------------------------');
    const healthRes = await fetch(`${BASE_URL}/health`);
    assert(healthRes.status === 200, 'GET /api/health returns HTTP 200');
    const healthData = await healthRes.json();
    assert(healthData.status === 'ok', 'Health status is "ok"');
    assert(healthData.service === 'RoleWise AI Backend API', 'Service identity confirmed');
    assert(healthData.database.includes('SQLite'), 'Database engine confirmed SQLite');

    // -------------------------------------------------------------------------
    // 2. AUTHENTICATION & JWT ISSUANCE
    // -------------------------------------------------------------------------
    console.log('\n### 2. AUTHENTICATION & ROLE-AWARE LOGIN');
    console.log('----------------------------------------------------------------------');

    // 2.1 Student login
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'student@rolewise.edu', password: 'Student@123' }),
    });
    assert(studentLoginRes.status === 200, 'Student login returns 200 OK');
    const studentLoginData = await studentLoginRes.json();
    assert(studentLoginData.success === true, 'Student login reported success');
    assert(!!studentLoginData.token, 'Student JWT token issued');
    assert(studentLoginData.user.role === 'student', 'Student user role is "student"');
    assert(studentLoginData.user.userId === '2023BCSE0142', 'Student University ID is 2023BCSE0142');
    assert(!studentLoginData.user.password, 'Password hash is strictly omitted from user payload');
    studentToken = studentLoginData.token;

    // 2.2 Faculty login
    const facultyLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'faculty@rolewise.edu', password: 'Faculty@123' }),
    });
    assert(facultyLoginRes.status === 200, 'Faculty login returns 200 OK');
    const facultyLoginData = await facultyLoginRes.json();
    assert(facultyLoginData.user.role === 'faculty', 'Faculty user role is "faculty"');
    facultyToken = facultyLoginData.token;

    // 2.3 Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@rolewise.edu', password: 'Admin@123' }),
    });
    assert(adminLoginRes.status === 200, 'Admin login returns 200 OK');
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginData.user.role === 'admin', 'Admin user role is "admin"');
    adminToken = adminLoginData.token;

    // 2.4 Login with User ID
    const userIdLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '2023BCSE0142', password: 'Student@123' }),
    });
    assert(userIdLoginRes.status === 200, 'Login using Student User ID succeeds');

    // 2.5 Invalid password rejected
    const invalidPwRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'student@rolewise.edu', password: 'WrongPassword!' }),
    });
    assert(invalidPwRes.status === 401, 'Invalid password returns HTTP 401');

    // 2.6 Unrecognized user rejected
    const unknownUserRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'stranger@unknown.edu', password: 'AnyPassword@123' }),
    });
    assert(unknownUserRes.status === 401, 'Unknown user identifier returns HTTP 401');

    // 2.7 Verify GET /api/auth/me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(meRes.status === 200, 'GET /api/auth/me returns 200 for authenticated user');
    const meData = await meRes.json();
    assert(meData.user.email === 'student@rolewise.edu', 'Current user matches student email');

    // -------------------------------------------------------------------------
    // 3. ROLE AUTHORIZATION BARRIERS (403 FORBIDDEN GATING)
    // -------------------------------------------------------------------------
    console.log('\n### 3. ROLE-BASED ACCESS CONTROL & 403 BARRIERS');
    console.log('----------------------------------------------------------------------');

    // 3.1 Student trying to update admissions (Admin only)
    const studentAdmissionsAttempt = await fetch(`${BASE_URL}/admissions/APP-2026-001/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'Approved' }),
    });
    assert(studentAdmissionsAttempt.status === 403, 'Student denied (403) from Admin admissions update');
    const deniedData = await studentAdmissionsAttempt.json();
    assert(deniedData.code === 'ROLE_FORBIDDEN', 'Error code is ROLE_FORBIDDEN');

    // 3.2 Student trying to mark attendance (Faculty only)
    const studentAttendanceAttempt = await fetch(`${BASE_URL}/attendance/mark`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ course: 'CS701', date: '2026-09-07', session: 'Morning', roster: [] }),
    });
    assert(studentAttendanceAttempt.status === 403, 'Student denied (403) from Faculty attendance submission');

    // 3.3 Faculty trying to pay tuition fees (Student only)
    const facultyFeeAttempt = await fetch(`${BASE_URL}/fees/pay`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${facultyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: 185000, paymentMethod: 'UPI' }),
    });
    assert(facultyFeeAttempt.status === 403, 'Faculty denied (403) from Student tuition payment');

    // -------------------------------------------------------------------------
    // 4. STUDENT FEES & PAYMENT WORKFLOW
    // -------------------------------------------------------------------------
    console.log('\n### 4. FEES & FINANCIAL TRANSACTIONS');
    console.log('----------------------------------------------------------------------');

    // 4.1 Check student fee summary
    const myFeeRes = await fetch(`${BASE_URL}/fees/my-fee`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(myFeeRes.status === 200, 'GET /api/fees/my-fee returns 200 OK');
    const myFeeData = await myFeeRes.json();
    assert(myFeeData.fee.totalDue === 185000, 'Student total due is ₹185,000');

    // 4.2 Simulate payment failure
    const simFailRes = await fetch(`${BASE_URL}/fees/pay`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: 185000, paymentMethod: 'Card', simulateFailure: true }),
    });
    assert(simFailRes.status === 402, 'Simulated payment gateway failure returns HTTP 402 (Payment Required)');
    const simFailData = await simFailRes.json();
    assert(simFailData.code === 'PAYMENT_DECLINED', 'Simulated failure code PAYMENT_DECLINED confirmed');

    // 4.3 Execute successful payment
    const paySuccessRes = await fetch(`${BASE_URL}/fees/pay`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: 185000, paymentMethod: 'UPI' }),
    });
    assert(paySuccessRes.status === 200, 'Tuition fee payment processed successfully');
    const paySuccessData = await paySuccessRes.json();
    assert(paySuccessData.fee.balance === 0, 'Remaining balance is ₹0');
    assert(paySuccessData.fee.status === 'Paid', 'Fee status updated to "Paid"');
    assert(!!paySuccessData.receipt?.receiptNumber, 'Receipt number issued: ' + paySuccessData.receipt?.receiptNumber);

    // 4.4 Admin view fee records
    const feeRecordsRes = await fetch(`${BASE_URL}/fees/records`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(feeRecordsRes.status === 200, 'Admin can view fee records');
    const feeRecordsData = await feeRecordsRes.json();
    assert(feeRecordsData.records.length > 0, 'Fee records returned for student body');

    // -------------------------------------------------------------------------
    // 5. ATTENDANCE WORKFLOW & FILE PARSING
    // -------------------------------------------------------------------------
    console.log('\n### 5. ATTENDANCE & CSV FILE PROCESSING');
    console.log('----------------------------------------------------------------------');

    // 5.1 Student view attendance
    const myAttRes = await fetch(`${BASE_URL}/attendance/my-attendance`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(myAttRes.status === 200, 'Student can view course attendance');
    const myAttData = await myAttRes.json();
    assert(myAttData.thresholdStatus === 'Above Threshold (Eligible)', 'Threshold status evaluated');

    // 5.2 Faculty get roster
    const rosterRes = await fetch(`${BASE_URL}/attendance/course-roster/CS701`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    assert(rosterRes.status === 200, 'Faculty retrieves course roster for CS701');
    const rosterData = await rosterRes.json();
    assert(rosterData.roster.length > 0, 'CS701 roster contains registered students');

    const todayDate = new Date().toISOString().split('T')[0];
    const testSession = `Lecture Slot Test-${Date.now().toString().slice(-6)}`;
    const markRes = await fetch(`${BASE_URL}/attendance/mark`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${facultyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course: 'CS701',
        courseName: 'Artificial Intelligence',
        date: todayDate,
        session: testSession,
        roster: [
          { id: '2023BCSE0142', name: 'Aarav Sharma', status: 'Present' },
          { id: '2023BCSE0182', name: 'Jordan Hayes', status: 'Absent' },
        ],
      }),
    });
    assert(markRes.status === 200, 'Faculty attendance roll-call recorded');

    // 5.4 Test duplicate session prevention
    const dupMarkRes = await fetch(`${BASE_URL}/attendance/mark`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${facultyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course: 'CS701',
        courseName: 'Artificial Intelligence',
        date: todayDate,
        session: testSession,
        roster: [{ id: '2023BCSE0142', name: 'Aarav Sharma', status: 'Present' }],
      }),
    });
    assert(dupMarkRes.status === 409, 'Duplicate attendance session submission rejected with HTTP 409');

    // 5.5 File Upload (CSV parsing via FormData)
    const csvContent = 'studentId,studentName,status,attendanceRate\n2023BCSE0142,Aarav Sharma,Present,94.0%\n2023BCSE0182,Jordan Hayes,Absent,68.0%\n';
    const boundary = '----WebKitFormBoundaryRoleWiseTest' + Math.random().toString().slice(2);
    const bodyParts = [
      `--${boundary}\r\n`,
      'Content-Disposition: form-data; name="file"; filename="cs701_sync.csv"\r\n',
      'Content-Type: text/csv\r\n\r\n',
      csvContent,
      `\r\n--${boundary}--\r\n`,
    ].join('');

    const uploadRes = await fetch(`${BASE_URL}/attendance/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${facultyToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: bodyParts,
    });
    assert(uploadRes.status === 200, 'Faculty attendance CSV file upload & parsing succeeded');
    const uploadData = await uploadRes.json();
    assert(uploadData.stats.totalRows === 2, 'Parsed 2 rows from uploaded CSV');
    assert(uploadData.stats.presentCount === 1, 'Correctly extracted 1 Present status');

    // -------------------------------------------------------------------------
    // 6. ADMISSIONS & ROLLBACK
    // -------------------------------------------------------------------------
    console.log('\n### 6. ADMISSIONS DECISIONS & ROLLBACK');
    console.log('----------------------------------------------------------------------');

    const admissionsRes = await fetch(`${BASE_URL}/admissions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(admissionsRes.status === 200, 'Admin can list candidate admissions');
    const admissionsData = await admissionsRes.json();
    const candidate = admissionsData.applications[0];
    const initialStatus = candidate.status;

    // Approve candidate
    const updateAdmRes = await fetch(`${BASE_URL}/admissions/${candidate.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'Approved', notes: 'Merit cutoff met' }),
    });
    assert(updateAdmRes.status === 200, 'Admin finalized admission decision to Approved');

    // Rollback candidate decision
    const rollbackAdmRes = await fetch(`${BASE_URL}/admissions/${candidate.id}/rollback`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(rollbackAdmRes.status === 200, 'Admin executed state rollback on admission decision');
    const rollbackAdmData = await rollbackAdmRes.json();
    assert(rollbackAdmData.application.status === initialStatus, 'Admission status restored to ' + initialStatus);

    // -------------------------------------------------------------------------
    // 7. CERTIFICATES & PREREQUISITE CHECK
    // -------------------------------------------------------------------------
    console.log('\n### 7. CERTIFICATES & DIGITAL CREDENTIALS');
    console.log('----------------------------------------------------------------------');

    // Generate certificate by Admin
    const genCertRes = await fetch(`${BASE_URL}/certificates/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: '2023BCSE0142',
        studentName: 'Aarav Sharma',
        certificateType: 'Bona Fide Student Certificate',
      }),
    });
    assert(genCertRes.status === 200 || genCertRes.status === 201, 'Admin issued signed digital credential');
    const genCertData = await genCertRes.json();
    assert(genCertData.certificate.signatureHash.startsWith('SHA256:'), 'Certificate issued with cryptographic SHA-256 seal');

    // Student view certificates
    const studentCertsRes = await fetch(`${BASE_URL}/certificates/my-certificates`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentCertsRes.status === 200, 'Student retrieved verified credentials');
    const studentCertsData = await studentCertsRes.json();
    assert(studentCertsData.certificates.length > 0, 'Issued credential visible in student repository');

    // -------------------------------------------------------------------------
    // 8. RECOMMENDATION ENGINE & FEEDBACK LOOP
    // -------------------------------------------------------------------------
    console.log('\n### 8. RECOMMENDATION ENGINE & FEEDBACK TELEMETRY');
    console.log('----------------------------------------------------------------------');

    // 8.1 Evaluate query
    const evalRes = await fetch(`${BASE_URL}/recommendations/evaluate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: 'How can I pay my fees?' }),
    });
    assert(evalRes.status === 200, 'POST /api/recommendations/evaluate succeeds');
    const evalData = await evalRes.json();
    assert(evalData.result.status === 'SUCCESS', 'Evaluated query as SUCCESS');
    assert(evalData.result.feature.id === 'pay-fees', 'Matched feature is pay-fees');
    const eventId = evalData.eventId;
    assert(!!eventId, 'Event ID generated for feedback tracking: ' + eventId);

    // 8.2 Submit Helpful Feedback
    const fbRes = await fetch(`${BASE_URL}/recommendations/${eventId}/feedback`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedback: 'helpful' }),
    });
    assert(fbRes.status === 200, 'Submitted "helpful" feedback successfully');

    // 8.3 Query Recommendation History
    const histRes = await fetch(`${BASE_URL}/recommendations/history`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(histRes.status === 200, 'Retrieved recommendation query history');
    const histData = await histRes.json();
    assert(histData.history.length > 0, 'Recommendation history contains persistent events');

    // -------------------------------------------------------------------------
    // 9. AUDIT TRAIL & POINT-IN-TIME FORENSICS
    // -------------------------------------------------------------------------
    console.log('\n### 9. AUDIT TRAIL & MULTI-CRITERIA FILTERS');
    console.log('----------------------------------------------------------------------');

    const auditAllRes = await fetch(`${BASE_URL}/audit-logs?limit=10&page=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(auditAllRes.status === 200, 'Admin retrieves audit ledger');
    const auditAllData = await auditAllRes.json();
    assert(auditAllData.logs.length > 0, 'Audit ledger contains recorded system actions');
    assert(auditAllData.pagination.total > 0, 'Pagination metadata calculated');

    // Filter by role
    const auditRoleRes = await fetch(`${BASE_URL}/audit-logs?role=student`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const auditRoleData = await auditRoleRes.json();
    assert(auditRoleData.logs.every((l) => l.role === 'student'), 'Audit logs successfully filtered by role="student"');

    // -------------------------------------------------------------------------
    // 10. ANALYTICS & DATABASE METRICS
    // -------------------------------------------------------------------------
    console.log('\n### 10. DATABASE-DRIVEN ANALYTICS');
    console.log('----------------------------------------------------------------------');

    const analyticsRes = await fetch(`${BASE_URL}/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(analyticsRes.status === 200, 'GET /api/analytics returns 200 OK');
    const analyticsData = await analyticsRes.json();
    assert(analyticsData.success === true, 'Analytics reported success');
    assert(analyticsData.telemetry.users.student >= 1, 'Analytics includes student user count');
    assert(analyticsData.telemetry.fees.totalCollected > 0, 'Analytics calculates real collected fees');
    assert(analyticsData.telemetry.attendance.totalEvents > 0, 'Analytics calculates real attendance events');
    assert(analyticsData.telemetry.discoveryAssistant.totalEvaluations > 0, 'Analytics tracks discovery assistant events');

    console.log('\n======================================================================');
    console.log(`TEST SUITE COMPLETED: ${passedTests}/${totalTests} TESTS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
    console.log('======================================================================\n');
  } finally {
    if (server) {
      server.close();
      console.log('[Test Server] Stopped cleanly.');
    }
  }
}

runTests().catch((err) => {
  console.error('\n❌ Unhandled test failure:', err);
  process.exit(1);
});
