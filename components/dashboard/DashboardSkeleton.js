'use client';

import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />
      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-pulse">
            <div className="space-y-4">
              <Skeleton className="w-28 h-5 rounded-full" />
              <Skeleton className="w-72 h-10 rounded-lg" />
              <Skeleton className="w-96 h-3 rounded-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-[1.25rem]" />
              <div className="flex items-center gap-3.5 p-3.5 rounded-[1.25rem] border border-[var(--card-border)]">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="w-16 h-2 rounded-full" />
                  <Skeleton className="w-24 h-3 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-[2.5rem] p-8 border border-[var(--card-border)] bg-[var(--card-bg)] animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <Skeleton className="w-24 h-3 rounded-full" />
                    <Skeleton className="w-16 h-10 rounded-lg" />
                    <Skeleton className="w-28 h-3 rounded-full" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[2.5rem] p-8 md:p-10 border border-indigo-500/20 bg-[var(--card-bg)] animate-pulse">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <Skeleton className="w-28 h-5 rounded-full" />
                <Skeleton className="w-80 h-8 rounded-lg" />
                <Skeleton className="w-64 h-4 rounded-full" />
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                  <Skeleton className="w-44 h-3 rounded-full" />
                  <Skeleton className="w-36 h-3 rounded-full" />
                  <Skeleton className="w-32 h-3 rounded-full" />
                </div>
              </div>
              <Skeleton className="w-48 h-14 rounded-[1.75rem]" />
            </div>
          </div>

          <div className="rounded-[2.5rem] p-6 md:p-8 border border-[var(--card-border)] bg-[var(--card-bg)] animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="w-24 h-2 rounded-full" />
                  <Skeleton className="w-32 h-4 rounded" />
                  <Skeleton className="w-36 h-2 rounded-full" />
                </div>
              </div>
              <Skeleton className="w-5 h-5 rounded-full" />
            </div>
          </div>

          <div className="space-y-10">
            {[...Array(3)].map((_, s) => (
              <div key={s} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[var(--card-border)]" />
                  <Skeleton className="w-36 h-2 rounded-full shrink-0" />
                  <div className="h-px flex-1 bg-[var(--card-border)]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(s === 2 ? 1 : 3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] animate-pulse">
                      <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
                      <div className="space-y-2 flex-1 min-w-0">
                        <Skeleton className="w-28 h-3 rounded-full" />
                        <Skeleton className="w-20 h-2 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
