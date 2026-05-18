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
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import coursesData from '@/lib/data/courses.json';
import Toast from '@/components/ui/Toast';
import Skeleton from '@/components/ui/Skeleton';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminPanel from '@/components/admin/AdminPanel';
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

export default function AdminResourcesCatalogPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const observerTarget = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  };
  
  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

  // Auth/Role verification (Admin or Moderator only)
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (user.role !== 'admin' && user.role !== 'moderator') {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchResources();
    }
  }, [user]);

  const fetchResources = async () => {
    try {
      setLoadingResources(true);
      const data = await apiRequest('/resources');
      setResources(data || []);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      showToast(err.message || 'Failed to load library resources.', 'error');
    } finally {
      setLoadingResources(false);
    }
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

  const visibleCourses = useMemo(() => filteredCourses.slice(0, visibleCount), [filteredCourses, visibleCount]);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 12, filteredCourses.length));
  }, [filteredCourses.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
  }, [loadMore]);

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">
          
          {/* Reusable Admin Header configured for Resources Management */}
          <AdminHeader
            backHref="/admin/dashboard"
            backText="Back to Panel"
            title="Library"
            titleHighlight="Resources"
            titleHighlightGradient="from-emerald-500 via-teal-500 to-cyan-500"
            description="Inspect, modify, delete, and control academic resources available across all course catalogs."
            glowColor="bg-emerald-500/10"
            statsIcon={Layers}
            statsTitle="Active Library Assets"
            statsValue={`${resources.length} Uploaded Files`}
            statsColorClass="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          />

          {/* Reusable Admin Panel Container */}
          <AdminPanel
            panelIcon={Sparkles}
            panelIconClass="text-emerald-500"
            panelTitle="Course Resource Catalogues"
            panelSubtitle="Select a course to moderate mid or final term materials."
            badgeText={`Unique Courses: ${allCourses.length}`}
            badgeColorClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            loading={loadingResources}
            isEmpty={allCourses.length === 0}
            emptyIcon={BookOpen}
            emptyTitle="No Course Resources Found"
            emptyDescription="There are currently no active academic resources uploaded."
            panelActions={
              <SearchInput
                placeholder="SEARCH COURSE DIRECTORY..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(12); }}
                focusBorderClass="focus:border-emerald-500/30"
                widthClass="w-full md:w-[280px]"
              />
            }
          >
            {/* Grid of Dynamic Course Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-2">
              {visibleCourses.map((course, idx) => {
                const Icon = getCourseIcon(course.title);
                return (
                  <CourseCard
                    key={course.title}
                    course={course}
                    icon={Icon}
                    animationDelay={(idx % 12) * 30}
                    onClick={() => router.push(`/admin/resources/${course.slug}`)}
                    footerLeftText={`${course.resourceCount} Moderate Files`}
                    badgeLabel={getCourseDept(course.code, course.title)}
                  />
                );
              })}
            </div>

            {/* Infinite Scroll Indicator */}
            <div ref={observerTarget} className="w-full flex items-center justify-center pt-8">
              {visibleCount < filteredCourses.length && (
                <Loader2 size={20} className="animate-spin text-emerald-500" />
              )}
            </div>
          </AdminPanel>

        </div>
      </div>

      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
