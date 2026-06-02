'use client';

import { ArrowLeft, Share2, Maximize2, Minimize, BookmarkPlus, Download, Loader2 } from 'lucide-react';

export default function NoteHeader({
  downloading,
  isBookmarked,
  isReadingMode,
  onBack,
  onShare,
  onToggleReadingMode,
  onToggleBookmark,
  onDownload,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <button
        onClick={onBack}
        className="group flex items-center gap-3 w-fit"
      >
        <div className="w-10 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-slate-500 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[var(--foreground)] transition-colors">
          Back to Feed
        </span>
      </button>

      <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-3 w-full md:w-auto">
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[10px] font-black tracking-widest uppercase text-slate-500 hover:text-purple-500 transition-all shadow-sm cursor-pointer"
        >
          <Share2 size={14} /> Share
        </button>
        <button
          onClick={onToggleReadingMode}
          className={`flex items-center justify-center gap-2 px-5 py-3 border rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-sm cursor-pointer ${
            isReadingMode
              ? 'bg-blue-500 text-white border-blue-400 hover:bg-blue-600'
              : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-500 hover:text-blue-500'
          }`}
        >
          {isReadingMode ? <><Minimize size={14} /> Exit</> : <><Maximize2 size={14} /> Preview</>}
        </button>
        <button
          onClick={onToggleBookmark}
          className={`flex items-center justify-center gap-2 px-5 py-3 border rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-sm cursor-pointer ${
            isBookmarked
              ? 'bg-purple-500 text-white border-purple-400'
              : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-500 hover:text-purple-500'
          }`}
        >
          <BookmarkPlus size={14} className={isBookmarked ? 'fill-white' : ''} />
          {isBookmarked ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={onDownload}
          disabled={downloading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-purple-600 transition-all shadow-xl shadow-purple-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {downloading ? 'Downloading...' : 'Download'}
        </button>
      </div>
    </div>
  );
}
