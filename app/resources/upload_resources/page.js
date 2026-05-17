'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import ResourceFileUploader from '@/components/upload/ResourceFileUploader';
import { 
  Plus,
  BookOpen,
  GraduationCap,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import coursesData from '@/lib/data/courses.json';

export default function UploadResourcePage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [courseSearch, setCourseSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    courseTitle: '',
    code: '',
    dept: '',
    term: 'mid',
    description: ''
  });

  const [errors, setErrors] = useState({
    title: '',
    course: ''
  });

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const suggestionsRef = useRef(null);

  // 1. Role & Auth Verification (Only Admin & Moderator)
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (user.role !== 'admin' && user.role !== 'moderator') {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  // 2. Auto-fill Title when File is selected
  useEffect(() => {
    if (file && !formData.title.trim()) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setFormData(prev => ({ ...prev, title: nameWithoutExt }));
      setErrors(prev => ({ ...prev, title: '' }));
    }
  }, [file]);

  // Click outside suggestions handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateTitle = (value) => {
    if (!value.trim()) return 'Title is required';
    return '';
  };

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
      code: course.code || 'N/A',
      dept: course.dept || 'GENERAL'
    }));
    setCourseSearch(course.courseTitle);
    setErrors(prev => ({ ...prev, course: '' }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !formData.title.trim() || !formData.courseTitle) {
      setStatus({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: 'Uploading resource file...' });

    try {
      // Programmatically ensure 'resources' bucket exists
      try {
        await supabase.storage.createBucket('resources', { public: true });
      } catch (_) {}

      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop() || 'pdf';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      // 2. Prepare payload for backend API
      const payload = {
        title: formData.title,
        description: formData.description || `${formData.term.toUpperCase()} academic resource for ${formData.courseTitle}`,
        subject: formData.courseTitle, // Storing course name as subject
        course_code: formData.code,
        term: formData.term,
        file_path: publicUrl,
        file_type: fileExt.toLowerCase(),
      };

      // 3. Send POST request to backend API
      const resData = await apiRequest('/resources', {
        method: 'POST',
        body: payload,
      });

      // Immediately approve it so it appears in the public library
      if (resData && resData.id) {
        await apiRequest(`/resources/${resData.id}/status`, {
          method: 'PATCH',
          body: { status: 'approved' }
        });
      }

      setStatus({ type: 'success', message: 'Resource published successfully!' });
      setFile(null);
      setFormData({ title: '', courseTitle: '', code: '', dept: '', term: 'mid', description: '' });
      setCourseSearch('');
      
      // Redirect to resources page after success
      setTimeout(() => {
        router.push('/resources');
      }, 1500);

    } catch (err) {
      console.error('Resource upload error:', err);
      setStatus({ type: 'error', message: err.message || 'Failed to publish resource.' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
      <DashboardNavbar />

      <div className="pt-32 px-6">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="mb-12 text-center relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-blue-500/10 blur-[80px] rounded-full -z-10" />
            <h1 className="text-4xl font-black tracking-tight mb-4 uppercase">Publish Academic Resource</h1>
            <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">Admin & Moderator Resource Publishing Portal</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 md:p-10 shadow-xl backdrop-blur-xl relative overflow-hidden">
                <div className="space-y-6">
                  
                  {/* Title Input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <FileText size={14} className="text-blue-500" /> Resource Title <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Midterm Practice Exam & Solutions"
                      className={`w-full bg-[var(--background)]/50 border rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/5 transition-all ${
                        errors.title ? 'border-red-500/50' : 'border-[var(--card-border)]'
                      }`}
                      value={formData.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({...formData, title: val});
                        setErrors({...errors, title: validateTitle(val)});
                      }}
                    />
                    {errors.title && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.title}</p>}
                  </div>

                  {/* Course Search & Auto Suggestion */}
                  <div className="space-y-2 relative" ref={suggestionsRef}>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <GraduationCap size={14} className="text-purple-500" /> Course Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="text" 
                        required
                        placeholder="Search course name or code..."
                        className={`w-full bg-[var(--background)]/50 border rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/5 transition-all ${
                          errors.course ? 'border-red-500/50' : 'border-[var(--card-border)]'
                        }`}
                        value={courseSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCourseSearch(val);
                          setShowSuggestions(true);
                          if (formData.courseTitle) setFormData({ ...formData, courseTitle: '', code: '', dept: '' });
                        }}
                        onFocus={() => setShowSuggestions(true)}
                      />
                    </div>

                    {/* Picked Course Info Display */}
                    {formData.courseTitle && (
                      <div className="mt-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col gap-1 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-blue-500 uppercase tracking-wider">Selected Course</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-lg">{formData.code}</span>
                        </div>
                        <p className="text-sm font-bold text-[var(--foreground)]">{formData.courseTitle}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formData.dept}</p>
                      </div>
                    )}

                    {/* Suggestions Dropdown */}
                    {showSuggestions && filteredCourses.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--background)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-y-auto max-h-[300px] z-50 backdrop-blur-xl">
                        {filteredCourses.map((course) => (
                          <button
                            key={`${course.courseTitle}-${course.code}`}
                            type="button"
                            onClick={() => selectCourse(course)}
                            className="w-full px-6 py-4 text-left hover:bg-blue-500/5 flex items-center justify-between group transition-colors border-b border-[var(--card-border)] last:border-none"
                          >
                            <div>
                              <p className="text-sm font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors">{course.courseTitle}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{course.code ? `${course.code} • ` : ''}{course.dept}</p>
                            </div>
                            <Plus size={16} className="text-slate-600 group-hover:text-blue-500 shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Academic Term Selection */}
                  <div className="space-y-3 pt-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <Calendar size={14} className="text-amber-500" /> Academic Term <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'mid', label: 'Midterm Term', desc: 'Midterm syllabus materials' },
                        { id: 'final', label: 'Final Term', desc: 'Final syllabus materials' }
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, term: t.id }))}
                          className={`p-5 rounded-2xl border text-left flex flex-col gap-1 transition-all duration-300 ${
                            formData.term === t.id 
                              ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]' 
                              : 'bg-[var(--background)]/50 border-[var(--card-border)] hover:border-blue-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-xs font-black uppercase tracking-wider ${formData.term === t.id ? 'text-blue-500' : 'text-[var(--foreground)]'}`}>
                              {t.label}
                            </span>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${formData.term === t.id ? 'border-blue-500 bg-blue-500' : 'border-slate-500'}`}>
                              {formData.term === t.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description / Summary */}
                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <FileText size={14} className="text-emerald-500" /> Resource Description (Optional)
                    </label>
                    <textarea 
                      rows={3}
                      placeholder="Brief notes about this resource file..."
                      className="w-full bg-[var(--background)]/50 border border-[var(--card-border)] rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/5 transition-all resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                </div>

                {/* Status Notifications */}
                {status.message && (
                  <div className={`mt-8 p-4 rounded-2xl flex items-center gap-3 border ${
                    status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                    <p className="text-[11px] font-bold uppercase tracking-widest">{status.message}</p>
                  </div>
                )}

                {/* Action Buttons (Publish & Cancel) */}
                <div className="grid grid-cols-2 gap-4 mt-10">
                  <button 
                    type="button"
                    onClick={() => router.push('/resources')}
                    disabled={loading}
                    className="py-5 rounded-2xl font-black text-xs uppercase tracking-widest bg-[var(--background)]/50 border border-[var(--card-border)] text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span className="flex items-center justify-center gap-2"><X size={16} /> Cancel</span>
                  </button>

                  <button 
                    type="submit"
                    disabled={loading || !file || !formData.courseTitle}
                    className={`py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-500 ${
                      loading || !file || !formData.courseTitle
                        ? 'bg-[var(--card-bg)] text-slate-600 cursor-not-allowed border border-[var(--card-border)]' 
                        : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20'
                    }`}
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Publish Resource <Plus size={16} /></>}
                  </button>
                </div>

              </div>
            </form>

            {/* Sidebar Section */}
            <div className="lg:col-span-2 space-y-6">
              <ResourceFileUploader file={file} setFile={setFile} setStatus={setStatus} />
              
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-xl space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" /> Publishing Guidelines
                </h3>
                <ul className="text-xs font-medium text-slate-400 space-y-2.5 leading-relaxed list-disc list-inside">
                  <li>Ensure the file is high quality and relevant to the selected course syllabus.</li>
                  <li>Verify the Academic Term (Midterm vs Final) matches the resource content.</li>
                  <li>Published resources become instantly available to all students in the library.</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
