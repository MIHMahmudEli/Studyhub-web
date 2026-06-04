'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { getRamadanStatus } from '@/lib/ramadan';

const DISMISS_KEY = 'eid_transition_seen';

/**
 * Full-screen sunrise animation. Triggers once per device when the
 * Ramadan window ends (status.isEidWindow). Can also be force-shown
 * via:  window.dispatchEvent(new CustomEvent('ramadan:show-eid'))
 */
export default function EidTransition() {
  const { theme, darkThemeVariant, lightThemeVariant } = useTheme();
  const variant = theme === 'dark' ? darkThemeVariant : lightThemeVariant;
  const isActive = variant === 'ramadan';

  const [showing, setShowing] = useState(false);
  const [closing, setClosing] = useState(false);

  const dismiss = useCallback(() => {
    setClosing(true);
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setTimeout(() => {
      setShowing(false);
      setClosing(false);
    }, 700);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const seen = typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY);
    const status = getRamadanStatus();
    if (status.isEidWindow && !seen) {
      const t = setTimeout(() => setShowing(true), 600);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  // Manual trigger hook
  useEffect(() => {
    const handler = () => setShowing(true);
    window.addEventListener('ramadan:show-eid', handler);
    return () => window.removeEventListener('ramadan:show-eid', handler);
  }, []);

  // Auto-close after the animation has had time to land
  useEffect(() => {
    if (!showing) return;
    const t = setTimeout(() => dismiss(), 7000);
    return () => clearTimeout(t);
  }, [showing, dismiss]);

  if (!isActive || !showing) return null;

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[9998] cursor-pointer overflow-hidden"
      style={{
        animation: closing
          ? 'fadeOut 0.7s ease-out forwards'
          : 'ramadan-sunrise-bg 6.5s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        opacity: closing ? 0 : 1,
        transition: closing ? 'opacity 0.7s ease' : 'none',
      }}
    >
      {/* Rising sun */}
      <div
        className="absolute left-1/2 bottom-0 -translate-x-1/2"
        style={{
          width: 'min(420px, 60vw)',
          height: 'min(420px, 60vw)',
          animation: 'ramadan-sun-rise 6s cubic-bezier(0.34, 1.2, 0.45, 1) forwards',
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, #fef3c7 0%, #fde68a 35%, #fbbf24 60%, #f59e0b 90%, transparent 100%)',
            boxShadow: '0 0 120px rgba(251,191,36,0.7), 0 0 240px rgba(245,158,11,0.4)',
          }}
        />
      </div>

      {/* Soft cloud bands */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div
          className="absolute left-0 right-0 h-24"
          style={{
            top: '40%',
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.18), transparent)',
            filter: 'blur(24px)',
          }}
        />
        <div
          className="absolute left-0 right-0 h-32"
          style={{
            top: '58%',
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.14), transparent)',
            filter: 'blur(36px)',
          }}
        />
      </div>

      {/* Center text */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        style={{ animation: 'ramadan-eid-text-rise 5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <p
          className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.45em] mb-4"
          style={{ color: 'rgba(120, 53, 15, 0.8)' }}
        >
          The night gently fades
        </p>
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-6"
          style={{
            color: '#451a03',
            textShadow: '0 4px 30px rgba(251,191,36,0.5)',
            fontFamily: 'var(--font-jakarta), sans-serif',
            letterSpacing: '-0.04em',
          }}
        >
          Eid is coming
        </h1>
        <p
          className="text-xs md:text-sm font-black uppercase tracking-[0.35em]"
          style={{ color: 'rgba(120, 53, 15, 0.75)' }}
        >
          Eid is coming  🌅
        </p>
        <p
          className="mt-10 text-[9px] font-black uppercase tracking-[0.3em] opacity-60"
          style={{ color: 'rgba(120, 53, 15, 0.65)' }}
        >
          Tap anywhere to continue
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeOut { to { opacity: 0; } }
      `}</style>
    </div>
  );
}
