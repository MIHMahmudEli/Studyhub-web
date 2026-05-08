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
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#02040a] text-[var(--foreground)] pb-20 transition-all duration-700 relative overflow-hidden">
      <DashboardNavbar />

      {/* Nebula Cosmic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden dark:block">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 blur-[130px] rounded-full animate-pulse duration-[5000ms]" />
        <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full" />
        
        {/* Distant Stars Texture */}
        <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
      </div>

      <div className="pt-32 px-8 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-12 text-center space-y-2">
            <p className="text-[9px] font-black tracking-[0.4em] text-blue-500 uppercase">Cosmic Repository</p>
            <h1 className="text-4xl font-black tracking-tight uppercase leading-none">Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Library</span></h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleCourses.map((course, idx) => {
              const Icon = getCourseIcon(course.title);
              return (
                <div 
                  key={course.title}
                  onClick={() => router.push(`/resources/${course.slug}`)}
                  className="group relative h-[360px] bg-white/80 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-[2.5rem] p-8 flex flex-col items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-white/[0.06] hover:border-blue-500/30 transition-all duration-700 hover:-translate-y-2 shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-500/10 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                  style={{ animationDelay: `${(idx % 12) * 40}ms` }}
                >
                  {/* Internal Nebula Glow on Hover */}
                  <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/[0.05] via-purple-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative z-10 w-20 h-20 rounded-[2rem] bg-white dark:bg-[#020617] border border-slate-200 dark:border-white/[0.1] flex items-center justify-center text-blue-400 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 group-hover:border-blue-400/30">
                    <Icon size={32} strokeWidth={1.5} />
                  </div>

                  <div className="relative z-10 text-center space-y-4">
                    <div className="space-y-2">
                      <p className="text-[7.5px] font-black tracking-[0.25em] text-indigo-400 uppercase px-4 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10 inline-block">
                        {course.dept || 'UNIVERSITY RESOURCE'}
                      </p>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black tracking-[0.2em] text-slate-500 uppercase">{course.code || 'CORE'}</p>
                        <h3 className="text-[12px] font-black uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto group-hover:text-indigo-400 transition-colors duration-500">
                          {course.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 w-full flex items-center justify-between pt-5 border-t border-slate-100 dark:border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {course.resourceCount} Files
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div ref={observerTarget} className="w-full flex flex-col items-center justify-center pt-16 gap-4">
            {visibleCount < allCourses.length && (
              <>
                <Loader2 size={20} className="animate-spin text-indigo-500" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Decrypting Star Charts...</p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
