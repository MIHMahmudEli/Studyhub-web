'use client';

import { BookOpen, Users, Shield } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'For Students',
    description: 'Browse and download peer-shared lecture notes, past papers, and course resources organized by subject. Upload your own work, build bookmarks, plan with the routine tool, and earn reputation as you contribute.',
    accent: '#3b82f6',
  },
  {
    icon: Users,
    title: 'For Moderators',
    description: 'Keep the library trustworthy. Review pending uploads, approve quality submissions, flag duplicates or violations, and help curate the trending notes and resources the whole community sees first.',
    accent: '#8b5cf6',
  },
  {
    icon: Shield,
    title: 'For Administrators',
    description: 'Run the platform with confidence. Manage users and roles, monitor active sessions, track engagement analytics, and oversee content health from a single dashboard.',
    accent: '#10b981',
  },
];

function Card({ feature }) {
  const { icon: Icon } = feature;

  return (
    <div 
      className="bg-[var(--surface)] backdrop-blur-sm border border-[var(--border)] rounded-[24px] p-6 md:p-9 shadow-sm hover:-translate-y-2 hover:bg-[var(--surface)] hover:border-blue-500/30 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-default hover:shadow-xl overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div 
        style={{ 
          background: `${feature.accent}18`, 
          border: `1px solid ${feature.accent}30` 
        }}
        className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <Icon size={22} color={feature.accent} strokeWidth={1.5} />
      </div>
      <h3 className="text-[19px] font-bold text-[var(--text-1)] mb-2.5 group-hover:text-[var(--text-1)] transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        {feature.title}
      </h3>
      <p className="text-sm text-[var(--text-2)] leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="px-6 pb-20 md:pb-[120px] relative overflow-hidden scroll-mt-24">
      <div className="max-w-[1120px] mx-auto">
        <div className="border-t border-[var(--border)] mb-12 md:mb-20" />
        <div className="mb-10 md:mb-14">
          <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.12em] uppercase text-blue-500 mb-3">
            Capabilities
          </span>
          <h2 className="text-[clamp(1.5rem,5vw,3rem)] font-extrabold leading-[1.2] md:leading-[1.15] tracking-tight text-[var(--text-1)] mb-4">
            Built for everyone<br />
            <span className="text-[var(--text-3)]">in your institution.</span>
          </h2>
          <p className="text-sm md:text-base text-[var(--text-2)] leading-relaxed max-w-[480px]">
            Whether you&apos;re a student, moderator, or admin — StudyHub gives you exactly the tools you need.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-5">
          {features.map((f, i) => <Card key={i} feature={f} />)}
        </div>
      </div>
    </section>
  );
}
