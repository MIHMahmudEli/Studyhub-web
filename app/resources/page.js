'use client';

import { Suspense, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  BookOpen,
  Cpu,
  Globe,
  Database,
  Code2,
  Network,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { getSuggestions } from '@/lib/searchUtils';
import Toast from '@/components/ui/Toast';
import Skeleton from '@/components/ui/Skeleton';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import CourseCard from '@/components/ui/CourseCard';
import EmptyState from '@/components/ui/EmptyState';

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

const getCourseDept = (code, title) => {
  if (!code) return 'CSE';
  const c = code.toUpperCase();
  if (c.startsWith('CSC') || c.startsWith('COE') || c.startsWith('CSE')) {
    const t = title.toLowerCase();
    if (t.includes('network') || t.includes('architecture') || t.includes('organization') || t.includes('hardware')) {
      return 'CS-SYSTEMS';
    }
    return 'CSE';
  }
  if (c.startsWith('EEE')) return 'EEE';
  if (c.startsWith('MGT')) return 'BBA';
  if (c.startsWith('MAT') || c.startsWith('MTH')) return 'MATH';
  if (c.startsWith('PHY')) return 'PHYSICS';
  if (c.startsWith('CHM') || c.startsWith('CHE')) return 'CHEMISTRY';
  if (c.startsWith('ENG')) return 'ENGLISH';
  return 'CSE';
};

const getCourseSlug = (title) => title.replace(/\s+/g, '-').toLowerCase();

function ResourcesPageInner() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [courses, setCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsContainerRef = useRef(null);
  const observerRef = useRef(null);
  const loadingMoreRef = useRef(false);

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

  const fetchCourses = useCallback((page, append = false) => {
    if (append) setLoadingMore(true); else setInitialLoading(true);
    let endpoint = `/resources/courses?page=${page}&limit=12`;
    const currentSearch = searchQueryRef.current;
    if (currentSearch && currentSearch.trim().length >= 3) {
      endpoint += `&search=${encodeURIComponent(currentSearch.trim())}`;
    }
    apiRequest(endpoint)
      .then(res => {
        const data = res?.data || [];
        const enriched = data.map(c => ({
          title: c.subject,
          code: c.course_code || 'N/A',
          dept: getCourseDept(c.course_code, c.subject),
          resourceCount: parseInt(c.resourceCount) || 0,
          slug: getCourseSlug(c.subject)
        }));
        setCourses(prev => append ? [...prev, ...enriched] : enriched);
        setTotalCourses(res?.total || 0);
      })
      .catch(err => {
        console.error('Failed to fetch courses:', err);
      })
      .finally(() => {
        setInitialLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      });
  }, []);

  const fetchBookmarks = useCallback(async () => {
    try {
      const data = await apiRequest('/bookmarks');
      setBookmarks(data || []);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    if (!tokenReady || !user) return;
    const timer = setTimeout(() => {
      setCourses([]);
      fetchCourses(1);
      fetchBookmarks();
    }, 0);
    return () => clearTimeout(timer);
  }, [tokenReady, user, fetchCourses, fetchBookmarks]);

  // Manual search trigger — redirect to /search page
  const handleSearchSubmit = useCallback(() => {
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&from=resources`);
  }, [searchQuery, router]);

  const handleToggleBookmark = (subjectName) => {
    const wasBookmarked = bookmarks.some(b => b.subject_name === subjectName);
    if (wasBookmarked) {
      setBookmarks(prev => prev.filter(b => b.subject_name !== subjectName));
    } else {
      setBookmarks(prev => [...prev, { subject_name: subjectName }]);
    }
    apiRequest('/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ subject_name: subjectName })
    }).catch(err => {
      setBookmarks(prev => wasBookmarked
        ? [...prev, { subject_name: subjectName }]
        : prev.filter(b => b.subject_name !== subjectName)
      );
      showToast(err.message || 'Failed to update bookmark.', 'error');
    });
  };

  const hasMoreCourses = courses.length < totalCourses;

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

  // Sync URL param
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) params.set('search', searchQuery);
      else params.delete('search');
      router.replace(`?${params.toString()}`, { scroll: false });
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, router, searchParams]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el || !hasMoreCourses || loadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingMoreRef.current) {
          loadingMoreRef.current = true;
          setCourses(prev => {
            const nextPage = Math.floor(prev.length / 12) + 1;
            fetchCourses(nextPage);
            return prev;
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMoreCourses, loadingMore, fetchCourses]);

  const coursesGrid = useMemo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {courses.map((course, idx) => {
        const Icon = getCourseIcon(course.title);
        const isBookmarked = bookmarks.some(b => b.subject_name === course.title);
        return (
          <CourseCard
            key={course.title}
            course={course}
            icon={Icon}
            accentColor="blue"
            animationDelay={(idx % 12) * 40}
            onClick={() => router.push(`/resources/${course.slug}`)}
            isBookmarked={isBookmarked}
            onToggleBookmark={() => handleToggleBookmark(course.title)}
          />
        );
      })}
    </div>
  ), [courses, bookmarks, router]);

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">

          {/* ─── Majestic Header ──────────────────────────────────────────────── */}
          <PageHeader
            badgeIcon={BookOpen}
            badgeText="Academic Repository"
            badgeColorClass="text-blue-500 bg-blue-500/10 border-blue-500/20"
            glowColor="bg-blue-500/10"
            title="Resource"
            titleHighlight="Library"
            titleGradient="from-blue-500 to-purple-500"
            description="Explore your faculty's complete collection of lectures, notes, and previous term materials."
          >
            {/* ─── Premium Search with suggestions ──────────────────────────────── */}
            <div className="relative w-full md:w-[320px]" ref={suggestionsContainerRef}>
              <SearchInput
                placeholder="SEARCH RESOURCES..."
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
                        router.push(`/search?q=${encodeURIComponent(course.courseTitle)}&from=resources`);
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

          {/* ─── Majestic Course Grid ─────────────────────────────────────────── */}
          {initialLoading ? (
            <Skeleton type="card" count={8} />
          ) : (
            coursesGrid
          )}

          {/* Infinite scroll sentinel — hidden while search is active */}
          {hasMoreCourses && !searchQuery && (
            <div ref={observerRef} className="w-full h-4 mt-8" />
          )}
          {loadingMore && (
            <div className="flex justify-center mt-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}

          {/* Empty State */}
          {!initialLoading && courses.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title="No Courses Found"
              message="We couldn't find any courses matching your search criteria. Try adjusting your filters."
            />
          )}
        </div>
      </div>

      {/* ─── Toast ──────────────────────────────────────────────────────────── */}
      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={null}>
      <ResourcesPageInner />
    </Suspense>
  );
}
