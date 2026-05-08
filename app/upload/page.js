'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  UploadCloud, 
  File, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Plus,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Coins,
  Search
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import coursesData from '@/lib/data/courses.json';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [courseSearch, setCourseSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    description: ''
  });

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  // Handle clicking outside of suggestions
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
      course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.code.toLowerCase().includes(courseSearch.toLowerCase())
    ).slice(0, 5); // Limit to top 5 results
  }, [courseSearch]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      setStatus({ type: 'error', message: 'Please upload a PDF, Word document, or Image.' });
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File size must be less than 10MB.' });
      return;
    }
    setFile(selectedFile);
    setStatus({ type: '', message: '' });
  };

  const selectCourse = (course) => {
    setFormData({ ...formData, course: course.name });
    setCourseSearch(course.name);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Basic empty checks
    if (!file || !formData.title.trim() || !formData.course) {
      setStatus({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    // 2. Strict Course Validation: Must be in the courses.json list
    const isValidCourse = coursesData.some(c => c.name === formData.course);
    if (!isValidCourse) {
      setStatus({ type: 'error', message: 'Please select a valid course from the suggestions.' });
      return;
    }

    // 3. Title validation (Generic Error)
    const titleWords = formData.title.trim().split(/\s+/);
    const isValidTitle = titleWords.length >= 2 && titleWords.every(word => word.length >= 2);
    
    if (!isValidTitle) {
      setStatus({ type: 'error', message: 'Please provide a valid title (at least 2 words, with 2+ characters each).' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('title', formData.title);
      data.append('course', formData.course);
      data.append('description', formData.description);

      await apiRequest('/notes/upload', {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatus({ type: 'success', message: 'Note uploaded successfully! +50 Points earned.' });
      setFile(null);
      setFormData({ title: '', course: '', description: '' });
      setCourseSearch('');
      
      setTimeout(() => router.push('/notes'), 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to upload note.' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="mb-12 text-center relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-blue-500/10 blur-[80px] rounded-full -z-10" />
            <h1 className="text-4xl font-black tracking-tight mb-4">Upload Study Notes</h1>
            <p className="text-slate-500 font-medium">Share your knowledge with the community and earn academic points.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 md:p-10 shadow-xl backdrop-blur-xl relative overflow-hidden">
                <div className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <BookOpen size={14} /> Note Title <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Data Structures - Week 5 Lecture Notes"
                      className="w-full bg-[var(--background)]/50 border border-[var(--card-border)] rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/5 transition-all"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  {/* Course with Suggestions */}
                  <div className="space-y-2 relative" ref={suggestionsRef}>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <GraduationCap size={14} /> Course Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="text" 
                        required
                        placeholder="Type course name or code (e.g. Advanced Web...)"
                        className="w-full bg-[var(--background)]/50 border border-[var(--card-border)] rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/5 transition-all"
                        value={courseSearch}
                        onChange={(e) => {
                          setCourseSearch(e.target.value);
                          setShowSuggestions(true);
                          if (formData.course) setFormData({ ...formData, course: '' });
                        }}
                        onFocus={() => setShowSuggestions(true)}
                      />
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && filteredCourses.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--background)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                        {filteredCourses.map((course) => (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => selectCourse(course)}
                            className="w-full px-6 py-4 text-left hover:bg-blue-500/5 flex items-center justify-between group transition-colors"
                          >
                            <div>
                              <p className="text-sm font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors">{course.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{course.code}</p>
                            </div>
                            <Plus size={16} className="text-slate-600 group-hover:text-blue-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <MessageSquare size={14} /> Description
                    </label>
                    <textarea 
                      rows={4}
                      placeholder="Give a brief summary of what's covered in these notes..."
                      className="w-full bg-[var(--background)]/50 border border-[var(--card-border)] rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/5 transition-all resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                {status.message && (
                  <div className={`mt-8 p-4 rounded-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-top-2 ${
                    status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="text-[11px] font-bold uppercase tracking-widest">{status.message}</p>
                  </div>
                )}

                <button 
                  disabled={loading || !file || !formData.course}
                  className={`w-full mt-10 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-500 ${
                    loading || !file || !formData.course
                      ? 'bg-[var(--card-bg)] text-slate-600 cursor-not-allowed border border-[var(--card-border)]' 
                      : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20'
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Submit Resource <Plus size={18} /></>
                  )}
                </button>
              </div>
            </form>

            {/* Upload Section */}
            <div className="lg:col-span-2 space-y-6">
              <div 
                className={`relative bg-[var(--card-bg)] border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center transition-all duration-500 ${
                  dragActive ? 'border-blue-500 bg-blue-500/5 scale-105' : 'border-[var(--card-border)] hover:border-blue-500/30 hover:bg-white/[0.02]'
                } ${file ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 text-emerald-400">
                      <File size={32} />
                    </div>
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest truncate max-w-[200px] mb-2">{file.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 mb-6 uppercase">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <button 
                      onClick={() => setFile(null)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 text-blue-400">
                      <UploadCloud size={32} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Drop your notes here</h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-8 leading-relaxed">
                      Supports PDF, PNG, JPG, DOCX <br /> (Max 10MB)
                    </p>
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="px-6 py-3 rounded-xl bg-white text-black font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all shadow-lg"
                    >
                      Browse Files
                    </button>
                  </>
                )}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>

              {/* Point Reward Card */}
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-[2rem] p-8 flex items-center gap-6">
                <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                  <Coins size={28} />
                </div>
                <div>
                  <h4 className="font-black text-amber-500 text-sm uppercase tracking-wider mb-1">Earn Points</h4>
                  <p className="text-slate-500 text-[11px] font-bold leading-relaxed">
                    You will receive <span className="text-[var(--foreground)]">+50 Points</span> for every verified note you contribute.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
