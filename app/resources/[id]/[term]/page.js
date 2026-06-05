'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import JSZip from 'jszip';
import { 
  Download,
  FileText,
  Clock,
  HardDrive,
  Eye,
  Bookmark,
  AlertCircle,
  CheckCircle2,
  X,
  DownloadCloud,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import coursesData from '@/lib/data/courses.json';
import PageHeader from '@/components/ui/PageHeader';
import { apiRequest } from '@/lib/api';
import Toast from '@/components/ui/Toast';
import Skeleton from '@/components/ui/Skeleton';
import ResourcePreviewModal from '@/components/resources/ResourcePreviewModal';
import { getDisplayUrl } from '@/lib/r2';

export default function TermResourcesPage() {
  const { id: slug, term } = useParams();
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();

  const [resourcesList, setResourcesList] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  };
  
  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (tokenReady && user) {
      fetchResources();
      fetchBookmarks();
    }
  }, [tokenReady, user]);

  const fetchResources = async () => {
    try {
      setLoadingResources(true);
      const res = await apiRequest('/resources?limit=1000');
      const data = Array.isArray(res) ? res : (res?.data || []);
      setResourcesList(data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoadingResources(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const data = await apiRequest('/bookmarks');
      setBookmarks(data || []);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    }
  };

  const handleToggleBookmark = (res) => {
    const wasBookmarked = bookmarks.some(b => b.resource_id === res.id);
    if (wasBookmarked) {
      setBookmarks(prev => prev.filter(b => b.resource_id !== res.id));
    } else {
      setBookmarks(prev => [...prev, { resource_id: res.id }]);
    }
    apiRequest('/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ resource_id: res.id })
    }).catch(err => {
      setBookmarks(prev => wasBookmarked
        ? [...prev, { resource_id: res.id }]
        : prev.filter(b => b.resource_id !== res.id)
      );
      showToast(err.message || 'Failed to update bookmark.', 'error');
    });
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
      setDownloadingId(res.id);
      if (res.id && !res.uploader_id?.toString().startsWith('legacy')) {
        await apiRequest(`/resources/${res.id}/download`, { method: 'POST' });
        setResourcesList(prev => prev.map(r => r.id === res.id ? { ...r, downloads: (r.downloads || 0) + 1 } : r));
      }
      const fileUrl = getDisplayUrl(res.file_path);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = (res.file_type || 'pdf').toLowerCase();
      a.download = `${res.title}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      window.open(getDisplayUrl(res.file_path), '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setDownloadingAll(true);
      const zip = new JSZip();
      for (const res of filteredResources) {
        const fileUrl = getDisplayUrl(res.file_path);
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const ext = (res.file_type || 'pdf').toLowerCase();
        zip.file(`${res.title}.${ext}`, blob);
        if (res.id && !res.uploader_id?.toString().startsWith('legacy')) {
          apiRequest(`/resources/${res.id}/download`, { method: 'POST' }).catch(() => {});
        }
      }
      setResourcesList(prev => prev.map(r =>
        filteredResources.some(fr => fr.id === r.id) ? { ...r, downloads: (r.downloads || 0) + 1 } : r
      ));
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(courseInfo.course_code || courseInfo.courseTitle || 'resources').replace(/\s+/g, '_')}_${term}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download all error:', err);
      showToast('Failed to download all files. Try downloading individually.', 'error');
    } finally {
      setDownloadingAll(false);
    }
  };

  if (authLoading || !courseInfo) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 transition-colors duration-500">
      <DashboardNavbar showBackButton={!!previewResource} onBack={() => setPreviewResource(null)} />

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
          <PageHeader
            badgeIcon={null}
            badgeText={term === 'mid' ? 'Midterm' : 'Final'}
            badgeColorClass={term === 'mid' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-purple-500/10 border-purple-500/20 text-purple-500'}
            title={courseInfo.courseTitle}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                <HardDrive size={10} />
                {filteredResources.length} Files
              </div>
              {filteredResources.length > 1 && (
                <button
                  onClick={handleDownloadAll}
                  disabled={downloadingAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20 transition-all text-[8px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingAll ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <DownloadCloud size={12} />
                  )}
                  {downloadingAll ? 'Zipping...' : 'Download All'}
                </button>
              )}
            </div>
          </PageHeader>

          {/* Responsive File Cards */}
          <div className="space-y-3">
            {loadingResources ? (
              <Skeleton type="list" count={3} />
            ) : filteredResources.length > 0 ? (
              filteredResources.map((res, idx) => {
                const isBookmarked = bookmarks.some(b => b.resource_id === res.id);
                return (
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
                        disabled={downloadingId === res.id}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg md:rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {downloadingId === res.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          {downloadingId === res.id ? 'Saving...' : 'Download'}
                        </span>
                      </button>
                      <button 
                        onClick={() => handleToggleBookmark(res)}
                        className={`p-2 md:p-2.5 rounded-lg md:rounded-xl transition-all flex items-center justify-center ${
                          isBookmarked 
                            ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' 
                            : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 hover:bg-slate-200 dark:hover:bg-white/[0.1]'
                        }`}
                      >
                        <Bookmark size={16} className={isBookmarked ? "fill-current" : ""} />
                      </button>
                      <button
                        onClick={() => setPreviewResource(res)}
                        className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-500 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all flex items-center justify-center"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center bg-slate-50/50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/[0.05] rounded-[1.5rem] md:rounded-[2rem]">
                <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.4em]">No archived materials found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── RESOURCE PREVIEW MODAL ─────────────────────────────────────────── */}
      <ResourcePreviewModal
        resource={previewResource}
        isOpen={!!previewResource}
        onClose={() => setPreviewResource(null)}
      />

      {/* ─── TOAST NOTIFICATION CONTAINER ─────────────────────────────────────── */}
      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
