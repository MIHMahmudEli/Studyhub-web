'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { apiRequest } from '@/lib/api';

// Modular Sub-Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RoutineBanner from '@/components/dashboard/RoutineBanner';
import QuickShortcuts from '@/components/dashboard/QuickShortcuts';
import ModernSkeleton, { Skeleton } from '@/components/ui/Skeleton';

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
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
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoadingNotes(true);
      // 1. Fetch user's uploaded notes to compile stats
      const notesData = await apiRequest('/notes/my-notes');

      // 2. Fetch leaderboard to determine current rank
      const leaderboardData = await apiRequest('/users/leaderboard');
      const rankIndex = leaderboardData.findIndex(u => u.id === user.id);
      const userRank = rankIndex !== -1 ? `#${rankIndex + 1}` : 'Rank #--';

      // 3. Compute stats
      const totalDownloads = notesData.reduce((acc, note) => acc + (note.downloads || 0), 0);
      
      setStats({
        points: user.points || 0,
        uploads: notesData.length,
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
          {/* Header skeleton */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-pulse">
            <div className="space-y-3">
              <Skeleton className="w-28 h-5 rounded-full" />
              <Skeleton className="w-64 h-10 rounded-lg" />
              <Skeleton className="w-80 h-3 rounded-full" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="w-12 h-12 rounded-[1.25rem]" />
              <Skeleton className="w-40 h-12 rounded-[1.25rem]" />
            </div>
          </div>
          {/* Stats cards skeleton */}
          <ModernSkeleton type="card" count={4} />
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

          {/* Quick Shortcuts Hub */}
          <QuickShortcuts />
        </div>
      </div>
    </main>
  );
}
