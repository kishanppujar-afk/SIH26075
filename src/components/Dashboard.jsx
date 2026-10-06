import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  mockEmployee,
  mockSkills,
  mockRecommendations,
  mockAssessments,
  mockAiInsights
} from '../mock/employeeData';
import Skeleton from './common/Skeleton';
import Card from './common/Card';
import StudyLampIllustration from './StudyLampIllustration';
import KpiStatsRow from './KpiStatsRow';
import { useSession, useEmployee } from '../context/SessionContext';
import { api } from '../api/client';
import OnboardingTutorial from './OnboardingTutorial';

export default function Dashboard({ setActiveTab, onOpenDevelopmentPath }) {
  const { displayName } = useSession();
  const { employee } = useEmployee();
  const activeEmployee = employee || mockEmployee;
  const [skills, setSkills] = useState(mockSkills);
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(`skillstat_tutorial_seen_${activeEmployee?.id || 'default'}`);
    if (!hasSeen) {
      if (activeEmployee?.created_at) {
        const createdDate = new Date(activeEmployee.created_at);
        const now = new Date();
        const diffHours = (now - createdDate) / (1000 * 60 * 60);
        
        if (diffHours > 2) {
          // Old user (created more than 2 hours ago)
          localStorage.setItem(`skillstat_tutorial_seen_${activeEmployee?.id || 'default'}`, 'true');
        } else {
          setShowTutorial(true);
        }
      } else if (!activeEmployee) {
        // If still loading, wait
      } else {
        // Fallback for mock employee
        setShowTutorial(true);
      }
    }
  }, [activeEmployee]);

  const handleTutorialComplete = () => {
    localStorage.setItem(`skillstat_tutorial_seen_${activeEmployee?.id || 'default'}`, 'true');
    setShowTutorial(false);
  };

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      api.getSkills(),
      api.getRecommendations(),
      api.getAnnouncements().catch(() => [])
    ]).then(([skillsRes, recsRes, annRes]) => {
      if (!isMounted) return;
      if (skillsRes.status === 'fulfilled' && Array.isArray(skillsRes.value) && skillsRes.value.length > 0) {
        setSkills(skillsRes.value);
      }
      if (recsRes.status === 'fulfilled' && Array.isArray(recsRes.value) && recsRes.value.length > 0) {
        setRecommendations(recsRes.value);
      }
      setIsLoading(false);
      setTimeout(() => {
        if (isMounted) setIsLoaded(true);
      }, 100);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Welcome banner skeleton */}
        <div className="h-44 w-full rounded-2xl bg-slate-200/80 animate-pulse" />
        {/* Stat cards skeleton */}
        <Skeleton variant="stat-card" />
        {/* Content columns skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-xl bg-slate-200/70 animate-pulse" />
          <div className="space-y-6">
            <div className="h-56 rounded-xl bg-slate-200/70 animate-pulse" />
            <div className="h-40 rounded-xl bg-slate-200/70 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AnimatePresence>
        {showTutorial && <OnboardingTutorial onComplete={handleTutorialComplete} />}
      </AnimatePresence>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-300 via-teal-400 to-teal-500 p-6 sm:p-7 text-white shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="z-10 flex-1 max-w-lg">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs border border-white/25 text-white">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              <span>SkillStat AI Intelligence</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-xs">
              Welcome back, {displayName || activeEmployee.name}!
            </h1>
            <p className="mt-1 text-teal-50 text-sm font-normal leading-relaxed">
              You're currently working towards <span className="font-semibold text-white">{activeEmployee.targetRole}</span>.
              Growth opportunities are trending down by 12% this month.
            </p>
          </div>

          {/* Study Lamp & Books Illustration (Fills the empty space between text and action button, scaled ~1.4-1.5x) */}
          <div className="hidden sm:flex items-center justify-center shrink-0 w-44 h-28 md:w-52 md:h-32 lg:w-60 lg:h-36 z-10 select-none">
            <StudyLampIllustration />
          </div>

          <div className="flex items-center gap-3 shrink-0 z-10">
            <button
              onClick={() => setActiveTab('skills')}
              className="rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-teal-700 shadow-sm hover:bg-teal-50 hover:shadow active:scale-[0.97] transition-all duration-150 cursor-pointer"
            >
              Analyze Growth Areas
            </button>
          </div>
        </div>
      </div>

      {/* Announcements & Notifications Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
        <div className="bg-amber-100 p-2 rounded-lg text-amber-600 shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-900 text-sm">National Doppler Radar Training Session Live</h3>
          <p className="text-xs text-amber-700 mt-0.5">Join Dr. Roy for a live session on DWR echo interpretation this Friday. (MoES Announcement)</p>
        </div>
      </div>

      <KpiStatsRow />

      {/* Middle Row: Priority Competencies & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Growth Areas */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-[#F8FCFD] p-5 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="typography-h2 text-slate-900">Key Competencies &amp; Target Alignment</h2>
              <p className="typography-caption text-slate-500">Comparison against target benchmark for {activeEmployee.targetRole}</p>
            </div>
            <button
              onClick={() => setActiveTab('skills')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 group active:scale-[0.97] transition-all cursor-pointer"
            >
              View All <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {skills.slice(0, 4).map((skill, sIdx) => {
              const isOpportunity = skill.status === 'Growth Opportunity' || skill.status === 'Skill Gap';
              const isExceeds = skill.status === 'Exceeds Target';
              const isProficient = skill.status === 'Proficient' || skill.status === 'On Track';

              const displayStatus = isOpportunity ? 'Growth Opportunity' : skill.status;

              return (
                <div
                  key={skill.id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3.5 hover:border-slate-300 hover:bg-[#F8FCFD] hover:shadow-xs transition-all duration-200"
                >
                  <div className="flex items-center justify-between text-sm font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{skill.name}</span>
                      <span className="typography-caption text-slate-400">({skill.category})</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold border transition-colors duration-300 ${
                        isOpportunity
                          ? 'bg-opportunity-50 text-opportunity-700 border-opportunity-200'
                          : isExceeds
                          ? 'bg-exceeds-50 text-exceeds-700 border-exceeds-200'
                          : 'bg-growth-50 text-growth-700 border-growth-200'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isOpportunity
                            ? 'bg-opportunity-500'
                            : isExceeds
                            ? 'bg-exceeds-500'
                            : 'bg-growth-500'
                        }`}
                      />
                      <span>{displayStatus}</span>
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="relative flex-1 h-2 rounded-full bg-slate-200/80 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          isOpportunity
                            ? 'bg-opportunity-500'
                            : isExceeds
                            ? 'bg-exceeds-500'
                            : 'bg-growth-500'
                        }`}
                        style={{
                          width: isLoaded ? `${skill.currentScore}%` : '0%',
                          transitionDelay: `${sIdx * 100}ms`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-12 text-right">
                      {skill.currentScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center typography-caption text-slate-400 mt-1">
                    <span>Current proficiency</span>
                    <span>Target: {skill.targetScore}%</span>
                  </div>

                  {isOpportunity && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenDevelopmentPath) {
                            onOpenDevelopmentPath(skill.id);
                          } else {
                            setActiveTab('skills', skill.id);
                          }
                        }}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 group/btn active:scale-95 transition-all"
                      >
                        <span>View Development Path</span>
                        <ArrowUpRight className="h-3 w-3 transition-transform duration-150 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: AI Insights & Next Up */}
        <div className="space-y-6">
          {/* AI Insights Card (Using ai-accent token) */}
          <div className="rounded-2xl border border-ai-accent-200 bg-ai-accent-50/40 p-5 shadow-xs hover:shadow-sm transition-all duration-200">
            <div className="flex items-center gap-2 text-ai-accent-700 font-semibold text-sm mb-3">
              <Sparkles className="h-4 w-4 text-ai-accent-600" />
              <span className="typography-h2 text-ai-accent-900">SkillStat AI Insights</span>
            </div>

            <div className="space-y-2.5">
              {mockAiInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="rounded-xl bg-[#F8FCFD]/90 p-3.5 border border-ai-accent-100 text-xs text-slate-700 leading-relaxed hover:bg-[#F8FCFD] transition-colors duration-200 shadow-2xs"
                >
                  <p className="font-semibold text-ai-accent-800 mb-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-ai-accent-600"></span>
                    {insight.type}
                  </p>
                  <p className="typography-body text-xs text-slate-600">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Assessment (Actionable Card) */}
          {mockAssessments[0] && (
            <Card
              variant="actionable"
              onClick={() => setActiveTab('assessments')}
            >
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="typography-h2 text-sm text-slate-900">Upcoming Assessment</h3>
                <span className="typography-caption inline-flex items-center gap-1.5 rounded-full bg-opportunity-50 text-opportunity-700 border border-opportunity-200 px-2.5 py-0.5 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-opportunity-500" />
                  <span>Scheduled</span>
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-slate-800 text-sm">{mockAssessments[0].title}</p>
                <div className="typography-caption text-slate-500 flex items-center justify-between">
                  <span>Due: {mockAssessments[0].dueDate}</span>
                  <span>{mockAssessments[0].estimatedMinutes || '15'} mins focus</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('assessments');
                  }}
                  className="w-full mt-3 btn-primary text-xs"
                >
                  Discover Baseline
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Recommended Upskilling Pathways (Staggered Entrance Cards with ai-accent Match Scores) */}
      <div className="rounded-xl border border-slate-200/80 bg-[#F8FCFD] p-5 cursor-default">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="typography-h2 text-slate-900">Recommended Pathways to Close Skill Gaps</h2>
            <p className="typography-caption text-slate-500">AI-curated learning paths to accelerate target role readiness</p>
          </div>
          <button
            onClick={() => setActiveTab('courses')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 group active:scale-[0.97] transition-all cursor-pointer"
          >
            Explore All Courses <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* Framer Motion Staggered Container */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.06,
                delayChildren: 0.1,
              },
            },
          }}
        >
          {recommendations.map((rec) => (
            <motion.div
              key={rec.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.3, ease: 'easeOut' },
                },
              }}
              onClick={() => {
                const targetSkill = skills.find((s) => s.name === rec.impactSkill);
                if (targetSkill) {
                  if (onOpenDevelopmentPath) {
                    onOpenDevelopmentPath(targetSkill.id);
                  } else {
                    setActiveTab('skills', targetSkill.id);
                  }
                } else {
                  setActiveTab('courses');
                }
              }}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-[#F8FCFD] p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-150 cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-md bg-ai-accent-50 text-ai-accent-700 font-semibold px-2 py-0.5 border border-ai-accent-200/60">
                    {rec.type}
                  </span>
                  <span className="font-bold text-ai-accent-600 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {rec.matchScore}% match
                  </span>
                </div>
                <h3 className="mt-2.5 font-semibold text-slate-900 text-sm leading-snug group-hover:text-teal-600 transition-colors duration-150">
                  {rec.title}
                </h3>
                <p className="mt-1 typography-caption text-slate-500">Target: {rec.impactSkill}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{rec.duration}</span>
                <span className="font-semibold text-teal-600 hover:text-teal-700 transition-colors duration-150 flex items-center gap-1">
                  View Development Path &rarr;
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

