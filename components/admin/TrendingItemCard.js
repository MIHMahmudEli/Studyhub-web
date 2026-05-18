'use client';

import { Download, ExternalLink } from 'lucide-react';

export default function TrendingItemCard({ item, index, type = 'note', accentColor = 'orange' }) {
  // Styles for rank badge
  const rankStyles = 
    index === 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-lg shadow-amber-500/10' :
    index === 1 ? 'bg-slate-400/10 text-slate-400 border-slate-400/30' :
    index === 2 ? (accentColor === 'rose' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30') :
    'bg-slate-100 dark:bg-white/[0.05] text-slate-500 border-slate-200 dark:border-white/[0.05]';

  // Subtitle line details
  const subtitleLine = type === 'resource'
    ? `${item.subject ? item.subject.toUpperCase() : 'GENERAL SUBJECT'} • ${item.course_code ? item.course_code.toUpperCase() : 'N/A'}`
    : `${item.course_code ? item.course_code.toUpperCase() : 'COURSE'} • ${item.dept ? item.dept.toUpperCase() : 'GENERAL'}`;

  // Dynamic accent classes mapping
  const bgAccentClass = accentColor === 'rose' ? 'bg-rose-500/10' : 'bg-orange-500/10';
  const borderAccentClass = accentColor === 'rose' ? 'border-rose-500/20' : 'border-orange-500/20';
  const textAccentClass = accentColor === 'rose' ? 'text-rose-500' : 'text-orange-500';
  const hoverBgAccentClass = accentColor === 'rose' ? 'hover:bg-rose-500' : 'hover:bg-orange-500';
  const hoverBorderAccentClass = accentColor === 'rose' ? 'hover:border-rose-500/30' : 'hover:border-orange-500/30';

  const typeLabel = type === 'resource' ? 'Resource' : 'Note';

  return (
    <div className={`bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 space-y-4 shadow-sm ${hoverBorderAccentClass} transition-all`}>
      <div className="flex items-center gap-3">
        <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black border shrink-0 ${rankStyles}`}>
          #{index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-black text-sm text-[var(--foreground)] truncate">
            {item.title}
          </p>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">
            {subtitleLine}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border)]">
        <div className="flex items-center gap-1.5 font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl shrink-0 text-xs">
          <Download size={14} />
          <span>{item.downloads || 0} DLs</span>
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--card-border)]">
        <a 
          href={item.file_path}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full flex items-center justify-center gap-2 py-3 ${bgAccentClass} ${hoverBgAccentClass} hover:text-white border ${borderAccentClass} ${textAccentClass} rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm shrink-0`}
        >
          <span>Inspect {typeLabel}</span> <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
