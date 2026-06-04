'use client';

import Link from 'next/link';
import { UploadCloud, BookOpen, Bookmark, Trophy, Calendar, Layers, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const SECTIONS = [
  {
    title: 'Discovery & Rankings',
    items: [
      {
        href: '/notes',
        icon: BookOpen,
        label: 'Browse Repository',
        desc: 'Explore all study notes',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        adminOnly: false,
      },
      {
        href: '/bookmarks',
        icon: Bookmark,
        label: 'Saved Bookmarks',
        desc: 'Quick access to favorites',
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
        adminOnly: false,
      },
      {
        href: '/leaderboard',
        icon: Trophy,
        label: 'Leaderboard',
        desc: 'See top contributors',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        adminOnly: false,
      },
    ],
  },
  {
    title: 'Content Management',
    items: [
      {
        href: '/upload',
        icon: UploadCloud,
        label: 'Upload New Note',
        desc: 'Contribute study materials',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        adminOnly: false,
      },
      {
        href: '/dashboard/uploaded-notes',
        icon: FileText,
        label: 'Uploaded Notes',
        desc: 'Manage your contributions',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        adminOnly: false,
      },
      {
        href: '/resources/upload_resources',
        icon: Layers,
        label: 'Publish Resource',
        desc: 'Share academic resources',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        adminOnly: true,
      },
    ],
  },
  {
    title: 'Tools & Utilities',
    items: [
      {
        href: '/dashboard/routine',
        icon: Calendar,
        label: 'Class Routine',
        desc: 'View your class schedule',
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        adminOnly: false,
      },
    ],
  },
];

export default function QuickShortcuts() {
  const { user } = useAuth();
  const isAdminOrMod = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <div className="space-y-10">
      {SECTIONS.map((section) => {
        const visibleItems = section.items.filter(item => !item.adminOnly || isAdminOrMod);
        if (visibleItems.length === 0) return null;

        return (
          <div key={section.title} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--card-border)]" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 shrink-0">
                {section.title}
              </h3>
              <div className="h-px flex-1 bg-[var(--card-border)]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-4 p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl hover:bg-white dark:hover:bg-white/[0.03] hover:translate-x-0.5 transition-all duration-300 shadow-sm"
                >
                  <div className={`w-10 h-10 ${item.bg} ${item.border} rounded-2xl flex items-center justify-center ${item.color} shrink-0`}>
                    <item.icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.label}</p>
                    <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 truncate">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
