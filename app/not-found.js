'use client';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import StudyHubLogo from '@/components/ui/StudyHubLogo';

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      // If referrer is on the same host, perform a full-page load to it to clear any stuck state
      if (referrer && referrer.includes(window.location.host)) {
        window.location.href = referrer;
      } else {
        window.location.href = '/notes';
      }
    }
  };

  const handleGoHome = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.location.href = '/notes';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      color: 'var(--foreground)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
      textAlign: 'center',
      transition: 'background 0.5s ease, color 0.5s ease'
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .not-found-title {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
          background: linear-gradient(
            to right, 
            #3b82f6 20%, 
            #6366f1 40%, 
            #a855f7 60%, 
            #6366f1 80%, 
            #3b82f6 100%
          ) !important;
          background-size: 200% auto !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
          animation: shimmer 5s linear infinite;
        }
        .not-found-title:hover {
          transform: scale(1.05) rotate(-1deg);
          filter: drop-shadow(0 0 30px rgba(99, 102, 241, 0.4));
          animation-play-state: paused;
        }
        .btn-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-primary-hover:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 40px rgba(99, 102, 241, 0.35);
          background: #4f46e5 !important;
        }
        .btn-secondary-hover:hover {
          transform: translateY(-2px);
          background: var(--card-bg) !important;
          opacity: 0.9;
          border-color: var(--card-border) !important;
          color: var(--foreground) !important;
        }
        .ambient-orb {
          animation: float 15s infinite ease-in-out;
        }
        .ambient-orb-2 {
          animation: float 20s infinite ease-in-out reverse;
        }
      `}</style>

      {/* Ambient background glow */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div className="ambient-orb" style={{ position: 'absolute', top: '20%', left: '30%', width: 500, height: 500, background: 'radial-gradient(circle, var(--nebula-1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div className="ambient-orb-2" style={{ position: 'absolute', bottom: '10%', right: '20%', width: 400, height: 400, background: 'radial-gradient(circle, var(--nebula-2) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
        {/* Header Logo */}
        <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'center' }}>
          <StudyHubLogo size={40} textSize={20} />
        </div>

        {/* 404 Text */}
        <h1 className="not-found-title" style={{
          fontSize: 'clamp(6rem, 15vw, 10rem)',
          fontWeight: 900,
          lineHeight: 1,
          margin: '0 0 16px',
          letterSpacing: '-0.05em',
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 700,
          color: 'var(--foreground)',
          marginBottom: 16
        }}>
          Lost in Space?
        </h2>

        <p style={{
          fontSize: 16,
          color: 'var(--muted)',
          lineHeight: 1.6,
          marginBottom: 40,
        }}>
          The page you're looking for has drifted away or never existed in this galaxy.
          Let's get you back to your studies.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={handleGoHome}
            className="btn-hover btn-primary-hover" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              background: 'rgb(99, 102, 241)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
            }}
          >
            <Home size={18} />
            Back to Home
          </button>
          
          <button 
            onClick={handleGoBack}
            className="btn-hover btn-secondary-hover"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--foreground)',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              borderRadius: 12,
            }}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>

      {/* Decorative footer text */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        fontSize: 10,
        color: 'var(--muted)',
        opacity: 0.7,
        fontWeight: 800,
        letterSpacing: '0.2em',
        textTransform: 'uppercase'
      }}>
        StudyHub Academic Error Handling
      </div>
    </div>
  );
}
