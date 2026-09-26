import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { mockEmployee } from '../mock/employeeData';
import LoginBlossomScene from './LoginBlossomScene';

export default function LoginView() {
  const navigate = useNavigate();
  const { displayName, setDisplayName } = useSession();

  const [nameInput, setNameInput] = useState(displayName || '');
  const [roleInput, setRoleInput] = useState('');
  const [ssoToast, setSsoToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize nameInput when displayName changes (e.g. cleared on sign-out)
  useEffect(() => {
    setNameInput(displayName || '');
  }, [displayName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const finalName = nameInput.trim() || mockEmployee.name;
    setDisplayName(finalName);

    // Brief smooth cross-fade delay into dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 280);
  };

  const handleParichayClick = () => {
    setSsoToast(true);
    setTimeout(() => setSsoToast(false), 3400);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#011B22] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden font-sans select-none">
      {/* 1. Full-bleed Teal Scale & Cherry Blossom Scene (Background) */}
      <LoginBlossomScene />

      {/* 2. Main Two-Zone Responsive Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 min-h-[calc(100vh-4rem)]">
        {/* Left / Ambient Zone: Hero Title & Brand Poetry (Occupies ~55-60% on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          className="flex-1 text-center lg:text-left max-w-xl lg:pr-6 pt-4 lg:pt-0"
        >
          {/* Brand pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md mb-4 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-200 animate-pulse" />
            <span>AI Career &amp; Skill Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] drop-shadow-sm">
            Nurture your potential.{' '}
            <span className="bg-gradient-to-r from-teal-100 via-teal-50 to-white bg-clip-text text-transparent">
              Flourish in your craft.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-white/95 leading-relaxed font-normal max-w-lg mx-auto lg:mx-0 drop-shadow-xs">
            A continuous, mentor-driven intelligence portal aligning national capability standards with your individualized aspirations.
          </p>

          {/* Micro stats counter badge */}
          <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-white/90 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-xs"></span>
              Official NSSTA &amp; MoSPI Pathways
            </span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-300 shadow-xs"></span>
              Autonomous Growth Tracking
            </span>
          </div>
        </motion.div>

        {/* Right Zone: Translucent Frosted Glass Login Card with Warm Light Halo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }}
          className="relative w-full max-w-md"
        >
          {/* Soft warm/teal radiant backlight halo */}
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-teal-400/25 via-pink-300/15 to-teal-200/30 rounded-[28px] blur-xl opacity-75 pointer-events-none" />

          {/* Translucent Glass Form Card */}
          <div className="relative rounded-2xl sm:rounded-3xl border border-white/30 bg-white/[0.20] p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-teal-950/40">
            {/* Header / Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 text-white shadow-md shadow-teal-950/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white">SkillStat AI</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white border border-white/30">
                    Govt Portal
                  </span>
                </div>
                <p className="text-[11px] text-teal-100/90 font-medium">National Statistical Systems</p>
              </div>
            </div>

            {/* Micro-narrative framing */}
            <div className="mt-5 border-l-2 border-teal-300 pl-3 py-0.5">
              <p className="text-xs font-semibold text-white tracking-wide">
                Every career grows from here.
              </p>
              <p className="text-[11px] text-teal-100/90 mt-0.5 font-normal">
                Enter your name to tailor your benchmark journey.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Input 1: Name (Captured state) */}
              <div>
                <label htmlFor="login-name" className="block text-xs font-semibold text-white mb-1.5">
                  Your Full Name <span className="text-rose-300">*</span>
                </label>
                <input
                  id="login-name"
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-xl border border-white/40 bg-white/90 px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-300/50 transition-all duration-200 shadow-inner"
                />
              </div>

              {/* Input 2: Role / Employee ID (Optional / Decorative mock) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-role" className="block text-xs font-medium text-white">
                    Designation / Employee ID
                  </label>
                  <span className="text-[10px] text-teal-100/80 font-normal">Optional</span>
                </div>
                <input
                  id="login-role"
                  type="text"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  placeholder="e.g. Junior Full Stack Developer (EMP-2048)"
                  className="w-full rounded-xl border border-white/40 bg-white/90 px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-300/50 transition-all duration-200 shadow-inner"
                />
              </div>

              {/* Primary CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-[0.99] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-950/30 hover:shadow-teal-950/50 hover:brightness-105 transition-all duration-150 cursor-pointer"
              >
                <span>{isSubmitting ? 'Entering Portal...' : 'Begin Your Growth Journey'}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
              </button>

              {/* Secondary Action: Government Parichay SSO Nod */}
              <button
                type="button"
                onClick={handleParichayClick}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/20 hover:bg-white/30 px-3 py-2 text-xs font-medium text-white active:scale-[0.99] transition-all duration-150 cursor-pointer backdrop-blur-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-teal-200" />
                <span>Sign in with Parichay SSO</span>
              </button>
            </form>

            {/* Secondary Toast message for Parichay SSO demo */}
            <AnimatePresence>
              {ssoToast && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 rounded-lg bg-teal-900/90 border border-teal-500/50 px-3 py-2 text-center text-[11px] text-teal-100 font-medium backdrop-blur-md"
                >
                  Govt Parichay Single Sign-On is simulated. Use "Begin Your Growth Journey" for demo access.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Footer copyright / government acknowledgment */}
      <div className="relative z-10 text-center py-2 text-[11px] text-white/80 font-normal">
        Official Statistics Competency Framework • National Statistical Systems Training Academy (NSSTA)
      </div>
    </div>
  );
}
