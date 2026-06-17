'use client';

import { useTheme } from '@/context/ThemeContext';

// Hand-placed stars in the upper sky. Fixed positions = deterministic (no
// hydration mismatch) and zero per-frame work.
const STARS = [
  { x: 8, y: 13, s: 2 }, { x: 17, y: 27, s: 1.5 }, { x: 26, y: 9, s: 2.5 },
  { x: 34, y: 20, s: 1.5 }, { x: 43, y: 11, s: 2 }, { x: 12, y: 42, s: 1.5 },
  { x: 55, y: 16, s: 1.5 }, { x: 62, y: 8, s: 2.5 }, { x: 71, y: 23, s: 2 },
  { x: 80, y: 13, s: 1.5 }, { x: 88, y: 29, s: 2 }, { x: 93, y: 15, s: 1.5 },
  { x: 49, y: 31, s: 1.5 }, { x: 22, y: 54, s: 1.5 }, { x: 77, y: 45, s: 1.5 },
  { x: 40, y: 44, s: 2 },
];

/**
 * Calm, simple Ramadan night. Purely CSS/SVG — no canvas, no animation loops,
 * no particle swarm — so it's serene to look at and cheap to render.
 */
export default function RamadanDecoration() {
  const { theme, darkThemeVariant, lightThemeVariant, preview } = useTheme();
  const variant = preview?.variant || (theme === 'dark' ? darkThemeVariant : lightThemeVariant);
  if (variant !== 'ramadan') return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Soft moonlight glow from the top */}
      <div
        className="absolute -top-[18%] left-1/2 -translate-x-1/2 w-[120vw] max-w-[900px] h-[420px] rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(ellipse, rgba(251,191,36,0.16), transparent 70%)' }}
      />

      {/* Gentle, slowly twinkling stars */}
      {STARS.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full animate-ramadan-star"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: `${st.s}px`,
            height: `${st.s}px`,
            background: '#fde68a',
            boxShadow: '0 0 6px rgba(253,230,138,0.6)',
            animationDelay: `${(i % 5) * 0.9}s`,
          }}
        />
      ))}

      {/* Crescent moon — the calm centerpiece */}
      <div
        className="absolute top-[8%] right-[9%] md:top-[10%] md:right-[11%] animate-ramadan-moon"
        style={{ filter: 'drop-shadow(0 0 28px rgba(251,191,36,0.45))' }}
      >
        <svg width="84" height="84" viewBox="0 0 100 100" className="md:w-[120px] md:h-[120px]">
          <defs>
            <radialGradient id="rMoon" cx="42%" cy="40%" r="62%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="55%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="40" fill="url(#rMoon)" />
          <circle cx="63" cy="42" r="34" fill="var(--background)" />
        </svg>
      </div>

      {/* Serene mosque skyline along the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[120px] md:h-[180px]">
        <svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" className="w-full h-full">
          <defs>
            <linearGradient id="rSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(251,191,36,0.10)" />
              <stop offset="100%" stopColor="rgba(251,191,36,0.30)" />
            </linearGradient>
          </defs>
          <g fill="url(#rSky)">
            <rect x="0" y="182" width="1200" height="38" />
            {/* left minaret */}
            <rect x="180" y="84" width="9" height="98" />
            <path d="M180 84 Q184.5 70 189 84 Z" />
            {/* left dome */}
            <path d="M250 182 Q300 122 350 182 Z" />
            <rect x="296" y="122" width="8" height="14" />
            {/* central mosque */}
            <path d="M500 182 Q620 58 740 182 Z" />
            <rect x="616" y="46" width="9" height="18" />
            <rect x="478" y="92" width="8" height="90" />
            <path d="M478 92 Q482 80 486 92 Z" />
            <rect x="754" y="92" width="8" height="90" />
            <path d="M754 92 Q758 80 762 92 Z" />
            {/* right dome */}
            <path d="M880 182 Q940 118 1000 182 Z" />
            <rect x="936" y="118" width="8" height="16" />
            {/* far-right minaret */}
            <rect x="1050" y="80" width="9" height="102" />
            <path d="M1050 80 Q1054.5 66 1059 80 Z" />
          </g>
        </svg>
      </div>
    </div>
  );
}
