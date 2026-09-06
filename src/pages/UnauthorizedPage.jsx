import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  LayoutDashboard,
  Compass,
  LogOut,
  Sparkles,
  Lock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';

export const UnauthorizedPage = ({ requiredRoles = [ROLES.ADMIN] }) => {
  const { currentRole, currentUser, logout, logAuditEvent } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    logAuditEvent({
      event: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      target: location.pathname || 'restricted-route',
      status: 'Denied (403)',
      ip: '127.0.0.1 (Campus LAN)',
      actor: `${currentUser.name} (${currentRole})`,
      role: currentRole,
      details: `403 Access Denied: User attempted to access protected route "${location.pathname}". Required Role: ${requiredRoles.join(', ').toUpperCase()}`,
    });
  }, [location.pathname]);

  const requiredRolesLabel = requiredRoles
    .map((r) => r.toUpperCase())
    .join(' or ');

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <GlassCard className="p-8 relative overflow-hidden border-rose-500/30 shadow-2xl shadow-rose-950/40">
          {/* Ambient warning background glows */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header & Icon */}
          <div className="flex flex-col items-center text-center space-y-4 relative z-10">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-600/30 via-amber-600/20 to-rose-400/10 border border-rose-500/40 shadow-xl shadow-rose-950/60">
              <ShieldAlert className="w-10 h-10 text-rose-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 p-1 bg-rose-500 rounded-full text-slate-950">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                HTTP 403 Forbidden • Policy Boundary
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Access Restricted
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-md">
                Your authenticated account does not hold the necessary security credentials to access this protected service.
              </p>
            </div>

            {/* Persona Comparison Diagnostic Card */}
            <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-left space-y-3 mt-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Active Session Identity</span>
                <RoleBadge role={currentRole} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Current Authenticated User</span>
                  <strong className="text-slate-200 font-semibold truncate block">
                    {currentUser.name}
                  </strong>
                  <span className="text-slate-400 text-[11px] block font-mono">
                    {currentUser.id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Required Permission Level</span>
                  <strong className="text-rose-400 font-bold block">
                    {requiredRolesLabel}
                  </strong>
                  <span className="text-slate-400 text-[11px] block">
                    Institutional clearance required
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Attempted Route: <code className="text-cyan-300 font-mono">{location.pathname}</code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full pt-4 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/60 transition-all hover:scale-[1.01]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Return to Dashboard</span>
                </button>

                <button
                  onClick={() => navigate('/features')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>View My Features</span>
                </button>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/login', { replace: true });
                }}
                className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-medium flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out to Authenticate as Different User</span>
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
