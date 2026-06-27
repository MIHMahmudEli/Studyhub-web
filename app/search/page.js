'use client';

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Layers, BookOpen, Search as SearchIcon, Loader2, Trash2, Download, ExternalLink, Bookmark, Atom, Calculator, Brain, Globe, Database, Code2, Cpu, Network } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { getDisplayUrl } from '@/lib/r2';
import { expandShortForm } from '@/lib/searchUtils';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import NoteCard from '@/components/ui/NoteCard';
import CourseCard from '@/components/ui/CourseCard';
import EmptyState from '@/components/ui/EmptyState';
import Toast from '@/components/ui/Toast';

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

const SectionHeading = ({ colorClass, bgClass, borderClass, icon: Icon, label }) => (
  <div className="flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center ${colorClass} border ${borderClass} shadow-lg`}>
      <Icon size={20} />
    </div>
    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{label}</h2>
  </div>
);

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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const [loading, setLoading] = useState(true);

  const queryRef = useRef(query);
  useEffect(() => { queryRef.current = query; }, [query]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

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

  const handleRemoveBookmark = (id) => {
    const removed = bookmarks.find(b => b.id === id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
    apiRequest(`/bookmarks/${id}`, { method: 'DELETE' }).catch(err => {
      if (removed) setBookmarks(prev => [...prev, removed]);
      showToast('Failed to remove bookmark.', 'error');
    });
  };

  const { savedNotes, savedCourses, savedResources } = useMemo(() => ({
    savedNotes:     bookmarks.filter(b => b.note_id !== null),
    savedResources: bookmarks.filter(b => b.resource_id !== null),
    savedCourses:   bookmarks.filter(b => b.subject_name !== null && !b.note_id && !b.resource_id),
  }), [bookmarks]);

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
  const bookmarkCount = savedCourses.length + savedNotes.length + savedResources.length;
  const resultCount = from === 'notes' ? notes.length : from === 'resources' ? courses.length : bookmarkCount;
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
            <div className="space-y-20">
              {savedCourses.length > 0 && (
                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SectionHeading
                    colorClass="text-blue-500"
                    bgClass="bg-blue-500/10"
                    borderClass="border-blue-500/20"
                    icon={BookOpen}
                    label="Saved Courses"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {savedCourses.map((course) => {
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

              {savedNotes.length > 0 && (
                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SectionHeading
                    colorClass="text-purple-500"
                    bgClass="bg-purple-500/10"
                    borderClass="border-purple-500/20"
                    icon={FileText}
                    label="Saved Notes"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {savedNotes.map((bookmark) => {
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

              {savedResources.length > 0 && (
                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SectionHeading
                    colorClass="text-green-500"
                    bgClass="bg-green-500/10"
                    borderClass="border-green-500/20"
                    icon={ExternalLink}
                    label="Saved Files"
                  />
                  <div className="space-y-3">
                    {savedResources.map((resource) => (
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
                            onClick={() => window.open(getDisplayUrl(resource.resource?.file_path) || '#', '_blank')}
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

      <Toast toast={toast} closeToast={closeToast} />
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
