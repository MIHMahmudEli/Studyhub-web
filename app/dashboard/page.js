'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { apiRequest } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Trophy, 
  Coins, 
  UploadCloud, 
  Download, 
  Eye, 
  Trash2, 
  ArrowRight,
  BookOpen,
  Bookmark,
  Calendar,
  Sparkles,
  FileText,
  AlertCircle,
  Settings
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudentDashboard() {
  const { user, loading: authLoading, checkUser } = useAuth();
  const router = useRouter();
  
  const [myNotes, setMyNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [stats, setStats] = useState({
    points: 0,
    uploads: 0,
    downloads: 0,
    rank: '--'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoadingNotes(true);
      // 1. Fetch user's uploaded notes
      const notesData = await apiRequest('/notes/my-notes');
      setMyNotes(notesData);

      // 2. Fetch leaderboard to determine current rank
      const leaderboardData = await apiRequest('/users/leaderboard');
      const rankIndex = leaderboardData.findIndex(u => u.id === user.id);
      const userRank = rankIndex !== -1 ? `#${rankIndex + 1}` : 'Rank #--';

      // 3. Compute stats
      const totalDownloads = notesData.reduce((acc, note) => acc + (note.downloads || 0), 0);
      
      setStats({
        points: user.points || 0,
        uploads: notesData.length,
        downloads: totalDownloads,
        rank: userRank
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!confirm('Are you absolutely sure you want to delete this note? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeletingId(id);

      // 1. Delete file from Supabase storage first to save space
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

      // 2. Call the backend DELETE API
      await apiRequest(`/notes/${id}`, { method: 'DELETE' });
      
      // Update local state
      setMyNotes(prev => prev.filter(n => n.id !== id));
      // Re-trigger auth context update to refresh points
      await checkUser();
      // Re-fetch calculations
      setStats(prev => ({
        ...prev,
        uploads: prev.uploads - 1
      }));
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-12">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full -z-10 animate-pulse" />
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-500 text-[9px] font-black uppercase tracking-[0.3em]">
                <Sparkles size={12} className="animate-pulse" /> Student Portal
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500">Dashboard</span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-[500px]">
                Manage your notes, view points, track download statistics, and lead the leaderboard.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                href="/settings"
                className="w-14 h-14 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-purple-500/30 flex items-center justify-center text-slate-500 hover:text-purple-500 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm backdrop-blur-xl"
                title="Account Settings"
              >
                <Settings size={20} className="animate-spin-slow" />
              </Link>
              
              <div className="flex items-center gap-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-4 shadow-sm backdrop-blur-xl">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Today's Date</p>
                  <p className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 mt-0.5">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Academic Points */}
            <div className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-sm hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Academic Points</span>
                  <h3 className="text-4xl font-black tracking-tight text-amber-500">
                    {loadingNotes ? <Skeleton className="w-16 h-10 rounded-lg animate-pulse" /> : stats.points}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Currency for downloads</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <Coins size={22} className="animate-pulse" />
                </div>
              </div>
            </div>

            {/* Card 2: Uploaded Notes */}
            <div className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-sm hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-purple-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Uploaded</span>
                  <h3 className="text-4xl font-black tracking-tight text-purple-500">
                    {loadingNotes ? <Skeleton className="w-16 h-10 rounded-lg animate-pulse" /> : stats.uploads}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Shared study materials</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <UploadCloud size={22} />
                </div>
              </div>
            </div>

            {/* Card 3: Total Downloads Received */}
            <div className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-sm hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Downloads</span>
                  <h3 className="text-4xl font-black tracking-tight text-blue-500">
                    {loadingNotes ? <Skeleton className="w-16 h-10 rounded-lg animate-pulse" /> : stats.downloads}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Generated by other peers</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <Download size={22} />
                </div>
              </div>
            </div>

            {/* Card 4: Leaderboard Position */}
            <Link href="/leaderboard" className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-sm hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1 block">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Leaderboard Rank</span>
                  <h3 className="text-4xl font-black tracking-tight text-emerald-500">
                    {loadingNotes ? <Skeleton className="w-20 h-10 rounded-lg animate-pulse" /> : stats.rank}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Top peers list position</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <Trophy size={22} />
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Shortcuts Hub */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Quick shortcuts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/upload" className="group flex items-center justify-between p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl hover:bg-white dark:hover:bg-white/[0.03] transition-all hover:translate-x-1 duration-500 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500"><UploadCloud size={16} /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Upload new note</span>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link href="/notes" className="group flex items-center justify-between p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl hover:bg-white dark:hover:bg-white/[0.03] transition-all hover:translate-x-1 duration-500 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500"><BookOpen size={16} /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Browse repository</span>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link href="/bookmarks" className="group flex items-center justify-between p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl hover:bg-white dark:hover:bg-white/[0.03] transition-all hover:translate-x-1 duration-500 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center text-pink-500"><Bookmark size={16} /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Saved bookmarks</span>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link href="/leaderboard" className="group flex items-center justify-between p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl hover:bg-white dark:hover:bg-white/[0.03] transition-all hover:translate-x-1 duration-500 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500"><Trophy size={16} /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Leaderboard standings</span>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Uploaded Notes Table Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Manage uploaded notes</h3>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Review the status of your submissions or delete them.</p>
              </div>
              
              <Link 
                href="/upload" 
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-xl shadow-purple-500/20 cursor-pointer"
              >
                <UploadCloud size={14} /> Upload new note
              </Link>
            </div>

            {loadingNotes ? (
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 space-y-4 shadow-sm">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-500/5 rounded-2xl gap-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-xl animate-pulse" />
                      <div className="space-y-2">
                        <Skeleton className="w-48 h-4 rounded animate-pulse" />
                        <Skeleton className="w-24 h-3 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-16 h-6 rounded-full animate-pulse" />
                      <Skeleton className="w-8 h-8 rounded-xl animate-pulse" />
                      <Skeleton className="w-8 h-8 rounded-xl animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : myNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-sm">
                <div className="w-20 h-20 bg-slate-500/5 rounded-3xl flex items-center justify-center mb-6 border border-[var(--card-border)]">
                  <FileText size={32} className="text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">No notes uploaded yet</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs font-semibold uppercase tracking-wider mb-6">
                  You haven't uploaded any study materials. Upload your notes to earn academic points.
                </p>
                <Link 
                  href="/upload" 
                  className="flex items-center gap-2 px-6 py-3.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-purple-500/20"
                >
                  <UploadCloud size={14} /> Start uploading
                </Link>
              </div>
            ) : (
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--card-border)] text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 bg-slate-500/5">
                        <th className="py-5 px-6">Note & details</th>
                        <th className="py-5 px-4 text-center">Status</th>
                        <th className="py-5 px-4 text-center">Downloads</th>
                        <th className="py-5 px-4 text-center">Rating</th>
                        <th className="py-5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)] text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {myNotes.map((note) => (
                        <tr key={note.id} className="hover:bg-slate-500/5 transition-colors">
                          <td className="py-5 px-6 max-w-xs md:max-w-md">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 flex-shrink-0">
                                <FileText size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{note.title}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-500/5 px-2 py-0.5 rounded border border-[var(--card-border)]">
                                    {note.code}
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    {new Date(note.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-center">
                            {note.status === 'approved' && (
                              <span className="inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10">
                                Approved
                              </span>
                            )}
                            {note.status === 'pending' && (
                              <span className="inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10">
                                Pending
                              </span>
                            )}
                            {note.status === 'rejected' && (
                              <span className="inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-500/10">
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="py-5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                            {note.downloads}
                          </td>
                          <td className="py-5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                            {parseFloat(note.avg_rating) > 0 ? (
                              <span className="inline-flex items-center gap-1">
                                <Sparkles size={12} className="text-amber-500 fill-amber-500" />
                                {parseFloat(note.avg_rating).toFixed(1)}
                              </span>
                            ) : '--'}
                          </td>
                          <td className="py-5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {note.status === 'approved' && (
                                <Link 
                                  href={`/notes/${note.id}`}
                                  className="w-8 h-8 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-slate-500 hover:text-purple-500 hover:border-purple-500/30 transition-all shadow-sm cursor-pointer"
                                  title="View Note"
                                >
                                  <Eye size={14} />
                                </Link>
                              )}
                              <button 
                                onClick={() => handleDeleteNote(note.id)}
                                disabled={deletingId === note.id}
                                className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm cursor-pointer"
                                title="Delete Note"
                              >
                                {deletingId === note.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
