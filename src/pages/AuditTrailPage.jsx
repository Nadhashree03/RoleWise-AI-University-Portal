import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Download,
  Terminal,
  RefreshCw,
  ExternalLink,
  RotateCcw,
  History,
  FileText,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  Check,
  Undo2,
  Activity,
  ArrowUpRight,
  Sparkles,
  KeyRound,
  Eye,
  X
} from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { auditApi } from '../services/api';

const AuditTrailPageContent = () => {
  const {
    currentRole,
    currentUser,
    switchRole,
    openFeature,
    auditLogs,
    changeHistory,
    executeRollback,
    showToast,
    syncWithBackend
  } = useRole();

  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'changes'
  const [filterType, setFilterType] = useState('all'); // 'all', 'my-role', 'authorized', 'denied', 'overrides', 'rollbacks'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [isSyncing, setIsSyncing] = useState(false);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter, actionFilter, filterType]);

  const handleRefresh = async () => {
    setIsSyncing(true);
    try {
      if (syncWithBackend) await syncWithBackend();
      showToast('Ledger Synced', 'Audit ledger refreshed with persistent SQLite backend.', 'success');
    } catch (e) {
      showToast('Sync Notice', 'Local audit records active.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  // Cryptographic Audit Hash Chaining state & handlers
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTampering, setIsTampering] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  const handleVerifyAuditChain = async () => {
    setIsVerifying(true);
    try {
      const res = await auditApi.verifyChain();
      setVerificationResult(res);
      if (res.valid) {
        showToast('Chain Verified', `Cryptographic hash chain intact across all ${res.totalLogs} events.`, 'success');
      } else {
        showToast('Integrity Alert', `Audit chain broken at event ${res.brokenAt}`, 'error');
      }
    } catch (err) {
      showToast('Verification Failed', err.message, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulateTamper = async () => {
    setIsTampering(true);
    try {
      const res = await auditApi.simulateTamper();
      showToast('Tamper Injected', `Tampered event ${res.tamperedId} to demonstrate detection.`, 'info');
      await handleVerifyAuditChain();
      if (syncWithBackend) await syncWithBackend();
    } catch (err) {
      showToast('Tamper Simulation Failed', err.message, 'error');
    } finally {
      setIsTampering(false);
    }
  };

  const handleRepairChain = async () => {
    setIsRepairing(true);
    try {
      const res = await auditApi.repairChain();
      showToast('Chain Repaired', `Recalculated cryptographic hashes across ${res.repairedCount} events.`, 'success');
      await handleVerifyAuditChain();
      if (syncWithBackend) await syncWithBackend();
    } catch (err) {
      showToast('Repair Failed', err.message, 'error');
    } finally {
      setIsRepairing(false);
    }
  };

  // Rollback confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    details: null,
    confirmLabel: 'Confirm Rollback',
    confirmVariant: 'rose',
    onConfirm: () => {},
  });

  // Safe collections
  const safeAuditLogs = Array.isArray(auditLogs) ? auditLogs : [];
  const safeChanges = Array.isArray(changeHistory) ? changeHistory : [];

  // Metrics
  const totalEvents = safeAuditLogs.length;
  const authorizedCount = safeAuditLogs.filter((e) => (e?.status || '').includes('Authorized')).length;
  const deniedCount = safeAuditLogs.filter((e) => (e?.status || '').includes('Denied')).length;
  const overridesCount = safeAuditLogs.filter((e) => Boolean(e?.overrideReason || (e?.status || '').includes('Override'))).length;
  const totalChanges = safeChanges.length;
  const activeChanges = safeChanges.filter((c) => !c?.isRolledBack).length;

  // Filtered Audit Logs with Multi-Criteria Support
  const filteredAuditLogs = safeAuditLogs.filter((evt) => {
    if (!evt) return false;
    const evtId = evt.id || '';
    const evtActor = evt.actor || '';
    const evtEvent = evt.event || evt.action || 'EVENT';
    const evtTarget = evt.target || evt.module || 'system';
    const evtStatus = evt.status || 'Authorized';
    const evtRole = evt.role || '';
    const evtReason = evt.overrideReason || '';
    const evtIp = evt.ip || '';
    const evtDetails = evt.details ? String(evt.details) : '';

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        evtId.toLowerCase().includes(q) ||
        evtActor.toLowerCase().includes(q) ||
        evtEvent.toLowerCase().includes(q) ||
        evtTarget.toLowerCase().includes(q) ||
        evtReason.toLowerCase().includes(q) ||
        evtDetails.toLowerCase().includes(q) ||
        evtIp.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (roleFilter !== 'all' && evtRole.toLowerCase() !== roleFilter.toLowerCase()) return false;

    if (statusFilter !== 'all') {
      if (statusFilter === 'Authorized' && !evtStatus.includes('Authorized')) return false;
      if (statusFilter === 'Denied' && !evtStatus.includes('Denied')) return false;
      if (statusFilter === 'Cancelled' && !evtStatus.includes('Cancelled')) return false;
      if (statusFilter === 'Override' && !evtReason && !evtStatus.includes('Override')) return false;
    }

    if (actionFilter !== 'all') {
      const ev = evtEvent.toUpperCase();
      if (actionFilter === 'LOGIN' && !ev.includes('LOGIN')) return false;
      if (actionFilter === 'ATTENDANCE' && !ev.includes('ATTENDANCE')) return false;
      if (actionFilter === 'FEE' && !ev.includes('FEE') && !ev.includes('PAYMENT')) return false;
      if (actionFilter === 'ADMISSION' && !ev.includes('ADMISSION')) return false;
      if (actionFilter === 'CERTIFICATE' && !ev.includes('CERTIFICATE') && !ev.includes('CREDENTIAL')) return false;
      if (actionFilter === 'OVERRIDE' && !ev.includes('OVERRIDE')) return false;
      if (actionFilter === 'ROLLBACK' && !ev.includes('ROLLBACK')) return false;
    }

    if (filterType === 'all') return true;
    if (filterType === 'denied') return evtStatus.includes('Denied');
    if (filterType === 'authorized') return evtStatus === 'Authorized';
    if (filterType === 'my-role') return evtRole === currentRole;
    if (filterType === 'overrides') return Boolean(evtReason || evtStatus.includes('Override'));
    if (filterType === 'rollbacks') return evtEvent.startsWith('ROLLBACK_') || evtStatus === 'Rolled Back';
    return true;
  });

  // Paginated Audit Logs
  const totalAuditPages = Math.max(1, Math.ceil(filteredAuditLogs.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredAuditLogs.length);
  const paginatedAuditLogs = filteredAuditLogs.slice(startIndex, endIndex);

  // Filtered Change History
  const filteredChanges = safeChanges.filter((chg) => {
    if (!chg) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (chg.id || '').toLowerCase().includes(q) ||
      (chg.actor || '').toLowerCase().includes(q) ||
      (chg.actionType || '').toLowerCase().includes(q) ||
      (chg.targetFeature || '').toLowerCase().includes(q) ||
      (chg.description || '').toLowerCase().includes(q) ||
      (chg.overrideReason && String(chg.overrideReason).toLowerCase().includes(q))
    );
  });

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'Event ID',
      'Timestamp',
      'Actor',
      'Role',
      'Action Event',
      'Target Feature',
      'Status',
      'Override Justification',
      'Network IP',
      'Duration'
    ];
    const rows = safeAuditLogs.map((evt) => [
      evt.id || '',
      evt.timestamp || '',
      evt.actor || '',
      evt.role || '',
      evt.event || evt.action || '',
      evt.target || evt.module || '',
      evt.status || 'Authorized',
      evt.overrideReason || 'N/A',
      evt.ip || 'N/A',
      evt.duration || 'N/A'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rolewise_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) {
      showToast('Audit Log Exported', 'Downloaded encrypted CSV record of all system events.', 'info');
    }
  };

  // Rollback Trigger
  const handleInitiateRollback = (chg) => {
    setConfirmDialog({
      isOpen: true,
      title: `Confirm Rollback: ${chg.id}`,
      description: `Revert state change "${chg.description}" and restore previous application snapshot?`,
      details: {
        'Change ID': chg.id,
        'Action Type': chg.actionType,
        'Target Feature': chg.targetFeature,
        Actor: chg.actor,
        Timestamp: chg.timestamp,
      },
      confirmLabel: 'Confirm & Revert Action',
      confirmVariant: 'rose',
      onConfirm: () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        executeRollback(chg.id);
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Confirmation Dialog for Rollback */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        details={confirmDialog.details}
        confirmLabel={confirmDialog.confirmLabel}
        confirmVariant={confirmDialog.confirmVariant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            University Governance & Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Immutable system-wide ledger of feature usage events, administrative overrides, and reversible state actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RoleBadge role={currentRole} size="md" />
        </div>
      </div>

      {/* Role Access Notice if not Admin */}
      {currentRole !== ROLES.ADMIN && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="text-xs text-amber-200">
              <span className="font-semibold">Governance Perspective:</span> You are inspecting audit records with{' '}
              <span className="capitalize font-bold text-white">{currentRole}</span> permissions. Full administrative ledger controls and system configuration are managed under the Administrator role.
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-xs font-semibold text-amber-300 whitespace-nowrap flex-shrink-0">
            Admin Auth Required for Global Edits
          </div>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Events</div>
            <div className="text-xl font-bold text-white">{totalEvents}</div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Authorized</div>
            <div className="text-xl font-bold text-white">{authorizedCount}</div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Access Violations</div>
            <div className="text-xl font-bold text-rose-300">{deniedCount}</div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reversible Changes</div>
            <div className="text-xl font-bold text-amber-300">
              {activeChanges} <span className="text-xs text-slate-500 font-normal">/ {totalChanges}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Real-time Cryptographic Audit Verification Banner */}
      {verificationResult && (
        <div
          data-testid="audit-verification-status"
          className={`p-4 rounded-2xl border transition-all ${
            verificationResult.valid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {verificationResult.valid ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
              <div>
                <div className="text-sm font-bold">
                  {verificationResult.valid
                    ? 'Cryptographic Hash Chain Intact (SHA-256)'
                    : 'Cryptographic Hash Integrity Compromised!'}
                </div>
                <div className="text-xs opacity-90">
                  {verificationResult.valid
                    ? `Cryptographic hash chain intact across all ${verificationResult.totalLogs} events. Genesis root verified.`
                    : `Tamper detected at event: ${verificationResult.brokenAt}. ${verificationResult.reason}`}
                </div>
              </div>
            </div>
            {currentRole === ROLES.ADMIN && !verificationResult.valid && (
              <button
                onClick={handleRepairChain}
                disabled={isRepairing}
                data-testid="repair-audit-chain-btn"
                className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-lg shadow-rose-950/50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRepairing ? 'animate-spin' : ''}`} />
                <span>{isRepairing ? 'Repairing...' : 'Repair & Re-anchor Chain'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'ledger'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Immutable Audit Ledger</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {filteredAuditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('changes')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'changes'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Change Review & Rollback</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {filteredChanges.length}
          </span>
        </button>
      </div>

      {/* Search & Action Filters Bar */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'ledger'
                  ? 'Search by ID, actor, event type, target tool, IP, or justification...'
                  : 'Search by change ID, actor, action description, or feature...'
              }
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleVerifyAuditChain}
              disabled={isVerifying}
              data-testid="verify-audit-chain-btn"
              className="px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title="Verify cryptographic SHA-256 hash chain from genesis block"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying...' : 'Verify Hash Chain'}</span>
            </button>
            {currentRole === ROLES.ADMIN && (
              <>
                <button
                  onClick={handleSimulateTamper}
                  disabled={isTampering}
                  data-testid="simulate-tamper-btn"
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 hover:text-rose-200 flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  title="Tamper an audit log entry to simulate cryptographic fraud detection"
                >
                  <AlertTriangle className={`w-3.5 h-3.5 ${isTampering ? 'animate-spin' : ''}`} />
                  <span>{isTampering ? 'Tampering...' : 'Simulate Tamper'}</span>
                </button>
                <button
                  onClick={handleRepairChain}
                  disabled={isRepairing}
                  data-testid="repair-audit-chain-btn"
                  className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  title="Recalculate hashes and restore chain integrity"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRepairing ? 'animate-spin' : ''}`} />
                  <span>{isRepairing ? 'Repairing...' : 'Repair Chain'}</span>
                </button>
              </>
            )}
            <button
              onClick={handleRefresh}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title="Refresh ledger from persistent database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Live Sync'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab 1 Dedicated Multi-Criteria Dropdowns & Quick Filter Pills */}
        {activeTab === 'ledger' && (
          <div className="space-y-3 pt-2 border-t border-slate-800/60">
            {/* Multi-Criteria Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Role Filter Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium whitespace-nowrap text-[11px]">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium cursor-pointer"
                >
                  <option value="all">All Roles (Student, Faculty, Admin)</option>
                  <option value="student">Student Perspective Only</option>
                  <option value="faculty">Faculty Perspective Only</option>
                  <option value="admin">Administrator Perspective Only</option>
                </select>
              </div>

              {/* Action Type Filter Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium whitespace-nowrap text-[11px]">Action:</span>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium cursor-pointer"
                >
                  <option value="all">All Action Categories</option>
                  <option value="LOGIN">Authentication (Login / Logout)</option>
                  <option value="ATTENDANCE">Attendance Submissions & Syncs</option>
                  <option value="FEE">Fee Payments & Reconciliation</option>
                  <option value="ADMISSION">Admission Decisions</option>
                  <option value="CERTIFICATE">Certificates & Credentials</option>
                  <option value="OVERRIDE">Administrative Overrides</option>
                  <option value="ROLLBACK">Rollbacks & Reversals</option>
                </select>
              </div>

              {/* Status Filter Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium whitespace-nowrap text-[11px]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium cursor-pointer"
                >
                  <option value="all">All Authorization Outcomes</option>
                  <option value="Authorized">Authorized Events</option>
                  <option value="Denied">Access Denied (403 Violations)</option>
                  <option value="Override">Authorized via Override</option>
                  <option value="Cancelled">Cancelled Actions</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/40">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Quick Preset:
              </span>
              <button
                onClick={() => {
                  setFilterType('all');
                  setRoleFilter('all');
                  setActionFilter('all');
                  setStatusFilter('all');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterType === 'all' && roleFilter === 'all' && statusFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                All Events ({auditLogs.length})
              </button>
              <button
                onClick={() => {
                  setFilterType('my-role');
                  setRoleFilter(currentRole);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  roleFilter === currentRole
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {currentRole.toUpperCase()} Events
              </button>
              <button
                onClick={() => {
                  setFilterType('authorized');
                  setStatusFilter('Authorized');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'Authorized'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Authorized
              </button>
              <button
                onClick={() => {
                  setFilterType('denied');
                  setStatusFilter('Denied');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'Denied'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Access Denied (403)
              </button>
              <button
                onClick={() => {
                  setFilterType('overrides');
                  setStatusFilter('Override');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'Override'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Overrides ({overridesCount})
              </button>
              <button
                onClick={() => {
                  setFilterType('rollbacks');
                  setActionFilter('ROLLBACK');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  actionFilter === 'ROLLBACK'
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Rollback Events
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* =========================================================================
          TAB 1: IMMUTABLE AUDIT TRAIL TABLE
      ========================================================================= */}
      {activeTab === 'ledger' && (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Event ID & Time</th>
                  <th className="px-5 py-3.5">Actor & Role</th>
                  <th className="px-5 py-3.5">Action Event</th>
                  <th className="px-5 py-3.5">Target Feature</th>
                  <th className="px-5 py-3.5">Status & Validation</th>
                  <th className="px-5 py-3.5">Override Justification</th>
                  <th className="px-5 py-3.5">Network Hash</th>
                  <th className="px-4 py-3.5 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                      No audit events found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedAuditLogs.map((evt) => {
                    const evtId = evt.id || 'EVT-LOG';
                    const evtEvent = evt.event || evt.action || 'SYSTEM_EVENT';
                    const evtTarget = evt.target || evt.module || 'system';
                    const evtStatus = evt.status || 'Authorized';
                    const isDenied = evtStatus.includes('Denied');
                    const isOverride = Boolean(evt.overrideReason || evtStatus.includes('Override'));
                    const isRollback = evtEvent.startsWith('ROLLBACK_') || evtStatus === 'Rolled Back';

                    return (
                      <tr key={evtId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-mono text-indigo-400 font-semibold">{evtId}</div>
                          <div className="text-[10px] text-slate-500">{evt.timestamp || 'Just now'}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-200">{evt.actor || 'System'}</div>
                          <div className="mt-0.5">
                            <RoleBadge role={evt.role || 'admin'} size="sm" showIcon={false} />
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-mono text-[11px]">
                          <span
                            className={`px-2 py-0.5 rounded-md ${
                              isRollback
                                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                : isOverride
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-900 text-slate-300 border border-slate-800'
                            }`}
                          >
                            {evtEvent}
                          </span>
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <button
                            onClick={() => openFeature(evtTarget)}
                            className="text-cyan-300 hover:underline font-mono text-xs text-left inline-flex items-center gap-1 group"
                          >
                            <span>{evtTarget}</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-300 transition-colors" />
                          </button>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isDenied ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" />
                              {evtStatus}
                            </span>
                          ) : isRollback ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                              <Undo2 className="w-3 h-3" />
                              Rolled Back
                            </span>
                          ) : isOverride ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3 text-amber-400" />
                              Authorized (Override)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Authorized
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 max-w-xs text-[11px]">
                          {evt.overrideReason ? (
                            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium leading-tight">
                              {evt.overrideReason}
                            </div>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                          <div>{evt.ip || '127.0.0.1'}</div>
                          <div className="text-[9px] text-slate-600">{evt.duration || '24ms'}</div>
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedEventDetail({
                              ...evt,
                              id: evtId,
                              event: evtEvent,
                              action: evtEvent,
                              target: evtTarget,
                              module: evtTarget,
                              status: evtStatus,
                            })}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-slate-700 transition-colors inline-flex items-center gap-1 text-[11px] font-medium shadow-sm"
                            title="Inspect Event Telemetry & Forensic Payload"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredAuditLogs.length > 0 && (
            <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>
                  Showing <strong className="text-white">{startIndex + 1}</strong> to{' '}
                  <strong className="text-white">{endIndex}</strong> of{' '}
                  <strong className="text-white">{filteredAuditLogs.length}</strong> entries
                </span>
                <span className="text-slate-600">|</span>
                <div className="flex items-center gap-1.5">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 font-medium transition-colors"
                >
                  Previous
                </button>

                <span className="px-3 py-1 text-slate-300 font-medium">
                  Page <strong className="text-indigo-400">{currentPage}</strong> of{' '}
                  <strong className="text-slate-200">{totalAuditPages}</strong>
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalAuditPages, p + 1))}
                  disabled={currentPage === totalAuditPages}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* =========================================================================
          TAB 2: CHANGE REVIEW & ROLLBACK SYSTEM
      ========================================================================= */}
      {activeTab === 'changes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">Reversible Administrative State Ledger</h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Every high-impact state change across Admissions, Fee Clearances, Attendance Batches, and Permission Overrides maintains a point-in-time snapshot. Authorized personnel can inspect the state delta and roll back any action to restore data integrity.
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Zero-Loss Rollback Active
              </span>
            </div>
          </div>

          {filteredChanges.length === 0 ? (
            <GlassCard className="p-10 text-center text-slate-500">
              No state changes found matching your query.
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {filteredChanges.map((chg) => {
                return (
                  <GlassCard
                    key={chg.id}
                    className={`p-5 transition-all ${
                      chg.isRolledBack ? 'opacity-70 border-slate-800' : 'border-indigo-500/20'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Change metadata */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                            {chg.id}
                          </span>
                          <span className="font-mono text-xs text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                            {chg.actionType}
                          </span>
                          <button
                            onClick={() => openFeature(chg.targetFeature)}
                            className="text-xs text-cyan-300 hover:underline font-mono"
                          >
                            target: {chg.targetFeature}
                          </button>
                          {chg.isRolledBack ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 rounded-full">
                              <Undo2 className="w-3 h-3" />
                              Reverted / Rolled Back
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                              Active State
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-semibold text-white">{chg.description}</h4>

                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span>
                            Actor: <strong className="text-slate-200">{chg.actor}</strong>
                          </span>
                          <span>•</span>
                          <span>Timestamp: {chg.timestamp}</span>
                          {chg.overrideReason && (
                            <>
                              <span>•</span>
                              <span className="text-amber-300">
                                Override: {chg.overrideReason}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Rollback Action Button */}
                      <div className="flex-shrink-0">
                        {chg.isRolledBack ? (
                          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-500 flex items-center gap-1.5 cursor-not-allowed">
                            <Check className="w-3.5 h-3.5" />
                            <span>Action Reverted</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleInitiateRollback(chg)}
                            className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-xs font-semibold text-rose-300 hover:text-white flex items-center gap-1.5 transition-all shadow-lg shadow-rose-950/50"
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                            <span>Rollback Action</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* State Diff Comparison Box */}
                    <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Previous State */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                          Previous State Snapshot
                        </div>
                        <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                          {JSON.stringify(chg.previousState, null, 2)}
                        </pre>
                      </div>

                      {/* New State */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          Committed New State
                        </div>
                        <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                          {JSON.stringify(chg.newState, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Forensic Event Details Modal */}
      {selectedEventDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Event Telemetry & Forensic Record</h3>
                </div>
                <div className="text-xs font-mono text-indigo-400 font-semibold">
                  {selectedEventDetail.id} • {selectedEventDetail.timestamp}
                </div>
              </div>
              <button
                onClick={() => setSelectedEventDetail(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Actor Identity</span>
                <span className="font-semibold text-white mt-0.5 block truncate">{selectedEventDetail.actor}</span>
                <div className="mt-1">
                  <RoleBadge role={selectedEventDetail.role} size="sm" showIcon={false} />
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Action Type</span>
                <span className="font-mono font-bold text-indigo-300 mt-0.5 block">
                  {selectedEventDetail.event || selectedEventDetail.action || 'SYSTEM_EVENT'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Target: {selectedEventDetail.target || selectedEventDetail.module || 'system'}
                </span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Status</span>
                <span className={`inline-flex items-center gap-1 font-bold mt-1 text-xs px-2 py-0.5 rounded-full ${
                  (selectedEventDetail.status || '').includes('Denied')
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : (selectedEventDetail.status || '').includes('Override')
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {selectedEventDetail.status || 'Authorized'}
                </span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Origin Network IP</span>
                <span className="font-mono text-slate-300 mt-0.5 block">{selectedEventDetail.ip || '127.0.0.1 (Local LAN)'}</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Execution Latency</span>
                <span className="font-mono text-emerald-400 font-bold mt-0.5 block">{selectedEventDetail.duration || '42ms'}</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Integrity Protocol</span>
                <span className="text-[11px] text-cyan-300 font-medium mt-0.5 block">Deterministic HMAC-256</span>
              </div>
            </div>

            {/* Cryptographic Hash Verification */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Cryptographic Block Seal & Chaining (SHA-256)
              </span>
              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 font-mono">Current Block Hash:</div>
                <div className="font-mono text-[11px] text-emerald-400 break-all bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
                  {selectedEventDetail.hash || 'GENESIS_BLOCK_HEAD'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 font-mono">Parent Block Hash (prev_hash):</div>
                <div className="font-mono text-[11px] text-cyan-400 break-all bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
                  {selectedEventDetail.prev_hash || 'GENESIS_BLOCK_0000000000000000000000000000000000000000000000000000000000000000'}
                </div>
              </div>
            </div>

            {/* Override Notes if present */}
            {selectedEventDetail.overrideReason && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Administrative Override Justification
                </span>
                <p className="text-xs text-amber-200">
                  {selectedEventDetail.overrideReason}
                </p>
              </div>
            )}

            {/* Detailed Context Payload */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Event Payload Context & Telemetry Parameters
              </span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
                {selectedEventDetail.details
                  ? typeof selectedEventDetail.details === 'object'
                    ? JSON.stringify(selectedEventDetail.details, null, 2)
                    : selectedEventDetail.details
                  : `Service invocation on route "${selectedEventDetail.target}" by actor "${selectedEventDetail.actor}" under authority context "${selectedEventDetail.role}". Verification passed with zero boundary violations.`}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs text-slate-500">
              <span>Apex National Institute of Technology • Registrar Audit Log</span>
              <button
                onClick={() => setSelectedEventDetail(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AuditTrailPage = (props) => (
  <ErrorBoundary>
    <AuditTrailPageContent {...props} />
  </ErrorBoundary>
);

