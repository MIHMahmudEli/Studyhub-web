'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

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
    <PageHeader
      topAction={
        <Link 
          href={backHref} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[var(--foreground)] transition-colors shadow-sm cursor-pointer w-fit"
        >
          <ArrowLeft size={16} /> {backText}
        </Link>
      }
      title={title}
      titleHighlight={titleHighlight}
      titleGradient={titleHighlightGradient}
      description={description}
      glowColor={glowColor}
      badgeIcon={null}
      badgeText=""
    >
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
    </PageHeader>
  );
}
