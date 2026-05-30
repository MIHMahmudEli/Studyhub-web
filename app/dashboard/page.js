'use client';

import { useState, useEffect } from 'react';
import { User, ArrowRight, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { apiRequest } from '@/lib/api';

// Modular Sub-Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RoutineBanner from '@/components/dashboard/RoutineBanner';
import QuickShortcuts from '@/components/dashboard/QuickShortcuts';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudentDashboard() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();
  
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [stats, setStats] = useState({
    points: 0,
    uploads: 0,
    downloads: 0,
    rank: '--'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (tokenReady && user) {
      fetchDashboardData();
    }
  }, [tokenReady, user]);

  const fetchDashboardData = async () => {
    try {
      setLoadingNotes(true);
      // 1. Fetch user's uploaded notes to compile stats
      const notesRes = await apiRequest('/notes/my-notes?limit=1000');
      const notes = notesRes?.data || notesRes || [];

      // 2. Fetch leaderboard to determine current rank
      const leaderboardData = await apiRequest('/users/leaderboard');
      const rankIndex = leaderboardData.findIndex(u => u.id === user.id);
      const userRank = rankIndex !== -1 ? `#${rankIndex + 1}` : 'Rank #--';

      // 3. Compute stats
      const totalDownloads = notes.reduce((acc, note) => acc + (note.downloads || 0), 0);

      setStats({
        points: user.points || 0,
        uploads: notes.length,
        downloads: totalDownloads,
        rank: userRank
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  if (authLoading || loadingNotes) return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />
      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-12">
          {/* ─── DashboardHeader skeleton ───────────────────────────── */}
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

          {/* ─── StatsGrid skeleton ─────────────────────────────────── */}
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

          {/* ─── RoutineBanner skeleton ──────────────────────────────── */}
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

          {/* ─── Profile Card skeleton ───────────────────────────────── */}
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

          {/* ─── QuickShortcuts skeleton ─────────────────────────────── */}
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

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-12">
          {/* Welcome Header */}
          <DashboardHeader user={user} />

          {/* Premium Overview Cards */}
          <StatsGrid stats={stats} loading={loadingNotes} />

          {/* Premium Routine Generator Banner */}
          <RoutineBanner />

          {/* My Public Profile Card */}
          <button onClick={() => router.push(`/profile/${user?.id}`)} className="w-full group relative overflow-hidden rounded-[2.5rem] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8 text-left shadow-lg hover:border-blue-500/30 transition-all duration-500 cursor-pointer">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-[60px] rounded-full pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                {user?.profile_pic ? (
                  <img src={user.profile_pic} alt={user.name} className="w-14 h-14 rounded-2xl object-cover border border-[var(--card-border)] shadow-sm" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-xl uppercase shadow-sm">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                )}
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">My Public Profile</p>
                  <p className="text-sm font-black group-hover:text-blue-500 transition-colors">{user?.name}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">View your public profile</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </button>

          {/* Quick Shortcuts Hub */}
          <QuickShortcuts />
        </div>
      </div>
    </main>
  );
}
