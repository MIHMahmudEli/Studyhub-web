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
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32">
      <DashboardNavbar />

      <div className="pt-48 px-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Majestic Breadcrumbs */}
          <nav className="flex items-center gap-6 mb-20 animate-in fade-in slide-in-from-left-4 duration-700">
            <button 
              onClick={() => router.push('/resources')}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-blue-500 transition-colors"
            >
              Library
            </button>
            <div className="w-1 h-1 bg-slate-800 rounded-full" />
            <button 
              onClick={() => router.push(`/resources/${slug}`)}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-blue-500 transition-colors"
            >
              {courseInfo.course_code || 'Course'}
            </button>
            <div className="w-1 h-1 bg-slate-800 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
              {term === 'mid' ? 'Midterm' : 'Final'}
            </span>
          </nav>

          {/* Header Section */}
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] max-w-[800px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {courseInfo.courseTitle}
              </h1>
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className={`px-5 py-1.5 rounded-full border ${term === 'mid' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-purple-500/10 border-purple-500/20 text-purple-500'} text-[9px] font-black uppercase tracking-[0.3em]`}>
                  {term === 'mid' ? 'Midterm Session' : 'Final Session'}
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                  <HardDrive size={12} />
                  {filteredResources.length} Verified Files
                </div>
              </div>
            </div>
          </div>

          {/* Luxury Resource List */}
          <div className="space-y-4">
            {filteredResources.length > 0 ? (
              filteredResources.map((res, idx) => (
                <div 
                  key={res.id} 
                  className="group relative bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-8 hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom-12 fill-mode-both"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start md:items-center gap-8">
                    {/* File Icon Base */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.05] flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                      <FileText size={24} />
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-black uppercase tracking-wider group-hover:text-blue-500 transition-colors leading-relaxed max-w-[600px]">
                        {res.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <HardDrive size={12} className="text-blue-500/50" />
                          {res.file_type || 'PDF'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Download size={12} className="text-blue-500/50" />
                          {res.downloads || 0} Downloads
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-blue-500/50" />
                          {res.created_at?.split(' ')[0] || 'Recent'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-lg active:scale-95 group/btn">
                      <Download size={16} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Download</span>
                    </button>
                    <button className="p-3.5 rounded-2xl bg-white/[0.05] text-slate-500 hover:bg-white/[0.1] hover:text-white transition-all active:scale-95">
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.01] border-2 border-dashed border-white/[0.05] rounded-[3rem] animate-in fade-in duration-1000">
                <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center text-slate-700 mb-6">
                  <FileText size={32} />
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">No materials archived for this term yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
