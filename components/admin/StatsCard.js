'use client';

import Link from 'next/link';
import { Lock, Unlock } from 'lucide-react';

export default function StatsCard({
  href,
  title,
  value,
  subtitle,
  icon: Icon,
  loading = false,
  colorScheme = 'blue',
  iconAnimation = '',
  permissionKey,
  permissionValue,
  onPermissionToggle,
}) {
  if (loading) {
    return (
      <div className="animate-pulse bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 h-[140px] sm:h-[150px] flex justify-between items-start w-full">
        <div className="space-y-3 flex-1">
          <div className="h-2.5 w-2/3 bg-slate-200 dark:bg-white/[0.05] rounded-full" />
          <div className="h-8 w-1/2 bg-slate-200 dark:bg-white/[0.05] rounded-lg mt-2" />
          <div className="h-2 w-1/3 bg-slate-200 dark:bg-white/[0.05] rounded-full mt-2" />
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-200 dark:bg-white/[0.05] shrink-0" />
      </div>
    );
  }

  const colors = {
    emerald: {
      borderHover: 'hover:border-emerald-500/30',
      gradient: 'from-emerald-500/[0.02]',
      text: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
    },
    purple: {
      borderHover: 'hover:border-purple-500/30',
      gradient: 'from-purple-500/[0.02]',
      text: 'text-purple-500',
      iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-500'
    },
    amber: {
      borderHover: 'hover:border-amber-500/30',
      gradient: 'from-amber-500/[0.02]',
      text: 'text-amber-500',
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500'
    },
    blue: {
      borderHover: 'hover:border-blue-500/30',
      gradient: 'from-blue-500/[0.02]',
      text: 'text-blue-500',
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-500'
    },
    orange: {
      borderHover: 'hover:border-orange-500/30',
      gradient: 'from-orange-500/[0.02]',
      text: 'text-orange-500',
      iconBg: 'bg-orange-500/10 border-orange-500/20 text-orange-500'
    },
    rose: {
      borderHover: 'hover:border-rose-500/30',
      gradient: 'from-rose-500/[0.02]',
      text: 'text-rose-500',
      iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-500'
    }
  };

  const scheme = colors[colorScheme] || colors.blue;
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

  const cardContent = (
    <>
      <div className={`absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${scheme.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      {permissionToggle}
      <div className="flex justify-between items-start relative z-10 w-full">
        <div className="space-y-2 sm:space-y-3 flex-1 min-w-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400 block truncate">{title}</span>
          <h3 className={`text-3xl sm:text-4xl font-black tracking-tight ${scheme.text}`}>
            {value}
          </h3>
          <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mt-1 block truncate">{subtitle}</p>
        </div>
        {Icon && (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${scheme.iconBg} border flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0 ml-4`}>
            <Icon size={20} className={iconAnimation} />
          </div>
        )}
      </div>
    </>
  );

  const baseClassName = `group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 ${scheme.borderHover} block w-full`;

  if (href) {
    return (
      <Link href={href} className={`${baseClassName} cursor-pointer`}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={baseClassName}>
      {cardContent}
    </div>
  );
}
