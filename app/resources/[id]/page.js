'use client';

import { useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  Calendar,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  ArrowRight
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
      name: 'Midterm', 
      desc: 'Lecture notes & foundation materials.',
      icon: Calendar, 
      color: 'from-blue-600/10 via-blue-500/5 to-transparent',
      hoverColor: 'group-hover:from-blue-600/20',
      accent: 'text-blue-500',
      border: 'border-blue-500/20 dark:border-blue-500/30' 
    },
    { 
      id: 'final', 
      name: 'Final', 
      desc: 'Advanced modules & exam preparation.',
      icon: GraduationCap, 
      color: 'from-purple-600/10 via-purple-500/5 to-transparent', 
      hoverColor: 'group-hover:from-purple-600/20',
      accent: 'text-purple-500',
      border: 'border-purple-500/20 dark:border-purple-500/30' 
    }
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-32 px-8">
        <div className="max-w-[1000px] mx-auto">
          {/* Compact Back Navigation */}
          <button 
            onClick={() => router.push('/resources')}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-all mb-8 group"
          >
            <div className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/[0.1] flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
              <ChevronLeft size={14} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Library</span>
          </button>

          {/* Compact Header Section */}
          <div className="mb-10 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
                {courseInfo.course_code || 'MODULE'}
              </p>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none max-w-[800px]">
              {courseInfo.courseTitle}
            </h1>
          </div>

          {/* Compact Standard Term Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {terms.map((term, idx) => {
              const Icon = term.icon;
              return (
                <div 
                  key={term.id}
                  onClick={() => router.push(`/resources/${slug}/${term.id}`)}
                  className={`group relative h-[280px] bg-white dark:bg-white/[0.03] border-2 ${term.border} rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-2 transition-all duration-700 shadow-sm hover:shadow-xl animate-in fade-in slide-in-from-bottom-8 fill-mode-both overflow-hidden`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${term.color} ${term.hoverColor} transition-all duration-700`} />
                  
                  <div className="relative z-10 flex flex-col items-center w-full">
                    {/* Compact Icon */}
                    <div className={`relative w-20 h-20 rounded-[2rem] bg-white dark:bg-[var(--background)] border-2 ${term.border} flex items-center justify-center ${term.accent} mb-6 shadow-xl group-hover:scale-110 transition-all duration-700`}>
                      <Icon size={32} strokeWidth={1.5} />
                      <Sparkles className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--foreground)]">
                        {term.name}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto opacity-70">
                        {term.desc}
                      </p>
                    </div>

                    {/* Compact Action Footer */}
                    <div className="mt-8 flex items-center gap-2 px-5 py-2 rounded-full bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                      <span className="text-[8px] font-black uppercase tracking-[0.3em]">Access Files</span>
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
