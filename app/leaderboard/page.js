'use client';

import { useState, useEffect } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  Trophy, 
  Medal, 
  TrendingUp, 
  Star, 
  Crown,
  User,
  Coins,
  ArrowUpRight
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
        // Assuming endpoint: /users/leaderboard
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
            {/* Rank 2 */}
            <div className="order-2 md:order-1">
              <PodiumCard user={topThree[1]} rank={2} color="silver" />
            </div>
            {/* Rank 1 */}
            <div className="order-1 md:order-2">
              <PodiumCard user={topThree[0]} rank={1} color="gold" isLarge />
            </div>
            {/* Rank 3 */}
            <div className="order-3 md:order-3">
              <PodiumCard user={topThree[2]} rank={3} color="bronze" />
            </div>
          </div>

          {/* Rankings Table */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="p-8 border-b border-[var(--card-border)] flex items-center justify-between bg-white/[0.02]">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
                <TrendingUp className="text-blue-500" /> Top Scholars
              </h2>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Updated in real-time
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.01]">
                    <th className="px-8 py-5">Rank</th>
                    <th className="px-8 py-5">Student</th>
                    <th className="px-8 py-5">Resources</th>
                    <th className="px-8 py-5 text-right">Academic Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {remaining.map((player, index) => (
                    <tr key={player.id} className="group hover:bg-blue-500/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-500 group-hover:text-blue-500 transition-colors">#{index + 4}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-[var(--card-border)] flex items-center justify-center text-blue-500 font-black text-xs">
                            {player.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold group-hover:text-blue-500 transition-colors">{player.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Student</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Star size={14} />
                          <span className="text-xs font-bold">{player.uploads} Shared</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="inline-flex items-center gap-2 text-amber-500 font-black text-sm">
                          <Coins size={16} />
                          {player.points.toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function PodiumCard({ user, rank, color, isLarge = false }) {
  if (!user) return null;

  const colors = {
    gold: 'from-amber-400 via-yellow-500 to-amber-600',
    silver: 'from-slate-300 via-slate-400 to-slate-500',
    bronze: 'from-orange-400 via-orange-500 to-orange-600'
  };

  const glows = {
    gold: 'shadow-amber-500/20',
    silver: 'shadow-slate-500/20',
    bronze: 'shadow-orange-500/20'
  };

  return (
    <div className={`relative flex flex-col items-center group ${isLarge ? 'mb-4 scale-110 z-10' : ''}`}>
      {/* Rank Indicator */}
      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-xl ${glows[color]} z-20 group-hover:scale-110 transition-transform duration-500`}>
        {rank === 1 ? <Crown size={24} /> : <span className="font-black text-lg">{rank}</span>}
      </div>

      <div className={`w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 pt-10 text-center backdrop-blur-xl group-hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden ${isLarge ? 'shadow-2xl' : 'shadow-xl'}`}>
        {/* Decorative Glow */}
        <div className={`absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br ${colors[color]} opacity-5 blur-[40px] rounded-full`} />
        
        <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 bg-gradient-to-br ${colors[color]} p-[2px] shadow-lg group-hover:rotate-3 transition-transform duration-500`}>
          <div className="w-full h-full rounded-[inherit] bg-[var(--background)] flex items-center justify-center text-2xl font-black">
            {user.name.charAt(0)}
          </div>
        </div>

        <h3 className="text-xl font-black mb-1 line-clamp-1">{user.name}</h3>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Top Contributor</p>

        <div className="flex items-center justify-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-2xl py-3 px-4">
          <div className="flex items-center gap-2 text-amber-500">
            <Coins size={18} />
            <span className="text-lg font-black tracking-tighter">{user.points.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
           <span>{user.uploads} Notes</span>
           <div className="w-1 h-1 bg-slate-700 rounded-full" />
           <span className="text-blue-500">Rank {rank}</span>
        </div>
      </div>
    </div>
  );
}
