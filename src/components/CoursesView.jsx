import React, { useState, useEffect } from 'react';
import { Play, Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockRecommendations } from '../mock/employeeData';
import Skeleton from './common/Skeleton';
import EmptyState from './common/EmptyState';

export default function CoursesView() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
        </div>
        <Skeleton variant="course-card" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="typography-display text-slate-900">Upskilling &amp; Learning Pathways</h1>
        <p className="typography-body text-slate-500 mt-1">
          AI-curated learning content and practical labs aligned with your target role
        </p>
      </div>

      {mockRecommendations.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Explore available official courses from NSSTA and MoSPI using the search bar above."
        />
      ) : (
        /* Framer Motion Staggered Entrance */
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.06,
                delayChildren: 0.05,
              },
            },
          }}
        >
          {mockRecommendations.map((course) => (
            <motion.div
              key={course.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.3, ease: 'easeOut' },
                },
              }}
              className="card-actionable-ai flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-ai-accent-50 border border-ai-accent-200/70 px-2 py-0.5 text-xs font-semibold text-ai-accent-700">
                    {course.type}
                  </span>
                  {course.isUrgent && (
                    <span className="rounded-full bg-opportunity-50 border border-opportunity-200 px-2.5 py-0.5 text-[11px] font-semibold text-opportunity-700">
                      High Priority Gap
                    </span>
                  )}
                </div>

                <h3 className="mt-3.5 typography-h2 text-slate-900 group-hover:text-teal-600 transition-colors duration-150">
                  {course.title}
                </h3>
                <p className="mt-1 typography-caption text-slate-500">Provider: {course.provider}</p>

                <div className="mt-4 rounded-xl bg-slate-50/80 border border-slate-100 p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Target Skill:</span>
                    <strong className="text-slate-800 font-semibold">{course.impactSkill}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>AI Match Score:</span>
                    <strong className="text-ai-accent-600 font-bold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {course.matchScore}%
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Time:</span>
                    <strong className="text-slate-800 font-semibold">{course.duration}</strong>
                  </div>
                </div>
              </div>

              {/* Standardized Primary vs Secondary Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="btn-primary flex-1 group/btn"
                >
                  <Play className="h-3.5 w-3.5 fill-current transition-transform duration-200 group-hover/btn:scale-110" />
                  <span>Start Module</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary px-4"
                >
                  Syllabus
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
