import React, { useState } from 'react';
import { Compass, Check, Clock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssessmentFocusHeader({
  title = 'Cloud Infrastructure & AWS Fundamentals',
  currentQuestionIndex = 0,
  totalQuestions = 6,
  answeredCount = 0,
  saveStatus = 'Draft saved',
  isSaving = false,
  onExit = () => {},
}) {
  const [isTimerExpanded, setIsTimerExpanded] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#F8FCFD]/90 backdrop-blur-md px-4 sm:px-6 py-3.5 transition-colors duration-200">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Branding & Assessment Title */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Compass className="h-4 w-4 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                SkillStat AI
              </span>
              <span className="text-slate-300">|</span>
              <span className="typography-caption text-slate-600 truncate max-w-[180px] sm:max-w-xs font-semibold">
                {title}
              </span>
            </div>
          </div>
        </div>

        {/* Save Status & Expandable Discreet Timer & Exit */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quiet Save Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 typography-caption text-slate-500">
            <div className="relative flex items-center justify-center w-3.5 h-3.5">
              {isSaving ? (
                <span className="h-2 w-2 rounded-full bg-opportunity-400 animate-gentle-pulse" />
              ) : (
                <Check className="h-3.5 w-3.5 text-growth-600" />
              )}
            </div>
            <span key={saveStatus} className="font-medium">
              {saveStatus}
            </span>
          </div>

          {/* Discreet Expandable Timer Pill (duration 0.2s) */}
          <motion.div
            layout
            onClick={() => setIsTimerExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 typography-caption text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-2xs select-none"
            title="Click to expand/collapse time estimate"
          >
            <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <AnimatePresence initial={false} mode="wait">
              {isTimerExpanded ? (
                <motion.span
                  key="expanded"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="font-medium text-slate-700 whitespace-nowrap overflow-hidden"
                >
                  ~12 mins self-paced (no limit)
                </motion.span>
              ) : (
                <motion.span
                  key="collapsed"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="font-medium text-slate-500 whitespace-nowrap overflow-hidden"
                >
                  Timer
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pause / Exit Action */}
          <button
            type="button"
            onClick={onExit}
            className="btn-ghost text-xs"
          >
            Pause &amp; Exit
          </button>
        </div>
      </div>

      {/* Subtle Progress Bar */}
      <div className="max-w-4xl mx-auto mt-3">
        <div className="flex items-center justify-between typography-caption text-slate-400 mb-1">
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          <span>{answeredCount} of {totalQuestions} answered</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
          <div
            className="h-full bg-ai-accent-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>
    </header>
  );
}
