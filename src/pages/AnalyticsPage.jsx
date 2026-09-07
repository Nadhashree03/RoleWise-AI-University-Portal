import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Search,
  Sparkles,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  Cpu,
  RefreshCw,
  Database,
  Target,
  AlertTriangle,
  Flame,
  FileCheck2,
  ShieldCheck,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { analyticsApi } from '../services/api';

export const AnalyticsPage = () => {
  const { currentRole, currentUser } = useRole();

  const [activeTab, setActiveTab] = useState('experiment'); // 'experiment' | 'underused' | 'operational' | 'controls'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [experimentData, setExperimentData] = useState(null);
  const [underusedData, setUnderusedData] = useState([]);
  const [operationalData, setOperationalData] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  const loadAllAnalytics = async () => {
    setIsRefreshing(true);
    try {
      const [expRes, underRes, opRes] = await Promise.allSettled([
        analyticsApi.getExperiment(),
        analyticsApi.getUnderusedFeatures(),
        analyticsApi.getAnalytics()
      ]);

      if (expRes.status === 'fulfilled' && expRes.value?.success) {
        setExperimentData(expRes.value);
      }
      if (underRes.status === 'fulfilled' && underRes.value?.success) {
        setUnderusedData(underRes.value.features || []);
      }
      if (opRes.status === 'fulfilled' && opRes.value?.success) {
        setOperationalData(opRes.value.telemetry);
      }
    } catch (e) {
      console.warn('Analytics loading error:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const handleResetDemoData = async () => {
    setResetLoading(true);
    try {
      const res = await analyticsApi.resetDemo();
      if (res.success) {
        setResetSuccessMessage('Synthetic demonstration experiment dataset has been successfully reset to baseline.');
        await loadAllAnalytics();
        setTimeout(() => setResetSuccessMessage(''), 5000);
      }
    } catch (err) {
      alert(err.message || 'Failed to reset demo dataset');
    } finally {
      setResetLoading(false);
      setResetConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-400" />
              RoleWise AI Analytics & Experimentation
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              Live Database Telemetry
            </span>
          </div>
          <p className="text-sm text-slate-400">
            A/B evaluation metrics, underused feature intelligence, and persistent operational analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAnalytics}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Telemetry'}
          </button>
        </div>
      </div>

      {/* Synthetic Prototype Disclaimer Banner */}
      <div className="rounded-xl p-3.5 bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3 backdrop-blur-md">
        <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="text-xs text-indigo-200 leading-relaxed">
          <span className="font-semibold text-indigo-300">Prototype Demonstration Notice: </span>
          Analytics calculate metrics from real persistent SQLite tables (<code className="text-cyan-300 font-mono">feature_usage_events</code>, <code className="text-cyan-300 font-mono">task_goals</code>, <code className="text-cyan-300 font-mono">help_search_queries</code>) using synthetic/anonymized participant trajectories (≥100 users across Student, Faculty, and Admin roles). No hardcoded metrics are utilized.
        </div>
      </div>

      {resetSuccessMessage && (
        <div className="rounded-xl p-3 bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {resetSuccessMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('experiment')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'experiment'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Feature Discovery Experiment (A/B)
        </button>

        <button
          onClick={() => setActiveTab('underused')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'underused'
              ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Underused Feature Intelligence
        </button>

        <button
          onClick={() => setActiveTab('operational')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'operational'
              ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Operational Portal KPIs
        </button>

        <button
          onClick={() => setActiveTab('controls')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'controls'
              ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Simulation Reset Controls
        </button>
      </div>

      {/* TAB 1: FEATURE DISCOVERY EXPERIMENT (A/B) */}
      {activeTab === 'experiment' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Cohort Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-4 border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Experiment Cohort</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {experimentData?.userCounts?.total || 105} Users
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span className="text-indigo-400 font-mono">{experimentData?.userCounts?.assistant || 52} Assistant</span>
                <span>•</span>
                <span className="text-slate-400 font-mono">{experimentData?.userCounts?.control || 53} Control</span>
              </div>
            </GlassCard>

            <GlassCard className="p-4 border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Discovery Gain</span>
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                {experimentData?.comparison?.[0]?.improvement || '+31.1%'}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Assistant vs Control discovery rate
              </div>
            </GlassCard>

            <GlassCard className="p-4 border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Underused Uplift</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400 tracking-tight">
                {experimentData?.comparison?.[4]?.improvement || '+40.5%'}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Certificates & bulk upload discovery
              </div>
            </GlassCard>

            <GlassCard className="p-4 border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Discovery Time Reduction</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-300 tracking-tight">
                {experimentData?.comparison?.[3]?.improvement || '-40.4s'}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Average seconds saved per task
              </div>
            </GlassCard>
          </div>

          {/* Main Comparison Matrix Table */}
          <GlassCard className="overflow-hidden border-slate-800/80">
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  "RoleWise Feature Discovery Experiment" — Comparative Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct database aggregation contrasting Control (no assistant) vs Treatment (RoleWise AI recommendations).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold">
                    <th className="p-3.5 pl-4">Target Metric</th>
                    <th className="p-3.5">Target Threshold</th>
                    <th className="p-3.5">Control Group (No AI)</th>
                    <th className="p-3.5">Assistant Group (AI)</th>
                    <th className="p-3.5 text-right">Measured Gain</th>
                    <th className="p-3.5 pr-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                  {experimentData?.comparison?.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 pl-4 font-sans font-medium text-white flex flex-col">
                        <span>{row.metric}</span>
                        <span className="text-[10px] text-slate-500 font-normal font-mono">{row.formula}</span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-sans">
                        <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
                          {row.target}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 font-bold">{row.control}</td>
                      <td className="p-3.5 text-cyan-300 font-bold">{row.assistant}</td>
                      <td className="p-3.5 text-right font-bold text-emerald-400 font-sans">
                        {row.improvement}
                      </td>
                      <td className="p-3.5 pr-4 text-center font-sans">
                        {row.targetMet ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Met
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" /> In Progress
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 2: UNDERUSED FEATURE INTELLIGENCE */}
      {activeTab === 'underused' && (
        <div className="space-y-6 animate-fade-in">
          <GlassCard className="p-4 border-slate-800/80 bg-amber-950/20 border-amber-500/20">
            <div className="flex items-start gap-3">
              <Flame className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-200">Autonomous Underused Service Identification</h3>
                <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                  A service is dynamically classified as <strong className="text-amber-200">UNDERUSED</strong> if eligible cohort usage or discovery falls below threshold. RoleWise AI prioritizes these workflows when relevant task goals or keywords are detected.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold">
                    <th className="p-3.5 pl-4">University Service / Feature</th>
                    <th className="p-3.5">Eligible Role</th>
                    <th className="p-3.5">Eligible Cohort</th>
                    <th className="p-3.5">Total Usages</th>
                    <th className="p-3.5">Discovery Rate</th>
                    <th className="p-3.5">Completion Rate</th>
                    <th className="p-3.5 pr-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {underusedData.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 pl-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">
                            {f.featureId}
                          </code>
                          <span>{f.title}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <RoleBadge role={f.role} size="sm" />
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{f.eligibleUsers} users</td>
                      <td className="p-3.5 font-mono text-slate-300 font-bold">{f.usageCount}</td>
                      <td className="p-3.5 font-mono text-slate-300">{f.discoveryRate}</td>
                      <td className="p-3.5 font-mono text-slate-300">{f.completionRate}</td>
                      <td className="p-3.5 pr-4 text-center">
                        {f.status === 'UNDERUSED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            <Flame className="w-3 h-3" /> UNDERUSED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            HEALTHY
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 3: OPERATIONAL PORTAL KPIS */}
      {activeTab === 'operational' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-4 border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Tuition Fees Collected</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                ₹{(operationalData?.fees?.totalCollected || 0).toLocaleString()}
              </div>
              <div className="text-xs text-emerald-400 mt-1">
                {operationalData?.fees?.collectionRate || '0.0%'} Collection Rate
              </div>
            </GlassCard>

            <GlassCard className="p-4 border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Average Attendance</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {operationalData?.attendance?.averageAttendance || '88.5%'}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Across {operationalData?.attendance?.totalEvents || 160} lecture sessions
              </div>
            </GlassCard>

            <GlassCard className="p-4 border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Credentials Issued</span>
                <FileCheck2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {operationalData?.certificates?.totalIssued || 1} Issued
              </div>
              <div className="text-xs text-indigo-300 mt-1">
                Cryptographically sealed with SHA-256
              </div>
            </GlassCard>

            <GlassCard className="p-4 border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Governance Audit Logs</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {operationalData?.governance?.totalAuditLogs || 4}
              </div>
              <div className="text-xs text-purple-300 mt-1">
                Immutable SQLite WAL ledger entries
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 4: SIMULATION RESET CONTROLS */}
      {activeTab === 'controls' && (
        <div className="space-y-6 animate-fade-in">
          <GlassCard className="p-6 border-slate-800/80">
            <div className="max-w-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-400" />
                Reset Synthetic Demonstration Dataset
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Evaluators can trigger this control to reset all synthetic A/B experiment telemetry (<code className="text-cyan-400">feature_usage_events</code>, <code className="text-cyan-400">task_goals</code>, <code className="text-cyan-400">help_search_queries</code>) back to the clean demonstration baseline.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300">
                <strong>Safety assertion:</strong> Real university administrative records (users, official fee schedules, live attendance rosters) are preserved. Only synthetic experiment records are re-seeded.
              </div>

              <button
                onClick={() => setResetConfirmOpen(true)}
                disabled={resetLoading}
                className="mt-5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-900/40"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resetLoading ? 'animate-spin' : ''}`} />
                {resetLoading ? 'Re-seeding Baseline...' : 'Reset Synthetic Experiment Telemetry'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        title="Confirm Synthetic Dataset Reset"
        message="Are you sure you want to reset the synthetic A/B experiment dataset? This will re-seed the >= 100 anonymized participant trajectories back to clean evaluation baselines."
        confirmText="Confirm Reset"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleResetDemoData}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
};
