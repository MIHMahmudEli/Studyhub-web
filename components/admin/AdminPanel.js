'use client';

import Skeleton from '@/components/ui/Skeleton';

export default function AdminPanel({
  panelIcon: PanelIcon,
  panelIconClass = 'text-blue-500',
  panelTitle,
  panelSubtitle,
  badgeText,
  badgeColorClass = 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  panelActions,
  loading = false,
  skeletonCount = 3,
  skeletonType = 'table',
  error = null,
  isEmpty = false,
  emptyIcon: EmptyIcon,
  emptyTitle = 'No Data Found',
  emptyDescription,
  children
}) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl overflow-hidden backdrop-blur-xl animate-in fade-in duration-500 w-full">
      {/* Panel Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="text-left">
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2">
            {PanelIcon && <PanelIcon size={20} className={panelIconClass} />} 
            {panelTitle}
          </h3>
          {panelSubtitle && (
            <p className="text-xs font-bold text-slate-500 mt-1">
              {panelSubtitle}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {panelActions}
          {badgeText !== undefined && badgeText !== null && (
            <span className={`text-xs font-black px-4 py-2.5 rounded-2xl border uppercase tracking-widest text-center shrink-0 ${badgeColorClass}`}>
              {badgeText}
            </span>
          )}
        </div>
      </div>

      {/* Main Contents / States */}
      {loading ? (
        <Skeleton type={skeletonType} count={skeletonCount} />
      ) : error ? (
        <div className="py-16 text-center space-y-3 border-2 border-dashed border-red-500/20 rounded-[2rem] bg-red-500/5">
          <p className="text-sm font-black uppercase tracking-widest text-red-500">Error Loading Data</p>
          <p className="text-xs font-bold text-slate-500">{error}</p>
        </div>
      ) : isEmpty ? (
        <div className="py-16 text-center space-y-3 border-2 border-dashed border-[var(--card-border)] rounded-[2rem]">
          {EmptyIcon && (
            <div className="w-12 h-12 bg-slate-100 dark:bg-white/[0.05] text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-200 dark:border-white/[0.05] shrink-0">
              <EmptyIcon size={24} />
            </div>
          )}
          {emptyTitle && (
            <p className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">
              {emptyTitle}
            </p>
          )}
          {emptyDescription && (
            <p className="text-xs font-bold text-slate-500">
              {emptyDescription}
            </p>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
