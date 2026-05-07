'use client';
import { useState, useEffect } from 'react';
import StudyHubLogo from './StudyHubLogo';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how' },
  { label: 'Contact', href: '#contact' },
];

const styles = {
  nav: (scrolled) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    transition: 'all 0.3s ease',
    background: scrolled ? 'rgba(6, 8, 15, 0.85)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
  }),
  inner: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  link: {
    padding: '8px 16px',
    color: '#94a3b8',
    fontWeight: 500,
    fontSize: 14,
    textDecoration: 'none',
    borderRadius: 8,
    transition: 'all 0.2s',
  },
  cta: {
    marginLeft: 12,
    padding: '8px 20px',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    textDecoration: 'none',
    borderRadius: 10,
    transition: 'background 0.2s',
  },
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={styles.nav(scrolled)}>
      <div style={styles.inner}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <StudyHubLogo size={32} textSize={16} />
        </a>
        <div style={styles.links}>
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} style={styles.link}
              onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.target.style.color = '#94a3b8'; e.target.style.background = 'transparent'; }}>
              {l.label}
            </a>
          ))}
          <a href="/auth" style={styles.cta}
            onMouseEnter={e => e.target.style.background = '#1d4ed8'}
            onMouseLeave={e => e.target.style.background = '#2563eb'}>
            Sign In
          </a>
        </div>
      </div>
    </nav>
  );
}
