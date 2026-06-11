'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import {
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  UploadCloud,
  File,
  Loader2
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { uploadToR2 } from '@/lib/r2';
import { useRouter } from 'next/navigation';
import coursesData from '@/lib/data/courses.json';
import MetadataFormFields from '@/components/upload/MetadataFormFields';
import PageHeader from '@/components/ui/PageHeader';

const VALID_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Presentations
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Spreadsheets
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Text
  'text/plain',
  'application/rtf',
  // Archives
  'application/zip',
  'application/vnd.rar',
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
];

export default function UploadResourcePage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [courseSearch, setCourseSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

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
  const fileInputRef = useRef(null);

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

  const addFile = (selectedFile) => {
    if (!VALID_TYPES.includes(selectedFile.type)) {
      setStatus({ type: 'error', message: 'Please upload a valid PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, image, text, or archive file.' });
      return;
    }
    if (selectedFile.size > 200 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File size must be less than 200MB.' });
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
    if (e.target.files) {
      for (const file of e.target.files) {
        addFile(file);
      }
      e.target.value = '';
    }
  };

  const uploadSingleFile = async (fileEntry) => {
    const { file } = fileEntry;
    const fileExt = file.name.split('.').pop() || 'pdf';

    const key = `resources/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const publicUrl = await uploadToR2(file, key);

    const title = file.name.replace(/\.[^/.]+$/, "");

    await apiRequest('/resources', {
      method: 'POST',
      body: {
        title,
        description: formData.description || `${formData.term.toUpperCase()} academic resource for ${formData.courseTitle}`,
        subject: formData.courseTitle,
        course_code: formData.code,
        term: formData.term,
        file_path: publicUrl,
        file_type: fileExt.toLowerCase(),
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0 || !formData.courseTitle) {
      setStatus({ type: 'error', message: 'Please select at least one file and a course.' });
      return;
    }

    setLoading(true);
    setUploadProgress({ current: 0, total: files.length });
    setStatus({ type: '', message: '' });

    try {
      let uploaded = 0;
      for (const entry of files) {
        setStatus({ type: '', message: `Uploading file ${uploaded + 1} of ${files.length}...` });
        await uploadSingleFile(entry);
        uploaded++;
        setUploadProgress({ current: uploaded, total: files.length });
      }

      setStatus({ type: 'success', message: `All ${files.length} resource(s) published successfully!` });
      setFiles([]);
      setFormData({ title: '', courseTitle: '', code: '', dept: '', term: 'mid', description: '' });
      setCourseSearch('');

    } catch (err) {
      console.error('Resource upload error:', err);
      setStatus({ type: 'error', message: err.message || `Failed at file ${uploadProgress.current + 1}.` });
    } finally {
      setLoading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
      <DashboardNavbar />

      <div className="pt-32 px-6">
        <div className="max-w-[1000px] mx-auto">
          <PageHeader
            isCentered={true}
            title="Publish Academic Resource"
            description="Admin & Moderator Resource Publishing Portal"
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 md:p-10 shadow-xl backdrop-blur-xl relative overflow-hidden">
                <MetadataFormFields
                  hideTitle={true}
                  titleLabel="Resource Title"
                  titleIcon={FileText}
                  titlePlaceholder="e.g. Midterm Practice Exam & Solutions"
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
                  showPickedCourse={true}
                  showTermSelector={false}
                  validateTitle={validateTitle}
                  descriptionLabel="Resource Description (Optional)"
                  descriptionIcon={FileText}
                  descriptionPlaceholder="Brief notes about these resource files..."
                  descriptionRows={3}
                >
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
                </MetadataFormFields>

                {/* Status Notifications */}
                {status.message && (
                  <div className={`mt-8 p-4 rounded-2xl flex items-center gap-3 border ${
                    status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : status.type === 'error' ? <AlertCircle size={20} className="shrink-0" /> : <Loader2 size={20} className="shrink-0 animate-spin" />}
                    <p className="text-[11px] font-bold uppercase tracking-widest">{status.message}</p>
                  </div>
                )}

                {/* Action Buttons (Publish & Cancel) */}
                <div className="grid grid-cols-2 gap-4 mt-10">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/dashboard')}
                    disabled={loading}
                    className="py-5 rounded-2xl font-black text-xs uppercase tracking-widest bg-[var(--background)]/50 border border-[var(--card-border)] text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span className="flex items-center justify-center gap-2"><X size={16} /> Cancel</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading || files.length === 0 || !formData.courseTitle}
                    className={`py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-500 ${
                      loading || files.length === 0 || !formData.courseTitle
                        ? 'bg-[var(--card-bg)] text-slate-600 cursor-not-allowed border border-[var(--card-border)]'
                        : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20'
                    }`}
                  >
                    {loading ? (
                      <><Loader2 size={16} className="animate-spin" /> Publishing {uploadProgress.current}/{uploadProgress.total}</>
                    ) : (
                      <>Publish {files.length > 1 ? `All (${files.length})` : 'Resource'} <Plus size={16} /></>
                    )}
                  </button>
                </div>

              </div>
            </form>

            {/* Sidebar — Multi-file Uploader */}
            <div className="lg:col-span-2 space-y-6">
              {/* Drop zone / file list */}
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-6 shadow-xl space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--foreground)] flex items-center gap-2">
                  <UploadCloud size={16} className="text-blue-500" /> Files to Publish
                </h3>

                {files.length > 0 && (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {files.map((entry, idx) => (
                      <div key={entry.id} className="flex items-center gap-3 p-3 bg-[var(--background)]/50 border border-[var(--card-border)] rounded-2xl group">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
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
                    <p className="text-[9px] font-bold text-slate-500">PDF, DOC, PPT, XLS, Images, ZIP (Max 200MB each)</p>
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
                  multiple
                  onChange={handleInputChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.rtf,.zip,.rar,.jpg,.jpeg,.png,.webp"
                />
              </div>

              {/* Guidelines */}
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-xl space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" /> Publishing Guidelines
                </h3>
                <ul className="text-xs font-medium text-slate-400 space-y-2.5 leading-relaxed list-disc list-inside">
                  <li>Add multiple files for the same course — each gets its own title from the filename.</li>
                  <li>Click <strong>Add More</strong> to include additional lecture slides or resources.</li>
                  <li>All files share the same course, term, and description metadata.</li>
                  <li>You will receive +1 Points for every verified note you contribute.</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
