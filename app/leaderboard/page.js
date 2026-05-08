'use client';

import { useState, useEffect } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import PodiumCard from '@/components/leaderboard/PodiumCard';
import RankingsTable from '@/components/leaderboard/RankingsTable';
import { 
  Trophy
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await apiRequest('/users/leaderboard');
        setLeaders(response.data || response);
      } catch (err) {
        // Mock data for development
        const mockLeaders = [
          { id: 1, name: 'Sarah Jenkins', points: 2850, uploads: 42, role: 'student' },
          { id: 2, name: 'Marcus Chen', points: 2420, uploads: 38, role: 'student' },
          { id: 3, name: 'Elena Rodriguez', points: 2100, uploads: 31, role: 'student' },
          { id: 4, name: 'David Kim', points: 1850, uploads: 25, role: 'student' },
          { id: 5, name: 'Amara Okafor', points: 1620, uploads: 22, role: 'student' },
          { id: 6, name: 'Julian Vance', points: 1400, uploads: 19, role: 'student' },
          { id: 7, name: 'Sofia Rossi', points: 1250, uploads: 15, role: 'student' },
          { id: 8, name: 'Liam O\'Brien', points: 1100, uploads: 12, role: 'student' },
        ];
        setLeaders(mockLeaders);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchLeaderboard();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const topThree = leaders.slice(0, 3);
  const remaining = leaders.slice(3);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
      <DashboardNavbar />

      <div className="pt-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="text-center mb-16 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px] bg-blue-500/10 blur-[100px] rounded-full -z-10" />
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Trophy size={14} /> Academic Rankings
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-4">Community Leaderboard</h1>
            <p className="text-slate-500 font-medium max-w-[600px] mx-auto text-lg">
              Celebrating the students who contribute the most to the StudyHub ecosystem.
            </p>
          </div>

          {/* Podium Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end">
            <PodiumCard user={topThree[1]} rank={2} color="silver" />
            <PodiumCard user={topThree[0]} rank={1} color="gold" isLarge />
            <PodiumCard user={topThree[2]} rank={3} color="bronze" />
          </div>

          {/* Rankings Table */}
          <RankingsTable leaders={remaining} />
        </div>
      </div>
    </main>
  );
}
