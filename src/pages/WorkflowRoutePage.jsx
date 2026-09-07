import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Compass,
  LayoutDashboard,
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
  ExternalLink,
  Lock
} from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';
import { MOCK_FEATURES } from '../data/mockData';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';

export const WorkflowRoutePage = ({ featureId: directFeatureId }) => {
  const { featureId: paramFeatureId } = useParams();
  const featureId = directFeatureId || paramFeatureId;
  const { currentRole, openFeature } = useRole();
  const navigate = useNavigate();

  const feature = MOCK_FEATURES.find((f) => f.id === featureId);

  useEffect(() => {
    if (feature && feature.allowedRoles.includes(currentRole)) {
      // Automatically open the interactive feature action modal
      openFeature(feature);
    }
  }, [featureId, currentRole]);

  if (!feature) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Feature Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested service identifier &quot;{featureId}&quot; does not exist in the institutional directory.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const getIcon = () => {
    switch (feature.id) {
      case 'pay-fees': return CreditCard;
      case 'view-attendance': return CalendarCheck;
      case 'download-certificate': return FileCheck;
      case 'track-admission': return Compass;
      case 'mark-attendance': return UserCheck;
      case 'view-student-attendance': return Users;
      case 'upload-attendance': return UploadCloud;
      case 'manage-admissions': return GraduationCap;
      case 'manage-fees': return Coins;
      case 'generate-certificates': return Award;
      case 'view-analytics': return BarChart3;
      default: return Sparkles;
    }
  };

  const Icon = getIcon();

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button
            onClick={() => navigate('/dashboard')}
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <span>/</span>
          <button
            onClick={() => navigate('/features')}
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Services</span>
          </button>
          <span>/</span>
          <span className="text-slate-200 font-medium">{feature.title}</span>
        </div>

        <RoleBadge role={currentRole} size="sm" />
      </div>

      {/* Feature Service Banner Card */}
      <GlassCard className="p-6 sm:p-8 relative overflow-hidden border-indigo-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-cyan-300 shadow-lg shadow-indigo-950 flex-shrink-0">
              <Icon className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                  {feature.category}
                </span>
                <span className="text-xs text-slate-400">
                  Department: <strong className="text-slate-300">{feature.department}</strong>
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {feature.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => openFeature(feature)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 transition-all flex-shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Launch Service Workspace</span>
          </button>
        </div>
      </GlassCard>

      {/* Institutional Policy Notice */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>
            Access authorized under role clearance: <strong className="text-white uppercase">{currentRole}</strong>. All actions audited.
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Module: {feature.id}</span>
      </div>
    </div>
  );
};
