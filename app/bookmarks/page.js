'use client';

import { Suspense, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  Bookmark, 
  BookOpen, 
  FileText, 
  Atom,
  Calculator,
  Brain,
  Globe,
  Database,
  Code2,
  Cpu,
  Network,
  Trash2,
  Download,
  ExternalLink,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { getSuggestions } from '@/lib/searchUtils';
import { BookmarkListSkeleton, ResourceListSkeleton } from '@/components/ui/Skeleton';
import Toast from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import NoteCard from '@/components/ui/NoteCard';
import CourseCard from '@/components/ui/CourseCard';

// ─── Icon helpers ────────────────────────────────────────────────────────────

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

// ─── Section heading helper ───────────────────────────────────────────────────
const SectionHeading = ({ colorClass, bgClass, borderClass, icon: Icon, label }) => (
  <div className="flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center ${colorClass} border ${borderClass} shadow-lg`}>
      <Icon size={20} />
    </div>
    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{label}</h2>
  </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────

function BookmarkPageInner() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasAnyBookmarks, setHasAnyBookmarks] = useState(false);
  const suggestionsContainerRef = useRef(null);
  const { user, loading: authLoading, tokenReady } = useAuth();
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

  const searchQueryRef = useRef(searchQuery);
  useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);

  // Fetch bookmarks (with optional search, reads from ref)
  const fetchBookmarks = useCallback(async () => {
    if (!tokenReady || !user) return;
    try {
      setLoading(true);
      let endpoint = '/bookmarks';
      const currentSearch = searchQueryRef.current;
      if (currentSearch && currentSearch.trim().length >= 3) {
        endpoint += `?search=${encodeURIComponent(currentSearch.trim())}`;
      }
      const data = await apiRequest(endpoint);
      setBookmarks(data || []);
      if (!currentSearch) setHasAnyBookmarks((data || []).length > 0);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    } finally {
      setLoading(false);
    }
  }, [tokenReady, user]);

  // Fetch on mount
  useEffect(() => {
    if (!tokenReady || !user) return;
    const timer = setTimeout(() => {
      fetchBookmarks();
    }, 0);
    return () => clearTimeout(timer);
  }, [tokenReady, user, fetchBookmarks]);

  // Manual search trigger — redirect to /search page
  const handleSearchSubmit = useCallback(() => {
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&from=bookmarks`);
  }, [searchQuery, router]);

  const handleRemoveBookmark = (id) => {
    const removed = bookmarks.find(b => b.id === id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
    apiRequest(`/bookmarks/${id}`, { method: 'DELETE' }).catch(err => {
      if (removed) setBookmarks(prev => [...prev, removed]);
      showToast('Failed to remove bookmark.', 'error');
    });
  };

  // Debounced suggestion fetch from local courses.json (no DB calls)
  const suggestionDebounceRef = useRef(null);

  const onSearchInputChange = useCallback((val) => {
    setSearchQuery(val);

    if (suggestionDebounceRef.current) clearTimeout(suggestionDebounceRef.current);

    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
      suggestionDebounceRef.current = setTimeout(() => {
        if (val.trim().length >= 2) {
          const results = getSuggestions(val);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        }
      }, 200);
    }
  }, []);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsContainerRef.current && !suggestionsContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync URL params
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) params.set('search', searchQuery);
      else params.delete('search');
      if (activeTab && activeTab !== 'all') params.set('tab', activeTab);
      else params.delete('tab');
      router.replace(`?${params.toString()}`, { scroll: false });
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, activeTab, router, searchParams]);

  // ─── Categorization (no client-side search filtering — handled server-side) ─
  const { savedNotes, savedCourses, savedResources } = useMemo(() => ({
    savedNotes:     bookmarks.filter(b => b.note_id !== null),
    savedResources: bookmarks.filter(b => b.resource_id !== null),
    savedCourses:   bookmarks.filter(b => b.subject_name !== null && !b.note_id && !b.resource_id),
  }), [bookmarks]);

  const displayCourses   = activeTab === 'all' || activeTab === 'courses' ? savedCourses   : [];
  const displayNotes     = activeTab === 'all' || activeTab === 'notes'   ? savedNotes     : [];
  const displayResources = activeTab === 'all' || activeTab === 'files'   ? savedResources : [];

  const hasSearchResults = savedCourses.length > 0 || savedNotes.length > 0 || savedResources.length > 0;
  const isArchiveEmpty   = !hasAnyBookmarks;

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (authLoading || !user || loading) {
    if (loading && user) return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-32">
        <DashboardNavbar />
        <div className="pt-24 md:pt-32 px-4 md:px-8">
          <div className="max-w-[1400px] mx-auto">
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
                  <div className="w-28 h-4 bg-slate-200 dark:bg-slate-800/50 rounded" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="relative h-[280px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 flex flex-col items-center justify-between shadow-sm animate-pulse">
                      <div className="relative z-10 w-12 h-12 rounded-[1.2rem] bg-slate-200 dark:bg-white/[0.05] border border-[var(--card-border)] flex items-center justify-center">
                        <div className="w-5 h-5 rounded bg-slate-300 dark:bg-white/[0.08]" />
                      </div>
                      <div className="relative z-10 text-center space-y-2 w-full">
                        <div className="space-y-1">
                          <div className="h-[14px] md:h-[15px] w-3/4 mx-auto rounded-full bg-slate-200 dark:bg-white/[0.05]" />
                          <div className="space-y-1 pt-1">
                            <div className="h-[11px] w-1/3 mx-auto rounded-full bg-slate-200 dark:bg-white/[0.05]" />
                            <div className="h-[10px] w-1/2 mx-auto rounded-full bg-slate-200 dark:bg-white/[0.05] mt-1.5" />
                          </div>
                        </div>
                      </div>
                      <div className="relative z-10 w-full flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
                        <div className="flex items-center gap-2.5">
                          <div className="h-3 w-10 rounded-full bg-slate-200 dark:bg-white/[0.05]" />
                          <div className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <div className="h-3 w-10 rounded-full bg-slate-200 dark:bg-white/[0.05]" />
                        </div>
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/[0.05]" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="space-y-6">
                <div className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800/50" />
                  <div className="w-28 h-4 bg-slate-200 dark:bg-slate-800/50 rounded" />
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

          {/* ─── Majestic Header ────────────────────────────────────────────── */}
          <PageHeader
            badgeIcon={Bookmark}
            badgeText="Archived Content"
            badgeColorClass="text-blue-500 bg-blue-500/10 border-blue-500/20"
            glowColor="bg-blue-500/10"
            title="My"
            titleHighlight="Collection"
            titleGradient="from-blue-500 to-purple-500"
            description="Your personalized repository of essential academic resources and curated study materials."
          >
            {/* ─── Premium Search with suggestions ───────────────────────── */}
            <div className="relative w-full md:w-[320px]" ref={suggestionsContainerRef}>
              <SearchInput
                placeholder="SEARCH ARCHIVES..."
                value={searchQuery}
                onChange={(e) => onSearchInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (suggestionDebounceRef.current) clearTimeout(suggestionDebounceRef.current);
                    setShowSuggestions(false);
                    handleSearchSubmit();
                  }
                  if (e.key === 'Escape') {
                    if (suggestionDebounceRef.current) clearTimeout(suggestionDebounceRef.current);
                    setSearchQuery('');
                    searchQueryRef.current = '';
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }
                }}
                onClear={() => {
                  if (suggestionDebounceRef.current) clearTimeout(suggestionDebounceRef.current);
                  setSearchQuery('');
                  searchQueryRef.current = '';
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                focusBorderClass="focus:border-blue-500/30"
                widthClass="w-full"
              />
              {/* Suggestions Dropdown — from local courses.json */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--background)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-y-auto max-h-[300px] z-50 backdrop-blur-xl">
                  {suggestions.map((course, idx) => (
                    <button
                      key={`${course.code}-${idx}`}
                      type="button"
                      onClick={() => {
                        if (suggestionDebounceRef.current) clearTimeout(suggestionDebounceRef.current);
                        setShowSuggestions(false);
                        router.push(`/search?q=${encodeURIComponent(course.courseTitle)}&from=bookmarks`);
                      }}
                      className="w-full px-6 py-4 text-left hover:bg-blue-500/5 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <p className="text-sm font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors">{course.courseTitle}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{course.code} • {course.dept}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PageHeader>

          {/* ─── Category Filter Tabs ───────────────────────────────────────── */}
          {!isArchiveEmpty && (
            <div className="flex items-center gap-2 mb-12 overflow-x-auto pb-2 scrollbar-none animate-in fade-in slide-in-from-bottom-4 duration-700">
              {[
                { id: 'all',     label: 'All Archives',   count: savedNotes.length + savedCourses.length + savedResources.length },
                { id: 'notes',   label: 'Saved Notes',    count: savedNotes.length },
                { id: 'files',   label: 'Saved Files',    count: savedResources.length },
                { id: 'courses', label: 'Saved Courses',  count: savedCourses.length },
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

            {/* ─── 1. Saved Courses — Majestic Course Grid ──────────────────── */}
            {displayCourses.length > 0 && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <SectionHeading
                  colorClass="text-blue-500"
                  bgClass="bg-blue-500/10"
                  borderClass="border-blue-500/20"
                  icon={BookOpen}
                  label="Saved Courses"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayCourses.map((course) => {
                    const Icon = getCourseIcon(course.subject_name);
                    const slug = course.subject_name.replace(/\s+/g, '-').toLowerCase();
                    return (
                      <CourseCard
                        key={course.id}
                        course={{ title: course.subject_name, code: '', slug }}
                        icon={Icon}
                        onClick={() => router.push(`/resources/${slug}`)}
                        footerLeftText="View Resources"
                        badgeLabel="RESOURCES"
                        onRemove={() => handleRemoveBookmark(course.id)}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* ─── 2. Saved Notes — Majestic Notes Grid ─────────────────────── */}
            {displayNotes.length > 0 && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <SectionHeading
                  colorClass="text-purple-500"
                  bgClass="bg-purple-500/10"
                  borderClass="border-purple-500/20"
                  icon={FileText}
                  label="Saved Notes"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayNotes.map((bookmark) => {
                    const note = bookmark.note;
                    if (!note) return null;
                    const Icon = getSubjectIcon(note.courseTitle, note.code);
                    return (
                      <NoteCard
                        key={bookmark.id}
                        note={note}
                        icon={Icon}
                        accentColor="blue"
                        onClick={() => router.push(`/notes/${note.id}`)}
                        onRemove={() => handleRemoveBookmark(bookmark.id)}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* ─── 3. Saved Files — Resource List ───────────────────────────── */}
            {displayResources.length > 0 && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <SectionHeading
                  colorClass="text-green-500"
                  bgClass="bg-green-500/10"
                  borderClass="border-green-500/20"
                  icon={ExternalLink}
                  label="Saved Files"
                />
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
                          className="p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => window.open(resource.resource?.file_path || '#', '_blank')}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.05] text-slate-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm cursor-pointer"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ─── Tab Empty State ───────────────────────────────────────────── */}
            {activeTab !== 'all' && displayCourses.length === 0 && displayNotes.length === 0 && displayResources.length === 0 && !isArchiveEmpty && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/[0.03] flex items-center justify-center text-slate-300 mb-6">
                  <Bookmark size={32} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest mb-2">No Saved Items in this Category</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[250px]">
                  You don&apos;t have any items bookmarked under &quot;{activeTab === 'notes' ? 'Saved Notes' : activeTab === 'files' ? 'Saved Files' : 'Saved Courses'}&quot;.
                </p>
              </div>
            )}

            {/* ─── Search Empty State ────────────────────────────────────────── */}
            {searchQuery && !hasSearchResults && !isArchiveEmpty && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/[0.03] flex items-center justify-center text-slate-300 mb-6">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest mb-2">No Matching Archives</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[250px]">
                  We couldn&apos;t find any bookmarks matching &quot;{searchQuery}&quot;. Try different keywords.
                </p>
              </div>
            )}

            {/* ─── Full Empty State ──────────────────────────────────────────── */}
            {isArchiveEmpty && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-white/[0.03] flex items-center justify-center text-slate-300">
                  <Bookmark size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase tracking-widest">Archive Empty</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[300px]">
                    You haven&apos;t pinned any content yet. Start exploring the library to build your archive.
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

      {/* ─── Toast ──────────────────────────────────────────────────────────── */}
      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}

export default function BookmarkPage() {
  return (
    <Suspense fallback={null}>
      <BookmarkPageInner />
    </Suspense>
  );
}
