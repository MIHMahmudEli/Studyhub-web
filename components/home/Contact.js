import { Play, Send, Mail, Globe } from 'lucide-react';

const socialLinks = [
  { icon: Play,  name: 'YouTube',  description: 'Tutorials & Guides',   url: 'https://www.youtube.com/@studyhub991',           accent: '#ef4444' },
  { icon: Send,  name: 'Telegram', description: 'Resources Channel',     url: 'https://t.me/studyhub991',                       accent: '#0ea5e9' },
  { icon: Mail,  name: 'Email',    description: 'Get Support',            url: 'mailto:studyhubteam.official@gmail.com',          accent: '#3b82f6' },
  { icon: Globe, name: 'Facebook', description: 'Developer Profile',      url: 'https://fb.com/mihmahmudali',                    accent: '#6366f1' },
];

const S = {
  section: { padding: '0 24px 140px' },
  container: { maxWidth: 1120, margin: '0 auto' },
  divider: { borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: 80 },
  header: { marginBottom: 56 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#10b981', marginBottom: 14 },
  h2: { fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.025em', color: '#f0f4ff', marginBottom: 14 },
  sub: { fontSize: 16, color: '#64748b', lineHeight: 1.7, maxWidth: 480 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
};

function SocialCard({ link }) {
  const { icon: Icon } = link;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        className="group-hover:-translate-y-2 group-hover:bg-white/[0.05] group-hover:border-white/15 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
          padding: '28px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
        }}
      >
        <div 
          className="group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: 44, height: 44, flexShrink: 0,
            background: `${link.accent}18`,
            border: `1px solid ${link.accent}30`,
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon size={20} color={link.accent} strokeWidth={1.5} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f4ff', marginBottom: 4 }}>{link.name}</div>
          <div style={{ fontSize: 13, color: '#64748b' }} className="group-hover:text-gray-400 transition-colors">{link.description}</div>
        </div>
      </div>
    </a>
  );
}

export default function Contact() {
  return (
    <section id="contact" style={S.section}>
      <div style={S.container}>
        <div style={S.divider} />
        <div style={S.header}>
          <span style={S.label}>Community</span>
          <h2 style={S.h2}>
            Connect with us<br />
            <span style={{ color: '#334155' }}>wherever you are.</span>
          </h2>
          <p style={S.sub}>
            Join our growing community across platforms — get resources, updates, and direct support.
          </p>
        </div>
        <div style={S.grid}>
          {socialLinks.map((link, i) => <SocialCard key={i} link={link} />)}
        </div>
      </div>
    </section>
  );
}
