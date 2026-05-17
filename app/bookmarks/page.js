'use client';

import { useState, useMemo, useEffect } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  Bookmark, 
  Search, 
  BookOpen, 
  FileText, 
  GraduationCap,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  Cpu,
  Globe,
  Database,
  Code2,
  Network,
  Trash2,
  Star,
  Download,
  Calculator,
  Brain,
  Atom,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { BookmarkListSkeleton, NoteCardSkeleton, ResourceListSkeleton } from '@/components/ui/Skeleton';

// Helper to select icon based on subject
const getSubjectIcon = (subject, code) => {
  const s = ((subject || '') + ' ' + (code || '')).toLowerCase();
  if (s.includes('physics')) return Atom;
  if (s.includes('math') || s.includes('calculus')) return Calculator;
  if (s.includes('artificial') || s.includes('machine')) return Brain;
  if (s.includes('web')) return Globe;
  if (s.includes('database')) return Database;
  if (s.includes('programming') || s.includes('software') || s.includes('compiler')) return Code2;
  if (s.includes('microprocessor') || s.includes('architecture')) return Cpu;
  return FileText;
};

export default function BookmarkPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'notes', 'files', 'courses'
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  };
  
  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await apiRequest('/bookmarks');
        setBookmarks(data);
      } catch (err) {
        console.error('Failed to fetch bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [user]);

  const handleRemoveBookmark = async (id) => {
    try {
      await apiRequest(`/bookmarks/${id}`, { method: 'DELETE' });
      setBookmarks(prev => prev.filter(b => b.id !== id));
      showToast('Item removed from your bookmarks archive.', 'success');
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      showToast('Failed to remove bookmark.', 'error');
    }
  };

  // Unified Filtering & Grouping Logic
  const { savedNotes, savedCourses, savedResources } = useMemo(() => {
    return {
      savedNotes: bookmarks.filter(b => b.note_id !== null),
      savedResources: bookmarks.filter(b => b.resource_id !== null),
      savedCourses: bookmarks.filter(b => b.subject_name !== null && !b.note_id && !b.resource_id)
    };
  }, [bookmarks]);

  // Search filtering
  const filterBySearch = (items) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => {
      const target = item.note || {};
      return (
        item.subject_name?.toLowerCase().includes(q) ||
        target.title?.toLowerCase().includes(q) ||
        target.courseTitle?.toLowerCase().includes(q) ||
        target.code?.toLowerCase().includes(q)
      );
    });
  };

  const filteredCourses = useMemo(() => filterBySearch(savedCourses), [savedCourses, searchQuery]);
  const filteredNotes = useMemo(() => filterBySearch(savedNotes), [savedNotes, searchQuery]);
  const filteredResources = useMemo(() => filterBySearch(savedResources), [savedResources, searchQuery]);

  const displayCourses = activeTab === 'all' || activeTab === 'courses' ? filteredCourses : [];
  const displayNotes = activeTab === 'all' || activeTab === 'notes' ? filteredNotes : [];
  const displayResources = activeTab === 'all' || activeTab === 'files' ? filteredResources : [];

  const hasSearchResults = filteredCourses.length > 0 || filteredNotes.length > 0 || filteredResources.length > 0;
  const isArchiveEmpty = savedNotes.length === 0 && savedCourses.length === 0 && savedResources.length === 0;

  const getCourseIcon = (title) => {
    if (!title) return BookOpen;
    const t = title.toLowerCase();
    if (t.includes('network')) return Network;
    if (t.includes('compiler') || t.includes('software')) return Code2;
    if (t.includes('intelligence') || t.includes('machine')) return Cpu;
    if (t.includes('web')) return Globe;
    if (t.includes('data')) return Database;
    return BookOpen;
  };

  if (authLoading || !user || loading) {
    if (loading && user) return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-32">
        <DashboardNavbar />
        <div className="pt-24 md:pt-32 px-4 md:px-8">
          <div className="max-w-[1400px] mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16 animate-pulse">
              <div className="space-y-4 w-full max-w-md">
                <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800/50 rounded-full" />
                <div className="w-3/4 h-12 bg-slate-200 dark:bg-slate-800/50 rounded-lg" />
              </div>
              <div className="w-full md:w-[320px] h-12 bg-slate-200 dark:bg-slate-800/50 rounded-2xl" />
            </div>

            <div className="space-y-20">
              <section className="space-y-8">
                <div className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800/50" />
                  <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800/50 rounded" />
                </div>
                <BookmarkListSkeleton />
              </section>
              <section className="space-y-6">
                 <div className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800/50" />
                  <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800/50 rounded" />
                </div>
                <ResourceListSkeleton />
              </section>
            </div>
          </div>
        </div>
      </main>
    );
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-32">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Majestic Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[9px] font-black uppercase tracking-[0.3em]">
                <Bookmark size={12} strokeWidth={3} /> Archived Content
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Collection</span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest max-w-[500px]">
                Your personalized repository of essential academic resources and curated study materials.
              </p>
            </div>

            {/* Premium Search */}
            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH ARCHIVES..."
                className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-blue-500/30 transition-all shadow-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          {!isArchiveEmpty && (
            <div className="flex items-center gap-2 mb-12 overflow-x-auto pb-2 scrollbar-none animate-in fade-in slide-in-from-bottom-4 duration-700">
              {[
                { id: 'all', label: 'All Archives', count: savedNotes.length + savedCourses.length + savedResources.length },
                { id: 'notes', label: 'Saved Notes', count: savedNotes.length },
                { id: 'files', label: 'Saved Files', count: savedResources.length },
                { id: 'courses', label: 'Saved Courses', count: savedCourses.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shrink-0 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white scale-105 shadow-blue-500/20'
                      : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-[var(--foreground)] hover:border-blue-500/30'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-20">
            {/* 1. SAVED RESOURCES SECTION (Majestic Grid - Course Hub) */}
            {displayCourses.length > 0 && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-lg">
                    <BookOpen size={20} />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Saved Courses</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayCourses.map((course) => {
                    const Icon = getCourseIcon(course.subject_name);
                    const slug = course.subject_name.replace(/\s+/g, '-').toLowerCase();

                    return (
                      <div key={course.id} className="relative group">
                        <div 
                          onClick={() => router.push(`/resources/${slug}`)}
                          className="relative h-[280px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 flex flex-col items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-1 shadow-sm"
                        >
                          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          {/* Centered Majestic Icon */}
                          <div className="relative z-10 w-12 h-12 rounded-[1.2rem] bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-blue-500 shadow-md group-hover:scale-105 transition-all duration-700">
                            <Icon size={20} strokeWidth={1.5} />
                          </div>

                          {/* Metadata & Title */}
                          <div className="relative z-10 text-center space-y-2 w-full">
                            <div className="space-y-1">
                              <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest leading-relaxed max-w-[180px] mx-auto group-hover:text-blue-500 transition-colors duration-500 line-clamp-2">
                                {course.subject_name}
                              </h3>
                              <div className="space-y-1 pt-1">
                                <p className="text-[7.5px] font-black tracking-[0.2em] text-slate-500 uppercase">
                                  COURSE ARCHIVE
                                </p>
                                <p className="text-[6.5px] font-black tracking-[0.15em] text-blue-500/80 uppercase px-2 py-0.5 rounded-full bg-blue-500/5 border border-blue-500/10 inline-block">
                                  RESOURCES
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="relative z-10 w-full flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                View Resources
                              </span>
                            </div>
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                              <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        </div>

                        {/* Remove Bookmark Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBookmark(course.id);
                          }}
                          className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-lg cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 2. SAVED NOTES SECTION */}
            {displayNotes.length > 0 && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 shadow-lg">
                    <FileText size={20} />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Saved Notes</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayNotes.map((bookmark) => {
                    const note = bookmark.note;
                    if (!note) return null;
                    const Icon = getSubjectIcon(note.courseTitle, note.code);
                    return (
                      <div key={bookmark.id} className="relative group">
                        <div 
                          onClick={() => router.push(`/notes/${note.id}`)}
                          className="relative h-[280px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 flex flex-col items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-1 shadow-sm"
                        >
                          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          {/* Centered Majestic Icon */}
                          <div className="relative z-10 w-12 h-12 rounded-[1.2rem] bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-blue-500 shadow-md group-hover:scale-105 transition-all duration-500">
                            <Icon size={20} strokeWidth={1.5} />
                          </div>

                          {/* Metadata & Title */}
                          <div className="relative z-10 text-center space-y-2 w-full">
                            <div className="space-y-1">
                              <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest leading-relaxed max-w-[180px] mx-auto group-hover:text-blue-500 transition-colors duration-500 line-clamp-2">
                                {note.title}
                              </h3>
                              <div className="space-y-1 pt-1">
                                <p className="text-[7.5px] font-black tracking-[0.2em] text-slate-500 uppercase">
                                  {note.code || 'GENERAL'}
                                </p>
                                <p className="text-[6.5px] font-black tracking-[0.15em] text-blue-500/80 uppercase px-2 py-0.5 rounded-full bg-blue-500/5 border border-blue-500/10 inline-block">
                                  {note.courseTitle || 'GENERAL STUDY'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* High-Contrast Footer */}
                          <div className="relative z-10 w-full flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                <Star size={9} className={parseFloat(note.avg_rating) > 0 ? "text-amber-400 fill-amber-400" : ""} /> 
                                {parseFloat(note.avg_rating) > 0 ? note.avg_rating : 'NEW'}
                              </div>
                              <div className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                              <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                <Download size={9} /> {note.downloads}
                              </div>
                            </div>
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                              <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        </div>

                        {/* Remove Bookmark Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBookmark(bookmark.id);
                          }}
                          className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-lg cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3. SAVED FILES SECTION */}
            {displayResources.length > 0 && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 shadow-lg">
                    <ExternalLink size={20} />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Saved Files</h2>
                </div>
                <div className="space-y-3">
                  {displayResources.map((resource) => (
                    <div 
                      key={resource.id} 
                      className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 md:p-5 flex items-center justify-between hover:border-blue-500/30 transition-all duration-500 shadow-sm"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[var(--card-border)] flex items-center justify-center text-slate-400 shrink-0 group-hover:text-blue-500 transition-colors">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest truncate pr-4 group-hover:text-blue-500 transition-colors">
                            {resource.resource?.title || `Resource File #${resource.resource_id}`}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                              {resource.resource?.subject || resource.resource?.course_code || 'RESOURCE ARCHIVE'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button 
                          onClick={() => handleRemoveBookmark(resource.id)}
                          className="p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button 
                          onClick={() => window.open(resource.resource?.file_path || '#', '_blank')}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.05] text-slate-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TAB EMPTY STATE */}
            {activeTab !== 'all' && displayCourses.length === 0 && displayNotes.length === 0 && displayResources.length === 0 && !isArchiveEmpty && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/[0.03] flex items-center justify-center text-slate-300 mb-6">
                  <Bookmark size={32} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest mb-2">No Saved Items in this Category</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[250px]">
                  You don't have any items bookmarked under "{activeTab === 'notes' ? 'Saved Notes' : activeTab === 'files' ? 'Saved Files' : 'Saved Courses'}".
                </p>
              </div>
            )}

            {/* SEARCH EMPTY STATE */}
            {searchQuery && !hasSearchResults && !isArchiveEmpty && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/[0.03] flex items-center justify-center text-slate-300 mb-6">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest mb-2">No Matching Archives</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[250px]">
                  We couldn't find any bookmarks matching "{searchQuery}". Try different keywords.
                </p>
              </div>
            )}

            {/* FULL EMPTY STATE */}
            {isArchiveEmpty && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-white/[0.03] flex items-center justify-center text-slate-300">
                  <Bookmark size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase tracking-widest">Archive Empty</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[300px]">
                    You haven't pinned any content yet. Start exploring the library to build your archive.
                  </p>
                </div>
                <Link 
                  href="/resources" 
                  className="px-8 py-3 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20"
                >
                  Explore Library
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── TOAST NOTIFICATION CONTAINER ─────────────────────────────────────── */}
      {toast.show && (
        <div className={`fixed top-24 right-6 z-[999999] transition-all duration-500 ease-in-out ${
          toast.isClosing ? 'translate-x-20 opacity-0 pointer-events-none' : 'animate-in slide-in-from-right fade-in'
        }`}>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-xl max-w-xs ${
            toast.type === 'error'
              ? 'bg-red-500/10 border-red-500/20 text-red-500'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle size={16} className="shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="shrink-0" />
            )}
            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed flex-1">{toast.message}</p>

            <div className="relative w-6 h-6 shrink-0 flex items-center justify-center ml-1">
              <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-20" />
                <circle
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray="62.8"
                  strokeDashoffset="62.8"
                  style={{ animation: 'toastProgress 5s linear forwards', strokeLinecap: 'round' }}
                />
              </svg>
              <button
                onClick={closeToast}
                className="absolute inset-0 flex items-center justify-center hover:scale-110 transition-transform z-10 focus:outline-none cursor-pointer"
              >
                <X size={10} />
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes toastProgress {
              from { stroke-dashoffset: 62.8; }
              to { stroke-dashoffset: 0; }
            }
          `}</style>
        </div>
      )}
    </main>
  );
}
