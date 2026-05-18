'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  FileText, 
  Calendar, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import coursesData from '@/lib/data/courses.json';

export default function EditResourceModal({ isOpen, onClose, resource, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    courseTitle: '',
    code: '',
    term: 'mid'
  });
  
  const [file, setFile] = useState(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({ title: '', course: '' });

  const suggestionsRef = useRef(null);

  // Initialize form with existing resource details
  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title || '',
        courseTitle: resource.subject || '',
        code: resource.course_code || '',
        term: resource.term || 'mid'
      });
      setCourseSearch(resource.subject || '');
      setFile(null);
      setStatus({ type: '', message: '' });
      setErrors({ title: '', course: '' });
    }
  }, [resource, isOpen]);

  // Click outside suggestions list
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCourses = useMemo(() => {
    if (courseSearch.length < 2) return [];
    return coursesData.filter(course => 
      course.courseTitle.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.code?.toLowerCase().includes(courseSearch.toLowerCase())
    ).slice(0, 5);
  }, [courseSearch]);

  const selectCourse = (course) => {
    setFormData(prev => ({ 
      ...prev, 
      courseTitle: course.courseTitle,
      code: course.code || 'N/A'
    }));
    setCourseSearch(course.courseTitle);
    setErrors(prev => ({ ...prev, course: '' }));
    setShowSuggestions(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrors(prev => ({ ...prev, title: 'Title is required' }));
      return;
    }
    if (!formData.courseTitle) {
      setErrors(prev => ({ ...prev, course: 'Course is required' }));
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: 'Saving resource updates...' });

    try {
      let updatedFilePath = resource.file_path;
      let updatedFileType = resource.file_type;

      // If a new file was provided, upload it first
      if (file) {
        setStatus({ type: 'info', message: 'Uploading new resource file...' });

        // Ensure resources bucket exists
        try {
          await supabase.storage.createBucket('resources', { public: true });
        } catch (_) {}

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop() || 'pdf';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resources')
          .getPublicUrl(filePath);

        // Delete the older replaced file from Supabase storage to save cloud space
        if (resource.file_path) {
          try {
            const oldFileName = resource.file_path.split('/resources/').pop();
            if (oldFileName) {
              await supabase.storage
                .from('resources')
                .remove([oldFileName]);
            }
          } catch (err) {
            console.warn('Failed to delete old replaced file from Supabase storage:', err);
          }
        }

        updatedFilePath = publicUrl;
        updatedFileType = fileExt.toLowerCase();
      }

      // Prepare payload
      const payload = {
        title: formData.title,
        description: `${formData.term.toUpperCase()} academic resource for ${formData.courseTitle}`,
        subject: formData.courseTitle,
        course_code: formData.code,
        term: formData.term,
        file_path: updatedFilePath,
        file_type: updatedFileType
      };

      // Call API PATCH
      const updatedRes = await apiRequest(`/resources/${resource.id}`, {
        method: 'PATCH',
        body: payload
      });

      setStatus({ type: 'success', message: 'Resource updated successfully!' });
      setTimeout(() => {
        onSave(updatedRes);
        onClose();
      }, 1000);

    } catch (err) {
      console.error('Failed to update resource:', err);
      setStatus({ type: 'error', message: err.message || 'Failed to update resource details.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !resource) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-6 sm:p-8 shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto relative backdrop-blur-xl animate-in scale-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--card-border)]">
          <div className="text-left">
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <FileText className="text-blue-500" size={20} /> Edit Resource
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Resource ID: #{resource.id}
            </p>
          </div>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="w-10 h-10 rounded-full border border-[var(--card-border)] bg-slate-500/5 hover:bg-slate-500/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5 text-left">
          
          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1.5">
              <FileText size={13} className="text-blue-500" /> Resource Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => {
                setFormData(prev => ({ ...prev, title: e.target.value }));
                setErrors(prev => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Midterm Solved Papers"
              className="w-full px-5 py-4 bg-[var(--background)]/50 border border-[var(--card-border)] focus:border-blue-500/50 rounded-2xl text-xs font-bold focus:outline-none transition-all placeholder-slate-500 text-[var(--foreground)]"
            />
            {errors.title && <p className="text-[10px] font-black uppercase tracking-wider text-red-500 ml-1">{errors.title}</p>}
          </div>

          {/* Course Selector (with suggestions) */}
          <div className="space-y-2 relative" ref={suggestionsRef}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1.5">
              <HelpCircle size={13} className="text-blue-500" /> Subject / Course <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={courseSearch} 
              onChange={(e) => {
                setCourseSearch(e.target.value);
                setShowSuggestions(true);
                setFormData(prev => ({ ...prev, courseTitle: '', code: '' }));
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Type course name or code to search..."
              className="w-full px-5 py-4 bg-[var(--background)]/50 border border-[var(--card-border)] focus:border-blue-500/50 rounded-2xl text-xs font-bold focus:outline-none transition-all placeholder-slate-500 text-[var(--foreground)]"
            />
            
            {/* Picked Course Indicator */}
            {formData.courseTitle && (
              <div className="mt-1.5 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500">
                  Selected: {formData.courseTitle} ({formData.code})
                </span>
              </div>
            )}

            {/* Suggestions Overlay */}
            {showSuggestions && filteredCourses.length > 0 && (
              <div className="absolute z-20 w-full left-0 mt-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-xl overflow-hidden max-h-[180px] overflow-y-auto backdrop-blur-xl">
                {filteredCourses.map((course) => (
                  <button
                    key={course.courseTitle}
                    type="button"
                    onClick={() => selectCourse(course)}
                    className="w-full text-left px-5 py-3 hover:bg-blue-500/5 hover:text-blue-500 text-xs font-bold border-b border-[var(--card-border)] last:border-b-0 transition-colors uppercase"
                  >
                    <p className="leading-none text-[11px] font-black">{course.courseTitle}</p>
                    <p className="text-[9px] text-slate-500 mt-1 font-bold tracking-wider">{course.code} • {course.dept}</p>
                  </button>
                ))}
              </div>
            )}
            {errors.course && <p className="text-[10px] font-black uppercase tracking-wider text-red-500 ml-1">{errors.course}</p>}
          </div>

          {/* Academic Term Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1.5">
              <Calendar size={13} className="text-blue-500" /> Academic Term <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'mid', label: 'Midterm', desc: 'Mid term resources' },
                { id: 'final', label: 'Final', desc: 'Final term resources' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, term: t.id }))}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${
                    formData.term === t.id 
                      ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-md' 
                      : 'bg-[var(--background)]/50 border-[var(--card-border)] hover:border-blue-500/30 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">{t.label}</span>
                  <span className="text-[8px] font-bold text-slate-400 leading-none">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File replacement */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1.5">
              <UploadCloud size={13} className="text-blue-500" /> Resource File <span className="text-slate-500">(Optional)</span>
            </label>
            
            <div className="p-4 bg-[var(--background)]/50 border border-[var(--card-border)] rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                <span>Current File:</span>
                <a 
                  href={resource.file_path} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline inline-flex items-center gap-1"
                >
                  View File
                </a>
              </div>
              
              <div className="relative border-2 border-dashed border-[var(--card-border)] hover:border-blue-500/30 rounded-xl p-4 text-center cursor-pointer transition-colors">
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud size={20} className="mx-auto text-slate-400 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  {file ? file.name : "Drag or Click to replace file"}
                </p>
                <p className="text-[7px] text-slate-400 mt-0.5">PDF, DOCX, ZIP, IMAGES (MAX 10MB)</p>
              </div>
            </div>
          </div>

          {/* Notification status */}
          {status.message && (
            <div className={`p-4 rounded-xl flex items-center gap-2 border text-[10px] font-black uppercase tracking-widest ${
              status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{status.message}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-4 bg-slate-500/5 hover:bg-slate-500/10 text-slate-400 border border-[var(--card-border)] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
