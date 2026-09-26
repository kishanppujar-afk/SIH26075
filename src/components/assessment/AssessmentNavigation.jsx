import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function AssessmentNavigation({
  currentIndex = 0,
  totalQuestions = 6,
  questions = [],
  answers = {},
  flaggedQuestions = new Set(),
  onPrevious = () => {},
  onNext = () => {},
  onJump = () => {},
}) {
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <footer className="sticky bottom-0 z-20 border-t border-slate-200/70 bg-[#F8FCFD]/95 backdrop-blur-md px-4 sm:px-6 py-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        {/* Previous Question Action */}
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold transition-all duration-150 ${
            currentIndex === 0
              ? 'opacity-40 cursor-not-allowed text-slate-400'
              : 'text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95'
          }`}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </button>

        {/* Question Quick Navigator Dots */}
        <div className="hidden sm:flex items-center gap-1.5">
          {questions.map((q, idx) => {
            const isCur = idx === currentIndex;
            const isAns = Boolean(answers[q.id]);
            const isFlag = flaggedQuestions.has(q.id);

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onJump(idx)}
                title={`Scenario ${idx + 1}${isFlag ? ' (Flagged)' : ''}${isAns ? ' (Answered)' : ''}`}
                className={`h-7 w-7 rounded-lg text-xs font-semibold transition-all duration-200 ease-out hover:scale-105 active:scale-95 flex items-center justify-center relative ${
                  isCur
                    ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/10'
                    : isFlag
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs'
                    : isAns
                    ? 'bg-[#E8ECE6] text-[#5C6A58]'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
                {isFlag && !isCur && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500 ring-1 ring-white animate-scale-check" />
                )}
              </button>
            );
          })}
        </div>

        {/* Next / Complete Action */}
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8A9A86] hover:bg-[#72826E] text-white text-xs font-semibold shadow-xs hover:shadow-md active:scale-[0.98] transition-all duration-150 group"
        >
          <span>
            {isLastQuestion ? 'Move to Growth Plan' : 'Save & Continue'}
          </span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </footer>
  );
}
