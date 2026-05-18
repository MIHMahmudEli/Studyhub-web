'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import FileUploader from '@/components/upload/FileUploader';
import RewardCard from '@/components/upload/RewardCard';
import PageHeader from '@/components/ui/PageHeader';
import MetadataFormFields from '@/components/upload/MetadataFormFields';
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

      // setStatus({ type: '', message: 'Saving to database...' });

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

      setStatus({ type: 'success', message: 'Note uploaded successfully! Wait for the admin approval.' });
      setFile(null);
      setFormData({ title: '', course: '', description: '' });
      setCourseSearch('');
      // Redirect removed as requested
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
          <PageHeader
            isCentered={true}
            title="Upload Study Notes"
            description="Share your knowledge with the community and earn academic points."
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 md:p-10 shadow-xl backdrop-blur-xl relative overflow-hidden">
                <MetadataFormFields
                  titleLabel="Note Title"
                  titleIcon={BookOpen}
                  titlePlaceholder="e.g. Data Structures - Week 5 Lecture Notes"
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  setErrors={setErrors}
                  courseSearch={courseSearch}
                  setCourseSearch={setCourseSearch}
                  showSuggestions={showSuggestions}
                  setShowSuggestions={setShowSuggestions}
                  filteredCourses={filteredCourses}
                  selectCourse={selectCourse}
                  suggestionsRef={suggestionsRef}
                  validateTitle={validateTitle}
                />

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
