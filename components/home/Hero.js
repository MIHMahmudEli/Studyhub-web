'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-32 md:pt-[160px] px-6 pb-20 md:pb-[120px] text-center relative overflow-hidden fade-up">
      {/* Background starfield grid */}
      <div className="absolute inset-0 -z-10 [background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:24px_24px] md:[background-size:32px_32px]" />
      
      {/* Nebula Glows - Adjusted for mobile */}
      <div className="absolute top-[-5%] left-[-20%] md:left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/10 blur-[80px] md:blur-[120px] rounded-full -z-10 animate-nebula" />
      <div className="absolute bottom-[0%] right-[-20%] md:right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-purple-600/10 blur-[70px] md:blur-[100px] rounded-full -z-10 animate-nebula [animation-delay:2s]" />

      {/* Center atmospheric glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] md:h-[500px] bg-[radial-gradient(ellipse,rgba(59,130,246,0.12)_0%,transparent_70%)] -z-10" />

      <div className="max-w-[800px] mx-auto">
        <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-blue-500/10 border border-blue-500/25 rounded-full text-blue-400 text-[12px] font-bold uppercase tracking-widest mb-7 fade-up">
          ✦ Academic Collaboration Platform
        </div>

        <h1 className="text-[clamp(2.4rem,6vw,4.5rem)] font-black leading-[1.08] tracking-tight mb-6 text-[#f0f4ff] fade-up delay-1">
          Study smarter.<br />
          <span className="bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Grow together.</span>
        </h1>

        <p className="text-[clamp(1rem,2vw,1.2rem)] text-slate-500 leading-relaxed max-w-[560px] mx-auto mb-12 fade-up delay-2">
          Join thousands of students sharing high-quality notes, earning badges,
          and climbing the academic leaderboard — all in one place.
        </p>

        <div className="flex justify-center items-center gap-4 flex-wrap fade-up delay-3">
          <Link 
            href="/auth" 
            className="group inline-flex items-center gap-2 py-3.5 px-8 bg-blue-600 text-white font-bold text-[15px] rounded-xl transition-all duration-500 shadow-[0_0_40px_rgba(37,99,235,0.35)] hover:bg-blue-700 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(37,99,235,0.4)]"
          >
            Get Started Free
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-500" />
          </Link>
          <a 
            href="#features" 
            className="inline-flex items-center gap-2 py-3.5 px-8 border border-white/10 text-slate-400 font-semibold text-[15px] rounded-xl transition-all duration-500 bg-transparent hover:border-white/30 hover:text-white hover:bg-white/5"
          >
            Explore Features
          </a>
        </div>

        <p className="mt-[52px] text-slate-800 text-sm fade-up delay-4">
          Trusted by <span className="text-slate-500 font-bold">5,000+</span> students worldwide
        </p>
      </div>
    </section>
  );
}
