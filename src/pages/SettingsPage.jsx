import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  User,
  ShieldCheck,
  Building,
  Sparkles,
  LogOut,
  Mail,
  KeyRound,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const SettingsPage = () => {
  const { currentRole, currentUser, logout } = useRole();
  const navigate = useNavigate();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleConfirmLogout = () => {
    setLogoutConfirmOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            Account & Portal Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Authenticated identity profile, security credentials, and discovery preferences.
          </p>
        </div>

        <RoleBadge role={currentRole} size="md" />
      </div>

      {/* Active University Identity */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Authenticated University Identity
            </h2>
          </div>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            SSO Session Active
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-6">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl ring-2 ring-indigo-500/40 object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white truncate">{currentUser.name}</h3>
              <RoleBadge role={currentRole} size="sm" />
            </div>
            <p className="text-xs text-slate-300 font-medium">{currentUser.title}</p>
            <p className="text-xs text-slate-400">{currentUser.department}</p>
          </div>

          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-2 self-stretch sm:self-auto justify-center"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Security & Credentials Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-[11px] block">University Email</span>
            <div className="text-slate-200 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentUser.email}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-[11px] block">Institutional User ID</span>
            <div className="text-slate-200 font-medium font-mono flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentUser.id}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-[11px] block">Standing & Tenure</span>
            <div className="text-slate-200 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentUser.standing}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-[11px] block">Active Academic Term</span>
            <div className="text-slate-200 font-medium flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-purple-400" />
              <span>{currentUser.term}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* AI Discovery Engine Preferences */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Discovery Engine Preferences</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">Strict Role Isolation</p>
              <p className="text-[11px] text-slate-400">Enforce role boundaries and prevent execution of cross-role workflows.</p>
            </div>
            <input type="checkbox" defaultChecked disabled className="rounded accent-indigo-500 w-4 h-4 cursor-not-allowed" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">Cross-Department Synonyms</p>
              <p className="text-[11px] text-slate-400">Match queries across Registrar, Bursar, and Academic Directorate vocabularies.</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded accent-indigo-500 w-4 h-4" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">Audit Logging Telemetry</p>
              <p className="text-[11px] text-slate-400">Send anonymized query resolution latency and auth events to audit trail.</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded accent-indigo-500 w-4 h-4" />
          </div>
        </div>
      </GlassCard>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutConfirmOpen}
        title="Confirm Sign Out"
        message="Are you sure you want to log out of your university session? You will need to re-authenticate to access student or faculty services."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
        variant="danger"
      />
    </div>
  );
};
