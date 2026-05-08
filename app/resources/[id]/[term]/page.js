'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  ChevronLeft,
  Download,
  ExternalLink,
  BookMarked
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { courseList } from '@/lib/data/resourceData';

export default function TermResourcesPage() {
  const { id, term } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
    
    const foundCourse = courseList.find(c => c.id === parseInt(id));
    setCourse(foundCourse);
  }, [id, user, authLoading, router]);

  const filteredResources = useMemo(() => {
    if (!course || !term) return [];
    return course.resources.filter(res => res.term === term);
  }, [course, term]);

  if (authLoading || !course) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
      <DashboardNavbar />

      <div className="pt-40 px-6">
        <div className="max-w-[1000px] mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-4 mb-12">
            <button 
              onClick={() => router.push('/resources')}
              className="text-slate-500 hover:text-blue-500 transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              Library
            </button>
            <div className="w-1 h-1 bg-slate-700 rounded-full" />
            <button 
              onClick={() => router.push(`/resources/${id}`)}
              className="text-slate-500 hover:text-blue-500 transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              Terms
            </button>
            <div className="w-1 h-1 bg-slate-700 rounded-full" />
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">
              {term === 'mid' ? 'Midterm' : 'Final'}
            </span>
          </div>

          <div className="mb-16">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{course.dept}</p>
            <h1 className="text-3xl font-black tracking-tight uppercase mb-4">{course.courseTitle}</h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">
              {term === 'mid' ? 'Midterm' : 'Final'} Session Materials
            </div>
          </div>

          {/* Resource List */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {filteredResources.length > 0 ? (
              filteredResources.map((res) => (
                <div 
                  key={res.id} 
                  className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 hover:border-blue-500/30 transition-all duration-500 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.05] flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <BookMarked size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest group-hover:text-blue-500 transition-colors">{res.title}</h4>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        <span>PDF</span>
                        <div className="w-1 h-1 bg-slate-700 rounded-full" />
                        <span>1.5 MB</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-lg active:scale-90">
                      <Download size={18} />
                    </button>
                    <button className="p-3 rounded-xl bg-white/[0.05] text-slate-500 hover:bg-white/[0.1] transition-all active:scale-90">
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-[var(--card-bg)] border border-dashed border-[var(--card-border)] rounded-[2.5rem]">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">No materials found for this term.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
