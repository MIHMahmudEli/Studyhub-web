'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, ShieldAlert, Award } from 'lucide-react';
import StudyHubLogo from '@/components/ui/StudyHubLogo';

export default function TermsOfServicePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[#06080f] text-slate-100 p-6 md:p-12 relative overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Background ambient glows */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[120px] transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`} />

      <div className="max-w-[900px] mx-auto relative z-10">
        
        {/* Top Navbar Header */}
        <header className={`flex justify-between items-center mb-16 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <Link href="/" className="hover:scale-105 active:scale-95 transition-all">
            <StudyHubLogo size={32} textSize={18} />
          </Link>
          <Link 
            href="/auth" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Portal
          </Link>
        </header>

        {/* Master Heading Block */}
        <div className={`text-center mb-16 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black tracking-widest uppercase mb-4">
            <FileText size={10} /> User Agreement
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            Last Updated: May 18, 2026. By accessing and using StudyHub, you agree to comply with and be bound by the following platform terms and conditions.
          </p>
        </div>

        {/* Content Panel */}
        <main className={`bg-[#0d111c]/70 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-12 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Quick Pillars Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-white/5 pb-10">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <CheckCircle2 size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Fair Use</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">All shared academic resources must comply with standard copyright and academic integrity guidelines.</p>
            </div>
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldAlert size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Secure Accounts</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">Users are responsible for safeguarding credentials and managing secure authentication codes.</p>
            </div>
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Award size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Point Integrity</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">Spamming, fake uploads, or attempts to game the leaderboard ranking result in instant point revocation.</p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-purple-500">01.</span> Acceptance of Terms
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              By accessing, browsing, registering, or contributing resources to the StudyHub portal, you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these platform rules, you must discontinue your use of StudyHub immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-purple-500">02.</span> User Conduct & Content Guidelines
            </h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3">
              <p>
                StudyHub is a collaborative educational environment. When uploading files, notes, or creating schedules, you agree to:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1.5 text-xs">
                <li>Only upload study notes, schedules, and bookmarks that you possess legitimate rights to distribute.</li>
                <li>Refrain from posting files containing malicious viruses, plagiarized publications, or harmful student diagnostics.</li>
                <li>Respect academic honor codes and not utilize shared resources for unauthorized academic assistance.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-purple-500">03.</span> Intellectual Property Rights
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              StudyHub does not claim ownership over the academic records or notes you upload. You grant StudyHub a royalty-free, worldwide license to store, render, index, and display your uploaded materials to other registered members of the platform to facilitate shared collaborative learning.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-purple-500">04.</span> Termination of Service
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We reserve the absolute right to suspend, terminate, or completely restrict access to your user account at any time, with or without prior notice, if we identify conduct that violates academic codes of honor, intellectual property regulations, or the core mission of collaborative peer study.
            </p>
          </section>

          {/* Contact Section */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Questions about our terms?</h4>
              <p className="text-slate-500 text-[11px]">Get in touch directly with our support specialists.</p>
            </div>
            <a 
              href="mailto:legal@studyhub.com" 
              className="px-6 py-3.5 bg-purple-500 hover:bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 border border-purple-400 transition-all duration-300 text-center cursor-pointer"
            >
              Contact Legal
            </a>
          </div>

        </main>

        {/* Footer legalities */}
        <footer className={`mt-12 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest transition-opacity duration-700 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          © {new Date().getFullYear()} StudyHub Compliance Portal • All rights reserved
        </footer>

      </div>
    </div>
  );
}
