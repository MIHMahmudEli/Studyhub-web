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

const sectionStyle = {
  padding: '0 24px 120px',
};

const containerStyle = {
  maxWidth: 1120,
  margin: '0 auto',
};

const dividerStyle = {
  borderTop: '1px solid rgba(255,255,255,0.05)',
  marginBottom: 80,
};

const headerStyle = {
  marginBottom: 56,
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#3b82f6',
  marginBottom: 14,
};

const h2Style = {
  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
  fontWeight: 800,
  lineHeight: 1.15,
  letterSpacing: '-0.025em',
  color: '#f0f4ff',
  marginBottom: 14,
};

const subStyle = {
  fontSize: 16,
  color: '#64748b',
  lineHeight: 1.7,
  maxWidth: 480,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 20,
};

const cardStyle = (accent) => ({
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 20,
  padding: '36px 32px',
  transition: 'transform 0.25s ease, border-color 0.25s ease, background 0.25s ease',
  cursor: 'default',
});

const iconWrapStyle = (accent) => ({
  width: 48,
  height: 48,
  background: `${accent}18`,
  border: `1px solid ${accent}30`,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 24,
});

const cardTitleStyle = {
  fontSize: 19,
  fontWeight: 700,
  color: '#f0f4ff',
  marginBottom: 10,
};

const cardDescStyle = {
  fontSize: 14,
  color: '#64748b',
  lineHeight: 1.75,
};

function Card({ feature }) {
  const { icon: Icon } = feature;

  const handleEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.borderColor = `${feature.accent}30`;
    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
  };
  const handleLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
    e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
  };

  return (
    <div style={cardStyle(feature.accent)} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <div style={iconWrapStyle(feature.accent)}>
        <Icon size={22} color={feature.accent} strokeWidth={1.5} />
      </div>
      <div style={cardTitleStyle}>{feature.title}</div>
      <p style={cardDescStyle}>{feature.description}</p>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" style={sectionStyle}>
      <div style={containerStyle}>
        <div style={dividerStyle} />
        <div style={headerStyle}>
          <span style={labelStyle}>Capabilities</span>
          <h2 style={h2Style}>
            Built for everyone<br />
            <span style={{ color: '#334155' }}>in your institution.</span>
          </h2>
          <p style={subStyle}>
            Whether you&apos;re a student, moderator, or admin — StudyHub gives you exactly the tools you need.
          </p>
        </div>
        <div style={gridStyle}>
          {features.map((f, i) => <Card key={i} feature={f} />)}
        </div>
      </div>
    </section>
  );
}
