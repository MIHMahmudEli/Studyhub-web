'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import NoteCard from '@/components/notes/NoteCard';
import NoteSkeleton from '@/components/notes/NoteSkeleton';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Filter, SortDesc, Search } from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const observer = useRef();
  const lastNoteElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      // Assuming endpoint exists: /notes?page=1&limit=10
      // If it doesn't, we'll mock it for now to show the UI
      const response = await apiRequest(`/notes?page=${page}&limit=10`);
      
      const newNotes = response.data || response; // Adapt to API response structure
      
      if (newNotes.length < 10) {
        setHasMore(false);
      }
      
      setNotes(prev => [...prev, ...newNotes]);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      // Fallback for development if API isn't ready
      if (page === 1) {
        const mockNotes = Array.from({ length: 10 }).map((_, i) => ({
          id: i,
          title: `Industry Standard Note Architecture - Module ${i + 1}`,
          description: 'A deep dive into advanced web patterns, state management, and performance optimization in modern React applications.',
          authorName: 'Alex Rivera',
          createdAt: new Date().toISOString(),
          category: 'Computer Science'
        }));
        setNotes(mockNotes);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [fetchNotes, user]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center transition-colors duration-500">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
      <DashboardNavbar />

      {/* Hero Header Section */}
      <div className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-nebula" />
        
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-[var(--foreground)] via-[var(--foreground)] to-slate-500 bg-clip-text text-transparent">
                Study Feed
              </h1>
              <p className="text-slate-500 max-w-[600px] text-base font-medium">
                Explore the latest notes and resources shared by the StudyHub community. 
                Everything you need to excel in your academics.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-[13px] font-bold text-slate-500 hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-all">
                <Filter size={16} /> Filter
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-[13px] font-bold text-slate-500 hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-all">
                <SortDesc size={16} /> Newest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="px-6 pb-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note, index) => {
              if (notes.length === index + 1) {
                return (
                  <div ref={lastNoteElementRef} key={note.id || index}>
                    <NoteCard note={note} />
                  </div>
                );
              } else {
                return <NoteCard key={note.id || index} note={note} />;
              }
            })}

            {loading && Array.from({ length: 4 }).map((_, i) => (
              <NoteSkeleton key={`skeleton-${i}`} />
            ))}
          </div>

          {!hasMore && notes.length > 0 && (
            <div className="text-center mt-20 pt-10 border-t border-white/5">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em]">
                You&apos;ve reached the edge of the universe
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
