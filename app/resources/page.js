'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
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
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import Toast from '@/components/ui/Toast';
import Skeleton from '@/components/ui/Skeleton';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import CourseCard from '@/components/ui/CourseCard';

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

export default function ResourcesPage() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
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

  useEffect(() => {
    if (tokenReady && user) {
      fetchCourses(1);
      fetchBookmarks();
    }
  }, [tokenReady, user]);

  const fetchCourses = (page) => {
    if (page === 1) setInitialLoading(true); else setLoadingMore(true);
    apiRequest(`/resources/courses?page=${page}&limit=12`)
      .then(res => {
        const data = res?.data || [];
        const enriched = data.map(c => ({
          title: c.subject,
          code: c.course_code || 'N/A',
          dept: getCourseDept(c.course_code, c.subject),
          resourceCount: parseInt(c.resourceCount) || 0,
          slug: getCourseSlug(c.subject)
        }));
        setCourses(prev => page === 1 ? enriched : [...prev, ...enriched]);
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
  };

  const fetchBookmarks = async () => {
    try {
      const data = await apiRequest('/bookmarks');
      setBookmarks(data || []);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    }
  };

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

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.code.toLowerCase().includes(q) ||
      c.dept.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

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
  }, [hasMoreCourses, loadingMore]);

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
            {/* ─── Premium Search ──────────────────────────────────────────────── */}
            <SearchInput
              placeholder="SEARCH RESOURCES..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); }}
              focusBorderClass="focus:border-blue-500/30"
              widthClass="w-full md:w-[320px]"
            />
          </PageHeader>

          {/* ─── Majestic Course Grid ─────────────────────────────────────────── */}
          {initialLoading ? (
            <Skeleton type="card" count={8} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredCourses.map((course, idx) => {
                const Icon = getCourseIcon(course.title);
                const isBookmarked = bookmarks.some(b => b.subject_name === course.title);
                return (
                  <CourseCard
                    key={course.title}
                    course={course}
                    icon={Icon}
                    animationDelay={(idx % 12) * 40}
                    onClick={() => router.push(`/resources/${course.slug}`)}
                    footerLeftText={`${course.resourceCount} Files`}
                    badgeLabel={getCourseDept(course.code, course.title)}
                    isBookmarked={isBookmarked}
                    onToggleBookmark={() => handleToggleBookmark(course.title)}
                  />
                );
              })}
            </div>
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
        </div>
      </div>

      {/* ─── Toast ──────────────────────────────────────────────────────────── */}
      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
