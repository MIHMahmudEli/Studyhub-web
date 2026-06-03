'use client';

import { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Filter, 
  SortDesc, 
  Search, 
  FileText, 
  Atom, 
  Calculator, 
  Brain, 
  Globe, 
  Database,
  Code2,
  Cpu,
  Star,
  Download,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { NoteCardSkeleton } from '@/components/ui/Skeleton';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import NoteCard from '@/components/ui/NoteCard';

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

function NotesPageInner() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [notes, setNotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotes, setTotalNotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 12;
  
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();
  const observer = useRef();
  const loadingRef = useRef(false);
  const fetchNotesRef = useRef();
  const currentPageRef = useRef(currentPage);
  const totalNotesRef = useRef(totalNotes);

  const fetchNotes = useCallback(async (pageNum, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const res = await apiRequest(`/notes?sort=${sortBy}&page=${pageNum}&limit=${limit}`);
      const mapped = res.data.map(note => ({
        ...note,
        subject: note.courseTitle,
        course_code: note.code
      }));
      const noMore = mapped.length < limit;
      const newTotal = noMore ? 0 : res.total;
      if (append) {
        setNotes(prev => {
          const seen = new Set(prev.map(n => n.id));
          return [...prev, ...mapped.filter(n => !seen.has(n.id))];
        });
      } else {
        setNotes(mapped);
      }
      setTotalNotes(newTotal);
      setCurrentPage(pageNum);
      currentPageRef.current = pageNum;
      totalNotesRef.current = newTotal;
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [sortBy]);

  // Sync stable refs
  useEffect(() => { fetchNotesRef.current = fetchNotes; }, [fetchNotes]);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { totalNotesRef.current = totalNotes; }, [totalNotes]);

  // Initial fetch on mount
  useEffect(() => {
    setNotes([]);
    setCurrentPage(1);
    currentPageRef.current = 1;
    if (tokenReady && user) {
      fetchNotes(1);
    }
  }, [tokenReady, user]);

  // Sync URL params
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) params.set('search', searchQuery);
      else params.delete('search');
      if (sortBy && sortBy !== 'latest') params.set('sort', sortBy);
      else params.delete('sort');
      router.replace(`?${params.toString()}`, { scroll: false });
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, sortBy, router, searchParams]);

  // Client-side sort + search filter
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    if (sortBy === 'top-rated') {
      result.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    } else if (sortBy === 'most-downloaded') {
      result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(note =>
        note.title.toLowerCase().includes(q) ||
        (note.subject && note.subject.toLowerCase().includes(q)) ||
        (note.course_code && note.course_code.toLowerCase().includes(q))
      );
    }

    return result;
  }, [searchQuery, notes, sortBy]);

  const hasMore = totalNotes > 0 && notes.length < totalNotes;

  // Stable observer — never recreated, reads latest values from refs
  const lastNoteElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingRef.current && totalNotesRef.current > 0) {
        loadingRef.current = true;
        fetchNotesRef.current(currentPageRef.current + 1, true);
      }
    });
    if (node) observer.current.observe(node);
  }, []);

  if (authLoading || loading) return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-32">
      <DashboardNavbar />
      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Skeleton Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16 animate-pulse">
            <div className="space-y-4 w-full max-w-md">
              <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800/50 rounded-full" />
              <div className="w-3/4 h-12 bg-slate-200 dark:bg-slate-800/50 rounded-lg" />
              <div className="w-full h-4 bg-slate-200 dark:bg-slate-800/50 rounded-full" />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="w-full sm:w-[280px] h-12 bg-slate-200 dark:bg-slate-800/50 rounded-2xl" />
              <div className="w-32 h-12 bg-slate-200 dark:bg-slate-800/50 rounded-2xl" />
              <div className="w-32 h-12 bg-slate-200 dark:bg-slate-800/50 rounded-2xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <NoteCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-32">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">

          {/* ─── Majestic Header ──────────────────────────────────────────────── */}
          <PageHeader
            badgeIcon={FileText}
            badgeText="Global Feed"
            badgeColorClass="text-purple-500 bg-purple-500/10 border-purple-500/20"
            glowColor="bg-purple-500/10"
            title="Study"
            titleHighlight="Notes"
            titleGradient="from-purple-500 to-blue-500"
            description="Explore the highest-rated student notes, lecture materials, and study guides from across the campus."
          >
            {/* ─── Premium Search & Sort filters ──────────────────────────────── */}
            <SearchInput
              placeholder="SEARCH NOTES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              focusBorderClass="focus:border-purple-500/30"
              widthClass="w-full sm:w-[280px]"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setSortBy('most-downloaded')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 border rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-sm cursor-pointer ${
                  sortBy === 'most-downloaded' 
                  ? 'bg-blue-500 text-white border-blue-400' 
                  : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-500 hover:text-blue-500'
                }`}
              >
                <Download size={14} /> Trending
              </button>
              <button 
                onClick={() => setSortBy(sortBy === 'top-rated' ? 'latest' : 'top-rated')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 border rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-sm cursor-pointer ${
                  sortBy === 'top-rated' 
                  ? 'bg-amber-500 text-white border-amber-400' 
                  : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-500 hover:text-amber-500'
                }`}
              >
                <Star size={14} /> Top Rated
              </button>
            </div>
          </PageHeader>

          {/* ─── Majestic Notes Grid ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotes.map((note, idx) => {
              const Icon = getSubjectIcon(note.subject, note.course_code);
              return (
                <NoteCard
                  key={note.id}
                  note={note}
                  icon={Icon}
                  accentColor="purple"
                  animationDelay={(idx % limit) * 40}
                  onClick={() => router.push(`/notes/${note.id}`)}
                />
              );
            })}
          </div>

          {/* Sentinel for infinite scroll */}
          {hasMore && !loading && (
            <div ref={lastNoteElementRef} className="h-1" />
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center mt-12">
              <div className="flex items-center gap-3 px-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Loading more notes...</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !loadingMore && filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-24 h-24 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-3xl flex items-center justify-center text-slate-400 mb-8 shadow-xl">
                <FileText size={48} strokeWidth={1} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-2">No Notes Found</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 max-w-[400px]">
                We couldn't find any notes matching your search criteria. Try adjusting your filters.
              </p>
            </div>
          )}

          {/* Infinite Scroll End Indicator */}
          {!hasMore && filteredNotes.length > 0 && (
            <div className="text-center mt-20 pt-10 border-t border-slate-200 dark:border-white/5">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">
                End of Notes Archive
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={null}>
      <NotesPageInner />
    </Suspense>
  );
}
