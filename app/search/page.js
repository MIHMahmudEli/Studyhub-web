'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Layers, BookOpen, Search as SearchIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { expandShortForm } from '@/lib/searchUtils';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import NoteCard from '@/components/ui/NoteCard';
import CourseCard from '@/components/ui/CourseCard';
import EmptyState from '@/components/ui/EmptyState';

function SearchPageInner() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const query = expandShortForm(rawQuery) || rawQuery;
  const from = searchParams.get('from') || 'notes';
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const queryRef = useRef(query);
  useEffect(() => { queryRef.current = query; }, [query]);

  const fetchResults = useCallback(async () => {
    if (!tokenReady || !user || !query.trim()) return;

    setLoading(true);

    try {
      if (from === 'notes') {
        const res = await apiRequest(`/notes?search=${encodeURIComponent(query.trim())}&limit=20&sort=latest`).catch(() => null);
        if (res?.data) {
          setNotes(res.data.map(n => ({
            ...n,
            subject: n.courseTitle,
            course_code: n.code,
          })));
        }
      } else if (from === 'resources') {
        const res = await apiRequest(`/resources/courses?search=${encodeURIComponent(query.trim())}&limit=12`).catch(() => null);
        if (res?.data) {
          const enriched = res.data.map(c => ({
            title: c.subject,
            code: c.course_code || 'N/A',
            dept: '',
            resourceCount: parseInt(c.resourceCount) || 0,
            slug: c.subject.replace(/\s+/g, '-').toLowerCase(),
          }));
          setCourses(enriched);
        }
      } else if (from === 'bookmarks') {
        const data = await apiRequest(`/bookmarks?search=${encodeURIComponent(query.trim())}`).catch(() => null);
        setBookmarks(data || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, [tokenReady, user, query, from]);

  useEffect(() => {
    if (!tokenReady || !user) return;
    const timer = setTimeout(() => fetchResults(), 0);
    return () => clearTimeout(timer);
  }, [fetchResults, tokenReady, user]);

  const getNavIcon = (subject) => {
    const s = (subject || '').toLowerCase();
    if (s.includes('physics')) return FileText;
    if (s.includes('math')) return FileText;
    if (s.includes('web')) return FileText;
    return FileText;
  };

  const getSourceLabel = () => {
    switch (from) {
      case 'resources': return { icon: BookOpen, label: 'Courses', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
      case 'bookmarks': return { icon: Layers, label: 'Bookmarks', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      default: return { icon: FileText, label: 'Notes', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
    }
  };

  const source = getSourceLabel();
  const resultCount = from === 'notes' ? notes.length : from === 'resources' ? courses.length : bookmarks.length;
  const hasResults = resultCount > 0;

  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${from}`);
    }
  }, [router, from]);

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-32">
      <DashboardNavbar showBackButton onBack={handleGoBack} />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">

          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl ${source.bg} ${source.border} border flex items-center justify-center ${source.color}`}>
                <SearchIcon size={22} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  Search <span className={source.color}>{source.label}</span> for &ldquo;<span className="text-blue-500">{query}</span>&rdquo;
                </h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {resultCount} result{resultCount !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </div>

          {loading ? (
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
              message={`We couldn't find any ${source.label.toLowerCase()} matching "${query}". Try different keywords.`}
            />
          ) : from === 'bookmarks' ? (
            <div className="space-y-3">
              {bookmarks.map((bm) => {
                const title = bm.note?.title || bm.resource?.title || bm.subject_name || 'Untitled';
                const sub = bm.note?.code || bm.resource?.course_code || '';
                return (
                  <div
                    key={bm.id}
                    className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 md:p-5 flex items-center justify-between hover:border-emerald-500/30 transition-all duration-500 shadow-sm"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                        <Layers size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest truncate pr-4 group-hover:text-emerald-500 transition-colors">
                          {title}
                        </h4>
                        {sub && (
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{sub}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : from === 'resources' ? (
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
          ) : (
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
