'use client';

import { GraduationCap, Building2, Trophy, BadgeCheck } from 'lucide-react';

// Numbers below are real, derived from the course catalog (lib/data/courses.json):
// 544 courses across 5 faculties. Kept honest rather than inflated.
const stats = [
  { icon: GraduationCap, value: '540+', label: 'Courses in the catalog',  accent: '#3b82f6' },
  { icon: Building2,     value: '5',    label: 'Faculties covered',       accent: '#8b5cf6' },
  { icon: Trophy,        value: 'Live', label: 'Reputation leaderboard',  accent: '#f59e0b' },
  { icon: BadgeCheck,    value: 'Free', label: 'For every student',       accent: '#10b981' },
];

function StatCard({ stat }) {
  const { icon: Icon } = stat;

  return (
    <div className="bg-[var(--surface)] backdrop-blur-sm border border-[var(--border)] rounded-[20px] p-6 flex flex-col gap-3 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-xl hover:border-[var(--border-h)]">
      <div
        style={{ background: `${stat.accent}18`, border: `1px solid ${stat.accent}30` }}
        className="w-10 h-10 rounded-[12px] flex items-center justify-center"
      >
        <Icon size={18} color={stat.accent} strokeWidth={1.5} />
      </div>
      <div className="text-[clamp(1.6rem,4vw,2.2rem)] font-black tracking-tight text-[var(--text-1)] leading-none">
        {stat.value}
      </div>
      <p className="text-[13px] text-[var(--text-2)] leading-snug">{stat.label}</p>
    </div>
  );
}

export default function Highlights() {
  return (
    <section id="highlights" className="px-6 pb-20 md:pb-[120px] relative overflow-hidden scroll-mt-24">
      <div className="max-w-[1120px] mx-auto">
        <div className="border-t border-[var(--border)] mb-12 md:mb-20" />
        <div className="mb-10 md:mb-14">
          <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.12em] uppercase text-emerald-500 mb-3">
            By the numbers
          </span>
          <h2 className="text-[clamp(1.5rem,5vw,3rem)] font-extrabold leading-[1.2] md:leading-[1.15] tracking-tight text-[var(--text-1)] mb-4">
            A platform students<br />
            <span className="text-[var(--text-3)]">actually rely on.</span>
          </h2>
          <p className="text-sm md:text-base text-[var(--text-2)] leading-relaxed max-w-[480px]">
            StudyHub brings notes, past papers, and course resources into one organized, peer-reviewed library — built to keep your whole batch a step ahead.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {stats.map((s, i) => <StatCard key={i} stat={s} />)}
        </div>
      </div>
    </section>
  );
}
