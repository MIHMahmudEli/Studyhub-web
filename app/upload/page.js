'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import FileUploader from '@/components/upload/FileUploader';
import RewardCard from '@/components/upload/RewardCard';
import { 
  Plus,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import coursesData from '@/lib/data/courses.json';

//this is replace by database in feature
const courseList = [{
    id: 1,
    courseTitle: 'Computer Graphics - Course Outline',
    dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
    faculty: 'fst',
    type: 'PDF',
    size: '1.2 MB',
    resources: [
      {
        id: 1,
        courseTitle: 'Computer Graphics - Course Outline',
        dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
        faculty: 'fst',
        type: 'PDF',
        size: '1.2 MB',
        term: "mid",
        downloads: 124
      },
      {
        id: 2,
        courseTitle: 'Introduction to C Programming - Lecture Notes',
        dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
        faculty: 'fst',
        type: 'PDF',
        term: "final",
        size: '1.8 MB',
        downloads: 250
      }
    ],
    downloads: 124},
    
    {id: 2,
    courseTitle: 'Introduction to C Programming - Lecture Notes',
    dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
    faculty: 'fst',
    type: 'PDF',
    size: '1.8 MB',
        resources: [
      {
        id: 1,
        courseTitle: 'Computer Graphics - Course Outline',
        dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
        faculty: 'fst',
        type: 'PDF',
        size: '1.2 MB',
        term: "mid",
        downloads: 124
      },
      {
        id: 2,
        courseTitle: 'Introduction to C Programming - Lecture Notes',
        dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
        faculty: 'fst',
        type: 'PDF',
        size: '1.8 MB',
        term: "final",
        downloads: 250
      }
    ],
    downloads: 250
},
{
  id: 3,
  courseTitle: 'Differential Calculus and Coordinate Geometry - Course Outline',
  dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
  faculty: 'fst',
  type: 'PDF',
  size: '1.5 MB',
      resources: [
      {
        id: 1,
        courseTitle: 'Computer Graphics - Course Outline',
        dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
        faculty: 'fst',
        type: 'PDF',
        size: '1.2 MB',
        term: "mid",
        downloads: 124
      },
      {
        id: 2,
        courseTitle: 'Introduction to C Programming - Lecture Notes',
        dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
        faculty: 'fst',
        type: 'PDF',
        size: '1.8 MB',
        term: "final",
        downloads: 250
      }
    ],
  downloads: 180
},

  {
id: 4,
courseTitle: 'Introduction to Artificial Intelligence - Course Outline',
dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
faculty: 'fst',
type: 'PDF',
size: '2.0 MB',
    resources: [
      {
        id: 1,
        courseTitle: 'Computer Graphics - Course Outline',
        dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
        faculty: 'fst',
        type: 'PDF',
        size: '1.2 MB',
        term: "mid",
        downloads: 124
      },
      {
        id: 2,
        courseTitle: 'Introduction to C Programming - Lecture Notes',
        dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
        faculty: 'fst',
        type: 'PDF',
        size: '1.8 MB',
        term: "final",
        downloads: 250
      }
    ],
downloads: 150
}


]

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [courseSearch, setCourseSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    description: ''
  });
  const [errors, setErrors] = useState({
    title: '',
    course: ''
  });

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

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
    if (!value.trim()) return '';
    const words = value.trim().split(/\s+/);
    if (words.length < 2 || !words.every(word => word.length >= 2)) {
      return 'Please provide a valid title';
    }
    return '';
  };

  const validateCourse = (value) => {
    if (!value.trim()) return '';
    const exists = coursesData.some(c => c.courseTitle.toLowerCase() === value.toLowerCase());
    if (!exists && value.length > 1) {
      return 'Please select a valid course from the suggestions';
    }
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
    setFormData({ ...formData, course: course.courseTitle });
    setCourseSearch(course.courseTitle);
    setErrors({ ...errors, course: '' });
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !formData.title.trim() || !formData.course) {
      setStatus({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    const isValidCourse = coursesData.some(c => c.courseTitle === formData.course);
    if (!isValidCourse) {
      setStatus({ type: 'error', message: 'Please select a valid course from the suggestions.' });
      return;
    }

    const titleWords = formData.title.trim().split(/\s+/);
    const isValidTitle = titleWords.length >= 2 && titleWords.every(word => word.length >= 2);
    if (!isValidTitle) {
      setStatus({ type: 'error', message: 'Please provide a valid title' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: 'Uploading...' });

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('notes')
        .getPublicUrl(filePath);

      setStatus({ type: '', message: 'Saving to database...' });

      // 2. Find course details
      const courseObj = coursesData.find(c => c.courseTitle === formData.course);

      // 3. Prepare payload for our API
      const payload = {
        title: formData.title,
        description: formData.description,
        courseTitle: courseObj.courseTitle,
        code: courseObj.code || 'N/A',
        dept: courseObj.dept,
        file_path: publicUrl,
        file_type: fileExt || 'pdf',
      };

      // 4. Send to our API
      await apiRequest('/notes', {
        method: 'POST',
        body: payload,
      });

      setStatus({ type: 'success', message: 'Note uploaded successfully! +5 Points earned.' });
      setFile(null);
      setFormData({ title: '', course: '', description: '' });
      setCourseSearch('');
      setTimeout(() => router.push('/notes'), 2000);
    } catch (err) {
      console.error('Upload error:', err);
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
                  {/* Title Input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <BookOpen size={14} /> Note Title <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Data Structures - Week 5 Lecture Notes"
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

                  {/* Course Search */}
                  <div className="space-y-2 relative" ref={suggestionsRef}>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <GraduationCap size={14} /> Course Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="text" 
                        required
                        placeholder="Type course name or code..."
                        className={`w-full bg-[var(--background)]/50 border rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/5 transition-all ${
                          errors.course ? 'border-red-500/50' : 'border-[var(--card-border)]'
                        }`}
                        value={courseSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCourseSearch(val);
                          setErrors({ ...errors, course: validateCourse(val) });
                          setShowSuggestions(true);
                          if (formData.course) setFormData({ ...formData, course: '' });
                        }}
                        onFocus={() => setShowSuggestions(true)}
                      />
                    </div>

                    {errors.course && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.course}</p>}

                    {showSuggestions && filteredCourses.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--background)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                        {filteredCourses.map((course) => (
                          <button
                            key={`${course.courseTitle}-${course.code}`}
                            type="button"
                            onClick={() => selectCourse(course)}
                            className="w-full px-6 py-4 text-left hover:bg-blue-500/5 flex items-center justify-between group transition-colors"
                          >
                            <div>
                              <p className="text-sm font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors">{course.courseTitle}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{course.code ? `${course.code} • ` : ''}{course.dept}</p>
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
                      placeholder="Summary of these notes..."
                      className="w-full bg-[var(--background)]/50 border border-[var(--card-border)] rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/5 transition-all resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                {status.message && (
                  <div className={`mt-8 p-4 rounded-2xl flex items-center gap-3 border ${
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
                  {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Submit Resource <Plus size={18} /></>}
                </button>
              </div>
            </form>

            {/* Sidebar Section */}
            <div className="lg:col-span-2 space-y-6">
              <FileUploader file={file} setFile={setFile} setStatus={setStatus} />
              <RewardCard />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
