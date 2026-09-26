import React from 'react';

/**
 * Generic Skeleton Loader component with presets for stat card, skill card, course card, and inline blocks.
 */
export default function Skeleton({
  variant = 'block',
  className = '',
  count = 1,
}) {
  if (variant === 'stat-card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200/80 bg-[#F8FCFD] p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
              <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded mt-2"></div>
            <div className="h-3 w-28 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'skill-card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[...Array(count || 4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-[#F8FCFD] p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <div className="h-3 w-20 bg-slate-200 rounded"></div>
                <div className="h-5 w-44 bg-slate-200 rounded"></div>
              </div>
              <div className="h-6 w-24 bg-slate-100 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-slate-100 rounded"></div>
                <div className="h-3 w-24 bg-slate-100 rounded"></div>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full"></div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between">
              <div className="h-3 w-24 bg-slate-100 rounded"></div>
              <div className="h-3 w-28 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'course-card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(count || 3)].map((_, i) => (
          <div key={i} className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-[#F8FCFD] p-5 space-y-5">
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-5 w-16 bg-slate-100 rounded"></div>
                <div className="h-5 w-24 bg-slate-100 rounded-full"></div>
              </div>
              <div className="h-6 w-4/5 bg-slate-200 rounded mt-2"></div>
              <div className="h-3 w-28 bg-slate-100 rounded"></div>
              <div className="rounded-lg bg-slate-50 p-3 space-y-2">
                <div className="h-3 w-full bg-slate-200/60 rounded"></div>
                <div className="h-3 w-3/4 bg-slate-200/60 rounded"></div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <div className="h-8 w-28 bg-slate-200 rounded-xl"></div>
              <div className="h-4 w-16 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className}`.trim()}
    />
  );
}
