'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Toast from '@/components/ui/Toast';
import Skeleton from '@/components/ui/Skeleton';
import { apiRequest } from '@/lib/api';
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
  X
} from 'lucide-react';

export default function PendingNotesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pendingNotes, setPendingNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });

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
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchPendingNotes();
    }
  }, [user]);

  const fetchPendingNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest('/notes/pending');
      setPendingNotes(res || []);
    } catch (err) {
      console.error('Failed to fetch pending notes:', err);
      setError(err.message || 'Failed to load pending notes.');
      setPendingNotes([]);
    } finally {
      setLoading(false);
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

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">
          
          {/* Navigation & Header */}
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 relative text-center md:text-left">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full -z-10 animate-pulse" />
            
            <div className="space-y-3 sm:space-y-4 w-full md:w-auto">
              <Link 
                href="/admin/dashboard" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[var(--foreground)] transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                Pending <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500">Notes</span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-[600px] mx-auto md:mx-0">
                Review and moderate uploaded student notes before publishing them to the public repository.
              </p>
            </div>

            {/* Quick Stats Summary */}
            <div className="flex items-center gap-3.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.5rem] p-4 shadow-sm backdrop-blur-xl w-full md:w-auto justify-center md:justify-end shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0 shadow-lg">
                <Clock size={22} className="animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider leading-none">Moderation Queue</p>
                <p className="text-sm font-black uppercase text-purple-500 mt-1.5 leading-none">
                  {pendingNotes.length} Awaiting Approval
                </p>
              </div>
            </div>
          </div>

          {/* Pending Notes Table & Mobile Cards */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl overflow-hidden backdrop-blur-xl animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-500 animate-pulse" /> Notes Moderation Queue
                </h3>
                <p className="text-xs font-bold text-slate-500">Review content before it becomes public in the repository.</p>
              </div>
              <span className="text-xs font-black px-4 py-2.5 bg-purple-500/10 text-purple-500 rounded-2xl border border-purple-500/20 uppercase tracking-widest text-center shrink-0">
                Queue: {pendingNotes.length}
              </span>
            </div>

            {loading ? (
              <Skeleton type="table" count={3} />
            ) : error ? (
              <div className="py-16 text-center space-y-3 border-2 border-dashed border-red-500/20 rounded-[2rem] bg-red-500/5">
                <p className="text-sm font-black uppercase tracking-widest text-red-500">Error Loading Data</p>
                <p className="text-xs font-bold text-slate-500">{error}</p>
              </div>
            ) : pendingNotes.length === 0 ? (
              <div className="py-16 text-center space-y-3 border-2 border-dashed border-[var(--card-border)] rounded-[2rem]">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">All Caught Up!</p>
                <p className="text-xs font-bold text-slate-500">There are no pending notes awaiting moderation at this time.</p>
              </div>
            ) : (
              <>
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
                            <div className="flex items-center gap-2">
                              {note.uploader?.profile_pic ? (
                                <img src={note.uploader.profile_pic} alt="" className="w-6 h-6 rounded-full object-cover border border-[var(--card-border)] shrink-0" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                                  {note.uploader?.name?.[0] || 'U'}
                                </div>
                              )}
                              <span className="text-slate-300 truncate max-w-[120px]">{note.uploader?.name || `User #${note.uploader_id}`}</span>
                            </div>
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
                    <div key={note.id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 space-y-4 shadow-sm hover:border-purple-500/30 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-sm text-[var(--foreground)] truncate">{note.title}</h4>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 truncate">{note.course_code} • {note.dept}</p>
                        </div>
                        <a 
                          href={note.file_path} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors uppercase text-[9px] tracking-widest font-black shrink-0"
                        >
                          {note.file_type || 'PDF'} <ExternalLink size={10} />
                        </a>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--card-border)]">
                        {note.uploader?.profile_pic ? (
                          <img src={note.uploader.profile_pic} alt="" className="w-6 h-6 rounded-full object-cover border border-[var(--card-border)] shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                            {note.uploader?.name?.[0] || 'U'}
                          </div>
                        )}
                        <span className="text-xs text-slate-300 truncate">{note.uploader?.name || `User #${note.uploader_id}`}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--card-border)]">
                        <button 
                          onClick={() => handleNoteStatus(note.id, 'approved')}
                          className="flex-1 py-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl border border-emerald-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleNoteStatus(note.id, 'rejected')}
                          className="flex-1 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>

        </div>
      </div>

      {/* ─── TOAST NOTIFICATION CONTAINER ─────────────────────────────────────── */}
      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
