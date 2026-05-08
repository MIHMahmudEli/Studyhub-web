'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import PodiumCard from '@/components/leaderboard/PodiumCard';
import RankingsTable from '@/components/leaderboard/RankingsTable';
import { 
  Trophy,
  Calendar
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'previous'
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Assuming endpoint takes a month filter: /users/leaderboard?period=current
        const response = await apiRequest(`/users/leaderboard?period=${activeTab}`);
        setLeaders(response.data || response);
      } catch (err) {
        // Mock data for different months
        const mockCurrent = [
          { id: 1, name: 'Sarah Jenkins', points: 2850, uploads: 42 },
          { id: 2, name: 'Marcus Chen', points: 2420, uploads: 38 },
          { id: 3, name: 'Elena Rodriguez', points: 2100, uploads: 31 },
          { id: 4, name: 'David Kim', points: 1850, uploads: 25 },
          { id: 5, name: 'Amara Okafor', points: 1620, uploads: 22 },
          { id: 6, name: 'Julian Vance', points: 1400, uploads: 19 },
          { id: 7, name: 'Sofia Rossi', points: 1250, uploads: 15 },
          { id: 8, name: 'Liam O\'Brien', points: 1100, uploads: 12 },
        ];
        
        const mockPrevious = [
          { id: 10, name: 'Alex Rivera', points: 3100, uploads: 48 },
          { id: 1, name: 'Sarah Jenkins', points: 2600, uploads: 39 },
          { id: 2, name: 'Marcus Chen', points: 2150, uploads: 35 },
          { id: 11, name: 'Zoe Thorne', points: 1900, uploads: 28 },
          { id: 3, name: 'Elena Rodriguez', points: 1750, uploads: 24 },
          { id: 12, name: 'Omar Sy', points: 1500, uploads: 21 },
          { id: 13, name: 'Yuna Sato', points: 1300, uploads: 18 },
          { id: 4, name: David Kim, points: 1200, uploads: 15 },
        ];
        
        setLeaders(activeTab === 'current' ? mockCurrent : mockPrevious);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchLeaderboard();
  }, [user, activeTab]);

  const topThree = useMemo(() => leaders.slice(0, 3), [leaders]);
  const remaining = useMemo(() => leaders.slice(3), [leaders]);

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
      <DashboardNavbar />

      <div className="pt-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px] bg-blue-500/10 blur-[100px] rounded-full -z-10" />
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Trophy size={14} /> Academic Rankings
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-4">Community Leaderboard</h1>
            <p className="text-slate-500 font-medium max-w-[600px] mx-auto text-lg mb-10">
              Celebrating the students who contribute the most to the StudyHub ecosystem.
            </p>

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
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-40">
              <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="animate-in fade-in duration-700">
              {/* Podium Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end">
                <PodiumCard user={topThree[1]} rank={2} color="silver" />
                <PodiumCard user={topThree[0]} rank={1} color="gold" isLarge />
                <PodiumCard user={topThree[2]} rank={3} color="bronze" />
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
