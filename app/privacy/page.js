'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText, Globe } from 'lucide-react';
import StudyHubLogo from '@/components/ui/StudyHubLogo';

export default function PrivacyPolicyPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[#06080f] text-slate-100 p-6 md:p-12 relative overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Background ambient glows */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[120px] transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`} />

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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase mb-4">
            <Shield size={10} /> Compliance & Safety
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            Last Updated: May 18, 2026. This policy outlines how StudyHub collects, uses, protects, and handles your personal information in compliance with global standards.
          </p>
        </div>

        {/* Content Panel */}
        <main className={`bg-[#0d111c]/70 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-12 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Quick Pillars Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-white/5 pb-10">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Lock size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">100% Encrypted</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">All active data, credentials, and local notes are securely encrypted in transit and at rest.</p>
            </div>
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Eye size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Zero Data Sales</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">We strictly never sell, trade, or distribute your educational records or information to third parties.</p>
            </div>
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Globe size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">GDPR Compliance</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">You maintain absolute ownership and control over your academic data, with simple deletion rights.</p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-blue-500">01.</span> Information We Collect
            </h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3">
              <p>
                To provide our collaborative academic hub, StudyHub collects the following classes of data:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1.5 text-xs">
                <li><strong className="text-slate-200">Account Credentials:</strong> Your full name, university email address, and secure password hashes used to verify and manage your profile.</li>
                <li><strong className="text-slate-200">Academic Records:</strong> Notes, class schedules, university resources, bookmarks, and upload metadata voluntarily shared on the platform.</li>
                <li><strong className="text-slate-200">Usage Analytics:</strong> Anonymous diagnostic telemetry including browser version, page response timings, and route usage to improve service responsiveness.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-blue-500">02.</span> How Your Information is Used
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We exclusively use the collected information to serve and optimize your experience: to authenticate and secure logins, correctly credit note uploads and rank leaders in our point systems, generate and locally save customized class routines in sandbox containers, and identify and troubleshoot platform bugs in real-time.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-blue-500">03.</span> Data Security & Storage
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              StudyHub uses enterprise-grade Secure Socket Layer (SSL/TLS) encryption technology. Your personal records are housed behind highly secure firewalls managed by PostgreSQL and Supabase. Standard integrations, like the Routine Pro Generator, run in fully isolated web sandboxes utilizing safe, browser-isolated localStorage so that class routines persist safely on your physical device.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-blue-500">04.</span> Your Rights & Access Controls
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              You maintain complete authority over your student profile. Under industry privacy regulations (such as GDPR), you hold the right to retrieve a copy of all note uploads and details associated with your profile, edit or remove academic resources you have contributed, and completely terminate your account. To trigger a full profile deletion, you may request account termination inside the settings panel.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-blue-500">05.</span> Updates to This Policy
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              StudyHub may update this Privacy Policy from time to time to align with evolving digital security protocols and legal regulations. Any major policy updates will be visible via a dashboard notice banner, and the "Last Updated" timestamp at the top will be updated accordingly.
            </p>
          </section>

          {/* Contact Section */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Have privacy concerns?</h4>
              <p className="text-slate-500 text-[11px]">Get in touch directly with our data compliance officer.</p>
            </div>
            <a 
              href="mailto:privacy@studyhub.com" 
              className="px-6 py-3.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 border border-blue-400 transition-all duration-300 text-center cursor-pointer"
            >
              Contact Support
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
