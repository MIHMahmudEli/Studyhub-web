'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  BookOpen,
  ArrowRight,
  Cpu,
  Globe,
  Database,
  Code2,
  Network,
  Loader2,
  Search,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import coursesData from '@/lib/data/courses.json';

export default function ResourcesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const observerTarget = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
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
    } finally {
      setLoadingResources(false);
    }
  };

  const getCourseDept = (code, title) => {
    if (!code) return 'CSE';
    const c = code.toUpperCase();
    if (c.startsWith('CSC') || c.startsWith('COE') || c.startsWith('CSE')) {
      const t = title.toLowerCase();
      if (t.includes('network') || t.includes('architecture') || t.includes('organization') || t.includes('hardware')) {
        return 'CoE';
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

  const allCourses = useMemo(() => {
    const groups = {};

    // 1. Initialize with courses from courses.json
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

    // 2. Count real resources from database
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

    // 3. Sort so courses with resources appear first
    return Object.values(groups).sort((a, b) => b.resourceCount - a.resourceCount);
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

  const visibleCourses = useMemo(() => {
    return filteredCourses.slice(0, visibleCount);
  }, [filteredCourses, visibleCount]);

  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && visibleCount < filteredCourses.length) {
      setTimeout(() => {
        setVisibleCount(prev => prev + 12);
      }, 400);
    }
  }, [visibleCount, filteredCourses.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  const getCourseIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('network')) return Network;
    if (t.includes('compiler') || t.includes('software')) return Code2;
    if (t.includes('intelligence') || t.includes('machine')) return Cpu;
    if (t.includes('web')) return Globe;
    if (t.includes('data')) return Database;
    return BookOpen;
  };


  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Majestic Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
            <div className="space-y-4 relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full -z-10" />
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[9px] font-black uppercase tracking-[0.3em]">
                <BookOpen size={12} strokeWidth={3} /> Academic Repository
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Library</span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest max-w-[500px]">
                Explore your faculty's complete collection of lectures, notes, and previous term materials.
              </p>
            </div>

            {/* Premium Search */}
            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH RESOURCES..."
                className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-blue-500/30 transition-all shadow-xl"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(12); // Reset infinite scroll on search
                }}
              />
            </div>
          </div>

          {/* Majestic Course Grid (Responsive Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {visibleCourses.map((course, idx) => {
              const Icon = getCourseIcon(course.title);
              return (
                <div 
                  key={course.title}
                  onClick={() => router.push(`/resources/${course.slug}`)}
                  className="group relative h-[280px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 flex flex-col items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-700 hover:-translate-y-1 shadow-sm animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
                  style={{ animationDelay: `${(idx % 12) * 40}ms` }}
                >
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Centered Majestic Icon */}
                  <div className="relative z-10 w-12 h-12 rounded-[1.2rem] bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-blue-500 shadow-md group-hover:scale-105 transition-all duration-700">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>

                  {/* Responsive Content */}
                  <div className="relative z-10 text-center space-y-2 w-full">
                    <div className="space-y-1">
                      <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest leading-relaxed max-w-[180px] mx-auto group-hover:text-blue-500 transition-colors duration-500 line-clamp-2">
                        {course.title}
                      </h3>
                      <div className="space-y-1 pt-1">
                        <p className="text-[7.5px] font-black tracking-[0.2em] text-slate-500 uppercase">
                          {course.code || 'CORE'}
                        </p>
                        <p className="text-[6.5px] font-black tracking-[0.15em] text-blue-500/80 uppercase px-2 py-0.5 rounded-full bg-blue-500/5 border border-blue-500/10 inline-block">
                          {getCourseDept(course.code, course.title)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 w-full flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        {course.resourceCount} Files
                      </span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                      <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div ref={observerTarget} className="w-full flex flex-col items-center justify-center pt-12 md:pt-16 gap-4">
            {visibleCount < allCourses.length && (
              <Loader2 size={18} className="animate-spin text-blue-500" />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
