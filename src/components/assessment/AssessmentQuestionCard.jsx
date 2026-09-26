import React from 'react';
import { Bookmark, BookmarkCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssessmentQuestionCard({
  question,
  selectedAnswer,
  isFlagged,
  slideDirection = 'forward',
  onSelectOption = () => {},
  onToggleFlag = () => {},
}) {
  if (!question) return null;

  // Gentle horizontal slide with opacity cross-fade (duration: 0.25s, ease: 'easeInOut', no bounce)
  const initialX = slideDirection === 'forward' ? 24 : -24;
  const exitX = slideDirection === 'forward' ? -24 : 24;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: initialX }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: exitX }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="bg-[#F8FCFD] rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6"
      >
        {/* Question Meta Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-ai-accent-50 border border-ai-accent-200 px-3 py-1 text-xs font-semibold text-ai-accent-800">
              {question.topic}
            </span>
            <span className="typography-caption text-slate-400 hidden sm:inline">
              • {question.competency}
            </span>
          </div>

          {/* Flag for Review Button */}
          <button
            type="button"
            onClick={onToggleFlag}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl border transition-all duration-150 active:scale-[0.97] ${
              isFlagged
                ? 'bg-opportunity-50 text-opportunity-800 border-opportunity-300 shadow-2xs'
                : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span className="relative flex items-center justify-center">
              {isFlagged ? (
                <BookmarkCheck className="h-3.5 w-3.5 text-opportunity-600" />
              ) : (
                <Bookmark className="h-3.5 w-3.5 text-slate-400" />
              )}
            </span>
            <span>
              {isFlagged ? 'Flagged for review' : 'Flag for review'}
            </span>
          </button>
        </div>

        {/* Workplace Scenario */}
        {question.scenario && (
          <div className="rounded-xl bg-slate-50/70 border border-slate-200/70 p-3.5 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                Workplace Scenario
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Context</span>
            </div>
            <p className="text-slate-700 font-normal">
              {question.scenario}
            </p>
          </div>
        )}

        {/* Main Question Text */}
        <h2 className="typography-h2 text-slate-900 leading-snug">
          {question.question}
        </h2>

        {/* Answer Choices */}
        <div className="space-y-3 pt-1">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectOption(option.id)}
                className={`w-full text-left rounded-xl p-4 transition-colors duration-150 border flex items-start gap-3.5 text-sm ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/70 text-slate-900 ring-1 ring-teal-500'
                    : 'border-slate-200/80 bg-[#F8FCFD] text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center transition-colors duration-150 ${
                    isSelected
                      ? 'border-teal-500 bg-teal-500 text-white'
                      : 'border-slate-300 bg-[#F8FCFD]'
                  }`}
                >
                  {isSelected && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="leading-relaxed font-normal">{option.text}</span>
              </button>
            );
          })}

          {/* Guilt-Free Uncertainty Option (Short 4-word tag instead of long repetitive paragraph) */}
          {question.uncertaintyOption && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onSelectOption(question.uncertaintyOption.id)}
                className={`w-full text-left rounded-xl p-3.5 transition-colors duration-150 border flex items-center justify-between gap-3.5 text-sm ${
                  selectedAnswer === question.uncertaintyOption.id
                    ? 'border-ai-accent-500 bg-ai-accent-50/70 text-slate-900 ring-1 ring-ai-accent-500'
                    : 'border-slate-200/80 bg-[#F8FCFD] text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4 w-4 rounded-full border shrink-0 flex items-center justify-center transition-colors duration-150 ${
                      selectedAnswer === question.uncertaintyOption.id
                        ? 'border-ai-accent-600 bg-ai-accent-600 text-white'
                        : 'border-slate-300 bg-[#F8FCFD]'
                    }`}
                  >
                    {selectedAnswer === question.uncertaintyOption.id && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="font-medium text-slate-800 flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-ai-accent-600 shrink-0" />
                    <span>{question.uncertaintyOption.text}</span>
                  </div>
                </div>

                <span className="rounded-md bg-ai-accent-50 border border-ai-accent-200/80 px-2 py-0.5 text-[10px] font-semibold text-ai-accent-700 shrink-0 hidden sm:inline">
                  No penalty · counts as data
                </span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
