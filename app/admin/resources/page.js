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
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import Toast from '@/components/ui/Toast';
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

const getCourseSlug = (title) => title.replace(/\s+/g, '-').toLowerCase();

export default function AdminResourcesCatalogPage() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const [permOk, setPermOk] = useState(null);
  const observerRef = useRef(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    if (!tokenReady || !user) return;
    if (user.role === 'admin') { setPermOk(true); return; }
    apiRequest('/admin/permissions').then(data => {
      const perm = Array.isArray(data) ? data.find(p => p.key === 'perm_view_resources') : null;
      if (perm?.value === 'admin+moderator') { setPermOk(true); }
      else { router.push('/admin/dashboard'); }
    }).catch(() => router.push('/admin/dashboard'));
  }, [tokenReady, user, router]);

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
        showToast(err.message || 'Failed to load courses.', 'error');
      })
      .finally(() => {
        setInitialLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      });
  };

  useEffect(() => {
    if (tokenReady && user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchCourses(1);
    }
  }, [tokenReady, user]);

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

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) return null;
  if (!permOk) return null;

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
            statsValue={`${totalCourses} Total Courses`}
            statsColorClass="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          />

          {/* Reusable Admin Panel Container */}
          <AdminPanel
            panelIcon={Sparkles}
            panelIconClass="text-emerald-500"
            panelTitle="Course Resource Catalogues"
            panelSubtitle="Select a course to moderate mid or final term materials."
            badgeText={`Unique Courses: ${totalCourses}`}
            badgeColorClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            loading={initialLoading}
            isEmpty={courses.length === 0 && !initialLoading}
            emptyIcon={BookOpen}
            emptyTitle="No Course Resources Found"
            emptyDescription="There are currently no active academic resources uploaded."
            panelActions={
              <SearchInput
                placeholder="SEARCH COURSE DIRECTORY..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); }}
                focusBorderClass="focus:border-emerald-500/30"
                widthClass="w-full md:w-[280px]"
              />
            }
          >
            {/* Grid of Dynamic Course Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-2">
              {filteredCourses.map((course, idx) => {
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

            {/* Infinite Scroll Sentinel — hidden while search is active */}
            {hasMoreCourses && !searchQuery && (
              <div ref={observerRef} className="w-full h-4 mt-8" />
            )}
            {loadingMore && (
              <div className="flex justify-center mt-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            )}
          </AdminPanel>

        </div>
      </div>

      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
