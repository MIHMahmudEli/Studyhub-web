'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminHeader({
  backHref = '/admin/dashboard',
  backText = 'Back to Dashboard',
  title,
  titleHighlight,
  titleHighlightGradient = 'from-blue-500 via-indigo-500 to-purple-500',
  description,
  glowColor = 'bg-blue-500/10',
  statsIcon: StatsIcon,
  statsTitle,
  statsValue,
  statsColorClass = 'text-blue-500 bg-blue-500/10 border-blue-500/20'
}) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 relative text-center md:text-left w-full">
      {/* Decorative Glow */}
      <div className={`absolute -top-10 -left-10 w-40 h-40 blur-[80px] rounded-full -z-10 animate-pulse ${glowColor}`} />
      
      <div className="space-y-3 sm:space-y-4 w-full md:w-auto">
        <Link 
          href={backHref} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[var(--foreground)] transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={16} /> {backText}
        </Link>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
          {title} {titleHighlight && (
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${titleHighlightGradient}`}>
              {titleHighlight}
            </span>
          )}
        </h1>
        {description && (
          <p className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-[600px] mx-auto md:mx-0">
            {description}
          </p>
        )}
      </div>

      {/* Quick Stats Summary Badge */}
      {StatsIcon && statsValue !== undefined && (
        <div className="flex items-center gap-3.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.5rem] p-4 shadow-sm backdrop-blur-xl w-full md:w-auto justify-center md:justify-end shrink-0">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg ${statsColorClass}`}>
            <StatsIcon size={22} className="animate-pulse" />
          </div>
          <div className="text-left">
            {statsTitle && (
              <p className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider leading-none">
                {statsTitle}
              </p>
            )}
            <p className={`text-sm font-black uppercase mt-1.5 leading-none ${statsColorClass.split(' ')[0]}`}>
              {statsValue}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
