'use client';

import { useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  BookOpen,
  ArrowRight,
  Cpu,
  Globe,
  Database,
  Code2,
  Network
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { courseList } from '@/lib/data/resourceData';

export default function ResourcesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  const uniqueCourses = useMemo(() => {
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
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20">
      <DashboardNavbar />

      <div className="pt-32 px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Compact Section Header */}
          <div className="mb-12 text-center space-y-2">
            <p className="text-[9px] font-black tracking-[0.4em] text-blue-500 uppercase">Academic Repository</p>
            <h1 className="text-4xl font-black tracking-tight uppercase leading-none">Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Library</span></h1>
          </div>

          {/* Majestic Course Grid (Compact Gaps) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {uniqueCourses.map((course, idx) => {
              const Icon = getCourseIcon(course.title);
              return (
                <div 
                  key={course.title}
                  onClick={() => router.push(`/resources/${course.slug}`)}
                  className="group relative h-[340px] bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 flex flex-col items-center justify-between cursor-pointer hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-700 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Floating Icon Container */}
                  <div className="relative z-10 w-20 h-20 rounded-[2rem] bg-[var(--background)] border border-white/[0.05] flex items-center justify-center text-blue-500 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    <Icon size={32} strokeWidth={1.5} />
                  </div>

                  {/* Course Content */}
                  <div className="relative z-10 text-center space-y-3">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black tracking-[0.2em] text-slate-500 uppercase">{course.code || 'CORE'}</p>
                      <h3 className="text-[12px] font-black uppercase tracking-widest leading-relaxed max-w-[180px] mx-auto group-hover:text-blue-500 transition-colors duration-500">
                        {course.title}
                      </h3>
                    </div>
                  </div>

                  {/* Footer Action (Tighter) */}
                  <div className="relative z-10 w-full flex items-center justify-between pt-5 border-t border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {course.resourceCount} Files
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
