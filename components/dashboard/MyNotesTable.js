'use client';

import Link from 'next/link';
import { UploadCloud, FileText, Sparkles, Eye, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function MyNotesTable({ notes, loading, deletingId, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Manage uploaded notes</h3>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Review the status of your submissions or delete them.</p>
        </div>
        
        <Link 
          href="/upload" 
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-xl shadow-purple-500/20 cursor-pointer"
        >
          <UploadCloud size={14} /> Upload new note
        </Link>
      </div>

      {loading ? (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 space-y-4 shadow-sm">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-500/5 rounded-2xl gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-xl animate-pulse" />
                <div className="space-y-2">
                  <Skeleton className="w-48 h-4 rounded animate-pulse" />
                  <Skeleton className="w-24 h-3 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-6 rounded-full animate-pulse" />
                <Skeleton className="w-8 h-8 rounded-xl animate-pulse" />
                <Skeleton className="w-8 h-8 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-sm">
          <div className="w-20 h-20 bg-slate-500/5 rounded-3xl flex items-center justify-center mb-6 border border-[var(--card-border)]">
            <FileText size={32} className="text-slate-400 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">No notes uploaded yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs font-semibold uppercase tracking-wider mb-6">
            You haven't uploaded any study materials. Upload your notes to earn academic points.
          </p>
          <Link 
            href="/upload" 
            className="flex items-center gap-2 px-6 py-3.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-purple-500/20"
          >
            <UploadCloud size={14} /> Start uploading
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Card List Layout - Premium & Highly Responsive */}
          <div className="md:hidden space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] flex flex-col gap-4 shadow-sm">
                
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-[13px]">{note.title}</p>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-500/5 px-2 py-0.5 rounded border border-[var(--card-border)] mt-1 inline-block">
                        {note.code}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {note.status === 'approved' && (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500">
                        Approved
                      </span>
                    )}
                    {note.status === 'pending' && (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500">
                        Pending
                      </span>
                    )}
                    {note.status === 'rejected' && (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-500/[0.02] dark:bg-white/[0.01] border border-[var(--card-border)] rounded-2xl p-3 text-center">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Created</p>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="border-x border-[var(--card-border)]">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Downloads</p>
                    <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">{note.downloads}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Rating</p>
                    <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {parseFloat(note.avg_rating) > 0 ? (
                        <span className="inline-flex items-center gap-0.5 justify-center">
                          <Sparkles size={10} className="text-amber-500 fill-amber-500" />
                          {parseFloat(note.avg_rating).toFixed(1)}
                        </span>
                      ) : '--'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div>
                  {note.status === 'approved' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Link 
                        href={`/notes/${note.id}`}
                        className="flex items-center justify-center gap-2 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-purple-500/20 transition-all cursor-pointer font-bold"
                      >
                        <Eye size={12} /> View Note
                      </Link>
                      <button 
                        onClick={() => onDelete(note.id)}
                        disabled={deletingId === note.id}
                        className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer font-bold"
                      >
                        {deletingId === note.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <><Trash2 size={12} /> Delete</>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onDelete(note.id)}
                      disabled={deletingId === note.id}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer font-bold"
                    >
                      {deletingId === note.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <><Trash2 size={12} /> Delete Note</>
                      )}
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

          {/* Desktop Table Layout - Hidden on Mobile */}
          <div className="hidden md:block bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 bg-slate-500/5">
                    <th className="py-5 px-6">Note & details</th>
                    <th className="py-5 px-4 text-center">Status</th>
                    <th className="py-5 px-4 text-center">Downloads</th>
                    <th className="py-5 px-4 text-center">Rating</th>
                    <th className="py-5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)] text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {notes.map((note) => (
                    <tr key={note.id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="py-5 px-6 max-w-xs md:max-w-md">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 flex-shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{note.title}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-500/5 px-2 py-0.5 rounded border border-[var(--card-border)]">
                                {note.code}
                              </span>
                              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                {new Date(note.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-center">
                        {note.status === 'approved' && (
                          <span className="inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10">
                            Approved
                          </span>
                        )}
                        {note.status === 'pending' && (
                          <span className="inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10">
                            Pending
                          </span>
                        )}
                        {note.status === 'rejected' && (
                          <span className="inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-500/10">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {note.downloads}
                      </td>
                      <td className="py-5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {parseFloat(note.avg_rating) > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            <Sparkles size={12} className="text-amber-500 fill-amber-500" />
                            {parseFloat(note.avg_rating).toFixed(1)}
                          </span>
                        ) : '--'}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {note.status === 'approved' && (
                            <Link 
                              href={`/notes/${note.id}`}
                              className="w-8 h-8 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-slate-500 hover:text-purple-500 hover:border-purple-500/30 transition-all shadow-sm cursor-pointer"
                              title="View Note"
                            >
                              <Eye size={14} />
                            </Link>
                          )}
                          <button 
                            onClick={() => onDelete(note.id)}
                            disabled={deletingId === note.id}
                            className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm cursor-pointer"
                            title="Delete Note"
                          >
                            {deletingId === note.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
