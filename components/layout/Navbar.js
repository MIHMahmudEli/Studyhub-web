'use client';
import { useState, useEffect } from 'react';
import StudyHubLogo from '@/components/ui/StudyHubLogo';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close mobile menu on link click
  const handleLinkClick = () => setMobileOpen(false);

  return (
    <>
      {/* Scoped responsive styles */}
      <style>{`
        .nav-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          transition: all 0.3s ease;
        }
        .nav-root.scrolled {
          background: rgba(6,8,15,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 4px 32px rgba(0,0,0,0.4);
        }
        .nav-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }
        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-link {
          padding: 8px 16px;
          color: #94a3b8;
          font-weight: 500;
          font-size: 14px;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .nav-link:hover {
          color: #f1f5f9;
          background: rgba(255,255,255,0.06);
        }
        .nav-cta {
          margin-left: 12px;
          padding: 8px 20px;
          background: #2563eb;
          color: #fff;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          border-radius: 10px;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .nav-cta:hover { background: #1d4ed8; }

        /* Hamburger button — hidden on desktop */
        .nav-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .nav-hamburger:hover { background: rgba(255,255,255,0.06); }
        .nav-hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: #94a3b8;
          border-radius: 2px;
          transition: all 0.25s ease;
        }

        /* Mobile dropdown */
        .nav-mobile {
          display: none;
          flex-direction: column;
          padding: 12px 16px 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
          background: rgba(6,8,15,0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .nav-mobile.open { display: flex; }
        .nav-mobile .nav-link {
          padding: 12px 16px;
          font-size: 15px;
          border-radius: 10px;
        }
        .nav-mobile .nav-cta {
          margin: 8px 0 0;
          padding: 12px 20px;
          text-align: center;
          border-radius: 10px;
          display: block;
        }

        /* Breakpoint: <= 768px */
        @media (max-width: 768px) {
          .nav-links-desktop { display: none; }
          .nav-hamburger { display: flex; }
        }

        /* Hamburger X animation when open */
        .nav-hamburger.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .nav-hamburger.open span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .nav-hamburger.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
      `}</style>

      <nav className={`nav-root${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          {/* Logo */}
          <a href="/" style={{ textDecoration: 'none' }}>
            <StudyHubLogo size={32} textSize={16} />
          </a>

          {/* Desktop Nav */}
          <div className="nav-links-desktop">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="nav-link">{l.label}</a>
            ))}
            <a href="/auth" className="nav-cta">Sign In</a>
          </div>

          {/* Hamburger (mobile only) */}
          <button
            className={`nav-hamburger${mobileOpen ? ' open' : ''}`}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`nav-mobile${mobileOpen ? ' open' : ''}`}>
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} className="nav-link" onClick={handleLinkClick}>{l.label}</a>
          ))}
          <a href="/auth" className="nav-cta" onClick={handleLinkClick}>Sign In</a>
        </div>
      </nav>
    </>
  );
}
