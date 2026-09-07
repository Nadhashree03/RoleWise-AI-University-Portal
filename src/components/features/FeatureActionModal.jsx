import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Download,
  Upload,
  UserCheck,
  Users,
  ShieldCheck,
  CalendarCheck,
  FileCheck,
  Compass,
  Coins,
  Award,
  BarChart3,
  ExternalLink,
  Sparkles,
  RefreshCw,
  FileText,
  Search,
  Check,
  Clock,
  Send,
  Lock,
  QrCode,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  Printer,
  Calendar,
  AlertCircle,
  Filter,
  CheckSquare,
  XSquare,
  RotateCcw,
  FileSpreadsheet,
  BookOpen,
  Eye,
  HelpCircle,
  Info
} from 'lucide-react';
import { useRole, ROLES } from '../../context/RoleContext';
import { GlassCard } from '../common/GlassCard';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { feeApi, attendanceApi, admissionApi, certificateApi } from '../../services/api';
import {
  MOCK_STUDENT_FEE_RECORDS,
  MOCK_STUDENT_ATTENDANCE_TABLE,
  MOCK_GRADUATION_CANDIDATES,
  MOCK_ADMISSION_APPLICATIONS,
  FACULTY_ASSIGNED_COURSES,
  ATTENDANCE_SESSION_SLOTS,
  COURSE_STUDENT_ROSTERS,
  PRELOADED_SUBMITTED_ATTENDANCE_SESSIONS,
  formatINR
} from '../../data/mockData';

export const FeatureActionModal = ({ feature, onClose, showToast, recordChange, activeOverride }) => {
  const {
    currentRole,
    currentUser,
    logAuditEvent,
    studentFeeStatus,
    updateStudentPayment,
    feeRecordsList,
    updateFeeRecord,
    admissionsList,
    updateAdmissionStatus,
    addGeneratedCertificate,
    openFeature,
  } = useRole();

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    details: null,
    changeReview: null,
    confirmLabel: 'Confirm',
    confirmVariant: 'indigo',
    onConfirm: () => {},
  });

  // STUDENT 1: Pay Fees states
  const [feeStatus, setFeeStatus] = useState(
    studentFeeStatus?.status === 'Paid' ? 'Paid' : 'Pending'
  );
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'netbanking', 'card'
  const [simulateFailure, setSimulateFailure] = useState(false);

  // STUDENT 3: Download Certificate states
  const [downloadedCert, setDownloadedCert] = useState(null);

  // FACULTY 1: Mark Attendance interactive states
  const DEFAULT_ATTENDANCE_DATE = '2026-09-06';
  const [selectedCourseCode, setSelectedCourseCode] = useState('CS701');
  const [attendanceDate, setAttendanceDate] = useState(DEFAULT_ATTENDANCE_DATE);
  const [selectedSessionId, setSelectedSessionId] = useState('slot-1');
  const [attendanceRoster, setAttendanceRoster] = useState(() => {
    return COURSE_STUDENT_ROSTERS['CS701'] ? [...COURSE_STUDENT_ROSTERS['CS701']] : [];
  });
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [submissionSuccessInfo, setSubmissionSuccessInfo] = useState(null);

  // Persistent map of recorded sessions
  const [submittedSessionsMap, setSubmittedSessionsMap] = useState(() => {
    const saved = localStorage.getItem('rolewise_submitted_attendance');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const map = {};
    (PRELOADED_SUBMITTED_ATTENDANCE_SESSIONS || []).forEach((s) => {
      const key = `${s.courseCode}_${s.date}_${s.sessionId}`;
      map[key] = s;
    });
    return map;
  });

  useEffect(() => {
    localStorage.setItem('rolewise_submitted_attendance', JSON.stringify(submittedSessionsMap));
  }, [submittedSessionsMap]);

  // FACULTY 2: View Student Attendance states
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('All'); // 'All', 'Safe', 'At Risk', 'Critical'
  const [courseFilter, setCourseFilter] = useState('All'); // 'All', 'CS701', 'CS702', etc.

  // FACULTY 3: Upload Attendance states with real input and progress
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProcessing, setUploadProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadValidationReport, setUploadValidationReport] = useState(null);
  const fileInputRef = useRef(null);

  // ADMIN 1: Manage Admissions states
  const [applications, setApplications] = useState(() => admissionsList || MOCK_ADMISSION_APPLICATIONS);
  const [admissionSearch, setAdmissionSearch] = useState('');
  const [admissionFilter, setAdmissionFilter] = useState('All'); // 'All', 'Pending Review', 'Approved', 'Rejected'
  const [selectedDossierApp, setSelectedDossierApp] = useState(null);

  useEffect(() => {
    if (admissionsList && admissionsList.length > 0) {
      setApplications(admissionsList);
    }
  }, [admissionsList]);

  // ADMIN 2: Manage Fees states
  const [feeRecords, setFeeRecords] = useState(feeRecordsList || MOCK_STUDENT_FEE_RECORDS);
  const [feeSearch, setFeeSearch] = useState('');
  const [feeFilter, setFeeFilter] = useState('All'); // 'All', 'Pending', 'Overdue', 'Paid'
  const [selectedFeeStudent, setSelectedFeeStudent] = useState(null);

  useEffect(() => {
    if (feeRecordsList && feeRecordsList.length > 0) {
      setFeeRecords(feeRecordsList);
    }
  }, [feeRecordsList]);

  useEffect(() => {
    if (studentFeeStatus?.status) {
      setFeeStatus(studentFeeStatus.status);
    }
  }, [studentFeeStatus]);

  // ADMIN 3: Generate Certificates states
  const [selectedCandidate, setSelectedCandidate] = useState(MOCK_GRADUATION_CANDIDATES[0].id);
  const [certType, setCertType] = useState('Official Degree Certificate (B.S.)');
  const [generatedCertificate, setGeneratedCertificate] = useState(null);

  // ADMIN 4: View Analytics states
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('7d');
  const [anomalyScanning, setAnomalyScanning] = useState(false);

  if (!feature) return null;

  // Helpers
  const triggerToast = (title, message, type = 'success') => {
    if (showToast) showToast(title, message, type);
  };

  const closeConfirm = (wasCancelledByUser = false) => {
    if (confirmDialog.isOpen && wasCancelledByUser && logAuditEvent) {
      logAuditEvent({
        event: 'ACTION_CANCELLED',
        target: feature.id,
        status: 'Cancelled',
        details: `User cancelled confirmation: "${confirmDialog.title}"`,
      });
    }
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const openHighImpactConfirm = ({
    title,
    description,
    details,
    changeReview,
    confirmLabel,
    confirmVariant,
    onConfirm,
  }) => {
    if (logAuditEvent) {
      logAuditEvent({
        event: 'HIGH_IMPACT_ACTION_CONFIRMATION_REQUESTED',
        target: feature.id,
        status: 'Pending Confirmation',
        details: `${title}: ${description}`,
      });
    }
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      details,
      changeReview,
      confirmLabel,
      confirmVariant,
      onConfirm: () => {
        if (logAuditEvent) {
          logAuditEvent({
            event: 'ACTION_CONFIRMED',
            target: feature.id,
            status: 'Authorized',
            details: `Confirmed: ${title}`,
          });
          logAuditEvent({
            event: 'IMPORTANT_CHANGE_APPLIED',
            target: feature.id,
            status: 'Authorized',
            details: changeReview ? changeReview.whatChanged : title,
          });
        }
        closeConfirm(false);
        onConfirm();
      },
    });
  };

  // STUDENT: Pay Fees action
  const handleInitiatePayment = () => {
    if (simulateFailure) {
      setFeeStatus('Processing');
      setTimeout(() => {
        setFeeStatus('Pending');
        triggerToast(
          'Payment Gateway Decline',
          'Transaction declined by banking gateway: GATEWAY_DECLINE_INSUFFICIENT_FUNDS. Please retry or select another payment method.',
          'error'
        );
        if (logAuditEvent) {
          logAuditEvent({
            event: 'PAYMENT_GATEWAY_DECLINED',
            target: 'pay-fees',
            status: 'Declined',
            details: 'Simulated gateway decline for transaction amount ₹1,85,000',
          });
        }
      }, 700);
      return;
    }

    const currentFee = studentFeeStatus?.balance || 185000;
    const formattedFee = formatINR(currentFee);
    const paymentMethodLabel =
      paymentMethod === 'upi'
        ? 'Campus UPI (Google Pay / PhonePe / BHIM)'
        : paymentMethod === 'netbanking'
        ? 'Online Net Banking (SBI / HDFC / ICICI)'
        : 'Debit / Credit Card (RuPay / Visa / Mastercard)';

    openHighImpactConfirm({
      title: 'Confirm Tuition Fee Payment',
      description: 'Authorize settlement of the Semester 6 tuition balance from your selected account.',
      changeReview: {
        currentState: `Tuition Balance Due: ${formattedFee} (Status: Pending Payment)`,
        proposedAction: 'Authorize Settlement & Clear Account to ₹0 (Status: Paid)',
        whatChanged: `Settlement authorized via ${paymentMethodLabel}. Receipt #REC-2026-8812 will be generated.`,
        expectedImpact: 'Removes all academic financial holds. Clears course examination hall ticket and registration eligibility.',
        reason: 'Semester 6 Tuition Fee Settlement',
      },
      details: {
        Student: `${currentUser.name} (${currentUser.id})`,
        'Total Due': formattedFee,
        Term: 'Semester 6 (Spring 2026)',
        'Payment Method': paymentMethodLabel,
        Beneficiary: 'Apex National Institute of Technology - Bursar Office',
      },
      confirmLabel: `Authorize & Settle ${formattedFee}`,
      confirmVariant: 'emerald',
      onConfirm: () => {
        setFeeStatus('Processing');
        setTimeout(() => {
          setFeeStatus('Paid');
          if (updateStudentPayment) {
            updateStudentPayment({
              paymentMethod: paymentMethodLabel,
              receiptNumber: 'REC-2026-8812',
              amount: currentFee,
            });
          }
          triggerToast('Fee Payment Successful', 'Transaction #REC-2026-8812 settled. Tuition is now fully cleared.');
          if (recordChange) {
            recordChange({
              actionType: 'TUITION_FEE_SETTLED',
              targetFeature: 'pay-fees',
              description: `Settled Semester 6 tuition fee balance of ${formattedFee} for ${currentUser.name}`,
              previousState: { status: 'Pending', balance: formattedFee },
              newState: { status: 'Paid', balance: '₹0', receiptNumber: 'REC-2026-8812' },
              rollbackHandler: () => {
                setFeeStatus('Pending');
                triggerToast('Reversal Applied', 'Tuition settlement reversed via University Bursar Refund Adjustment Workflow (Ref #BUR-REF-2026-904).', 'warning');
              },
            });
          }
        }, 800);
      },
    });
  };

  // STUDENT: Download Certificate action
  const handleDownloadCert = (certName) => {
    if (certName.includes('Fee Clearance') && studentFeeStatus?.status !== 'Paid') {
      triggerToast(
        'Prerequisite Incomplete: Fee Clearance Required',
        'Outstanding tuition balance detected. Settle institutional dues before downloading the clearance certificate.',
        'error'
      );
      if (logAuditEvent) {
        logAuditEvent({
          event: 'CERTIFICATE_DOWNLOAD_BLOCKED',
          target: 'download-certificate',
          status: 'Denied (Prerequisite Incomplete)',
          details: 'Blocked Tuition Fee Clearance Letter download: Outstanding tuition balance of ₹1,85,000.',
        });
      }
      return;
    }
    setDownloadedCert(certName);
    triggerToast(
      'Certificate Downloaded',
      `"${certName}" generated with SHA-256 signature and registrar seal.`
    );
  };

  // FACULTY 1: Course, Date, and Session Selection Handlers
  const handleCourseChange = (courseCode) => {
    setSelectedCourseCode(courseCode);
    const initialRoster = COURSE_STUDENT_ROSTERS[courseCode] || [];
    setAttendanceRoster(initialRoster.map((s) => ({ ...s })));
    setIsEditingExisting(false);
    setSubmissionSuccessInfo(null);
  };

  const handleDateChange = (newDate) => {
    setAttendanceDate(newDate);
    setIsEditingExisting(false);
    setSubmissionSuccessInfo(null);
  };

  const handleSessionChange = (slotId) => {
    setSelectedSessionId(slotId);
    setIsEditingExisting(false);
    setSubmissionSuccessInfo(null);
  };

  // FACULTY: Student Roster State Controls
  const setStudentStatus = (studentId, newStatus) => {
    setAttendanceRoster((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const toggleAttendance = (id) => {
    setAttendanceRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' } : s))
    );
  };

  const markAllPresent = () => {
    setAttendanceRoster((prev) => prev.map((s) => ({ ...s, status: 'Present' })));
    triggerToast('Roster Updated', `All ${attendanceRoster.length} enrolled students marked Present.`);
  };

  const markAllAbsent = () => {
    setAttendanceRoster((prev) => prev.map((s) => ({ ...s, status: 'Absent' })));
    triggerToast('Roster Updated', `All ${attendanceRoster.length} enrolled students marked Absent.`);
  };

  // FACULTY: Submit Roll Call with High-Impact Confirmation Workflow & Audit Trail
  const handleSubmitRoster = () => {
    if (attendanceDate > DEFAULT_ATTENDANCE_DATE) {
      triggerToast('Invalid Date', 'Future dates cannot be selected for attendance recording.', 'error');
      return;
    }

    const currentCourse = FACULTY_ASSIGNED_COURSES.find((c) => c.code === selectedCourseCode) || FACULTY_ASSIGNED_COURSES[0];
    const currentSession = ATTENDANCE_SESSION_SLOTS.find((s) => s.id === selectedSessionId) || ATTENDANCE_SESSION_SLOTS[0];
    const currentSessionKey = `${selectedCourseCode}_${attendanceDate}_${selectedSessionId}`;
    const existingRecord = submittedSessionsMap[currentSessionKey];
    const isUpdating = Boolean(existingRecord);

    const totalStudents = attendanceRoster.length;
    const presentCount = attendanceRoster.filter((s) => s.status === 'Present').length;
    const absentCount = attendanceRoster.filter((s) => s.status === 'Absent').length;
    const percentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    openHighImpactConfirm({
      title: isUpdating ? 'Confirm Roll-Call Record Update' : 'Confirm Class Roll-Call Submission',
      description: isUpdating
        ? `Authorize update to existing lecture attendance for ${currentCourse.code} (${currentCourse.name}) on ${attendanceDate}?`
        : `Submit verified lecture attendance records for ${currentCourse.code} (${currentCourse.name}) to the Central Academic Registrar database?`,
      changeReview: {
        currentState: isUpdating
          ? `Recorded Session: ${existingRecord.presentCount} Present, ${existingRecord.absentCount} Absent (${existingRecord.submittedAt})`
          : `Draft lecture roll-call for ${currentCourse.code} (${totalStudents} students uncommitted)`,
        proposedAction: isUpdating
          ? `Update official record: ${presentCount} Present, ${absentCount} Absent (${percentage}%)`
          : `Commit official roll-call: ${presentCount} Present, ${absentCount} Absent (${percentage}%)`,
        whatChanged: `Submits class roster to Registrar; official attendance recorded for ${currentCourse.code} (${currentSession.label}) on ${attendanceDate}.`,
        expectedImpact: 'Updates real-time 75% exam qualification tracking, automated student alerts, and official faculty records.',
        reason: `Scheduled Lecture Timetable Slot (${currentSession.timeRange})`,
      },
      details: {
        'Selected Course': `${currentCourse.name}`,
        'Course Code': currentCourse.code,
        Date: attendanceDate,
        'Session Time': currentSession.label,
        'Total Students': `${totalStudents} Enrolled`,
        'Present Count': `${presentCount} Students (${percentage}%)`,
        'Absent Count': `${absentCount} Students`,
        Instructor: `${currentUser.name}`,
      },
      confirmLabel: isUpdating ? 'Update Attendance Record' : 'Confirm & Submit to Registrar',
      confirmVariant: 'emerald',
      onConfirm: () => {
        const submissionRecord = {
          courseCode: currentCourse.code,
          courseName: currentCourse.name,
          date: attendanceDate,
          sessionId: currentSession.id,
          sessionLabel: currentSession.label,
          presentCount,
          absentCount,
          totalStudents,
          submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          instructor: currentUser.name,
          key: currentSessionKey,
          rosterSnapshot: [...attendanceRoster],
        };

        setSubmittedSessionsMap((prev) => ({
          ...prev,
          [currentSessionKey]: submissionRecord,
        }));
        setSubmissionSuccessInfo(submissionRecord);
        setIsEditingExisting(false);

        // 8. AUTOMATIC AUDIT TRAIL ENTRY
        if (logAuditEvent) {
          logAuditEvent({
            event: 'Attendance Submitted',
            target: 'mark-attendance',
            status: 'Authorized',
            details: `Action: Attendance Submitted | Faculty Role: ${currentRole} | Course: ${currentCourse.code} - ${currentCourse.name} | Date: ${attendanceDate} | Session: ${currentSession.label} | Present: ${presentCount} | Absent: ${absentCount} | Timestamp: ${submissionRecord.submittedAt} | Status: Authorized`,
          });
        }

        // Change history record for rollback
        if (recordChange) {
          recordChange({
            actionType: isUpdating ? 'ATTENDANCE_RECORD_UPDATED' : 'ATTENDANCE_SUBMITTED',
            targetFeature: 'mark-attendance',
            description: `Submitted verified roll-call for ${currentCourse.code} (${presentCount} Present, ${absentCount} Absent) on ${attendanceDate} [${currentSession.label}] by ${currentUser.name}`,
            previousState: isUpdating ? existingRecord : { submitted: false, key: currentSessionKey },
            newState: submissionRecord,
            overrideReason: activeOverride ? activeOverride.reason : null,
            rollbackHandler: () => {
              setSubmittedSessionsMap((prev) => {
                const copy = { ...prev };
                if (isUpdating) {
                  copy[currentSessionKey] = existingRecord;
                } else {
                  delete copy[currentSessionKey];
                }
                return copy;
              });
              setSubmissionSuccessInfo(null);
            },
          });
        }

        triggerToast(
          'Attendance Successfully Submitted',
          `Roll call for ${currentCourse.code} (${presentCount} Present, ${absentCount} Absent) synced with Registrar.`
        );
      },
    });
  };

  // FACULTY 2: Export Attendance Cohort CSV
  const handleExportAttendanceCSV = () => {
    const dataToExport = MOCK_STUDENT_ATTENDANCE_TABLE.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        s.id.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        s.course.toLowerCase().includes(attendanceSearch.toLowerCase());
      const matchesCourse = courseFilter === 'All' || s.course.toLowerCase() === courseFilter.toLowerCase();
      const matchesStatus =
        attendanceFilter === 'All'
          ? true
          : attendanceFilter === 'Safe'
          ? s.percentage >= 75
          : attendanceFilter === 'At Risk'
          ? s.percentage >= 70 && s.percentage < 75
          : s.percentage < 70;
      return matchesSearch && matchesCourse && matchesStatus;
    });

    const headers = ['Student ID', 'Student Name', 'Course', 'Conducted', 'Attended', 'Percentage', 'Status'];
    const rows = dataToExport.map((s) => [
      s.id,
      `"${s.name}"`,
      s.course,
      s.conducted,
      s.attended,
      `${s.percentage}%`,
      s.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Attendance_Report_${courseFilter}_${attendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Roster Exported', `Exported ${dataToExport.length} student attendance records to CSV.`);
  };

  // FACULTY: Upload Attendance handlers
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setUploadError(
        `Invalid file extension "${file.name.substring(file.name.lastIndexOf('.'))}". Only .csv, .xlsx, and .xls spreadsheet files are supported.`
      );
      setSelectedFile(null);
      setUploadSuccess(false);
      setUploadValidationReport(null);
      triggerToast('Unsupported File Type', 'Please choose a .csv, .xlsx, or .xls attendance sheet.', 'error');
      if (logAuditEvent) {
        logAuditEvent({
          event: 'FILE_UPLOAD_REJECTED',
          target: 'upload-attendance',
          status: 'Rejected',
          details: `Rejected file "${file.name}": Unsupported format. Expected CSV/XLSX.`,
        });
      }
      return;
    }

    setUploadError(null);
    setUploadSuccess(false);
    setSelectedFile({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      records: 42,
      rawFile: file,
    });
    setUploadValidationReport({
      totalRows: 42,
      validRows: 41,
      syntaxWarnings: 1,
      warningDetail: 'Row #17: Trailing delimiter sanitized to standard RFC-4180 format.',
      encoding: 'UTF-8',
      format: fileName.endsWith('.csv') ? 'Comma-Separated Values (CSV)' : 'Excel Spreadsheet (OOXML)',
    });
    triggerToast('File Validated', `Loaded "${file.name}" (42 records detected). Ready for ingestion.`);
  };

  const handleLoadSampleCSV = () => {
    setUploadError(null);
    setUploadSuccess(false);
    setSelectedFile({
      name: 'attendance_CS480_sep2026.csv',
      size: '14.2 KB',
      records: 42,
      isSample: true,
    });
    setUploadValidationReport({
      totalRows: 42,
      validRows: 41,
      syntaxWarnings: 1,
      warningDetail: 'Row #17: Trailing delimiter sanitized to standard RFC-4180 format.',
      encoding: 'UTF-8',
      format: 'Comma-Separated Values (CSV)',
    });
    triggerToast('Sample CSV Loaded', 'Loaded attendance_CS480_sep2026.csv (42 records ready for ingestion).');
  };

  const handleProcessUpload = () => {
    const fileName = selectedFile?.name || 'attendance_CS480_sep2026.csv';
    openHighImpactConfirm({
      title: 'Confirm Batch Attendance Ingestion',
      description: `Process and ingest parsed attendance records from "${fileName}" into the central registrar database?`,
      changeReview: {
        currentState: `${selectedFile?.records || 42} uncommitted swipe records in staging memory`,
        proposedAction: 'Batch commit attendance events to institutional registrar ledger',
        whatChanged: `Ingests records from "${fileName}" with automated syntax sanitization.`,
        expectedImpact: 'Synchronizes classroom attendance for course CS-480 with zero conflicts.',
        reason: 'Automated Attendance Sheet Ingestion',
      },
      details: {
        File: fileName,
        'Validated Records': `${selectedFile?.records || 42} Student Swipe Events`,
        'Syntax Repairs': '1 Auto-sanitized delimiter (Row #17)',
        Target: 'Central Academic Systems',
      },
      confirmLabel: 'Confirm Batch Ingestion',
      confirmVariant: 'indigo',
      onConfirm: async () => {
        setUploadProcessing(true);
        setUploadProgress(15);
        setTimeout(() => setUploadProgress(45), 250);
        setTimeout(() => setUploadProgress(80), 550);

        try {
          let fileToUpload = selectedFile?.rawFile;
          if (!fileToUpload) {
            // Generate valid sample CSV file
            const sampleRows = ['studentId,name,course,status'];
            for (let i = 1; i <= 42; i++) {
              sampleRows.push(`2023BCSE${String(i + 100).padStart(4, '0')},Student ${i},CS701,${i % 7 === 0 ? 'Absent' : 'Present'}`);
            }
            fileToUpload = new File([sampleRows.join('\n')], fileName, { type: 'text/csv' });
          }

          const apiRes = await attendanceApi.uploadAttendanceFile(fileToUpload);
          setUploadProgress(100);
          setUploadProcessing(false);
          setUploadSuccess(true);
          setUploadValidationReport({
            totalRows: apiRes.totalRows || 42,
            validRows: apiRes.validRows || 41,
            syntaxWarnings: apiRes.syntaxWarnings || 1,
            warningDetail: apiRes.warningDetail || 'Row #17: Trailing delimiter sanitized to standard RFC-4180 format.',
            encoding: 'UTF-8',
            format: fileName.endsWith('.csv') ? 'Comma-Separated Values (CSV)' : 'Excel Spreadsheet',
          });
          triggerToast('Batch Ingested', `Successfully ingested ${apiRes.validRows} records into registrar database.`);
        } catch (uploadErr) {
          console.warn('[Upload] Backend upload error, using local fallback:', uploadErr.message);
          setUploadProgress(100);
          setUploadProcessing(false);
          setUploadSuccess(true);
          triggerToast('Batch Ingested', '42 biometric swipe records ingested with zero reconciliation conflicts.');
        }

        if (recordChange) {
          recordChange({
            actionType: 'BATCH_ATTENDANCE_INGESTED',
            targetFeature: 'upload-attendance',
            description: `Batch ingested biometric swipe records from file "${fileName}"`,
            previousState: { ingested: false },
            newState: { ingested: true, file: fileName, recordsCount: 42 },
            overrideReason: activeOverride ? activeOverride.reason : null,
            rollbackHandler: () => {
              setUploadSuccess(false);
              setSelectedFile(null);
              setUploadProgress(0);
              setUploadValidationReport(null);
            },
          });
        }
      },
    });
  };

  // ADMIN: Approve Admission
  const handleApproveAdmission = (app) => {
    const prevStatus = app.status;
    openHighImpactConfirm({
      title: 'Confirm Admission Seat Allocation',
      description: `Authorize official admission seat confirmation for ${app.name}?`,
      changeReview: {
        currentState: `Application Status: ${prevStatus} (Merit Score: ${app.score})`,
        proposedAction: `Approve Candidate & Allocate Official Seat in ${app.program}`,
        whatChanged: `Status updated from "${prevStatus}" to "Approved". Student ID allocation queued.`,
        expectedImpact: `Consumes 1 intake seat in ${app.program}. Issues formal university admission letter.`,
        reason: `Merit Committee Review for Batch 3`,
      },
      details: {
        Applicant: `${app.name} (${app.id})`,
        Program: app.program,
        'Merit Score': app.score,
        'Document Status': app.docs,
      },
      confirmLabel: 'Confirm Seat Approval',
      confirmVariant: 'emerald',
      onConfirm: () => {
        setApplications((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, status: 'Approved' } : a))
        );
        if (updateAdmissionStatus) {
          updateAdmissionStatus(app.id, 'Approved');
        }
        triggerToast('Admission Approved', `Seat allocated to ${app.name} for ${app.program}.`);
        if (recordChange) {
          recordChange({
            actionType: 'ADMISSION_DECISION_FINALIZED',
            targetFeature: 'manage-admissions',
            description: `Approved admission seat allocation for applicant ${app.name} (${app.id}) in ${app.program}`,
            previousState: { applicantId: app.id, applicantName: app.name, status: prevStatus },
            newState: { applicantId: app.id, applicantName: app.name, status: 'Approved' },
            overrideReason: activeOverride ? activeOverride.reason : null,
            rollbackHandler: () => {
              setApplications((prev) =>
                prev.map((a) => (a.id === app.id ? { ...a, status: prevStatus } : a))
              );
              if (updateAdmissionStatus) {
                updateAdmissionStatus(app.id, prevStatus);
              }
            },
          });
        }
      },
    });
  };

  // ADMIN: Reject Admission
  const handleRejectAdmission = (app) => {
    const prevStatus = app.status;
    openHighImpactConfirm({
      title: 'Confirm Admission Rejection',
      description: `Decline admission application for ${app.name}? This will notify the applicant.`,
      changeReview: {
        currentState: `Application Status: ${prevStatus} (Merit Score: ${app.score})`,
        proposedAction: `Decline Candidate Application (Status: Rejected)`,
        whatChanged: `Status updated from "${prevStatus}" to "Rejected".`,
        expectedImpact: `Candidate disqualified from intake cohort. Seat retained in open merit quota.`,
        reason: `Incomplete documentation or merit rank below department cutoff`,
      },
      details: {
        Applicant: `${app.name} (${app.id})`,
        Program: app.program,
        'Merit Score': app.score,
      },
      confirmLabel: 'Confirm Rejection',
      confirmVariant: 'rose',
      onConfirm: () => {
        setApplications((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, status: 'Rejected' } : a))
        );
        if (updateAdmissionStatus) {
          updateAdmissionStatus(app.id, 'Rejected');
        }
        triggerToast('Application Rejected', `Application for ${app.name} marked as Rejected.`, 'warning');
        if (recordChange) {
          recordChange({
            actionType: 'ADMISSION_DECISION_FINALIZED',
            targetFeature: 'manage-admissions',
            description: `Declined admission application for ${app.name} (${app.id}) in ${app.program}`,
            previousState: { applicantId: app.id, applicantName: app.name, status: prevStatus },
            newState: { applicantId: app.id, applicantName: app.name, status: 'Rejected' },
            overrideReason: activeOverride ? activeOverride.reason : null,
            rollbackHandler: () => {
              setApplications((prev) =>
                prev.map((a) => (a.id === app.id ? { ...a, status: prevStatus } : a))
              );
              if (updateAdmissionStatus) {
                updateAdmissionStatus(app.id, prevStatus);
              }
            },
          });
        }
      },
    });
  };

  // ADMIN: Send Fee Reminder
  const handleSendReminder = (rec) => {
    triggerToast('Payment Notice Dispatched', `Automated fee reminder email sent to ${rec.name} (${rec.id}).`);
  };

  // ADMIN: Mark Fee Paid
  const handleMarkFeePaid = (rec) => {
    const prevRec = { ...rec };
    const pendingFormatted = formatINR(rec.pending);
    openHighImpactConfirm({
      title: 'Record Offline Fee Clearance',
      description: `Record manual settlement for outstanding balance of ${pendingFormatted}?`,
      changeReview: {
        currentState: `Student Account: ${rec.status} (Pending Balance: ${pendingFormatted})`,
        proposedAction: `Mark Account Fully Settled & Cleared (Status: Paid)`,
        whatChanged: `Records manual bursar receipt settlement for student ${rec.name} (${rec.id}).`,
        expectedImpact: `Clears bursar hold; lifts course registration restrictions immediately.`,
        reason: `Bank Demand Draft / NEFT Settlement Confirmation`,
      },
      details: {
        Student: `${rec.name} (${rec.id})`,
        Program: rec.program,
        'Pending Amount': pendingFormatted,
      },
      confirmLabel: `Mark Settled & Cleared (${pendingFormatted})`,
      confirmVariant: 'emerald',
      onConfirm: () => {
        setFeeRecords((prev) =>
          prev.map((r) => (r.id === rec.id ? { ...r, paid: r.total, pending: 0, status: 'Paid', dueDate: 'Cleared' } : r))
        );
        if (updateFeeRecord) {
          updateFeeRecord(rec.id, { paid: rec.total, pending: 0, status: 'Paid', dueDate: 'Cleared' });
        }
        if (rec.id === '2023BCSE0142' && updateStudentPayment) {
          updateStudentPayment({ amount: rec.total, receiptNumber: 'REC-2026-8812' });
        }
        triggerToast('Balance Cleared', `Fee ledger updated for ${rec.name}. Status set to Paid.`);
        if (recordChange) {
          recordChange({
            actionType: 'FEE_BALANCE_SETTLED',
            targetFeature: 'manage-fees',
            description: `Manually settled outstanding tuition balance of ${pendingFormatted} for student ${rec.name} (${rec.id})`,
            previousState: { studentId: rec.id, name: rec.name, paid: prevRec.paid, pending: prevRec.pending, status: prevRec.status },
            newState: { studentId: rec.id, name: rec.name, paid: rec.total, pending: 0, status: 'Paid' },
            overrideReason: activeOverride ? activeOverride.reason : null,
            rollbackHandler: () => {
              setFeeRecords((prev) =>
                prev.map((r) => (r.id === rec.id ? { ...prevRec } : r))
              );
              if (updateFeeRecord) {
                updateFeeRecord(rec.id, { ...prevRec });
              }
            },
          });
        }
      },
    });
  };

  // ADMIN: Generate Certificate
  const handleGenerateCertificate = () => {
    const candidate = MOCK_GRADUATION_CANDIDATES.find((c) => c.id === selectedCandidate);
    if (!candidate) return;

    openHighImpactConfirm({
      title: 'Confirm Credential Issuance & Signing',
      description: `Apply cryptographic root key RSA-4096 signature to issue "${certType}" for candidate ${candidate.name}?`,
      changeReview: {
        currentState: `Candidate Status: Ready for Issuance (Unsigned Credential)`,
        proposedAction: `Cryptographically Sign & Concur Official Degree (${certType})`,
        whatChanged: `Generates immutable diploma serial number and SHA-256 registrar cryptographic signature.`,
        expectedImpact: `Permanent academic qualification conferred upon graduate; verified on university registry.`,
        reason: `Convocation Directorate Verification`,
      },
      details: {
        Candidate: `${candidate.name} (${candidate.id})`,
        Program: candidate.program,
        'Cumulative GPA': candidate.gpa.toString(),
        Credential: certType,
        Authority: 'Central Registrar & Credential Directorate',
      },
      confirmLabel: 'Sign & Issue Credential',
      confirmVariant: 'emerald',
      onConfirm: () => {
        const certData = {
          candidate,
          certType,
          issueDate: 'September 05, 2026',
          certNumber: `CERT-${Date.now().toString().slice(-6)}`,
          signatureHash: 'SHA256: 4e91c7a8b3f1092a48cd59e0a124bf89',
        };
        setGeneratedCertificate(certData);
        if (addGeneratedCertificate) {
          addGeneratedCertificate({
            id: `AIT-CERT-${Date.now().toString().slice(-4)}`,
            certNumber: certData.certNumber,
            studentId: candidate.id,
            studentName: candidate.name,
            certType,
            issuedDate: '2026-09-06',
            validUntil: 'Lifetime',
            status: 'Generated & Cryptographically Sealed',
            signatureHash: certData.signatureHash,
            registrarSignatory: 'Marcus Ray, Controller of Examinations',
          });
        }
        triggerToast('Certificate Issued', `Digitally signed ${certType} for ${candidate.name}.`);
        if (recordChange) {
          recordChange({
            actionType: 'CREDENTIAL_ISSUED',
            targetFeature: 'generate-certificates',
            description: `Generated and digitally signed ${certType} for graduate ${candidate.name} (${candidate.id}) [${certData.certNumber}]`,
            previousState: { issued: false, candidateId: candidate.id },
            newState: { issued: true, candidateId: candidate.id, certNumber: certData.certNumber, certType },
            overrideReason: activeOverride ? activeOverride.reason : null,
            rollbackHandler: () => {
              setGeneratedCertificate(null);
            },
          });
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-indigo-500/30 shadow-2xl shadow-black/90 p-6 text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {feature.category}
              </span>
              <span className="text-[10px] text-slate-500">Dept: {feature.department}</span>
              {activeOverride && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Override Active: {activeOverride.reason}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {feature.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Interactive Content */}
        <div className="py-5 space-y-5 flex-1">
          {/* =========================================================================
              STUDENT 1: PAY FEES
          ========================================================================= */}
          {feature.id === 'pay-fees' && (
            <div className="space-y-4">
              {/* Fee Amount & Current Status Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 to-slate-900/80 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">Total Semester 6 Tuition Balance</div>
                  <div className="text-3xl font-extrabold text-white mt-0.5">
                    {feeStatus === 'Paid' ? '₹0' : '₹1,85,000'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Student Account: <span className="text-white font-medium">{currentUser.name} ({currentUser.id})</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block mb-1">Payment Status</span>
                  {feeStatus === 'Paid' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Paid & Cleared
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Clock className="w-3.5 h-3.5" />
                      Pending Payment (Due Sep 15)
                    </span>
                  )}
                </div>
              </div>

              {/* Itemized Breakdown */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Itemized Fee Breakdown (Academic Term 2025-26)
                </h4>
                <div className="space-y-2 bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                    <span>Undergraduate Tuition (Semester 6 - Core Engineering)</span>
                    <span className="font-mono text-white font-semibold">₹1,40,000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                    <span>AI & Distributed Systems Lab Access</span>
                    <span className="font-mono text-white font-semibold">₹30,000</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-300">
                    <span>Campus Health & Student Life Amenities</span>
                    <span className="font-mono text-white font-semibold">₹15,000</span>
                  </div>
                </div>
              </div>

              {feeStatus === 'Paid' ? (
                /* Success Official Receipt View */
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 text-emerald-300 space-y-4 shadow-xl">
                  <div className="flex items-start justify-between pb-3 border-b border-emerald-500/20">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                        Apex National Institute of Technology
                      </span>
                      <h4 className="text-sm font-bold text-white">Office of the Registrar & Financial Controller</h4>
                      <p className="text-[11px] text-slate-400">Official Student Tuition & Institutional Dues Receipt</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Paid & Settled
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Receipt Number</span>
                      <span className="font-mono font-bold text-white">#REC-2026-8812</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Transaction Reference</span>
                      <span className="font-mono font-bold text-white">SBI-UPI-9821408812</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Date of Settlement</span>
                      <span className="font-medium text-slate-200">September 06, 2026</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Student Register No.</span>
                      <span className="font-mono font-bold text-white">{currentUser.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Degree Program</span>
                      <span className="font-medium text-slate-200">B.Tech CSE (Semester 6)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Amount Settled</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">₹1,85,000</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 text-[11px] text-slate-300">
                    Amount in words: <strong className="text-emerald-300">One Lakh Eighty-Five Thousand Rupees Only</strong> • Institutional Balance: <strong className="text-emerald-400">₹0 (Nil Dues)</strong>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => triggerToast('Receipt Downloaded', 'Official receipt #REC-2026-8812.pdf downloaded with registrar cryptographic seal.')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Official Receipt (PDF)</span>
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono">Bursar Ledger Synchronized</span>
                  </div>
                </div>
              ) : (
                /* Payment Options & Confirmation Flow Trigger */
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-semibold text-slate-300">Select Indian Payment Method:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        paymentMethod === 'upi'
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 mb-1 text-emerald-400" />
                      <div>UPI Payment</div>
                      <span className="text-[10px] text-slate-500">GPay, PhonePe, Paytm, BHIM</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        paymentMethod === 'netbanking'
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Coins className="w-4 h-4 mb-1 text-cyan-400" />
                      <div>Net Banking</div>
                      <span className="text-[10px] text-slate-500">SBI, HDFC, ICICI, Axis</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1 text-indigo-400" />
                      <div>Debit / Credit Card</div>
                      <span className="text-[10px] text-slate-500">RuPay, Visa, Mastercard</span>
                    </button>
                  </div>

                  {/* Failure Simulation Option */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <span className="text-slate-400">Simulation: Test Gateway Failure Scenario</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simulateFailure}
                        onChange={(e) => setSimulateFailure(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                      />
                      <span className={`text-[11px] font-semibold ${simulateFailure ? 'text-amber-400' : 'text-slate-500'}`}>
                        {simulateFailure ? 'Simulate Gateway Decline' : 'Normal Transaction'}
                      </span>
                    </label>
                  </div>

                  <button
                    disabled={feeStatus === 'Processing'}
                    onClick={handleInitiatePayment}
                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.01]"
                  >
                    {feeStatus === 'Processing' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Settle Request...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Proceed to Pay ₹1,85,000 (Opens Confirmation)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              STUDENT 2: VIEW ATTENDANCE
          ========================================================================= */}
          {feature.id === 'view-attendance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400">Cumulative Semester Attendance</span>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-0.5">82.4%</div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Institutional Standard: <strong className="text-slate-300">75.0% Minimum</strong>
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-xs text-amber-300 font-medium">Exam Eligibility Alert</span>
                  <div className="text-lg font-bold text-white mt-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>CS-495 Warning</span>
                  </div>
                  <span className="text-[11px] text-amber-400/90 mt-0.5 block">
                    Current: 77.78% (Within 2 absences of debarment)
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Subject-Wise Attendance Breakdown
                </h4>
                <div className="space-y-2">
                  {[
                    { code: 'CS-402', name: 'Distributed Systems', attended: 26, total: 32, pct: '81.25%', status: 'Safe', buffer: 'Can miss 2 classes' },
                    { code: 'CS-480', name: 'Neural Networks & Deep Learning', attended: 28, total: 30, pct: '93.33%', status: 'Excellent', buffer: 'Safe margin' },
                    { code: 'CS-495', name: 'Senior Capstone Project', attended: 14, total: 18, pct: '77.78%', status: 'Warning', buffer: 'Must attend next class' },
                    { code: 'MATH-380', name: 'Stochastic Processes', attended: 24, total: 28, pct: '85.71%', status: 'Safe', buffer: 'Can miss 3 classes' },
                  ].map((sub, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{sub.code}: {sub.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {sub.attended} Attended / {sub.total} Conducted • <span className="text-cyan-400">{sub.buffer}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-mono font-bold text-sm ${sub.status === 'Warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {sub.pct}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          sub.status === 'Warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STUDENT 3: DOWNLOAD CERTIFICATE
          ========================================================================= */}
          {feature.id === 'download-certificate' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Official documents issued with cryptographic SHA-256 validation and university digital seal.
              </p>

              <div className="space-y-3">
                {[
                  { name: 'Bona Fide Student Certificate', format: 'PDF (Official Seal)', desc: 'Valid for visa, passport, internships, and educational transit passes.' },
                  { name: 'Official Grade Transcript (Sem 1-6)', format: 'PDF (Registrar Signed)', desc: 'Certified cumulative GPA: 3.88 with departmental honors note.' },
                  { name: 'Tuition Fee Clearance Letter', format: 'PDF (Bursar Verified)', desc: 'Clearance certificate confirming all institutional dues are settled.' },
                ].map((cert, idx) => {
                  const isFeeClearance = cert.name.includes('Fee Clearance');
                  const isFeeLocked = isFeeClearance && studentFeeStatus?.status !== 'Paid';

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isFeeLocked
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-slate-900/80 border-slate-800'
                      } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <FileCheck className={`w-4 h-4 ${isFeeLocked ? 'text-amber-400' : 'text-cyan-400'}`} />
                          <span>{cert.name}</span>
                          {isFeeLocked && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Prerequisite: Settle Dues
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{cert.desc}</p>
                        <span className="text-[10px] text-slate-500 font-mono">Format: {cert.format}</span>
                        {isFeeLocked && (
                          <div className="text-[11px] text-amber-400/90 pt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Outstanding tuition balance of ₹1,85,000 must be cleared before requesting clearance.</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isFeeLocked ? (
                          <button
                            onClick={() => {
                              onClose();
                              openFeature('pay-fees');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Fees Now</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDownloadCert(cert.name)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {downloadedCert && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    Successfully downloaded <strong>{downloadedCert}</strong>. Valid SHA-256 seal attached.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              STUDENT 4: TRACK ADMISSION
          ========================================================================= */}
          {feature.id === 'track-admission' && (() => {
            const studentApp = admissionsList?.find((a) => a.id === 'ADM-2024-CS-0941' || a.name === currentUser.name) || {
              id: 'ADM-2024-CS-0941',
              name: currentUser.name,
              program: 'B.Tech CSE (Class of 2028)',
              status: 'Approved',
              score: '98.4 %ile',
              docs: 'All Verified',
            };

            return (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Application Reference</span>
                    <div className="text-base font-mono font-bold text-cyan-300">{studentApp.id}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {studentApp.program}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    studentApp.status === 'Approved'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : studentApp.status === 'Rejected'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {studentApp.status === 'Approved' ? 'Enrolled & Verified' : studentApp.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    Admission Lifecycle Progress Timeline
                  </h4>
                  <div className="space-y-3 relative pl-6 border-l-2 border-slate-800 ml-2">
                    {[
                      { stage: 'Stage 1: Online Application & Fee Submission', date: 'May 10, 2024', done: true, desc: 'Application form, entrance scores, and statements validated.' },
                      { stage: 'Stage 2: Entrance Merit Ranking & Allocation', date: 'June 02, 2024', done: true, desc: `Entrance score ${studentApp.score} allocated to Department of Computer Science.` },
                      { stage: 'Stage 3: Identity & Original Document Verification', date: 'June 18, 2024', done: true, desc: 'Transcripts, identity proof, and affidavits certified by registrar.' },
                      { stage: 'Stage 4: Seat Allotment & Matriculation', date: 'July 01, 2024', done: studentApp.status === 'Approved', desc: `Official student ID ${currentUser.id} matriculated.` },
                      { stage: 'Stage 5: Final Degree Clearance & Convocation', date: 'Scheduled May 2028', done: false, desc: 'Final registrar audit prior to convocation ceremony.' },
                    ].map((step, idx) => (
                      <div key={idx} className="relative group">
                        <div
                          className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center ${
                            step.done ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {step.done ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                        </div>
                        <div className="text-xs font-bold text-white">{step.stage}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{step.desc}</div>
                        <span className="text-[10px] text-indigo-400 font-mono">{step.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* =========================================================================
              FACULTY 1: MARK ATTENDANCE (INTERACTIVE UNIVERSITY WORKFLOW)
          ========================================================================= */}
          {feature.id === 'mark-attendance' && (() => {
            const currentCourse = FACULTY_ASSIGNED_COURSES.find((c) => c.code === selectedCourseCode) || FACULTY_ASSIGNED_COURSES[0];
            const currentSession = ATTENDANCE_SESSION_SLOTS.find((s) => s.id === selectedSessionId) || ATTENDANCE_SESSION_SLOTS[0];
            const currentSessionKey = `${selectedCourseCode}_${attendanceDate}_${selectedSessionId}`;
            const existingRecord = submittedSessionsMap[currentSessionKey];
            const isAlreadyRecorded = Boolean(existingRecord);
            const isFutureDate = attendanceDate > DEFAULT_ATTENDANCE_DATE;

            const totalStudents = attendanceRoster.length;
            const presentCount = attendanceRoster.filter((s) => s.status === 'Present').length;
            const absentCount = attendanceRoster.filter((s) => s.status === 'Absent').length;
            const rate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
            const isJustSubmitted = submissionSuccessInfo && submissionSuccessInfo.key === currentSessionKey;

            return (
              <div className="space-y-4">
                {/* 1. SELECTION CONTROLS PANEL: Course, Date, and Session */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 shadow-lg space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Lecture Timetable & Roll-Call Configuration
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Faculty: <span className="text-cyan-300 font-semibold">{currentUser.name}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Course Selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Select Assigned Course</span>
                      </label>
                      <select
                        value={selectedCourseCode}
                        onChange={(e) => handleCourseChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/90 border border-indigo-500/40 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium cursor-pointer"
                      >
                        {FACULTY_ASSIGNED_COURSES.map((course) => (
                          <option key={course.code} value={course.code} className="bg-slate-950 text-white">
                            {course.code} — {course.name}
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] text-slate-400 truncate">
                        Room: <span className="text-indigo-300 font-medium">{currentCourse.room}</span> • {currentCourse.term}
                      </div>
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Attendance Date</span>
                      </label>
                      <input
                        type="date"
                        value={attendanceDate}
                        max={DEFAULT_ATTENDANCE_DATE}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className={`w-full px-3 py-1.5 bg-slate-950/90 border rounded-xl text-xs text-white focus:outline-none focus:ring-1 font-mono cursor-pointer ${
                          isFutureDate
                            ? 'border-rose-500 text-rose-300 focus:ring-rose-400'
                            : 'border-indigo-500/40 focus:ring-cyan-400'
                        }`}
                      />
                      <div className="text-[10px] text-slate-400">
                        {isFutureDate ? (
                          <span className="text-rose-400 font-semibold">Future dates restricted</span>
                        ) : (
                          <span>Default: {DEFAULT_ATTENDANCE_DATE} (Today)</span>
                        )}
                      </div>
                    </div>

                    {/* Session / Period Selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Session / Lecture Period</span>
                      </label>
                      <select
                        value={selectedSessionId}
                        onChange={(e) => handleSessionChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/90 border border-indigo-500/40 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium cursor-pointer"
                      >
                        {ATTENDANCE_SESSION_SLOTS.map((slot) => (
                          <option key={slot.id} value={slot.id} className="bg-slate-950 text-white">
                            {slot.label}
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] text-amber-300/90 font-mono truncate">
                        Slot: {currentSession.timeRange}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. ACTIVE SESSION OVERVIEW BANNER */}
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono font-bold">
                      {currentCourse.code}
                    </span>
                    <div>
                      <div className="font-bold text-white">{currentCourse.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Date: <span className="text-slate-200 font-mono font-medium">{attendanceDate}</span> • {currentSession.label}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                      Venue: <strong className="text-slate-200">{currentCourse.room}</strong>
                    </span>
                    {isAlreadyRecorded && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {isEditingExisting ? 'Edit Mode Active' : 'Recorded Session'}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. FUTURE DATE WARNING BANNER */}
                {isFutureDate && (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <div>
                      <span className="font-bold">Invalid Future Date Selected:</span> Attendance cannot be recorded for future calendar dates ({attendanceDate}). Please select today ({DEFAULT_ATTENDANCE_DATE}) or an earlier lecture date.
                    </div>
                  </div>
                )}

                {/* 4. SUCCESS STATE BANNER */}
                {isJustSubmitted && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 text-emerald-300 space-y-3 shadow-xl animate-in fade-in">
                    <div className="flex items-start justify-between pb-2 border-b border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-white">Attendance Successfully Submitted</h4>
                          <span className="text-[11px] text-emerald-400/90 font-mono">
                            Synchronized with Central Academic Registrar & Examination Directorate
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Committed
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-emerald-500/20">
                        <span className="text-[10px] text-slate-400 block">Course</span>
                        <span className="font-bold text-white">{submissionSuccessInfo.courseCode}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-emerald-500/20">
                        <span className="text-[10px] text-slate-400 block">Date & Session</span>
                        <span className="font-mono text-white text-[11px]">{submissionSuccessInfo.date}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-emerald-500/20">
                        <span className="text-[10px] text-slate-400 block">Present Count</span>
                        <span className="font-bold text-emerald-400 text-sm">{submissionSuccessInfo.presentCount} Students</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-emerald-500/20">
                        <span className="text-[10px] text-slate-400 block">Absent Count</span>
                        <span className="font-bold text-rose-400 text-sm">{submissionSuccessInfo.absentCount} Students</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400">
                        Recorded at {submissionSuccessInfo.submittedAt} by {submissionSuccessInfo.instructor}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSubmissionSuccessInfo(null)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors text-xs"
                        >
                          Review Roster
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. DUPLICATE SESSION WARNING & UPDATE HANDLING */}
                {isAlreadyRecorded && !isEditingExisting && !isJustSubmitted && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white">Attendance has already been recorded for this session.</h4>
                        <p className="text-[11px] text-amber-300/90 leading-relaxed">
                          Official lecture attendance for <strong>{currentCourse.code} ({currentCourse.name})</strong> on <strong>{attendanceDate}</strong> during <strong>{currentSession.label}</strong> was previously committed to the Central Registrar.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/20 text-xs flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400">Existing Record Snapshot:</span>
                        <div className="font-mono text-white text-xs">
                          {existingRecord.presentCount} Present • {existingRecord.absentCount} Absent ({existingRecord.totalStudents} Enrolled)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Submitted: {existingRecord.submittedAt} by {existingRecord.instructor || 'Dr. Elena Vance'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEditingExisting(true)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Review & Update Attendance</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. DYNAMIC ATTENDANCE SUMMARY KPI BAR */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Students</span>
                    <div className="text-2xl font-extrabold text-white mt-0.5">{totalStudents}</div>
                    <span className="text-[10px] text-slate-500 font-mono">100% Enrolled</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Present</span>
                    <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">{presentCount}</div>
                    <span className="text-[10px] text-emerald-300/80 font-mono">{rate}% Attending</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center">
                    <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider block">Absent</span>
                    <div className="text-2xl font-extrabold text-rose-400 mt-0.5">{absentCount}</div>
                    <span className="text-[10px] text-rose-300/80 font-mono">{100 - rate}% Deficit</span>
                  </div>
                </div>

                {/* 7. ROSTER BULK ACTIONS & HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Class Roster ({totalStudents} Students)</span>
                    </span>
                    {isEditingExisting && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Editing Existing Submission
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={markAllPresent}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Mark All Present</span>
                    </button>
                    <button
                      onClick={markAllAbsent}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <XSquare className="w-3.5 h-3.5" />
                      <span>Mark All Absent</span>
                    </button>
                  </div>
                </div>

                {/* 8. INTERACTIVE STUDENT ROSTER LIST */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {attendanceRoster.map((student) => {
                    const isPresent = student.status === 'Present';
                    return (
                      <div
                        key={student.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isPresent
                            ? 'bg-slate-900/80 border-slate-800/90 hover:border-emerald-500/40'
                            : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isPresent ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <div>
                            <div className="font-semibold text-white">{student.name}</div>
                            <span className="text-[11px] text-cyan-300 font-mono">{student.id}</span>
                          </div>
                        </div>

                        {/* Present / Absent Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setStudentStatus(student.id, 'Present')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isPresent
                                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/30 border border-emerald-400'
                                : 'bg-slate-900/80 text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-slate-800'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Present</span>
                          </button>

                          <button
                            onClick={() => setStudentStatus(student.id, 'Absent')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              !isPresent
                                ? 'bg-rose-600 text-white font-extrabold shadow-md shadow-rose-600/30 border border-rose-500'
                                : 'bg-slate-900/80 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-slate-800'
                            }`}
                          >
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 9. SUBMIT ATTENDANCE WORKFLOW BUTTON */}
                <div className="pt-2">
                  <button
                    disabled={isFutureDate || (isAlreadyRecorded && !isEditingExisting)}
                    onClick={handleSubmitRoster}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                      isFutureDate
                        ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                        : isAlreadyRecorded && !isEditingExisting
                        ? 'bg-slate-900 text-amber-400 border border-amber-500/30 hover:bg-amber-950/30'
                        : isAlreadyRecorded && isEditingExisting
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-950 hover:scale-[1.01]'
                        : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white shadow-indigo-950 hover:scale-[1.01]'
                    }`}
                  >
                    {isFutureDate ? (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>Cannot Submit Attendance for Future Date ({attendanceDate})</span>
                      </>
                    ) : isAlreadyRecorded && !isEditingExisting ? (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>Session Recorded (Click "Review & Update Attendance" Above to Modify)</span>
                      </>
                    ) : isAlreadyRecorded && isEditingExisting ? (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        <span>Commit Updated Roll-Call ({presentCount} Present, {absentCount} Absent) — Opens Confirmation</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Submit Roll-Call to Central Registrar ({presentCount} Present, {absentCount} Absent) — Opens Confirmation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* =========================================================================
              FACULTY 2: VIEW STUDENT ATTENDANCE (INTERACTIVE COHORT ANALYTICS)
          ========================================================================= */}
          {feature.id === 'view-student-attendance' && (() => {
            const filteredAttendance = MOCK_STUDENT_ATTENDANCE_TABLE.filter((s) => {
              const matchesSearch =
                s.name.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
                s.id.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
                s.course.toLowerCase().includes(attendanceSearch.toLowerCase());
              const matchesCourse = courseFilter === 'All' || s.course.toLowerCase() === courseFilter.toLowerCase();
              const matchesStatus =
                attendanceFilter === 'All'
                  ? true
                  : attendanceFilter === 'Safe'
                  ? s.percentage >= 75
                  : attendanceFilter === 'At Risk'
                  ? s.percentage >= 70 && s.percentage < 75
                  : s.percentage < 70;
              return matchesSearch && matchesCourse && matchesStatus;
            });

            const totalCohort = filteredAttendance.length;
            const safeCount = filteredAttendance.filter((s) => s.percentage >= 75).length;
            const atRiskCount = filteredAttendance.filter((s) => s.percentage < 75).length;

            return (
              <div className="space-y-4">
                {/* Filter Controls Bar */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Course Filter Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Course:</span>
                      <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium cursor-pointer"
                      >
                        <option value="All">All Courses</option>
                        <option value="CS701">CS701 - Artificial Intelligence</option>
                        <option value="CS702">CS702 - Distributed Systems</option>
                        <option value="CS703">CS703 - Machine Learning</option>
                        <option value="CS704">CS704 - Database Management Systems</option>
                        <option value="CS-480">CS-480 - Neural Networks</option>
                        <option value="CS-402">CS-402 - Distributed Systems</option>
                      </select>
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={attendanceSearch}
                        onChange={(e) => setAttendanceSearch(e.target.value)}
                        placeholder="Search student name, roll number, or code..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    </div>

                    {/* Export CSV Button */}
                    <button
                      onClick={handleExportAttendanceCSV}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export Roster CSV</span>
                    </button>
                  </div>

                  {/* Status Filter Tabs & Summary */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                      {['All', 'Safe', 'At Risk', 'Critical'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setAttendanceFilter(f)}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            attendanceFilter === f
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {f === 'Safe' ? 'Safe (≥ 75%)' : f === 'At Risk' ? 'At Risk (70-74%)' : f === 'Critical' ? 'Critical (< 70%)' : 'All Students'}
                        </button>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Showing <strong className="text-white">{totalCohort}</strong> records</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">{safeCount} Safe</span>
                      <span>•</span>
                      <span className="text-rose-400 font-semibold">{atRiskCount} Flagged</span>
                    </div>
                  </div>
                </div>

                {/* Student Attendance Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3">Student Name & Roll No</th>
                        <th className="px-4 py-3">Course</th>
                        <th className="px-4 py-3">Classes (Attended / Held)</th>
                        <th className="px-4 py-3">Percentage</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredAttendance.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                            No student attendance records matched the active filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredAttendance.map((stu) => (
                          <tr key={`${stu.id}-${stu.course}`} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-semibold text-white">{stu.name}</div>
                              <div className="text-[10px] text-cyan-300 font-mono">{stu.id}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                                {stu.course}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono">
                              {stu.attended} / {stu.conducted}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold">
                              <span className={stu.percentage < 70 ? 'text-rose-400' : stu.percentage < 75 ? 'text-amber-400' : 'text-emerald-400'}>
                                {stu.percentage}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                  stu.status === 'Critical' || stu.percentage < 70
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : stu.status === 'At Risk' || stu.percentage < 75
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                }`}
                              >
                                {stu.percentage < 70 ? 'Critical' : stu.percentage < 75 ? 'At Risk' : 'Safe'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {stu.percentage < 75 ? (
                                <button
                                  onClick={() => {
                                    triggerToast('Deficiency Notice Dispatched', `Formal statutory attendance warning sent to ${stu.name} (${stu.id}) for ${stu.course}.`);
                                    if (logAuditEvent) {
                                      logAuditEvent({
                                        event: 'ATTENDANCE_WARNING_DISPATCHED',
                                        target: 'view-student-attendance',
                                        status: 'Authorized',
                                        details: `Dispatched deficiency alert to ${stu.name} (${stu.id}) in ${stu.course} (Attendance: ${stu.percentage}%)`,
                                      });
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-semibold border border-rose-500/30 transition-colors flex items-center gap-1"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Send Warning</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-500">In Good Standing</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* =========================================================================
              FACULTY 3: UPLOAD ATTENDANCE
          ========================================================================= */}
          {feature.id === 'upload-attendance' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Upload batch attendance records from offline spreadsheets (.csv, .xlsx, .xls) or RFID biometric logs into the central database.
              </p>

              {/* Hidden native file input for actual OS file dialog */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload Dropzone / Picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/70 rounded-2xl p-6 text-center transition-colors bg-slate-900/40 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Click to Browse or Drag & Drop Attendance Spreadsheet
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Accepted file formats: <strong className="text-cyan-300">.csv, .xlsx, .xls</strong> (Max 10 MB)
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  Columns: StudentID, CourseCode, SessionDate, AttendanceStatus
                </div>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    Browse Local File
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSampleCSV();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Load Demo CSV (42 Records)
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {uploadError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <div className="flex-1">
                    <strong className="block font-bold">File Validation Error</strong>
                    <span>{uploadError}</span>
                  </div>
                </div>
              )}

              {/* Selected File & Ingestion Report */}
              {selectedFile && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-white">{selectedFile.name}</span>
                        <div className="text-[11px] text-slate-400">
                          {selectedFile.size} • {uploadValidationReport?.format || 'Spreadsheet File'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      Validated ({selectedFile.records} records)
                    </span>
                  </div>

                  {uploadValidationReport && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Total records parsed:</span>
                        <span className="font-mono text-white font-bold">{uploadValidationReport.totalRows}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Valid student swipe events:</span>
                        <span className="font-mono text-emerald-400 font-bold">{uploadValidationReport.validRows}</span>
                      </div>
                      <div className="flex justify-between text-amber-300">
                        <span>Auto-sanitized syntax warnings:</span>
                        <span className="font-mono font-bold">{uploadValidationReport.syntaxWarnings} ({uploadValidationReport.warningDetail})</span>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar during Ingestion */}
                  {uploadProcessing && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Ingesting and synchronizing with Registrar Database...</span>
                        <span className="font-mono text-indigo-400 font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {uploadSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Batch Attendance Ingestion Complete</div>
                      <div className="text-[11px] text-emerald-400/90">
                        Processed Batch #2026-09-06: 42 attendance events synchronized with zero conflicts.
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 pl-7 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setUploadSuccess(false);
                        setSelectedFile(null);
                        setUploadProgress(0);
                        setUploadValidationReport(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      Upload Another File
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  disabled={!selectedFile || uploadProcessing}
                  onClick={handleProcessUpload}
                  className={`w-full py-2.5 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                    selectedFile && !uploadProcessing
                      ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950 hover:scale-[1.01]'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  {uploadProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Ingesting & Validating Biometric Log Events...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Ingest {selectedFile ? selectedFile.records : '42'} Records into Registrar Database (Opens Confirmation)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* =========================================================================
              ADMIN 1: MANAGE ADMISSIONS
          ========================================================================= */}
          {feature.id === 'manage-admissions' && (() => {
            const filteredApps = applications.filter((app) => {
              const matchesSearch =
                app.name.toLowerCase().includes(admissionSearch.toLowerCase()) ||
                app.id.toLowerCase().includes(admissionSearch.toLowerCase()) ||
                app.program.toLowerCase().includes(admissionSearch.toLowerCase());
              const matchesFilter = admissionFilter === 'All' ? true : app.status === admissionFilter;
              return matchesSearch && matchesFilter;
            });

            return (
              <div className="space-y-4">
                {/* Search and Status Filter Header */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={admissionSearch}
                        onChange={(e) => setAdmissionSearch(e.target.value)}
                        placeholder="Search applicant name, application ID, or degree..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                      {['All', 'Pending Review', 'Approved', 'Rejected'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setAdmissionFilter(f)}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            admissionFilter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Showing <strong className="text-white">{filteredApps.length}</strong> of {applications.length} Applicants</span>
                    <span className="text-emerald-400 font-semibold">
                      {applications.filter((a) => a.status === 'Approved').length} Approved • {applications.filter((a) => a.status === 'Pending Review').length} Pending • {applications.filter((a) => a.status === 'Rejected').length} Rejected
                    </span>
                  </div>
                </div>

                {/* Applications Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3">Applicant & ID</th>
                        <th className="px-4 py-3">Degree Program</th>
                        <th className="px-4 py-3">Merit Score</th>
                        <th className="px-4 py-3">Documents</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredApps.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                            No candidates matched the current search or filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredApps.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-semibold text-white">{app.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{app.id}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-200">{app.program}</td>
                            <td className="px-4 py-3 font-mono font-bold text-cyan-300">{app.score}</td>
                            <td className="px-4 py-3 text-[11px] text-slate-400">{app.docs}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  app.status === 'Approved'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : app.status === 'Rejected'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedDossierApp(app)}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium transition-colors flex items-center gap-1 border border-slate-700"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Dossier</span>
                                </button>
                                {app.status === 'Pending Review' ? (
                                  <>
                                    <button
                                      onClick={() => handleApproveAdmission(app)}
                                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectAdmission(app)}
                                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-slate-500 italic">Decided</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Candidate Dossier Inspection Modal */}
                {selectedDossierApp && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/40 text-xs space-y-3 shadow-xl">
                    <div className="flex items-start justify-between pb-2 border-b border-indigo-500/20">
                      <div>
                        <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">
                          Admissions Committee Dossier Verification
                        </div>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {selectedDossierApp.name} <span className="text-slate-400 font-mono text-xs">({selectedDossierApp.id})</span>
                        </h4>
                      </div>
                      <button
                        onClick={() => setSelectedDossierApp(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                      <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Applied Program</span>
                        <strong className="text-white">{selectedDossierApp.program}</strong>
                      </div>
                      <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Entrance Exam Score</span>
                        <strong className="text-cyan-300 font-mono">{selectedDossierApp.score}</strong>
                      </div>
                      <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">12th Board Marks</span>
                        <strong className="text-white">94.8% (PCM Aggregate)</strong>
                      </div>
                      <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Quota / Category</span>
                        <strong className="text-white">General All-India Merit</strong>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                      <span className="text-slate-300 font-semibold block text-xs">Document Verification Checklist:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-400">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Class 10 & 12 Board Certificates (Verified)</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> National Entrance Scorecard (Verified)</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Government Identity & Domicile (Verified)</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Medical Fitness & Anti-Ragging Undertaking</span>
                      </div>
                    </div>

                    {selectedDossierApp.status === 'Pending Review' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            handleRejectAdmission(selectedDossierApp);
                            setSelectedDossierApp(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
                        >
                          Reject Application
                        </button>
                        <button
                          onClick={() => {
                            handleApproveAdmission(selectedDossierApp);
                            setSelectedDossierApp(null);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                        >
                          Approve & Allocate Seat
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* =========================================================================
              ADMIN 2: MANAGE FEES
          ========================================================================= */}
          {feature.id === 'manage-fees' && (() => {
            const totalBilled = feeRecords.reduce((acc, r) => acc + (r.total || 0), 0);
            const totalCollected = feeRecords.reduce((acc, r) => acc + (r.paid || 0), 0);
            const totalPending = feeRecords.reduce((acc, r) => acc + (r.pending || 0), 0);
            const overdueCount = feeRecords.filter((r) => r.status === 'Overdue').length;
            const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : '0.0';

            const filteredFeeRecords = feeRecords.filter((rec) => {
              const matchesSearch =
                rec.name.toLowerCase().includes(feeSearch.toLowerCase()) ||
                rec.id.toLowerCase().includes(feeSearch.toLowerCase()) ||
                rec.program.toLowerCase().includes(feeSearch.toLowerCase());
              const matchesFilt = feeFilter === 'All' ? true : rec.status === feeFilter;
              return matchesSearch && matchesFilt;
            });

            return (
              <div className="space-y-4">
                {/* Fee Administration Summary Dynamic KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-xs text-slate-400">Total Billed Fees</span>
                    <div className="text-xl font-bold text-white mt-0.5">{formatINR(totalBilled)}</div>
                    <span className="text-[10px] text-slate-500">{feeRecords.length} Student Accounts</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-xs text-emerald-300">Total Collected</span>
                    <div className="text-xl font-bold text-white mt-0.5">{formatINR(totalCollected)}</div>
                    <span className="text-[10px] text-emerald-400">{collectionRate}% Collection Rate</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <span className="text-xs text-amber-300">Outstanding Balance</span>
                    <div className="text-xl font-bold text-white mt-0.5">{formatINR(totalPending)}</div>
                    <span className="text-[10px] text-amber-400">{overdueCount} Overdue Defaulters</span>
                  </div>
                </div>

                {/* Student Fee Records Table */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={feeSearch}
                        onChange={(e) => setFeeSearch(e.target.value)}
                        placeholder="Search student fee accounts by name, register no, or program..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                      {['All', 'Pending', 'Overdue', 'Paid'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setFeeFilter(f)}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            feeFilter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3">Student & ID</th>
                          <th className="px-4 py-3">Program</th>
                          <th className="px-4 py-3">Total Due</th>
                          <th className="px-4 py-3">Balance Pending</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredFeeRecords.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                              No student fee records found matching active criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredFeeRecords.map((rec) => (
                            <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="font-semibold text-white">{rec.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{rec.id}</div>
                              </td>
                              <td className="px-4 py-3 text-slate-300">{rec.program}</td>
                              <td className="px-4 py-3 font-mono">{formatINR(rec.total)}</td>
                              <td className="px-4 py-3 font-mono font-bold">
                                <span className={rec.pending > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                                  {formatINR(rec.pending)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    rec.status === 'Paid'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : rec.status === 'Overdue'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}
                                >
                                  {rec.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setSelectedFeeStudent(rec)}
                                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-semibold border border-slate-700 flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Breakdown</span>
                                  </button>
                                  {rec.pending > 0 ? (
                                    <>
                                      <button
                                        onClick={() => handleSendReminder(rec)}
                                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700"
                                      >
                                        Reminder
                                      </button>
                                      <button
                                        onClick={() => handleMarkFeePaid(rec)}
                                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold"
                                      >
                                        Mark Paid
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[11px] text-emerald-400 font-medium">Cleared</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Student Fee Ledger Breakdown Modal */}
                  {selectedFeeStudent && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/40 text-xs space-y-3 shadow-xl">
                      <div className="flex items-start justify-between pb-2 border-b border-indigo-500/20">
                        <div>
                          <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">
                            Official Bursar Account Ledger Breakdown
                          </div>
                          <h4 className="text-sm font-bold text-white mt-0.5">
                            {selectedFeeStudent.name} <span className="text-slate-400 font-mono text-xs">({selectedFeeStudent.id})</span>
                          </h4>
                          <span className="text-[11px] text-slate-400">{selectedFeeStudent.program}</span>
                        </div>
                        <button
                          onClick={() => setSelectedFeeStudent(null)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[11px]">
                        <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                          <span>Tuition Fee (Core Department Curriculum)</span>
                          <span className="font-mono text-white font-semibold">{formatINR(Math.round(selectedFeeStudent.total * 0.7))}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                          <span>Laboratory, Computing & Research Equipment</span>
                          <span className="font-mono text-white font-semibold">{formatINR(Math.round(selectedFeeStudent.total * 0.18))}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                          <span>University Central Library & Digital Database Subscriptions</span>
                          <span className="font-mono text-white font-semibold">{formatINR(Math.round(selectedFeeStudent.total * 0.08))}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-300">
                          <span>Student Health Center & Campus Sports Amenities</span>
                          <span className="font-mono text-white font-semibold">{formatINR(Math.round(selectedFeeStudent.total * 0.04))}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Total Billed / Paid:</span>
                          <span className="font-mono text-white font-bold">{formatINR(selectedFeeStudent.total)}</span>
                          <span className="text-slate-500"> (Paid: {formatINR(selectedFeeStudent.paid)})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">Outstanding Dues:</span>
                          <span className={`font-mono font-bold ${selectedFeeStudent.pending > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {formatINR(selectedFeeStudent.pending)}
                          </span>
                        </div>
                      </div>

                      {selectedFeeStudent.pending > 0 && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                          <button
                            onClick={() => {
                              handleMarkFeePaid(selectedFeeStudent);
                              setSelectedFeeStudent(null);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <Coins className="w-3.5 h-3.5" />
                            <span>Mark Settled & Clear Balance</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* =========================================================================
              ADMIN 3: GENERATE CERTIFICATES
          ========================================================================= */}
          {feature.id === 'generate-certificates' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Select graduation candidate to issue cryptographically signed degree or passing certificates.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Graduation Candidate:
                  </label>
                  <select
                    value={selectedCandidate}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {MOCK_GRADUATION_CANDIDATES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.program} (GPA {c.gpa})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Certificate Credential Type:
                  </label>
                  <select
                    value={certType}
                    onChange={(e) => setCertType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Official Degree Certificate (B.S.)">Official Degree Certificate (B.S.)</option>
                    <option value="Provisional Degree & Passing Credential">Provisional Degree & Passing Credential</option>
                    <option value="Dean's Honors Citation of Excellence">Dean's Honors Citation of Excellence</option>
                  </select>
                </div>
              </div>

              {generatedCertificate ? (
                /* Visual Certificate Preview */
                <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950/40 border border-indigo-500/40 space-y-4 shadow-xl text-center">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-cyan-300">
                      <Award className="w-7 h-7" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                      University Directorate of Academic Credentials
                    </span>
                    <h3 className="text-lg font-extrabold text-white mt-1">
                      {generatedCertificate.certType}
                    </h3>
                    <p className="text-xs text-slate-300 mt-2">
                      Conferred upon <strong className="text-cyan-300 text-sm">{generatedCertificate.candidate.name}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      For successful completion of the curriculum in {generatedCertificate.candidate.program} (Cumulative GPA: {generatedCertificate.candidate.gpa})
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 text-left">
                    <div>
                      <div>Certificate #: <span className="font-mono text-white">{generatedCertificate.certNumber}</span></div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{generatedCertificate.signatureHash}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white rounded-lg">
                        <QrCode className="w-6 h-6 text-slate-950" />
                      </div>
                      <button
                        onClick={() => triggerToast('Certificate Saved', `Downloaded ${generatedCertificate.certType}.pdf.`)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleGenerateCertificate}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 transition-all hover:scale-[1.01]"
                >
                  <Award className="w-4 h-4" />
                  <span>Generate & Cryptographically Sign Certificate (Opens Confirmation)</span>
                </button>
              )}
            </div>
          )}

          {/* =========================================================================
              ADMIN 4: VIEW ANALYTICS
          ========================================================================= */}
          {feature.id === 'view-analytics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Campus Infrastructure Telemetry</span>
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  {['Today', '7d', '30d'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setAnalyticsTimeframe(t)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        analyticsTimeframe === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Active Sessions</span>
                  <div className="text-xl font-bold text-white mt-0.5">1,420</div>
                  <span className="text-[10px] text-emerald-400">+12% Peak</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Server Latency</span>
                  <div className="text-xl font-bold text-cyan-300 mt-0.5">24ms</div>
                  <span className="text-[10px] text-emerald-400">Optimal</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400">AI Accuracy</span>
                  <div className="text-xl font-bold text-indigo-300 mt-0.5">94.2%</div>
                  <span className="text-[10px] text-indigo-400">Rule Match</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400">System Health</span>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">99.98%</div>
                  <span className="text-[10px] text-slate-500">Zero Outages</span>
                </div>
              </div>

              {/* Role Query Distribution Bar */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-slate-300">
                  <span>Role Discovery Engagement Breakdown</span>
                  <span className="text-slate-500">142,890 Total Queries</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-950 overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: '64%' }} title="Students: 64%" />
                  <div className="h-full bg-indigo-500" style={{ width: '26%' }} title="Faculty: 26%" />
                  <div className="h-full bg-amber-500" style={{ width: '10%' }} title="Admins: 10%" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Student (64%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Faculty (26%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Admin (10%)</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-indigo-300">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Rule Engine Telemetry: Zero Hallucination Risk (Deterministic)</span>
                </div>
                <button
                  disabled={anomalyScanning}
                  onClick={() => {
                    setAnomalyScanning(true);
                    setTimeout(() => {
                      setAnomalyScanning(false);
                      triggerToast('Diagnostic Scan Clean', 'Scanned 14,280 endpoint logs: Zero security or authorization anomalies.');
                    }, 1000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-white font-medium flex items-center gap-1.5"
                >
                  {anomalyScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{anomalyScanning ? 'Scanning...' : 'Run Diagnostics'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Active Persona: <strong className="text-slate-300 capitalize">{currentRole}</strong> ({currentUser.name})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Close Interface
          </button>
        </div>
      </div>

      {/* Reusable High-Impact Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        details={confirmDialog.details}
        changeReview={confirmDialog.changeReview}
        confirmLabel={confirmDialog.confirmLabel}
        confirmVariant={confirmDialog.confirmVariant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => closeConfirm(true)}
      />
    </div>
  );
};
