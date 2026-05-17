'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  BookmarkPlus, 
  FileText, 
  Star,
  Clock,
  User,
  Maximize2,
  Minimize,
  Edit,
  Trash2
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { NoteDetailSkeleton } from '@/components/ui/Skeleton';
import EditNoteModal from '@/components/notes/EditNoteModal';
import DeleteConfirmModal from '@/components/notes/DeleteConfirmModal';
import RatingWidget from '@/components/notes/RatingWidget';

export default function NotePreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, checkUser } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Modal display states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [totalRatings, setTotalRatings] = useState(0);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/notes/${id}`);
        const mappedNote = {
          ...data,
          subject: data.courseTitle,
          course_code: data.code,
          created_at: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A'
        };
        setNote(mappedNote);
      } catch (error) {
        console.error('Failed to fetch note:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkBookmarkStatus = async () => {
      try {
        const bookmarks = await apiRequest('/bookmarks');
        const bookmarked = bookmarks.some(b => b.note_id === parseInt(id));
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error('Failed to check bookmark status:', error);
      }
    };

    if (id) {
      fetchNote();
      checkBookmarkStatus();
    }
  }, [id]);

  const handleBookmarkToggle = async () => {
    try {
      const res = await apiRequest('/bookmarks/toggle', {
        method: 'POST',
        body: { note_id: parseInt(id) }
      });
      setIsBookmarked(res.bookmarked);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleDownload = async () => {
    if (note?.file_path) {
      try {
        await apiRequest(`/notes/${id}/download`, { method: 'POST' });
        checkUser();
        setNote(prev => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));

        const response = await fetch(note.file_path);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${note.title}.${note.file_type}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Download failed:', err);
        window.open(note.file_path, '_blank');
      }
    }
  };

  const handleEditSave = (updatedData) => {
    setNote(prev => ({
      ...prev,
      ...updatedData,
      subject: updatedData.courseTitle,
      course_code: updatedData.code
    }));
    setContentLoaded(false); // Trigger preview frame reload
  };

  const handleDeleteComplete = () => {
    router.push('/notes');
  };

  const handleRateSuccess = async () => {
    try {
      const data = await apiRequest(`/notes/${id}`);
      setNote(prev => ({
        ...prev,
        avg_rating: data.avg_rating
      }));
    } catch (err) {
      console.error('Failed to refresh rating:', err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
        <DashboardNavbar />
        <div className="pt-24 md:pt-32 px-4 md:px-8 max-w-[1400px] mx-auto">
          <NoteDetailSkeleton />
        </div>
      </main>
    );
  }

  if (!note) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
        <DashboardNavbar />
        <div className="pt-32 px-6 flex flex-col items-center justify-center text-center">
          <FileText size={64} className="text-slate-400 mb-6" />
          <h1 className="text-3xl font-black uppercase tracking-widest mb-4">Note Not Found</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-8">
            The requested document could not be located in the archives.
          </p>
          <button 
            onClick={() => router.push('/notes')}
            className="px-8 py-3 bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-purple-600 transition-all"
          >
            Return to Feed
          </button>
        </div>
      </main>
    );
  }

  const isUploaderOrAdmin = user && (user.id === note.uploader_id || user.role === 'admin' || user.role === 'moderator');

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8 max-w-[1400px] mx-auto">
        {/* Navigation and Actions Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-3 w-fit"
          >
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center text-slate-500 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[var(--foreground)] transition-colors">
              Back to Feed
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] rounded-xl text-[10px] font-black tracking-widest uppercase text-slate-500 hover:text-purple-500 transition-all shadow-sm"
            >
              <Share2 size={14} /> Share
            </button>
            <button 
              onClick={() => setIsReadingMode(!isReadingMode)}
              className={`flex items-center gap-2 px-5 py-3 border rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-sm ${
                isReadingMode 
                ? 'bg-blue-500 text-white border-blue-400 hover:bg-blue-600' 
                : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.05] text-slate-500 hover:text-blue-500'
              }`}
            >
              {isReadingMode ? <><Minimize size={14} /> Exit Reading Mode</> : <><Maximize2 size={14} /> Reading Mode</>}
            </button>
            <button 
              onClick={handleBookmarkToggle}
              className={`flex items-center gap-2 px-5 py-3 border rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-sm ${
                isBookmarked 
                ? 'bg-purple-500 text-white border-purple-400' 
                : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.05] text-slate-500 hover:text-purple-500'
              }`}
            >
              <BookmarkPlus size={14} className={isBookmarked ? "fill-white" : ""} /> 
              {isBookmarked ? 'Saved' : 'Save'}
            </button>
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-purple-600 transition-all shadow-xl shadow-purple-500/20"
            >
              <Download size={14} /> Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Preview Area */}
          <div className={`${isReadingMode ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6 transition-all duration-500`}>
            <div className={`w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.05] rounded-[2rem] overflow-hidden shadow-2xl relative group transition-all duration-500 ${isReadingMode ? 'h-[85vh]' : 'aspect-[3/4] md:h-[800px]'}`}>
              {note.file_path ? (
                <>
                  {!contentLoaded && (note.file_type?.toLowerCase() === 'pdf' || ['jpg', 'jpeg', 'png', 'webp'].includes(note.file_type?.toLowerCase())) && (
                    <div className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-black/60 flex flex-col items-center justify-center z-10 space-y-6">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/10 rounded-full animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <div className="w-14 h-14 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-xl">
                          <FileText size={24} className="text-purple-500 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center space-y-2 animate-pulse">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Loading Document</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preparing high-quality preview...</p>
                      </div>
                    </div>
                  )}
                  {note.file_type?.toLowerCase() === 'pdf' ? (
                    <iframe 
                      src={`${note.file_path}#toolbar=0&navpanes=0`} 
                      className={`w-full h-full border-none transition-opacity duration-500 ${contentLoaded ? 'opacity-100' : 'opacity-0'}`}
                      title={note.title}
                      onLoad={() => setContentLoaded(true)}
                    />
                  ) : ['jpg', 'jpeg', 'png', 'webp'].includes(note.file_type?.toLowerCase()) ? (
                    <img 
                      src={note.file_path} 
                      alt={note.title}
                      className={`w-full h-full object-contain transition-opacity duration-500 ${contentLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => setContentLoaded(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <FileText size={64} className="text-purple-500/20" />
                      <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">Preview Not Available</h3>
                      <button 
                        onClick={handleDownload}
                        className="px-6 py-3 bg-purple-500/10 text-purple-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all"
                      >
                        Download to View
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <FileText size={64} className="text-purple-500/20 mb-6" />
                  <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">No Document Found</h3>
                </div>
              )}
            </div>

          </div>

          {/* Metadata Sidebar */}
          {!isReadingMode && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
              
              {/* Document Control Panel uploader/admin */}
              {isUploaderOrAdmin && (
                <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-6 shadow-sm space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Document Control</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center justify-center gap-2 py-3 bg-blue-500/10 hover:bg-blue-500 hover:text-white border border-blue-500/20 text-blue-500 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer font-bold"
                    >
                      <Edit size={14} /> Edit Details
                    </button>
                    <button 
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer font-bold"
                    >
                      <Trash2 size={14} /> Delete Note
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-8 shadow-sm">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-500 text-[9px] font-black uppercase tracking-[0.3em] mb-6">
                  {note.course_code || 'GENERAL STUDY'}
                </div>
                
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest leading-relaxed mb-4">
                  {note.title}
                </h1>
                
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 leading-loose mb-8">
                  {note.description || `Comprehensive study notes for ${note.subject}. Essential materials for exam preparation and conceptual review.`}
                </p>

                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Subject</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{note.subject}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Department</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-right max-w-[150px] truncate">{note.dept || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Rating</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                      <Star size={12} className={parseFloat(note.avg_rating) > 0 ? "text-amber-400 fill-amber-400" : "text-slate-400"} />
                      {parseFloat(note.avg_rating) > 0 ? `${Number(note.avg_rating).toFixed(2)} (${totalRatings} ${totalRatings === 1 ? 'Rating' : 'Ratings'})` : 'Not Rated'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Downloads</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{note.downloads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">File Type</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded">
                      {note.file_type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Added</span>
                    <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Clock size={12} /> {note.created_at}
                    </span>
                  </div>
                </div>
              </div>

              {/* Author Card */}
              <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-6 flex items-center gap-4 shadow-sm group cursor-pointer hover:border-purple-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-slate-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Uploaded By</p>
                  <p className="text-[11px] font-black uppercase tracking-widest group-hover:text-purple-500 transition-colors">
                    {note.uploader?.name || `Student #${note.uploader_id}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Rating & Feedback Thread (Full Width Screen Layout) */}
        {!isReadingMode && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom duration-700">
            <RatingWidget 
              noteId={note.id} 
              uploaderId={note.uploader_id} 
              onRateSuccess={handleRateSuccess} 
              onReviewsFetched={setTotalRatings} 
            />
          </div>
        )}
      </div>

      {/* Modular Interactive Edit Modal */}
      <EditNoteModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        note={note} 
        onSave={handleEditSave} 
      />

      {/* Modular Interactive Delete Confirm Modal */}
      <DeleteConfirmModal 
        isOpen={isDeleteConfirmOpen} 
        onClose={() => setIsDeleteConfirmOpen(false)} 
        note={note} 
        onDelete={handleDeleteComplete} 
      />
    </main>
  );
}
