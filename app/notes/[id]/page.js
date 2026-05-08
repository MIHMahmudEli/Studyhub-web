'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  BookmarkPlus, 
  FileText, 
  Star,
  Clock,
  User
} from 'lucide-react';
import notesDemoData from '@/lib/data/notesDemo.json';

export default function NotePreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching the note
    const foundNote = notesDemoData.find(n => n.id === parseInt(id));
    if (foundNote) {
      setNote(foundNote);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
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
            <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] rounded-xl text-[10px] font-black tracking-widest uppercase text-slate-500 hover:text-purple-500 transition-all shadow-sm">
              <Share2 size={14} /> Share
            </button>
            <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] rounded-xl text-[10px] font-black tracking-widest uppercase text-slate-500 hover:text-blue-500 transition-all shadow-sm">
              <BookmarkPlus size={14} /> Save
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-purple-600 transition-all shadow-xl shadow-purple-500/20">
              <Download size={14} /> Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Preview Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="w-full aspect-[4/3] md:aspect-[16/9] bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/[0.05] rounded-[2rem] flex flex-col items-center justify-center shadow-inner overflow-hidden relative group">
              {/* Fallback preview UI if real PDF rendering isn't active */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent z-0" />
              <FileText size={64} className="text-purple-500/20 mb-6 z-10" />
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 z-10">Document Preview</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2 z-10">
                {note.file_path.split('/').pop()}
              </p>
              
              {/* Optional Iframe for real preview if files are hosted */}
              {/* <iframe src={`/${note.file_path}`} className="absolute inset-0 w-full h-full" /> */}
            </div>
          </div>

          {/* Metadata Sidebar */}
          <div className="space-y-6">
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
                    <Clock size={12} /> {note.created_at.split(' ')[0]}
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
                  Student #{note.uploader_id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
