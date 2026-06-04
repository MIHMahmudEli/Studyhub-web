import { Sun, Moon, Sparkles, Star, LayoutDashboard } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function PreferencesTab({ theme, toggleTheme }) {
  const { darkThemeVariant, lightThemeVariant } = useTheme();
  const { user } = useAuth();
  const isRamadan = (theme === 'dark' ? darkThemeVariant : lightThemeVariant) === 'ramadan';
  const isAdmin = user?.role === 'admin';
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Appearance & View</h3>
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Configure layout themes and dark mode preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-500/5 border border-[var(--card-border)] rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">Current Workspace Theme</p>
              <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Toggle between bright light or cosmic dark theme</p>
            </div>
          </div>

          <button 
            onClick={toggleTheme}
            className="px-5 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-blue-500/30 text-slate-800 dark:text-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={14} className="text-amber-500 animate-spin-slow" /> Switch to Light
              </>
            ) : (
              <>
                <Moon size={14} className="text-blue-500" /> Switch to Dark
              </>
            )}
          </button>
        </div>

        {/* Ramadan Theme Status */}
        <div className={`flex items-center justify-between p-4 rounded-2xl border ${
          isRamadan
            ? 'bg-amber-500/10 border-amber-500/20'
            : 'bg-slate-500/5 border-[var(--card-border)]'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isRamadan
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-500'
                : 'bg-slate-500/10 border border-slate-500/20 text-slate-400'
            }`}>
              <Star size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: isRamadan ? '#d97706' : 'var(--text-1)' }}>
                Ramadan Theme
              </p>
              <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                {isRamadan ? 'Golden crescent glow & festive ambiance active' : 'Festive Ramadan theme available'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
              isRamadan
                ? 'bg-amber-500/15 text-amber-500 border-amber-500/20'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}>
              {isRamadan ? 'Active' : 'Inactive'}
            </span>
            {isAdmin && (
              <Link
                href="/admin/theme"
                className="flex items-center gap-1.5 px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-amber-500/30 text-slate-500 hover:text-amber-500 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
              >
                <LayoutDashboard size={12} /> Configure
              </Link>
            )}
          </div>
        </div>

        {/* Info Tips */}
        <div className="p-5 bg-blue-500/[0.02] border border-blue-500/10 rounded-2xl flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mt-0.5 flex-shrink-0">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Synchronized Preferences</h4>
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
              Your interface settings automatically synchronize with your current device environment. Toggle settings freely to enhance readability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
