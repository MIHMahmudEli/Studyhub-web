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
  TrendingUp, 
  Download, 
  Layers, 
  FileText, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function TrendingResourcesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [trendingResources, setTrendingResources] = useState([]);
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

  // Fetch trending resources
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchTrendingResources();
    }
  }, [user]);

  const fetchTrendingResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest('/resources/trending');
      setTrendingResources(res || []);
    } catch (err) {
      console.error('Failed to fetch trending resources:', err);
      setError(err.message || 'Failed to load trending resources.');
      setTrendingResources([]);
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
            titleHighlight="Resources"
            titleHighlightGradient="from-orange-500 via-amber-500 to-red-500"
            description="Explore the most popular academic resources ranked by student download volume."
            glowColor="bg-orange-500/10"
            statsIcon={TrendingUp}
            statsIconClass="animate-bounce"
            statsTitle="Library Highlights"
            statsValue={`Top ${trendingResources.length} Materials`}
            statsColorClass="text-orange-500 bg-orange-500/10 border-orange-500/20"
          />

          {/* Reusable Admin Panel Container */}
          <AdminPanel
            panelIcon={Sparkles}
            panelIconClass="text-orange-500 animate-pulse"
            panelTitle="Popular Academic Materials"
            panelSubtitle="Ranked by overall community download engagement."
            badgeText={`Total Trending: ${trendingResources.length}`}
            badgeColorClass="bg-orange-500/10 text-orange-500 border-orange-500/20"
            loading={loading}
            error={error}
            isEmpty={trendingResources.length === 0}
            emptyIcon={Layers}
            emptyTitle="No Resources Found"
            emptyDescription="There are currently no approved resources in the library."
          >
            {/* Desktop Table View (Hidden on mobile below md) */}
            <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/[0.1]">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="pb-4 pl-4 whitespace-nowrap w-16">Rank</th>
                    <th className="pb-4 whitespace-nowrap">Resource Title & Subject</th>
                    <th className="pb-4 whitespace-nowrap">Course & Term</th>
                    <th className="pb-4 whitespace-nowrap">Downloads</th>
                    <th className="pb-4 text-right pr-4 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)] text-xs font-bold">
                  {trendingResources.map((r, index) => (
                    <TrendingItemRow
                      key={r.id}
                      item={r}
                      index={index}
                      type="resource"
                      accentColor="orange"
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Hidden on desktop md and above) */}
            <div className="block md:hidden space-y-4">
              {trendingResources.map((r, index) => (
                <TrendingItemCard
                  key={r.id}
                  item={r}
                  index={index}
                  type="resource"
                  accentColor="orange"
                />
              ))}
            </div>
          </AdminPanel>

        </div>
      </div>
    </main>
  );
}
