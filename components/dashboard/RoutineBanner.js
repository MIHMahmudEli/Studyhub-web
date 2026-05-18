'use client';

import { useRouter } from 'next/navigation';
import { Calendar, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RoutineBanner() {
  const router = useRouter();

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/50 p-8 md:p-10 shadow-lg hover:border-indigo-500/40 transition-all duration-500 backdrop-blur-xl">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10 group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-pink-500/5 blur-[80px] rounded-full pointer-events-none -z-10" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
        
        {/* Left Side Content */}
        <div className="space-y-4 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em]">
            <Sparkles size={11} className="animate-pulse" /> New Feature
          </div>

          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
            Schedule Like A Pro with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Routine Pro
            </span>
          </h2>

          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
            Organize your academic life seamlessly. Create, view, and print highly optimized class routines inside StudyHub. No extra tabs, no hassle.
          </p>

          {/* Micro-feature checklist */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
            <span className="flex items-center gap-2 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              <CheckCircle2 size={12} className="text-indigo-400" /> 100% Seamless Integration
            </span>
            <span className="flex items-center gap-2 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              <CheckCircle2 size={12} className="text-purple-400" /> Auto-saves Progress
            </span>
            <span className="flex items-center gap-2 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              <CheckCircle2 size={12} className="text-pink-400" /> Print & Export Ready
            </span>
          </div>
        </div>

        {/* Right Side Call to Action */}
        <div className="flex-shrink-0">
          <button
            onClick={() => router.push('/dashboard/routine')}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 rounded-[1.75rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-[11px] uppercase tracking-widest hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all hover:scale-105 active:scale-95 duration-300 cursor-pointer shadow-lg group-hover:from-indigo-600 group-hover:to-pink-600"
          >
            <Calendar size={16} />
            <span>Generate Routine</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

      </div>
    </div>
  );
}
