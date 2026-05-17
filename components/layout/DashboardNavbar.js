'use client';

import { useState } from 'react';
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
  LogOut,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdminOrMod = user?.role === 'admin' || user?.role === 'moderator';
  const dashboardHref = isAdminOrMod ? '/admin/dashboard' : '/dashboard';

  const dynamicNavLinks = navLinks;

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
            {dynamicNavLinks.map((link) => {
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

        {/* User Actions & Stats - Desktop */}
        <div className="hidden lg:flex items-center gap-4">
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
            href={dashboardHref} 
            className={`relative flex items-center gap-3 rounded-2xl px-4 py-2 transition-all cursor-pointer border group ${
              pathname === dashboardHref
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
                    <span className="text-[9px] font-black text-emerald-500 shrink-0 bg-emerald-500/10 dark:emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/20">+5 PTS</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="w-px h-3 bg-[var(--card-border)]" />
            
            <div className="flex items-center gap-2 shrink-0">
              {user?.profile_pic ? (
                <img 
                  src={user.profile_pic} 
                  alt={user?.name} 
                  className="w-5 h-5 rounded-md object-cover border border-[var(--card-border)]"
                />
              ) : (
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-[9px] uppercase shadow-sm shrink-0">
                  {user?.name ? user.name[0] : 'U'}
                </div>
              )}
              <span className={`text-[12px] font-black uppercase tracking-tighter truncate max-w-[100px] transition-colors ${
                pathname === dashboardHref
                  ? 'text-blue-500'
                  : 'text-[var(--foreground)] group-hover:text-blue-500'
              }`}>
                {user?.name?.split(' ')[0]}
              </span>
            </div>
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

        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-[var(--foreground)] hover:border-blue-500/30 transition-all cursor-pointer flex items-center justify-center"
          title="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[var(--background)]/95 border-b border-[var(--card-border)] backdrop-blur-2xl shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300 ease-out z-[99]">
          
          {/* Nav Links */}
          <div className="flex flex-col gap-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 mb-1">Navigation</p>
            {dynamicNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 ${
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

          <div className="h-px bg-[var(--card-border)]" />

          {/* User Controls and Stats */}
          <div className="flex flex-col gap-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">User & Controls</p>
            
            <Link 
              href={dashboardHref}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between gap-4 px-4 py-3 border rounded-2xl transition-all cursor-pointer ${
                pathname === dashboardHref 
                  ? 'bg-blue-500/10 border-blue-500/20' 
                  : 'bg-[var(--card-bg)] border-[var(--card-border)] active:border-blue-500/30'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {user?.profile_pic ? (
                  <img 
                    src={user.profile_pic} 
                    alt={user?.name} 
                    className="w-5 h-5 rounded-md object-cover border border-[var(--card-border)]"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-[9px] uppercase shadow-sm shrink-0">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                )}
                <span className={`text-[12px] font-black uppercase tracking-tighter truncate max-w-[100px] transition-colors ${
                  pathname === dashboardHref ? 'text-blue-500' : 'text-[var(--foreground)]'
                }`}>
                  {user?.name?.split(' ')[0]}
                </span>
              </div>
              <div className="w-px h-3 bg-[var(--card-border)]" />
              <div className="relative group/mobile-points flex items-center gap-1.5 text-amber-500 font-black text-xs">
                <Coins size={14} />
                <span>{user?.points || 0} PTS</span>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-2 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-[var(--foreground)] rounded-xl text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer"
              >
                {theme === 'dark' ? <><Sun size={14} /> Light Mode</> : <><Moon size={14} /> Dark Mode</>}
              </button>
              <button 
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
