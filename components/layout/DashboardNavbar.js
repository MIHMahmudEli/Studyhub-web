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
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import StudyHubLogo from '@/components/ui/StudyHubLogo';

const navLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
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
            className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-[var(--foreground)] transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Stats */}
          <div className="flex items-center gap-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl px-4 py-2">
            <div className="flex items-center gap-2 text-amber-500">
              <Coins size={16} />
              <span className="text-xs font-black tracking-tighter">{user?.points || 0}</span>
            </div>
            <div className="w-px h-3 bg-[var(--card-border)]" />
            <span className="text-[12px] font-black text-[var(--foreground)] uppercase tracking-tighter truncate max-w-[120px]">
              {user?.name?.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
