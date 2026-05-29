'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Toast from '@/components/ui/Toast';
import { apiRequest } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminPanel from '@/components/admin/AdminPanel';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
  Eye,
  Trash2,
  UploadCloud,
  FileText,
  Loader2
} from 'lucide-react';

export default function UploadedNotesPage() {
  const { user, loading: authLoading, checkUser } = useAuth();
  const router = useRouter();

  const [myNotes, setMyNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const sentinelRef = useRef(null);
  const LIMIT = 12;

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const fetchNotes = useCallback(async (pageNum, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const res = await apiRequest(`/notes/my-notes?page=${pageNum}&limit=${LIMIT}`);

      if (res && res.data) {
        if (reset) {
          setMyNotes(res.data);
        } else {
          setMyNotes(prev => [...prev, ...res.data]);
        }
        setTotal(res.total || 0);
        setPage(pageNum);
        setHasMore(pageNum * LIMIT < (res.total || 0));
      }
    } catch (err) {
      console.error('Failed to fetch my notes:', err);
      setError(err.message || 'Failed to load your uploaded notes.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotes(1, true);
    }
  }, [user, fetchNotes]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchNotes(page + 1, false);
        }
      },
      { threshold: 0.1 }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, loadingMore, loading, page, fetchNotes]);

  const handleDeleteNote = async (id) => {
    if (!confirm('Are you absolutely sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);

      const noteToDelete = myNotes.find(n => n.id === id);
      if (noteToDelete && noteToDelete.file_path) {
        try {
          const fileName = noteToDelete.file_path.split('/notes/').pop();
          if (fileName) {
            await supabase.storage
              .from('notes')
              .remove([fileName]);
          }
        } catch (err) {
          console.warn('Failed to delete file from Supabase storage:', err);
        }
      }

      await apiRequest(`/notes/${id}`, { method: 'DELETE' });

      setMyNotes(prev => prev.filter(n => n.id !== id));
      setTotal(prev => prev - 1);
      showToast('Note deleted successfully.', 'success');

      await checkUser();
    } catch (err) {
      console.error('Failed to delete note:', err);
      showToast(err.message || 'Failed to delete note. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || !user) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">

          <AdminHeader
            backHref="/dashboard"
            backText="Back to Dashboard"
            title="My Uploaded"
            titleHighlight="Notes"
            titleHighlightGradient="from-purple-500 via-indigo-500 to-pink-500"
            description="Track, manage, and inspect the verification status of your contributed academic notes and materials."
            glowColor="bg-purple-500/10"
            statsIcon={UploadCloud}
            statsTitle="Contributed Notes"
            statsValue={`${total} Submissions`}
            statsColorClass="text-purple-500 bg-purple-500/10 border-purple-500/20"
          />

          <AdminPanel
            panelIcon={Sparkles}
            panelIconClass="text-purple-500 animate-pulse"
            panelTitle="Submissions & Status"
            panelSubtitle="Check verification states or manage uploaded content."
            badgeText={`Total: ${total}`}
            badgeColorClass="bg-purple-500/10 text-purple-500 border-purple-500/20"
            loading={loading}
            error={error}
            isEmpty={!loading && myNotes.length === 0}
            emptyIcon={FileText}
            emptyTitle="No Uploads Yet"
            emptyDescription="You haven't contributed any notes yet. Upload notes to earn academic points!"
            panelActions={
              <Link
                href="/upload"
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-xl shadow-purple-500/20 cursor-pointer text-center"
              >
                <UploadCloud size={14} /> Upload New Note
              </Link>
            }
          >
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/[0.1]">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="pb-4 pl-4 whitespace-nowrap">Note Title & Course</th>
                    <th className="pb-4 text-center whitespace-nowrap">Status</th>
                    <th className="pb-4 text-center whitespace-nowrap">Downloads</th>
                    <th className="pb-4 text-center whitespace-nowrap">File Preview</th>
                    <th className="pb-4 text-right pr-4 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)] text-xs font-bold">
                  {myNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 sm:py-5 pl-4 max-w-[250px] sm:max-w-[300px]">
                        <p className="font-black text-sm text-[var(--foreground)] truncate">{note.title}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 truncate">
                          {note.code} • {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4 sm:py-5 text-center whitespace-nowrap">
                        {note.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500">
                            <CheckCircle2 size={11} /> Approved
                          </span>
                        )}
                        {note.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500">
                            <Clock size={11} /> Pending
                          </span>
                        )}
                        {note.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500">
                            <XCircle size={11} /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-4 sm:py-5 text-center whitespace-nowrap text-slate-700 dark:text-slate-300 font-black">
                        {note.downloads}
                      </td>
                      <td className="py-4 sm:py-5 text-center whitespace-nowrap">
                        {note.file_path ? (
                          <a
                            href={note.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-500 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-colors uppercase text-[10px] tracking-widest font-black shrink-0"
                          >
                            {note.file_type || 'PDF'} <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="py-4 sm:py-5 text-right pr-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 sm:gap-2">
                          {note.status === 'approved' && (
                            <Link
                              href={`/notes/${note.id}`}
                              className="px-3.5 py-2 sm:px-4 sm:py-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white rounded-xl border border-purple-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Eye size={14} /> View
                            </Link>
                          )}
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={deletingId === note.id}
                            className="px-3.5 py-2 sm:px-4 sm:py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            {deletingId === note.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                              <><Trash2 size={14} /> Delete</>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {myNotes.map((note) => (
                <div key={note.id} className="p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] flex flex-col gap-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-[13px]">{note.title}</p>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-500/5 px-2 py-0.5 rounded border border-[var(--card-border)] mt-1 inline-block">
                          {note.code}
                        </span>
                      </div>
                    </div>
                    <div>
                      {note.status === 'approved' && (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500">
                          Approved
                        </span>
                      )}
                      {note.status === 'pending' && (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500">
                          Pending
                        </span>
                      )}
                      {note.status === 'rejected' && (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-500/[0.02] dark:bg-white/[0.01] border border-[var(--card-border)] rounded-2xl p-3 text-center">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Created</p>
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="border-l border-[var(--card-border)]">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Downloads</p>
                      <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">{note.downloads}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {note.status === 'approved' && (
                      <Link
                        href={`/notes/${note.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-purple-500/20 transition-all font-bold text-center"
                      >
                        <Eye size={12} /> View Note
                      </Link>
                    )}
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={deletingId === note.id}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all font-bold"
                    >
                      {deletingId === note.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <><Trash2 size={12} /> Delete Note</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center pt-8">
                <div className="flex items-center gap-3 px-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
                  <Loader2 size={16} className="animate-spin text-purple-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Loading more notes...</span>
                </div>
              </div>
            )}

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="w-full h-4" />
          </AdminPanel>

        </div>
      </div>

      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
