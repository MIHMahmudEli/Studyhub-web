'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Skeleton from '@/components/ui/Skeleton';
import { apiRequest } from '@/lib/api';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminPanel from '@/components/admin/AdminPanel';
import TrendingItemRow from '@/components/admin/TrendingItemRow';
import TrendingItemCard from '@/components/admin/TrendingItemCard';
import { 
  ArrowLeft, 
  Flame, 
  Download, 
  Layers, 
  FileText, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function TrendingNotesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [trendingNotes, setTrendingNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Role verification (Admin and Moderator can access)
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (user.role !== 'admin' && user.role !== 'moderator') {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  // Fetch trending notes
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchTrendingNotes();
    }
  }, [user]);

  const fetchTrendingNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest('/notes/trending');
      setTrendingNotes(res || []);
    } catch (err) {
      console.error('Failed to fetch trending notes:', err);
      setError(err.message || 'Failed to load trending notes.');
      setTrendingNotes([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">
          
          {/* Navigation & Header */}
          <AdminHeader
            title="Trending"
            titleHighlight="Notes"
            titleHighlightGradient="from-rose-500 via-pink-500 to-purple-500"
            description="Explore the most popular student notes ranked by community download volume."
            glowColor="bg-rose-500/10"
            statsIcon={Flame}
            statsIconClass="animate-pulse"
            statsTitle="Repository Highlights"
            statsValue={`Top ${trendingNotes.length} Materials`}
            statsColorClass="text-rose-500 bg-rose-500/10 border-rose-500/20"
          />

          {/* Reusable Admin Panel Container */}
          <AdminPanel
            panelIcon={Sparkles}
            panelIconClass="text-rose-500 animate-pulse"
            panelTitle="Popular Student Notes"
            panelSubtitle="Ranked by overall community download engagement."
            badgeText={`Total Trending: ${trendingNotes.length}`}
            badgeColorClass="bg-rose-500/10 text-rose-500 border-rose-500/20"
            loading={loading}
            error={error}
            isEmpty={trendingNotes.length === 0}
            emptyIcon={Layers}
            emptyTitle="No Notes Found"
            emptyDescription="There are currently no approved notes in the repository."
          >
            {/* Desktop Table View (Hidden on mobile below md) */}
            <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/[0.1]">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="pb-4 pl-4 whitespace-nowrap w-16">Rank</th>
                    <th className="pb-4 whitespace-nowrap">Note Title & Course</th>
                    <th className="pb-4 whitespace-nowrap">Department</th>
                    <th className="pb-4 whitespace-nowrap">Downloads</th>
                    <th className="pb-4 text-right pr-4 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)] text-xs font-bold">
                  {trendingNotes.map((n, index) => (
                    <TrendingItemRow
                      key={n.id}
                      item={n}
                      index={index}
                      type="note"
                      accentColor="rose"
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Hidden on desktop md and above) */}
            <div className="block md:hidden space-y-4">
              {trendingNotes.map((n, index) => (
                <TrendingItemCard
                  key={n.id}
                  item={n}
                  index={index}
                  type="note"
                  accentColor="rose"
                />
              ))}
            </div>
          </AdminPanel>

        </div>
      </div>
    </main>
  );
}
