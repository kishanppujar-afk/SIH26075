import React, { useMemo } from 'react';
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Target,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  mockSkills,
  mockAssessments,
  mockOfficialTrainingResources,
  mockEmployee
} from '../mock/employeeData';

/**
 * DevelopmentPath Component
 * Integrated "Skill Gap -> Learning Path" experience.
 *
 * Sections:
 * A. YOUR GAP: Skill summary, score vs target, gap size, scannable status.
 * B. RECOMMENDED LEARNING: 2-4 verified official NSSTA / MoSPI resources with exact links.
 * C. CHECK YOUR PROGRESS: Role-calibrated diagnostic assessment linkage.
 * D. DEVELOPMENT PROGRESS: Visual progress bar and milestone comparison.
 * E. GROWTH JOURNEY: Conceptual connection to Cherry Blossom Tree with CTA.
 */
export default function DevelopmentPath({
  skillId,
  onClose,
  onNavigateToAssessments,
  onNavigateToDashboard,
  onSelectSkill
}) {
  const [expandedResources, setExpandedResources] = React.useState({});
  const [isDescExpanded, setIsDescExpanded] = React.useState(false);

  // 1. Resolve selected skill (fallback to s4 Docker & Container Orchestration if not specified)
  const skill = useMemo(() => {
    return mockSkills.find((s) => s.id === skillId) || mockSkills[3]; // default s4
  }, [skillId]);

  const isOpportunity = skill.status === 'Growth Opportunity' || skill.status === 'Skill Gap';
  const isExceeds = skill.status === 'Exceeds Target';
  const gapSize = Math.max(0, skill.targetScore - skill.currentScore);

  // 2. Find relevant official NSSTA / MoSPI resources (strictly verified URLs from catalogue)
  const recommendedResources = useMemo(() => {
    if (!skill) return [];
    const skillNameLower = skill.name.toLowerCase();
    const catLower = (skill.category || '').toLowerCase();

    // Specific mapping keywords based on competency
    let targetKeys = [];
    if (skillNameLower.includes('docker') || skillNameLower.includes('container')) {
      targetKeys = ['python', 'ai', 'data extraction', 'big data', 'unit level', 'computing'];
    } else if (skillNameLower.includes('cloud') || skillNameLower.includes('aws') || skillNameLower.includes('gcp')) {
      targetKeys = ['ai', 'big data', 'python', 'r', 'data extraction'];
    } else if (skillNameLower.includes('react') || skillNameLower.includes('frontend')) {
      targetKeys = ['data visualization', 'visualization', 'r', 'analytics'];
    } else if (skillNameLower.includes('microservices') || skillNameLower.includes('node')) {
      targetKeys = ['api', 'python', 'big data', 'statistical computing'];
    } else if (skillNameLower.includes('system design') || skillNameLower.includes('scalability')) {
      targetKeys = ['survey methodology', 'big data', 'statistical systems', 'data management'];
    } else if (skillNameLower.includes('collaboration') || catLower.includes('soft')) {
      targetKeys = ['orientation', 'capacity building', 'annual report', 'training programme'];
    } else {
      targetKeys = [skillNameLower];
    }

    const matched = [];
    for (const res of mockOfficialTrainingResources) {
      const skillsLower = (res.relatedSkills || []).map((s) => s.toLowerCase());
      const topicsLower = (res.topics || []).map((t) => t.toLowerCase());
      const kwLower = (res.keywords || []).map((k) => k.toLowerCase());
      const titleLower = res.title.toLowerCase();

      const hits = targetKeys.some(
        (key) =>
          skillsLower.some((s) => s.includes(key)) ||
          topicsLower.some((t) => t.includes(key)) ||
          kwLower.some((k) => k.includes(key)) ||
          titleLower.includes(key)
      );

      if (hits) {
        matched.push(res);
      }
      if (matched.length >= 3) break;
    }

    return matched;
  }, [skill]);

  // 3. Find relevant assessment
  const relatedAssessment = useMemo(() => {
    if (!skill) return null;
    return (
      mockAssessments.find(
        (asm) =>
          (asm.category && asm.category.toLowerCase() === skill.category.toLowerCase()) ||
          (asm.title && asm.title.toLowerCase().includes(skill.name.toLowerCase().split(' ')[0]))
      ) || mockAssessments[0]
    );
  }, [skill]);

  // Supportive narrative based on score status (Scannable clause + icon)
  const supportiveData = useMemo(() => {
    if (isExceeds) {
      return {
        text: 'Benchmark exceeded — explore advanced modules or mentor peers.',
        icon: Sparkles,
        badgeColor: 'text-exceeds-700 bg-exceeds-50 border-exceeds-200'
      };
    }
    if (gapSize > 15) {
      return {
        text: 'Strong foundation — bridge the gap with the official modules below.',
        icon: Target,
        badgeColor: 'text-opportunity-700 bg-opportunity-50 border-opportunity-200'
      };
    }
    if (gapSize > 0) {
      return {
        text: 'Near target — 1–2 focused modules will close this gap.',
        icon: TrendingUp,
        badgeColor: 'text-growth-700 bg-growth-50 border-growth-200'
      };
    }
    return {
      text: 'Benchmark satisfied — maintain momentum with refresher circulars.',
      icon: CheckCircle2,
      badgeColor: 'text-growth-700 bg-growth-50 border-growth-200'
    };
  }, [isExceeds, gapSize]);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Overview</span>
        </button>

        {/* Skill Selector Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Switch skill:</span>
          {mockSkills.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSkill && onSelectSkill(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                s.id === skill.id
                  ? 'bg-teal-500 text-white shadow-2xs'
                  : 'bg-[#F8FCFD] border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s.name.split('&')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Header: Skill Overview */}
      <div className="rounded-2xl border border-slate-200/80 bg-[#F8FCFD] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {skill.category}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                  isOpportunity
                    ? 'bg-opportunity-50 text-opportunity-700 border-opportunity-200'
                    : isExceeds
                    ? 'bg-exceeds-50 text-exceeds-700 border-exceeds-200'
                    : 'bg-growth-50 text-growth-700 border-growth-200'
                }`}
              >
                {isOpportunity && <AlertTriangle className="h-3 w-3 text-opportunity-600" />}
                {isExceeds && <Sparkles className="h-3 w-3 text-exceeds-600" />}
                <span>{skill.status}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {skill.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Integrated development pathway aligned to <strong className="text-slate-700 font-semibold">{mockEmployee.targetRole}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0">
            <div className="text-center px-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block">Current</span>
              <span className="text-lg font-bold text-slate-900">{skill.currentScore}%</span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-center px-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block">Target</span>
              <span className="text-lg font-bold text-teal-700">{skill.targetScore}%</span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-center px-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block">Gap</span>
              <span className={`text-lg font-bold ${gapSize > 0 ? 'text-opportunity-600' : 'text-growth-600'}`}>
                {gapSize > 0 ? `${gapSize} pts` : '0 pts'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION A & D: YOUR GAP & DEVELOPMENT PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section A: Gap Status Card */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200/80 bg-[#F8FCFD] p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              <TrendingUp className="h-4 w-4 text-teal-600" />
              <span>Competency Gap</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {gapSize > 0 ? `${gapSize} Points to Target` : 'Benchmark Achieved'}
            </h2>

            {/* Short clause with icon badge */}
            <div className={`mt-3 inline-flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium ${supportiveData.badgeColor}`}>
              <supportiveData.icon className="h-4 w-4 shrink-0" />
              <span>{supportiveData.text}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Trend:</span>
            <span className="font-semibold text-growth-700 flex items-center gap-1">
              <span>Trending {skill.trending === 'up' ? 'Upward' : 'Stable'}</span>
              <TrendingUp className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Section D: Visual Development Progress Bar */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-[#F8FCFD] p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Development Progress
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {Math.round((skill.currentScore / skill.targetScore) * 100)}% of target met
              </span>
            </div>

            {/* Custom visual progress track */}
            <div className="mt-4 space-y-2">
              <div className="relative h-4 w-full rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (skill.currentScore / skill.targetScore) * 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    isOpportunity
                      ? 'bg-gradient-to-r from-opportunity-400 to-opportunity-500'
                      : isExceeds
                      ? 'bg-gradient-to-r from-exceeds-400 to-exceeds-500'
                      : 'bg-gradient-to-r from-growth-400 to-growth-500'
                  }`}
                />
              </div>

              {/* Scale milestones */}
              <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
                <span>0% Baseline</span>
                <span className="font-semibold text-slate-700">Current: {skill.currentScore}%</span>
                <span className="font-bold text-teal-700">Target Benchmark: {skill.targetScore}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>Evaluation cycle: Q3 Fiscal Review</span>
            <span className="text-slate-400">Based on verified diagnostic baselines</span>
          </div>
        </div>
      </div>

      {/* SECTION B: RECOMMENDED LEARNING (Official NSSTA / MoSPI Resources) */}
      <div className="rounded-2xl border border-slate-200/80 bg-[#F8FCFD] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Official Government Learning &amp; Training Resources
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Official training modules from NSSTA &amp; MoSPI
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium self-start sm:self-auto">
            <span className="inline-flex items-center gap-1 rounded-full bg-ai-accent-50 px-2.5 py-0.5 font-semibold text-ai-accent-700 border border-ai-accent-200/70">
              Verified Official Links
            </span>
          </div>
        </div>

        {recommendedResources.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-700">No official modules currently mapped</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Additional training circulars will be published in the next FY cycle.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedResources.map((res, rIdx) => {
              const isExpanded = !!expandedResources[rIdx];
              return (
                <div
                  key={res.url + rIdx}
                  className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-[#F8FCFD] p-4 hover:border-teal-300 hover:shadow-xs transition-all duration-200 group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          res.source === 'NSSTA'
                            ? 'bg-ai-accent-50 text-ai-accent-800 border border-ai-accent-200/80'
                            : 'bg-teal-50 text-teal-700 border border-teal-200/80'
                        }`}
                      >
                        {res.source}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {res.source === 'NSSTA' ? 'nssta.gov.in' : 'mospi.gov.in'}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-teal-600 transition-colors">
                      {res.title}
                    </h3>

                    {/* Collapsible description on demand */}
                    {res.description && (
                      <div className="mt-2 text-xs">
                        {isExpanded ? (
                          <p className="text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {res.description}
                          </p>
                        ) : null}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedResources((prev) => ({
                              ...prev,
                              [rIdx]: !prev[rIdx]
                            }))
                          }
                          className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 mt-1 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Less info' : 'Module details'}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Topics / Skills Tags */}
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {(res.topics || []).slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs px-3.5 py-1.5 group/btn inline-flex items-center gap-1.5 w-full justify-center sm:w-auto"
                    >
                      <span>View Training</span>
                      <ExternalLink className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION C & E: ASSESSMENT LINK & GROWTH JOURNEY CONNECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section C: Check Your Progress (Assessment) */}
        <div className="rounded-2xl border border-slate-200/80 bg-[#F8FCFD] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-teal-600" />
                <h2 className="text-lg font-bold text-slate-900">Check Your Progress</h2>
              </div>
              {relatedAssessment && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-opportunity-50 text-opportunity-700 border-opportunity-200">
                  {relatedAssessment.status}
                </span>
              )}
            </div>

            {relatedAssessment ? (
              <div className="space-y-3">
                {/* Replaced full prose sentence with 3 quick badges */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="rounded-full bg-growth-50 border border-growth-200 px-2.5 py-0.5 text-[11px] font-semibold text-growth-700 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Zero Penalty
                  </span>
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                    Self-Paced
                  </span>
                  <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[11px] font-medium text-teal-700 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {relatedAssessment.estimatedMinutes || '15'} min
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-800">
                      {relatedAssessment.title}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium shrink-0">
                      {relatedAssessment.questionCount} Scenarios
                    </span>
                  </div>

                  {/* Clamped description with expand toggle */}
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <p className={isDescExpanded ? '' : 'line-clamp-2'}>
                      {relatedAssessment.description}
                    </p>
                    {relatedAssessment.description && relatedAssessment.description.length > 80 && (
                      <button
                        type="button"
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                        className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 mt-1 inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{isDescExpanded ? 'Show less' : 'More'}</span>
                        {isDescExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-500">
                No active assessment scheduled for this competency.
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-growth-600" />
              <span>Diagnostic baseline</span>
            </div>
            {relatedAssessment && (
              <button
                type="button"
                onClick={onNavigateToAssessments}
                className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 group"
              >
                <span>Take Assessment</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* Section E: Growth Journey / Cherry Blossom Connection */}
        <div className="rounded-2xl border border-slate-200/80 bg-[#F8FCFD] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-ai-accent-600" />
                <h2 className="text-lg font-bold text-slate-900">Growth Journey Connection</h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-rose-50 text-rose-700 border-rose-200">
                Cherry Blossom Tree
              </span>
            </div>

            {/* Shortened from long paragraph to single line */}
            <p className="text-xs text-slate-600 font-medium mb-3">
              Progress here feeds your Growth Tree and career readiness score.
            </p>

            <div className="rounded-xl bg-gradient-to-br from-rose-50/70 via-slate-50/60 to-teal-50/50 p-4 border border-rose-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#F8FCFD] shadow-2xs border border-rose-200 flex items-center justify-center shrink-0 text-xl select-none">
                🌸
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800">
                  Current Stage: Blossoming Tree (Early Bloom)
                </p>
                <p className="text-slate-600 mt-0.5 font-medium">
                  Closing this gap adds <strong className="text-slate-900 font-bold">~4%</strong> to overall readiness.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Live progress in sidebar</span>
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="btn-secondary text-xs px-3.5 py-1.5 inline-flex items-center gap-1 group"
            >
              <span>View in Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}