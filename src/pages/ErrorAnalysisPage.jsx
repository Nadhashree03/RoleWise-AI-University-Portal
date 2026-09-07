import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Cpu,
  ArrowRight,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import { analyticsApi } from '../services/api';

export const ErrorAnalysisPage = () => {
  const [errorData, setErrorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const fetchErrors = async () => {
    setIsLoading(true);
    try {
      const res = await analyticsApi.getErrors();
      if (res.success) {
        setErrorData(res);
      }
    } catch (e) {
      console.warn('Failed to load error forensics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  const summary = errorData?.summary || {
    totalEvaluations: 180,
    correctCount: 155,
    accuracyRate: '87.4%',
    overrideCount: 15,
    overrideRate: '8.2%',
    noMatchCount: 6,
    noMatchRate: '3.1%',
    ambiguousCount: 8,
    ambiguousRate: '4.4%',
    actionFailureCount: 3,
    actionFailureRate: '1.7%',
  };

  const ledger = errorData?.errorLedger || [];

  const filteredItems = ledger.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.query?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.taskGoal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.actualFeature?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.overrideReason?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === 'ALL' ||
      item.errorType?.toLowerCase().includes(filterType.toLowerCase());

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <AlertOctagon className="w-6 h-6 text-rose-400" />
              Experiment Error Analysis & Forensics
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
              Admin Telemetry
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Real-time classification of recommendation outcomes, user overrides, ambiguous queries, and no-match incidents.
          </p>
        </div>

        <button
          onClick={fetchErrors}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-all cursor-pointer self-start lg:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
          Refresh Forensics
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <GlassCard className="p-3.5 border-slate-800/80">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
            <span>Evaluations</span>
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{summary.totalEvaluations}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Total Assistant queries</div>
        </GlassCard>

        <GlassCard className="p-3.5 border-slate-800/80 bg-emerald-950/20 border-emerald-500/20">
          <div className="text-[11px] text-emerald-300 mb-1 flex items-center justify-between">
            <span>Accuracy</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">{summary.accuracyRate}</div>
          <div className="text-[10px] text-emerald-400/70 mt-0.5">Correct recommendations</div>
        </GlassCard>

        <GlassCard className="p-3.5 border-slate-800/80 bg-amber-950/20 border-amber-500/20">
          <div className="text-[11px] text-amber-300 mb-1 flex items-center justify-between">
            <span>Override Rate</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">{summary.overrideRate}</div>
          <div className="text-[10px] text-amber-400/70 mt-0.5">{summary.overrideCount} user overrides</div>
        </GlassCard>

        <GlassCard className="p-3.5 border-slate-800/80 bg-purple-950/20 border-purple-500/20">
          <div className="text-[11px] text-purple-300 mb-1 flex items-center justify-between">
            <span>No-Match Rate</span>
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400 font-mono">{summary.noMatchRate}</div>
          <div className="text-[10px] text-purple-400/70 mt-0.5">{summary.noMatchCount} unmapped queries</div>
        </GlassCard>

        <GlassCard className="p-3.5 border-slate-800/80 bg-cyan-950/20 border-cyan-500/20">
          <div className="text-[11px] text-cyan-300 mb-1 flex items-center justify-between">
            <span>Ambiguous</span>
            <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 font-mono">{summary.ambiguousRate}</div>
          <div className="text-[10px] text-cyan-400/70 mt-0.5">{summary.ambiguousCount} multi-matches</div>
        </GlassCard>

        <GlassCard className="p-3.5 border-slate-800/80 bg-rose-950/20 border-rose-500/20">
          <div className="text-[11px] text-rose-300 mb-1 flex items-center justify-between">
            <span>Action Failures</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">{summary.actionFailureRate}</div>
          <div className="text-[10px] text-rose-400/70 mt-0.5">{summary.actionFailureCount} aborted actions</div>
        </GlassCard>
      </div>

      {/* Filters & Search */}
      <GlassCard className="p-4 border-slate-800/80">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by query, task, or feature..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            {['ALL', 'override', 'ambiguous', 'no matching'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {type === 'ALL' ? 'All Errors' : type === 'override' ? 'Overrides' : type === 'ambiguous' ? 'Ambiguous' : 'No-Match'}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Error Ledger Table */}
      <GlassCard className="overflow-hidden border-slate-800/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold">
                <th className="p-3.5 pl-4">Help Query & Task Goal</th>
                <th className="p-3.5">User Role</th>
                <th className="p-3.5">Recommended vs Actual Feature</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Error Classification</th>
                <th className="p-3.5">Override Reason / Rationale</th>
                <th className="p-3.5 pr-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No matching anomaly records found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 pl-4">
                      <div className="font-medium text-white">"{item.query}"</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.taskGoal}</div>
                    </td>
                    <td className="p-3.5">
                      <RoleBadge role={item.role} size="sm" />
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono">
                        <span className="text-indigo-300 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          {item.recommendedFeature}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          {item.actualFeature}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300 font-bold">
                      {item.confidence > 0 ? `${item.confidence}%` : '0%'}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.errorType.toLowerCase().includes('override')
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : item.errorType.toLowerCase().includes('ambiguous')
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}>
                        {item.errorType}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 italic text-[11px]">
                      {item.overrideReason || '—'}
                    </td>
                    <td className="p-3.5 pr-4 text-right text-slate-500 font-mono text-[11px]">
                      {item.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
