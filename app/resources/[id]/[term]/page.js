'use client';

import { useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  ChevronLeft,
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
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20">
      <DashboardNavbar />

      <div className="pt-32 px-8">
        <div className="max-w-[1100px] mx-auto">
          {/* Compact Breadcrumbs */}
          <nav className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
            <button 
              onClick={() => router.push('/resources')}
              className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-blue-500 transition-colors"
            >
              Library
            </button>
            <div className="w-1 h-1 bg-slate-800 rounded-full" />
            <button 
              onClick={() => router.push(`/resources/${slug}`)}
              className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-blue-500 transition-colors"
            >
              {courseInfo.course_code || 'Course'}
            </button>
            <div className="w-1 h-1 bg-slate-800 rounded-full" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">
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
                <div className={`px-4 py-1 rounded-full border ${term === 'mid' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-purple-500/10 border-purple-500/20 text-purple-500'} text-[8px] font-black uppercase tracking-[0.3em]`}>
                  {term === 'mid' ? 'Midterm Session' : 'Final Session'}
                </div>
                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">
                  <HardDrive size={10} />
                  {filteredResources.length} Files
                </div>
              </div>
            </div>
          </div>

          {/* Compact Luxury Resource List */}
          <div className="space-y-3">
            {filteredResources.length > 0 ? (
              filteredResources.map((res, idx) => (
                <div 
                  key={res.id} 
                  className="group relative bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] p-6 hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.05] flex items-center justify-center text-blue-500 shadow-lg">
                      <FileText size={20} />
                    </div>
                    
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-black uppercase tracking-wider group-hover:text-blue-500 transition-colors leading-relaxed max-w-[500px]">
                        {res.title}
                      </h4>
                      <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-widest text-slate-500">
                        <span>{res.file_type || 'PDF'}</span>
                        <div className="w-1 h-1 bg-slate-800 rounded-full" />
                        <span>{res.downloads || 0} DL</span>
                        <div className="w-1 h-1 bg-slate-800 rounded-full" />
                        <span>{res.created_at?.split(' ')[0] || 'RECENT'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-lg active:scale-95 group/btn">
                      <Download size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Download</span>
                    </button>
                    <button className="p-2.5 rounded-xl bg-white/[0.05] text-slate-500 hover:bg-white/[0.1] transition-all">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.01] border border-dashed border-white/[0.05] rounded-[2rem]">
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em]">No archived materials found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
