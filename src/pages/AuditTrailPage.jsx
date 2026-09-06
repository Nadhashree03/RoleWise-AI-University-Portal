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
  KeyRound
} from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const AuditTrailPage = () => {
  const {
    currentRole,
    currentUser,
    switchRole,
    openFeature,
    auditLogs,
    changeHistory,
    executeRollback,
    showToast
  } = useRole();

  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'changes'
  const [filterType, setFilterType] = useState('all'); // 'all', 'my-role', 'authorized', 'denied', 'overrides', 'rollbacks'
  const [searchQuery, setSearchQuery] = useState('');

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

  // Metrics
  const totalEvents = auditLogs.length;
  const authorizedCount = auditLogs.filter((e) => e.status.includes('Authorized')).length;
  const deniedCount = auditLogs.filter((e) => e.status.includes('Denied')).length;
  const overridesCount = auditLogs.filter((e) => e.overrideReason || e.status.includes('Override')).length;
  const totalChanges = changeHistory.length;
  const activeChanges = changeHistory.filter((c) => !c.isRolledBack).length;

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((evt) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        evt.id.toLowerCase().includes(q) ||
        evt.actor.toLowerCase().includes(q) ||
        evt.event.toLowerCase().includes(q) ||
        evt.target.toLowerCase().includes(q) ||
        (evt.overrideReason && evt.overrideReason.toLowerCase().includes(q)) ||
        (evt.ip && evt.ip.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filterType === 'all') return true;
    if (filterType === 'denied') return evt.status.includes('Denied');
    if (filterType === 'authorized') return evt.status === 'Authorized';
    if (filterType === 'my-role') return evt.role === currentRole;
    if (filterType === 'overrides') return evt.overrideReason || evt.status.includes('Override');
    if (filterType === 'rollbacks') return evt.event.startsWith('ROLLBACK_') || evt.status === 'Rolled Back';
    return true;
  });

  // Filtered Change History
  const filteredChanges = changeHistory.filter((chg) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      chg.id.toLowerCase().includes(q) ||
      chg.actor.toLowerCase().includes(q) ||
      chg.actionType.toLowerCase().includes(q) ||
      chg.targetFeature.toLowerCase().includes(q) ||
      chg.description.toLowerCase().includes(q) ||
      (chg.overrideReason && chg.overrideReason.toLowerCase().includes(q))
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
    const rows = auditLogs.map((evt) => [
      evt.id,
      evt.timestamp,
      evt.actor,
      evt.role,
      evt.event,
      evt.target,
      evt.status,
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

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab 1 Quick Filter Pills */}
        {activeTab === 'ledger' && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
            <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All Events ({auditLogs.length})
            </button>
            <button
              onClick={() => setFilterType('my-role')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'my-role'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {currentRole.toUpperCase()} Events
            </button>
            <button
              onClick={() => setFilterType('authorized')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'authorized'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Authorized
            </button>
            <button
              onClick={() => setFilterType('denied')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'denied'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Access Denied (403)
            </button>
            <button
              onClick={() => setFilterType('overrides')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'overrides'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Overrides ({overridesCount})
            </button>
            <button
              onClick={() => setFilterType('rollbacks')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'rollbacks'
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Rollback Events
            </button>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                      No audit events found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((evt) => {
                    const isDenied = evt.status.includes('Denied');
                    const isOverride = evt.overrideReason || evt.status.includes('Override');
                    const isRollback = evt.event.startsWith('ROLLBACK_') || evt.status === 'Rolled Back';

                    return (
                      <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-mono text-indigo-400 font-semibold">{evt.id}</div>
                          <div className="text-[10px] text-slate-500">{evt.timestamp}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-200">{evt.actor}</div>
                          <div className="mt-0.5">
                            <RoleBadge role={evt.role} size="sm" showIcon={false} />
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
                            {evt.event}
                          </span>
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <button
                            onClick={() => openFeature(evt.target)}
                            className="text-cyan-300 hover:underline font-mono text-xs text-left inline-flex items-center gap-1 group"
                          >
                            <span>{evt.target}</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-300 transition-colors" />
                          </button>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isDenied ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" />
                              {evt.status}
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
                          <div>{evt.ip}</div>
                          <div className="text-[9px] text-slate-600">{evt.duration}</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
    </div>
  );
};
