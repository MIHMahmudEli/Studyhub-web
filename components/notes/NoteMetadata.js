'use client';

import { useRouter } from 'next/navigation';
import { Edit, Trash2, BookOpen, GraduationCap, Star, Download, Eye, Layers, Clock, User } from 'lucide-react';
import { getDepartmentName } from '@/lib/nameUtils';
import FollowButton from '@/components/notes/FollowButton';

function formatCount(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function DocumentControlPanel({ onEdit, onDelete }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 shadow-sm space-y-4">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Document Control</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-2 py-3 bg-blue-500/10 hover:bg-blue-500 hover:text-white border border-blue-500/20 text-blue-500 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer font-bold"
        >
          <Edit size={14} /> Edit Details
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer font-bold"
        >
          <Trash2 size={14} /> Delete Note
        </button>
      </div>
    </div>
  );
}

function NoteInfoCard({ note, totalRatings }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full" />

      <div className="relative z-10 flex items-center justify-between mb-6">
        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-500 text-[9px] font-black uppercase tracking-[0.3em]">
          {note.course_code || 'GENERAL STUDY'}
        </span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1">
          <Clock size={11} /> {note.created_at}
        </span>
      </div>

      <h1 className="relative z-10 text-xl font-black uppercase tracking-wider leading-relaxed text-[var(--foreground)] mb-3 group-hover:text-purple-500 transition-colors duration-500">
        {note.title}
      </h1>

      <p className="relative z-10 text-[11px] font-bold uppercase tracking-widest text-slate-500 leading-loose mb-8">
        {note.description || `Comprehensive study notes for ${note.subject}. Essential materials for exam preparation and conceptual review.`}
      </p>

      <div className="relative z-10 space-y-4 pt-6 border-t border-[var(--card-border)]">
        <div className="bg-slate-50 dark:bg-white/[0.02] border border-[var(--card-border)] rounded-2xl p-4 flex gap-4 items-start transition-all hover:bg-slate-100/50 dark:hover:bg-white/[0.04] duration-300">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10 shrink-0">
            <BookOpen size={16} />
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 block">Course Subject</span>
            <span className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-[var(--foreground)] block">
              {note.subject}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-white/[0.02] border border-[var(--card-border)] rounded-2xl p-4 flex gap-4 items-start transition-all hover:bg-slate-100/50 dark:hover:bg-white/[0.04] duration-300">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10 shrink-0">
            <GraduationCap size={16} />
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 block">Department Faculty</span>
            <span className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-[var(--foreground)] block">
              {getDepartmentName(note.course_code, note.subject, note.dept)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-white/[0.02] border border-[var(--card-border)] rounded-2xl p-4 flex gap-3.5 items-center transition-all hover:bg-slate-100/50 dark:hover:bg-white/[0.04] duration-300">
            <Star size={16} className={parseFloat(note.avg_rating) > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-400'} />
            <div className="space-y-0.5">
              <span className="text-[7.5px] font-black uppercase tracking-[0.25em] text-slate-400 block">Rating</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] block">
                {parseFloat(note.avg_rating) > 0 ? `${Number(note.avg_rating).toFixed(2)} (${totalRatings})` : 'NEW'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.02] border border-[var(--card-border)] rounded-2xl p-4 flex gap-3.5 items-center transition-all hover:bg-slate-100/50 dark:hover:bg-white/[0.04] duration-300">
            <Download size={16} className="text-purple-500" />
            <div className="space-y-0.5">
              <span className="text-[7.5px] font-black uppercase tracking-[0.25em] text-slate-400 block">Downloads</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] block">
                {note.downloads}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-white/[0.02] border border-[var(--card-border)] rounded-2xl p-4 flex justify-between items-center transition-all hover:bg-slate-100/50 dark:hover:bg-white/[0.04] duration-300">
            <div className="flex gap-3.5 items-center">
              <Layers size={16} className="text-slate-500" />
              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">File Type Format</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-500 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
              {note.file_type?.toUpperCase()}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-white/[0.02] border border-[var(--card-border)] rounded-2xl p-4 flex gap-3.5 items-center transition-all hover:bg-slate-100/50 dark:hover:bg-white/[0.04] duration-300">
            <Eye size={16} className="text-sky-500" />
            <div className="space-y-0.5">
              <span className="text-[7.5px] font-black uppercase tracking-[0.25em] text-slate-400 block">Views</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] block">
                {formatCount(note.views ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthorCard({ uploader, uploaderId }) {
  const router = useRouter();

  return (
    <div className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 flex items-center gap-4 shadow-sm transition-all duration-300 hover:border-purple-500/30">
      <button
        onClick={() => router.push(`/profile/${uploaderId}`)}
        className="flex items-center gap-4 flex-1 min-w-0 group cursor-pointer text-left"
      >
        {uploader?.profile_pic ? (
          <img
            src={uploader.profile_pic}
            alt={uploader?.name || ''}
            className="w-12 h-12 rounded-2xl object-cover border border-[var(--card-border)] shadow-sm shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-slate-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500 shrink-0">
            <User size={20} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Uploaded By</p>
          <p className="text-[11px] font-black uppercase tracking-widest truncate group-hover:text-purple-500 transition-colors duration-500">
            {uploader?.name || `Student #${uploaderId}`}
          </p>
        </div>
      </button>

      <FollowButton userId={uploaderId} variant="full" className="shrink-0" />
    </div>
  );
}

export default function NoteMetadata({
  note,
  totalRatings,
  isUploaderOrAdmin,
  onEdit,
  onDelete,
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
      {isUploaderOrAdmin && (
        <DocumentControlPanel onEdit={onEdit} onDelete={onDelete} />
      )}

      <NoteInfoCard note={note} totalRatings={totalRatings} />

      <AuthorCard uploader={note.uploader} uploaderId={note.uploader_id} />
    </div>
  );
}
