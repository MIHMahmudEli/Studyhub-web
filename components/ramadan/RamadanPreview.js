'use client';

export default function RamadanPreview({ light = false }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient background */}
      <div className={`absolute inset-0 ${light ? 'bg-gradient-to-br from-amber-300 via-yellow-200 to-emerald-300' : 'bg-gradient-to-br from-amber-700 via-emerald-800 to-amber-900'}`} />

      {/* Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 85}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              background: light ? '#b45309' : '#fde68a',
              opacity: 0.15 + Math.random() * 0.3,
              animation: `ramadan-star-shimmer ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Top ambient glow */}
      <div className={`absolute top-[-15%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] rounded-full blur-[60px] ${light ? 'bg-amber-500/10' : 'bg-amber-500/15'}`} />

      {/* Crescent Moon */}
      <div className={`absolute ${light ? 'top-[6%] right-[8%]' : 'top-[8%] right-[10%]'} opacity-50 ${light ? '' : 'drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]'}`}>
        <svg width="36" height="36" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="previewMoon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="60%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor={light ? '#b45309' : '#d97706'} />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="42" fill="url(#previewMoon)" />
          <circle cx="64" cy="40" r="37" fill={light ? '#fef3c7' : '#060a14'} />
        </svg>
      </div>

      {/* Lantern particles */}
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={'l' + i}
          className="absolute rounded-full"
          style={{
            left: `${8 + i * 25 + Math.random() * 8}%`,
            bottom: '-5%',
            width: `${2 + Math.random() * 2}px`,
            height: `${3 + Math.random() * 3}px`,
            background: `radial-gradient(ellipse, ${light ? 'rgba(180,83,9,0.5)' : 'rgba(251,191,36,0.5)'}, transparent)`,
            animation: `ramadan-lantern-rise ${12 + Math.random() * 6}s ease-in-out ${Math.random() * 8}s infinite`,
            opacity: 0.2 + Math.random() * 0.25,
          }}
        />
      ))}

      {/* Mosque silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-[25%] opacity-30">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="xMidYMax slice" className="w-full h-full" fill="currentColor" color={light ? '#78350f' : '#fbbf24'}>
          <path d="M0,120 L0,100 Q40,92 80,97 L120,88 Q160,78 200,85 L250,90 Q290,78 340,85 L380,80 Q420,70 460,78 L520,88 Q570,72 620,82 L670,78 Q710,68 750,76 L800,85 Q850,72 900,80 L950,76 Q990,66 1030,74 L1080,85 Q1130,72 1170,80 L1200,88 L1200,120 Z" />
          <path d="M0,120 L0,108 Q50,98 100,103 L150,95 Q190,88 230,95 L290,100 Q340,88 390,95 L440,90 Q480,80 520,88 L580,98 Q630,85 680,93 L730,88 Q770,78 810,86 L870,95 Q920,82 970,92 L1020,88 Q1060,78 1100,86 L1150,95 Q1180,86 1200,92 L1200,120 Z" opacity="0.5" />
          <path d="M260,85 L270,50 L280,85 Z" />
          <path d="M270,50 L270,42" stroke="currentColor" strokeWidth="1.5" />
          <path d="M570,82 L580,46 L590,82 Z" />
          <path d="M580,46 L580,38" stroke="currentColor" strokeWidth="1.5" />
          <path d="M880,85 L890,50 L900,85 Z" />
          <path d="M890,50 L890,42" stroke="currentColor" strokeWidth="1.5" />
          <path d="M240,85 Q260,72 280,85 Z" />
          <path d="M550,82 Q570,70 590,82 Z" />
          <path d="M860,85 Q880,72 900,85 Z" />
          <circle cx="270" cy="42" r="1.5" />
          <circle cx="580" cy="38" r="1.5" />
          <circle cx="890" cy="42" r="1.5" />
        </svg>
      </div>

      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="w-[200%] h-[200%] -top-1/2 -left-1/2 absolute animate-ramadan-geo"
          style={{
            backgroundImage: `
              repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${light ? 'rgba(180,83,9,0.08)' : 'rgba(251,191,36,0.08)'} 1deg, transparent 2deg, transparent 88deg, ${light ? 'rgba(180,83,9,0.08)' : 'rgba(251,191,36,0.08)'} 89deg, transparent 90deg),
              repeating-linear-gradient(45deg, transparent, transparent 45px, ${light ? 'rgba(180,83,9,0.06)' : 'rgba(251,191,36,0.06)'} 45px, ${light ? 'rgba(180,83,9,0.06)' : 'rgba(251,191,36,0.06)'} 46px),
              repeating-linear-gradient(-45deg, transparent, transparent 45px, ${light ? 'rgba(180,83,9,0.06)' : 'rgba(251,191,36,0.06)'} 45px, ${light ? 'rgba(180,83,9,0.06)' : 'rgba(251,191,36,0.06)'} 46px)
            `,
          }}
        />
      </div>
    </div>
  );
}
