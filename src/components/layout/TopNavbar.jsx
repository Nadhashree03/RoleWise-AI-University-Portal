import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  ChevronDown,
  LogOut,
  User,
  Shield,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Command,
  Building,
  KeyRound
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole, ROLES } from '../../context/RoleContext';
import { RoleBadge } from '../common/RoleBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const TopNavbar = ({ setMobileOpen }) => {
  const { currentRole, currentUser, logout } = useRole();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleConfirmLogout = () => {
    setLogoutConfirmOpen(false);
    setProfileMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
        {/* Left section: Mobile trigger & Search bar */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Smart Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.target.elements.searchQuery;
              if (input && input.value.trim()) {
                navigate('/assistant');
              }
            }}
            className="relative flex-1 group hidden sm:block"
          >
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              name="searchQuery"
              type="text"
              placeholder={`Ask RoleWise AI to discover services for ${currentUser.name.split(' ')[0]}...`}
              className="w-full pl-10 pr-24 py-2 bg-slate-900/60 hover:bg-slate-900/90 focus:bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
              <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/60 rounded">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </div>
          </form>
        </div>

        {/* Right Section: Status, Active Role Badge, Notifications, User Profile */}
        <div className="flex items-center gap-3">
          {/* AI Engine Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">AI Engine:</span>
            <span className="text-cyan-300 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Active
            </span>
          </div>

          {/* Static Active Role Indicator */}
          <div className="hidden sm:flex items-center">
            <RoleBadge role={currentRole} size="sm" />
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setProfileMenuOpen(false);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 relative transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-950" />
            </button>

            {notificationOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/95 border border-slate-800 p-3 shadow-2xl shadow-black/80 backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-200">Role Notifications</span>
                    <span className="text-[10px] text-indigo-400 font-medium">3 New</span>
                  </div>
                  <div className="py-2 space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <p className="text-slate-300 font-medium">New Feature Recommendation</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {currentRole === ROLES.STUDENT && 'Fall semester elective scheduler is now accessible.'}
                        {currentRole === ROLES.FACULTY && 'Mid-term grade submission portal has opened.'}
                        {currentRole === ROLES.ADMIN && 'System compliance audit report is ready for review.'}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">10m ago</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Menu with Dropdown & Logout */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileMenuOpen(!profileMenuOpen);
                setNotificationOpen(false);
              }}
              className="flex items-center gap-3 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all text-left group"
              aria-label="User profile menu"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full ring-1 ring-slate-700 object-cover group-hover:ring-indigo-500/50 transition-all"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {currentUser.id}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors hidden sm:block" />
            </button>

            {/* Profile Menu Dropdown */}
            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/98 border border-slate-800 p-3 shadow-2xl shadow-black/80 backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                  {/* User Profile Summary */}
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-2">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full ring-1 ring-slate-700 object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate">{currentUser.name}</span>
                        <RoleBadge role={currentRole} size="sm" showIcon={false} />
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {currentUser.id}</div>
                    </div>
                  </div>

                  {/* Active Department & Academic Info */}
                  <div className="px-2 py-1.5 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Department</span>
                      <span className="text-slate-300 truncate max-w-[170px]" title={currentUser.department}>
                        {currentUser.department?.replace('Department of ', '')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Session Status</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Authenticated SSO
                      </span>
                    </div>
                  </div>

                  <div className="my-2 border-t border-slate-800" />

                  {/* Profile Actions */}
                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <User className="w-4 h-4 text-indigo-400" />
                      <span>Account & Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/audit');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-cyan-400" />
                      <span>Audit & Activity Trail</span>
                    </button>
                  </div>

                  <div className="my-2 border-t border-slate-800" />

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setLogoutConfirmOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 text-xs font-semibold transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <LogOut className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                      <span>Sign Out</span>
                    </div>
                    <span className="text-[10px] text-rose-400/80 font-normal">End Session</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutConfirmOpen}
        title="Confirm Sign Out"
        message="Are you sure you want to log out of your university session? Your active authentication token will be cleared and you will be redirected to the sign-in portal."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
        variant="danger"
      />
    </>
  );
};
