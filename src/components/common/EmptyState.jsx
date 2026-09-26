import React from 'react';
import { Compass } from 'lucide-react';

/**
 * Shared Empty State component: Icon slot + warm sentence + single CTA.
 */
export default function EmptyState({
  icon: Icon = Compass,
  title = 'No items found',
  description = 'There are no items matching this view right now.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`py-12 px-6 text-center rounded-2xl border border-dashed border-slate-200/80 bg-[#F8FCFD]/80 backdrop-blur-xs flex flex-col items-center justify-center max-w-md mx-auto animate-fade-in ${className}`.trim()}
    >
      <div className="h-12 w-12 rounded-2xl bg-ai-accent-50 text-ai-accent-600 border border-ai-accent-200/60 flex items-center justify-center mb-3.5 shadow-2xs">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-slate-500 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 btn-primary text-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
