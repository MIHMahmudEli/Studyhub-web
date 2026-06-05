'use client';

import {
  User,
  Lock,
  Palette,
  Link2,
  ChevronRight
} from 'lucide-react';

const TABS = [
  { key: 'profile', icon: User, label: 'Personal Info' },
  { key: 'security', icon: Lock, label: 'Security & Password' },
  { key: 'social', icon: Link2, label: 'Social Links' },
  { key: 'preferences', icon: Palette, label: 'Appearance & View' },
];

export default function SettingsSidebar({ user, activeTab, onTabChange }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 shadow-sm backdrop-blur-xl space-y-2">
      <div className="flex items-center gap-4 pb-6 border-b border-[var(--card-border)] mb-4">
        {user.profile_pic ? (
          <img
            src={user.profile_pic}
            alt={user.name}
            className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-[var(--card-border)]"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg uppercase">
            {user.name ? user.name[0] : 'U'}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm">{user.name}</p>
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-500/5 px-2 py-0.5 rounded border border-[var(--card-border)] mt-1 inline-block">
            {user.role}
          </span>
        </div>
      </div>

      {TABS.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === key
              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm shadow-blue-500/5'
              : 'text-slate-500 dark:text-slate-400 hover:text-[var(--foreground)] hover:bg-slate-500/5 border border-transparent'
          }`}
        >
          <span className="flex items-center gap-3">
            <Icon size={16} /> {label}
          </span>
          <ChevronRight size={14} className={`transition-transform duration-300 ${activeTab === key ? 'translate-x-0.5' : 'opacity-0'}`} />
        </button>
      ))}
    </div>
  );
}
