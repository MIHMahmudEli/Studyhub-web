'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Skeleton from '@/components/ui/Skeleton';
import { apiRequest } from '@/lib/api';
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
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 relative text-center md:text-left">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/10 blur-[80px] rounded-full -z-10 animate-pulse" />
            
            <div className="space-y-3 sm:space-y-4 w-full md:w-auto">
              <Link 
                href="/admin/dashboard" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[var(--foreground)] transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-red-500">Resources</span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-[600px] mx-auto md:mx-0">
                Explore the most popular academic resources ranked by student download volume.
              </p>
            </div>

            {/* Quick Stats Summary */}
            <div className="flex items-center gap-3.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.5rem] p-4 shadow-sm backdrop-blur-xl w-full md:w-auto justify-center md:justify-end shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0 shadow-lg">
                <TrendingUp size={22} className="animate-bounce" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider leading-none">Library Highlights</p>
                <p className="text-sm font-black uppercase text-orange-500 mt-1.5 leading-none">
                  Top {trendingResources.length} Materials
                </p>
              </div>
            </div>
          </div>

          {/* Trending Resources Table & Mobile Cards */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl overflow-hidden backdrop-blur-xl animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <Sparkles size={20} className="text-orange-500 animate-pulse" /> Popular Academic Materials
                </h3>
                <p className="text-xs font-bold text-slate-500">Ranked by overall community download engagement.</p>
              </div>
              <span className="text-xs font-black px-4 py-2.5 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20 uppercase tracking-widest text-center shrink-0">
                Total Trending: {trendingResources.length}
              </span>
            </div>

            {loading ? (
              <Skeleton type="table" count={3} />
) : error ? (
              <div className="py-16 text-center space-y-3 border-2 border-dashed border-red-500/20 rounded-[2rem] bg-red-500/5">
                <p className="text-sm font-black uppercase tracking-widest text-red-500">Error Loading Data</p>
                <p className="text-xs font-bold text-slate-500">{error}</p>
              </div>
            ) : trendingResources.length === 0 ? (
              <div className="py-16 text-center space-y-3 border-2 border-dashed border-[var(--card-border)] rounded-[2rem]">
                <div className="w-12 h-12 bg-slate-100 dark:bg-white/[0.05] text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-200 dark:border-white/[0.05] shrink-0">
                  <Layers size={24} />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">No Resources Found</p>
                <p className="text-xs font-bold text-slate-500">There are currently no approved resources in the library.</p>
              </div>
            ) : (
              <>
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
                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 sm:py-5 pl-4 whitespace-nowrap">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border shrink-0 ${
                              index === 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-lg shadow-amber-500/10' :
                              index === 1 ? 'bg-slate-400/10 text-slate-400 border-slate-400/30' :
                              index === 2 ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' :
                              'bg-[var(--card-bg)] text-slate-500 border-[var(--card-border)]'
                            }`}>
                              #{index + 1}
                            </span>
                          </td>
                          <td className="py-4 sm:py-5 max-w-[280px]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0 shadow-sm">
                                <FileText size={18} />
                              </div>
                              <div className="truncate">
                                <p className="font-black text-sm text-[var(--foreground)] truncate hover:text-orange-500 transition-colors">
                                  {r.title}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                  {r.subject ? r.subject.toUpperCase() : 'GENERAL SUBJECT'} {r.uploader?.name ? `• by ${r.uploader.name.split(' ')[0]}` : ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 sm:py-5 whitespace-nowrap text-slate-300 font-black">
                            <div>
                              <p className="text-xs">{r.course_code ? r.course_code.toUpperCase() : 'N/A'}</p>
                              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{r.term || 'General'}</p>
                            </div>
                          </td>
                          <td className="py-4 sm:py-5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl w-fit shrink-0">
                              <Download size={14} />
                              <span>{r.downloads || 0}</span>
                            </div>
                          </td>
                          <td className="py-4 sm:py-5 text-right pr-4 whitespace-nowrap">
                            <a 
                              href={r.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500 hover:text-white border border-orange-500/20 text-orange-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm shrink-0"
                            >
                              <span>Inspect</span> <ExternalLink size={14} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View (Hidden on desktop md and above) */}
                <div className="block md:hidden space-y-4">
                  {trendingResources.map((r, index) => (
                    <div key={r.id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 space-y-4 shadow-sm hover:border-orange-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black border shrink-0 ${
                          index === 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-lg shadow-amber-500/10' :
                          index === 1 ? 'bg-slate-400/10 text-slate-400 border-slate-400/30' :
                          index === 2 ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' :
                          'bg-slate-100 dark:bg-white/[0.05] text-slate-500 border-slate-200 dark:border-white/[0.05]'
                        }`}>
                          #{index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-sm text-[var(--foreground)] truncate">
                            {r.title}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {r.subject ? r.subject.toUpperCase() : 'GENERAL SUBJECT'} • {r.course_code ? r.course_code.toUpperCase() : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border)]">
                        <div className="flex items-center gap-1.5 font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl shrink-0 text-xs">
                          <Download size={14} />
                          <span>{r.downloads || 0} DLs</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[var(--card-border)]">
                        <a 
                          href={r.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500/10 hover:bg-orange-500 hover:text-white border border-orange-500/20 text-orange-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm shrink-0"
                        >
                          <span>Inspect Resource</span> <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}
