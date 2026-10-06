import React from 'react';
import {
  Sparkles,
  Clock,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import Card from '../common/Card';

export default function AssessmentHub({
  assessments = [],
  onStartOnboarding = () => {},
  targetRole = 'Senior Cloud Applications Engineer',
}) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-8">
      {/* Reassuring Philosophy Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-ai-accent-50/80 via-slate-50/60 to-[#F8FCFD] border border-ai-accent-200 p-6 sm:p-8 shadow-xs hover:shadow-sm transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FCFD]/90 border border-ai-accent-200 px-3.5 py-1 text-xs font-semibold text-ai-accent-800 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-ai-accent-600" />
              <span>Diagnostic Career Baseline</span>
            </div>
            <h1 className="typography-display text-slate-900">
              Skill &amp; Competency Baseline Discovery
            </h1>
            <p className="typography-body text-slate-600 text-xs sm:text-sm">
              Supportive diagnostic baselines to map verified strengths and high-yield growth areas for <strong className="font-semibold text-slate-800">{targetRole}</strong>.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onStartOnboarding(assessments[0]?.id || 'asm1')}
              className="btn-primary-ai group"
            >
              <span>Begin Baseline Discovery</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Psychological Safety Pillars */}
        <div className="mt-6 pt-5 border-t border-ai-accent-200/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="h-4 w-4 text-ai-accent-600 shrink-0" />
            <span>Zero penalty for uncertainty</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-ai-accent-600 shrink-0" />
            <span>Maps directly to learning modules</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Layers className="h-4 w-4 text-ai-accent-600 shrink-0" />
            <span>Self-paced with quiet auto-save</span>
          </div>
        </div>
      </div>

      {/* Baseline Assessments List */}
      <div className="space-y-4">
        <div>
          <h2 className="typography-h2 text-slate-900">
            Role-Calibrated Diagnostic Baselines
          </h2>
          <p className="typography-caption text-slate-500 mt-0.5">
            Select an available competency area to map your foundation
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {assessments.map((assessment) => {
            const isReady = assessment.status === 'Ready for Baseline Discovery';

            return (
              <Card
                key={assessment.id}
                variant="actionable"
                status={isReady ? 'ai-accent' : 'growth'}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ai-accent-800 bg-ai-accent-50 border border-ai-accent-200 px-2.5 py-0.5 rounded-full">
                      {assessment.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        isReady
                          ? 'bg-opportunity-50 text-opportunity-700 border-opportunity-200'
                          : 'bg-growth-50 text-growth-700 border-growth-200'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isReady ? 'bg-opportunity-500' : 'bg-growth-500'
                        }`}
                      />
                      <span>{assessment.status}</span>
                    </span>
                  </div>

                  <h3 className="typography-h2 text-slate-900">{assessment.title}</h3>
                  <p className="typography-body text-xs text-slate-500 line-clamp-2">
                    {assessment.description}
                  </p>

                  <div className="flex items-center gap-4 typography-caption text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {assessment.estimatedMinutes || '15'} mins focus
                    </span>
                    <span>•</span>
                    <span>{assessment.questionCount} Scenarios</span>
                    {assessment.baselineLevel && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">
                          {assessment.baselineLevel}
                        </span>
                      </>
                    )}
                    {/* Submission Deadline added for Hackathon */}
                    {isReady && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <Clock className="h-3 w-3" />
                          Deadline: {assessment.deadline || '2026-10-31'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {isReady ? (
                    <button
                      type="button"
                      onClick={() => onStartOnboarding(assessment.id)}
                      className="btn-primary w-full sm:w-auto text-xs group"
                    >
                      <span>Discover Baseline</span>
                      <ChevronRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onStartOnboarding(assessment.id)}
                      className="btn-secondary w-full sm:w-auto text-xs"
                    >
                      Review Baseline
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
