'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { apiRequest } from '@/lib/api';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Toast from '@/components/ui/Toast';
import SpacePreview from '@/components/space/SpacePreview';
import { Moon, Sun, Sparkles, Save, ArrowLeft, Palette, Check } from 'lucide-react';
import Link from 'next/link';

const DARK_THEMES = [
  {
    id: 'current',
    label: 'Deep Space',
    desc: 'An immersive deep-space experience with a twinkling starfield, realistic shooting stars, and rich indigo-purple-cosmic nebula clouds.',
    icon: Moon,
    preview: 'from-indigo-600 via-purple-700 to-indigo-900',
    hasAnimation: true,
  },
  {
    id: 'previous',
    label: 'Midnight',
    desc: 'A clean, minimal dark surface with subtle nebula accents and no starfield — perfect for reduced visual noise.',
    icon: Moon,
    preview: 'from-indigo-500/40 via-purple-500/30 to-pink-500/20',
    hasAnimation: false,
  },
];

const LIGHT_THEMES = [
  {
    id: 'current',
    label: 'Dawn',
    desc: 'A crisp, bright surface with gentle nebula accents for a clean reading experience.',
    icon: Sun,
    preview: 'from-blue-400 via-purple-400 to-cyan-400',
  },
];

export default function AdminThemePage() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const { theme, darkThemeVariant, lightThemeVariant, refreshThemeVariants, previewTheme, clearPreview } = useTheme();
  const router = useRouter();

  const [selectedDark, setSelectedDark] = useState(darkThemeVariant);
  const [selectedLight, setSelectedLight] = useState(lightThemeVariant);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const initialized = useRef(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isClosing: true }));
      setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
    }, 5000);
  };

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'moderator'))) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (tokenReady && user && !initialized.current) {
      initialized.current = true;
      setSelectedDark(darkThemeVariant);
      setSelectedLight(lightThemeVariant);
    }
  }, [tokenReady, user, darkThemeVariant, lightThemeVariant]);

  // Restore saved variant on unmount (admin navigates away without saving)
  useEffect(() => {
    return () => clearPreview();
  }, [clearPreview]);

  const hasChanges = selectedDark !== darkThemeVariant || selectedLight !== lightThemeVariant;

  const handleSelect = (mode, variant) => {
    if (mode === 'dark') {
      setSelectedDark(variant);
    } else {
      setSelectedLight(variant);
    }
    previewTheme(mode, variant);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        apiRequest('/admin/settings', { method: 'POST', body: { key: 'dark_theme', value: selectedDark } }),
        apiRequest('/admin/settings', { method: 'POST', body: { key: 'light_theme', value: selectedLight } }),
      ]);
      await refreshThemeVariants();
      showToast('Theme preferences saved and applied globally.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to save theme settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <main className="min-h-screen text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />
      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 sm:space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-500 text-[9px] font-black uppercase tracking-[0.3em]">
                <Palette size={12} /> Theme Management
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500">Appearance</span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest max-w-[600px] mx-auto md:mx-0">
                Choose which dark and light themes all users see. Changes apply instantly across the platform.
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-500 hover:text-[var(--foreground)] hover:border-purple-500/30 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer shrink-0"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
          </div>

          {/* Dark Theme Selection */}
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                <Moon size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest">Dark Theme</h2>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Choose which dark variant users see in Dark Mode</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DARK_THEMES.map((t) => {
                const isActive = selectedDark === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelect('dark', t.id)}
                    className={`group relative text-left p-5 sm:p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'border-indigo-500/50 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
                        : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:border-indigo-500/20 hover:bg-indigo-500/[0.02]'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center z-10">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                    {t.hasAnimation ? (
                      <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 shadow-md">
                        <SpacePreview />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                            <Icon size={20} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.preview} flex items-center justify-center text-white mb-4 shadow-md`}>
                        <Icon size={20} />
                      </div>
                    )}
                    <h3 className="text-xs font-black uppercase tracking-widest mb-1.5">{t.label}</h3>
                    <p className="text-[9px] font-medium text-slate-500 leading-relaxed">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Light Theme Selection */}
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <Sun size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest">Light Theme</h2>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Choose which light variant users see in Light Mode</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LIGHT_THEMES.map((t) => {
                const isActive = selectedLight === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelect('light', t.id)}
                    className={`group relative text-left p-5 sm:p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'border-amber-400/50 bg-amber-500/5 shadow-lg shadow-amber-500/10'
                        : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:border-amber-400/20 hover:bg-amber-500/[0.02]'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.preview} flex items-center justify-center text-white mb-4 shadow-md`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-1.5">{t.label}</h3>
                    <p className="text-[9px] font-medium text-slate-500 leading-relaxed">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Save Bar */}
          <div className="sticky bottom-6 flex justify-center">
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.75rem] font-black text-[11px] uppercase tracking-widest transition-all cursor-pointer shadow-xl ${
                hasChanges && !saving
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95'
                  : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {hasChanges ? 'Save & Apply Globally' : 'No Changes'}
                </>
              )}
            </button>
          </div>

        </div>
      </div>
      <Toast toast={toast} closeToast={() => setToast(prev => ({ ...prev, show: false }))} />
    </main>
  );
}
