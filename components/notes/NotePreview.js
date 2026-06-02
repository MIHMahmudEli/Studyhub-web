'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FileText, Loader2 } from 'lucide-react';

export default function NotePreview({ note, isReadingMode, downloading, onDownload }) {
  const [contentLoaded, setContentLoaded] = useState(false);

  return (
    <div className={`w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] overflow-hidden shadow-2xl relative group transition-all duration-500 ${isReadingMode ? 'h-[85vh]' : 'h-[500px] md:h-[800px]'}`}>
      {note.file_path ? (
        <>
          {!contentLoaded && (note.file_type?.toLowerCase() === 'pdf' || ['jpg', 'jpeg', 'png', 'webp'].includes(note.file_type?.toLowerCase())) && (
            <div className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-black/60 flex flex-col items-center justify-center z-10 space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/10 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <div className="w-14 h-14 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-xl">
                  <FileText size={24} className="text-purple-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2 animate-pulse">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Loading Document</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preparing high-quality preview...</p>
              </div>
            </div>
          )}
          {note.file_type?.toLowerCase() === 'pdf' ? (
            <iframe
              src={`${note.file_path}#toolbar=0&navpanes=0`}
              className={`w-full h-full border-none transition-opacity duration-500 ${contentLoaded ? 'opacity-100' : 'opacity-0'}`}
              title={note.title}
              onLoad={() => setContentLoaded(true)}
            />
          ) : ['jpg', 'jpeg', 'png', 'webp'].includes(note.file_type?.toLowerCase()) ? (
            <Image
              src={note.file_path}
              alt={note.title}
              fill
              className={`object-contain transition-opacity duration-500 ${contentLoaded ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 1024px) 100vw, 66vw"
              onLoad={() => setContentLoaded(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <FileText size={64} className="text-purple-500/20" />
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">Preview Not Available</h3>
              <button
                onClick={onDownload}
                disabled={downloading}
                className="px-6 py-3 bg-purple-500/10 text-purple-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {downloading ? <Loader2 size={14} className="animate-spin inline" /> : <FileText size={14} className="inline" />}
                {downloading ? ' Downloading...' : ' Download to View'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <FileText size={64} className="text-purple-500/20 mb-6" />
          <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">No Document Found</h3>
        </div>
      )}
    </div>
  );
}
