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
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32">
      <DashboardNavbar />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="pt-48 px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Section Header */}
          <div className="mb-20 text-center space-y-4">
            <p className="text-[10px] font-black tracking-[0.4em] text-blue-500 uppercase">Academic Repository</p>
            <h1 className="text-5xl font-black tracking-tight uppercase leading-none">Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Library</span></h1>
          </div>

          {/* Majestic Course Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {uniqueCourses.map((course, idx) => {
              const Icon = getCourseIcon(course.title);
              return (
                <div 
                  key={course.title}
                  onClick={() => router.push(`/resources/${course.slug}`)}
                  className="group relative h-[380px] bg-white/[0.02] border border-white/[0.05] rounded-[3rem] p-10 flex flex-col items-center justify-between cursor-pointer hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-700 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-12 fill-mode-both"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Glass Reflection Effect */}
                  <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Floating Icon Container */}
                  <div className="relative z-10 w-24 h-24 rounded-[2.5rem] bg-[var(--background)] border border-white/[0.05] flex items-center justify-center text-blue-500 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 group-hover:shadow-blue-500/20 group-hover:border-blue-500/20">
                    <Icon size={40} strokeWidth={1.5} />
                    
                    {/* Pulsing Aura */}
                    <div className="absolute inset-0 rounded-[2.5rem] bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>

                  {/* Course Content */}
                  <div className="relative z-10 text-center space-y-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase">{course.code || 'CORE'}</p>
                      <h3 className="text-sm font-black uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto group-hover:text-blue-500 transition-colors duration-500">
                        {course.title}
                      </h3>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-[1px] w-8 bg-white/[0.1] group-hover:w-16 group-hover:bg-blue-500/50 transition-all duration-700" />
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] opacity-60">
                        {course.dept?.split(' ')[2] || 'TECHNOLOGY'}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="relative z-10 w-full flex items-center justify-between pt-6 border-t border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {course.resourceCount} Files
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
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
