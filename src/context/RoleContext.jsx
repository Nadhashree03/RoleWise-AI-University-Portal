import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ROLES,
  ANONYMIZED_USER_PROFILES,
  DEMO_ACCOUNTS,
  MOCK_FEATURES,
  FEATURE_USAGE_EVENTS,
  MOCK_STUDENT_FEE_RECORDS,
  MOCK_ADMISSION_APPLICATIONS,
  formatINR
} from '../data/mockData';
import { FeatureActionModal } from '../components/features/FeatureActionModal';
import { ToastNotification } from '../components/common/ToastNotification';
import { Lock, ArrowRight, X, ShieldAlert, KeyRound } from 'lucide-react';
import {
  authApi,
  feeApi,
  attendanceApi,
  admissionApi,
  certificateApi,
  auditApi,
  historyApi,
  overrideApi,
  analyticsApi,
} from '../services/api';

const RoleContext = createContext();

export { ROLES, DEMO_ACCOUNTS };

export const RoleProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(() => {
    const saved = localStorage.getItem('rolewise_role');
    return saved && Object.values(ROLES).includes(saved) ? saved : ROLES.STUDENT;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('rolewise_logged_in');
    return saved === 'true';
  });

  // Active feature modal state
  const [activeFeature, setActiveFeature] = useState(null);
  // Restricted access warning modal state
  const [restrictedFeature, setRestrictedFeature] = useState(null);
  // Active temporary overrides: map of featureId -> { reason, timestamp, justifiedBy }
  const [activeOverrides, setActiveOverrides] = useState(() => {
    const saved = localStorage.getItem('rolewise_active_overrides');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });
  // Override dialog state
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedOverrideReason, setSelectedOverrideReason] = useState('Institutional Dean Emergency Exemption');
  const [customOverrideNotes, setCustomOverrideNotes] = useState('');

  // 1. Persistent Student Fee Status
  const [studentFeeStatus, setStudentFeeStatus] = useState(() => {
    const saved = localStorage.getItem('rolewise_student_fee');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      status: 'Pending',
      balance: 185000,
      totalDue: 185000,
      paidAmount: 0,
      dueDate: '2026-09-15',
      receiptNumber: null,
      paymentMethod: null,
      paidAt: null,
    };
  });

  // 2. Persistent Admission Applications (Admin & Student tracker)
  const [admissionsList, setAdmissionsList] = useState(() => {
    const saved = localStorage.getItem('rolewise_admissions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_ADMISSION_APPLICATIONS;
  });

  // 3. Persistent University Fee Records (Admin)
  const [feeRecordsList, setFeeRecordsList] = useState(() => {
    const saved = localStorage.getItem('rolewise_fee_records');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_STUDENT_FEE_RECORDS;
  });

  // 4. Persistent Class Attendance Roster (Faculty)
  const [attendanceRosterList, setAttendanceRosterList] = useState(() => {
    const saved = localStorage.getItem('rolewise_attendance_roster');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: '2023BCSE0101', name: 'Liam Foster', status: 'Present', attendanceRate: '84.4%' },
      { id: '2023BCSE0102', name: 'Sophia Chen', status: 'Present', attendanceRate: '96.7%' },
      { id: '2023BCSE0182', name: 'Jordan Hayes', status: 'Absent', attendanceRate: '68.8%' },
      { id: '2023BCSE0142', name: 'Aarav Sharma', status: 'Present', attendanceRate: '93.3%' },
      { id: '2023BCSE0040', name: 'Priya Sharma', status: 'Present', attendanceRate: '70.0%' },
      { id: '2023BCSE0011', name: 'Lucas Meyer', status: 'Present', attendanceRate: '71.9%' },
    ];
  });

  // 5. Persistent Generated / Signed Certificates (Admin & Student)
  const [generatedCertificatesList, setGeneratedCertificatesList] = useState(() => {
    const saved = localStorage.getItem('rolewise_generated_certs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'AIT-CERT-2026-0941',
        certNumber: 'CERT-2026-9904',
        studentId: '2023BCSE0142',
        studentName: 'Aarav Sharma',
        certType: 'Bona Fide Student Certificate',
        issuedDate: '2026-09-01',
        validUntil: '2026-12-31',
        status: 'Generated & Cryptographically Sealed',
        signatureHash: 'SHA256: 4e91c7a8b3f1092a48cd59e0a124bf89',
        registrarSignatory: 'Marcus Ray, Controller of Examinations',
      },
    ];
  });

  // Live Audit Trail Ledger
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('rolewise_audit_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((l) => ({
            ...l,
            event: l.event || l.action || 'EVENT',
            target: l.target || l.module || 'system',
            action: l.action || l.event || 'EVENT',
            module: l.module || l.target || 'system',
            status: l.status || 'Authorized',
          }));
        }
      } catch (e) {}
    }
    return [
      ...FEATURE_USAGE_EVENTS.map((evt) => ({
        id: evt.id,
        timestamp: evt.timestamp,
        actor: `${evt.userId} (${evt.userRole})`,
        role: evt.userRole,
        event: evt.action,
        action: evt.action,
        target: evt.featureId,
        module: evt.featureId,
        status: evt.status === 'SUCCESS' ? 'Authorized' : 'Denied (403)',
        ip: evt.networkIp,
        duration: `${evt.durationMs}ms`,
        overrideReason: null,
      })),
      {
        id: 'EVT-9031',
        timestamp: '2026-09-05 08:12:30',
        actor: '2023BCSE0142 (student)',
        role: ROLES.STUDENT,
        event: 'RESTRICTED_ACCESS_ATTEMPT',
        action: 'RESTRICTED_ACCESS_ATTEMPT',
        target: 'manage-admissions',
        module: 'manage-admissions',
        status: 'Denied (403)',
        ip: '172.16.8.219 (Campus Wi-Fi)',
        duration: '45ms',
        overrideReason: null,
      },
    ];
  });

  // Change History Ledger for Change Review and Rollback
  const [changeHistory, setChangeHistory] = useState(() => {
    const saved = localStorage.getItem('rolewise_change_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'CHG-1001',
        timestamp: '2026-09-05 10:30:15',
        actor: 'Marcus Ray (admin)',
        targetFeature: 'manage-admissions',
        actionType: 'ADMISSION_DECISION_FINALIZED',
        description: 'Approved admission seat for Chloe Dubois (APP-2026-0812)',
        previousState: { applicantId: 'APP-2026-0812', status: 'Pending Review' },
        newState: { applicantId: 'APP-2026-0812', status: 'Approved' },
        overrideReason: null,
        isRolledBack: false,
      },
      {
        id: 'CHG-1000',
        timestamp: '2026-09-05 09:15:00',
        actor: 'Dr. Elena Vance (faculty)',
        targetFeature: 'upload-attendance',
        actionType: 'BATCH_ATTENDANCE_INGESTED',
        description: 'Ingested batch biometric card logs #2026-09-02 (42 records)',
        previousState: { unparsedFiles: 1, lastSync: '2026-08-28' },
        newState: { unparsedFiles: 0, lastSync: '2026-09-02' },
        overrideReason: null,
        isRolledBack: false,
      },
    ];
  });

  // Global toast feedback
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('rolewise_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('rolewise_logged_in', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('rolewise_student_fee', JSON.stringify(studentFeeStatus));
  }, [studentFeeStatus]);

  useEffect(() => {
    localStorage.setItem('rolewise_admissions', JSON.stringify(admissionsList));
  }, [admissionsList]);

  useEffect(() => {
    localStorage.setItem('rolewise_fee_records', JSON.stringify(feeRecordsList));
  }, [feeRecordsList]);

  useEffect(() => {
    localStorage.setItem('rolewise_attendance_roster', JSON.stringify(attendanceRosterList));
  }, [attendanceRosterList]);

  useEffect(() => {
    localStorage.setItem('rolewise_generated_certs', JSON.stringify(generatedCertificatesList));
  }, [generatedCertificatesList]);

  useEffect(() => {
    localStorage.setItem('rolewise_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('rolewise_change_history', JSON.stringify(changeHistory));
  }, [changeHistory]);

  useEffect(() => {
    localStorage.setItem('rolewise_active_overrides', JSON.stringify(activeOverrides));
  }, [activeOverrides]);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const syncWithBackend = async () => {
    try {
      if (currentRole === ROLES.STUDENT) {
        const feeRes = await feeApi.getMyFee().catch(() => null);
        if (feeRes?.fee) setStudentFeeStatus(feeRes.fee);

        const admRes = await admissionApi.getMyAdmission().catch(() => null);
        if (admRes?.admission) {
          setAdmissionsList((prev) => {
            const idx = prev.findIndex((a) => a.studentId === admRes.admission.studentId || a.id === admRes.admission.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], ...admRes.admission };
              return updated;
            }
            return prev;
          });
        }

        const certRes = await certificateApi.getMyCertificates().catch(() => null);
        if (certRes?.certificates && Array.isArray(certRes.certificates) && certRes.certificates.length > 0) {
          setGeneratedCertificatesList(certRes.certificates);
        }
      } else if (currentRole === ROLES.FACULTY) {
        const attRes = await attendanceApi.getCourseRoster('CS701').catch(() => null);
        if (attRes?.roster) setAttendanceRosterList(attRes.roster);
      } else if (currentRole === ROLES.ADMIN) {
        const feeRecs = await feeApi.getRecords().catch(() => null);
        if (feeRecs?.records) setFeeRecordsList(feeRecs.records);

        const admRes = await admissionApi.getAdmissions().catch(() => null);
        if (admRes?.applications) setAdmissionsList(admRes.applications);

        const attRes = await attendanceApi.getCourseRoster('CS701').catch(() => null);
        if (attRes?.roster) setAttendanceRosterList(attRes.roster);

        const certRes = await certificateApi.getCertificates().catch(() => null);
        if (certRes?.certificates) setGeneratedCertificatesList(certRes.certificates);

        const auditRes = await auditApi.getLogs({ limit: 50 }).catch(() => null);
        if (auditRes?.logs && Array.isArray(auditRes.logs)) {
          const normalizedLogs = auditRes.logs.map((l) => ({
            ...l,
            event: l.event || l.action || 'EVENT',
            target: l.target || l.module || 'system',
            action: l.action || l.event || 'EVENT',
            module: l.module || l.target || 'system',
            status: l.status || 'Authorized',
          }));
          setAuditLogs(normalizedLogs);
        }

        const histRes = await historyApi.getHistory().catch(() => null);
        if (histRes?.changes) setChangeHistory(histRes.changes);

        const ovrRes = await overrideApi.getOverrides().catch(() => null);
        if (ovrRes?.overrides) setActiveOverrides(ovrRes.overrides);
      }
    } catch (err) {
      console.warn('[Sync] Background sync with backend:', err.message);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      syncWithBackend();
    }
  }, [isLoggedIn, currentRole]);

  const logAuditEvent = ({ event, target, status, ip = '127.0.0.1 (Local Session)', overrideReason = null, details = null }) => {
    const newEntry = {
      id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: `${currentUser.name} (${currentRole})`,
      role: currentRole,
      event,
      target: target || 'system',
      status: status || 'Authorized',
      ip,
      duration: `${Math.floor(45 + Math.random() * 150)}ms`,
      overrideReason,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);

    // Dispatch to backend API asynchronously
    auditApi.logEvent({
      event,
      action: event,
      target: target || 'system',
      module: target || 'system',
      status: status || 'Authorized',
      ip,
      details,
      overrideReason,
    }).catch(() => {});
  };

  const recordAssistantAudit = ({
    eventType,
    featureId = 'discovery-assistant',
    confidence = null,
    ruleId = null,
    query = null,
    overrideReason = null,
    status = 'Authorized',
    outcome = 'SUCCESS',
    details = null,
  }) => {
    logAuditEvent({
      event: eventType,
      target: featureId,
      status: status || (outcome === 'DENIED' ? 'Denied (403)' : 'Authorized'),
      overrideReason: overrideReason || (confidence ? `Confidence: ${confidence}% | ${ruleId || 'N/A'}` : null),
      details: details || `Query: "${query || ''}" | Outcome: ${outcome}`,
    });
  };

  const recordChange = ({
    actionType,
    targetFeature,
    description,
    previousState,
    newState,
    overrideReason = null,
    rollbackHandler = null,
  }) => {
    const newChange = {
      id: `CHG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: `${currentUser.name} (${currentRole})`,
      targetFeature,
      actionType,
      description,
      previousState,
      newState,
      overrideReason,
      isRolledBack: false,
      rollbackHandler,
    };
    setChangeHistory((prev) => [newChange, ...prev]);
    logAuditEvent({
      event: actionType,
      target: targetFeature,
      status: overrideReason ? 'Authorized (Override)' : 'Authorized',
      overrideReason,
    });
  };

  const executeRollback = (changeId) => {
    const targetChange = changeHistory.find((c) => c.id === changeId);
    if (!targetChange) return;

    if (targetChange.isRolledBack) {
      showToast('Already Rolled Back', 'This action was already reverted.', 'warning');
      return;
    }

    if (targetChange.rollbackHandler) {
      try {
        targetChange.rollbackHandler();
      } catch (err) {
        console.warn('Rollback callback error:', err);
      }
    }

    // Direct state restoration based on actionType & targetFeature
    if (targetChange.targetFeature === 'pay-fees' || targetChange.actionType === 'TUITION_FEE_SETTLED') {
      const restoredFee = {
        status: 'Pending',
        balance: 185000,
        totalDue: 185000,
        paidAmount: 0,
        dueDate: '2026-09-15',
        receiptNumber: null,
        paymentMethod: null,
        paidAt: null,
      };
      setStudentFeeStatus(restoredFee);
      setFeeRecordsList((prev) =>
        prev.map((r) =>
          r.id === '2023BCSE0142' || r.id === 'STU-2024-9104'
            ? { ...r, status: 'Pending', paid: 0, pending: 185000 }
            : r
        )
      );
    } else if (targetChange.targetFeature === 'manage-admissions' || targetChange.actionType === 'ADMISSION_DECISION_FINALIZED') {
      if (targetChange.previousState?.applicantId) {
        setAdmissionsList((prev) =>
          prev.map((a) =>
            a.id === targetChange.previousState.applicantId
              ? { ...a, status: targetChange.previousState.status }
              : a
          )
        );
      }
    } else if (targetChange.targetFeature === 'manage-fees' || targetChange.actionType === 'FEE_BALANCE_SETTLED') {
      if (targetChange.previousState?.studentId) {
        setFeeRecordsList((prev) =>
          prev.map((r) =>
            r.id === targetChange.previousState.studentId
              ? {
                  ...r,
                  status: targetChange.previousState.status,
                  paid: targetChange.previousState.paid,
                  pending: targetChange.previousState.pending,
                }
              : r
          )
        );
      }
    } else if (targetChange.targetFeature === 'generate-certificates' || targetChange.actionType === 'DEGREE_CERTIFICATE_ISSUED') {
      if (targetChange.newState?.certNumber) {
        setGeneratedCertificatesList((prev) =>
          prev.filter((c) => c.certNumber !== targetChange.newState.certNumber)
        );
      }
    } else if (targetChange.targetFeature === 'mark-attendance' || targetChange.actionType === 'LECTURE_ATTENDANCE_SUBMITTED') {
      if (targetChange.previousState?.roster) {
        setAttendanceRosterList(targetChange.previousState.roster);
      }
    } else if (targetChange.actionType === 'ROLE_PERMISSION_OVERRIDE') {
      setActiveOverrides((prev) => {
        const next = { ...prev };
        delete next[targetChange.targetFeature];
        return next;
      });
    }

    setChangeHistory((prev) =>
      prev.map((c) => (c.id === changeId ? { ...c, isRolledBack: true } : c))
    );

    logAuditEvent({
      event: 'ROLLBACK_PERFORMED',
      target: targetChange.targetFeature,
      status: 'Rolled Back',
      overrideReason: `Reverted ${targetChange.id} back to previous state.`,
      details: `Rollback of ${targetChange.actionType} (${targetChange.id}): ${targetChange.description}`,
    });

    showToast(
      'Action Rolled Back',
      `Reverted "${targetChange.description}". State restored to previous snapshot.`
    );
  };

  const switchRole = (newRole) => {
    if (Object.values(ROLES).includes(newRole)) {
      setCurrentRole(newRole);
      setIsLoggedIn(true);
      setActiveFeature(null);
      setRestrictedFeature(null);
      setOverrideModalOpen(false);
      logAuditEvent({
        event: 'ROLE_SWITCH',
        target: `role:${newRole}`,
        status: 'Authorized',
        details: `Switched active perspective to ${newRole.toUpperCase()} mode`,
      });
      showToast(
        'Role Perspective Switched',
        `Switched to ${newRole.toUpperCase()} mode. Permissions and recommendations updated.`,
        'info'
      );
    }
  };

  const login = async (identifier, password) => {
    // 1. Validate empty inputs
    if (!identifier || !identifier.trim()) {
      return { success: false, error: 'Please enter your University Email or User ID.' };
    }
    if (!password || !password.trim()) {
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      // 1. Attempt real backend JWT login
      const response = await authApi.login(identifier, password);
      if (response && response.success && response.user) {
        setCurrentRole(response.user.role);
        setIsLoggedIn(true);
        setActiveFeature(null);
        setRestrictedFeature(null);
        setOverrideModalOpen(false);

        localStorage.setItem('rolewise_role', response.user.role);
        localStorage.setItem('rolewise_logged_in', 'true');

        showToast(
          `Welcome, ${response.user.name}`,
          `Successfully signed in as ${response.user.role.toUpperCase()} (JWT Authenticated) • University Student Services Portal`,
          'success'
        );

        syncWithBackend();

        return { success: true, role: response.user.role, user: response.user };
      }
    } catch (apiErr) {
      if (apiErr.status === 401 || apiErr.status === 400) {
        return { success: false, error: apiErr.message };
      }
      console.warn('[Auth] Backend API offline, utilizing fallback verification:', apiErr.message);
    }

    // 2. Local fallback if backend server is offline during offline evaluation
    const cleanId = identifier.trim().toLowerCase();
    const account = DEMO_ACCOUNTS.find(
      (acc) =>
        acc.email.toLowerCase() === cleanId ||
        acc.userId.toLowerCase() === cleanId
    );

    if (!account) {
      logAuditEvent({
        event: 'USER_LOGIN_FAILED',
        target: 'auth/login',
        status: 'Denied (401)',
        ip: '127.0.0.1 (Campus LAN)',
        actor: `Unrecognized (${identifier.trim()})`,
        role: 'unknown',
        details: `Failed authentication attempt for unrecognized credential: "${identifier.trim()}"`,
      });
      return {
        success: false,
        error: 'Unrecognized University Email or User ID. Please verify your credentials.',
      };
    }

    // 3. Validate password (case-sensitive)
    if (account.password !== password) {
      logAuditEvent({
        event: 'USER_LOGIN_FAILED',
        target: 'auth/login',
        status: 'Denied (401)',
        ip: '127.0.0.1 (Campus LAN)',
        actor: `${account.name} (${account.role})`,
        role: account.role,
        details: `Failed authentication attempt for ${account.name} (${account.userId}): Incorrect password provided.`,
      });
      return {
        success: false,
        error: 'Incorrect password. Please verify your password and try again.',
      };
    }

    // 4. Successful login
    setCurrentRole(account.role);
    setIsLoggedIn(true);
    setActiveFeature(null);
    setRestrictedFeature(null);
    setOverrideModalOpen(false);

    localStorage.setItem('rolewise_role', account.role);
    localStorage.setItem('rolewise_logged_in', 'true');

    logAuditEvent({
      event: 'USER_LOGIN_SUCCESS',
      target: 'auth/login',
      status: 'Authorized (200)',
      ip: '127.0.0.1 (Campus LAN)',
      actor: `${account.name} (${account.role})`,
      role: account.role,
      details: `User ${account.name} (${account.userId}) authenticated successfully. Granted ${account.role.toUpperCase()} session.`,
    });

    showToast(
      `Welcome, ${account.name}`,
      `Successfully signed in as ${account.role.toUpperCase()} • University Student Services Portal`,
      'success'
    );

    return { success: true, role: account.role, user: account };
  };

  const loginAs = (role) => {
    if (Object.values(ROLES).includes(role)) {
      setCurrentRole(role);
      setIsLoggedIn(true);
      localStorage.setItem('rolewise_role', role);
      localStorage.setItem('rolewise_logged_in', 'true');
    }
  };

  const logout = async () => {
    logAuditEvent({
      event: 'USER_LOGOUT',
      target: 'auth/logout',
      status: 'Terminated',
      ip: '127.0.0.1 (Campus LAN)',
      actor: `${currentUser.name} (${currentRole})`,
      role: currentRole,
      details: `User ${currentUser.name} (${currentUser.id}) voluntarily ended university session.`,
    });

    try {
      await authApi.logout();
    } catch (e) {}

    setIsLoggedIn(false);
    localStorage.setItem('rolewise_logged_in', 'false');
    setActiveFeature(null);
    setRestrictedFeature(null);
    setOverrideModalOpen(false);

    showToast(
      'Signed Out',
      'You have been securely signed out of the University Student Services Portal.',
      'info'
    );
  };

  const openFeature = (featureOrId) => {
    const feat =
      typeof featureOrId === 'string'
        ? MOCK_FEATURES.find((f) => f.id === featureOrId)
        : featureOrId;

    if (!feat) return;

    const isAuthorized = feat.allowedRoles.includes(currentRole);
    const hasOverride = !!activeOverrides[feat.id];

    if (!isAuthorized && !hasOverride) {
      setRestrictedFeature(feat);
      logAuditEvent({
        event: 'RESTRICTED_ACCESS_ATTEMPT',
        target: feat.id,
        status: 'Denied (403)',
        details: `Unauthorized access attempt to "${feat.title}". Required role: ${feat.allowedRoles[0].toUpperCase()}, Active role: ${currentRole.toUpperCase()}`,
      });
      return;
    }

    logAuditEvent({
      event: hasOverride ? 'FEATURE_ACCESSED_VIA_OVERRIDE' : 'FEATURE_ACCESSED',
      target: feat.id,
      status: hasOverride ? 'Authorized (Override)' : 'Authorized',
      overrideReason: hasOverride ? activeOverrides[feat.id].reason : null,
    });

    setActiveFeature(feat);
  };

  const closeFeature = () => {
    setActiveFeature(null);
  };

  const closeRestricted = () => {
    setRestrictedFeature(null);
  };

  const handleApplyOverride = () => {
    if (!restrictedFeature) return;

    const reasonText =
      selectedOverrideReason === 'Other / Custom Justification'
        ? customOverrideNotes || 'Special Executive Exemption'
        : selectedOverrideReason;

    setActiveOverrides((prev) => ({
      ...prev,
      [restrictedFeature.id]: {
        reason: reasonText,
        timestamp: new Date().toISOString(),
        justifiedBy: `${currentUser.name} (${currentRole})`,
      },
    }));

    logAuditEvent({
      event: 'OVERRIDE_REASON_CAPTURED',
      target: restrictedFeature.id,
      status: 'Authorized (Override)',
      overrideReason: reasonText,
      details: `Administrative override authorized for "${restrictedFeature.title}" by ${currentUser.name}: ${reasonText}`,
    });

    recordChange({
      actionType: 'ROLE_PERMISSION_OVERRIDE',
      targetFeature: restrictedFeature.id,
      description: `Administrative override executed for restricted tool "${restrictedFeature.title}"`,
      previousState: { accessible: false },
      newState: { accessible: true, justification: reasonText },
      overrideReason: reasonText,
      rollbackHandler: () => {
        setActiveOverrides((prev) => {
          const next = { ...prev };
          delete next[restrictedFeature.id];
          return next;
        });
      },
    });

    const targetFeat = restrictedFeature;
    setRestrictedFeature(null);
    setOverrideModalOpen(false);
    setActiveFeature(targetFeat);

    showToast(
      'Administrative Override Applied',
      `Temporary access granted for "${targetFeat.title}" under justification: "${reasonText}". Recorded in Audit Trail.`
    );
  };

  // State Mutators with Persistence
  const updateStudentPayment = ({ paymentMethod = 'Campus UPI / Net Banking', receiptNumber = 'REC-2026-8812', amount = 185000 } = {}) => {
    const updatedFee = {
      status: 'Paid',
      balance: 0,
      totalDue: amount,
      paidAmount: amount,
      dueDate: 'Cleared',
      receiptNumber,
      paymentMethod,
      paidAt: new Date().toISOString(),
    };
    setStudentFeeStatus(updatedFee);
    setFeeRecordsList((prev) =>
      prev.map((r) =>
        r.id === '2023BCSE0142' || r.id === 'STU-2024-9104'
          ? { ...r, status: 'Paid', paid: amount, pending: 0, dueDate: 'Cleared' }
          : r
      )
    );
  };

  const updateAdmissionStatus = (appId, newStatus) => {
    setAdmissionsList((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
  };

  const updateFeeRecord = (recId, updates) => {
    setFeeRecordsList((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, ...updates } : r))
    );
  };

  const updateAttendanceRoster = (newRoster) => {
    setAttendanceRosterList(newRoster);
  };

  const addGeneratedCertificate = (newCert) => {
    setGeneratedCertificatesList((prev) => [newCert, ...prev]);
  };

  const resetAllMockData = () => {
    localStorage.removeItem('rolewise_student_fee');
    localStorage.removeItem('rolewise_admissions');
    localStorage.removeItem('rolewise_fee_records');
    localStorage.removeItem('rolewise_attendance_roster');
    localStorage.removeItem('rolewise_generated_certs');
    localStorage.removeItem('rolewise_audit_logs');
    localStorage.removeItem('rolewise_change_history');
    localStorage.removeItem('rolewise_active_overrides');

    const defaultFee = {
      status: 'Pending',
      balance: 185000,
      totalDue: 185000,
      paidAmount: 0,
      dueDate: '2026-09-15',
      receiptNumber: null,
      paymentMethod: null,
      paidAt: null,
    };
    setStudentFeeStatus(defaultFee);
    setAdmissionsList(MOCK_ADMISSION_APPLICATIONS);
    setFeeRecordsList(MOCK_STUDENT_FEE_RECORDS);
    setAttendanceRosterList([
      { id: '2023BCSE0101', name: 'Liam Foster', status: 'Present', attendanceRate: '84.4%' },
      { id: '2023BCSE0102', name: 'Sophia Chen', status: 'Present', attendanceRate: '96.7%' },
      { id: '2023BCSE0182', name: 'Jordan Hayes', status: 'Absent', attendanceRate: '68.8%' },
      { id: '2023BCSE0142', name: 'Aarav Sharma', status: 'Present', attendanceRate: '93.3%' },
      { id: '2023BCSE0040', name: 'Priya Sharma', status: 'Present', attendanceRate: '70.0%' },
      { id: '2023BCSE0011', name: 'Lucas Meyer', status: 'Present', attendanceRate: '71.9%' },
    ]);
    setGeneratedCertificatesList([
      {
        id: 'AIT-CERT-2026-0941',
        certNumber: 'CERT-2026-9904',
        studentId: '2023BCSE0142',
        studentName: 'Aarav Sharma',
        certType: 'Bona Fide Student Certificate',
        issuedDate: '2026-09-01',
        validUntil: '2026-12-31',
        status: 'Generated & Cryptographically Sealed',
        signatureHash: 'SHA256: 4e91c7a8b3f1092a48cd59e0a124bf89',
        registrarSignatory: 'Marcus Ray, Controller of Examinations',
      },
    ]);
    setActiveOverrides({});

    logAuditEvent({
      event: 'SYSTEM_DATA_RESET',
      target: 'prototype-state',
      status: 'Authorized',
      details: 'Restored all university records to clean institutional baseline',
    });

    showToast('State Reset', 'Prototype data restored to clean university baseline.', 'info');
  };

  const baseUser = ANONYMIZED_USER_PROFILES[currentRole] || ANONYMIZED_USER_PROFILES[ROLES.STUDENT];

  const currentUser = useMemo(() => {
    if (currentRole === ROLES.STUDENT) {
      const isPaid = studentFeeStatus.status === 'Paid';
      return {
        ...baseUser,
        feeStatus: isPaid
          ? `Settled / Paid (Receipt #${studentFeeStatus.receiptNumber || 'REC-2026-8812'})`
          : `Pending Installment (₹${studentFeeStatus.balance.toLocaleString('en-IN')})`,
        stats: [
          { label: 'Overall Attendance', value: '84.4%', note: 'Safe (>75% statutory min)' },
          {
            label: 'Pending Tuition',
            value: isPaid ? '₹0.00' : `₹${studentFeeStatus.balance.toLocaleString('en-IN')}`,
            note: isPaid ? 'Paid in Full (No Dues)' : `Due in 10 days`,
          },
          { label: 'Degree Progress', value: '108 / 130 Cr', note: 'Semester 6 of 8' },
        ],
      };
    }
    if (currentRole === ROLES.ADMIN) {
      const pendingApps = admissionsList.filter((a) => a.status === 'Pending Review').length;
      const totalPendingFees = feeRecordsList.reduce((acc, r) => acc + (r.pending || 0), 0);
      const defaulterCount = feeRecordsList.filter((r) => r.status === 'Overdue').length;
      return {
        ...baseUser,
        feeStatus: `₹4.82 Cr Collected / ₹${(totalPendingFees / 100000).toFixed(2)}L Pending`,
        admissionStatus: `Batch 3 Intake: ${pendingApps} Applications in Review`,
        stats: [
          { label: 'Pending Admissions', value: `${pendingApps} In Review`, note: 'Cutoff in 6 days' },
          {
            label: 'Unreconciled Fees',
            value: `₹${totalPendingFees.toLocaleString('en-IN')}`,
            note: `${defaulterCount} Defaulter Accounts`,
          },
          {
            label: 'Certificates Queue',
            value: `${85 + generatedCertificatesList.length} Total`,
            note: `${generatedCertificatesList.length} Signed & Live`,
          },
        ],
      };
    }
    return baseUser;
  }, [currentRole, baseUser, studentFeeStatus, admissionsList, feeRecordsList, generatedCertificatesList]);

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        currentUser,
        isLoggedIn,
        login,
        switchRole,
        loginAs,
        logout,
        DEMO_ACCOUNTS,
        openFeature,
        closeFeature,
        activeFeature,
        activeOverrides,
        auditLogs,
        changeHistory,
        recordChange,
        executeRollback,
        recordAssistantAudit,
        logAuditEvent,
        showToast,
        syncWithBackend,
        studentFeeStatus,
        admissionsList,
        feeRecordsList,
        attendanceRosterList,
        generatedCertificatesList,
        updateStudentPayment,
        updateAdmissionStatus,
        updateFeeRecord,
        updateAttendanceRoster,
        addGeneratedCertificate,
        resetAllMockData,
        formatINR,
        ROLES,
      }}
    >
      {children}

      {/* Global Feature Action Modal */}
      {activeFeature && (
        <FeatureActionModal
          feature={activeFeature}
          onClose={closeFeature}
          showToast={showToast}
          recordChange={recordChange}
          activeOverride={activeOverrides[activeFeature.id]}
        />
      )}

      {/* Restricted Access Warning Dialog with Override Option */}
      {restrictedFeature && !overrideModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={closeRestricted}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-rose-500/30 p-6 shadow-2xl shadow-black text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeRestricted}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white">
              Access Restricted: {restrictedFeature.title}
            </h3>

            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This university tool is strictly designated for the{' '}
              <strong className="text-rose-300 uppercase font-semibold">
                {restrictedFeature.allowedRoles[0]}
              </strong>{' '}
              role. Your current active persona is{' '}
              <strong className="text-white capitalize">{currentRole}</strong> ({currentUser.name}).
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              Department: <span className="text-slate-200 font-medium">{restrictedFeature.department}</span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                onClick={() => setOverrideModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-semibold text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
                title="Execute documented administrative override"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Request / Execute Override</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={closeRestricted}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    switchRole(restrictedFeature.allowedRoles[0]);
                    closeRestricted();
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950"
                >
                  <span>Switch to {restrictedFeature.allowedRoles[0].toUpperCase()}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Override Reason Justification Dialog */}
      {overrideModalOpen && restrictedFeature && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setOverrideModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-amber-500/40 p-6 shadow-2xl shadow-black text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOverrideModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Execute Role-Aware Permission Override
                </h3>
                <p className="text-xs text-slate-400">
                  Target: <strong className="text-white">{restrictedFeature.title}</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Institutional governance requires all permission exceptions to be registered with a valid justification.
              This action will be logged in the immutable Audit Trail and recorded in the Change Review ledger with rollback availability.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Override Justification Reason:
                </label>
                <select
                  value={selectedOverrideReason}
                  onChange={(e) => setSelectedOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Institutional Dean Emergency Exemption">Institutional Dean Emergency Exemption</option>
                  <option value="Cross-Departmental Accreditation Audit">Cross-Departmental Accreditation Audit</option>
                  <option value="System Operational Diagnostic & Verification">System Operational Diagnostic & Verification</option>
                  <option value="Student Academic Hardship / Medical Exception">Student Academic Hardship / Medical Exception</option>
                  <option value="Temporary Proxy Authorization by Provost">Temporary Proxy Authorization by Provost</option>
                  <option value="Other / Custom Justification">Other / Custom Justification</option>
                </select>
              </div>

              {selectedOverrideReason === 'Other / Custom Justification' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Enter Documented Reason & Ticket ID:
                  </label>
                  <input
                    type="text"
                    value={customOverrideNotes}
                    onChange={(e) => setCustomOverrideNotes(e.target.value)}
                    placeholder="e.g., Council Directive #2026-904, approved by Dean"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Authorized as: <strong>{currentUser.name}</strong> ({currentRole}) • Audit ID: AUTO-LOGGED</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyOverride}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-950 flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Authorize & Open Feature</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toast && <ToastNotification toast={toast} onClose={() => setToast(null)} />}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
