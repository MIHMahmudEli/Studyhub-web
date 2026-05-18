'use client';

export default function Skeleton({ type = 'list', count = 3 }) {
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
