'use client';

import Link from 'next/link';
import { Sparkles, Settings, Calendar } from 'lucide-react';

export default function DashboardHeader({ user }) {
  return (
    <div className="flex flex-col items-center md:items-start md:flex-row md:items-center justify-between gap-6 relative text-center md:text-left">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full -z-10 animate-pulse" />
      
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-500 text-[9px] font-black uppercase tracking-[0.3em]">
          <Sparkles size={12} className="animate-pulse" /> Student Portal
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
          Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500">Dashboard</span>
        </h1>
        <p className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-[500px]">
          Manage your notes, view points, track download statistics, and lead the leaderboard.
        </p>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
        <Link 
          href="/settings"
          className="flex-1 md:w-14 md:h-14 md:flex-initial flex items-center justify-center gap-2.5 rounded-[1.25rem] bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-purple-500/30 text-slate-500 hover:text-purple-500 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm backdrop-blur-xl py-4 md:py-0"
          title="Account Settings"
        >
          <Settings size={20} className="animate-spin-slow flex-shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest md:hidden">Settings</span>
        </Link>
        
        <div className="flex-1 md:flex-initial flex items-center gap-3.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.25rem] p-3.5 shadow-sm backdrop-blur-xl min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 flex-shrink-0">
            <Calendar size={18} />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider leading-none">Today's Date</p>
            <p className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 mt-1.5 truncate leading-none">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
