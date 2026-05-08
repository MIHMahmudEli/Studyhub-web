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
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { courseList } from '@/lib/data/resourceData';

export default function ResourcesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(12);
  const observerTarget = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  const allCourses = useMemo(() => {
    const groups = {};
    courseList.forEach(item => {
      if (!groups[item.courseTitle]) {
        groups[item.courseTitle] = {
          title: item.courseTitle,
          code: item.course_code,
          dept: item.dept,
          resourceCount: 0,
          slug: item.courseTitle.replace(/\s+/g, '-').toLowerCase()
        };
      }
      groups[item.courseTitle].resourceCount += 1;
    });
    return Object.values(groups);
  }, []);

  const visibleCourses = useMemo(() => {
    return allCourses.slice(0, visibleCount);
  }, [allCourses, visibleCount]);

  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && visibleCount < allCourses.length) {
      setTimeout(() => {
        setVisibleCount(prev => prev + 12);
      }, 400);
    }
  }, [visibleCount, allCourses.length]);

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
          {/* Responsive Section Header */}
          <div className="mb-8 md:mb-12 text-center space-y-2">
            <p className="text-[8px] md:text-[9px] font-black tracking-[0.3em] md:tracking-[0.4em] text-blue-500 uppercase">Academic Repository</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none">Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Library</span></h1>
          </div>

          {/* Majestic Course Grid (Responsive Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {visibleCourses.map((course, idx) => {
              const Icon = getCourseIcon(course.title);
              return (
                <div 
                  key={course.title}
                  onClick={() => router.push(`/resources/${course.slug}`)}
                  className="group relative h-[300px] md:h-[360px] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-700 hover:-translate-y-1 md:hover:-translate-y-2 shadow-sm animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
                  style={{ animationDelay: `${(idx % 12) * 40}ms` }}
                >
                  <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-[var(--background)] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center text-blue-500 shadow-xl group-hover:scale-110 transition-all duration-700">
                    <Icon size={28} strokeWidth={1.5} className="md:w-8 md:h-8" />
                  </div>

                  {/* Responsive Content */}
                  <div className="relative z-10 text-center space-y-3">
                    <div className="space-y-2">
                      <p className="text-[7px] md:text-[7.5px] font-black tracking-[0.2em] text-blue-500/80 uppercase px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 inline-block">
                        {course.dept?.split(' ')[2] || 'FACULTY'}
                      </p>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black tracking-[0.2em] text-slate-500 uppercase">{course.code || 'CORE'}</p>
                        <h3 className="text-[11px] md:text-[12px] font-black uppercase tracking-widest leading-relaxed max-w-[180px] mx-auto group-hover:text-blue-500 transition-colors duration-500">
                          {course.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 w-full flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {course.resourceCount} Files
                      </span>
                    </div>
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                      <ArrowRight size={10} className="md:w-3 md:h-3" />
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
