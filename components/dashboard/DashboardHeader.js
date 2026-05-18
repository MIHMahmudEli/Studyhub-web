'use client';

import Link from 'next/link';
import { Sparkles, Settings, Calendar } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

export default function DashboardHeader({ user }) {
  return (
    <PageHeader
      badgeIcon={Sparkles}
      badgeText="Student Portal"
      badgeColorClass="text-purple-500 bg-purple-500/10 border-purple-500/20"
      glowColor="bg-purple-500/10"
      title="Student"
      titleHighlight="Dashboard"
      titleGradient="from-purple-500 via-pink-500 to-amber-500"
      description="Manage your notes, view points, track download statistics, and lead the leaderboard."
    >
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
    </PageHeader>
  );
}
