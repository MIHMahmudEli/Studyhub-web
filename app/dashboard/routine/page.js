'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import PageHeader from '@/components/ui/PageHeader';
import { Calendar, ArrowLeft, RefreshCw, ExternalLink, Sparkles, Clock } from 'lucide-react';

export default function RoutinePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [iframeLoading, setIframeLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const handleReload = () => {
    setIframeLoading(true);
    setReloadKey(prev => prev + 1);
  };

  if (authLoading) return null;
  if (!user && !authLoading) return null;

  const backAction = (
    <button 
      onClick={() => router.push('/dashboard')}
      className="flex items-center gap-2 text-slate-500 hover:text-purple-500 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer group"
    >
      <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
      Back to Dashboard
    </button>
  );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-16">
      <DashboardNavbar />

      {/* Header Container (with standard responsive side paddings and max-width alignment) */}
      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Majestic Header */}
          <PageHeader
            badgeIcon={Calendar}
            badgeText="Routine Pro Integration"
            badgeColorClass="text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
            glowColor="bg-indigo-500/10"
            title="Routine"
            titleHighlight="Generator"
            titleGradient="from-indigo-500 via-purple-500 to-pink-500"
            description="Generate, customize, and manage your university class routines seamlessly without leaving StudyHub."
            topAction={backAction}
          >
            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleReload}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-sm hover:text-indigo-500 hover:border-indigo-500/30 cursor-pointer"
                title="Reload Routine Pro"
              >
                <RefreshCw size={14} className={iframeLoading ? 'animate-spin' : ''} /> Reload
              </button>
              <a
                href="https://routine-pro-fawn.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-400 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-sm cursor-pointer"
              >
                <ExternalLink size={14} /> Open Direct
              </a>
            </div>
          </PageHeader>
        </div>
      </div>

      {/* Full-Bleed Edge-to-Edge Sandbox Canvas (No padding, no margins, flat corners) */}
      <div className="relative w-full overflow-hidden mt-6 border-t border-[var(--card-border)]">
        {/* Glowing Loading Skeleton Overlay */}
        {iframeLoading && (
          <div className="w-full h-[85vh] lg:h-[90vh] min-h-[750px] lg:min-h-[950px] flex flex-col items-center justify-center relative bg-slate-100 dark:bg-slate-950/15 rounded-none overflow-hidden">
            {/* Orbital pulse loaders */}
            <div className="absolute w-72 h-72 rounded-full border border-indigo-500/10 animate-ping duration-[3000ms]" />
            <div className="absolute w-48 h-48 rounded-full border border-purple-500/10 animate-pulse duration-[2000ms]" />
            
            <div className="z-10 flex flex-col items-center text-center space-y-6 px-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 animate-bounce">
                <Clock size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase tracking-[0.2em] text-[var(--foreground)] dark:text-slate-100 flex items-center justify-center gap-2">
                  Booting Routine Pro <Sparkles size={16} className="text-amber-500 animate-pulse" />
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 max-w-[320px]">
                  Loading your ultimate academic scheduler. This will only take a moment...
                </p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* The Seamless Embedded Iframe */}
        <iframe
          key={reloadKey}
          src="https://routine-pro-fawn.vercel.app/"
          className={`w-full border-0 rounded-none bg-transparent transition-all duration-1000 ${
            iframeLoading ? 'opacity-0 h-0 invisible' : 'opacity-100 h-[85vh] lg:h-[90vh] min-h-[750px] lg:min-h-[950px] visible'
          }`}
          title="Routine Pro Planner"
          allow="clipboard-write; clipboard-read"
          onLoad={() => setIframeLoading(false)}
        />
      </div>

    </main>
  );
}
