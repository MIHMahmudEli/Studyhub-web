'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
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
import coursesData from '@/lib/data/courses.json';
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

export default function ResourcesPage() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResources, setTotalResources] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const observerRef = useRef(null);
  const limit = 12;

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
      fetchResources(1);
      fetchBookmarks();
    }
  }, [tokenReady, user]);

  const fetchResources = async (pageNum, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingResources(true);
      }
      const res = await apiRequest(`/resources?page=${pageNum}&limit=${limit}`);
      const newResources = Array.isArray(res) ? res : (res?.data || []);
      if (append) {
        setResources(prev => [...prev, ...newResources]);
      } else {
        setResources(newResources);
      }
      setTotalResources(res?.total || 0);
      setCurrentPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoadingResources(false);
      setLoadingMore(false);
    }
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
    }).then(res => {
      showToast(res.bookmarked
        ? `"${subjectName}" added to your bookmarks archive!`
        : `"${subjectName}" removed from your bookmarks archive.`, 'success');
    }).catch(err => {
      setBookmarks(prev => wasBookmarked
        ? [...prev, { subject_name: subjectName }]
        : prev.filter(b => b.subject_name !== subjectName)
      );
      showToast(err.message || 'Failed to update bookmark.', 'error');
    });
  };

  const allCourses = useMemo(() => {
    const groups = {};
    coursesData.forEach(item => {
      if (!groups[item.courseTitle]) {
        groups[item.courseTitle] = {
          title: item.courseTitle,
          code: item.code,
          dept: item.dept,
          resourceCount: 0,
          slug: item.courseTitle.replace(/\s+/g, '-').toLowerCase()
        };
      }
    });
    resources.forEach(item => {
      const courseTitle = item.subject || item.course_code || 'General Course';
      if (!groups[courseTitle]) {
        groups[courseTitle] = {
          title: courseTitle,
          code: item.course_code || 'N/A',
          dept: getCourseDept(item.course_code, courseTitle),
          resourceCount: 0,
          slug: courseTitle.replace(/\s+/g, '-').toLowerCase()
        };
      }
      groups[courseTitle].resourceCount += 1;
    });
    return Object.values(groups)
      .filter(g => g.resourceCount > 0)
      .sort((a, b) => b.resourceCount - a.resourceCount);
  }, [resources]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return allCourses;
    const q = searchQuery.toLowerCase();
    return allCourses.filter(c => 
      c.title.toLowerCase().includes(q) || 
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.dept && c.dept.toLowerCase().includes(q))
    );
  }, [allCourses, searchQuery]);

  const hasMore = resources.length < totalResources;

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchResources(currentPage + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, loadingMore, currentPage]);

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
          {loadingResources ? (
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

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center pt-12">
              <div className="flex items-center gap-3 px-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Loading more resources...</span>
              </div>
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={observerRef} className="w-full h-4" />
        </div>
      </div>

      {/* ─── Toast ──────────────────────────────────────────────────────────── */}
      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
