'use client';

export default function ConfigCard({
  title,
  subtitle,
  badgeText = 'Setting',
  badgeIcon: BadgeIcon,
  loading = false,
  children
}) {
  // Shimmery skeleton state
  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 h-[200px] sm:h-[140px] flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-pulse w-full">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-28 bg-slate-200 dark:bg-white/[0.05] rounded-full" />
          <div className="h-5 w-1/3 bg-slate-200 dark:bg-white/[0.05] rounded-md mt-2" />
          <div className="h-2.5 w-3/4 bg-slate-200 dark:bg-white/[0.05] rounded-full mt-2" />
        </div>
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <div className="h-12 w-full sm:w-36 bg-slate-200 dark:bg-white/[0.05] rounded-xl" />
          <div className="h-12 w-full sm:w-36 bg-slate-200 dark:bg-white/[0.05] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-in fade-in duration-500 hover:border-blue-500/30 transition-all w-full">
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[9px] font-black uppercase tracking-[0.3em]">
          {BadgeIcon && <BadgeIcon size={12} />} {badgeText}
        </div>
        <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">{title}</h3>
        <p className="text-xs font-bold text-slate-500 max-w-[600px] mx-auto sm:mx-0">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-100 dark:bg-white/[0.05] p-1.5 rounded-2xl border border-slate-200 dark:border-white/[0.05] shrink-0 w-full sm:w-auto justify-center">
        {children}
      </div>
    </div>
  );
}
