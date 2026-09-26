import React from 'react';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
  Target
} from 'lucide-react';

export default function AssessmentOnboarding({
  targetRole = 'Senior Cloud Applications Engineer',
  onBegin = () => {},
  onExit = () => {},
}) {
  return (
    <div className="min-h-screen bg-[#F0F7F9] text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 animate-fade-in">
      <div className="max-w-2xl w-full bg-[#F8FCFD] rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs hover:shadow-md transition-all duration-300 space-y-8 animate-fade-in-up">
        {/* Header & Logo */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#8A9A86]/20 text-[#5C6A58] flex items-center justify-center font-bold transition-transform duration-200 hover:scale-105">
              <Compass className="h-5 w-5 text-[#5C6A58]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C6A58]">
                SkillStat AI • Diagnostic Focus
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Baseline Competency Discovery
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors duration-150 active:scale-95"
          >
            Return to Overview
          </button>
        </div>

        {/* Primary Supportive Philosophy Banner */}
        <div
          className="rounded-xl bg-[#F5F7F5] border border-[#D2DCD0] p-5 sm:p-6 transition-all duration-200 animate-fade-in-up hover:border-[#8A9A86]/60"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex gap-4 items-start">
            <div className="p-2 rounded-lg bg-[#F8FCFD]/80 border border-[#D2DCD0] text-[#5C6A58] shrink-0 mt-0.5 shadow-2xs">
              <Sparkles className="h-5 w-5 text-[#5C6A58]" />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5C6A58]">
                Diagnostic Discovery
              </span>
              <h3 className="text-base font-bold text-[#343D31] leading-snug">
                Map strengths and high-yield growth areas for your target role.
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Not a pass/fail test. Honest baseline data personalizes your development pathway.
              </p>
            </div>
          </div>
        </div>

        {/* What to Expect - 3 Core Guiding Principles */}
        <div
          className="space-y-3 animate-fade-in-up"
          style={{ animationDelay: '180ms' }}
        >
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            What to Expect
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div
              className="rounded-xl border border-slate-100 bg-[#F0F7F9] p-4 space-y-1.5 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xs transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: '220ms' }}
            >
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <Target className="h-4 w-4 text-[#8A9A86]" />
                <span>6 Scenarios</span>
              </div>
              <p className="text-slate-500 leading-relaxed font-normal">
                Cloud compute, container orchestration, and resilience.
              </p>
            </div>

            <div
              className="rounded-xl border border-slate-100 bg-[#F0F7F9] p-4 space-y-1.5 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xs transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: '280ms' }}
            >
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#5B9A9A]" />
                <span>Zero Penalty</span>
              </div>
              <p className="text-slate-500 leading-relaxed font-normal">
                "Not sure yet" counts as valid diagnostic data.
              </p>
            </div>

            <div
              className="rounded-xl border border-slate-100 bg-[#F0F7F9] p-4 space-y-1.5 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xs transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: '340ms' }}
            >
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#5B7083]" />
                <span>Auto-Saved</span>
              </div>
              <p className="text-slate-500 leading-relaxed font-normal">
                Self-paced with draft auto-save at every step.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 animate-fade-in-up"
          style={{ animationDelay: '400ms' }}
        >
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Target Role: <strong className="text-slate-700 font-semibold">{targetRole}</strong></span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onExit}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-150"
            >
              Save & Return Later
            </button>
            <button
              type="button"
              onClick={onBegin}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#8A9A86] hover:bg-[#72826E] text-white text-xs font-semibold shadow-xs hover:shadow-md active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 group"
            >
              <span>Begin Assessment</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
