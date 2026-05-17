'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  Download,
  FileText,
  Clock,
  HardDrive,
  Eye
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import coursesData from '@/lib/data/courses.json';
import { apiRequest } from '@/lib/api';

export default function TermResourcesPage() {
  const { id: slug, term } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [resourcesList, setResourcesList] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchResources();
    }
  }, [user]);

  const fetchResources = async () => {
    try {
      setLoadingResources(true);
      const data = await apiRequest('/resources');
      setResourcesList(data || []);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoadingResources(false);
    }
  };

  const { courseInfo, filteredResources } = useMemo(() => {
    // 1. Filter real resources matching slug and term
    const dbResources = resourcesList.filter(item => {
      const title = item.subject || item.course_code || '';
      return title.replace(/\s+/g, '-').toLowerCase() === slug &&
             (item.term || 'mid').toLowerCase() === term.toLowerCase();
    });

    const activeResources = dbResources;

    // 3. Find course info from courses.json or active list
    const fromJson = coursesData.find(c => c.courseTitle.replace(/\s+/g, '-').toLowerCase() === slug);
    const info = fromJson ? { ...fromJson, course_code: fromJson.code, courseTitle: fromJson.courseTitle } : 
                 activeResources[0] || null;

    return {
      courseInfo: info,
      filteredResources: activeResources
    };
  }, [slug, term, resourcesList]);

  const handleDownload = async (res) => {
    try {
      // Increment download count in DB if it's a real DB resource
      if (res.id && !res.uploader_id?.toString().startsWith('legacy')) {
        await apiRequest(`/resources/${res.id}/download`, { method: 'POST' });
        // Update local state to reflect new download count
        setResourcesList(prev => prev.map(r => r.id === res.id ? { ...r, downloads: (r.downloads || 0) + 1 } : r));
      }
      // Open file in new tab
      window.open(res.file_path, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      window.open(res.file_path, '_blank');
    }
  };

  if (authLoading || !courseInfo) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1100px] mx-auto">
          {/* Responsive Breadcrumbs */}
          <nav className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
            <button 
              onClick={() => router.push('/resources')}
              className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-400 hover:text-blue-500 transition-colors"
            >
              Lib
            </button>
            <div className="w-1 h-1 bg-slate-300 dark:bg-slate-800 rounded-full" />
            <button 
              onClick={() => router.push(`/resources/${slug}`)}
              className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-400 hover:text-blue-500 transition-colors truncate max-w-[100px] md:max-w-none"
            >
              {courseInfo.course_code || 'Course'}
            </button>
            <div className="w-1 h-1 bg-slate-300 dark:bg-slate-800 rounded-full" />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-blue-500">
              {term === 'mid' ? 'Mid' : 'Final'}
            </span>
          </nav>

          {/* Responsive Header Section */}
          <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div className="space-y-2 md:space-y-4">
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase leading-tight max-w-[700px]">
                {courseInfo.courseTitle}
              </h1>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full border ${term === 'mid' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-purple-500/10 border-purple-500/20 text-purple-500'} text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em]`}>
                  {term === 'mid' ? 'Midterm' : 'Final'}
                </div>
                <div className="flex items-center gap-2 text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <HardDrive size={10} />
                  {filteredResources.length} Files
                </div>
              </div>
            </div>
          </div>

          {/* Responsive File Cards */}
          <div className="space-y-3">
            {loadingResources ? (
              <div className="py-12 text-center text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading academic resources...</div>
            ) : filteredResources.length > 0 ? (
              filteredResources.map((res, idx) => (
                <div 
                  key={res.id} 
                  className="group relative bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[1.2rem] md:rounded-[1.5rem] p-4 md:p-6 hover:bg-white dark:hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-transparent border border-slate-200 dark:border-white/[0.05] flex items-center justify-center text-blue-500 shrink-0">
                      <FileText size={18} className="md:w-5 md:h-5" />
                    </div>
                    
                    <div className="space-y-1 md:space-y-1.5 min-w-0">
                      <h4 className="text-[11px] md:text-xs font-black uppercase tracking-wider group-hover:text-blue-500 transition-colors leading-relaxed truncate pr-2">
                        {res.title}
                      </h4>
                      <div className="flex items-center gap-3 md:gap-4 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400">
                        <span className="text-blue-500 font-black">BY {res.uploader?.name || 'ADMIN'}</span>
                        <div className="w-1 h-1 bg-slate-300 dark:bg-slate-800 rounded-full" />
                        <span>{res.file_type || 'PDF'}</span>
                        <div className="w-1 h-1 bg-slate-300 dark:bg-slate-800 rounded-full" />
                        <span>{res.downloads || 0} DL</span>
                        <div className="hidden xs:block w-1 h-1 bg-slate-300 dark:bg-slate-800 rounded-full" />
                        <span className="hidden xs:block">{res.created_at?.split(' ')[0] || 'RECENT'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <button 
                      onClick={() => handleDownload(res)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg md:rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-lg active:scale-95 group/btn"
                    >
                      <Download size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Download</span>
                    </button>
                    <a 
                      href={res.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-500 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all flex items-center justify-center"
                    >
                      <Eye size={16} />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center bg-slate-50/50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/[0.05] rounded-[1.5rem] md:rounded-[2rem]">
                <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.4em]">No archived materials found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
