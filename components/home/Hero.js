import { ArrowRight } from 'lucide-react';

const S = {
  section: {
    padding: '160px 24px 120px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    maxWidth: 800,
    margin: '0 auto',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 16px',
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.25)',
    borderRadius: 999,
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 28,
  },
  h1: {
    fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
    fontWeight: 900,
    lineHeight: 1.08,
    letterSpacing: '-0.03em',
    marginBottom: 24,
    color: '#f0f4ff',
  },
  grad: {
    background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #c084fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  sub: {
    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
    color: '#64748b',
    lineHeight: 1.7,
    maxWidth: 560,
    margin: '0 auto 48px',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 32px',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    textDecoration: 'none',
    borderRadius: 12,
    transition: 'all 0.2s',
    boxShadow: '0 0 40px rgba(37,99,235,0.35)',
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 32px',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#94a3b8',
    fontWeight: 600,
    fontSize: 15,
    textDecoration: 'none',
    borderRadius: 12,
    transition: 'all 0.2s',
    background: 'transparent',
  },
  proof: {
    marginTop: 52,
    color: '#334155',
    fontSize: 14,
  },
  proofHighlight: {
    color: '#64748b',
    fontWeight: 700,
  },
};

export default function Hero() {
  return (
    <section style={S.section} className="fade-up">
      {/* Background dot grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: -1,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
      {/* Center glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translateX(-50%)',
        width: 700, height: 400,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 65%)',
        zIndex: -1,
      }} />

      <div style={S.container}>
        <div className="fade-up" style={S.badge}>
          ✦ Academic Collaboration Platform
        </div>

        <h1 className="fade-up delay-1" style={S.h1}>
          Study smarter.<br />
          <span style={S.grad}>Grow together.</span>
        </h1>

        <p className="fade-up delay-2" style={S.sub}>
          Join thousands of students sharing high-quality notes, earning badges,
          and climbing the academic leaderboard — all in one place.
        </p>

        <div className="fade-up delay-3" style={S.buttons}>
          <a 
            href="/auth#register" 
            className="hover:bg-blue-700 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={S.btnPrimary}
          >
            Get Started Free
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-500" />
          </a>
          <a 
            href="#features" 
            className="hover:border-white/30 hover:text-white hover:bg-white/5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={S.btnSecondary}
          >
            Explore Features
          </a>
        </div>

        <p className="fade-up delay-4" style={S.proof}>
          Trusted by <span style={S.proofHighlight}>5,000+</span> students worldwide
        </p>
      </div>
    </section>
  );
}
