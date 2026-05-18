'use client';

/**
 * PageHeader — Majestic page header used across student-facing routes.
 *
 * Props:
 *  badgeIcon         — Lucide icon component for the badge pill
 *  badgeText         — text label inside the badge pill
 *  badgeColorClass   — Tailwind classes for badge colors (text + bg + border)
 *  glowColor         — Tailwind class for ambient blob, e.g. "bg-purple-500/10"
 *  title             — plain part of the H1
 *  titleHighlight    — gradient-highlighted word in the H1
 *  titleGradient     — Tailwind gradient string, e.g. "from-purple-500 to-blue-500"
 *  description       — subtitle paragraph text
 *  children          — right-side slot (search input, filter buttons, etc.)
 */
export default function PageHeader({
  badgeIcon: BadgeIcon,
  badgeText,
  badgeColorClass = 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  glowColor = 'bg-blue-500/10',
  title,
  titleHighlight,
  titleGradient = 'from-blue-500 to-purple-500',
  description,
  children,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
      <div className="space-y-4 relative">
        {/* Ambient glow blob */}
        <div className={`absolute -top-10 -left-10 w-40 h-40 ${glowColor} blur-[80px] rounded-full -z-10`} />

        {/* Badge pill */}
        {BadgeIcon && badgeText && (
          <div className={`inline-flex items-center gap-2 px-3 py-1 border rounded-full text-[9px] font-black uppercase tracking-[0.3em] ${badgeColorClass}`}>
            <BadgeIcon size={12} strokeWidth={3} />
            {badgeText}
          </div>
        )}

        {/* H1 */}
        <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
          {title}{' '}
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${titleGradient}`}>
            {titleHighlight}
          </span>
        </h1>

        {/* Description */}
        {description && (
          <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest max-w-[500px]">
            {description}
          </p>
        )}
      </div>

      {/* Right-side slot (search, filters…) */}
      {children && (
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}
