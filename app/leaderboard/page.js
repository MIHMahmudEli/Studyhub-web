'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import PodiumCard from '@/components/leaderboard/PodiumCard';
import RankingsTable from '@/components/leaderboard/RankingsTable';
import { LeaderboardSkeleton } from '@/components/ui/Skeleton';
import PageHeader from '@/components/ui/PageHeader';
import { 
  Trophy,
  Calendar,
  Users
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'previous'
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long' });

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
        console.error('Failed to fetch leaderboard:', err);
        setLeaders([]);
      } finally {
        if (showSpinner) setLoading(false);
      }
    };

    if (tokenReady && user) {
      fetchLeaderboard(true);
      
      // Auto-refresh every 30 seconds to keep points live
      const interval = setInterval(() => fetchLeaderboard(false), 30000);
      return () => clearInterval(interval);
    }
  }, [tokenReady, user, activeTab]);

  const topThree = useMemo(() => leaders.slice(0, 3), [leaders]);
  const remaining = useMemo(() => leaders.slice(3), [leaders]);

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
      <DashboardNavbar />

      <div className="pt-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <PageHeader
            isCentered={true}
            badgeIcon={Trophy}
            badgeText="Academic Rankings"
            badgeColorClass="text-blue-500 bg-blue-500/10 border-blue-500/20"
            glowColor="bg-blue-500/10"
            title="Community Leaderboard"
            description="Celebrating the students who contribute the most to the StudyHub ecosystem."
          >
            {/* Period Filter Tabs */}
            <div className="inline-flex items-center p-1.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-xl shadow-lg">
              <button
                onClick={() => setActiveTab('current')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                  activeTab === 'current' 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-500 hover:text-[var(--foreground)]'
                }`}
              >
                <Calendar size={14} /> {currentMonth}
              </button>
              <button
                onClick={() => setActiveTab('previous')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                  activeTab === 'previous' 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-500 hover:text-[var(--foreground)]'
                }`}
              >
                <Calendar size={14} /> {previousMonth}
              </button>
            </div>
          </PageHeader>

          {loading ? (
            <LeaderboardSkeleton />
          ) : leaders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-24 h-24 bg-slate-100 dark:bg-white/[0.03] rounded-3xl flex items-center justify-center mb-8 border border-slate-200 dark:border-white/[0.05]">
                <Users size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-2">No Students Found</h3>
              <p className="text-slate-500 text-sm max-w-xs font-medium">
                It looks like no students joined during this period yet. Be the first one to lead the way!
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-700">
              {/* Podium Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end">
                {/* Gold (Rank 1) - First on mobile, Middle on desktop */}
                <div className="order-1 md:order-2">
                  <PodiumCard user={topThree[0]} rank={1} color="gold" isLarge />
                </div>
                
                {/* Silver (Rank 2) - Second on mobile, Left on desktop */}
                <div className="order-2 md:order-1">
                  <PodiumCard user={topThree[1]} rank={2} color="silver" />
                </div>
                
                {/* Bronze (Rank 3) - Third on both */}
                <div className="order-3 md:order-3">
                  <PodiumCard user={topThree[2]} rank={3} color="bronze" />
                </div>
              </div>

              {/* Rankings Table */}
              <RankingsTable leaders={remaining} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
