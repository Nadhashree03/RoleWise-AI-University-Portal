// Realistic Anonymized University Mock Data for RoleWise AI (Indian University Context)

export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  ADMIN: 'admin',
};

// Formats numeric or currency string values into standard Indian Rupee notation (₹)
export const formatINR = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  if (typeof amount === 'string' && amount.startsWith('₹')) return amount;
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.-]+/g, '')) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

// Primary and auxiliary university features with role-specific permission mappings
export const MOCK_FEATURES = [
  // ================= STUDENT SPECIFIC PRIMARY FEATURES =================
  {
    id: 'pay-fees',
    title: 'Pay Fees',
    category: 'Finance & Accounts',
    description: 'Review fee breakdowns, check installment schedules, and make secure tuition & lab fee payments with instant digital receipt generation.',
    primaryFor: [ROLES.STUDENT],
    allowedRoles: [ROLES.STUDENT],
    department: 'Bursar & Student Accounts',
    icon: 'CreditCard',
    status: 'Action Required',
    frequency: 'Monthly / Semesterly',
    tags: ['Tuition', 'Online Payments', 'Receipts', 'Fee Waiver', 'Pending Amount', 'Balance Due'],
    metadata: {
      pendingAmount: '₹1,85,000',
      dueDate: '2026-09-15',
      breakdown: [
        { item: 'Undergraduate Tuition (Semester 6)', amount: '₹1,40,000' },
        { item: 'AI & Distributed Systems Lab Access', amount: '₹30,000' },
        { item: 'Campus Health & Student Life Amenities', amount: '₹15,000' },
      ],
      lastPayment: '₹1,85,000 on Jan 12, 2026 (Receipt #REC-2026-1049)',
    },
    usageMetrics: {
      impressions: 24100,
      opens: 18400,
      completions: 15100,
      completionRate: 82.1,
      helpSearches: 1840,
      role: ROLES.STUDENT,
      isUnderused: false,
      evidenceStrength: 'Strong',
    },
  },
  {
    id: 'view-attendance',
    title: 'View Attendance',
    category: 'Academics & Attendance',
    description: 'Monitor lecture and laboratory attendance percentages across all registered courses, track absence quotas, and verify examination eligibility thresholds.',
    primaryFor: [ROLES.STUDENT],
    allowedRoles: [ROLES.STUDENT],
    department: 'Academic Registrar & Attendance Office',
    icon: 'CalendarCheck',
    status: 'Updated Today',
    frequency: 'Daily',
    tags: ['Attendance', 'Threshold (75%)', 'Course Roster', 'Absence Alert'],
    metadata: {
      overallPercentage: '84.4%',
      minimumRequired: '75.0%',
      courses: [
        { code: 'CS-402', name: 'Distributed Systems & Cloud Computing', attended: 27, total: 32, percentage: '84.4%', status: 'Safe' },
        { code: 'CS-480', name: 'Neural Networks & Deep Learning', attended: 28, total: 30, percentage: '93.3%', status: 'Excellent' },
        { code: 'CS-495', name: 'Senior Capstone Project Phase-II', attended: 14, total: 19, percentage: '73.7%', status: 'Warning' },
        { code: 'MATH-380', name: 'Applied Probability & Stochastic Processes', attended: 24, total: 28, percentage: '85.7%', status: 'Safe' },
      ],
    },
    usageMetrics: {
      impressions: 38200,
      opens: 29400,
      completions: 27100,
      completionRate: 92.2,
      helpSearches: 2420,
      role: ROLES.STUDENT,
      isUnderused: false,
      evidenceStrength: 'Strong',
    },
  },
  {
    id: 'download-certificate',
    title: 'Download Certificate',
    category: 'Certifications & Records',
    description: 'Generate and download digitally signed bona fide student certificates, tuition clearance letters, grade transcripts, and enrollment verification documents.',
    primaryFor: [ROLES.STUDENT],
    allowedRoles: [ROLES.STUDENT],
    department: 'Records & Examination Branch',
    icon: 'FileCheck',
    status: 'Available On-Demand',
    frequency: 'As Needed',
    tags: ['Bona Fide', 'Transcripts', 'Digital Signature', 'Clearance Letter'],
    metadata: {
      availableCertificates: [
        { id: 'cert-1', name: 'Bona Fide Student Certificate', issueDate: '2026-09-01', format: 'PDF (Cryptographically Signed)', validUntil: '2026-12-31', feeHoldCheck: false },
        { id: 'cert-2', name: 'Official Grade Transcript (Sem 1-5)', issueDate: '2026-08-20', format: 'PDF (Registrar Sealed)', validUntil: 'Permanent', feeHoldCheck: false },
        { id: 'cert-3', name: 'Tuition Fee Clearance & No-Dues Certificate', issueDate: '2026-08-28', format: 'PDF (Bursar Verified)', validUntil: '2026-10-31', feeHoldCheck: true },
        { id: 'cert-4', name: 'Medium of Instruction Certificate (English)', issueDate: '2026-08-15', format: 'PDF (Registrar Signed)', validUntil: 'Permanent', feeHoldCheck: false },
      ],
    },
    usageMetrics: {
      impressions: 5420,
      opens: 1120,
      completions: 740,
      completionRate: 66.1,
      helpSearches: 180,
      role: ROLES.STUDENT,
      isUnderused: true,
      underusedReason: 'High-utility self-service: only 34% of eligible students utilize instant cryptographic PDF issuance, saving 3 business days at the registrar counter.',
      evidenceStrength: 'Moderate',
    },
  },
  {
    id: 'track-admission',
    title: 'Track Admission',
    category: 'Admissions & Enrollment',
    description: 'Track application lifecycle milestones, document verification status, seat allocation, scholarship grants, and semester onboarding steps.',
    primaryFor: [ROLES.STUDENT],
    allowedRoles: [ROLES.STUDENT],
    department: 'University Admissions Directorate',
    icon: 'Compass',
    status: 'Verified',
    frequency: 'Lifecycle',
    tags: ['Admission Status', 'Documents', 'Merit List', 'Seat Confirmation', 'Application Tracking', 'Where is my application', 'My Application'],
    metadata: {
      applicationId: 'ADM-2024-CS-0941',
      program: 'B.Tech Computer Science & Engineering',
      batch: '2023 - 2027',
      milestones: [
        { title: 'Online Application Received', date: '2023-05-10', done: true },
        { title: 'Entrance Rank & Cutoff Merit Verification', date: '2023-06-02', done: true },
        { title: 'Original Documents & Identity Verification', date: '2023-06-18', done: true },
        { title: 'Department Seat Allocation & Admission Confirmed', date: '2023-07-01', done: true },
        { title: 'Degree Final Clearance Verification', date: 'Expected May 2027', done: false },
      ],
    },
    usageMetrics: {
      impressions: 8400,
      opens: 3200,
      completions: 2450,
      completionRate: 76.6,
      helpSearches: 980,
      role: ROLES.STUDENT,
      isUnderused: false,
      evidenceStrength: 'Strong',
    },
  },

  // ================= FACULTY SPECIFIC PRIMARY FEATURES =================
  {
    id: 'mark-attendance',
    title: 'Mark Attendance',
    category: 'Instruction & Roll Call',
    description: 'Record daily lecture and lab session attendance for assigned course batches with quick roll-call toggles, absence reason tagging, and instant cloud sync.',
    primaryFor: [ROLES.FACULTY],
    allowedRoles: [ROLES.FACULTY],
    department: 'Faculty Teaching Portal & Registrar',
    icon: 'UserCheck',
    status: 'Lecture Session Pending',
    frequency: 'Daily / Per Lecture',
    tags: ['Roll Call', 'Daily Class', 'Present/Absent', 'Lab Session'],
    metadata: {
      activeLecture: 'CS-480: Neural Networks (Room 304)',
      scheduledTime: '10:00 AM - 11:30 AM',
      enrolledCount: 42,
      pendingMarking: true,
      recentSessions: [
        { date: '2026-09-04', course: 'CS-480', present: 39, absent: 3, submittedAt: '11:28 AM' },
        { date: '2026-09-03', course: 'CS-402', present: 36, absent: 6, submittedAt: '03:15 PM' },
      ],
    },
    usageMetrics: {
      impressions: 16800,
      opens: 14200,
      completions: 13800,
      completionRate: 97.2,
      helpSearches: 3120,
      role: ROLES.FACULTY,
      isUnderused: false,
      evidenceStrength: 'Strong',
    },
  },
  {
    id: 'view-student-attendance',
    title: 'View Student Attendance',
    category: 'Advising & Cohort Analytics',
    description: 'Inspect class-wide attendance distribution, identify students at risk of falling below the 75% threshold, and generate attendance warnings.',
    primaryFor: [ROLES.FACULTY],
    allowedRoles: [ROLES.FACULTY],
    department: 'Academic Advising & Department Chair',
    icon: 'Users',
    status: 'Alerts Active',
    frequency: 'Weekly',
    tags: ['Cohort Summary', 'At-Risk Students', 'Attendance Deficit', 'Dean Warning'],
    metadata: {
      atRiskCount: 4,
      classAverage: '84.6%',
      atRiskStudents: [
        { id: 'STU-2024-9182', name: 'Jordan Hayes', course: 'CS-402', attendance: '68.75%', absences: 10, contact: 'j.hayes@univ.edu' },
        { id: 'STU-2024-8840', name: 'Priya Sharma', course: 'CS-495', attendance: '72.22%', absences: 5, contact: 'p.sharma@univ.edu' },
        { id: 'STU-2024-9011', name: 'Lucas Meyer', course: 'CS-402', attendance: '71.88%', absences: 9, contact: 'l.meyer@univ.edu' },
        { id: 'STU-2024-9335', name: 'Amira Khan', course: 'CS-480', attendance: '73.33%', absences: 8, contact: 'a.khan@univ.edu' },
      ],
    },
    usageMetrics: {
      impressions: 9200,
      opens: 6400,
      completions: 5200,
      completionRate: 81.3,
      helpSearches: 1420,
      role: ROLES.FACULTY,
      isUnderused: false,
      evidenceStrength: 'Strong',
    },
  },
  {
    id: 'upload-attendance',
    title: 'Upload Attendance',
    category: 'Batch Data & Biometric Sync',
    description: 'Batch upload attendance sheets via standardized CSV or sync offline biometric RFID / smartcard scanner exports directly into the central university registry.',
    primaryFor: [ROLES.FACULTY],
    allowedRoles: [ROLES.FACULTY],
    department: 'Central Academic Systems & IT',
    icon: 'UploadCloud',
    status: 'CSV Template Ready',
    frequency: 'Weekly / Batch',
    tags: ['CSV Upload', 'Biometric Import', 'Batch Sync', 'Excel Template'],
    metadata: {
      acceptedFormats: ['.csv', '.xlsx', '.dat (Biometric)'],
      lastBatchUpload: 'Batch #2026-09-02 (180 records processed)',
      pendingBiometricFiles: 1,
    },
    usageMetrics: {
      impressions: 3240,
      opens: 410,
      completions: 260,
      completionRate: 63.4,
      helpSearches: 110,
      role: ROLES.FACULTY,
      isUnderused: true,
      underusedReason: 'Underutilized automation: saves instructors ~25 min/week compared to individual roll-calls by parsing RFID biometric swipe exports directly.',
      evidenceStrength: 'Moderate',
    },
  },

  // ================= ADMIN SPECIFIC PRIMARY FEATURES =================
  {
    id: 'manage-admissions',
    title: 'Manage Admissions',
    category: 'Admissions Governance',
    description: 'Oversee university-wide candidate intake pipelines, verify uploaded qualifications, allocate seats across departments, and publish official merit lists.',
    primaryFor: [ROLES.ADMIN],
    allowedRoles: [ROLES.ADMIN],
    department: 'Directorate of Admissions & Enrollment',
    icon: 'GraduationCap',
    status: 'Batch 3 In Review',
    frequency: 'Continuous / Seasonal',
    tags: ['Application Review', 'Merit Lists', 'Seat Allocation', 'Quota Management', 'Admission Status', 'Admissions Review'],
    metadata: {
      pendingApplications: 48,
      approvedThisCycle: 342,
      totalCapacity: 500,
      recentApplicants: [
        { id: 'APP-2026-0811', name: 'Rohan Mehta', program: 'M.S. Artificial Intelligence', score: '98.4%', status: 'Documents Pending' },
        { id: 'APP-2026-0812', name: 'Chloe Dubois', program: 'B.S. Data Science', score: '94.2%', status: 'Approved for Seat' },
        { id: 'APP-2026-0813', name: 'Kwame Asante', program: 'B.S. Cybersecurity', score: '91.8%', status: 'Under Review' },
      ],
    },
    usageMetrics: {
      impressions: 12400,
      opens: 9100,
      completions: 7900,
      completionRate: 86.8,
      helpSearches: 890,
      role: ROLES.ADMIN,
      isUnderused: false,
      evidenceStrength: 'Strong',
    },
  },
  {
    id: 'manage-fees',
    title: 'Manage Fees',
    category: 'Financial Administration',
    description: 'Configure fee structures across colleges, manage scholarship disbursements, reconcile banking payment gateways, and track default balances.',
    primaryFor: [ROLES.ADMIN],
    allowedRoles: [ROLES.ADMIN],
    department: 'Office of the University Treasurer & Bursar',
    icon: 'Coins',
    status: 'Cycle Reconciliation',
    frequency: 'Continuous',
    tags: ['Fee Structures', 'Gateway Reconciliation', 'Defaulters', 'Scholarships', 'Pending Amount', 'Fee Balance'],
    metadata: {
      collectedThisTerm: '₹4,82,50,000',
      pendingDues: '₹24,25,000',
      collectionRate: '95.2%',
      gatewayStatus: 'SBI ePay, HDFC & Campus UPI APIs Operational',
      defaulterNoticeCount: 38,
    },
    usageMetrics: {
      impressions: 10800,
      opens: 7400,
      completions: 6500,
      completionRate: 87.8,
      helpSearches: 750,
      role: ROLES.ADMIN,
      isUnderused: false,
      evidenceStrength: 'Strong',
    },
  },
  {
    id: 'generate-certificates',
    title: 'Generate Certificates',
    category: 'Credential Governance',
    description: 'Batch issue and cryptographically sign graduation degrees, provisional diplomas, bonafide verification certificates, and dean list credentials with QR validation.',
    primaryFor: [ROLES.ADMIN],
    allowedRoles: [ROLES.ADMIN],
    department: 'Central Registrar & Credential Authority',
    icon: 'Award',
    status: '85 In Queue',
    frequency: 'Batch / On-Demand',
    tags: ['Degree Issuance', 'Digital Signatures', 'Batch Generator', 'QR Verification'],
    metadata: {
      readyForSignoff: 85,
      issuedYearToDate: 1240,
      templatesAvailable: ['B.Tech Degree Certificate 2026', 'Provisional Passing Certificate', 'Dean Honors Citation', 'Migration Certificate'],
      lastSignedBatch: 'Batch #GRAD-2026-AUG (64 Certificates signed)',
    },
    usageMetrics: {
      impressions: 2150,
      opens: 380,
      completions: 270,
      completionRate: 71.1,
      helpSearches: 95,
      role: ROLES.ADMIN,
      isUnderused: true,
      underusedReason: 'Efficiency bottleneck: 85 cleared graduation files remain in queue awaiting batch cryptographic root signing rather than single-candidate signoffs.',
      evidenceStrength: 'Moderate',
    },
  },
  {
    id: 'view-analytics',
    title: 'View Analytics',
    category: 'System Governance & Telemetry',
    description: 'Real-time telemetry on university portal usage, feature discovery latency, role engagement trends, and security audit anomalies across all campuses.',
    primaryFor: [ROLES.ADMIN],
    allowedRoles: [ROLES.ADMIN],
    department: 'Enterprise Architecture & Campus Intelligence',
    icon: 'BarChart3',
    status: 'Live Stream Active',
    frequency: 'Real-Time',
    tags: ['System Telemetry', 'Feature Adoption', 'User Activity', 'Anomaly Detection'],
    metadata: {
      activeSessions: 1420,
      serverLatency: '24ms',
      discoveryAccuracy: '94.2%',
      anomaliesDetected: 0,
    },
    usageMetrics: {
      impressions: 6800,
      opens: 4100,
      completions: 3600,
      completionRate: 87.8,
      helpSearches: 510,
      role: ROLES.ADMIN,
      isUnderused: false,
      evidenceStrength: 'Strong',
    },
  },
];

// Predefined University Demo Accounts for Prototype Authentication
export const DEMO_ACCOUNTS = [
  {
    role: ROLES.STUDENT,
    roleLabel: 'Student',
    email: 'student@rolewise.edu',
    userId: '2023BCSE0142',
    password: 'Student@123',
    name: 'Aarav Sharma',
    title: 'B.Tech Computer Science & Engineering',
    department: 'Department of Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    description: 'Undergraduate student account with access to tuition fees, attendance, certificates, and admission tracking.',
    statsNote: 'Semester 6 • 84.4% Attendance',
  },
  {
    role: ROLES.FACULTY,
    roleLabel: 'Faculty',
    email: 'faculty@rolewise.edu',
    userId: 'FAC-CSE-0419',
    password: 'Faculty@123',
    name: 'Dr. Elena Vance',
    title: 'Associate Professor & AI Systems Lab Head',
    department: 'Department of Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    description: 'Faculty instructor account with access to lecture roll-calls, student attendance risk deficit, and biometric uploads.',
    statsNote: '3 Course Sections • CS701 AI Head',
  },
  {
    role: ROLES.ADMIN,
    roleLabel: 'Admin',
    email: 'admin@rolewise.edu',
    userId: 'ADM-REG-0012',
    password: 'Admin@123',
    name: 'Marcus Ray',
    title: 'Registrar & Controller of Admissions & Finance',
    department: 'Central Administration & Finance Directorate',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    description: 'Administrator governance account with access to candidate intake admissions, fee reconciliation, batch certificates, and system analytics.',
    statsNote: 'Chief University Administrator • Full Governance',
  },
];

// Anonymized Detailed User Profiles
export const ANONYMIZED_USER_PROFILES = {
  [ROLES.STUDENT]: {
    id: '2023BCSE0142',
    name: 'Aarav Sharma',
    anonymizedCode: 'REG_2023BCSE0142',
    title: 'B.Tech Computer Science & Engineering',
    department: 'Department of Computer Science & Engineering',
    email: 'student@rolewise.edu',
    role: ROLES.STUDENT,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    term: 'Semester 6 (Spring 2026)',
    standing: "Dean's Honors List",
    attendanceSummary: '84.4% (Threshold: 75%)',
    feeStatus: 'Pending Installment (₹1,85,000)',
    admissionStatus: 'Confirmed & Enrolled',
    stats: [
      { label: 'Overall Attendance', value: '84.4%', note: 'Safe (>75% statutory min)' },
      { label: 'Pending Tuition', value: '₹1,85,000', note: 'Due in 10 days' },
      { label: 'Degree Progress', value: '108 / 130 Cr', note: 'Semester 6 of 8' },
    ],
  },
  [ROLES.FACULTY]: {
    id: 'FAC-CSE-0419',
    name: 'Dr. Elena Vance',
    anonymizedCode: 'FAC_ID_#0419',
    title: 'Associate Professor & AI Systems Lab Head',
    department: 'Department of Computer Science & Engineering',
    email: 'faculty@rolewise.edu',
    role: ROLES.FACULTY,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    term: 'Spring 2026',
    standing: 'Tenured Faculty Member',
    attendanceSummary: '3 Course Sections Managed',
    feeStatus: 'Research Grant: ₹18,40,000',
    admissionStatus: 'M.Tech Admissions Reviewer',
    stats: [
      { label: 'Attendance To Mark', value: '1 Session', note: 'CS-480 scheduled today' },
      { label: 'At-Risk Students', value: '4 Flagged', note: '<75% threshold' },
      { label: 'Batches Managed', value: '3 Sections', note: '118 students enrolled' },
    ],
  },
  [ROLES.ADMIN]: {
    id: 'ADM-REG-0012',
    name: 'Marcus Ray',
    anonymizedCode: 'ADM_ID_#0012',
    title: 'Registrar & Controller of Admissions & Finance',
    department: 'Central Administration & Finance Directorate',
    email: 'admin@rolewise.edu',
    role: ROLES.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    term: 'Academic Year 2025-26',
    standing: 'Chief University Administrator',
    attendanceSummary: 'System Uptime 99.98%',
    feeStatus: '₹4.82 Cr Collected / ₹24.25 Lakhs Pending',
    admissionStatus: 'Batch 3 Intake: 48 Applications in Review',
    stats: [
      { label: 'Pending Admissions', value: '48 In Review', note: 'Cutoff in 6 days' },
      { label: 'Unreconciled Fees', value: '₹24,25,000', note: '38 Defaulter Accounts' },
      { label: 'Certificates Queue', value: '85 Ready', note: 'Awaiting signature' },
    ],
  },
};

// Realistic Anonymized Feature Usage Events
export const FEATURE_USAGE_EVENTS = [
  {
    id: 'EVT-9041',
    timestamp: '2026-09-05 11:42:15',
    userId: 'STU-2024-9104',
    userRole: ROLES.STUDENT,
    featureId: 'pay-fees',
    action: 'INVOICE_BREAKDOWN_ACCESSED',
    status: 'SUCCESS',
    durationMs: 420,
    networkIp: '172.16.4.112 (Campus Wi-Fi)',
  },
  {
    id: 'EVT-9040',
    timestamp: '2026-09-05 11:30:02',
    userId: 'FAC-2018-0419',
    userRole: ROLES.FACULTY,
    featureId: 'mark-attendance',
    action: 'SESSION_ROSTER_OPENED',
    status: 'SUCCESS',
    durationMs: 310,
    networkIp: '10.240.12.88 (Faculty Subnet)',
  },
  {
    id: 'EVT-9039',
    timestamp: '2026-09-05 11:15:20',
    userId: 'STU-2024-9104',
    userRole: ROLES.STUDENT,
    featureId: 'view-attendance',
    action: 'THRESHOLD_COMPLIANCE_CHECKED',
    status: 'SUCCESS',
    durationMs: 180,
    networkIp: '172.16.4.112 (Campus Wi-Fi)',
  },
  {
    id: 'EVT-9038',
    timestamp: '2026-09-05 10:58:44',
    userId: 'ADM-2015-0012',
    userRole: ROLES.ADMIN,
    featureId: 'manage-admissions',
    action: 'MERIT_APPLICATION_BATCH_FETCH',
    status: 'SUCCESS',
    durationMs: 840,
    networkIp: '10.100.1.4 (Secure Admin Bastion)',
  },
  {
    id: 'EVT-9037',
    timestamp: '2026-09-05 10:44:11',
    userId: 'ADM-2015-0012',
    userRole: ROLES.ADMIN,
    featureId: 'manage-fees',
    action: 'STRIPE_GATEWAY_RECONCILE',
    status: 'SUCCESS',
    durationMs: 1250,
    networkIp: '10.100.1.4 (Secure Admin Bastion)',
  },
  {
    id: 'EVT-9036',
    timestamp: '2026-09-05 10:12:00',
    userId: 'FAC-2018-0419',
    userRole: ROLES.FACULTY,
    featureId: 'view-student-attendance',
    action: 'DEFICIT_WARNING_TRIGGERED',
    status: 'SUCCESS',
    durationMs: 530,
    networkIp: '10.240.12.88 (Faculty Subnet)',
  },
  {
    id: 'EVT-9035',
    timestamp: '2026-09-05 09:45:30',
    userId: 'ADM-2015-0012',
    userRole: ROLES.ADMIN,
    featureId: 'generate-certificates',
    action: 'CRYPTOGRAPHIC_SIGN_BATCH',
    status: 'SUCCESS',
    durationMs: 2400,
    networkIp: '10.100.1.4 (Secure Admin Bastion)',
  },
  {
    id: 'EVT-9034',
    timestamp: '2026-09-05 09:20:18',
    userId: 'STU-2024-9104',
    userRole: ROLES.STUDENT,
    featureId: 'download-certificate',
    action: 'BONAFIDE_PDF_GENERATED',
    status: 'SUCCESS',
    durationMs: 650,
    networkIp: '172.16.4.112 (Campus Wi-Fi)',
  },
  {
    id: 'EVT-9033',
    timestamp: '2026-09-05 08:50:45',
    userId: 'FAC-2018-0419',
    userRole: ROLES.FACULTY,
    featureId: 'upload-attendance',
    action: 'BIOMETRIC_CSV_BATCH_PARSED',
    status: 'SUCCESS',
    durationMs: 1890,
    networkIp: '10.240.12.88 (Faculty Subnet)',
  },
  {
    id: 'EVT-9032',
    timestamp: '2026-09-05 08:30:10',
    userId: 'STU-2024-9104',
    userRole: ROLES.STUDENT,
    featureId: 'track-admission',
    action: 'MILESTONE_STATUS_CHECK',
    status: 'SUCCESS',
    durationMs: 210,
    networkIp: '172.16.4.112 (Campus Wi-Fi)',
  },
];

// Anonymized Task Goals
export const TASK_GOALS = {
  [ROLES.STUDENT]: [
    { id: 'goal-s1', title: 'Clear Fall 2026 Tuition Installment', deadline: '2026-09-15', featureId: 'pay-fees', priority: 'High', progress: 0 },
    { id: 'goal-s2', title: 'Maintain 75%+ Attendance in CS-495', deadline: 'Ongoing', featureId: 'view-attendance', priority: 'Critical', progress: 77.8 },
    { id: 'goal-s3', title: 'Obtain Official Bona Fide Transcript', deadline: '2026-09-20', featureId: 'download-certificate', priority: 'Medium', progress: 100 },
    { id: 'goal-s4', title: 'Verify Onboarding Clearance & Electives', deadline: '2026-09-30', featureId: 'track-admission', priority: 'Normal', progress: 85 },
  ],
  [ROLES.FACULTY]: [
    { id: 'goal-f1', title: 'Mark Attendance for CS-480 Lecture', deadline: 'Today 11:30 AM', featureId: 'mark-attendance', priority: 'Critical', progress: 0 },
    { id: 'goal-f2', title: 'Issue Early Attendance Warnings (4 Students)', deadline: '2026-09-08', featureId: 'view-student-attendance', priority: 'High', progress: 50 },
    { id: 'goal-f3', title: 'Upload Lab Biometric Attendance Logs', deadline: '2026-09-09', featureId: 'upload-attendance', priority: 'Medium', progress: 25 },
  ],
  [ROLES.ADMIN]: [
    { id: 'goal-a1', title: 'Audit 48 Pending Batch-3 Admissions', deadline: '2026-09-11', featureId: 'manage-admissions', priority: 'Critical', progress: 40 },
    { id: 'goal-a2', title: 'Reconcile End-of-Month Fee Gateway Ledger', deadline: '2026-09-10', featureId: 'manage-fees', priority: 'High', progress: 80 },
    { id: 'goal-a3', title: 'Sign & Issue 85 Convocation Certificates', deadline: '2026-09-12', featureId: 'generate-certificates', priority: 'High', progress: 20 },
    { id: 'goal-a4', title: 'Analyze Feature Discovery Portal Latency', deadline: 'Daily', featureId: 'view-analytics', priority: 'Normal', progress: 95 },
  ],
};

// Student Fee Records for Admin Fee Management
export const MOCK_STUDENT_FEE_RECORDS = [
  { id: '2023BCSE0142', name: 'Aarav Sharma', program: 'B.Tech CSE', term: 'Semester 6', total: 185000, paid: 0, pending: 185000, status: 'Pending', dueDate: '2026-09-15' },
  { id: '2023BCSE0182', name: 'Jordan Hayes', program: 'B.Tech CSE', term: 'Semester 6', total: 185000, paid: 40000, pending: 145000, status: 'Overdue', dueDate: '2026-08-30' },
  { id: '2023BCSE0102', name: 'Sophia Chen', program: 'B.Tech Data Science', term: 'Semester 6', total: 185000, paid: 185000, pending: 0, status: 'Paid', dueDate: 'Cleared' },
  { id: '2023BCSE0040', name: 'Priya Sharma', program: 'B.Tech AI & Data', term: 'Semester 6', total: 185000, paid: 185000, pending: 0, status: 'Paid', dueDate: 'Cleared' },
  { id: '2023BCSE0011', name: 'Lucas Meyer', program: 'B.Tech Cybersecurity', term: 'Semester 6', total: 185000, paid: 85000, pending: 100000, status: 'Pending', dueDate: '2026-09-20' },
  { id: '2023BCSE0101', name: 'Liam Foster', program: 'B.Tech CSE', term: 'Semester 6', total: 185000, paid: 0, pending: 185000, status: 'Overdue', dueDate: '2026-08-15' },
];

// Assigned Faculty Courses (CS701 - CS704)
export const FACULTY_ASSIGNED_COURSES = [
  {
    code: 'CS701',
    name: 'Artificial Intelligence',
    department: 'Department of Computer Science & Engineering',
    term: 'Semester 7',
    room: 'AI Systems Lab 3',
    totalEnrolled: 8,
    schedule: 'Mon / Wed / Fri',
  },
  {
    code: 'CS702',
    name: 'Distributed Systems',
    department: 'Department of Computer Science & Engineering',
    term: 'Semester 7',
    room: 'Lecture Hall 402',
    totalEnrolled: 8,
    schedule: 'Tue / Thu',
  },
  {
    code: 'CS703',
    name: 'Machine Learning',
    department: 'Department of Computer Science & Engineering',
    term: 'Semester 7',
    room: 'Computing Lab 304',
    totalEnrolled: 8,
    schedule: 'Mon / Wed',
  },
  {
    code: 'CS704',
    name: 'Database Management Systems',
    department: 'Department of Computer Science & Engineering',
    term: 'Semester 7',
    room: 'Seminar Hall B',
    totalEnrolled: 8,
    schedule: 'Tue / Fri',
  },
];

// Selectable Session / Period Slots for Lecture Attendance
export const ATTENDANCE_SESSION_SLOTS = [
  { id: 'slot-1', label: 'Period 1 — 09:00 AM to 10:00 AM', timeRange: '09:00 AM - 10:00 AM', periodNumber: 1 },
  { id: 'slot-2', label: 'Period 2 — 10:00 AM to 11:00 AM', timeRange: '10:00 AM - 11:00 AM', periodNumber: 2 },
  { id: 'slot-3', label: 'Period 3 — 11:15 AM to 12:15 PM', timeRange: '11:15 AM - 12:15 PM', periodNumber: 3 },
  { id: 'slot-4', label: 'Period 4 — 01:00 PM to 02:00 PM', timeRange: '01:00 PM - 02:00 PM', periodNumber: 4 },
];

// Student Rosters by Course
export const COURSE_STUDENT_ROSTERS = {
  CS701: [
    { id: '2023BCSE0142', name: 'Aarav Sharma', status: 'Present' },
    { id: '2023BCSE0102', name: 'Sophia Chen', status: 'Present' },
    { id: '2023BCSE0040', name: 'Priya Sharma', status: 'Present' },
    { id: '2023BCSE0182', name: 'Jordan Hayes', status: 'Absent' },
    { id: '2023BCSE0011', name: 'Lucas Meyer', status: 'Present' },
    { id: '2023BCSE0035', name: 'Amira Khan', status: 'Present' },
    { id: '2023BCSE0101', name: 'Liam Foster', status: 'Present' },
    { id: '2023BCSE0219', name: 'Vikram Malhotra', status: 'Absent' },
  ],
  CS702: [
    { id: '2023BCSE0142', name: 'Aarav Sharma', status: 'Present' },
    { id: '2023BCSE0101', name: 'Liam Foster', status: 'Present' },
    { id: '2023BCSE0182', name: 'Jordan Hayes', status: 'Absent' },
    { id: '2023BCSE0011', name: 'Lucas Meyer', status: 'Present' },
    { id: '2023BCSE0109', name: 'Neha Deshmukh', status: 'Present' },
    { id: '2023BCSE0155', name: 'Devendra Patel', status: 'Present' },
    { id: '2023BCSE0198', name: 'Kavya Nair', status: 'Present' },
    { id: '2023BCSE0240', name: 'Rohan Verma', status: 'Present' },
  ],
  CS703: [
    { id: '2023BCSE0142', name: 'Aarav Sharma', status: 'Present' },
    { id: '2023BCSE0102', name: 'Sophia Chen', status: 'Present' },
    { id: '2023BCSE0040', name: 'Priya Sharma', status: 'Absent' },
    { id: '2023BCSE0035', name: 'Amira Khan', status: 'Present' },
    { id: '2023BCSE0144', name: 'Ishaan Verma', status: 'Present' },
    { id: '2023BCSE0167', name: 'Tanvi Joshi', status: 'Present' },
    { id: '2023BCSE0188', name: 'Arjun Sen', status: 'Present' },
    { id: '2023BCSE0201', name: 'Riya Mukherjee', status: 'Present' },
  ],
  CS704: [
    { id: '2023BCSE0142', name: 'Aarav Sharma', status: 'Present' },
    { id: '2023BCSE0101', name: 'Liam Foster', status: 'Present' },
    { id: '2023BCSE0040', name: 'Priya Sharma', status: 'Present' },
    { id: '2023BCSE0011', name: 'Lucas Meyer', status: 'Absent' },
    { id: '2023BCSE0112', name: 'Aditya Kulkarni', status: 'Present' },
    { id: '2023BCSE0176', name: 'Meera Iyer', status: 'Present' },
    { id: '2023BCSE0220', name: 'Siddharth Rao', status: 'Present' },
    { id: '2023BCSE0251', name: 'Ananya Gupta', status: 'Present' },
  ],
};

// Seed of already recorded sessions to test duplicate handling
export const PRELOADED_SUBMITTED_ATTENDANCE_SESSIONS = [
  {
    courseCode: 'CS701',
    courseName: 'Artificial Intelligence',
    date: '2026-09-05',
    sessionId: 'slot-1',
    sessionLabel: 'Period 1 — 09:00 AM to 10:00 AM',
    presentCount: 6,
    absentCount: 2,
    totalStudents: 8,
    submittedAt: '2026-09-05 10:05:32',
    instructor: 'Dr. Elena Vance',
  },
  {
    courseCode: 'CS702',
    courseName: 'Distributed Systems',
    date: '2026-09-05',
    sessionId: 'slot-2',
    sessionLabel: 'Period 2 — 10:00 AM to 11:00 AM',
    presentCount: 7,
    absentCount: 1,
    totalStudents: 8,
    submittedAt: '2026-09-05 11:02:18',
    instructor: 'Dr. Elena Vance',
  },
];

// Student Attendance Cohort Table for Faculty View Student Attendance
export const MOCK_STUDENT_ATTENDANCE_TABLE = [
  { id: '2023BCSE0142', name: 'Aarav Sharma', course: 'CS-480', conducted: 30, attended: 28, percentage: 93.3, status: 'Safe' },
  { id: '2023BCSE0102', name: 'Sophia Chen', course: 'CS-480', conducted: 30, attended: 29, percentage: 96.7, status: 'Safe' },
  { id: '2023BCSE0040', name: 'Priya Sharma', course: 'CS-480', conducted: 30, attended: 21, percentage: 70.0, status: 'At Risk' },
  { id: '2023BCSE0182', name: 'Jordan Hayes', course: 'CS-402', conducted: 32, attended: 22, percentage: 68.8, status: 'Critical' },
  { id: '2023BCSE0011', name: 'Lucas Meyer', course: 'CS-402', conducted: 32, attended: 23, percentage: 71.9, status: 'At Risk' },
  { id: '2023BCSE0035', name: 'Amira Khan', course: 'CS-480', conducted: 30, attended: 22, percentage: 73.3, status: 'At Risk' },
  { id: '2023BCSE0101', name: 'Liam Foster', course: 'CS-402', conducted: 32, attended: 27, percentage: 84.4, status: 'Safe' },
  // CS701 - Artificial Intelligence
  { id: '2023BCSE0142', name: 'Aarav Sharma', course: 'CS701', conducted: 28, attended: 26, percentage: 92.9, status: 'Safe' },
  { id: '2023BCSE0102', name: 'Sophia Chen', course: 'CS701', conducted: 28, attended: 27, percentage: 96.4, status: 'Safe' },
  { id: '2023BCSE0182', name: 'Jordan Hayes', course: 'CS701', conducted: 28, attended: 18, percentage: 64.3, status: 'Critical' },
  { id: '2023BCSE0219', name: 'Vikram Malhotra', course: 'CS701', conducted: 28, attended: 20, percentage: 71.4, status: 'At Risk' },
  // CS702 - Distributed Systems
  { id: '2023BCSE0142', name: 'Aarav Sharma', course: 'CS702', conducted: 32, attended: 29, percentage: 90.6, status: 'Safe' },
  { id: '2023BCSE0109', name: 'Neha Deshmukh', course: 'CS702', conducted: 32, attended: 30, percentage: 93.8, status: 'Safe' },
  { id: '2023BCSE0182', name: 'Jordan Hayes', course: 'CS702', conducted: 32, attended: 21, percentage: 65.6, status: 'Critical' },
  // CS703 - Machine Learning
  { id: '2023BCSE0144', name: 'Ishaan Verma', course: 'CS703', conducted: 24, attended: 22, percentage: 91.7, status: 'Safe' },
  { id: '2023BCSE0040', name: 'Priya Sharma', course: 'CS703', conducted: 24, attended: 17, percentage: 70.8, status: 'At Risk' },
  // CS704 - Database Management Systems
  { id: '2023BCSE0176', name: 'Meera Iyer', course: 'CS704', conducted: 26, attended: 24, percentage: 92.3, status: 'Safe' },
  { id: '2023BCSE0011', name: 'Lucas Meyer', course: 'CS704', conducted: 26, attended: 18, percentage: 69.2, status: 'Critical' },
];

// Graduation Candidates for Admin Certificate Generation
export const MOCK_GRADUATION_CANDIDATES = [
  { id: '2023BCSE0142', name: 'Aarav Sharma', program: 'B.Tech Computer Science & Engg', gpa: '8.85 / 10.0', creditsCompleted: 130, department: 'Department of CSE', status: 'Ready for Issuance' },
  { id: '2023BCSE0102', name: 'Sophia Chen', program: 'B.Tech Data Science', gpa: '9.12 / 10.0', creditsCompleted: 130, department: 'Department of Data Science', status: 'Ready for Issuance' },
  { id: '2023BCSE0040', name: 'Priya Sharma', program: 'B.Tech AI & Systems', gpa: '8.45 / 10.0', creditsCompleted: 130, department: 'Department of CSE', status: 'Ready for Issuance' },
  { id: '2023BCSE0101', name: 'Liam Foster', program: 'B.Tech Computer Science & Engg', gpa: '8.20 / 10.0', creditsCompleted: 130, department: 'Department of CSE', status: 'Ready for Issuance' },
];

// Admission Applications for Admin Manage Admissions
export const MOCK_ADMISSION_APPLICATIONS = [
  { id: 'APP-2026-0811', name: 'Rohan Mehta', program: 'M.Tech Artificial Intelligence', score: 'GATE 98.4 %tile', status: 'Pending Review', submitted: '2026-09-01', docs: 'Verified' },
  { id: 'APP-2026-0812', name: 'Chloe Dubois', program: 'B.Tech Data Science', score: 'JEE 94.2 %tile', status: 'Approved', submitted: '2026-08-28', docs: 'Verified' },
  { id: 'APP-2026-0813', name: 'Kwame Asante', program: 'B.Tech Cybersecurity', score: 'JEE 91.8 %tile', status: 'Pending Review', submitted: '2026-09-02', docs: 'Pending Affidavit' },
  { id: 'APP-2026-0814', name: 'Elena Rostova', program: 'M.Tech Computer Science', score: 'GATE 88.5 %tile', status: 'Pending Review', submitted: '2026-09-03', docs: 'Verified' },
  { id: 'APP-2026-0815', name: 'Tariq Al-Mansoor', program: 'B.Tech Software Engineering', score: 'JEE 72.1 %tile', status: 'Rejected', submitted: '2026-08-20', docs: 'Incomplete Prerequisites' },
];

// Anonymized Historical Help & Search Queries
export const HELP_SEARCH_QUERIES = [
  { query: 'how to pay semester fees online', role: ROLES.STUDENT, matchedFeature: 'pay-fees', frequency: 1840 },
  { query: 'check my attendance percentage CS402', role: ROLES.STUDENT, matchedFeature: 'view-attendance', frequency: 2420 },
  { query: 'download bonafide certificate pdf', role: ROLES.STUDENT, matchedFeature: 'download-certificate', frequency: 1530 },
  { query: 'track admission status document verification', role: ROLES.STUDENT, matchedFeature: 'track-admission', frequency: 980 },
  { query: 'how to mark attendance for today class', role: ROLES.FACULTY, matchedFeature: 'mark-attendance', frequency: 3120 },
  { query: 'students with low attendance below 75 percent', role: ROLES.FACULTY, matchedFeature: 'view-student-attendance', frequency: 1420 },
  { query: 'upload attendance csv spreadsheet file', role: ROLES.FACULTY, matchedFeature: 'upload-attendance', frequency: 1110 },
  { query: 'approve incoming student admissions batch', role: ROLES.ADMIN, matchedFeature: 'manage-admissions', frequency: 890 },
  { query: 'reconcile tuition fee collection stripe', role: ROLES.ADMIN, matchedFeature: 'manage-fees', frequency: 750 },
  { query: 'batch generate degrees and signed certificates', role: ROLES.ADMIN, matchedFeature: 'generate-certificates', frequency: 640 },
  { query: 'system portal usage analytics and latency', role: ROLES.ADMIN, matchedFeature: 'view-analytics', frequency: 510 },
];

// Measurable Experiment Foundation Data Structures
export const EXPERIMENT_METRICS = {
  baseline: {
    title: 'Pre-RoleWise AI Baseline (Manual Navigation & Keyword Search)',
    period: 'Fall 2025 Semester',
    discoverySuccessRate: 61.4, // %
    completionRate: 58.2, // %
    underusedDiscoveryRate: 14.8, // %
    avgTimeToFeatureSec: 184, // seconds
    unresolvedSupportTickets: 1420,
  },
  target: {
    title: 'Target Operational Benchmarks',
    period: 'Fiscal Year 2026',
    discoverySuccessRate: 92.0, // %
    completionRate: 85.0, // %
    underusedDiscoveryRate: 45.0, // %
    avgTimeToFeatureSec: 35, // seconds
    unresolvedSupportTickets: 350,
  },
  measuredAfterAssistant: {
    title: 'RoleWise AI Measured Performance (Current Cohort)',
    period: 'Fall 2026 (Live Experiment)',
    discoverySuccessRate: 94.2, // %
    completionRate: 86.4, // %
    underusedDiscoveryRate: 42.4, // % (+186% uplift)
    avgTimeToFeatureSec: 22, // seconds (-88% reduction)
    recommendationAcceptanceRate: 88.6, // %
    underusedUpliftPercent: '+186%',
    timeSavedMinutesPerWeek: 42,
  },
};

// Ambiguous query interpretations mapping across roles
export const AMBIGUOUS_QUERY_INTENTS = {
  records: {
    ambiguityTitle: 'Multiple University Record Types Detected',
    description: 'Your query matches records across several academic and financial systems. Select your exact intent:',
    optionsByRole: {
      [ROLES.STUDENT]: [
        { label: 'Lecture Attendance Records', query: 'view attendance lectures', featureId: 'view-attendance', description: 'Inspect course attendance percentages and 75% exam qualification status' },
        { label: 'Tuition Fee Payment Records', query: 'pay fees and view invoice', featureId: 'pay-fees', description: 'Review tuition installment ledger and settlement history' },
        { label: 'Official Academic Credentials & Transcripts', query: 'download bona fide certificate', featureId: 'download-certificate', description: 'Download cryptographically sealed bona fide certificates and transcripts' },
      ],
      [ROLES.FACULTY]: [
        { label: 'Daily Lecture Roll-Call Records', query: 'mark attendance CS480', featureId: 'mark-attendance', description: 'Record daily lecture roll call for today\'s assigned classes' },
        { label: 'Student Cohort Attendance Deficit Records', query: 'view student attendance at risk', featureId: 'view-student-attendance', description: 'Inspect enrolled advisees with attendance below 75%' },
        { label: 'Batch Biometric Sync Records', query: 'upload attendance csv spreadsheet', featureId: 'upload-attendance', description: 'Import RFID smartcard scanner logs' },
      ],
      [ROLES.ADMIN]: [
        { label: 'Candidate Admissions Records', query: 'manage student admissions review', featureId: 'manage-admissions', description: 'Audit candidate intake qualifications, merit lists, and seats' },
        { label: 'Tuition Fee Collection & Reconciliation Records', query: 'reconcile student fees gateway', featureId: 'manage-fees', description: 'Reconcile gateway payments and outstanding defaults' },
        { label: 'Graduate Credential Records', query: 'batch generate certificates', featureId: 'generate-certificates', description: 'Cryptographically sign and issue degrees and diplomas' },
      ],
    },
  },
  record: {
    ambiguityTitle: 'Multiple University Record Types Detected',
    description: 'Your query matches records across several academic and financial systems. Select your exact intent:',
    optionsByRole: {
      [ROLES.STUDENT]: [
        { label: 'Lecture Attendance Records', query: 'view attendance lectures', featureId: 'view-attendance', description: 'Inspect course attendance percentages and 75% exam qualification status' },
        { label: 'Tuition Fee Payment Records', query: 'pay fees and view invoice', featureId: 'pay-fees', description: 'Review tuition installment ledger and settlement history' },
        { label: 'Official Academic Credentials & Transcripts', query: 'download bona fide certificate', featureId: 'download-certificate', description: 'Download cryptographically sealed bona fide certificates and transcripts' },
      ],
      [ROLES.FACULTY]: [
        { label: 'Daily Lecture Roll-Call Records', query: 'mark attendance CS480', featureId: 'mark-attendance', description: 'Record daily lecture roll call for today\'s assigned classes' },
        { label: 'Student Cohort Attendance Deficit Records', query: 'view student attendance at risk', featureId: 'view-student-attendance', description: 'Inspect enrolled advisees with attendance below 75%' },
        { label: 'Batch Biometric Sync Records', query: 'upload attendance csv spreadsheet', featureId: 'upload-attendance', description: 'Import RFID smartcard scanner logs' },
      ],
      [ROLES.ADMIN]: [
        { label: 'Candidate Admissions Records', query: 'manage student admissions review', featureId: 'manage-admissions', description: 'Audit candidate intake qualifications, merit lists, and seats' },
        { label: 'Tuition Fee Collection & Reconciliation Records', query: 'reconcile student fees gateway', featureId: 'manage-fees', description: 'Reconcile gateway payments and outstanding defaults' },
        { label: 'Graduate Credential Records', query: 'batch generate certificates', featureId: 'generate-certificates', description: 'Cryptographically sign and issue degrees and diplomas' },
      ],
    },
  },
  status: {
    ambiguityTitle: 'Multiple Status Workflows Detected',
    description: 'Your query requests a status check. Please clarify which lifecycle item you wish to inspect:',
    optionsByRole: {
      [ROLES.STUDENT]: [
        { label: 'Admission Lifecycle Status', query: 'track admission status milestones', featureId: 'track-admission', description: 'Check onboarding milestones, merit verification, and seat status' },
        { label: 'Fee Clearance & Balance Status', query: 'check tuition fee payment status', featureId: 'pay-fees', description: 'Verify payment receipts and outstanding bursar balance' },
        { label: 'Attendance & Exam Qualification Status', query: 'view attendance threshold percentage', featureId: 'view-attendance', description: 'Check 75% mandatory attendance threshold' },
      ],
      [ROLES.FACULTY]: [
        { label: 'Today\'s Lecture Roll-Call Status', query: 'mark attendance CS480', featureId: 'mark-attendance', description: 'Check if daily attendance has been submitted to the registrar' },
        { label: 'At-Risk Student Attendance Status', query: 'view student attendance at risk', featureId: 'view-student-attendance', description: 'Identify advisees below the minimum threshold' },
      ],
      [ROLES.ADMIN]: [
        { label: 'Batch Admissions Review Status', query: 'manage student admissions review', featureId: 'manage-admissions', description: 'Review Batch 3 application allocation progress' },
        { label: 'Tuition Fee Gateway Status', query: 'manage tuition fee collection', featureId: 'manage-fees', description: 'Inspect Stripe & Campus Bank API status' },
        { label: 'Portal Telemetry & Latency Status', query: 'portal usage analytics and latency', featureId: 'view-analytics', description: 'Live server latency and active sessions' },
      ],
    },
  },
  attendance: {
    ambiguityTitle: 'Multiple Attendance Operations Available',
    description: 'Attendance encompasses multiple tools. Select which operation you need:',
    optionsByRole: {
      [ROLES.FACULTY]: [
        { label: 'Submit Daily Class Roll-Call', query: 'mark attendance CS480', featureId: 'mark-attendance', description: 'Take attendance for current lecture session' },
        { label: 'Analyze Cohort Attendance Deficits', query: 'view student attendance at risk', featureId: 'view-student-attendance', description: 'Identify students at risk of exam debarment' },
        { label: 'Batch Ingest Biometric Swipe Sheets', query: 'upload attendance csv spreadsheet', featureId: 'upload-attendance', description: 'Upload biometric card reader exports' },
      ],
      [ROLES.STUDENT]: [
        { label: 'View My Personal Course Attendance', query: 'view attendance lectures', featureId: 'view-attendance', description: 'Check personal lecture percentages and safe margins' },
        { label: 'Check 75% Exam Qualification Status', query: 'check my attendance percentage threshold', featureId: 'view-attendance', description: 'Review subject-wise margin against statutory 75% threshold' },
        { label: 'Request Certified Attendance Certificate', query: 'download attendance certificate', featureId: 'download-certificate', description: 'Download bona fide attendance certificate for visa or loan' },
      ],
      [ROLES.ADMIN]: [
        { label: 'Inspect System-Wide Attendance Telemetry', query: 'system portal usage analytics', featureId: 'view-analytics', description: 'Campus portal utilization heatmaps' },
      ],
    },
  },
  application: {
    ambiguityTitle: 'Multiple Application Services Detected',
    description: 'Your query references an application. Please select the specific service workflow:',
    optionsByRole: {
      [ROLES.STUDENT]: [
        { label: 'Track My Admission Application Milestones', query: 'where can I track my admission', featureId: 'track-admission', description: 'Inspect onboarding progress, document validation, and student ID allocation' },
        { label: 'Pay Application or Tuition Fees', query: 'how can I pay my fees', featureId: 'pay-fees', description: 'Settle outstanding fee balance online with bursar receipt' },
      ],
      [ROLES.ADMIN]: [
        { label: 'Review Incoming Candidate Applications', query: 'manage new admissions', featureId: 'manage-admissions', description: 'Audit intake qualification scores and allocate seats' },
      ],
    },
  },
  'i need help with my fees': {
    ambiguityTitle: 'Multiple Fee Services Detected',
    description: 'Your request matches multiple university fee payment and certification workflows. Clarify your task:',
    optionsByRole: {
      [ROLES.STUDENT]: [
        { label: 'Pay Semester 6 Tuition Fee Balance (₹68,500)', query: 'how can I pay my fees', featureId: 'pay-fees', description: 'Review fee breakdown and settle pending dues online with digital receipt' },
        { label: 'Download Fee Clearance / No-Dues Certificate', query: 'download certificate', featureId: 'download-certificate', description: 'Download cryptographically sealed fee clearance certificate from the bursar' },
        { label: 'Track Admission Fee Settlement', query: 'where can I track my admission', featureId: 'track-admission', description: 'Check initial seat allocation and admission fee confirmation' },
      ],
      [ROLES.ADMIN]: [
        { label: 'Manage & Reconcile Student Fee Records', query: 'how do I manage student fees', featureId: 'manage-fees', description: 'Audit student fee payment records, defaulters, and record manual settlements' },
        { label: 'View Fee Collection Telemetry', query: 'show university analytics', featureId: 'view-analytics', description: 'Inspect total ₹4.82 Cr fee collection telemetry and on-time trends' },
      ],
      [ROLES.FACULTY]: [
        { label: 'View Student Academic Standing', query: 'show student attendance', featureId: 'view-student-attendance', description: 'Faculty does not process fees; check student academic records' },
      ],
    },
  },
  'attendance problem': {
    ambiguityTitle: 'Multiple Attendance Concerns Detected',
    description: 'Your attendance inquiry involves several potential workflows. Please select your specific need:',
    optionsByRole: {
      [ROLES.STUDENT]: [
        { label: 'Check Subject-Wise Attendance & 75% Threshold', query: 'I want to check my attendance', featureId: 'view-attendance', description: 'Review your attendance across CS-402, CS-480, CS-495, MATH-380' },
      ],
      [ROLES.FACULTY]: [
        { label: 'Inspect At-Risk Students Below 75%', query: 'view student attendance at risk', featureId: 'view-student-attendance', description: 'Audit enrolled advisees with attendance deficits and issue warning notices' },
        { label: 'Take or Correct Lecture Roll-Call', query: 'how do I mark attendance', featureId: 'mark-attendance', description: 'Submit or correct attendance for today’s lecture session' },
        { label: 'Re-upload Biometric RFID Swipe Logs', query: 'I need to upload attendance', featureId: 'upload-attendance', description: 'Resolve scanner synchronization and batch import errors' },
      ],
      [ROLES.ADMIN]: [
        { label: 'Inspect Institutional Attendance Telemetry', query: 'show university analytics', featureId: 'view-analytics', description: 'Analyze campus-wide attendance patterns and at-risk rates' },
      ],
    },
  },
  'i need a certificate': {
    ambiguityTitle: 'Multiple Certificate Services Detected',
    description: 'You requested a certificate. Please select the certificate action needed:',
    optionsByRole: {
      [ROLES.STUDENT]: [
        { label: 'Download Bona Fide Student Certificate', query: 'download certificate', featureId: 'download-certificate', description: 'Instant digitally signed bona fide certificate for passport/visa/loan' },
        { label: 'Download Consolidated Grade Transcript', query: 'download certificate', featureId: 'download-certificate', description: 'Official marksheet and semester transcript with registrar seal' },
        { label: 'Download Tuition Fee Clearance Certificate', query: 'download certificate', featureId: 'download-certificate', description: 'Official no-dues verification from the university bursar' },
      ],
      [ROLES.ADMIN]: [
        { label: 'Batch Generate & Cryptographically Sign Degrees', query: 'generate a certificate', featureId: 'generate-certificates', description: 'Sign and issue official degree certificates with RSA-4096 signature' },
      ],
      [ROLES.FACULTY]: [
        { label: 'View Student Advising Credentials', query: 'show student attendance', featureId: 'view-student-attendance', description: 'Faculty does not issue certificates; inspect student records' },
      ],
    },
  },
  certificate: {
    ambiguityTitle: 'Multiple Certificate Services Detected',
    description: 'You requested a certificate. Please select the certificate action needed:',
    optionsByRole: {
      [ROLES.STUDENT]: [
        { label: 'Download Bona Fide Student Certificate', query: 'download certificate', featureId: 'download-certificate', description: 'Instant digitally signed bona fide certificate for passport/visa/loan' },
        { label: 'Download Consolidated Grade Transcript', query: 'download certificate', featureId: 'download-certificate', description: 'Official marksheet and semester transcript with registrar seal' },
        { label: 'Download Tuition Fee Clearance Certificate', query: 'download certificate', featureId: 'download-certificate', description: 'Official no-dues verification from the university bursar' },
      ],
      [ROLES.ADMIN]: [
        { label: 'Batch Generate & Cryptographically Sign Degrees', query: 'generate a certificate', featureId: 'generate-certificates', description: 'Sign and issue official degree certificates with RSA-4096 signature' },
      ],
      [ROLES.FACULTY]: [
        { label: 'View Student Advising Credentials', query: 'show student attendance', featureId: 'view-student-attendance', description: 'Faculty does not issue certificates; inspect student records' },
      ],
    },
  },
  certificates: {
    ambiguityTitle: 'Multiple Certificate Services Detected',
    description: 'You requested certificates. Please select the certificate action needed:',
    optionsByRole: {
      [ROLES.STUDENT]: [
        { label: 'Download Bona Fide Student Certificate', query: 'download certificate', featureId: 'download-certificate', description: 'Instant digitally signed bona fide certificate for passport/visa/loan' },
        { label: 'Download Consolidated Grade Transcript', query: 'download certificate', featureId: 'download-certificate', description: 'Official marksheet and semester transcript with registrar seal' },
        { label: 'Download Tuition Fee Clearance Certificate', query: 'download certificate', featureId: 'download-certificate', description: 'Official no-dues verification from the university bursar' },
      ],
      [ROLES.ADMIN]: [
        { label: 'Batch Generate & Cryptographically Sign Degrees', query: 'generate a certificate', featureId: 'generate-certificates', description: 'Sign and issue official degree certificates with RSA-4096 signature' },
      ],
      [ROLES.FACULTY]: [
        { label: 'View Student Advising Credentials', query: 'show student attendance', featureId: 'view-student-attendance', description: 'Faculty does not issue certificates; inspect student records' },
      ],
    },
  },
};

// University Workflow Scenarios Catalog for Testing & Demonstration
export const UNIVERSITY_WORKFLOW_SCENARIOS = {
  admission: {
    submitted: {
      id: 'SCN-ADM-01',
      scenario: 'submitted',
      applicantId: 'APP-2026-0814',
      applicantName: 'Elena Rostova',
      program: 'M.S. Computer Science',
      status: 'Submitted',
      milestone: 'Stage 1: Application Form & Entrance Validation',
      isAccessibleToStudent: true,
      canBeProcessedByAdmin: true,
      notes: 'Application submitted with entrance test score 88.5%; initial qualification review pending.',
    },
    under_review: {
      id: 'SCN-ADM-02',
      scenario: 'under review',
      applicantId: 'APP-2026-0811',
      applicantName: 'Rohan Mehta',
      program: 'M.S. Artificial Intelligence',
      status: 'Under Review',
      milestone: 'Stage 2: Entrance Merit Ranking & Committee Evaluation',
      isAccessibleToStudent: true,
      canBeProcessedByAdmin: true,
      notes: 'Departmental Admissions Review Board actively evaluating statement and rank #14.',
    },
    approved: {
      id: 'SCN-ADM-03',
      scenario: 'approved',
      applicantId: 'APP-2026-0812',
      applicantName: 'Chloe Dubois',
      program: 'B.S. Data Science',
      status: 'Approved',
      milestone: 'Stage 4: Seat Allotment & Matriculation',
      isAccessibleToStudent: true,
      canBeProcessedByAdmin: true,
      notes: 'Admission seat confirmed; student identity STU-2024-9102 matriculated.',
    },
    rejected: {
      id: 'SCN-ADM-04',
      scenario: 'rejected',
      applicantId: 'APP-2026-0815',
      applicantName: 'Tariq Al-Mansoor',
      program: 'B.S. Software Engineering',
      status: 'Rejected',
      milestone: 'Application Closed',
      isAccessibleToStudent: true,
      canBeProcessedByAdmin: true,
      notes: 'Entrance percentile below departmental cutoff score (72.1% < 85.0%).',
    },
    missing_application_data: {
      id: 'SCN-ADM-05',
      scenario: 'missing application data',
      applicantId: 'APP-2026-0813',
      applicantName: 'Kwame Asante',
      program: 'B.S. Cybersecurity',
      status: 'Incomplete / Missing Documents',
      milestone: 'Stage 3: Identity & Original Document Verification (Halted)',
      isAccessibleToStudent: true,
      canBeProcessedByAdmin: true,
      missingFields: ['Original High School Transcript', 'Residency Affidavit'],
      notes: 'Processing blocked pending applicant document upload.',
    },
  },
  fees: {
    pending_payment: {
      id: 'SCN-FEE-01',
      scenario: 'pending payment',
      studentId: '2023BCSE0142',
      name: 'Aarav Sharma',
      totalDue: 185000,
      balance: 185000,
      status: 'Pending',
      dueDate: '2026-09-15',
      canPay: true,
      isOverdue: false,
    },
    paid: {
      id: 'SCN-FEE-02',
      scenario: 'paid',
      studentId: '2023BCSE0102',
      name: 'Sophia Chen',
      totalDue: 185000,
      balance: 0,
      status: 'Paid',
      receiptNumber: 'REC-2026-8812',
      canPay: false,
      isOverdue: false,
    },
    overdue: {
      id: 'SCN-FEE-03',
      scenario: 'overdue',
      studentId: '2023BCSE0182',
      name: 'Jordan Hayes',
      totalDue: 185000,
      balance: 145000,
      status: 'Overdue',
      dueDate: '2026-08-30',
      lateFeeAccrued: 5000,
      canPay: true,
      isOverdue: true,
    },
    payment_failed: {
      id: 'SCN-FEE-04',
      scenario: 'payment failed',
      studentId: '2023BCSE0142',
      attemptedAmount: 185000,
      failureCode: 'GATEWAY_DECLINE_INSUFFICIENT_FUNDS',
      failureReason: 'Transaction declined by campus banking gateway. Please verify bank account / UPI balance or choose another payment method.',
      retryAvailable: true,
    },
    duplicate_payment_prevention: {
      id: 'SCN-FEE-05',
      scenario: 'duplicate payment prevention',
      studentId: '2023BCSE0102',
      status: 'Paid',
      balance: 0,
      isDuplicateBlocked: true,
      preventionMessage: 'Tuition fees for Semester 6 are already fully settled. Duplicate payment prevented by bursar idempotency key.',
    },
  },
  attendance: {
    attendance_available: {
      id: 'SCN-ATT-01',
      scenario: 'attendance available',
      studentId: 'STU-2024-9104',
      course: 'CS-480',
      percentage: 93.3,
      conducted: 30,
      attended: 28,
      status: 'Safe',
      isExceededThreshold: true,
    },
    no_attendance_data: {
      id: 'SCN-ATT-02',
      scenario: 'no attendance data',
      studentId: 'STU-2024-9999',
      course: 'ELEC-101',
      conducted: 0,
      attended: 0,
      percentage: null,
      status: 'Not Started',
      displayMessage: 'No attendance records logged yet. Course lectures commence next week.',
    },
    invalid_attendance_percentage: {
      id: 'SCN-ATT-03',
      scenario: 'invalid attendance percentage',
      studentId: 'STU-TEST-ERR',
      course: 'CS-ERR',
      conducted: 10,
      attended: 15,
      percentage: 150.0,
      isValid: false,
      validationError: 'Validation Error: Attended sessions (15) cannot exceed total conducted sessions (10). Attendance percentage cannot exceed 100%.',
    },
    duplicate_submission: {
      id: 'SCN-ATT-04',
      scenario: 'duplicate submission',
      course: 'CS-480',
      date: '2026-09-05',
      sessionSlot: '10:00 - 11:30 AM',
      alreadySubmitted: true,
      rejectionReason: 'Duplicate Roll-Call Blocked: Verified attendance for session CS-480 (Room 304, Sep 05) was already submitted to registrar at 11:28 AM.',
    },
    upload_failure: {
      id: 'SCN-ATT-05',
      scenario: 'upload failure',
      fileName: 'corrupt_biometric_log.csv',
      errorCode: 'ERR_CSV_MALFORMED_ROW_SYNTAX',
      errorDetails: 'Parser failed on row #17: Missing required RFID student identifier column. File discarded.',
      retrySupported: true,
    },
  },
  certificates: {
    certificate_not_available: {
      id: 'SCN-CERT-01',
      scenario: 'certificate not available',
      studentId: 'STU-2024-9182',
      name: 'Jordan Hayes',
      creditsCompleted: 78,
      creditsRequired: 120,
      hasPendingFees: true,
      isAvailable: false,
      blockReason: 'Degree certificate generation unavailable: Minimum 120 graduation credits required (current: 78) and bursar hold active (₹1,45,000 pending).',
    },
    generation_pending: {
      id: 'SCN-CERT-02',
      scenario: 'generation pending',
      candidateId: 'STU-2024-9105',
      name: 'Priya Sharma',
      status: 'Pending Registrar Cryptographic Signoff',
      isSigned: false,
    },
    generated: {
      id: 'SCN-CERT-03',
      scenario: 'generated',
      candidateId: 'STU-2024-9104',
      name: 'Alex Rivera',
      certNumber: 'CERT-2026-9904',
      certType: 'Official Degree Certificate (B.S.)',
      signatureHash: 'SHA256: 4e91c7a8b3f1092a48cd59e0a124bf89',
      isSigned: true,
      isAvailableForDownload: true,
    },
    download_failure: {
      id: 'SCN-CERT-04',
      scenario: 'download failure',
      certNumber: 'CERT-2026-9904',
      errorCode: 'ERR_SIGNATURE_VERIFICATION_TIMEOUT',
      errorReason: 'Cryptographic root seal validation timed out against university public ledger. Auto-retry enabled.',
      canRetry: true,
    },
  },
};

// Simulated Temporary Service Outage Scenario
export const SIMULATED_UNAVAILABLE_SCENARIOS = {
  'upload-attendance': {
    triggerKeywords: ['biometric maintenance', 'offline reader sync outage', 'simulate service outage', 'scanner failure'],
    serviceName: 'Central Biometric Ingestion Gateway',
    reason: 'Scheduled Registry Maintenance Window: The biometric smartcard reconciliation pipeline is paused for academic database index rebalancing (Maintenance Window 13:00 - 14:00 UTC).',
    retryAvailable: true,
    alternativeFeatureId: 'mark-attendance',
    alternativeTitle: 'Mark Attendance (Manual Roll-Call)',
    alternativeReason: 'You can immediately submit lecture roll-call manually via the Mark Attendance interface with zero reconciliation downtime.',
  },
};

// Override Reason Options for Rejection / Alternative Selection
export const OVERRIDE_REASON_OPTIONS = [
  'Wrong recommendation',
  'Not relevant to my current task',
  'Already completed this task',
  'Prefer another feature',
  'Other',
];

// Scenarios with Insufficient Historical Usage Evidence
export const INSUFFICIENT_EVIDENCE_KEYWORDS = [
  'supplementary exam',
  'hostel room exchange',
  'dean emergency appeal',
  'alumni transcript archive',
  'inter-campus credit transfer',
];


