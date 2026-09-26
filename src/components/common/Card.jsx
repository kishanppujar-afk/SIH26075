import React from 'react';

/**
 * Reusable Card component implementing ambient and actionable variants.
 *
 * @param {'ambient' | 'actionable'} variant Ambient for passive/informational, Actionable for interactive
 * @param {'growth' | 'opportunity' | 'exceeds' | 'ai-accent' | 'brand' | null} status Colored left-edge indicator
 * @param {string} className Additional custom Tailwind classes
 * @param {React.ReactNode} children Child content
 */
export default function Card({
  variant = 'ambient',
  status = null,
  className = '',
  children,
  onClick,
  ...props
}) {
  const isActionable = variant === 'actionable';

  const baseClasses = isActionable
    ? 'rounded-2xl border border-slate-200/80 bg-[#F8FCFD] p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-150'
    : 'rounded-xl border border-slate-200/80 bg-[#F8FCFD] p-5 cursor-default';

  return (
    <div
      className={`${baseClasses} ${className}`.trim()}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
