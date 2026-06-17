'use client';

import { Play, Send, Mail } from 'lucide-react';

const socialLinks = [
  { icon: Play,  name: 'YouTube',  description: 'Tutorials & study guides',   url: 'https://www.youtube.com/@studyhub991',      accent: '#ef4444' },
  { icon: Send,  name: 'Telegram', description: 'Resource drops & updates',    url: 'https://t.me/studyhub991',                  accent: '#0ea5e9' },
  { icon: Mail,  name: 'Email',    description: 'Reach our support team',      url: 'mailto:studyhubteam.official@gmail.com',    accent: '#3b82f6' },
];

function SocialCard({ link }) {
  const { icon: Icon } = link;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block no-underline"
    >
    <div
      className="bg-[var(--surface)] backdrop-blur-sm border border-[var(--border)] rounded-[24px] p-[28px_24px] flex items-start gap-4 shadow-sm group-hover:-translate-y-2 group-hover:bg-[var(--surface)] group-hover:border-emerald-500/30 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-xl overflow-hidden relative"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div 
          style={{
            background: `${link.accent}18`,
            border: `1px solid ${link.accent}30`,
          }}
          className="w-11 h-11 shrink-0 rounded-[14px] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <Icon size={20} color={link.accent} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-[var(--text-1)] mb-1">{link.name}</h3>
          <p className="text-[13px] text-[var(--text-2)] group-hover:text-[var(--text-1)]/70 transition-colors">
            {link.description}
          </p>
        </div>
      </div>
    </a>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="px-6 pb-24 md:pb-[140px] relative overflow-hidden">
      <div className="max-w-[1120px] mx-auto">
        <div className="border-t border-[var(--border)] mb-12 md:mb-20" />
        <div className="mb-10 md:mb-14">
          <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.12em] uppercase text-emerald-500 mb-3">
            Community
          </span>
          <h2 className="text-[clamp(1.5rem,5vw,3rem)] font-extrabold leading-[1.2] md:leading-[1.15] tracking-tight text-[var(--text-1)] mb-4">
            Connect with us<br />
            <span className="text-[var(--text-3)]">wherever you are.</span>
          </h2>
          <p className="text-sm md:text-base text-[var(--text-2)] leading-relaxed max-w-[480px]">
            Join our growing community across platforms — get resources, updates, and direct support.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialLinks.map((link, i) => <SocialCard key={i} link={link} />)}
        </div>
      </div>
    </section>
  );
}
