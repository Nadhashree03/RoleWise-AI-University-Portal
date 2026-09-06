import React, { useState } from 'react';
import {
  Compass,
  Search,
  CheckCircle,
  Lock,
  ArrowRight,
  Sparkles,
  CreditCard,
  CalendarCheck,
  FileCheck,
  UserCheck,
  Users,
  UploadCloud,
  GraduationCap,
  Coins,
  Award,
  BarChart3,
  Layers,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import { MOCK_FEATURES } from '../data/mockData';

export const FeaturesPage = () => {
  const { currentRole, switchRole, openFeature } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Finance & Accounts',
    'Academics & Attendance',
    'Certifications & Records',
    'Instruction & Roll Call',
    'Advising & Cohort Analytics',
    'Admissions Governance',
    'Credential Governance',
    'System Governance & Telemetry',
  ];

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

  // Filter based on search query and category
  const matchesFilter = (feat) => {
    const matchesSearch =
      feat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || feat.category === selectedCategory;

    return matchesSearch && matchesCategory;
  };

  // Group features into Accessible (active role) and Restricted (other roles)
  const accessibleFeatures = MOCK_FEATURES.filter(
    (feat) => feat.allowedRoles.includes(currentRole) && matchesFilter(feat)
  );

  const restrictedFeatures = MOCK_FEATURES.filter(
    (feat) => !feat.allowedRoles.includes(currentRole) && matchesFilter(feat)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-400" />
            University Features Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Role-aware catalog with strict access boundaries and feature discovery status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400">Active Permissions:</span>
          <RoleBadge role={currentRole} size="md" />
        </div>
      </div>

      {/* Role State Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-slate-300">
            Currently showing <strong>{accessibleFeatures.length} accessible features</strong> for{' '}
            <span className="text-cyan-300 font-semibold capitalize">{currentRole}</span>.{' '}
            <span className="text-slate-500">({restrictedFeatures.length} features restricted to other roles)</span>
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <RoleBadge role={currentRole} size="sm" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features by name, keyword, or department..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        {/* Category Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600/30 text-white border border-indigo-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 1. PRIORITIZED ACCESSIBLE FEATURES SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Accessible {currentRole.toUpperCase()} Features ({accessibleFeatures.length})
          </h2>
          <span className="text-[11px] text-slate-500">Fully authorized for your active profile</span>
        </div>

        {accessibleFeatures.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
            No accessible features match the active search or category filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessibleFeatures.map((feat) => {
              const Icon = getIconComponent(feat.icon);
              return (
                <GlassCard
                  key={feat.id}
                  hoverEffect={true}
                  className="p-5 flex flex-col justify-between border-emerald-500/30 bg-slate-900/80 hover:border-emerald-500/50 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {feat.category}
                      </span>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        Accessible
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-cyan-300 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {feat.title}
                        </h3>
                        <div className="text-[11px] text-slate-400">Dept: {feat.department}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {feat.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {feat.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                      <span className="text-[11px] text-slate-500">Frequency: {feat.frequency}</span>
                      <span className="text-[11px] text-emerald-400 font-semibold">{feat.status}</span>
                    </div>

                    <button
                      onClick={() => openFeature(feat.id)}
                      className="mt-3 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.01]"
                    >
                      <span>Launch {feat.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. RESTRICTED / NO ACCESS FEATURES SECTION */}
      <div className="space-y-3 pt-6 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-rose-400/90 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            Restricted University Features ({restrictedFeatures.length})
          </h2>
          <span className="text-[11px] text-slate-500">Requires different role authorization</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restrictedFeatures.map((feat) => {
            const Icon = getIconComponent(feat.icon);
            const requiredRole = feat.allowedRoles[0];

            return (
              <GlassCard
                key={feat.id}
                className="p-5 flex flex-col justify-between border-rose-500/20 bg-slate-950/50 opacity-75"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {feat.category}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                      <Lock className="w-3 h-3 text-rose-400" />
                      Restricted / No Access
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-300">
                        {feat.title}
                      </h3>
                      <div className="text-[11px] text-slate-500">Dept: {feat.department}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {feat.description}
                  </p>
                </div>

                <div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 mb-2">
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Requires <strong>{requiredRole.toUpperCase()}</strong> credentials</span>
                  </div>

                  <button
                    onClick={() => openFeature(feature)}
                    className="w-full py-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/40 text-xs text-slate-400 hover:text-rose-300 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Restricted ({requiredRole.toUpperCase()} Only)</span>
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
