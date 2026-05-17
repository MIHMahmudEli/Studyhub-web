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
    <div className="group relative h-[300px] md:h-[360px] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col items-center justify-between shadow-sm">
      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-[var(--background)] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shadow-xl">
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>

      <div className="text-center space-y-3 w-full flex flex-col items-center">
        <div className="space-y-2 w-full flex flex-col items-center">
          <Skeleton className="w-20 h-4 rounded-full" />
          <div className="space-y-2 w-full flex flex-col items-center mt-2">
            <Skeleton className="w-16 h-3 rounded-full" />
            <Skeleton className="w-3/4 h-4 rounded-full mt-2" />
            <Skeleton className="w-1/2 h-4 rounded-full" />
          </div>
        </div>
      </div>

      <div className="w-full flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.05]">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-3 rounded-full" />
          <div className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          <Skeleton className="w-8 h-3 rounded-full" />
        </div>
        <Skeleton className="w-6 h-6 md:w-7 md:h-7 rounded-full" />
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
        <div key={i} className="bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/[0.05] rounded-[1.5rem] p-6 flex flex-col justify-between h-[180px] shadow-sm animate-pulse">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-12 h-4 rounded" />
              <Skeleton className="w-16 h-3 rounded" />
            </div>
            <Skeleton className="w-full h-4 rounded mt-2" />
            <Skeleton className="w-2/3 h-4 rounded" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200/50 dark:border-white/[0.05] pt-4">
            <Skeleton className="w-16 h-3 rounded" />
            <Skeleton className="w-4 h-4 rounded-full" />
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
        <div key={i} className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-4 min-w-0">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-4 rounded" />
              <Skeleton className="w-24 h-3 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="w-9 h-9 rounded-xl" />
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end">
        <div className="order-2 md:order-1 flex flex-col items-center">
          <Skeleton className="w-16 h-16 rounded-full mb-4" />
          <Skeleton className="w-24 h-4 rounded mb-2" />
          <Skeleton className="w-16 h-3 rounded mb-4" />
          <Skeleton className="w-full h-32 rounded-t-[2rem]" />
        </div>
        <div className="order-1 md:order-2 flex flex-col items-center">
          <Skeleton className="w-20 h-20 rounded-full mb-4" />
          <Skeleton className="w-32 h-5 rounded mb-2" />
          <Skeleton className="w-20 h-3 rounded mb-4" />
          <Skeleton className="w-full h-40 rounded-t-[2rem]" />
        </div>
        <div className="order-3 md:order-3 flex flex-col items-center">
          <Skeleton className="w-16 h-16 rounded-full mb-4" />
          <Skeleton className="w-24 h-4 rounded mb-2" />
          <Skeleton className="w-16 h-3 rounded mb-4" />
          <Skeleton className="w-full h-28 rounded-t-[2rem]" />
        </div>
      </div>
      
      {/* Table Skeleton */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-4 md:p-8 shadow-sm">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="w-32 h-4 rounded" />
                  <Skeleton className="w-24 h-3 rounded" />
                </div>
              </div>
              <Skeleton className="w-16 h-6 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
