'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
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
  ArrowRight,
  Star,
  Download
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import notesDemoData from '@/lib/data/notesDemo.json';
import { NoteCardSkeleton } from '@/components/ui/Skeleton';

// Helper to select icon based on subject
const getSubjectIcon = (subject, code) => {
  const s = (subject + ' ' + code).toLowerCase();
  if (s.includes('physics')) return Atom;
  if (s.includes('math') || s.includes('calculus')) return Calculator;
  if (s.includes('artificial') || s.includes('machine')) return Brain;
  if (s.includes('web')) return Globe;
  if (s.includes('database')) return Database;
  if (s.includes('programming') || s.includes('software') || s.includes('compiler')) return Code2;
  if (s.includes('microprocessor') || s.includes('architecture')) return Cpu;
  return FileText;
};

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allNotes, setAllNotes] = useState([]);
  const [displayedNotes, setDisplayedNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;
  
  const [sortBy, setSortBy] = useState('latest');
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const observer = useRef();

  // Fetch notes from database
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/notes?sort=${sortBy}`);
        // Map backend fields to frontend expected fields
        const mappedNotes = data.map(note => ({
          ...note,
          subject: note.courseTitle,
          course_code: note.code
        }));
        setAllNotes(mappedNotes);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotes();
    }
  }, [user, sortBy]);

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return allNotes;
    const q = searchQuery.toLowerCase();
    return allNotes.filter(note => 
      note.title.toLowerCase().includes(q) || 
      (note.subject && note.subject.toLowerCase().includes(q)) ||
      (note.course_code && note.course_code.toLowerCase().includes(q))
    );
  }, [searchQuery, allNotes]);

  // Handle infinite scroll pagination locally
  useEffect(() => {
    setDisplayedNotes(filteredNotes.slice(0, page * itemsPerPage));
  }, [filteredNotes, page]);

  const hasMore = displayedNotes.length < filteredNotes.length;

  const lastNoteElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [hasMore]);

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

  if (!user && !authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-32">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Majestic Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
            <div className="space-y-4 relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full -z-10" />
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-500 text-[9px] font-black uppercase tracking-[0.3em]">
                <FileText size={12} strokeWidth={3} /> Global Feed
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Notes</span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest max-w-[500px]">
                Explore the highest-rated student notes, lecture materials, and study guides from across the campus.
              </p>
            </div>

            {/* Premium Search & Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="SEARCH NOTES..."
                  className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-purple-500/30 transition-all shadow-xl"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1); // Reset pagination on search
                  }}
                />
              </div>
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
            </div>
          </div>

          {/* Majestic Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedNotes.map((note, idx) => {
              const Icon = getSubjectIcon(note.subject, note.course_code);
              
              return (
                <div 
                  ref={displayedNotes.length === idx + 1 ? lastNoteElementRef : null}
                  key={note.id}
                  onClick={() => router.push(`/notes/${note.id}`)}
                  className="group relative h-[300px] md:h-[360px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-white/[0.04] hover:border-purple-500/30 transition-all duration-700 hover:-translate-y-1 md:hover:-translate-y-2 shadow-sm animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
                  style={{ animationDelay: `${(idx % itemsPerPage) * 40}ms` }}
                >
                  <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-purple-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Centered Majestic Icon */}
                  <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-purple-500 shadow-xl group-hover:scale-110 group-hover:shadow-purple-500/20 transition-all duration-700">
                    <Icon size={28} strokeWidth={1.5} className="md:w-8 md:h-8" />
                  </div>

                  {/* Metadata & Title */}
                  <div className="relative z-10 text-center space-y-3 w-full">
                    <div className="space-y-2">
                      <p className="text-[7px] md:text-[7.5px] font-black tracking-[0.2em] text-purple-500/80 uppercase px-3 py-1 rounded-full bg-purple-500/5 border border-purple-500/10 inline-block truncate max-w-full">
                        {note.subject}
                      </p>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black tracking-[0.2em] text-slate-500 uppercase">
                          {note.course_code || 'GENERAL'}
                        </p>
                        <h3 className="text-[11px] md:text-[12px] font-black uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto group-hover:text-purple-500 transition-colors duration-500 line-clamp-2">
                          {note.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* High-Contrast Footer */}
                  <div className="relative z-10 w-full flex items-center justify-between pt-4 border-t border-[var(--card-border)]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <Star size={10} className={parseFloat(note.avg_rating) > 0 ? "text-amber-400 fill-amber-400" : ""} /> 
                        {parseFloat(note.avg_rating) > 0 ? note.avg_rating : 'NEW'}
                      </div>
                      <div className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <Download size={10} /> {note.downloads}
                      </div>
                    </div>
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
                      <ArrowRight size={10} className="md:w-3 md:h-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {displayedNotes.length === 0 && (
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
          {!hasMore && displayedNotes.length > 0 && (
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
