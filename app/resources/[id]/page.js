'use client';

import { useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  Calendar,
  ChevronLeft,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { courseList } from '@/lib/data/resourceData';

export default function CourseDetailPage() {
  const { id: slug } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const courseInfo = useMemo(() => {
    return courseList.find(c => c.courseTitle.replace(/\s+/g, '-').toLowerCase() === slug);
  }, [slug]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  if (authLoading || !courseInfo) return null;

  const terms = [
    { 
      id: 'mid', 
      name: 'Midterm Session', 
      desc: 'Foundation materials and lectures',
      icon: Calendar, 
      color: 'from-blue-600/20 via-blue-500/5 to-transparent', 
      accent: 'text-blue-500',
      border: 'border-blue-500/20 dark:border-blue-500/20' 
    },
    { 
      id: 'final', 
      name: 'Final Session', 
      desc: 'Advanced modules and preparation',
      icon: GraduationCap, 
      color: 'from-purple-600/20 via-purple-500/5 to-transparent', 
      accent: 'text-purple-500',
      border: 'border-purple-500/20 dark:border-purple-500/20' 
    }
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-32 px-8">
        <div className="max-w-[1000px] mx-auto">
          {/* Back Navigation */}
          <button 
            onClick={() => router.push('/resources')}
            className="flex items-center gap-3 text-slate-500 hover:text-blue-500 transition-all mb-8 group"
          >
            <div className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/[0.05] flex items-center justify-center group-hover:border-blue-500/30">
              <ChevronLeft size={14} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Library</span>
          </button>

          {/* Header Section */}
          <div className="mb-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
                {courseInfo.course_code || 'Academic Path'}
              </p>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-[1.1] max-w-[700px]">
              {courseInfo.courseTitle}
            </h1>
          </div>

          {/* Majestic Term Selection (Light Mode Optimized) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {terms.map((term, idx) => {
              const Icon = term.icon;
              return (
                <div 
                  key={term.id}
                  onClick={() => router.push(`/resources/${slug}/${term.id}`)}
                  className={`group relative h-[380px] bg-slate-50/50 dark:bg-gradient-to-br ${term.color} border border-slate-200 dark:border-white/[0.05] rounded-[3rem] p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-2 transition-all duration-700 shadow-sm hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/40 animate-in fade-in slide-in-from-bottom-8 fill-mode-both`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`relative w-24 h-24 rounded-[2.5rem] bg-white dark:bg-[var(--background)] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center ${term.accent} mb-8 group-hover:scale-110 transition-all duration-700 shadow-xl group-hover:border-current/20`}>
                    <Icon size={40} strokeWidth={1.5} />
                    <Sparkles className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700" size={16} />
                  </div>

                  <div className="space-y-3 relative z-10">
                    <h3 className="text-xl font-black uppercase tracking-[0.1em] group-hover:text-blue-500 dark:group-hover:text-white transition-colors duration-500">
                      {term.name}
                    </h3>
                    <p className="text-[9px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed max-w-[180px] mx-auto opacity-70">
                      {term.desc}
                    </p>
                  </div>

                  <div className="mt-10 px-5 py-2 rounded-full bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] text-[8px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-3 transition-all duration-700">
                    Access Repository
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
