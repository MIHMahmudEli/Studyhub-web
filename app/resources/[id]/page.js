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
      desc: 'First phase academic materials and stellar foundation guides.',
      icon: Calendar, 
      color: 'from-blue-600/20 via-indigo-500/10 to-transparent',
      hoverColor: 'group-hover:from-blue-600/30 group-hover:via-indigo-500/15',
      accent: 'text-blue-400',
      border: 'border-blue-500/30' 
    },
    { 
      id: 'final', 
      name: 'Final', 
      desc: 'Advanced cosmic modules and final examination preparation.',
      icon: GraduationCap, 
      color: 'from-purple-600/20 via-indigo-500/10 to-transparent', 
      hoverColor: 'group-hover:from-purple-600/30 group-hover:via-indigo-500/15',
      accent: 'text-purple-400',
      border: 'border-purple-500/30' 
    }
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#02040a] text-[var(--foreground)] pb-20 transition-all duration-700 relative overflow-hidden">
      <DashboardNavbar />

      {/* Nebula Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden dark:block">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-600/10 blur-[130px] rounded-full animate-pulse duration-[5000ms]" />
      </div>

      <div className="pt-32 px-8 relative z-10">
        <div className="max-w-[1000px] mx-auto">
          <button 
            onClick={() => router.push('/resources')}
            className="flex items-center gap-3 text-slate-500 hover:text-indigo-400 transition-all mb-10 group"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/[0.1] flex items-center justify-center group-hover:border-indigo-500/50 transition-colors shadow-sm">
              <ChevronLeft size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Star Map</span>
          </button>

          <div className="mb-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">
                {courseInfo.course_code || 'GALAXY MODULE'}
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-[1.1] max-w-[850px] drop-shadow-sm">
              {courseInfo.courseTitle}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {terms.map((term, idx) => {
              const Icon = term.icon;
              return (
                <div 
                  key={term.id}
                  onClick={() => router.push(`/resources/${slug}/${term.id}`)}
                  className={`group relative h-[420px] bg-white/80 dark:bg-white/[0.04] backdrop-blur-md border-2 ${term.border} rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-3 transition-all duration-700 shadow-xl animate-in fade-in slide-in-from-bottom-12 fill-mode-both overflow-hidden`}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${term.color} ${term.hoverColor} transition-all duration-700`} />
                  
                  <div className={`relative w-28 h-28 rounded-[3.2rem] bg-white dark:bg-[#020617] border-2 ${term.border} flex items-center justify-center ${term.accent} mb-10 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                    <Icon size={48} strokeWidth={1.5} />
                    <Sparkles className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" size={20} />
                  </div>

                  <div className="space-y-4 relative z-10">
                    <h3 className="text-3xl font-black uppercase tracking-[0.05em] text-[var(--foreground)] group-hover:text-indigo-400 dark:group-hover:text-white transition-colors duration-500">
                      {term.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-[240px] mx-auto opacity-80">
                      {term.desc}
                    </p>
                  </div>

                  <div className="mt-12 flex items-center gap-3 px-6 py-2.5 rounded-full bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Access Sector</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
