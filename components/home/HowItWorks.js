'use client';

import { UserPlus, Upload, Trophy } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Quick Register',
    description: 'Create your account in seconds. Verify with a one-time OTP — no credit card required.',
    accent: '#3b82f6',
  },
  {
    number: '02',
    icon: Upload,
    title: 'Share Knowledge',
    description: 'Upload your best lecture notes and past papers. Help thousands of peers around the world.',
    accent: '#8b5cf6',
  },
  {
    number: '03',
    icon: Trophy,
    title: 'Level Up',
    description: 'Earn reputation points with every contribution. Climb the leaderboard and unlock certifications.',
    accent: '#10b981',
  },
];

function StepCard({ step }) {
  const { icon: Icon } = step;

  return (
    <div
      className="bg-[var(--surface)] backdrop-blur-sm border border-[var(--border)] rounded-[24px] p-6 md:p-9 group hover:-translate-y-2 hover:bg-[var(--surface)] hover:border-purple-500/30 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-default relative overflow-hidden hover:shadow-[0_24px_48px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(139,92,246,0.05)]"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      {/* Ghost number watermark */}
      <div 
        className="absolute top-5 right-6 text-[72px] font-black leading-none text-[var(--text-1)]/5 select-none tracking-tighter group-hover:scale-110 group-hover:text-[var(--text-1)]/10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        {step.number}
      </div>

      {/* Top row: step label + icon */}
      <div className="flex justify-between items-center mb-8">
        <span 
          style={{ color: step.accent }}
          className="text-[11px] font-bold tracking-[0.12em] uppercase"
        >
          Step {step.number}
        </span>
        <div 
          style={{
            background: `${step.accent}18`,
            border: `1px solid ${step.accent}30`,
          }}
          className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <Icon size={18} color={step.accent} strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="text-[19px] font-bold text-[var(--text-1)] mb-2.5 leading-tight">{step.title}</h3>
      <p className="text-sm text-[var(--text-2)] leading-relaxed">{step.description}</p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how" className="px-6 pb-20 md:pb-[120px] relative overflow-hidden">
      <div className="max-w-[1120px] mx-auto">
        <div className="border-t border-[var(--border)] mb-12 md:mb-20" />
        <div className="mb-10 md:mb-14">
          <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.12em] uppercase text-purple-500 mb-3">
            Process
          </span>
          <h2 className="text-[clamp(1.5rem,5vw,3rem)] font-extrabold leading-[1.2] md:leading-[1.15] tracking-tight text-[var(--text-1)] mb-4">
            Up and running<br />
            <span className="text-[var(--text-3)]">in three steps.</span>
          </h2>
          <p className="text-sm md:text-base text-[var(--text-2)] leading-relaxed max-w-[480px]">No long onboarding. No complexity. Start learning and contributing in minutes.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-5">
          {steps.map((step, i) => <StepCard key={i} step={step} />)}
        </div>
      </div>
    </section>
  );
}
