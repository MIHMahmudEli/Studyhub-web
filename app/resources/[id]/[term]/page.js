'use client';

import { useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  Download,
  ExternalLink,
  FileText,
  Clock,
  HardDrive,
  Eye
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { courseList } from '@/lib/data/resourceData';

export default function TermResourcesPage() {
  const { id: slug, term } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  const { courseInfo, filteredResources } = useMemo(() => {
    const resources = courseList.filter(item => 
      item.courseTitle.replace(/\s+/g, '-').toLowerCase() === slug &&
      item.term.toLowerCase() === term.toLowerCase()
    );
    
    return {
      courseInfo: resources[0] || courseList.find(c => c.courseTitle.replace(/\s+/g, '-').toLowerCase() === slug),
      filteredResources: resources
    };
  }, [slug, term]);

  if (authLoading || !courseInfo) return null;

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#02040a] text-[var(--foreground)] pb-20 transition-all duration-700 relative overflow-hidden">
      <DashboardNavbar />

      {/* Nebula Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden dark:block">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-600/10 blur-[130px] rounded-full animate-pulse duration-[5000ms]" />
      </div>

      <div className="pt-32 px-8 relative z-10">
        <div className="max-w-[1100px] mx-auto">
          {/* Compact Breadcrumbs */}
          <nav className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
            <button 
              onClick={() => router.push('/resources')}
              className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-400 transition-colors"
            >
              Library
            </button>
            <div className="w-1 h-1 bg-slate-300 dark:bg-indigo-900 rounded-full" />
            <button 
              onClick={() => router.push(`/resources/${slug}`)}
              className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-400 transition-colors"
            >
              {courseInfo.course_code || 'Course'}
            </button>
            <div className="w-1 h-1 bg-slate-300 dark:bg-indigo-900 rounded-full" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">
              {term === 'mid' ? 'Midterm' : 'Final'}
            </span>
          </nav>

          {/* Compact Header Section */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-[1] max-w-[700px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                {courseInfo.courseTitle}
              </h1>
              <div className="flex items-center gap-4">
                <div className={`px-4 py-1 rounded-full border ${term === 'mid' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'} text-[8px] font-black uppercase tracking-[0.3em]`}>
                  {term === 'mid' ? 'Midterm Sector' : 'Final Sector'}
                </div>
                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
                  <HardDrive size={10} />
                  {filteredResources.length} Star-Locked Files
                </div>
              </div>
            </div>
          </div>

          {/* Nebula Glass Resource List */}
          <div className="space-y-3">
            {filteredResources.length > 0 ? (
              filteredResources.map((res, idx) => (
                <div 
                  key={res.id} 
                  className="group relative bg-white/80 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-[1.5rem] p-6 hover:bg-white dark:hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-500/5 animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#020617] border border-slate-200 dark:border-white/[0.1] flex items-center justify-center text-indigo-400 shadow-sm">
                      <FileText size={20} />
                    </div>
                    
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-black uppercase tracking-wider group-hover:text-indigo-400 transition-colors leading-relaxed max-w-[500px]">
                        {res.title}
                      </h4>
                      <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-widest text-slate-400">
                        <span>{res.file_type || 'PDF'}</span>
                        <div className="w-1 h-1 bg-slate-300 dark:bg-indigo-900 rounded-full" />
                        <span>{res.downloads || 0} BEAMS</span>
                        <div className="w-1 h-1 bg-slate-300 dark:bg-indigo-900 rounded-full" />
                        <span>{res.created_at?.split(' ')[0] || 'RECENT'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg active:scale-95 group/btn">
                      <Download size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white">Extract</span>
                    </button>
                    <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-500 hover:text-white hover:bg-white/[0.1] transition-all">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white/40 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/[0.05] rounded-[2rem]">
                <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.4em]">No archived modules in this sector.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
