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
      desc: 'First phase academic materials and lectures',
      icon: Calendar, 
      color: 'from-blue-600/20 via-blue-500/5 to-transparent', 
      accent: 'text-blue-500',
      border: 'border-blue-500/20' 
    },
    { 
      id: 'final', 
      name: 'Final Session', 
      desc: 'Advanced modules and final exam preparation',
      icon: GraduationCap, 
      color: 'from-purple-600/20 via-purple-500/5 to-transparent', 
      accent: 'text-purple-500',
      border: 'border-purple-500/20' 
    }
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32">
      <DashboardNavbar />

      <div className="pt-48 px-8">
        <div className="max-w-[1100px] mx-auto">
          {/* Back Navigation */}
          <button 
            onClick={() => router.push('/resources')}
            className="flex items-center gap-3 text-slate-500 hover:text-blue-500 transition-all mb-16 group"
          >
            <div className="w-8 h-8 rounded-full border border-white/[0.05] flex items-center justify-center group-hover:border-blue-500/30 transition-colors">
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Library</span>
          </button>

          {/* Header Section */}
          <div className="mb-24 space-y-6">
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                {courseInfo.course_code || 'Academic Path'}
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-[1.1] max-w-[800px] animate-in fade-in slide-in-from-left-6 duration-700 delay-75">
              {courseInfo.courseTitle}
            </h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] max-w-[500px] leading-relaxed animate-in fade-in slide-in-from-left-8 duration-700 delay-150">
              Explore meticulously organized resources tailored for your academic success in this module.
            </p>
          </div>

          {/* Majestic Term Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {terms.map((term, idx) => {
              const Icon = term.icon;
              return (
                <div 
                  key={term.id}
                  onClick={() => router.push(`/resources/${slug}/${term.id}`)}
                  className={`group relative h-[450px] bg-gradient-to-br ${term.color} border ${term.border} rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-3 transition-all duration-700 shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-bottom-12 fill-mode-both`}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  {/* Glowing Icon Base */}
                  <div className={`relative w-28 h-28 rounded-[3rem] bg-[var(--background)] border border-white/[0.05] flex items-center justify-center ${term.accent} mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-2xl group-hover:shadow-${term.id === 'mid' ? 'blue' : 'purple'}-500/20`}>
                    <Icon size={48} strokeWidth={1.5} />
                    <Sparkles className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" size={20} />
                  </div>

                  <div className="space-y-4 relative z-10">
                    <h3 className="text-2xl font-black uppercase tracking-[0.1em] group-hover:text-white transition-colors duration-500">
                      {term.name}
                    </h3>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto opacity-60 group-hover:opacity-100 transition-opacity">
                      {term.desc}
                    </p>
                  </div>

                  {/* Aesthetic Call to Action */}
                  <div className="mt-12 px-6 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-[9px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 transition-all duration-700">
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
