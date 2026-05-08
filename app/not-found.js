'use client';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import StudyHubLogo from '@/components/ui/StudyHubLogo';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#06080f',
      color: '#e8eaf0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
      textAlign: 'center'
    }}>
      {/* Ambient background glow */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
        {/* Header Logo */}
        <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'center' }}>
          <StudyHubLogo size={40} textSize={20} />
        </div>

        {/* 404 Text */}
        <h1 style={{
          fontSize: 'clamp(6rem, 15vw, 10rem)',
          fontWeight: 900,
          lineHeight: 1,
          margin: '0 0 16px',
          background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #c084fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.05em',
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 700,
          color: '#f1f5f9',
          marginBottom: 16
        }}>
          Lost in Space?
        </h2>

        <p style={{
          fontSize: 16,
          color: '#94a3b8',
          lineHeight: 1.6,
          marginBottom: 40,
        }}>
          The page you're looking for has drifted away or never existed in this galaxy.
          Let's get you back to your studies.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            borderRadius: 12,
            transition: 'all 0.2s',
            boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
          }}>
            <Home size={18} />
            Back to Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              borderRadius: 12,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = '#f1f5f9';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.color = '#94a3b8';
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
        fontSize: 12,
        color: '#1e293b',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }}>
        StudyHub Academic Error Handling
      </div>
    </div>
  );
}
