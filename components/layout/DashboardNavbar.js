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
  Bell,
  LogOut,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user: authUser, logout } = useAuth();

  // DEMO DATA - Using mock if no user is logged in
  const user = authUser || {
    name: 'Alex Rivera',
    points: 1250
  };

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

        {/* Search Bar - Desktop */}
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

        {/* User Actions - Desktop */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Coins size={16} />
              <span className="text-xs font-black tracking-tighter">{user.points}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest truncate max-w-[100px]">
              {user.name.split(' ')[0]}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#02040a]" />
            </button>
            <button 
              onClick={logout}
              className="p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-white/5 text-white border border-white/10 active:scale-95 transition-all"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden fixed inset-0 top-[73px] bg-[#02040a]/95 backdrop-blur-2xl transition-all duration-500 ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="p-6 flex flex-col gap-8 h-full overflow-y-auto">
          {/* User Info Mobile */}
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-3xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <User size={24} />
              </div>
              <div>
                <p className="text-white font-bold">{user.name}</p>
                <div className="flex items-center gap-2 text-amber-400">
                  <Coins size={14} />
                  <span className="text-xs font-black">{user.points} Points</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Mobile */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/30 transition-all"
            />
          </div>

          {/* Nav Links Mobile */}
          <div className="grid grid-cols-1 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl text-[15px] font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon size={20} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Logout Mobile */}
          <button 
            onClick={logout}
            className="mt-auto flex items-center gap-4 p-4 rounded-2xl text-[15px] font-bold text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all"
          >
            <LogOut size={20} />
            Logout from Account
          </button>
        </div>
      </div>
    </nav>
  );
}
