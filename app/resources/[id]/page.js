'use client';

import { useEffect, useState } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  Calendar,
  ChevronLeft,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { courseList } from '@/lib/data/resourceData';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
    
    const foundCourse = courseList.find(c => c.id === parseInt(id));
    setCourse(foundCourse);
  }, [id, user, authLoading, router]);

  if (authLoading || !course) return null;

  const terms = [
    { id: 'mid', name: 'Midterm Resources', icon: Calendar, color: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/20' },
    { id: 'final', name: 'Final Resources', icon: GraduationCap, color: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20' }
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
      <DashboardNavbar />

      <div className="pt-40 px-6">
        <div className="max-w-[1000px] mx-auto">
          {/* Back Button & Header */}
          <button 
            onClick={() => router.push('/resources')}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors mb-12 group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Library</span>
          </button>

          <div className="mb-16 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{course.dept}</p>
            <h1 className="text-3xl font-black tracking-tight uppercase max-w-[700px] mx-auto">{course.courseTitle}</h1>
          </div>

          {/* Term Selection Grid (Dynamic Links) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {terms.map((term) => {
              const Icon = term.icon;
              return (
                <div 
                  key={term.id}
                  onClick={() => router.push(`/resources/${id}/${term.id}`)}
                  className={`group relative bg-gradient-to-br ${term.color} border ${term.border} rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-xl shadow-black/5 h-80`}
                >
                  <div className="w-20 h-20 rounded-3xl bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground)] mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                    <Icon size={36} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-widest group-hover:text-[var(--foreground)] transition-colors">
                    {term.name}
                  </h3>
                  <div className="mt-6 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.05] text-[9px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                    View Materials
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
