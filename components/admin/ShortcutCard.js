'use client';

import Link from 'next/link';
import { ArrowRight, Lock, Unlock } from 'lucide-react';

export default function ShortcutCard({
  href,
  title,
  description,
  badgeText,
  icon: Icon,
  colorScheme = 'standard',
  loading = false,
  permissionKey,
  permissionValue,
  onPermissionToggle,
}) {
  if (loading) {
    return (
      <div className="animate-pulse p-6 sm:p-8 bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] flex flex-col justify-between h-[180px] sm:h-[200px] w-full">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 dark:bg-white/[0.05] rounded-2xl shrink-0" />
          <div className="h-5 w-20 bg-slate-200 dark:bg-white/[0.05] rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-slate-200 dark:bg-white/[0.05] rounded-md" />
          <div className="h-3 w-1/2 bg-slate-200 dark:bg-white/[0.05] rounded-full mt-1" />
        </div>
      </div>
    );
  }

  const classes = {
    amber: {
      card: 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-[var(--card-bg)] border-amber-500/30 hover:border-amber-500 hover:shadow-amber-500/10',
      iconBg: 'bg-amber-500/20 border-amber-500/30 text-amber-500',
      badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
      hoverText: 'group-hover:text-amber-500',
      radialGlow: 'bg-amber-500/10 group-hover:bg-amber-500/20'
    },
    purple: {
      card: 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-purple-500/50 hover:shadow-purple-500/5',
      iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
      badgeBg: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
      hoverText: 'group-hover:text-purple-500',
      radialGlow: 'bg-purple-500/[0.02] group-hover:bg-purple-500/10'
    },
    indigo: {
      card: 'bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-[var(--card-bg)] border-indigo-500/30 hover:border-indigo-500 hover:shadow-indigo-500/10',
      iconBg: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-500',
      badgeBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
      hoverText: 'group-hover:text-indigo-500',
      radialGlow: 'bg-indigo-500/10 group-hover:bg-indigo-500/20'
    },
    standard: {
      card: 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-blue-500/50 hover:shadow-blue-500/5',
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
      badgeBg: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
      hoverText: 'group-hover:text-blue-500',
      radialGlow: 'bg-blue-500/[0.02] group-hover:bg-blue-500/10'
    }
  };

  const scheme = classes[colorScheme] || classes.standard;
  const isEnabled = permissionValue === 'admin+moderator';

  const permissionToggle = permissionKey && onPermissionToggle && (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPermissionToggle(permissionKey, isEnabled ? 'admin' : 'admin+moderator');
      }}
      className={`absolute top-3 right-3 z-20 w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer group/permit ${
        isEnabled
          ? 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
          : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100'
      }`}
      title={isEnabled ? 'Moderators can access' : 'Only admins can access'}
    >
      {isEnabled ? <Unlock size={12} /> : <Lock size={12} />}
      <span className="absolute -top-8 right-0 bg-slate-800 text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover/permit:opacity-100 transition-opacity pointer-events-none shadow-lg">
        {isEnabled ? 'Mod Access' : 'Admin Only'}
      </span>
    </button>
  );

  return (
    <Link 
      href={href}
      className={`group relative overflow-hidden p-6 sm:p-8 border-2 rounded-[2rem] sm:rounded-[2.5rem] shadow-lg transition-all hover:-translate-y-1 duration-500 flex flex-col justify-between h-[180px] sm:h-[200px] cursor-pointer block ${scheme.card}`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -z-10 transition-all ${scheme.radialGlow}`} />
      
      {permissionToggle}

      <div className="flex items-center justify-between relative z-10">
        {Icon && (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 border rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500 shrink-0 ${scheme.iconBg}`}>
            <Icon size={20} />
          </div>
        )}
        {badgeText && (
          <span className={`text-[9px] font-black px-3 py-1 border rounded-full uppercase tracking-widest ${scheme.badgeBg}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div className="relative z-10 text-left mt-4">
        <h4 className={`text-base sm:text-lg font-black text-[var(--foreground)] uppercase tracking-tight transition-colors truncate ${scheme.hoverText}`}>
          {title}
        </h4>
        <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 truncate">
          {description} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform shrink-0" />
        </p>
      </div>
    </Link>
  );
}
