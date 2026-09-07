import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Shield,
  Layers,
  Lock
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { governanceApi } from '../services/api';

export const RiskRegisterPage = () => {
  const [riskData, setRiskData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRisks = async () => {
    setIsLoading(true);
    try {
      const res = await governanceApi.getRisks();
      if (res.success) {
        setRiskData(res);
      }
    } catch (e) {
      console.warn('Failed to load risk register:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const summary = riskData?.summary || { total: 10, active: 4, mitigated: 4, monitoring: 2 };
  const risks = riskData?.risks || [];

  const filteredRisks = risks.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status.toUpperCase() === filterStatus.toUpperCase();
    const matchesSearch =
      !searchQuery ||
      r.risk_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mitigation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.owner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'low':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'mitigated':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'monitoring':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'active':
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              Enterprise Risk Register (R1 through R10)
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              Institutional Governance
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Systemic risk assessment, probability/impact scoring, and preventative mitigations across AI recommendation operations.
          </p>
        </div>

        <button
          onClick={fetchRisks}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-all cursor-pointer self-start lg:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
          Refresh Register
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cataloged Risks</span>
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">{summary.total}</div>
          <div className="text-xs text-slate-500 mt-1">R1 to R10 governance scope</div>
        </GlassCard>

        <GlassCard className="p-4 border-slate-800/80 bg-emerald-950/20 border-emerald-500/20">
          <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
            <span>Mitigated Risks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight font-mono">{summary.mitigated}</div>
          <div className="text-xs text-emerald-400/70 mt-1">Technical guardrails active</div>
        </GlassCard>

        <GlassCard className="p-4 border-slate-800/80 bg-cyan-950/20 border-cyan-500/20">
          <div className="flex items-center justify-between text-xs text-cyan-300 mb-1">
            <span>Continuous Monitoring</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 tracking-tight font-mono">{summary.monitoring}</div>
          <div className="text-xs text-cyan-400/70 mt-1">Telemetry & drift tracking</div>
        </GlassCard>

        <GlassCard className="p-4 border-slate-800/80 bg-amber-950/20 border-amber-500/20">
          <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
            <span>Active Reviews</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight font-mono">{summary.active}</div>
          <div className="text-xs text-amber-400/70 mt-1">Ongoing threshold review</div>
        </GlassCard>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-4 border-slate-800/80">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by risk code, title, mitigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            {['ALL', 'ACTIVE', 'MITIGATED', 'MONITORING'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {st === 'ALL' ? 'All Risks' : st}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Risks Table */}
      <GlassCard className="overflow-hidden border-slate-800/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold">
                <th className="p-3.5 pl-4">Risk ID</th>
                <th className="p-3.5">Risk Description</th>
                <th className="p-3.5 text-center">Probability</th>
                <th className="p-3.5 text-center">Impact</th>
                <th className="p-3.5 text-center">Severity</th>
                <th className="p-3.5">Preventative Mitigation Strategy</th>
                <th className="p-3.5">Accountable Owner</th>
                <th className="p-3.5 pr-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRisks.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 pl-4 font-mono font-bold text-amber-400">
                    {r.risk_code}
                  </td>
                  <td className="p-3.5 font-medium text-white max-w-[200px]">
                    {r.title}
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-400">
                    {r.probability}
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-400">
                    {r.impact}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${getSeverityBadge(r.severity)}`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300 leading-relaxed max-w-sm">
                    {r.mitigation}
                  </td>
                  <td className="p-3.5 text-slate-400 font-medium whitespace-nowrap">
                    {r.owner}
                  </td>
                  <td className="p-3.5 pr-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
