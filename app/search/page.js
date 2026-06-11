'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Layers, BookOpen, ArrowLeft, Search as SearchIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import NoteCard from '@/components/ui/NoteCard';
import CourseCard from '@/components/ui/CourseCard';
import EmptyState from '@/components/ui/EmptyState';

function SearchPageInner() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [notesTotal, setNotesTotal] = useState(0);
  const [coursesTotal, setCoursesTotal] = useState(0);

  const queryRef = useRef(query);
  useEffect(() => { queryRef.current = query; }, [query]);

  const fetchResults = useCallback(async () => {
    if (!tokenReady || !user || !query.trim()) return;

    setLoadingNotes(true);
    setLoadingCourses(true);

    try {
      const [notesRes, coursesRes] = await Promise.all([
        apiRequest(`/notes?search=${encodeURIComponent(query.trim())}&limit=20&sort=latest`).catch(() => null),
        apiRequest(`/resources/courses?search=${encodeURIComponent(query.trim())}&limit=12`).catch(() => null),
      ]);

      if (notesRes?.data) {
        setNotes(notesRes.data.map(n => ({
          ...n,
          subject: n.courseTitle,
          course_code: n.code,
        })));
        setNotesTotal(notesRes.total || 0);
      }

      if (coursesRes?.data) {
        const enriched = coursesRes.data.map(c => ({
          title: c.subject,
          code: c.course_code || 'N/A',
          dept: '',
          resourceCount: parseInt(c.resourceCount) || 0,
          slug: c.subject.replace(/\s+/g, '-').toLowerCase(),
        }));
        setCourses(enriched);
        setCoursesTotal(coursesRes.total || 0);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoadingNotes(false);
      setLoadingCourses(false);
    }
  }, [tokenReady, user, query]);

  useEffect(() => {
    if (!tokenReady || !user) return;
    const timer = setTimeout(() => fetchResults(), 0);
    return () => clearTimeout(timer);
  }, [fetchResults, tokenReady, user]);

  const hasResults = notes.length > 0 || courses.length > 0;
  const isLoading = loadingNotes || loadingCourses;

  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/notes');
    }
  }, [router]);

  const getNavIcon = (subject) => {
    const s = (subject || '').toLowerCase();
    if (s.includes('physics')) return FileText;
    if (s.includes('math')) return FileText;
    if (s.includes('web')) return FileText;
    return FileText;
  };

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-32">
      <DashboardNavbar showBackButton onBack={handleGoBack} />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">

          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <SearchIcon size={22} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  Results for &ldquo;<span className="text-blue-500">{query}</span>&rdquo;
                </h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {notesTotal + coursesTotal} result{(notesTotal + coursesTotal) !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex items-center gap-3 px-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Searching...</span>
              </div>
            </div>
          ) : !hasResults ? (
            <EmptyState
              icon={SearchIcon}
              title="No Results Found"
              message={`We couldn't find any notes or resources matching "${query}". Try different keywords.`}
            />
          ) : (
            <div className="space-y-16">
              {courses.length > 0 && (
                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                      <BookOpen size={16} />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                      Courses ({coursesTotal})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {courses.map((course, idx) => (
                      <CourseCard
                        key={course.title + idx}
                        course={course}
                        icon={BookOpen}
                        accentColor="blue"
                        animationDelay={idx * 40}
                        onClick={() => router.push(`/resources/${course.slug}`)}
                        badgeLabel="RESOURCES"
                        footerLeftText={`${course.resourceCount} files`}
                      />
                    ))}
                  </div>
                </section>
              )}

              {notes.length > 0 && (
                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                      <FileText size={16} />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                      Notes ({notesTotal})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {notes.map((note, idx) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        icon={getNavIcon(note.subject)}
                        accentColor="purple"
                        animationDelay={idx * 40}
                        onClick={() => router.push(`/notes/${note.id}`)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
