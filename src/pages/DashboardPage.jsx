import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CreditCard,
  CalendarCheck,
  FileCheck,
  Compass,
  UserCheck,
  Users,
  UploadCloud,
  GraduationCap,
  Coins,
  Award,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Layers,
  Cpu,
  Zap,
  Activity
} from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import { getRecommendationsForRole } from '../engine/recommendationEngine';
import { TASK_GOALS, FEATURE_USAGE_EVENTS } from '../data/mockData';

export const DashboardPage = () => {
  const { currentRole, currentUser, openFeature } = useRole();
  const navigate = useNavigate();

  // Dynamic recommendations for active role
  const recommendations = getRecommendationsForRole(currentRole);
  const currentTaskGoals = TASK_GOALS[currentRole] || [];

  // Filter recent activity specifically for the active role
  const roleRecentActivity = FEATURE_USAGE_EVENTS.filter(
    (evt) => evt.userRole === currentRole
  ).slice(0, 4);

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'CreditCard': return CreditCard;
      case 'CalendarCheck': return CalendarCheck;
      case 'FileCheck': return FileCheck;
      case 'Compass': return Compass;
      case 'UserCheck': return UserCheck;
      case 'Users': return Users;
      case 'UploadCloud': return UploadCloud;
      case 'GraduationCap': return GraduationCap;
      case 'Coins': return Coins;
      case 'Award': return Award;
      case 'BarChart3': return BarChart3;
      default: return Sparkles;
    }
  };

  // Quick action configurations by role
  const quickActionsByRole = {
    [ROLES.STUDENT]: [
      { id: 'pay-fees', label: 'Pay Semester Fees', sub: '₹1,85,000 Due in 10 Days', icon: CreditCard, color: 'text-emerald-400', bg: 'hover:border-emerald-500/50' },
      { id: 'view-attendance', label: 'Check Attendance', sub: '82.4% Safe (>75% Min)', icon: CalendarCheck, color: 'text-cyan-400', bg: 'hover:border-cyan-500/50' },
      { id: 'download-certificate', label: 'Download Certificate', sub: '3 Verified Documents', icon: FileCheck, color: 'text-indigo-400', bg: 'hover:border-indigo-500/50' },
      { id: 'track-admission', label: 'Track Admission', sub: 'Enrolled & Verified', icon: Compass, color: 'text-purple-400', bg: 'hover:border-purple-500/50' },
    ],
    [ROLES.FACULTY]: [
      { id: 'mark-attendance', label: 'Start Daily Roll-Call', sub: 'CS701 & Assigned Courses', icon: UserCheck, color: 'text-indigo-400', bg: 'hover:border-indigo-500/50' },
      { id: 'view-student-attendance', label: 'Inspect At-Risk Students', sub: '4 Students < 75%', icon: Users, color: 'text-rose-400', bg: 'hover:border-rose-500/50' },
      { id: 'upload-attendance', label: 'Upload Attendance CSV', sub: 'Biometric Scanner Sync', icon: UploadCloud, color: 'text-cyan-400', bg: 'hover:border-cyan-500/50' },
    ],
    [ROLES.ADMIN]: [
      { id: 'manage-admissions', label: 'Review Batch Admissions', sub: '48 In Review Pipeline', icon: GraduationCap, color: 'text-indigo-400', bg: 'hover:border-indigo-500/50' },
      { id: 'manage-fees', label: 'Reconcile Fee Gateway', sub: '₹24.25 Lakhs Dues Across 38 Accounts', icon: Coins, color: 'text-amber-400', bg: 'hover:border-amber-500/50' },
      { id: 'generate-certificates', label: 'Batch Sign Degrees', sub: '85 Ready in Queue', icon: Award, color: 'text-purple-400', bg: 'hover:border-purple-500/50' },
      { id: 'view-analytics', label: 'Inspect Portal Telemetry', sub: '24ms Latency • 94.2% Success', icon: BarChart3, color: 'text-cyan-400', bg: 'hover:border-cyan-500/50' },
    ],
  };

  const quickActions = quickActionsByRole[currentRole] || quickActionsByRole[ROLES.STUDENT];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome Persona Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/60 border border-indigo-500/20 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <RoleBadge role={currentRole} size="md" />
              <span className="text-xs text-slate-400 font-medium">
                {currentUser.title} • {currentUser.term}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                [{currentUser.anonymizedCode}]
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300">{currentUser.name}</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentRole === ROLES.STUDENT &&
                'Your personalized student dashboard monitors fee payments, attendance thresholds, degree credentials, and matriculation milestones.'}
              {currentRole === ROLES.FACULTY &&
                'Your faculty instruction dashboard streamlines classroom roll-call, at-risk attendance monitoring, and batch biometric record uploads.'}
              {currentRole === ROLES.ADMIN &&
                'Your central university operations dashboard oversees candidate admissions, tuition fee reconciliations, credential issuance, and system telemetry.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/assistant')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-indigo-950 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Ask AI Discovery Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Role-Specific Key Metrics */}
      <div>
        <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          Live {currentRole.toUpperCase()} Persona Metrics & Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {currentUser.stats.map((stat, idx) => (
            <GlassCard key={idx} className="p-5">
              <div className="text-xs text-slate-400 font-medium mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-indigo-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{stat.note}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* 3. Role-Specific Quick Actions */}
      <div>
        <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          {currentRole.toUpperCase()} Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.id}
                onClick={() => openFeature(qa.id)}
                className={`p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 ${qa.bg} text-left transition-all duration-200 group flex items-start justify-between shadow-md`}
              >
                <div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 w-fit mb-2.5">
                    <Icon className={`w-4 h-4 ${qa.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {qa.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {qa.sub}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all mt-1" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Transparent AI Feature Recommendations */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Intelligent {currentRole.toUpperCase()} Feature Recommendations
            </h2>
            <p className="text-xs text-slate-400">
              Surfaced by transparent rule-based logic without opaque black-box AI.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-indigo-400" /> Rule Engine: Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {recommendations.map((item) => {
            const Icon = getIconComponent(item.icon);
            const rec = item.recommendation;

            return (
              <GlassCard
                key={item.id}
                hoverEffect={true}
                className="p-6 flex flex-col justify-between group border-slate-800/80 hover:border-indigo-500/40"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {item.category}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      {rec.confidence} Match
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Explainability Breakdown */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                        <Info className="w-3 h-3 text-indigo-400" /> Why Recommended:
                      </span>
                      <p className="text-[11px] text-slate-300 mt-0.5 font-medium leading-normal">
                        {rec.why}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Evidence Used:
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-normal font-mono">
                        {rec.evidence}
                      </p>
                    </div>

                    <div className="pt-1 border-t border-slate-900 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Triggered Rule:</span>
                      <span className="font-mono text-cyan-400 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                        {rec.ruleId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Dept: {item.department}
                  </span>
                  <button
                    onClick={() => openFeature(item.id)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-950 transition-all hover:scale-105"
                  >
                    <span>Launch {item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* 5. Role-Specific Recent Activity & Task Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Ledger for Active Role */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-emerald-400" />
                Recent {currentRole.toUpperCase()} Activity
              </h2>
              <p className="text-xs text-slate-400">Timestamped invocations from your persona.</p>
            </div>
            <button
              onClick={() => navigate('/audit')}
              className="text-xs text-indigo-400 hover:underline"
            >
              Full Ledger →
            </button>
          </div>

          <div className="space-y-3">
            {roleRecentActivity.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{evt.action.replace(/_/g, ' ')}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{evt.timestamp} • {evt.networkIp}</div>
                </div>
                <button
                  onClick={() => openFeature(evt.featureId)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-[11px] font-medium transition-colors"
                >
                  Inspect
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Task Goals & Deadlines */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-indigo-400" />
                Active {currentRole.toUpperCase()} Objectives
              </h2>
              <p className="text-xs text-slate-400">Institutional milestones linked to your features.</p>
            </div>
          </div>

          <div className="space-y-3">
            {currentTaskGoals.map((goal) => (
              <div
                key={goal.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{goal.title}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      goal.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300' :
                      goal.priority === 'High' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Due: {goal.deadline}</div>
                </div>

                <button
                  onClick={() => openFeature(goal.featureId)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                >
                  Open Feature
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
