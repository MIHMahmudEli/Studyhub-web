'use client';

import { ChevronRight, Bookmark, Trash2 } from 'lucide-react';

/**
 * CourseCard — Majestic 280px card for a subject/course.
 * Used on /resources (with bookmark toggle) and /bookmarks (with remove).
 *
 * Props:
 *  course            — { title, code, slug, resourceCount?, subject_name? }
 *  icon              — resolved Lucide icon component (pass from parent after getCourseIcon())
 *  animationDelay    — ms delay for stagger animation (default 0)
 *  onClick           — click handler (navigate to course resources)
 *  footerLeftText    — text shown left of footer divider, e.g. "5 Files" or "View Resources"
 *  badgeLabel        — small badge label below the code, e.g. dept or "RESOURCES"
 *  isBookmarked      — boolean; shows filled bookmark icon when true
 *  onToggleBookmark  — optional; if provided, renders a bookmark button (resources page)
 *  onRemove          — optional; if provided, renders a trash remove button (bookmarks page)
 */
export default function CourseCard({
  course,
  icon: Icon,
  animationDelay = 0,
  onClick,
  footerLeftText = 'View Resources',
  badgeLabel,
  isBookmarked = false,
  onToggleBookmark,
  onRemove,
}) {
  return (
    <div className="relative group">
      <div
        onClick={onClick}
        className="relative h-[280px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 flex flex-col items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-1 shadow-sm animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Bookmark toggle button (resources page) */}
        {onToggleBookmark && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
            className={`absolute top-4 right-4 z-20 p-2 md:p-2.5 rounded-lg md:rounded-xl transition-all flex items-center justify-center shadow-lg cursor-pointer ${
              isBookmarked
                ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 opacity-100'
                : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 hover:bg-blue-500 hover:text-white opacity-0 group-hover:opacity-100'
            }`}
          >
            <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
          </button>
        )}

        {/* Remove button (bookmarks page) */}
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-lg cursor-pointer"
          >
            <Trash2 size={12} />
          </button>
        )}

        {/* Icon */}
        <div className="relative z-10 w-12 h-12 rounded-[1.2rem] bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-blue-500 shadow-md group-hover:scale-105 transition-all duration-700">
          {Icon && <Icon size={20} strokeWidth={1.5} />}
        </div>

        {/* Title & metadata */}
        <div className="relative z-10 text-center space-y-2 w-full">
          <div className="space-y-1">
            <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest leading-relaxed max-w-[180px] mx-auto group-hover:text-blue-500 transition-colors duration-500 line-clamp-2">
              {course.title || course.subject_name}
            </h3>
            <div className="space-y-1 pt-1">
              <p className="text-[7.5px] font-black tracking-[0.2em] text-slate-500 uppercase">
                {course.code || 'CORE'}
              </p>
              {badgeLabel && (
                <p className="text-[6.5px] font-black tracking-[0.15em] text-blue-500/80 uppercase px-2 py-0.5 rounded-full bg-blue-500/5 border border-blue-500/10 inline-block">
                  {badgeLabel}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 w-full flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              {footerLeftText}
            </span>
          </div>
          <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
            <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}
