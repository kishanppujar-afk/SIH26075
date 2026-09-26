import React, { useState, useEffect } from 'react';
import { mockSkills, mockEmployee } from '../mock/employeeData';
import { Filter, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Compass } from 'lucide-react';
import Skeleton from './common/Skeleton';
import EmptyState from './common/EmptyState';

import DevelopmentPath from './DevelopmentPath';

export default function SkillsView({
  initialSkillId = null,
  setActiveTab = () => {},
}) {
  const [filterCategory, setFilterCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSkillId, setActiveSkillId] = useState(initialSkillId);

  useEffect(() => {
    if (initialSkillId) {
      setActiveSkillId(initialSkillId);
    }
  }, [initialSkillId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsLoaded(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setIsLoaded(false);
      const timer = setTimeout(() => setIsLoaded(true), 50);
      return () => clearTimeout(timer);
    }
  }, [filterCategory, isLoading]);

  const categories = ['All', 'Technical', 'Cloud & DevOps', 'Architecture', 'Soft Skills'];

  const filteredSkills = filterCategory === 'All'
    ? mockSkills
    : mockSkills.filter((s) => s.category === filterCategory);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <Skeleton variant="skill-card" count={6} />
      </div>
    );
  }

  if (activeSkillId) {
    return (
      <DevelopmentPath
        skillId={activeSkillId}
        onClose={() => setActiveSkillId(null)}
        onSelectSkill={(id) => setActiveSkillId(id)}
        onNavigateToAssessments={() => setActiveTab('assessments')}
        onNavigateToDashboard={() => setActiveTab('dashboard')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="typography-display text-slate-900">Skills &amp; Benchmarks</h1>
          <p className="typography-body text-slate-500 mt-1">
            Compare your current skill competencies against benchmarks for <strong className="text-slate-700 font-semibold">{mockEmployee.targetRole}</strong>
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${
                filterCategory === cat
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'bg-[#F8FCFD] border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of skills or Empty State */}
      {filteredSkills.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No skills found in this category"
          description="Try selecting a different competency category above to view benchmarks."
          actionLabel="Show All Categories"
          onAction={() => setFilterCategory('All')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map((skill, sIdx) => {
            const isOpportunity = skill.status === 'Growth Opportunity' || skill.status === 'Skill Gap';
            const isExceeds = skill.status === 'Exceeds Target';
            const isProficient = skill.status === 'Proficient' || skill.status === 'On Track';
            const displayStatus = isOpportunity ? 'Growth Opportunity' : skill.status;
            const gapSize = skill.targetScore - skill.currentScore;

            const cardVariantClass = isOpportunity
              ? 'card-actionable-opportunity'
              : isExceeds
              ? 'card-actionable-exceeds'
              : 'card-actionable-growth';

            return (
              <div
                key={skill.id}
                className={`${cardVariantClass} space-y-3.5 group`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="typography-caption uppercase tracking-wider text-slate-400">
                      {skill.category}
                    </span>
                    <h3 className="typography-h2 text-slate-900 mt-0.5 group-hover:text-teal-600 transition-colors duration-150">
                      {skill.name}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border transition-colors duration-300 ${
                      isOpportunity
                        ? 'bg-opportunity-50 text-opportunity-700 border-opportunity-200'
                        : isExceeds
                        ? 'bg-exceeds-50 text-exceeds-700 border-exceeds-200'
                        : 'bg-growth-50 text-growth-700 border-growth-200'
                    }`}
                  >
                    {isOpportunity && <AlertTriangle className="h-3 w-3 text-opportunity-600" />}
                    {isExceeds && <Sparkles className="h-3 w-3 text-exceeds-600" />}
                    {isProficient && <CheckCircle2 className="h-3 w-3 text-growth-600" />}
                    <span>{displayStatus}</span>
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span>Current: <strong className="text-slate-800 font-semibold">{skill.currentScore}%</strong></span>
                    <span>Target Benchmark: <strong className="text-slate-800 font-semibold">{skill.targetScore}%</strong></span>
                  </div>
                  <div className="relative h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
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
                        transitionDelay: `${sIdx * 70}ms`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="typography-caption">
                    {gapSize > 0 ? (
                      <span className="text-opportunity-600 font-semibold">Growth needed: {gapSize} points</span>
                    ) : (
                      <span className="text-growth-600 font-semibold">Benchmark satisfied</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveSkillId(skill.id)}
                    className="text-teal-600 hover:text-teal-700 font-semibold cursor-pointer transition-colors duration-150 flex items-center gap-1 active:scale-95"
                  >
                    <span>View Development Path</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
