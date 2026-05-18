'use client';

import { forwardRef } from 'react';
import { ChevronRight, Star, Download, Trash2 } from 'lucide-react';

/**
 * NoteCard — Majestic 280px card for a single note item.
 * Used on /notes, /bookmarks, and anywhere else notes are listed.
 *
 * Props:
 *  note              — note object { id, title, subject/courseTitle, course_code/code, avg_rating, downloads }
 *  icon              — resolved Lucide icon component (pass from parent after getSubjectIcon())
 *  accentColor       — "purple" | "blue" (default "purple")
 *  animationDelay    — ms delay for stagger animation (default 0)
 *  onClick           — click handler (navigate to note detail)
 *  onRemove          — optional; if provided, shows a Trash2 remove button (bookmark page)
 */
const NoteCard = forwardRef(function NoteCard(
  { note, icon: Icon, accentColor = 'purple', animationDelay = 0, onClick, onRemove },
  ref
) {
  const isBlue = accentColor === 'blue';

  const accentText      = isBlue ? 'group-hover:text-blue-500'  : 'group-hover:text-purple-500';
  const accentBg        = isBlue ? 'bg-blue-500'                : 'bg-purple-500';
  const accentIconText  = isBlue ? 'text-blue-500'              : 'text-purple-500';
  const accentGlow      = isBlue ? 'from-blue-500/[0.02]'       : 'from-purple-500/[0.02]';
  const accentFocus     = isBlue ? 'hover:border-blue-500/30'   : 'hover:border-purple-500/30';
  const badgeBg         = isBlue ? 'bg-blue-500/5 border-blue-500/10 text-blue-500/80'
                                 : 'bg-purple-500/5 border-purple-500/10 text-purple-500/80';

  const badgeLabel = isBlue
    ? (note.courseTitle || note.subject || 'GENERAL STUDY')
    : (note.subject || note.courseTitle || 'GENERAL STUDY');

  return (
    <div ref={ref} className="relative group">
      <div
        onClick={onClick}
        className={`relative h-[280px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 flex flex-col items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-white/[0.04] ${accentFocus} transition-all duration-500 hover:-translate-y-1 shadow-sm animate-in fade-in slide-in-from-bottom-6 fill-mode-both`}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {/* Gradient overlay */}
        <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${accentGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        {/* Icon */}
        <div className={`relative z-10 w-12 h-12 rounded-[1.2rem] bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center ${accentIconText} shadow-md group-hover:scale-105 transition-all duration-700`}>
          {Icon && <Icon size={20} strokeWidth={1.5} />}
        </div>

        {/* Title & metadata */}
        <div className="relative z-10 text-center space-y-2 w-full">
          <div className="space-y-1">
            <h3 className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest leading-relaxed max-w-[180px] mx-auto ${accentText} transition-colors duration-500 line-clamp-2`}>
              {note.title}
            </h3>
            <div className="space-y-1 pt-1">
              <p className="text-[7.5px] font-black tracking-[0.2em] text-slate-500 uppercase">
                {note.code || note.course_code || 'GENERAL'}
              </p>
              <p className={`text-[6.5px] font-black tracking-[0.15em] uppercase px-2 py-0.5 rounded-full border inline-block ${badgeBg}`}>
                {badgeLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 w-full flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
              <Star size={9} className={parseFloat(note.avg_rating) > 0 ? 'text-amber-400 fill-amber-400' : ''} />
              {parseFloat(note.avg_rating) > 0 ? note.avg_rating : 'NEW'}
            </div>
            <div className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
              <Download size={9} /> {note.downloads || 0}
            </div>
          </div>
          <div className={`w-5 h-5 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center group-hover:${accentBg} group-hover:text-white transition-all duration-500`}>
            <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>

      {/* Remove bookmark button (only when onRemove is provided) */}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-lg cursor-pointer"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
});

export default NoteCard;
