'use client';

import { FileText, Calendar, User, ArrowUpRight, BookOpen, Star } from 'lucide-react';

export default function NoteCard({ note }) {
  return (
    <div className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-[24px] p-6 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-500 cursor-pointer overflow-hidden fade-up">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
          <FileText size={24} />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Star size={10} className="text-amber-400 fill-amber-400" />
          {note.category || 'General'}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
          {note.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed">
          {note.description || 'No description provided for this study resource.'}
        </p>

        {/* Footer Info */}
        <div className="pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <User size={14} className="text-slate-600" />
            <span className="text-[11px] font-bold truncate tracking-tight">{note.authorName || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 justify-end">
            <Calendar size={14} className="text-slate-600" />
            <span className="text-[11px] font-bold tracking-tight">
              {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Arrow */}
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500 text-blue-400">
        <ArrowUpRight size={20} />
      </div>
    </div>
  );
}
