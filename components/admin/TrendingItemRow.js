'use client';

import { FileText, Download, ExternalLink } from 'lucide-react';

export default function TrendingItemRow({ item, index, type = 'note', accentColor = 'orange' }) {
  // Styles for rank badge
  const rankStyles = 
    index === 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-lg shadow-amber-500/10' :
    index === 1 ? 'bg-slate-400/10 text-slate-400 border-slate-400/30' :
    index === 2 ? (accentColor === 'rose' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30') :
    'bg-[var(--card-bg)] text-slate-500 border-[var(--card-border)]';

  // Subtitle line 1: Subject or Course details + uploader
  const subtitleLine1 = type === 'resource' 
    ? `${item.subject ? item.subject.toUpperCase() : 'GENERAL SUBJECT'} ${item.uploader?.name ? `• by ${item.uploader.name.split(' ')[0]}` : ''}`
    : `${item.course_code ? item.course_code.toUpperCase() : 'COURSE'} ${item.uploader?.name ? `• by ${item.uploader.name.split(' ')[0]}` : ''}`;

  // Subtitle line 2: Course & term (for resource) or Department (for note)
  const subtitleLine2 = type === 'resource' 
    ? (
      <div>
        <p className="text-xs">{item.course_code ? item.course_code.toUpperCase() : 'N/A'}</p>
        <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{item.term || 'General'}</p>
      </div>
    )
    : (
      <span>{item.dept ? item.dept.toUpperCase() : 'GENERAL'}</span>
    );

  // Dynamic accent classes mapping
  const bgAccentClass = accentColor === 'rose' ? 'bg-rose-500/10' : 'bg-orange-500/10';
  const borderAccentClass = accentColor === 'rose' ? 'border-rose-500/20' : 'border-orange-500/20';
  const textAccentClass = accentColor === 'rose' ? 'text-rose-500' : 'text-orange-500';
  const hoverTextAccentClass = accentColor === 'rose' ? 'hover:text-rose-500' : 'hover:text-orange-500';
  const hoverBgAccentClass = accentColor === 'rose' ? 'hover:bg-rose-500' : 'hover:bg-orange-500';

  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      <td className="py-4 sm:py-5 pl-4 whitespace-nowrap">
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border shrink-0 ${rankStyles}`}>
          #{index + 1}
        </span>
      </td>
      <td className="py-4 sm:py-5 max-w-[280px]">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl ${bgAccentClass} border ${borderAccentClass} flex items-center justify-center ${textAccentClass} shrink-0 shadow-sm`}>
            <FileText size={18} />
          </div>
          <div className="truncate">
            <p className={`font-black text-sm text-[var(--foreground)] truncate ${hoverTextAccentClass} transition-colors`}>
              {item.title}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {subtitleLine1}
            </p>
          </div>
        </div>
      </td>
      <td className="py-4 sm:py-5 whitespace-nowrap text-slate-300 font-black">
        {subtitleLine2}
      </td>
      <td className="py-4 sm:py-5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl w-fit shrink-0">
          <Download size={14} />
          <span>{item.downloads || 0}</span>
        </div>
      </td>
      <td className="py-4 sm:py-5 text-right pr-4 whitespace-nowrap">
        <a 
          href={item.file_path}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-4 py-2 ${bgAccentClass} ${hoverBgAccentClass} hover:text-white border ${borderAccentClass} ${textAccentClass} rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm shrink-0`}
        >
          <span>Inspect</span> <ExternalLink size={14} />
        </a>
      </td>
    </tr>
  );
}
