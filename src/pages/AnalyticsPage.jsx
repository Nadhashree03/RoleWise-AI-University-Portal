import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Search,
  Sparkles,
  Users,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Layers,
  Cpu
} from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import { FEATURE_USAGE_EVENTS, HELP_SEARCH_QUERIES } from '../data/mockData';

export const AnalyticsPage = () => {
  const { currentRole, openFeature } = useRole();

  const roleMetrics = {
    [ROLES.STUDENT]: [
      { label: 'Student Feature Queries', value: '48,210', change: '+14.2%', period: 'this semester', icon: Search, color: 'text-indigo-400' },
      { label: 'Attendance Check Frequency', value: '3.4x / wk', change: '+8.1%', period: 'active monitoring', icon: Clock, color: 'text-cyan-400' },
      { label: 'Fee Clearance On-Time Rate', value: '92.6%', change: '+3.4%', period: 'vs last cycle', icon: TrendingUp, color: 'text-emerald-400' },
      { label: 'Certificate Downloads', value: '3,840', change: '+28.0%', period: 'digital verifications', icon: CheckCircle2, color: 'text-purple-400' },
    ],
    [ROLES.FACULTY]: [
      { label: 'Faculty Roster Submissions', value: '1,420', change: '+9.4%', period: 'daily roll-calls', icon: Clock, color: 'text-indigo-400' },
      { label: 'At-Risk Deficit Alerts Sent', value: '84', change: '-12.1%', period: 'improved attendance', icon: Sparkles, color: 'text-cyan-400' },
      { label: 'Biometric Sheet Syncs', value: '312', change: '+18.5%', period: 'batch uploads', icon: TrendingUp, color: 'text-emerald-400' },
      { label: 'Avg. Attendance Mark Time', value: '1.2 min', change: '-45.0%', period: 'faster than manual', icon: Users, color: 'text-purple-400' },
    ],
    [ROLES.ADMIN]: [
      { label: 'Total Campus Queries', value: '142,890', change: '+18.4%', period: 'all 3 roles', icon: Search, color: 'text-indigo-400' },
      { label: 'Rule Engine Accuracy', value: '94.2%', change: '+4.1%', period: 'zero hallucination', icon: Cpu, color: 'text-cyan-400' },
      { label: 'Tuition Reconciled', value: '₹4.82 Cr', change: '+95.2%', period: 'current cycle', icon: TrendingUp, color: 'text-emerald-400' },
      { label: 'Degrees & Credentials Signed', value: '1,325', change: '+15.8%', period: 'batch RSA-4096', icon: CheckCircle2, color: 'text-purple-400' },
    ],
  };

  const topSearchedFeatures = [
    { name: 'Pay Fees (Online Tuition Portal)', role: 'Student', featureId: 'pay-fees', count: 18400, percent: '92%' },
    { name: 'View Attendance & Exam Threshold (75%)', role: 'Student', featureId: 'view-attendance', count: 16200, percent: '84%' },
    { name: 'Mark Attendance (Daily Lecture Roll Call)', role: 'Faculty', featureId: 'mark-attendance', count: 14800, percent: '76%' },
    { name: 'Manage Admissions (Merit Intake Pipeline)', role: 'Admin', featureId: 'manage-admissions', count: 9400, percent: '62%' },
    { name: 'Download Certificate (Bona Fide & Transcripts)', role: 'Student', featureId: 'download-certificate', count: 8600, percent: '58%' },
    { name: 'Manage Fees (Reconciliation & Defaults)', role: 'Admin', featureId: 'manage-fees', count: 7100, percent: '49%' },
    { name: 'View Student Attendance (At-Risk Alerts)', role: 'Faculty', featureId: 'view-student-attendance', count: 6800, percent: '44%' },
    { name: 'Generate Certificates (Convocation Signoff)', role: 'Admin', featureId: 'generate-certificates', count: 5200, percent: '38%' },
  ];

  const currentMetrics = roleMetrics[currentRole] || roleMetrics[ROLES.STUDENT];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Feature Telemetry & Discovery Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time analytics on university role activity, feature adoption, and recommendation rule resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Analytics View:</span>
          <RoleBadge role={currentRole} size="md" />
        </div>
      </div>

      {/* Role-Specific Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <GlassCard key={i} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium">{m.label}</span>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-white tracking-tight">{m.value}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span className="text-emerald-400 font-semibold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {m.change}
                </span>
                <span className="text-slate-500">{m.period}</span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Top Discovered Features Table with Instant Launch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Most Discovered Role Features</h2>
              <p className="text-xs text-slate-400">Ranked by actual invocation volume across student, faculty, and administrative tiers</p>
            </div>
            <span className="text-xs text-indigo-400 font-medium">Telemetry Stream</span>
          </div>

          <div className="space-y-4">
            {topSearchedFeatures.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openFeature(item.featureId)}
                      className="text-slate-200 font-medium hover:text-cyan-300 transition-colors text-left"
                    >
                      {item.name}
                    </button>
                    <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {item.role}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono">{item.count.toLocaleString()} calls</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
                    style={{ width: item.percent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Role Engagement & Compliance Panel */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Campus Engagement Distribution</h2>
            <p className="text-xs text-slate-400 mb-6">Active usage percentage by university role profile</p>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-300 mb-1">
                  <span>Student Persona (Aarav Sharma)</span>
                  <span>64%</span>
                </div>
                <p className="text-[11px] text-slate-400">Primary activity: fee payments & attendance threshold audits</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-300 mb-1">
                  <span>Faculty Persona (Dr. Vance)</span>
                  <span>26%</span>
                </div>
                <p className="text-[11px] text-slate-400">Primary activity: lecture roll-call & at-risk student monitoring</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-300 mb-1">
                  <span>Admin Persona (Marcus Ray)</span>
                  <span>10%</span>
                </div>
                <p className="text-[11px] text-slate-400">Primary activity: admissions review, fee reconciliation, certificate issuing</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-center">
            <span className="text-xs text-indigo-300 font-medium">
              Transparent Rule Engine: Zero API Token Cost
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
