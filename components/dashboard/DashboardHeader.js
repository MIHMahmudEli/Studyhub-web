'use client';

import Link from 'next/link';
import { Sparkles, Settings, Calendar } from 'lucide-react';

export default function DashboardHeader({ user }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
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

      <div className="flex items-center gap-4">
        <Link 
          href="/settings"
          className="w-14 h-14 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-purple-500/30 flex items-center justify-center text-slate-500 hover:text-purple-500 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm backdrop-blur-xl"
          title="Account Settings"
        >
          <Settings size={20} className="animate-spin-slow" />
        </Link>
        
        <div className="flex items-center gap-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-4 shadow-sm backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Today's Date</p>
            <p className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
