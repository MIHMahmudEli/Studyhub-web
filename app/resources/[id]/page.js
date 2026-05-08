'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  Calendar,
  ChevronLeft,
  GraduationCap,
  Download,
  ExternalLink,
  BookMarked,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { courseList } from '@/lib/data/resourceData';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null); // 'mid' or 'final'

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
    
    const foundCourse = courseList.find(c => c.id === parseInt(id));
    setCourse(foundCourse);
  }, [id, user, authLoading, router]);

  const filteredResources = useMemo(() => {
    if (!course || !selectedTerm) return [];
    return course.resources.filter(res => res.term === selectedTerm);
  }, [course, selectedTerm]);

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
          {/* Back Buttons */}
          <div className="flex items-center gap-4 mb-12">
            <button 
              onClick={() => router.push('/resources')}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors group"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Library</span>
            </button>
            {selectedTerm && (
              <>
                <div className="w-1 h-1 bg-slate-700 rounded-full" />
                <button 
                  onClick={() => setSelectedTerm(null)}
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors group"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">Terms</span>
                </button>
              </>
            )}
          </div>

          <div className="mb-16 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{course.dept}</p>
            <h1 className="text-3xl font-black tracking-tight uppercase max-w-[700px] mx-auto mb-2">{course.courseTitle}</h1>
            {selectedTerm && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in zoom-in duration-500">
                {selectedTerm === 'mid' ? 'Midterm' : 'Final'} Session
              </div>
            )}
          </div>

          {!selectedTerm ? (
            /* Term Selection Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {terms.map((term) => {
                const Icon = term.icon;
                return (
                  <div 
                    key={term.id}
                    onClick={() => setSelectedTerm(term.id)}
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
          ) : (
            /* Filtered Resource List */
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {filteredResources.length > 0 ? (
                filteredResources.map((res) => (
                  <div 
                    key={res.id} 
                    className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 hover:border-blue-500/30 transition-all duration-500 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.05] flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                        <BookMarked size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-widest group-hover:text-blue-500 transition-colors">{res.title}</h4>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          <span>{res.type || 'PDF'}</span>
                          <div className="w-1 h-1 bg-slate-700 rounded-full" />
                          <span>{res.size || '1.5 MB'}</span>
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
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">No materials uploaded for this term yet.</p>
                </div>
              )}

              <button 
                onClick={() => setSelectedTerm(null)}
                className="w-full py-6 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-500 transition-colors mt-8"
              >
                <ArrowLeft size={14} /> Back to Terms
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
