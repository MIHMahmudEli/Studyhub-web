'use client';

import Link from 'next/link';
import { UploadCloud, BookOpen, Bookmark, Trophy, ArrowRight, Layers, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function QuickShortcuts() {
  const { user } = useAuth();
  const isAdminOrMod = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Quick shortcuts</h3>
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${isAdminOrMod ? '6' : '5'} gap-4`}>
        <Link href="/upload" className="group flex items-center justify-between p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl hover:bg-white dark:hover:bg-white/[0.03] transition-all hover:translate-x-1 duration-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500"><UploadCloud size={16} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Upload new note</span>
          </div>
          <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <Link href="/notes" className="group flex items-center justify-between p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl hover:bg-white dark:hover:bg-white/[0.03] transition-all hover:translate-x-1 duration-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500"><BookOpen size={16} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Browse repository</span>
          </div>
          <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <Link href="/bookmarks" className="group flex items-center justify-between p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl hover:bg-white dark:hover:bg-white/[0.03] transition-all hover:translate-x-1 duration-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center text-pink-500"><Bookmark size={16} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Saved bookmarks</span>
          </div>
          <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/leaderboard" className="group flex items-center justify-between p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl hover:bg-white dark:hover:bg-white/[0.03] transition-all hover:translate-x-1 duration-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500"><Trophy size={16} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Leaderboard standings</span>
          </div>
          <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/dashboard/routine" className="group flex items-center justify-between p-6 bg-[var(--card-bg)] border border-indigo-500/30 rounded-3xl hover:bg-indigo-500/5 hover:border-indigo-500/50 transition-all hover:translate-x-1 duration-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500"><Calendar size={16} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Class Routine</span>
          </div>
          <ArrowRight size={14} className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
        </Link>

        {isAdminOrMod && (
          <Link href="/resources/upload_resources" className="group flex items-center justify-between p-6 bg-[var(--card-bg)] border border-amber-500/30 rounded-3xl hover:bg-amber-500/5 transition-all hover:translate-x-1 duration-500 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500"><Layers size={16} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Publish Resource</span>
            </div>
            <ArrowRight size={14} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
