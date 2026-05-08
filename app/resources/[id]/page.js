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
      fullName: 'Midterm Session Resources',
      desc: 'Access essential lecture notes, question banks, and foundation materials.',
      icon: Calendar, 
      color: 'from-blue-600/10 via-blue-500/5 to-transparent',
      hoverColor: 'group-hover:from-blue-600/20 group-hover:via-blue-500/10',
      accent: 'text-blue-500',
      bgIcon: 'bg-blue-500/10',
      border: 'border-blue-500/20 dark:border-blue-500/30' 
    },
    { 
      id: 'final', 
      name: 'Final', 
      fullName: 'Final Session Resources',
      desc: 'Master advanced modules with comprehensive guides and exam preparation files.',
      icon: GraduationCap, 
      color: 'from-purple-600/10 via-purple-500/5 to-transparent', 
      hoverColor: 'group-hover:from-purple-600/20 group-hover:via-purple-500/10',
      accent: 'text-purple-500',
      bgIcon: 'bg-purple-500/10',
      border: 'border-purple-500/20 dark:border-purple-500/30' 
    }
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-32 px-8">
        <div className="max-w-[1100px] mx-auto">
          {/* Back Navigation */}
          <button 
            onClick={() => router.push('/resources')}
            className="flex items-center gap-3 text-slate-500 hover:text-blue-500 transition-all mb-10 group"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/[0.1] flex items-center justify-center group-hover:border-blue-500/50 transition-colors shadow-sm">
              <ChevronLeft size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Library</span>
          </button>

          {/* Header Section */}
          <div className="mb-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] animate-pulse" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">
                {courseInfo.course_code || 'COURSE MODULE'}
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-[1.1] max-w-[850px] drop-shadow-sm">
              {courseInfo.courseTitle}
            </h1>
          </div>

          {/* Majestic Term Selection (High Contrast Redesign) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {terms.map((term, idx) => {
              const Icon = term.icon;
              return (
                <div 
                  key={term.id}
                  onClick={() => router.push(`/resources/${slug}/${term.id}`)}
                  className={`group relative h-[420px] bg-white dark:bg-white/[0.03] border-2 ${term.border} rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-3 transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-2xl animate-in fade-in slide-in-from-bottom-12 fill-mode-both overflow-hidden`}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  {/* Vibrant Background Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${term.color} ${term.hoverColor} transition-all duration-700`} />
                  
                  {/* Decorative Luminous Glow */}
                  <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${term.id === 'mid' ? 'bg-blue-500/5' : 'bg-purple-500/5'} blur-[100px] group-hover:scale-150 transition-transform duration-1000`} />

                  <div className="relative z-10 flex flex-col items-center w-full">
                    {/* Centered Majestic Icon */}
                    <div className={`relative w-28 h-28 rounded-[3.2rem] bg-white dark:bg-[var(--background)] border-2 ${term.border} flex items-center justify-center ${term.accent} mb-10 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                      <Icon size={48} strokeWidth={1.5} />
                      <Sparkles className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" size={20} />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-3xl font-black uppercase tracking-[0.05em] text-[var(--foreground)] group-hover:scale-105 transition-transform duration-500">
                        {term.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-[240px] mx-auto opacity-80 group-hover:opacity-100 transition-opacity">
                        {term.desc}
                      </p>
                    </div>

                    {/* Compact Classic Action Footer */}
                    <div className="mt-12 flex items-center gap-3 px-6 py-2.5 rounded-full bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] shadow-sm group-hover:bg-blue-500 group-hover:border-blue-400 group-hover:text-white transition-all duration-500">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em]">Explore Session</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
