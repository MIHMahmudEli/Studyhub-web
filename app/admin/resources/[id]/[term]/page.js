'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  Download,
  FileText,
  Clock,
  HardDrive,
  Eye,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Trash2,
  Edit3,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import coursesData from '@/lib/data/courses.json';
import PageHeader from '@/components/ui/PageHeader';
import { apiRequest } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import Toast from '@/components/ui/Toast';
import Skeleton from '@/components/ui/Skeleton';
import EditResourceModal from '@/components/admin/EditResourceModal';
import ResourcePreviewModal from '@/components/resources/ResourcePreviewModal';

export default function AdminTermResourcesPage() {
  const { id: slug, term } = useParams();
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();

  const [resourcesList, setResourcesList] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
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

  // Auth/Role verification (Admin or Moderator only)
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (user.role !== 'admin' && user.role !== 'moderator') {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (tokenReady && user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchResources();
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
      showToast(err.message || 'Failed to fetch library resources.', 'error');
    } finally {
      setLoadingResources(false);
    }
  };

  const { courseInfo, filteredResources } = useMemo(() => {
    const dbResources = resourcesList.filter(item => {
      const title = item.subject || item.course_code || '';
      return title.replace(/\s+/g, '-').toLowerCase() === slug &&
             (item.term || 'mid').toLowerCase() === term.toLowerCase();
    });

    const fromJson = coursesData.find(c => c.courseTitle.replace(/\s+/g, '-').toLowerCase() === slug);
    const info = fromJson ? { ...fromJson, course_code: fromJson.code, courseTitle: fromJson.courseTitle } : 
                 (dbResources[0] ? { courseTitle: dbResources[0].subject, course_code: dbResources[0].course_code } : null);

    return {
      courseInfo: info || { courseTitle: slug.replace(/-/g, ' ').toUpperCase(), course_code: 'MODULE' },
      filteredResources: dbResources
    };
  }, [slug, term, resourcesList]);

  // Deletion logic
  const handleDeleteResource = async (res) => {
    if (!confirm(`Are you sure you want to permanently delete "${res.title}"?`)) {
      return;
    }

    try {
      setDeletingId(res.id);

      // 1. Delete the physical file from Supabase storage first to save space
      if (res.file_path) {
        try {
          const fileName = res.file_path.split('/resources/').pop();
          if (fileName) {
            await supabase.storage
              .from('resources')
              .remove([fileName]);
          }
        } catch (err) {
          console.warn('Failed to clean up Supabase storage file:', err);
        }
      }

      // 2. Delete DB record via API
      await apiRequest(`/resources/${res.id}`, { method: 'DELETE' });

      // Update state locally
      setResourcesList(prev => prev.filter(r => r.id !== res.id));
      showToast('Resource deleted successfully.', 'success');

    } catch (err) {
      console.error('Failed to delete resource:', err);
      showToast(err.message || 'Failed to delete resource. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (res) => {
    setSelectedResource(res);
    setIsEditModalOpen(true);
  };

  const handleSaveResource = (updatedRes) => {
    setResourcesList(prev => prev.map(r => r.id === updatedRes.id ? updatedRes : r));
    showToast('Resource updated successfully.', 'success');
  };

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 transition-colors duration-500">
      <DashboardNavbar showBackButton={!!previewResource} onBack={() => setPreviewResource(null)} />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1100px] mx-auto">
          
          {/* Breadcrumbs / Back Navigation */}
          <nav className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
            <button 
              onClick={() => router.push('/admin/resources')}
              className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-400 hover:text-emerald-500 transition-colors"
            >
              Catalogues
            </button>
            <div className="w-1 h-1 bg-slate-300 dark:bg-slate-800 rounded-full" />
            <button 
              onClick={() => router.push(`/admin/resources/${slug}`)}
              className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-400 hover:text-emerald-500 transition-colors truncate max-w-[100px] md:max-w-none"
            >
              {courseInfo.course_code || 'Course'}
            </button>
            <div className="w-1 h-1 bg-slate-300 dark:bg-slate-800 rounded-full" />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-emerald-500">
              {term === 'mid' ? 'Mid' : 'Final'}
            </span>
          </nav>

          {/* Page Header */}
          <PageHeader
            badgeIcon={null}
            badgeText={term === 'mid' ? 'Midterm' : 'Final'}
            badgeColorClass={term === 'mid' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-purple-500/10 border-purple-500/20 text-purple-500'}
            title={courseInfo.courseTitle}
          >
            <div className="flex items-center gap-2 text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
              <HardDrive size={10} />
              {filteredResources.length} Files Managed
            </div>
          </PageHeader>

          {/* List of Resource Files */}
          <div className="space-y-4">
            {loadingResources ? (
              <Skeleton type="list" count={3} />
            ) : filteredResources.length > 0 ? (
              filteredResources.map((res, idx) => {
                // Permission checks: Admin can manage anything. Moderator can manage only files they uploaded.
                const canManage = user?.role === 'admin' || (user?.role === 'moderator' && res.uploader_id === user.id);
                
                return (
                  <div 
                    key={res.id} 
                    className="group relative bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[1.2rem] md:rounded-[1.5rem] p-4 md:p-6 hover:bg-white dark:hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all duration-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="flex items-center gap-4 md:gap-6 text-left">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-transparent border border-slate-200 dark:border-white/[0.05] flex items-center justify-center text-emerald-500 shrink-0">
                        <FileText size={18} className="md:w-5 md:h-5" />
                      </div>
                      
                      <div className="space-y-1 md:space-y-1.5 min-w-0">
                        <h4 className="text-[11px] md:text-xs font-black uppercase tracking-wider group-hover:text-emerald-500 transition-colors leading-relaxed truncate pr-2">
                          {res.title}
                        </h4>
                        <div className="flex items-center gap-3 md:gap-4 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400">
                          <span className="text-emerald-500 font-black">BY {res.uploader?.name || 'ADMIN'}</span>
                          <div className="w-1 h-1 bg-slate-300 dark:bg-slate-800 rounded-full" />
                          <span>{res.file_type || 'PDF'}</span>
                          <div className="w-1 h-1 bg-slate-300 dark:bg-slate-800 rounded-full" />
                          <span>{res.downloads || 0} DL</span>
                          <div className="hidden xs:block w-1 h-1 bg-slate-300 dark:bg-slate-800 rounded-full" />
                          <span className="hidden xs:block">{res.created_at?.split('T')[0] || 'RECENT'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Management and Operations Actions */}
                    <div className="flex items-center gap-2 sm:shrink-0">
                      
                      {/* Preview */}
                      <button
                        onClick={() => setPreviewResource(res)}
                        className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-500 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all flex items-center justify-center cursor-pointer"
                        title="Preview File"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Edit Button (if authorized) */}
                      {canManage && (
                        <button 
                          onClick={() => handleEditClick(res)}
                          className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                          title="Edit Details & Replace File"
                        >
                          <Edit3 size={16} />
                        </button>
                      )}

                      {/* Delete Button (if authorized) */}
                      {canManage && (
                        <button 
                          onClick={() => handleDeleteResource(res)}
                          disabled={deletingId === res.id}
                          className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                          title="Delete File"
                        >
                          {deletingId === res.id ? (
                            <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}

                      {/* If not authorized to edit/delete, show descriptive badge */}
                      {!canManage && (
                        <span className="text-[7.5px] font-black uppercase tracking-wider px-2 py-1 bg-slate-500/5 border border-slate-500/10 rounded-md text-slate-500">
                          Read-Only
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center bg-slate-50/50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/[0.05] rounded-[1.5rem] md:rounded-[2rem]">
                <AlertCircle size={24} className="text-slate-400 mb-2" />
                <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.4em]">No resources catalogued for this term yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Details & File Replacement Modal */}
      <EditResourceModal 
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedResource(null); }}
        resource={selectedResource}
        onSave={handleSaveResource}
      />

      {/* Preview Modal */}
      <ResourcePreviewModal
        resource={previewResource}
        isOpen={!!previewResource}
        onClose={() => setPreviewResource(null)}
      />

      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
