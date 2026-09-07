import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.js';

export function seedDatabase() {
  initDatabase();

  // Check if users already seeded
  const userCountRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCountRow && userCountRow.count > 0) {
    console.log('[Database] Database already populated. Skipping initial seed.');
    return;
  }

  console.log('[Database] Seeding initial university records with bcrypt hashed passwords...');

  const studentHash = bcrypt.hashSync('Student@123', 10);
  const facultyHash = bcrypt.hashSync('Faculty@123', 10);
  const adminHash = bcrypt.hashSync('Admin@123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, secondaryEmail, userId, passwordHash, role, department, avatar, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'usr-student-01',
    'Aarav Sharma',
    'student@rolewise.edu',
    'student@rolewise.demo',
    '2023BCSE0142',
    studentHash,
    'student',
    'B.Tech Computer Science & Engineering (Sem 6)',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    new Date().toISOString(),
    new Date().toISOString()
  );

  insertUser.run(
    'usr-faculty-01',
    'Dr. Elena Vance',
    'faculty@rolewise.edu',
    'faculty@rolewise.demo',
    'FAC-CSE-0419',
    facultyHash,
    'faculty',
    'Department of Computer Science & Engineering',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    new Date().toISOString(),
    new Date().toISOString()
  );

  insertUser.run(
    'usr-admin-01',
    'Marcus Ray',
    'admin@rolewise.edu',
    'admin@rolewise.demo',
    'ADM-REG-0012',
    adminHash,
    'admin',
    'Office of Academic Affairs & Admissions',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    new Date().toISOString(),
    new Date().toISOString()
  );

  // Seed Student Fee Summary
  const insertFee = db.prepare(`
    INSERT INTO student_fee_summary (studentId, name, program, totalDue, paidAmount, balance, status, dueDate, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const feeData = [
    ['2023BCSE0142', 'Aarav Sharma', 'B.Tech CSE', 185000, 0, 185000, 'Pending', '2026-09-15', new Date().toISOString()],
    ['2023BCSE0182', 'Jordan Hayes', 'B.Tech CSE', 185000, 40000, 145000, 'Overdue', '2026-08-30', new Date().toISOString()],
    ['2023BCSE0102', 'Sophia Chen', 'B.Tech Data Science', 185000, 185000, 0, 'Paid', 'Cleared', new Date().toISOString()],
    ['2023BCSE0040', 'Priya Sharma', 'B.Tech AI & Data', 185000, 185000, 0, 'Paid', 'Cleared', new Date().toISOString()],
    ['2023BCSE0011', 'Lucas Meyer', 'B.Tech Cybersecurity', 185000, 85000, 100000, 'Pending', '2026-09-20', new Date().toISOString()],
    ['2023BCSE0101', 'Liam Foster', 'B.Tech CSE', 185000, 0, 185000, 'Overdue', '2026-08-15', new Date().toISOString()],
  ];

  for (const f of feeData) {
    insertFee.run(...f);
  }

  // Seed Admissions Applications
  const insertAdmission = db.prepare(`
    INSERT INTO admissions (id, studentId, applicantName, program, score, marks, quota, status, previousStatus, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const admissionData = [
    ['APP-2026-0812', null, 'Chloe Dubois', 'B.Tech Artificial Intelligence & Data Science', '98.4%ile (GATE/JEE)', '94.8% PCM', 'All-India General', 'Pending Review', null, '2026-08-28 10:15:00', '2026-08-28 10:15:00'],
    ['APP-2026-0941', '2023BCSE0142', 'Aarav Sharma', 'B.Tech Computer Science & Engineering', '99.1%ile (GATE/JEE)', '96.2% PCM', 'Merit Quota', 'Approved', 'Pending Review', '2026-08-20 09:30:00', '2026-08-25 14:20:00'],
    ['APP-2026-0799', null, 'Marcus Vance', 'B.Tech Cybersecurity & Privacy', '95.8%ile (GATE/JEE)', '91.5% PCM', 'State Merit', 'Approved', 'Pending Review', '2026-08-22 11:45:00', '2026-08-27 16:10:00'],
    ['APP-2026-0612', null, 'Tariq Al-Mansoor', 'B.Tech Robotics & Automation', '88.2%ile (GATE/JEE)', '84.0% PCM', 'Management Quota', 'Pending Review', null, '2026-08-25 14:00:00', '2026-08-25 14:00:00'],
    ['APP-2026-0504', null, 'Ananya Iyer', 'B.Tech Computer Science & Engineering', '92.4%ile (GATE/JEE)', '89.2% PCM', 'All-India General', 'Rejected', 'Pending Review', '2026-08-18 08:30:00', '2026-08-24 10:00:00'],
  ];

  for (const a of admissionData) {
    insertAdmission.run(...a);
  }

  // Seed Attendance Records for CS701 - CS704
  const insertAttendance = db.prepare(`
    INSERT INTO attendance (id, studentId, studentName, facultyId, course, courseName, date, session, status, source, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const courses = [
    { code: 'CS701', name: 'Artificial Intelligence' },
    { code: 'CS702', name: 'Distributed Systems' },
    { code: 'CS703', name: 'Machine Learning' },
    { code: 'CS704', name: 'Database Management Systems' },
  ];

  const students = [
    { id: '2023BCSE0142', name: 'Aarav Sharma' },
    { id: '2023BCSE0101', name: 'Liam Foster' },
    { id: '2023BCSE0102', name: 'Sophia Chen' },
    { id: '2023BCSE0182', name: 'Jordan Hayes' },
    { id: '2023BCSE0040', name: 'Priya Sharma' },
    { id: '2023BCSE0011', name: 'Lucas Meyer' },
    { id: '2023BCSE0115', name: 'Amira Khan' },
    { id: '2023BCSE0129', name: 'Vikram Malhotra' },
  ];

  // Seed past sessions
  const dates = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05'];
  let attIndex = 1000;

  for (const c of courses) {
    for (const d of dates) {
      for (const s of students) {
        attIndex++;
        // Keep attendance mostly present with a couple realistic absentees
        const isAbsent = (s.id === '2023BCSE0182' && (d === '2026-09-02' || d === '2026-09-04')) ||
                         (s.id === '2023BCSE0101' && d === '2026-09-03');
        insertAttendance.run(
          `ATT-${attIndex}`,
          s.id,
          s.name,
          'FAC-CSE-0419',
          c.code,
          c.name,
          d,
          'Period 1 — 09:00 AM to 10:00 AM',
          isAbsent ? 'Absent' : 'Present',
          'manual',
          `${d} 10:05:00`
        );
      }
    }
  }

  // Seed Certificates
  const insertCert = db.prepare(`
    INSERT INTO certificates (id, studentId, studentName, certNumber, certificateType, status, signatureHash, registrarSignatory, issuedDate, validUntil, generatedBy, generatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCert.run(
    'AIT-CERT-2026-0941',
    '2023BCSE0142',
    'Aarav Sharma',
    'CERT-2026-9904',
    'Bona Fide Student Certificate',
    'Generated & Cryptographically Sealed',
    'SHA256: 4e91c7a8b3f1092a48cd59e0a124bf89',
    'Marcus Ray, Controller of Examinations',
    '2026-09-01',
    '2026-12-31',
    'Marcus Ray (admin)',
    '2026-09-01 10:30:00'
  );

  // Seed Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const auditInitial = [
    ['EVT-9001', 'usr-admin-01', 'Marcus Ray (admin)', 'admin', 'SYSTEM_INITIALIZATION', 'system', 'Authorized (200)', '127.0.0.1 (Local Session)', '12ms', 'Initialized RoleWise AI persistent database schema', null, '2026-09-01 08:00:00'],
    ['EVT-9002', 'usr-student-01', 'Aarav Sharma (student)', 'student', 'USER_LOGIN_SUCCESS', 'auth', 'Authorized (200)', '172.16.8.219 (Campus Wi-Fi)', '45ms', 'User authenticated via SSO', null, '2026-09-05 09:12:00'],
    ['EVT-9003', 'usr-faculty-01', 'Dr. Elena Vance (faculty)', 'faculty', 'LECTURE_ATTENDANCE_SUBMITTED', 'attendance', 'Authorized (200)', '10.0.14.22 (Faculty Wing)', '68ms', 'CS701 attendance recorded for 8 students', null, '2026-09-05 10:05:32'],
    ['EVT-9004', 'usr-student-01', 'Aarav Sharma (student)', 'student', 'RESTRICTED_ACCESS_ATTEMPT', 'fees', 'Denied (403)', '172.16.8.219 (Campus Wi-Fi)', '32ms', 'Student attempted unauthorized access to Manage Fees', null, '2026-09-05 11:20:15'],
  ];

  for (const aud of auditInitial) {
    insertAudit.run(...aud);
  }

  // Seed Change History
  const insertHistory = db.prepare(`
    INSERT INTO change_history (id, entityType, entityId, previousValue, newValue, changedBy, description, rollbackAvailable, isRolledBack, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertHistory.run(
    'CHG-1001',
    'admission',
    'APP-2026-0812',
    JSON.stringify({ status: 'Pending Review' }),
    JSON.stringify({ status: 'Approved' }),
    'Marcus Ray (admin)',
    'Approved admission seat for Chloe Dubois (APP-2026-0812)',
    1,
    0,
    '2026-09-05 10:30:15'
  );

  console.log('[Database] Core database seed complete.');
  seedExperimentData(false);
}

/**
 * Seeds or resets the synthetic experiment dataset for demonstration and evaluation.
 * @param {boolean} force If true, clears existing synthetic experiment records first.
 */
export function seedExperimentData(force = false) {
  initDatabase();

  const existingCount = db.prepare('SELECT COUNT(*) as count FROM feature_usage_events').get().count;
  if (!force && existingCount > 0) {
    console.log('[Database] Experiment dataset already present (' + existingCount + ' events). Skipping experiment seed.');
    return;
  }

  if (force) {
    console.log('[Database] Force-clearing existing synthetic experiment data...');
    db.exec(`
      DELETE FROM feature_usage_events;
      DELETE FROM task_goals;
      DELETE FROM help_search_queries;
      DELETE FROM experiment_assignments;
      DELETE FROM validation_records;
      DELETE FROM risk_register;
    `);
  }

  console.log('[Database] Seeding synthetic demonstration dataset (>= 100 anonymized users, events, validation, risks)...');

  // 1. Generate >= 100 Anonymized Users (70 Students, 20 Faculty, 15 Admins = 105 total)
  const users = [];
  for (let i = 1; i <= 70; i++) {
    users.push({ id: `anon-std-${String(i).padStart(3, '0')}`, role: 'student' });
  }
  for (let i = 1; i <= 20; i++) {
    users.push({ id: `anon-fac-${String(i).padStart(3, '0')}`, role: 'faculty' });
  }
  for (let i = 1; i <= 15; i++) {
    users.push({ id: `anon-adm-${String(i).padStart(3, '0')}`, role: 'admin' });
  }

  // Deterministic experiment assignment based on user ID hash
  const insertAssign = db.prepare(`
    INSERT OR REPLACE INTO experiment_assignments (id, anonymous_user_id, role, experiment_name, experiment_group, assigned_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const assignments = {};
  for (const u of users) {
    // Deterministic hash: sum char codes
    let hash = 0;
    for (let c = 0; c < u.id.length; c++) hash += u.id.charCodeAt(c);
    const group = (hash % 2 === 0) ? 'control' : 'assistant';
    assignments[u.id] = group;

    insertAssign.run(
      `ASN-${u.id}`,
      u.id,
      u.role,
      'RoleWise Feature Discovery Experiment',
      group,
      '2026-09-01 00:00:00'
    );
  }

  // 2. Prepared Statements for Telemetry
  const insertEvent = db.prepare(`
    INSERT INTO feature_usage_events (id, anonymous_user_id, role, feature_id, task_goal, help_query, event_type, discovered, completed, success, source, experiment_group, duration_ms, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertGoal = db.prepare(`
    INSERT INTO task_goals (id, anonymous_user_id, role, goal_text, normalized_goal, feature_id, success, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertQuery = db.prepare(`
    INSERT INTO help_search_queries (id, anonymous_user_id, role, query_text, normalized_query, result_feature_id, result_type, success, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Task definitions per role
  const studentTasks = [
    { goal: 'Pay pending semester tuition fee', featureId: 'pay-fees', queries: ['pay fees', 'tuition dues', 'fee receipt', 'clear balance'], isUnderused: false },
    { goal: 'Check subject attendance deficit', featureId: 'view-attendance', queries: ['attendance percentage', 'shortage check', 'class attendance', '75 percent rule'], isUnderused: false },
    { goal: 'Download bona fide student certificate', featureId: 'download-certificate', queries: ['bonafide certificate', 'study certificate', 'degree bonafide', 'download certificate'], isUnderused: true },
    { goal: 'Track admission merit application status', featureId: 'track-admission', queries: ['admission status', 'application track', 'merit list', 'intake status'], isUnderused: true },
  ];

  const facultyTasks = [
    { goal: 'Submit lecture roll-call attendance', featureId: 'mark-attendance', queries: ['mark attendance', 'roll call', 'lecture attendance', 'daily roster'], isUnderused: false },
    { goal: 'Review at-risk student attendance cohort', featureId: 'view-student-attendance', queries: ['student attendance deficit', 'at-risk students', 'cohort report', 'attendance warning'], isUnderused: false },
    { goal: 'Upload biometric smartcard CSV attendance log', featureId: 'upload-attendance', queries: ['upload attendance file', 'biometric log csv', 'excel attendance upload', 'batch attendance'], isUnderused: true },
  ];

  const adminTasks = [
    { goal: 'Review and approve candidate admission seats', featureId: 'manage-admissions', queries: ['manage admissions', 'admit applicant', 'seat quota', 'admission approvals'], isUnderused: false },
    { goal: 'Reconcile bank fee collection settlements', featureId: 'manage-fees', queries: ['reconcile fees', 'offline payment', 'fee settlement', 'bursar report'], isUnderused: false },
    { goal: 'Batch sign cryptographic graduation credentials', featureId: 'generate-certificates', queries: ['sign certificates', 'batch credential issuance', 'convocation degree', 'cryptographic seal'], isUnderused: true },
  ];

  let eventSeq = 1000;
  let goalSeq = 1000;
  let querySeq = 1000;

  // Generate realistic events for each user
  for (const u of users) {
    const group = assignments[u.id];
    const taskPool = u.role === 'student' ? studentTasks : u.role === 'faculty' ? facultyTasks : adminTasks;

    // Each user undertakes 3 to 6 tasks over the evaluation period
    const taskCount = (u.id.charCodeAt(u.id.length - 1) % 4) + 3;

    for (let t = 0; t < taskCount; t++) {
      const task = taskPool[t % taskPool.length];
      const query = task.queries[t % task.queries.length];
      const day = ((eventSeq % 5) + 1).toString().padStart(2, '0');
      const timeStr = `2026-09-${day} ${String(9 + (eventSeq % 8)).padStart(2, '0')}:${String((eventSeq * 7) % 60).padStart(2, '0')}:00`;

      // Probabilities based on group:
      // CONTROL: Discovery ~48%, Completion ~51%, Search Success ~53%, Underused ~28%, Avg Time ~54s
      // ASSISTANT: Discovery ~81%, Completion ~72%, Search Success ~83%, Underused ~68%, Avg Time ~17s
      const isControl = group === 'control';
      const rand = ((eventSeq * 37 + u.id.charCodeAt(u.id.length - 1)) % 100) / 100;

      let discovered = 0;
      let completed = 0;
      let success = 1;
      let durationMs = 0;

      if (isControl) {
        // Control Group Metrics
        const discoveryProb = task.isUnderused ? 0.28 : 0.52;
        discovered = rand < discoveryProb ? 1 : 0;
        completed = discovered && rand < 0.51 ? 1 : 0;
        durationMs = Math.floor(40000 + rand * 35000); // 40-75s
      } else {
        // Assistant Group Metrics
        const discoveryProb = task.isUnderused ? 0.68 : 0.84;
        discovered = rand < discoveryProb ? 1 : 0;
        completed = discovered && rand < 0.73 ? 1 : 0;
        durationMs = Math.floor(11000 + rand * 12000); // 11-23s
      }

      eventSeq++;
      goalSeq++;
      querySeq++;

      // Log Task Goal
      insertGoal.run(
        `GOAL-${goalSeq}`,
        u.id,
        u.role,
        task.goal,
        task.goal.toLowerCase(),
        task.featureId,
        completed,
        timeStr
      );

      // Log Help Search Query
      const searchSuccess = isControl ? (rand < 0.54 ? 1 : 0) : (rand < 0.83 ? 1 : 0);
      insertQuery.run(
        `QRY-${querySeq}`,
        u.id,
        u.role,
        query,
        query.toLowerCase(),
        searchSuccess ? task.featureId : null,
        searchSuccess ? 'matched' : (rand < 0.8 ? 'no_match' : 'ambiguous'),
        searchSuccess,
        timeStr
      );

      // Log Feature Usage Event
      insertEvent.run(
        `EVT-${eventSeq}`,
        u.id,
        u.role,
        task.featureId,
        task.goal,
        query,
        completed ? 'action_completed' : discovered ? 'feature_open' : 'action_started',
        discovered,
        completed,
        completed ? 1 : (discovered ? 1 : 0),
        isControl ? 'search' : 'assistant',
        group,
        durationMs,
        timeStr
      );
    }
  }

  // 3. Seed Realistic Recommendation Overrides & Error Scenarios
  const overrideReasons = [
    { reason: 'Recommendation was incorrect', note: 'Expected Manage Fees but got Pay Fees' },
    { reason: 'I needed another service', note: 'Wanted to check Attendance instead of Certificates' },
    { reason: 'Search/query was misunderstood', note: 'Query "roll" matched roll-call instead of roll-number' },
    { reason: 'I already knew where to find it', note: 'Navigated directly via top navigation' },
    { reason: 'Other', note: 'Testing alternate workflow permissions' },
  ];

  for (let o = 0; o < 15; o++) {
    eventSeq++;
    const ov = overrideReasons[o % overrideReasons.length];
    insertEvent.run(
      `EVT-${eventSeq}`,
      `anon-std-${String(10 + o).padStart(3, '0')}`,
      'student',
      'download-certificate',
      'Download bona fide student certificate',
      'need document',
      'assistant_override',
      1,
      0,
      0,
      'assistant',
      'assistant',
      24000,
      `2026-09-04 14:${String(10 + o).padStart(2, '0')}:00`
    );
  }

  // Ambiguous & No Match Queries
  const ambiguousQueries = [
    'certificate', 'fees statement', 'roll-call', 'exam schedule',
    'grade sheet', 'clearance', 'attendance verification', 'status inquiry'
  ];
  for (const aq of ambiguousQueries) {
    querySeq++;
    insertQuery.run(
      `QRY-${querySeq}`,
      'anon-std-025',
      'student',
      aq,
      aq.toLowerCase(),
      null,
      'ambiguous',
      0,
      '2026-09-05 11:15:00'
    );
  }

  const noMatchQueries = [
    'campus shuttle schedule', 'cafeteria lunch menu', 'gym locker reservation',
    'lost and found umbrella', 'hostel room exchange', 'swimming pool timing'
  ];
  for (const nm of noMatchQueries) {
    querySeq++;
    insertQuery.run(
      `QRY-${querySeq}`,
      'anon-std-033',
      'student',
      nm,
      nm.toLowerCase(),
      null,
      'no_match',
      0,
      '2026-09-05 12:20:00'
    );
  }

  // 4. Seed Stakeholder Validation Records (3 Student, 1 Faculty, 1 Admin)
  const insertValidation = db.prepare(`
    INSERT INTO validation_records (id, participant_type, role, task, before_flow, after_flow, discovery_time_sec, completion_time_sec, success, usefulness_score, feedback, is_synthetic, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const validationCohort = [
    [
      'VAL-001',
      'student',
      'student',
      'Download Bona Fide Certificate for Visa Application',
      'Searched through student handbook and visited administration registrar desk in person',
      'Typed "bonafide certificate" into Discovery Assistant; viewed explainability evidence and downloaded with seal',
      110.5,
      18.2,
      1,
      5,
      'The recommendation explanation showed exactly why I qualified for the Bonafide Certificate. Saved me an hour across campus.',
      1,
      '2026-09-05 14:10:00'
    ],
    [
      'VAL-002',
      'student',
      'student',
      'Pay Semester Tuition Balance via UPI',
      'Looked under student settings, attempted direct link, got lost in navigation hierarchy',
      'Used Discovery Assistant; instant confidence score of 94% with itemized fee breakdown and payment modal',
      74.0,
      12.4,
      1,
      4,
      'Found the payment portal directly with receipt breakdown. Simulation confirmation made it very clear what would be settled.',
      1,
      '2026-09-05 15:30:00'
    ],
    [
      'VAL-003',
      'student',
      'student',
      'Track B.Tech Admission Verification Milestones',
      'Phoned admissions admissions helpline and waited for manual application status lookup',
      'Entered admission goal; Assistant verified student profile and rendered 5-stage progress milestone tracker',
      88.0,
      19.5,
      1,
      5,
      'Clear step-by-step verification milestones shown immediately. Highly confidence-inspiring.',
      1,
      '2026-09-05 16:45:00'
    ],
    [
      'VAL-004',
      'faculty',
      'faculty',
      'Upload Biometric Attendance CSV Log for CS701',
      'Manual line-by-line mark-attendance entry across 42 students taking 25 minutes',
      'Queried "upload attendance file"; assistant directed to biometric spreadsheet parser with row validation',
      132.0,
      21.8,
      1,
      5,
      'Biometric bulk upload was previously buried under deep menus; assistant brought it up immediately. Major timesaver.',
      1,
      '2026-09-05 17:15:00'
    ],
    [
      'VAL-005',
      'admin',
      'admin',
      'Governance Change Review & Admission Decision Rollback',
      'Manually adjusted database records using SQL scripts without transaction history',
      'Approved admission application, reviewed state snapshot in Change Review, and executed 1-click audit-logged rollback',
      85.0,
      15.0,
      1,
      5,
      'Audit trail with rollback snapshot prevented duplicate manual reconciliations. Security boundaries are solid.',
      1,
      '2026-09-05 18:00:00'
    ],
  ];

  for (const v of validationCohort) {
    insertValidation.run(...v);
  }

  // 5. Seed Enterprise Risk Register (R1 through R10)
  const insertRisk = db.prepare(`
    INSERT INTO risk_register (id, risk_code, title, probability, impact, severity, mitigation, owner, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const risks = [
    ['RSK-001', 'R1', 'Wrong Recommendation', 'Low', 'Medium', 'Low', 'Confidence score thresholding (>=85% required for primary action) and transparent rule explainability indicators.', 'AI & Discovery Engineering', 'Active'],
    ['RSK-002', 'R2', 'Role Mismatch & Privilege Escalation', 'Low', 'High', 'Medium', 'Cryptographically signed JWT bearer tokens and server-side RBAC middleware with 403 audit logging.', 'Security Operations', 'Mitigated'],
    ['RSK-003', 'R3', 'Incorrect Task Inference', 'Medium', 'Medium', 'Medium', 'Disambiguation prompt with multi-option intent fallback and structured user feedback capture.', 'UX & NLP Team', 'Active'],
    ['RSK-004', 'R4', 'Privacy & Student Data Leakage', 'Low', 'Critical', 'High', 'Strict anonymization of analytical identifiers (anon-std-XXX) with zero PII logged in telemetry.', 'Data Protection Officer', 'Mitigated'],
    ['RSK-005', 'R5', 'High-Impact Action Executed Inadvertently', 'Low', 'High', 'High', 'Mandatory two-step human confirmation dialog displaying action consequences before mutation.', 'Core Services Lead', 'Mitigated'],
    ['RSK-006', 'R6', 'Model & Recommendation Concept Drift', 'Medium', 'Medium', 'Medium', 'Deterministic rule catalog with real-time error telemetry, override logging, and threshold alerts.', 'AI Engineering', 'Monitoring'],
    ['RSK-007', 'R7', 'Audit Trail Tampering or Failure', 'Low', 'High', 'Medium', 'Append-only SQLite WAL persistence with HMAC-256 integrity hashing and forensic export.', 'Systems Architect', 'Mitigated'],
    ['RSK-008', 'R8', 'State Rollback Corruption or Desync', 'Low', 'High', 'High', 'Atomic JSON state snapshots in change_history table with pre-rollback validity assertions.', 'Database Administrator', 'Mitigated'],
    ['RSK-009', 'R9', 'Service or Department Workflow Unavailable', 'Low', 'Medium', 'Low', 'Health check endpoints, graceful degradation alerts, and explicit support contact options.', 'DevOps & Infrastructure', 'Monitoring'],
    ['RSK-010', 'R10', 'User Over-Reliance on Discovery Assistant', 'Medium', 'Low', 'Low', 'Preserved direct navigation menus, feature directories, and transparent evidence documentation.', 'Academic Portal Governance', 'Active'],
  ];

  for (const r of risks) {
    insertRisk.run(...r);
  }

  console.log('[Database] Synthetic experiment dataset seeded successfully.');
}

