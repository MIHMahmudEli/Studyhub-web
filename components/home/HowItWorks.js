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

const S = {
  section: { padding: '0 24px 120px' },
  container: { maxWidth: 1120, margin: '0 auto' },
  divider: { borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: 80 },
  header: { marginBottom: 56 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b5cf6', marginBottom: 14 },
  h2: { fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.025em', color: '#f0f4ff', marginBottom: 14 },
  sub: { fontSize: 16, color: '#64748b', lineHeight: 1.7, maxWidth: 480 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 },
};

function StepCard({ step }) {
  const { icon: Icon } = step;

  return (
    <div
      className="group hover:-translate-y-1.5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 cursor-default relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20,
        padding: '36px 32px',
      }}
    >
      {/* Ghost number watermark */}
      <div 
        className="group-hover:scale-110 group-hover:text-white/[0.05] transition-all duration-500"
        style={{
          position: 'absolute', top: 20, right: 24,
          fontSize: 72, fontWeight: 900, lineHeight: 1,
          color: 'rgba(255,255,255,0.03)', userSelect: 'none',
          letterSpacing: '-0.04em',
        }}
      >
        {step.number}
      </div>

      {/* Top row: step label + icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: step.accent }}>
          Step {step.number}
        </span>
        <div 
          className="group-hover:rotate-12 transition-transform duration-300"
          style={{
            width: 40, height: 40,
            background: `${step.accent}18`,
            border: `1px solid ${step.accent}30`,
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon size={18} color={step.accent} strokeWidth={1.5} />
        </div>
      </div>

      <div style={{ fontSize: 19, fontWeight: 700, color: '#f0f4ff', marginBottom: 10 }}>{step.title}</div>
      <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.75 }}>{step.description}</p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how" style={S.section}>
      <div style={S.container}>
        <div style={S.divider} />
        <div style={S.header}>
          <span style={S.label}>Process</span>
          <h2 style={S.h2}>
            Up and running<br />
            <span style={{ color: '#334155' }}>in three steps.</span>
          </h2>
          <p style={S.sub}>No long onboarding. No complexity. Start learning and contributing in minutes.</p>
        </div>
        <div style={S.grid}>
          {steps.map((step, i) => <StepCard key={i} step={step} />)}
        </div>
      </div>
    </section>
  );
}
