'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Toast from '@/components/ui/Toast';
import Skeleton from '@/components/ui/Skeleton';
import { apiRequest } from '@/lib/api';
import PendingModerationCard from '@/components/admin/PendingModerationCard';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminPanel from '@/components/admin/AdminPanel';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Layers, 
  FileText, 
  ExternalLink,
  Sparkles,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';

export default function PendingResourcesPage() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const { on } = useSocket();
  const router = useRouter();

  const [pendingResources, setPendingResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPending, setTotalPending] = useState(0);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const limit = 20;
  const observerRef = useRef(null);
  const readyRef = useRef(false);
  const pendingJobsRef = useRef({});
  const [jobCount, setJobCount] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  };
  
  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

  // Role verification (Admin & Moderator)
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
    } else if (user.role !== 'admin' && user.role !== 'moderator') {
      router.push('/dashboard');
    } else {
      readyRef.current = true;
    }
  }, [user, authLoading, router]);

  // Fetch pending resources
  useEffect(() => {
    if (tokenReady && user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchPendingResources(1);
    }
  }, [tokenReady, user]);

  const fetchPendingResources = async (pageNum, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }
      const res = await apiRequest(`/resources/admin/pending?page=${pageNum}&limit=${limit}`);
      const newData = Array.isArray(res) ? res : (res?.data || []);
      if (append) {
        setPendingResources(prev => [...prev, ...newData]);
      } else {
        setPendingResources(newData);
      }
      setTotalPending(res?.total || 0);
      setCurrentPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch pending resources:', err);
      setError(err.message || 'Failed to load pending resources.');
      if (!append) setPendingResources([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleResourceStatus = async (id, newStatus) => {
    setPendingResources(prev => prev.filter(r => r.id !== id));
    setTotalPending(prev => Math.max(0, prev - 1));
    try {
      const res = await apiRequest(`/resources/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res?.jobId) {
        pendingJobsRef.current[res.jobId] = { itemId: id, type: 'resource', newStatus };
        setJobCount(c => c + 1);
      }
    } catch (err) {
      console.error(`Failed to queue resource status update:`, err);
      showToast(err.message || `Failed to update resource status.`, 'error');
    }
  };

  const hasMore = pendingResources.length < totalPending;

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchPendingResources(currentPage + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, loadingMore, currentPage]);

  // Listen for moderation results via WebSocket
  useEffect(() => {
    if (!on) return;
    const unsubResolved = on('moderation:resolved', (data) => {
      if (data.type === 'resource') delete pendingJobsRef.current[data.itemId];
    });
    const unsubFailed = on('moderation:failed', (data) => {
      if (data.type === 'resource') {
        showToast(`Failed to ${data.newStatus} ${data.type} #${data.itemId}. ${data.error || ''}`, 'error');
        delete pendingJobsRef.current[data.itemId];
      }
    });
    return () => { unsubResolved(); unsubFailed(); };
  }, [on]);

  if (!readyRef.current && (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator'))) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">
          
          {/* Reusable Admin Header */}
          <AdminHeader
            title="Pending"
            titleHighlight="Resources"
            titleHighlightGradient="from-amber-500 via-orange-500 to-yellow-500"
            description="Review and moderate uploaded academic resources before publishing them to the course library."
            glowColor="bg-amber-500/10"
            statsIcon={Layers}
            statsTitle="Moderation Queue"
            statsValue={`${totalPending} Awaiting Approval`}
            statsColorClass="text-amber-500 bg-amber-500/10 border-amber-500/20"
          />

          {/* Reusable Admin Panel Container */}
          <AdminPanel
            panelIcon={Sparkles}
            panelIconClass="text-amber-500 animate-pulse"
            panelTitle="Resources Moderation Queue"
            panelSubtitle="Review uploaded academic materials before publishing them to the course library."
            badgeText={`Queue: ${pendingResources.length}`}
            badgeColorClass="bg-amber-500/10 text-amber-500 border-amber-500/20"
            loading={loading}
            error={error}
            isEmpty={pendingResources.length === 0}
            emptyIcon={CheckCircle2}
            emptyTitle="All Caught Up!"
            emptyDescription="There are no pending resources awaiting moderation at this time."
          >
            {/* Desktop Table View (Hidden on mobile below md) */}
            <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/[0.1]">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="pb-4 pl-4 whitespace-nowrap">Resource Title & Subject</th>
                    <th className="pb-4 whitespace-nowrap">Uploader</th>
                    <th className="pb-4 whitespace-nowrap">File Type</th>
                    <th className="pb-4 text-right pr-4 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)] text-xs font-bold">
                  {pendingResources.map((res) => (
                    <tr key={res.id} className="hover:bg-white/[0.02] transition-colors" style={{ contentVisibility: 'auto' }}>
                      <td className="py-4 sm:py-5 pl-4 max-w-[250px] sm:max-w-[300px]">
                        <p className="font-black text-sm text-[var(--foreground)] truncate">{res.title}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 truncate">{res.subject || res.course_code || 'RESOURCE'} • {res.term?.toUpperCase() || 'MID'}</p>
                      </td>
                      <td className="py-4 sm:py-5 whitespace-nowrap">
                        <button onClick={() => router.push(`/profile/${res.uploader_id}`)} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity text-left">
                          {res.uploader?.profile_pic ? (
                            <img src={res.uploader.profile_pic} alt="" width={24} height={24} className="w-6 h-6 rounded-full object-cover border border-[var(--card-border)] shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                              {res.uploader?.name?.[0] || 'U'}
                            </div>
                          )}
                          <span className="text-slate-300 truncate max-w-[120px]">{res.uploader?.name || `User #${res.uploader_id}`}</span>
                        </button>
                      </td>
                      <td className="py-4 sm:py-5 whitespace-nowrap">
                        <a 
                          href={res.file_path} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 transition-colors uppercase text-[10px] tracking-widest font-black shrink-0"
                        >
                          {res.file_type || 'PDF'} <ExternalLink size={12} />
                        </a>
                      </td>
                      <td className="py-4 sm:py-5 text-right pr-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 sm:gap-2">
                          <button 
                            onClick={() => handleResourceStatus(res.id, 'approved')}
                            className="px-3.5 py-2 sm:px-4 sm:py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl border border-emerald-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button 
                            onClick={() => handleResourceStatus(res.id, 'rejected')}
                            className="px-3.5 py-2 sm:px-4 sm:py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Hidden on desktop md and above) */}
            <div className="block md:hidden space-y-4">
              {pendingResources.map((res) => (
                <PendingModerationCard
                  key={res.id}
                  item={res}
                  type="resource"
                  onApprove={handleResourceStatus}
                  onReject={handleResourceStatus}
                />
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center pt-8">
                <div className="flex items-center gap-3 px-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
                  <Loader2 size={16} className="animate-spin text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Loading more...</span>
                </div>
              </div>
            )}

            {/* Infinite Scroll Sentinel */}
            <div ref={observerRef} className="w-full h-4" />
          </AdminPanel>

        </div>
      </div>

      {/* ─── TOAST NOTIFICATION CONTAINER ─────────────────────────────────────── */}
      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
