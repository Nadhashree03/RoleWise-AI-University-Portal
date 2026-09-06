import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  HelpCircle,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { useRole, ROLES, DEMO_ACCOUNTS } from '../context/RoleContext';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';

export const LoginPage = () => {
  const { isLoggedIn, currentRole, login } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [activeAccountLabel, setActiveAccountLabel] = useState(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isLoggedIn && !loginSuccess) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, navigate, loginSuccess]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your University Email or User ID.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    // Simulate authentic network SSO authentication latency
    setTimeout(() => {
      const result = login(identifier, password);
      setIsLoading(false);

      if (result.success) {
        setLoginSuccess(true);
        setActiveAccountLabel(result.role);
        setTimeout(() => {
          const from = location.state?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        }, 600);
      } else {
        setError(result.error);
      }
    }, 450);
  };

  const handleQuickFill = (acc) => {
    setIdentifier(acc.email);
    setPassword(acc.password);
    setError(null);
  };

  const handleQuickLogin = (acc) => {
    setIdentifier(acc.email);
    setPassword(acc.password);
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(acc.email, acc.password);
      setIsLoading(false);

      if (result.success) {
        setLoginSuccess(true);
        setActiveAccountLabel(result.role);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      } else {
        setError(result.error);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Ambient Background Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-1/4 w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[150px]" />
        <div className="absolute top-[-10%] right-1/4 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] left-1/3 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[160px]" />
      </div>

      {/* Institutional Top Navbar */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              RoleWise <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">AI SSO</span>
            </h1>
            <p className="text-[11px] text-slate-400">University Student Services Portal</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Institutional SSO Gateway v2.4</span>
        </div>
      </header>

      {/* Main Authentication Card & Helper */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Card Title & Intro */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Access fee settlements, course attendance, certificates, and academic admissions
            </p>
          </div>

          {/* Login Form Container */}
          <GlassCard className="p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 border-slate-800/80 backdrop-blur-2xl relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />

            {/* Error Notification Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">Authentication Error</span>
                  <span className="text-rose-200/90">{error}</span>
                </div>
              </div>
            )}

            {/* Success Notification Banner */}
            {loginSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-semibold block">Credentials Verified</span>
                  <span className="text-emerald-200/90">
                    Redirecting to {activeAccountLabel?.toUpperCase()} dashboard...
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Identifier Input */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>University Email or User ID</span>
                  <span className="text-[10px] text-slate-500 font-normal">e.g. student@rolewise.edu</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError(null);
                    }}
                    disabled={isLoading || loginSuccess}
                    placeholder="student@rolewise.edu or 2023BCSE0142"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 hover:bg-slate-950 focus:bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-500">Case-sensitive</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    disabled={isLoading || loginSuccess}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 hover:bg-slate-950 focus:bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex="-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || loginSuccess}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/60 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating Identity...</span>
                    </>
                  ) : loginSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Authenticated! Loading Portal...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to University Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-500" /> AES-256 Encrypted
              </span>
              <span>Campus Directory v2.4</span>
            </div>
          </GlassCard>

          {/* Prototype Demo Accounts Helper Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                Evaluation Demo Accounts
              </span>
              <span className="text-[10px] text-slate-500">Click to autofill</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isStudent = acc.role === ROLES.STUDENT;
                const isFaculty = acc.role === ROLES.FACULTY;
                const isAdmin = acc.role === ROLES.ADMIN;

                const borderHover = isStudent
                  ? 'hover:border-emerald-500/40'
                  : isFaculty
                  ? 'hover:border-indigo-500/40'
                  : 'hover:border-amber-500/40';

                return (
                  <div
                    key={acc.role}
                    className={`p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 ${borderHover} transition-all duration-200 flex items-center justify-between gap-3 text-left`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-9 h-9 rounded-full ring-1 ring-slate-700 object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{acc.name}</span>
                          <RoleBadge role={acc.role} size="sm" showIcon={false} />
                        </div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
                          <span>{acc.email}</span>
                          <span className="text-slate-600">•</span>
                          <code className="text-[10px] text-slate-400 bg-slate-950 px-1 py-0.5 rounded font-mono">
                            {acc.password}
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuickFill(acc)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
                        title="Fill inputs"
                      >
                        Fill
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin(acc)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 text-[11px] font-semibold transition-all shadow-sm"
                        title="Instantly sign in"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full px-6 py-4 border-t border-slate-800/60 text-center text-xs text-slate-500">
        RoleWise AI • University Student Services & Identity Management Prototype • Academic Year 2025-26
      </footer>
    </div>
  );
};
