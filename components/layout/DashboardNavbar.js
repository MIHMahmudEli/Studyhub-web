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
  Bell,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#02040a]/40 backdrop-blur-xl border-b border-white/5 px-6 py-3">
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
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Search & Profile Section */}
        <div className="flex-1 max-w-[500px] hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search for notes, subjects, or peers..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/5 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* User Stats */}
          <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Coins size={16} />
              <span className="text-xs font-black tracking-tighter">{user?.points || 0}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest truncate max-w-[100px]">
              {user?.name?.split(' ')[0]}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#02040a]" />
            </button>
            <button 
              onClick={logout}
              className="p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
