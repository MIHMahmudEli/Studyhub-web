'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  Layers, 
  Bookmark, 
  Trophy, 
  UploadCloud, 
  Search, 
  User, 
  Coins,
  Sun,
  Moon,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import StudyHubLogo from '@/components/ui/StudyHubLogo';

const navLinks = [
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Resources', href: '/resources', icon: Layers },
  { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Upload', href: '/upload', icon: UploadCloud },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-[var(--background)]/40 backdrop-blur-xl border-b border-[var(--card-border)] px-6 py-3 transition-colors duration-500">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8">
        {/* Logo Section */}
        <div className="flex items-center gap-10">
          <Link href="/notes" className="transition-transform hover:scale-105 active:scale-95">
            <StudyHubLogo size={28} textSize={18} />
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                      : 'text-slate-400 hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] border border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>


        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-[var(--foreground)] transition-all cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Stats */}
          <Link 
            href="/dashboard" 
            className={`relative flex items-center gap-3 rounded-2xl px-4 py-2 transition-all cursor-pointer border group ${
              pathname === '/dashboard'
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-blue-500/30'
            }`}
          >
            {/* Points Section with its own hover popover group */}
            <div className="relative group/points flex items-center gap-2 text-amber-500 py-0.5 px-1 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 rounded-lg transition-colors">
              <Coins size={16} />
              <span className="text-xs font-black tracking-tighter">{user?.points || 0}</span>

              {/* Points Accumulation Rules Popover */}
              <div className="absolute right-0 top-full mt-3.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/points:opacity-100 group-hover/points:translate-y-0 transition-all duration-300 z-[9999] backdrop-blur-xl">
                <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-slate-100 dark:border-white/[0.05]">
                  <Coins size={14} className="text-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Points System</span>
                </div>
                <ul className="space-y-2.5">
                  <li className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Download a note</span>
                    <span className="text-[9px] font-black text-amber-500 shrink-0 bg-amber-500/10 dark:bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/20">+1 PTS</span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Notes Owner reward</span>
                    <span className="text-[9px] font-black text-amber-500 shrink-0 bg-amber-500/10 dark:bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/20">+1 PTS</span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Approved notes</span>
                    <span className="text-[9px] font-black text-emerald-500 shrink-0 bg-emerald-500/10 dark:bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/20">+5 PTS</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="w-px h-3 bg-[var(--card-border)]" />
            
            <span className={`text-[12px] font-black uppercase tracking-tighter truncate max-w-[120px] transition-colors ${
              pathname === '/dashboard'
                ? 'text-blue-500'
                : 'text-[var(--foreground)] group-hover:text-blue-500'
            }`}>
              {user?.name?.split(' ')[0]}
            </span>
          </Link>

          {/* Logout Button */}
          <button 
            onClick={logout}
            className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
