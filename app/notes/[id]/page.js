'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  ExternalLink,
  Maximize2,
  Minimize,
  Edit,
  Trash2
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { NoteDetailSkeleton, Skeleton } from '@/components/ui/Skeleton';
import coursesData from '@/lib/data/courses.json';
import { supabase } from '@/lib/supabase';

export default function NotePreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, checkUser } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Note Action states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    courseTitle: '',
    code: '',
    dept: '',
    description: ''
  });
  const [newFile, setNewFile] = useState(null);

  // Auto-suggest search state
  const [courseSearch, setCourseSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Click outside auto-suggest to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter courses based on user input
  const filteredCourses = useMemo(() => {
    if (courseSearch.length < 2) return [];
    return coursesData.filter(course => 
      course.courseTitle.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.code?.toLowerCase().includes(courseSearch.toLowerCase())
    ).slice(0, 5);
  }, [courseSearch]);

  const selectCourse = (course) => {
    setEditForm(prev => ({
      ...prev,
      courseTitle: course.courseTitle,
      code: course.code,
      dept: course.dept
    }));
    setCourseSearch(course.courseTitle);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/notes/${id}`);
        // Map backend fields to frontend expected fields
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

  useEffect(() => {
    if (note) {
      setEditForm({
        title: note.title || '',
        courseTitle: note.courseTitle || '',
        code: note.code || '',
        dept: note.dept || '',
        description: note.description || ''
      });
      setCourseSearch(note.courseTitle || note.subject || '');
      setNewFile(null);
    }
  }, [note]);

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
        // 1. Increment download count in database
        await apiRequest(`/notes/${id}/download`, { method: 'POST' });
        
        // 2. Refresh user points (this calls /auth/me and updates AuthContext)
        checkUser();

        // 3. Update local state for note downloads
        setNote(prev => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));

        // 4. Trigger actual file download
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Strict course selection validation
    const isValidCourse = coursesData.some(c => c.courseTitle === editForm.courseTitle);
    if (!isValidCourse) {
      alert('Please select a valid course from the suggestions list.');
      return;
    }

    // 2. Prevent submitting if no changes were made to save database load
    const hasChanges = 
      editForm.title !== (note.title || '') ||
      editForm.courseTitle !== (note.courseTitle || '') ||
      editForm.code !== (note.code || '') ||
      editForm.dept !== (note.dept || '') ||
      editForm.description !== (note.description || '') ||
      newFile !== null;

    if (!hasChanges) {
      alert('No changes detected.');
      return;
    }

    setUpdating(true);
    try {
      let filePayload = {};
      if (newFile) {
        // 1. Upload new file to Supabase storage
        const fileExt = newFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('notes')
          .upload(filePath, newFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('notes')
          .getPublicUrl(filePath);

        filePayload = {
          file_path: publicUrl,
          file_type: fileExt || 'pdf'
        };

        // 2. Delete the old file from Supabase storage to save space
        if (note.file_path) {
          try {
            const oldFileName = note.file_path.split('/notes/').pop();
            if (oldFileName) {
              await supabase.storage
                .from('notes')
                .remove([oldFileName]);
            }
          } catch (err) {
            console.warn('Failed to delete old file from storage:', err);
          }
        }
      }

      const updatedData = await apiRequest(`/notes/${id}`, {
        method: 'PATCH',
        body: {
          ...editForm,
          ...filePayload
        }
      });
      
      // Update local note state
      setNote(prev => ({
        ...prev,
        ...updatedData,
        subject: updatedData.courseTitle,
        course_code: updatedData.code
      }));
      setIsEditModalOpen(false);
      setNewFile(null);
      setContentLoaded(false); // Reload preview frame
    } catch (err) {
      console.error('Failed to update note details:', err);
      alert(err.message || 'Failed to update note details.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setDeleting(true);
    try {
      // 1. Delete the file from Supabase storage
      if (note.file_path) {
        try {
          const fileName = note.file_path.split('/notes/').pop();
          if (fileName) {
            await supabase.storage
              .from('notes')
              .remove([fileName]);
          }
        } catch (err) {
          console.warn('Failed to delete note file from storage:', err);
        }
      }

      // 2. Delete note record from backend database
      await apiRequest(`/notes/${id}`, {
        method: 'DELETE'
      });
      setIsDeleteConfirmOpen(false);
      router.push('/notes');
    } catch (err) {
      console.error('Failed to delete note:', err);
      alert(err.message || 'Failed to delete note.');
    } finally {
      setDeleting(false);
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
              
              {/* Document Control Panel for Uploader/Admin */}
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
                      {parseFloat(note.avg_rating) > 0 ? note.avg_rating : 'Not Rated'}
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
      </div>

      {/* 1. Edit Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] w-full max-w-[600px] max-h-[85vh] overflow-y-auto rounded-[2rem] p-8 shadow-2xl space-y-6 relative text-slate-800 dark:text-slate-100 animate-scale-in">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Edit Note Details</h3>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Modify metadata, description, or replace your publication file.</p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</label>
                <input 
                  type="text" 
                  value={editForm.title} 
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-500/50 transition-colors text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Document Title"
                />
              </div>

              {/* Subject / Course Name Auto-Suggest */}
              <div className="space-y-2 relative" ref={suggestionsRef}>
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Subject / Course Name</label>
                <input 
                  type="text" 
                  value={courseSearch} 
                  onChange={(e) => {
                    setCourseSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-500/50 transition-colors text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Type to search and select course..."
                />
                
                {/* Real-time Validation Warning */}
                {courseSearch && !coursesData.some(c => c.courseTitle === courseSearch) && (
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1.5 animate-pulse flex items-center gap-1.5">
                    <span>⚠️</span> Please select a valid course from the suggested list
                  </p>
                )}
                
                {showSuggestions && filteredCourses.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-[999999] bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden max-h-[220px] overflow-y-auto">
                    {filteredCourses.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectCourse(c)}
                        className="w-full text-left px-5 py-3.5 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-white/[0.03] last:border-b-0 cursor-pointer flex flex-col gap-0.5"
                      >
                        <span className="text-slate-900 dark:text-white font-bold">{c.courseTitle}</span>
                        <span className="text-[9px] font-black tracking-wider uppercase text-purple-500">{c.code} • {c.dept}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Auto-Populated Read-Only Metadata Fields */}
              {editForm.courseTitle && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-1 px-5 py-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/[0.08] rounded-2xl">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Selected Code</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{editForm.code || 'N/A'}</p>
                  </div>
                  <div className="space-y-1 px-5 py-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/[0.08] rounded-2xl">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Selected Department</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{editForm.dept || 'N/A'}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
                <textarea 
                  value={editForm.description} 
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-500/50 transition-colors text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                  placeholder="Summarize these study notes..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Replace Note File (Optional)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".pdf,image/*"
                    onChange={(e) => setNewFile(e.target.files[0])}
                    className="hidden" 
                    id="replace-file-input"
                  />
                  <label 
                    htmlFor="replace-file-input"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl cursor-pointer hover:border-purple-500/50 transition-all bg-slate-50 dark:bg-black/30"
                  >
                    <FileText size={24} className="text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 max-w-[400px] truncate">
                      {newFile ? newFile.name : 'Choose New File (PDF or Image)'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      {newFile ? `${(newFile.size / 1024 / 1024).toFixed(2)} MB` : 'Leave blank to keep existing file'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setNewFile(null);
                  }}
                  className="px-5 py-3 border border-slate-200 dark:border-white/[0.08] rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-md shadow-purple-500/10 cursor-pointer disabled:opacity-50 font-bold"
                >
                  {updating ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] w-full max-w-[400px] rounded-[2rem] p-8 shadow-2xl space-y-6 relative text-center text-slate-800 dark:text-slate-100 animate-scale-in">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
              <Trash2 size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Delete Publication?</h3>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-loose">
                This action is permanent and cannot be undone. All points earned and downloaded data will be archived.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="w-1/2 py-3.5 border border-slate-200 dark:border-white/[0.08] rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteSubmit}
                disabled={deleting}
                className="w-1/2 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-md shadow-red-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-bold"
              >
                {deleting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  'Delete Note'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
