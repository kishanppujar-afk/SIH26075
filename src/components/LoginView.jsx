import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, ExternalLink, Lock, User, UserPlus } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { api } from '../api/client';
import LoginBlossomScene from './LoginBlossomScene';

export default function LoginView() {
  const navigate = useNavigate();
  const { setSessionAuth, refreshEmployee } = useSession();

  const [isRegistering, setIsRegistering] = useState(false);
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('trainee');
  const [department, setDepartment] = useState('RMC Delhi');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ssoToast, setSsoToast] = useState(false);
  const [managerAdminNotice, setManagerAdminNotice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await api.register({
          name: name.trim(),
          email: emailOrId.trim(),
          password,
          role,
          department,
          designation: 'Staff',
          education: 'General',
          experience_years: 0
        });
        setSuccessMessage('Registration successful! Your account is pending MoES/IMD Administrator approval.');
        setIsRegistering(false);
        setPassword('');
      } else {
        const res = await api.login(emailOrId.trim(), password);

        // Check role (accept trainee and employee for backward compatibility)
        if (res.role === 'trainee' || res.role === 'employee') {
          // Authenticate into trainee portal
          setSessionAuth({
            token: res.access_token,
            role: res.role,
            employee: res.employee,
          });

          if (refreshEmployee) refreshEmployee();

          setTimeout(() => navigate('/dashboard'), 200);
        } else {
          // Account belongs to Trainer/Admin dashboard (separate app at http://localhost:5174)
          setManagerAdminNotice({
            role: res.role,
            name: res.employee?.name || 'Administrator',
            id: res.employee?.id,
            department: res.employee?.department || 'Central Administration',
            url: 'http://localhost:5174',
          });
        }
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Authentication failed. Please verify your details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParichayClick = () => {
    setSsoToast(true);
    setTimeout(() => setSsoToast(false), 3400);
  };

  const fillQuickCredentials = (identifier, pass) => {
    setIsRegistering(false);
    setEmailOrId(identifier);
    setPassword(pass);
    setErrorMessage('');
    setSuccessMessage('');
    setManagerAdminNotice(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#011B22] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden font-sans select-none">
      {/* 1. Teal Ambient & Blossom Background Scene */}
      <LoginBlossomScene />

      {/* 2. Main Two-Zone Responsive Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 min-h-[calc(100vh-4rem)]">
        {/* Left Ambient Hero Zone */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          className="flex-1 text-center lg:text-left max-w-xl lg:pr-6 pt-4 lg:pt-0"
        >
          {/* Brand pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md mb-4 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-200 animate-pulse" />
            <span>Digital Capacity Building</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] drop-shadow-sm">
            Nurture your potential.{' '}
            <span className="bg-gradient-to-r from-teal-100 via-teal-50 to-white bg-clip-text text-transparent">
              Master the elements.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-white/95 leading-relaxed font-normal max-w-lg mx-auto lg:mx-0 drop-shadow-xs">
            A continuous, mentor-driven intelligence portal aligning MoES and IMD competency standards with individualized learning pathways.
          </p>

          {/* Micro stats counter badge */}
          <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-white/90 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-xs"></span>
              Official MoES &amp; IMD Pathways
            </span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-300 shadow-xs"></span>
              Algorithmic Trainer Matching
            </span>
          </div>

          {/* Quick demo switcher pills */}
          <div className="mt-8 pt-6 border-t border-white/15 text-left hidden sm:block">
            <p className="text-[11px] font-semibold text-teal-200/90 uppercase tracking-wider mb-2">
              Quick Test Accounts (Click to Fill):
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillQuickCredentials('ramesh@imd.gov.in', 'password123')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer text-[11px]"
              >
                Trainee (Ramesh)
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('roy@imd.gov.in', 'password123')}
                className="px-2.5 py-1 rounded-lg bg-teal-500/25 hover:bg-teal-500/40 border border-teal-300/40 text-teal-200 transition cursor-pointer text-[11px]"
              >
                Trainer (Dr. Roy)
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('admin@imd.gov.in', 'admin123')}
                className="px-2.5 py-1 rounded-lg bg-amber-500/25 hover:bg-amber-500/40 border border-amber-300/40 text-amber-200 transition cursor-pointer text-[11px]"
              >
                Admin (Dr. Mohapatra)
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Zone: Translucent Frosted Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }}
          className="relative w-full max-w-md"
        >
          {/* Ambient backlight halo */}
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-teal-400/25 via-pink-300/15 to-teal-200/30 rounded-[28px] blur-xl opacity-75 pointer-events-none" />

          {/* Translucent Glass Card */}
          <div className="relative rounded-2xl sm:rounded-3xl border border-white/30 bg-white/[0.20] p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-teal-950/40">
            {/* Header / Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 text-white shadow-md shadow-teal-950/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white">CAPACITY CONNECT</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white border border-white/30">
                    Govt Portal
                  </span>
                </div>
                <p className="text-[11px] text-teal-100/90 font-medium">MoES / IMD Administration</p>
              </div>
            </div>

            {/* Success Banner */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 flex items-start gap-2.5 rounded-xl bg-teal-500/25 border border-teal-400/40 p-3 text-xs text-teal-100 backdrop-blur-md"
                >
                  <ShieldCheck className="h-4 w-4 text-teal-300 shrink-0 mt-0.5" />
                  <div className="leading-snug">{successMessage}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Banner */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 flex items-start gap-2.5 rounded-xl bg-rose-500/25 border border-rose-400/40 p-3 text-xs text-rose-100 backdrop-blur-md"
                >
                  <AlertCircle className="h-4 w-4 text-rose-300 shrink-0 mt-0.5" />
                  <div className="leading-snug">{errorMessage}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manager / Admin Redirection Notice Screen */}
            {managerAdminNotice ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-5 space-y-4"
              >
                <div className="rounded-xl bg-teal-950/70 border border-teal-400/40 p-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-400/20 text-teal-200 border border-teal-400/40">
                      {managerAdminNotice.role === 'admin' ? 'Admin Account' : 'Trainer Account'}
                    </span>
                    <span className="text-[11px] text-slate-300 font-mono">{managerAdminNotice.id}</span>
                  </div>

                  <h3 className="mt-2.5 text-base font-bold text-white">
                    {managerAdminNotice.name}
                  </h3>
                  <p className="text-xs text-teal-200/80 mt-0.5">
                    {managerAdminNotice.department}
                  </p>

                  <div className="mt-3 text-xs text-slate-200 leading-relaxed bg-white/10 p-3 rounded-lg border border-white/10">
                    This account holds <strong>{managerAdminNotice.role.toUpperCase()}</strong> authority.
                    Management and organizational analytics are served from the dedicated Manager &amp; Admin Portal at{' '}
                    <code className="text-teal-200 font-mono font-semibold">{managerAdminNotice.url}</code>.
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <a
                    href={managerAdminNotice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-[0.99] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-950/40 hover:brightness-105 transition cursor-pointer"
                  >
                    <span>Open Manager / Admin Portal</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setManagerAdminNotice(null);
                      setEmailOrId('');
                      setPassword('');
                    }}
                    className="w-full py-2 text-xs text-teal-200 hover:text-white transition cursor-pointer underline underline-offset-4"
                  >
                    Sign in with a different account
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Standard Employee Login Form */
              <>
                <div className="mt-5 border-l-2 border-teal-300 pl-3 py-0.5 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-white tracking-wide">
                      {isRegistering ? 'Register for Portal Access' : 'Trainee Capability Portal'}
                    </p>
                    <p className="text-[11px] text-teal-100/90 mt-0.5 font-normal">
                      {isRegistering ? 'Enter your details below.' : 'Enter your email to continue.'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-xs text-white underline">
                    {isRegistering ? 'Login Instead' : 'Register'}
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  {isRegistering && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-white mb-1.5">Full Name</label>
                        <input
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Priya Verma"
                          className="w-full rounded-xl border border-white/40 bg-white/90 px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300/50"
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-white mb-1.5">Role</label>
                          <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full rounded-xl border border-white/40 bg-white/90 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none"
                          >
                            <option value="trainee">Trainee</option>
                            <option value="trainer">Trainer</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-white mb-1.5">Department</label>
                          <input
                            required
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="e.g. RMC Chennai"
                            className="w-full rounded-xl border border-white/40 bg-white/90 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {/* Field 1: Email or Username */}
                  <div>
                    <label htmlFor="login-email" className="block text-xs font-semibold text-white mb-1.5">
                      Email Address <span className="text-rose-300">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        id="login-email"
                        type="text"
                        required
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                        placeholder="e.g. ramesh@imd.gov.in"
                        className="w-full rounded-xl border border-white/40 bg-white/90 pl-9 pr-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-300/50 transition-all duration-200 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Field 2: Password */}
                  <div>
                    <label htmlFor="login-password" className="block text-xs font-semibold text-white mb-1.5">
                      Password <span className="text-rose-300">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="login-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-white/40 bg-white/90 pl-9 pr-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-300/50 transition-all duration-200 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-[0.99] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-950/30 hover:shadow-teal-950/50 hover:brightness-105 transition-all duration-150 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? 'Processing...' : isRegistering ? 'Submit Registration' : 'Sign In to Portal'}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
                  </button>

                  {/* Secondary Action: Government Parichay SSO Nod */}
                  {!isRegistering && (
                    <button
                      type="button"
                      onClick={handleParichayClick}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/20 hover:bg-white/30 px-3 py-2 text-xs font-medium text-white active:scale-[0.99] transition-all duration-150 cursor-pointer backdrop-blur-sm"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-teal-200" />
                      <span>Sign in with Parichay SSO</span>
                    </button>
                  )}
                </form>
              </>
            )}

            {/* Parichay SSO Toast */}
            <AnimatePresence>
              {ssoToast && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 rounded-lg bg-teal-900/90 border border-teal-500/50 px-3 py-2 text-center text-[11px] text-teal-100 font-medium backdrop-blur-md"
                >
                  Govt Parichay Single Sign-On is simulated. Use your registered MoES credentials.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Footer copyright / government acknowledgment */}
      <div className="relative z-10 text-center py-2 text-[11px] text-white/80 font-normal">
        CAPACITY CONNECT • Ministry of Earth Sciences • India Meteorological Department
      </div>
    </div>
  );
}
