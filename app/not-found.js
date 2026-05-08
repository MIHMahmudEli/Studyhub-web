'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import StudyHubLogo from '@/components/ui/StudyHubLogo';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#06080f] text-[#e8eaf0] flex flex-col items-center justify-center overflow-hidden p-6 text-center">
      
      {/* 🔮 Ambient Background Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_70%)] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 max-w-[480px]">
        {/* 🏷️ Header Logo */}
        <div className="mb-12 flex justify-center transform hover:scale-110 transition-transform duration-300 cursor-pointer">
          <StudyHubLogo size={40} textSize={20} />
        </div>

        {/* 🚀 404 Text with Floating Animation */}
        <div className="relative inline-block">
          <h1 className="text-[clamp(6rem,15vw,10rem)] font-black leading-none m-0 bg-clip-text text-transparent bg-gradient-to-br from-[#60a5fa] via-[#818cf8] to-[#c084fc] tracking-tighter animate-float drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">
            404
          </h1>
          {/* Subtle glow underneath */}
          <div className="absolute -inset-2 bg-blue-500/20 blur-3xl -z-10 rounded-full" />
        </div>

        <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-bold text-[#f1f5f9] mt-4 mb-4">
          Lost in Space?
        </h2>

        <p className="text-base text-[#94a3b8] leading-relaxed mb-10">
          The page you&apos;re looking for has drifted away or never existed in this galaxy.
          Let&apos;s get you back to your studies.
        </p>

        {/* 🔘 Action Buttons with Premium Hover Effects */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Link 
            href="/" 
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 bg-[#2563eb] text-white font-bold text-[15px] rounded-xl transition-all duration-300 hover:bg-[#1d4ed8] hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95"
          >
            <Home size={18} className="group-hover:rotate-12 transition-transform" />
            <span>Back to Home</span>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/5 border border-white/10 text-[#94a3b8] font-semibold text-[15px] rounded-xl transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/20 active:scale-95"
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>
      </div>

      {/* 🏛️ Decorative Footer */}
      <div className="absolute bottom-8 text-[11px] text-slate-800 font-bold tracking-[0.2em] uppercase pointer-events-none select-none">
        StudyHub Academic Error Handling — v1.0
      </div>

      {/* 🎭 Custom Floating Animation */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
