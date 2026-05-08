'use client';

import { BookOpen, Users, Shield } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Student',
    description: 'Access thousands of lecture notes and exam resources. Share your knowledge, earn reputation badges, and stay ahead of the curve.',
    accent: '#3b82f6',
  },
  {
    icon: Users,
    title: 'Moderator',
    description: 'Maintain content quality across the platform. Review uploads, guide community discussions, and ensure our standards are upheld.',
    accent: '#8b5cf6',
  },
  {
    icon: Shield,
    title: 'Administrator',
    description: 'Analyze trends, manage users, and generate activity reports. Keep the StudyHub ecosystem running smoothly for everyone.',
    accent: '#10b981',
  },
];

function Card({ feature }) {
  const { icon: Icon } = feature;

  return (
    <div 
      className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-[24px] p-9 group hover:-translate-y-2 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-default hover:shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(59,130,246,0.05)] overflow-hidden relative"
    >
      {/* Hover glow effect */}
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
      <h3 className="text-[19px] font-bold text-[#f0f4ff] mb-2.5 group-hover:text-white transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        {feature.title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="px-6 pb-[120px] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full -z-10 animate-nebula" />

      <div className="max-w-[1120px] mx-auto">
        <div className="border-t border-white/5 mb-20" />
        <div className="mb-14">
          <span className="block text-[11px] font-bold tracking-[0.12em] uppercase text-blue-500 mb-3.5">
            Capabilities
          </span>
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold leading-[1.15] tracking-tight text-[#f0f4ff] mb-3.5">
            Built for everyone<br />
            <span className="text-slate-700">in your institution.</span>
          </h2>
          <p className="text-base text-slate-500 leading-relaxed max-w-[480px]">
            Whether you&apos;re a student, moderator, or admin — StudyHub gives you exactly the tools you need.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
          {features.map((f, i) => <Card key={i} feature={f} />)}
        </div>
      </div>
    </section>
  );
}
