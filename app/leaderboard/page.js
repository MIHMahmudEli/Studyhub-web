'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import PodiumCard from '@/components/leaderboard/PodiumCard';
import RankingsTable from '@/components/leaderboard/RankingsTable';
import { LeaderboardSkeleton } from '@/components/ui/Skeleton';
import { Trophy, Calendar, Users, Sparkles, ChevronRight } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchLeaderboard = async (showSpinner = true) => {
      if (showSpinner) setLoading(true);
      try {
        const response = await apiRequest(`/users/leaderboard?period=${activeTab}`);
        setLeaders(response.data || response);
      } catch (err) {
        setLeaders([]);
      } finally {
        if (showSpinner) setLoading(false);
      }
    };

    if (tokenReady && user) {
      fetchLeaderboard(true);
      const interval = setInterval(() => fetchLeaderboard(false), 30000);
      return () => clearInterval(interval);
    }
  }, [tokenReady, user, activeTab]);

  const topThree = useMemo(() => leaders.slice(0, 3), [leaders]);
  const remaining = useMemo(() => leaders.slice(3), [leaders]);

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
      <DashboardNavbar />

      {/* ── HERO HEADER ── */}
      <div className="relative pt-28 pb-12 px-4 sm:px-6 overflow-hidden">
        {/* Background ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-amber-500/8 via-blue-500/5 to-transparent blur-[80px] pointer-events-none" />
        <div className="absolute top-16 left-1/4 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-16 right-1/4 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-5">
            <Trophy size={12} />
            Academic Rankings
            <Sparkles size={10} />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 leading-none">
            Community{' '}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h1>

          <p className="text-slate-500 text-sm sm:text-base font-medium max-w-md mx-auto mb-8">
            Celebrating students who contribute the most to the StudyHub ecosystem.
          </p>

          {/* Period Toggle */}
          <div className="inline-flex items-center gap-1 p-1.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-lg backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('current')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'current'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-500 hover:text-[var(--foreground)]'
              }`}
            >
              <Calendar size={13} />
              {currentMonth}
            </button>
            <button
              onClick={() => setActiveTab('previous')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'previous'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-500 hover:text-[var(--foreground)]'
              }`}
            >
              <Calendar size={13} />
              {previousMonth}
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-4 sm:px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <LeaderboardSkeleton />
          ) : leaders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl flex items-center justify-center mb-6">
                <Users size={36} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-2">No Students Yet</h3>
              <p className="text-slate-500 text-sm max-w-xs">Be the first to upload notes and climb to the top!</p>
            </div>
          ) : (
            <div className="space-y-8">

              {/* ── PODIUM ── */}
              {/* Desktop: true podium layout (2 left, 1 center/raised, 3 right) */}
              <div className="hidden md:grid md:grid-cols-3 gap-6 items-end">
                <div className="order-1">{topThree[1] && <PodiumCard user={topThree[1]} rank={2} color="silver" />}</div>
                <div className="order-2">{topThree[0] && <PodiumCard user={topThree[0]} rank={1} color="gold" isLarge />}</div>
                <div className="order-3">{topThree[2] && <PodiumCard user={topThree[2]} rank={3} color="bronze" />}</div>
              </div>

              {/* Mobile: horizontal strip with #1 in the centre, slightly bigger */}
              <div className="md:hidden">
                {/* #1 — full width, prominent */}
                {topThree[0] && (
                  <div className="mb-3">
                    <PodiumCard user={topThree[0]} rank={1} color="gold" isLarge />
                  </div>
                )}
                {/* #2 and #3 — side by side */}
                <div className="grid grid-cols-2 gap-3">
                  {topThree[1] && <PodiumCard user={topThree[1]} rank={2} color="silver" />}
                  {topThree[2] && <PodiumCard user={topThree[2]} rank={3} color="bronze" />}
                </div>
              </div>

              {/* ── RANKINGS TABLE ── */}
              {remaining.length > 0 && <RankingsTable leaders={remaining} />}

            </div>
          )}
        </div>
      </div>
    </main>
  );
}
