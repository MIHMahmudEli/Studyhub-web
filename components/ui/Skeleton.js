'use client';

// New modular default export for shimmery loading skeletons on admin/resources pages
export default function ModernSkeleton({ type = 'list', count = 3 }) {
  // Shimmer class with pulsing animation and modern border radii
  const shimmerClass = "bg-slate-200 dark:bg-white/[0.05] animate-pulse rounded-xl";

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full">
        {Array.from({ length: count }).map((_, idx) => (
          <div 
            key={idx} 
            className="h-[280px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 flex flex-col items-center justify-between"
          >
            <div className={`${shimmerClass} w-12 h-12 rounded-[1.2rem]`} />
            <div className="space-y-3 w-full flex flex-col items-center">
              <div className={`${shimmerClass} h-4 w-3/4`} />
              <div className={`${shimmerClass} h-3 w-1/2`} />
            </div>
            <div className="w-full flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
              <div className={`${shimmerClass} h-3 w-1/4`} />
              <div className={`${shimmerClass} w-5 h-5 rounded-full`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-4 w-full">
        {/* Table header skeleton */}
        <div className="hidden md:flex justify-between items-center border-b border-[var(--card-border)] pb-4 px-4">
          <div className={`${shimmerClass} h-3 w-1/3`} />
          <div className={`${shimmerClass} h-3 w-1/6`} />
          <div className={`${shimmerClass} h-3 w-1/6`} />
          <div className={`${shimmerClass} h-3 w-1/6`} />
        </div>
        
        {/* Table rows / Mobile cards list */}
        {Array.from({ length: count }).map((_, idx) => (
          <div 
            key={idx}
            className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 md:p-6 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[1.5rem]"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`${shimmerClass} w-10 h-10 rounded-xl shrink-0`} />
              <div className="space-y-2 flex-1 min-w-0">
                <div className={`${shimmerClass} h-4 w-1/2`} />
                <div className={`${shimmerClass} h-3 w-1/3`} />
              </div>
            </div>
            <div className="flex items-center gap-6 justify-between md:justify-end shrink-0">
              <div className={`${shimmerClass} h-4 w-16`} />
              <div className={`${shimmerClass} h-4 w-16`} />
              <div className={`${shimmerClass} h-8 w-24`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default simple list / resource card skeleton
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-6 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[1.2rem] md:rounded-[1.5rem]"
        >
          <div className="flex items-center gap-4">
            <div className={`${shimmerClass} w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl shrink-0`} />
            <div className="space-y-2">
              <div className={`${shimmerClass} h-4 w-48`} />
              <div className={`${shimmerClass} h-3 w-32`} />
            </div>
          </div>
          <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0">
            <div className={`${shimmerClass} h-3 w-20`} />
            <div className={`${shimmerClass} h-8 w-24`} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Named base skeleton for backward-compatibility with stats cards & general table skeletons
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800/50 ${className}`}
      {...props}
    />
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="relative h-[280px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 flex flex-col items-center justify-between shadow-sm animate-pulse">
      <div className="relative z-10 w-12 h-12 rounded-[1.2rem] bg-slate-200 dark:bg-white/[0.05] border border-[var(--card-border)] flex items-center justify-center shadow-md">
        <div className="w-5 h-5 rounded bg-slate-300 dark:bg-white/[0.08]" />
      </div>

      <div className="relative z-10 text-center space-y-2 w-full">
        <div className="space-y-1">
          <div className="h-[14px] md:h-[15px] w-3/4 mx-auto rounded-full bg-slate-200 dark:bg-white/[0.05]" />
          <div className="space-y-1 pt-1">
            <div className="h-[11px] w-1/3 mx-auto rounded-full bg-slate-200 dark:bg-white/[0.05]" />
            <div className="h-[10px] w-1/2 mx-auto rounded-full bg-slate-200 dark:bg-white/[0.05] mt-1.5" />
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-10 rounded-full bg-slate-200 dark:bg-white/[0.05]" />
          <div className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="h-3 w-10 rounded-full bg-slate-200 dark:bg-white/[0.05]" />
        </div>
        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/[0.05]" />
      </div>
    </div>
  );
}

export function NoteDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full animate-pulse">
      <div className="lg:col-span-2 space-y-6">
        <div className="w-full aspect-[3/4] md:h-[800px] bg-slate-200 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] overflow-hidden shadow-2xl relative" />
      </div>
      <div className="space-y-6">
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-8 shadow-sm">
          <Skeleton className="w-24 h-6 rounded-full mb-6" />
          <Skeleton className="w-3/4 h-8 rounded-lg mb-4" />
          <Skeleton className="w-full h-16 rounded-lg mb-8" />
          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/[0.05]">
            <div className="flex justify-between"><Skeleton className="w-16 h-3 rounded-full" /><Skeleton className="w-24 h-3 rounded-full" /></div>
            <div className="flex justify-between"><Skeleton className="w-16 h-3 rounded-full" /><Skeleton className="w-20 h-3 rounded-full" /></div>
            <div className="flex justify-between"><Skeleton className="w-16 h-3 rounded-full" /><Skeleton className="w-12 h-3 rounded-full" /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-6 flex items-center gap-4 shadow-sm">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="w-20 h-2 rounded-full" />
            <Skeleton className="w-32 h-3 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookmarkListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="relative h-[280px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 flex flex-col items-center justify-between shadow-sm animate-pulse">
          <div className="relative z-10 w-12 h-12 rounded-[1.2rem] bg-slate-200 dark:bg-white/[0.05] border border-[var(--card-border)] flex items-center justify-center shadow-md">
            <div className="w-5 h-5 rounded bg-slate-300 dark:bg-white/[0.08]" />
          </div>

          <div className="relative z-10 text-center space-y-2 w-full">
            <div className="space-y-1">
              <div className="h-[14px] md:h-[15px] w-3/4 mx-auto rounded-full bg-slate-200 dark:bg-white/[0.05]" />
              <div className="space-y-1 pt-1">
                <div className="h-[11px] w-1/3 mx-auto rounded-full bg-slate-200 dark:bg-white/[0.05]" />
                <div className="h-[10px] w-1/2 mx-auto rounded-full bg-slate-200 dark:bg-white/[0.05] mt-1.5" />
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <div className="h-3 w-16 rounded-full bg-slate-200 dark:bg-white/[0.05]" />
            </div>
            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ResourceListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/[0.05] shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-white/[0.05]" />
              <div className="h-3 w-20 rounded bg-slate-200 dark:bg-white/[0.05]" />
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-[38px] h-[38px] rounded-xl bg-slate-200 dark:bg-white/[0.05]" />
            <div className="w-[38px] h-[38px] rounded-xl bg-slate-200 dark:bg-white/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Podium Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-end">
        <div className="order-2 md:order-1 flex flex-col items-center">
          <Skeleton className="w-16 h-16 rounded-2xl mb-4" />
          <Skeleton className="w-24 h-4 rounded mb-2" />
          <Skeleton className="w-16 h-3 rounded mb-3" />
          <Skeleton className="w-16 h-4 rounded-full mb-4" />
          <Skeleton className="w-24 h-6 rounded mb-3" />
          <Skeleton className="w-full h-2 rounded-full mb-4" />
          <Skeleton className="w-20 h-3 rounded mb-2" />
          <Skeleton className="w-full h-44 rounded-[2rem]" />
        </div>
        <div className="order-1 md:order-2 flex flex-col items-center">
          <Skeleton className="w-20 h-20 rounded-2xl mb-4" />
          <Skeleton className="w-32 h-5 rounded mb-2" />
          <Skeleton className="w-20 h-3 rounded mb-3" />
          <Skeleton className="w-20 h-4 rounded-full mb-4" />
          <Skeleton className="w-28 h-7 rounded mb-3" />
          <Skeleton className="w-full h-2 rounded-full mb-4" />
          <Skeleton className="w-24 h-3 rounded mb-2" />
          <Skeleton className="w-full h-52 rounded-[2rem]" />
        </div>
        <div className="order-3 md:order-3 flex flex-col items-center">
          <Skeleton className="w-16 h-16 rounded-2xl mb-4" />
          <Skeleton className="w-24 h-4 rounded mb-2" />
          <Skeleton className="w-16 h-3 rounded mb-3" />
          <Skeleton className="w-16 h-4 rounded-full mb-4" />
          <Skeleton className="w-24 h-6 rounded mb-3" />
          <Skeleton className="w-full h-2 rounded-full mb-4" />
          <Skeleton className="w-20 h-3 rounded mb-2" />
          <Skeleton className="w-full h-40 rounded-[2rem]" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-[var(--card-border)]">
          <Skeleton className="w-36 h-5 rounded" />
        </div>
        <div className="divide-y divide-[var(--card-border)]">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 px-6 py-5">
              <Skeleton className="w-7 h-4 rounded" />
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="w-32 h-4 rounded" />
                <Skeleton className="w-20 h-3 rounded" />
              </div>
              <Skeleton className="w-14 h-5 rounded" />
              <Skeleton className="w-16 h-5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
