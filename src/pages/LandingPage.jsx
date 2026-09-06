import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Search,
  Compass,
  Zap,
  CheckCircle,
  Lock,
  Layers
} from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';
import { GlassCard } from '../components/common/GlassCard';

export const LandingPage = () => {
  const { loginAs } = useRole();
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    loginAs(role);
    navigate('/dashboard');
  };

  const roleCards = [
    {
      role: ROLES.STUDENT,
      title: 'Student Portal',
      tagline: 'Personalized Academic Journey',
      description: 'Instant discovery of course enrollments, degree audit roadmaps, tutoring hubs, and student life resources tailored to your major.',
      icon: GraduationCap,
      accentColor: 'from-emerald-500/20 to-teal-500/5',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50',
      sampleQueries: [
        '“How do I pay my semester fees online?”',
        '“Check my course attendance percentage”',
        '“Download my bona fide certificate PDF”'
      ],
      features: ['Pay Fees (Online Portal)', 'View Attendance & Thresholds', 'Download Certificate & Transcripts', 'Track Admission Milestones']
    },
    {
      role: ROLES.FACULTY,
      title: 'Faculty Portal',
      tagline: 'Classroom & Advising Workspace',
      description: 'Streamlined access to daily lecture roll-call, at-risk student deficit monitoring, and biometric attendance sheet synchronization.',
      icon: BookOpen,
      accentColor: 'from-indigo-500/20 to-purple-500/5',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/50',
      sampleQueries: [
        '“Mark attendance for CS-480 lecture”',
        '“Identify students below 75% attendance”',
        '“Upload biometric card attendance CSV”'
      ],
      features: ['Mark Attendance (Daily Roll-Call)', 'View Student Attendance (<75% Risk)', 'Upload Attendance (CSV/Biometric)']
    },
    {
      role: ROLES.ADMIN,
      title: 'Administrator Portal',
      tagline: 'Governance & Operations Hub',
      description: 'Complete university infrastructure oversight: intake candidate admissions, fee reconciliation, batch certificate generation, and portal analytics.',
      icon: ShieldCheck,
      accentColor: 'from-amber-500/20 to-orange-500/5',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      buttonClass: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/50',
      sampleQueries: [
        '“Process Batch-3 incoming student admissions”',
        '“Reconcile tuition fee collection gateway”',
        '“Batch sign graduation degree certificates”'
      ],
      features: ['Manage Admissions (Seat Allocations)', 'Manage Fees (Reconciliation & Defaults)', 'Generate Certificates (Batch Signing)', 'View Analytics (Live Portal Telemetry)']
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Lighting / Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[-10%] right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[130px]" />
        <div className="absolute top-[30%] left-1/3 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              RoleWise <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">AI Portal</span>
            </h1>
            <p className="text-[11px] text-slate-400">Intelligent University Feature Discovery</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60">
            <Lock className="w-3.5 h-3.5 text-indigo-400" /> Single Sign-On Simulation Ready
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-xs font-medium text-indigo-300 mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Role-Aware University Services Platform
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Discover the exact university tools <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">
              built for your role.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            RoleWise AI eliminates confusing campus portals. It cuts through hundreds of legacy tools
            to present tailored features, forms, and guidance for your specific university profile.
          </p>
        </div>

        {/* Role Selection Interactive Grid */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 flex items-center justify-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Select a Role Perspective to Enter
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roleCards.map((card) => {
              const Icon = card.icon;
              return (
                <GlassCard
                  key={card.role}
                  hoverEffect={true}
                  gradientBorder={true}
                  className="p-6 flex flex-col justify-between group transition-all"
                  onClick={() => handleSelectRole(card.role)}
                >
                  <div>
                    {/* Top Bar with Icon and Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-200 group-hover:border-indigo-500/50 group-hover:scale-105 transition-all">
                        <Icon className="w-6 h-6 text-slate-200 group-hover:text-cyan-300 transition-colors" />
                      </div>
                      <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                        {card.title.split(' ')[0]}
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-xs text-indigo-300 font-medium mb-3">
                      {card.tagline}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed mb-5">
                      {card.description}
                    </p>

                    {/* Role-Specific Queries Showcase */}
                    <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 mb-5">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 mb-2">
                        <Search className="w-3 h-3 text-indigo-400" />
                        Common Role Queries:
                      </div>
                      <ul className="space-y-1.5">
                        {card.sampleQueries.map((query, idx) => (
                          <li key={idx} className="text-[11px] text-slate-400 italic">
                            {query}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Feature Bullets */}
                    <div className="space-y-1.5 mb-6">
                      {card.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRole(card.role);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all ${card.buttonClass}`}
                  >
                    <span>Enter as {card.title.split(' ')[0]}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/60 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Role-Aware Filter</p>
              <p className="text-[11px] text-slate-400">Restricts irrelevant tools</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">AI Discovery Assistant</p>
              <p className="text-[11px] text-slate-400">Natural language search</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Audit & Governance</p>
              <p className="text-[11px] text-slate-400">Enterprise level compliance</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
