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
            Last Updated: June 18, 2026. By accessing and using StudyHub, you agree to comply with and be bound by the following platform terms and conditions.
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
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Share Responsibly</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">Upload only notes, past papers, and resources you have the right to share, in line with copyright and academic integrity.</p>
            </div>
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldAlert size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Secure Accounts</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">Your account is verified by one-time code (OTP). You are responsible for keeping your credentials and codes private.</p>
            </div>
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Award size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Earn Fairly</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">Reputation points and leaderboard rank reflect genuine contributions. Gaming the system leads to point removal.</p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-purple-500">01.</span> Acceptance of Terms
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              StudyHub is a collaborative academic platform where students share and discover lecture notes, past papers, and course resources, plan their studies, and earn reputation for contributing. By registering for, accessing, or uploading to StudyHub, you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of them, please discontinue your use of the platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-purple-500">02.</span> Accounts, Eligibility & Roles
            </h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3">
              <p>
                StudyHub is intended for students and academic communities. To use the platform you agree to:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1.5 text-xs">
                <li>Provide accurate registration details and verify your account using the one-time code (OTP) we send you.</li>
                <li>Keep your login credentials and OTP confidential — activity under your account is your responsibility.</li>
                <li>Accept that accounts hold roles (Student, Moderator, or Administrator) with different permissions, assigned and adjusted at our discretion.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-purple-500">03.</span> Content & Uploads
            </h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3">
              <p>
                When you upload notes, past papers, resources, bookmarks, or routines, you agree to:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1.5 text-xs">
                <li>Share only material you created or have the legal right to distribute.</li>
                <li>Not upload plagiarized, copyrighted, malicious, misleading, or inappropriate content.</li>
                <li>Tag and categorize your uploads honestly so other students can rely on them.</li>
                <li>Accept that submissions may be reviewed by moderators and removed if they breach these terms.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-purple-500">04.</span> Intellectual Property & License
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              You retain ownership of the materials you upload. By sharing them on StudyHub, you grant us a non-exclusive, royalty-free, worldwide license to store, index, render, and display your content to other registered members for the purpose of collaborative learning. All StudyHub branding, design, and platform software remain the property of StudyHub.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-purple-500">05.</span> Reputation, Points & Leaderboard
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Reputation points, badges, and leaderboard rankings are earned through genuine participation such as sharing useful resources. Any attempt to manipulate these systems — including spam uploads, fake or duplicate submissions, or coordinated voting — may result in the removal of points, loss of standing, or account suspension. Points and rankings have no monetary value and may be recalculated at any time.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-purple-500">06.</span> Prohibited Conduct
            </h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside pl-2 space-y-1.5 text-xs">
                <li>Use shared resources to violate your institution&apos;s academic honor code or exam rules.</li>
                <li>Harass other members, scrape the platform, or attempt to bypass security or access controls.</li>
                <li>Resell, redistribute, or commercially exploit content without permission.</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-purple-500">07.</span> Moderation, Suspension & Termination
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We reserve the right to review content, restrict features, and suspend or terminate any account — with or without notice — where we identify conduct that violates these terms, academic integrity, intellectual property rights, or the safety of the community. We may also update these terms from time to time; continued use of StudyHub after changes are posted constitutes acceptance of the revised terms.
            </p>
          </section>

          {/* Contact Section */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Questions about our terms?</h4>
              <p className="text-slate-500 text-[11px]">Reach our team at legal.studyhub.bd@gmail.com</p>
            </div>
            <a
              href="mailto:legal.studyhub.bd@gmail.com"
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
