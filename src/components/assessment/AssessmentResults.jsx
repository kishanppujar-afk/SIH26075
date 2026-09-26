import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Layers,
  TrendingUp,
  Compass,
  RotateCcw,
  ShieldCheck,
  Award,
  Lightbulb,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AssessmentResults({
  targetRole = 'Senior Cloud Applications Engineer',
  results = {},
  recommendations = [],
  resultsLoaded = false,
  baselineApplied = false,
  onApplyBaseline = () => {},
  onRetake = () => {},
  onExitToHub = () => {},
  onViewCourses = () => {},
}) {
  const {
    confidentCorrect = [],
    growthOpportunities = [],
    capabilityList = [],
  } = results;

  // Track delayed metric bar trigger (0.5s+) to ensure narrative renders before numbers
  const [metricsAnimated, setMetricsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMetricsAnimated(true);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2 animate-fade-in pb-12">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. NARRATIVE BANNER (Reveals first: 0 - 0.2s)                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="rounded-2xl bg-[#F8FCFD] border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-sm transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-ai-accent-50 px-3.5 py-1 text-xs font-semibold text-ai-accent-800 border border-ai-accent-200">
              <Sparkles className="h-3.5 w-3.5 text-ai-accent-600" />
              <span>Competency Baseline Discovery Complete</span>
            </div>
            <h1 className="typography-display text-slate-900 mt-1">
              Your Personal Growth &amp; Capability Roadmap
            </h1>
            <p className="typography-body text-slate-600">
              Calibrated for milestone progression toward: <strong className="text-slate-800 font-semibold">{targetRole}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onRetake}
              className="btn-secondary flex-1 sm:flex-none text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retake Discovery</span>
            </button>
            <button
              type="button"
              onClick={onExitToHub}
              className="btn-primary flex-1 sm:flex-none text-xs"
            >
              Done
            </button>
          </div>
        </div>

        {/* Narrative Flow Stepper */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="typography-caption uppercase tracking-wider text-slate-400 font-bold">
              SkillStat AI Diagnostic Pathway
            </span>
            <span className="typography-caption text-ai-accent-700 font-semibold bg-ai-accent-50 px-2 py-0.5 rounded-full border border-ai-accent-200">
              Connected Flow
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
              <div className="text-slate-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-growth-600" />
                <span>1. Scenarios</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 font-normal">
                6 Real-world situations
              </p>
            </div>

            <div className="rounded-xl bg-ai-accent-50/70 p-3.5 border border-ai-accent-200">
              <div className="text-ai-accent-800 font-bold flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-ai-accent-600" />
                <span>2. Baseline</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 font-normal">
                Foundations mapped
              </p>
            </div>

            <div className="rounded-xl bg-opportunity-50/70 p-3.5 border border-opportunity-200">
              <div className="text-opportunity-800 font-bold flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-opportunity-600" />
                <span>3. Growth Areas</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 font-normal">
                {growthOpportunities.length} High-yield areas
              </p>
            </div>

            <div className="rounded-xl bg-teal-50/70 p-3.5 border border-teal-200">
              <div className="text-teal-800 font-bold flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-teal-600" />
                <span>4. Learning Plan</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 font-normal">
                Targeted pathways
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. SUPERPOWERS & OPPORTUNITIES (Staggers in: 0.2 - 0.5s)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
        className="rounded-2xl bg-[#F8FCFD] border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-growth-50 text-growth-700 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-growth-600" />
            </div>
            <div>
              <h2 className="typography-h2 text-slate-900">
                Your Current Superpowers
              </h2>
              <p className="typography-caption text-slate-500">
                Competencies where you demonstrated verified architectural understanding
              </p>
            </div>
          </div>
          <span className="rounded-full bg-growth-50 text-growth-700 border border-growth-200 text-xs font-semibold px-3 py-1">
            {confidentCorrect.length} Confirmed Strengths
          </span>
        </div>

        {confidentCorrect.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {confidentCorrect.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1.5 hover:border-growth-200 transition-colors duration-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-growth-600 shrink-0" />
                    <span>{item.topic}</span>
                  </span>
                  <span className="text-[10px] text-growth-700 font-semibold bg-growth-50 px-2 py-0.5 rounded border border-growth-200 shrink-0">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-normal line-clamp-2 leading-relaxed pl-5">
                  {item.rationale}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="typography-body text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
            Baseline exploration complete. Review opportunities below.
          </p>
        )}
      </motion.div>

      {/* Growth Opportunities Narrative */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35, ease: 'easeOut' }}
        className="rounded-2xl bg-[#F8FCFD] border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-opportunity-50 text-opportunity-700 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-opportunity-600" />
            </div>
            <div>
              <h2 className="typography-h2 text-slate-900">
                Next Growth Opportunities
              </h2>
              <p className="typography-caption text-slate-500">
                Targeted areas to reach milestone benchmarks
              </p>
            </div>
          </div>
          <span className="rounded-full bg-opportunity-50 text-opportunity-700 border border-opportunity-200 text-xs font-semibold px-3 py-1">
            {growthOpportunities.length} Priority Areas
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {growthOpportunities.map((opp, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-100 bg-opportunity-50/20 p-3.5 space-y-1.5 hover:border-opportunity-300 transition-colors duration-200"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-opportunity-500 shrink-0"></span>
                  <span>{opp.topic}</span>
                </span>
                <span className="text-[11px] font-medium text-slate-400">{opp.competency}</span>
              </div>
              <p className="text-xs text-slate-600 font-normal pl-4 leading-relaxed">
                {opp.reason}
              </p>

              {opp.resource && (
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100/80 pl-4">
                  <span className="flex items-center gap-1.5 text-ai-accent-800 font-semibold text-[11px]">
                    <BookOpen className="h-3.5 w-3.5 text-ai-accent-600 shrink-0" />
                    <span>{opp.resource.title}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">{opp.resource.duration}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. CAPABILITY BASELINE METRICS (Animates in last: 0.5s+)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.5, ease: 'easeOut' }}
        className="rounded-2xl bg-[#F8FCFD] border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Award className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="typography-h2 text-slate-900">
              Current Capability Baseline
            </h2>
            <p className="typography-caption text-slate-500">
              Soft horizontal tracks measuring current verified baseline against senior benchmark targets
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {capabilityList.map((cap, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2.5 hover:border-slate-300 transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 sm:gap-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{cap.name}</span>
                  <span className="rounded-full bg-[#F8FCFD] border border-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {cap.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 typography-caption text-slate-500">
                  <span>Current Baseline: <strong className="text-slate-800 font-semibold">{cap.score}%</strong></span>
                  <span>Target Benchmark: <strong className="text-slate-700 font-semibold">{cap.target}%</strong></span>
                </div>
              </div>

              {/* Progress track delayed to 0.5s+ for sequenced narrative reveal */}
              <div className="relative h-2.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-ai-accent-600 transition-all duration-700 ease-out"
                  style={{
                    width: metricsAnimated ? `${cap.score}%` : '0%',
                    transitionDelay: `${idx * 100}ms`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. RECOMMENDED FOR YOU PATHWAYS                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.6, ease: 'easeOut' }}
        className="rounded-2xl bg-[#F8FCFD] border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-ai-accent-50 text-ai-accent-700 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-ai-accent-600" />
            </div>
            <div>
              <h2 className="typography-h2 text-slate-900">
                Recommended For You
              </h2>
              <p className="typography-caption text-slate-500">
                Curated learning modules directly aligned with your discovered growth opportunities
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onViewCourses}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 group transition-colors duration-150 cursor-pointer"
          >
            <span>View Full Catalog</span>
            <span className="transition-transform duration-150 group-hover:translate-x-0.5">&rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {recommendations.slice(0, 2).map((rec) => (
            <div
              key={rec.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/40 p-5 space-y-3.5 hover:border-ai-accent-300 hover:shadow-xs transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-md bg-ai-accent-50 border border-ai-accent-200/70 text-ai-accent-700 font-semibold px-2 py-0.5">
                    {rec.type}
                  </span>
                  <span className="font-bold text-ai-accent-600 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {rec.matchScore}% Match
                  </span>
                </div>
                <h3 className="mt-2.5 text-sm font-bold text-slate-900 leading-snug">
                  {rec.title}
                </h3>
                <p className="typography-caption text-slate-500 mt-1">
                  Focus: <strong className="text-slate-700 font-semibold">{rec.impactSkill}</strong>
                </p>
                <div className="mt-2 rounded-xl bg-[#F8FCFD] border border-slate-100 p-2.5 text-[11px] text-slate-600">
                  <span className="italic">
                    “Recommended because this learning directly supports your current growth opportunity.”
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="typography-caption text-slate-400">{rec.duration}</span>
                <button
                  type="button"
                  onClick={onViewCourses}
                  className="font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 group cursor-pointer"
                >
                  <span>Start Pathway</span>
                  <span className="transition-transform duration-150 group-hover:translate-x-0.5">&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {baselineApplied ? (
              <span className="text-growth-600 font-semibold flex items-center gap-1.5 animate-scale-check">
                <CheckCircle2 className="h-4 w-4 text-growth-600" /> Baseline applied to your employee profile!
              </span>
            ) : (
              <span className="typography-caption text-slate-500">Save this baseline to update your skill readiness metrics.</span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onApplyBaseline}
              disabled={baselineApplied}
              className={`flex-1 sm:flex-none btn-primary text-xs ${
                baselineApplied ? 'bg-slate-200 text-slate-400 cursor-default hover:bg-slate-200' : ''
              }`}
            >
              {baselineApplied ? 'Baseline Saved' : 'Apply Baseline to My Profile'}
            </button>
            <button
              type="button"
              onClick={onExitToHub}
              className="flex-1 sm:flex-none btn-secondary text-xs"
            >
              Return to Assessments Hub
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
