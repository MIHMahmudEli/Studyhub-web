'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
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
  AlertCircle,
  UploadCloud,
  File,
  X,
  Loader2
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useBlessings } from '@/components/ramadan/Blessings';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import coursesData from '@/lib/data/courses.json';

const VALID_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [courseSearch, setCourseSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

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
  const blessings = useBlessings();
  const router = useRouter();
  const suggestionsRef = useRef(null);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

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

  const addFile = (selectedFile) => {
    if (!VALID_TYPES.includes(selectedFile.type)) {
      setStatus({ type: 'error', message: 'Please upload a PDF, Word document, or Image.' });
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File size must be less than 50MB.' });
      return;
    }
    setFiles(prev => [...prev, { file: selectedFile, id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}` }]);
    setStatus({ type: '', message: '' });
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      addFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const uploadSingleNote = async (fileEntry) => {
    const { file } = fileEntry;
    const fileExt = file.name.split('.').pop();

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('notes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('notes')
      .getPublicUrl(filePath);

    const courseObj = coursesData.find(c => c.courseTitle === formData.course);

    const title = file.name.replace(/\.[^/.]+$/, "");

    await apiRequest('/notes', {
      method: 'POST',
      body: {
        title,
        description: formData.description,
        courseTitle: courseObj.courseTitle,
        code: courseObj.code || 'N/A',
        dept: courseObj.dept,
        file_path: publicUrl,
        file_type: fileExt || 'pdf',
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0 || !formData.course) {
      setStatus({ type: 'error', message: 'Please select at least one file and a course.' });
      return;
    }

    const isValidCourse = coursesData.some(c => c.courseTitle === formData.course);
    if (!isValidCourse) {
      setStatus({ type: 'error', message: 'Please select a valid course from the suggestions.' });
      return;
    }

    setLoading(true);
    setUploadProgress({ current: 0, total: files.length });
    setStatus({ type: '', message: '' });

    try {
      let uploaded = 0;
      for (const entry of files) {
        setStatus({ type: '', message: `Uploading file ${uploaded + 1} of ${files.length}...` });
        await uploadSingleNote(entry);
        uploaded++;
        setUploadProgress({ current: uploaded, total: files.length });
      }

      setStatus({ type: 'success', message: `All ${files.length} note(s) uploaded successfully! Wait for admin approval.` });
      setFiles([]);
      setFormData({ title: '', course: '', description: '' });
      setCourseSearch('');
      blessings?.trigger?.('May your effort be blessed 🤲');
      if (formRef.current) {
        formRef.current.classList.add('ramadan-save-pulse');
        setTimeout(() => formRef.current?.classList.remove('ramadan-save-pulse'), 1500);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setStatus({ type: 'error', message: err.message || `Failed at file ${uploadProgress.current + 1}.` });
    } finally {
      setLoading(false);
      setUploadProgress({ current: 0, total: 0 });
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
            <form ref={formRef} onSubmit={handleSubmit} className="lg:col-span-3 space-y-6 rounded-[2.5rem]">
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 md:p-10 shadow-xl backdrop-blur-xl relative overflow-hidden">
                <MetadataFormFields
                  hideTitle={true}
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
                    status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : status.type === 'error' ? <AlertCircle size={20} className="shrink-0" /> : <Loader2 size={20} className="shrink-0 animate-spin" />}
                    <p className="text-[11px] font-bold uppercase tracking-widest">{status.message}</p>
                  </div>
                )}

                <button
                  disabled={loading || files.length === 0 || !formData.course}
                  className={`w-full mt-10 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-500 ${
                    loading || files.length === 0 || !formData.course
                      ? 'bg-[var(--card-bg)] text-slate-600 cursor-not-allowed border border-[var(--card-border)]'
                      : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20'
                  }`}
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Uploading {uploadProgress.current}/{uploadProgress.total}</>
                  ) : (
                    <>Submit {files.length > 1 ? `All (${files.length})` : 'Note'} <Plus size={18} /></>
                  )}
                </button>
              </div>
            </form>

            {/* Sidebar Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-6 shadow-xl space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--foreground)] flex items-center gap-2">
                  <UploadCloud size={16} className="text-blue-500" /> Files to Upload
                </h3>

                {files.length > 0 && (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {files.map((entry, idx) => (
                      <div key={entry.id} className="flex items-center gap-3 p-3 bg-[var(--background)]/50 border border-[var(--card-border)] rounded-2xl group">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                          <File size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black text-[var(--foreground)] truncate">{entry.file.name}</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{(entry.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(entry.id)}
                          disabled={loading}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {files.length === 0 ? (
                  <div
                    onClick={handleFilePicker}
                    className="border-2 border-dashed border-[var(--card-border)] rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Drop files or click to browse</p>
                    <p className="text-[9px] font-bold text-slate-500">PDF, PNG, JPG, DOCX (Max 50MB each)</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleFilePicker}
                    disabled={loading}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Add More
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleInputChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>

              <RewardCard />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
