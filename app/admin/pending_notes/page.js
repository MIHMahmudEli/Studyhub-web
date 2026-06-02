'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
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

export default function PendingNotesPage() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();

  const [pendingNotes, setPendingNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPending, setTotalPending] = useState(0);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const limit = 12;
  const observerRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  };
  
  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

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

  // Fetch pending notes
  useEffect(() => {
    if (tokenReady && user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchPendingNotes(1);
    }
  }, [tokenReady, user]);

  const fetchPendingNotes = async (pageNum, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }
      const res = await apiRequest(`/notes/pending?page=${pageNum}&limit=${limit}`);
      const newData = Array.isArray(res) ? res : (res?.data || []);
      if (append) {
        setPendingNotes(prev => [...prev, ...newData]);
      } else {
        setPendingNotes(newData);
      }
      setTotalPending(res?.total || 0);
      setCurrentPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch pending notes:', err);
      setError(err.message || 'Failed to load pending notes.');
      if (!append) setPendingNotes([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleNoteStatus = async (id, newStatus) => {
    try {
      await apiRequest(`/notes/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      showToast(`Note #${id} has been ${newStatus} successfully.`, 'success');
      setPendingNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(`Failed to update note status:`, err);
      showToast(err.message || `Failed to update note status.`, 'error');
    }
  };

  const hasMore = pendingNotes.length < totalPending;

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchPendingNotes(currentPage + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, loadingMore, currentPage]);

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">
          
          {/* Reusable Admin Header */}
          <AdminHeader
            title="Pending"
            titleHighlight="Notes"
            titleHighlightGradient="from-purple-500 via-indigo-500 to-blue-500"
            description="Review and moderate uploaded student notes before publishing them to the public repository."
            glowColor="bg-purple-500/10"
            statsIcon={Clock}
            statsTitle="Moderation Queue"
            statsValue={`${pendingNotes.length} Awaiting Approval`}
            statsColorClass="text-purple-500 bg-purple-500/10 border-purple-500/20"
          />

          {/* Reusable Admin Panel Container */}
          <AdminPanel
            panelIcon={Sparkles}
            panelIconClass="text-purple-500 animate-pulse"
            panelTitle="Notes Moderation Queue"
            panelSubtitle="Review content before it becomes public in the repository."
            badgeText={`Queue: ${pendingNotes.length}`}
            badgeColorClass="bg-purple-500/10 text-purple-500 border-purple-500/20"
            loading={loading}
            error={error}
            isEmpty={pendingNotes.length === 0}
            emptyIcon={CheckCircle2}
            emptyTitle="All Caught Up!"
            emptyDescription="There are no pending notes awaiting moderation at this time."
          >
            {/* Desktop Table View (Hidden on mobile below md) */}
            <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/[0.1]">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="pb-4 pl-4 whitespace-nowrap">Note Title & Course</th>
                    <th className="pb-4 whitespace-nowrap">Uploader</th>
                    <th className="pb-4 whitespace-nowrap">File Type</th>
                    <th className="pb-4 text-right pr-4 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)] text-xs font-bold">
                  {pendingNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 sm:py-5 pl-4 max-w-[250px] sm:max-w-[300px]">
                        <p className="font-black text-sm text-[var(--foreground)] truncate">{note.title}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 truncate">{note.course_code} • {note.dept}</p>
                      </td>
                      <td className="py-4 sm:py-5 whitespace-nowrap">
                        <button onClick={() => router.push(`/profile/${note.uploader_id}`)} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity text-left">
                          {note.uploader?.profile_pic ? (
                            <Image src={note.uploader.profile_pic} alt="" width={24} height={24} className="w-6 h-6 rounded-full object-cover border border-[var(--card-border)] shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                              {note.uploader?.name?.[0] || 'U'}
                            </div>
                          )}
                          <span className="text-slate-300 truncate max-w-[120px]">{note.uploader?.name || `User #${note.uploader_id}`}</span>
                        </button>
                      </td>
                      <td className="py-4 sm:py-5 whitespace-nowrap">
                        <a 
                          href={note.file_path} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors uppercase text-[10px] tracking-widest font-black shrink-0"
                        >
                          {note.file_type || 'PDF'} <ExternalLink size={12} />
                        </a>
                      </td>
                      <td className="py-4 sm:py-5 text-right pr-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 sm:gap-2">
                          <button 
                            onClick={() => handleNoteStatus(note.id, 'approved')}
                            className="px-3.5 py-2 sm:px-4 sm:py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl border border-emerald-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button 
                            onClick={() => handleNoteStatus(note.id, 'rejected')}
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
              {pendingNotes.map((note) => (
                <PendingModerationCard
                  key={note.id}
                  item={note}
                  type="note"
                  onApprove={handleNoteStatus}
                  onReject={handleNoteStatus}
                />
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center pt-8">
                <div className="flex items-center gap-3 px-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
                  <Loader2 size={16} className="animate-spin text-purple-500" />
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
