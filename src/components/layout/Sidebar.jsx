import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  BarChart3,
  ShieldAlert,
  Settings,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { useRole, ROLES } from '../../context/RoleContext';
import { RoleBadge } from '../common/RoleBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const Sidebar = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const { currentRole, currentUser, logout } = useRole();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/assistant',
      label: 'Discovery Assistant',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30 animate-pulse',
    },
    {
      to: '/features',
      label: 'Features Directory',
      icon: Compass,
      badge: null,
    },
    {
      to: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: currentRole === ROLES.ADMIN ? 'Full' : null,
    },
    {
      to: '/audit',
      label: 'Audit Trail',
      icon: ShieldAlert,
      badge: currentRole === ROLES.ADMIN ? 'Admin' : 'Restricted',
      badgeColor: currentRole === ROLES.ADMIN ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400',
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const roleConfigs = [
    { id: ROLES.STUDENT, label: 'Student', icon: GraduationCap, color: 'text-emerald-400' },
    { id: ROLES.FACULTY, label: 'Faculty', icon: BookOpen, color: 'text-indigo-400' },
    { id: ROLES.ADMIN, label: 'Admin', icon: ShieldCheck, color: 'text-amber-400' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header / Brand Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 flex-shrink-0">
              <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  RoleWise <span className="text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-extrabold uppercase">AI</span>
                </span>
                <span className="text-[11px] text-slate-400 tracking-wider uppercase font-medium">Campus Discovery</span>
              </div>
            )}
          </div>

          {/* Desktop collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Active Role Highlight */}
        {!isCollapsed ? (
          <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-900/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Active Context</span>
              <RoleBadge role={currentRole} size="sm" />
            </div>
            <div className="mt-1.5 text-xs text-slate-300 font-medium truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {currentUser.department}
            </div>
          </div>
        ) : (
          <div className="py-3 flex justify-center border-b border-slate-800/50">
            <RoleBadge role={currentRole} size="sm" showIcon={false} />
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/30 shadow-md shadow-indigo-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 hover:bg-slate-900/60'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                          item.badgeColor || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip for collapsed view */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Authenticated Session Card & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/70">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SSO Session Active
                  </span>
                  <RoleBadge role={currentRole} size="sm" showIcon={false} />
                </div>
                <div className="flex items-center gap-2.5 mt-2">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full ring-1 ring-slate-700 object-cover"
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {currentUser.id}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setLogoutConfirmOpen(true)}
                className="flex items-center justify-center gap-2 text-xs text-rose-400 hover:text-rose-200 transition-all w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 font-medium"
                title="Sign out of university portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setLogoutConfirmOpen(true)}
                className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:text-rose-200 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutConfirmOpen}
        title="Confirm Sign Out"
        message="Are you sure you want to log out of your university session? You will be returned to the sign-in portal."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          logout();
        }}
        onCancel={() => setLogoutConfirmOpen(false)}
        variant="danger"
      />
    </>
  );
};
