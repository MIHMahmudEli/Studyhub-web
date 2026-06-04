'use client';

import { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

function AuroraEffect({ canvasRef, canvasWidth, canvasHeight }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;

    const draw = () => {
      time += 0.003;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const auroraAlpha = 0.04 + 0.03 * Math.sin(time * 2.3);
      if (auroraAlpha < 0.02) { animId = requestAnimationFrame(draw); return; }

      const layers = 3;
      for (let l = 0; l < layers; l++) {
        const phase = l * 2.1;
        const yBase = canvasHeight * (0.1 + l * 0.12);
        const height = 40 + l * 20;

        ctx.beginPath();
        ctx.moveTo(0, yBase + height);

        for (let x = 0; x <= canvasWidth; x += 4) {
          const wave = Math.sin(x * 0.008 + time * 1.7 + phase) * 18
                     + Math.sin(x * 0.015 + time * 2.3 + phase * 0.7) * 10
                     + Math.sin(x * 0.003 + time * 0.9 + phase * 1.3) * 25;
          ctx.lineTo(x, yBase + wave);
        }

        ctx.lineTo(canvasWidth, yBase + height);
        ctx.lineTo(0, yBase + height);
        ctx.closePath();

        const hue = 40 + l * 8;
        ctx.fillStyle = `rgba(${hue + 180}, ${hue + 140}, ${60 + l * 20}, ${auroraAlpha * (1 - l * 0.2)})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [canvasRef, canvasWidth, canvasHeight]);

  return null;
}

export default function RamadanDecoration() {
  const { theme, darkThemeVariant, lightThemeVariant, preview } = useTheme();
  const effectiveVariant = preview?.variant || (theme === 'dark' ? darkThemeVariant : lightThemeVariant);
  const isActive = effectiveVariant === 'ramadan';

  const starCanvasRef = useRef(null);
  const auroraCanvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });

  const [lanterns] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      delay: Math.random() * 20,
      duration: 16 + Math.random() * 12,
      size: 2 + Math.random() * 4,
      opacity: 0.2 + Math.random() * 0.35,
    }))
  );

  const [dust] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: 'd' + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      delay: Math.random() * 15,
      duration: 25 + Math.random() * 20,
      driftX: (Math.random() - 0.5) * 0.4,
      driftY: -0.05 - Math.random() * 0.1,
      opacity: 0.08 + Math.random() * 0.15,
    }))
  );

  useEffect(() => {
    if (!isActive) return;

    const canvas = starCanvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let w = 0, h = 0;
    let stars = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      setCanvasSize({ w, h });
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setCanvasSize({ w, h });

      const count = Math.min(80, Math.floor((w * h) / 16000));
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: 0.3 + Math.random() * 1.4,
          baseOpacity: 0.08 + Math.random() * 0.35,
          twinkleSpeed: 0.0008 + Math.random() * 0.004,
          twinklePhase: Math.random() * Math.PI * 2,
          driftX: (Math.random() - 0.5) * 0.02,
          driftY: (Math.random() - 0.5) * 0.01,
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (timestamp) => {
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.x += s.driftX;
        s.y += s.driftY;
        if (s.x < -20) s.x = w + 20;
        if (s.x > w + 20) s.x = -20;
        if (s.y < -20) s.y = h + 20;
        if (s.y > h + 20) s.y = -20;

        const twinkle = Math.sin(timestamp * s.twinkleSpeed + s.twinklePhase);
        const opacity = s.baseOpacity * (0.75 + twinkle * 0.25);
        const gold = Math.round(200 + twinkle * 45);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${gold}, ${gold - 60}, 100, ${Math.max(0.02, opacity)})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Star canvas */}
      <canvas ref={starCanvasRef} className="absolute inset-0" />

      {/* Aurora shimmer canvas */}
      <canvas
        ref={auroraCanvasRef}
        className="absolute inset-0"
        style={{ opacity: 0.6 }}
      />
      <AuroraEffect canvasRef={auroraCanvasRef} canvasWidth={canvasSize.w} canvasHeight={canvasSize.h} />

      {/* Top golden ambient glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[350px] md:h-[450px] rounded-full bg-[rgba(251,191,36,0.06)] blur-[120px] animate-ramadan-moon" />

      {/* Mid horizon warm band */}
      <div className="absolute bottom-[20%] left-0 right-0 h-[200px] bg-gradient-to-b from-transparent to-[rgba(251,191,36,0.015)]" />

      {/* Crescent Moon */}
      <div className="absolute top-[10%] right-[6%] md:top-[12%] md:right-[10%] opacity-[0.14] md:opacity-[0.18] animate-ramadan-moon">
        <svg width="70" height="70" viewBox="0 0 100 100" className="md:w-[90px] md:h-[90px]">
          <defs>
            <radialGradient id="moonGlowV2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="60%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <filter id="moonSoftGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="42" fill="url(#moonGlowV2)" filter="url(#moonSoftGlow)" />
          <circle cx="64" cy="40" r="37" fill="var(--background)" />
        </svg>
      </div>

      {/* Rotating geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.018] md:opacity-[0.025] animate-ramadan-geo">
        <div
          className="w-[200%] h-[200%] -top-1/2 -left-1/2 absolute"
          style={{
            backgroundImage: `
              repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(251,191,36,0.08) 1deg, transparent 2deg, transparent 88deg, rgba(251,191,36,0.08) 89deg, transparent 90deg),
              repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(251,191,36,0.06) 60px, rgba(251,191,36,0.06) 61px),
              repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(251,191,36,0.06) 60px, rgba(251,191,36,0.06) 61px)
            `,
          }}
        />
      </div>

      {/* Floating light dust particles */}
      {dust.map((d) => (
        <div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            background: 'radial-gradient(circle, rgba(253,230,138,0.4), transparent)',
            boxShadow: '0 0 4px rgba(253,230,138,0.1)',
            animation: `ramadan-lantern-rise ${d.duration}s ease-in-out ${d.delay}s infinite`,
            opacity: d.opacity,
          }}
        />
      ))}

      {/* Lantern particles */}
      {lanterns.map((l) => (
        <div
          key={l.id}
          className="absolute rounded-full"
          style={{
            left: `${l.x}%`,
            bottom: '-5%',
            width: `${l.size}px`,
            height: `${l.size * 1.6}px`,
            background: 'radial-gradient(ellipse, rgba(251,191,36,0.5), rgba(245,158,11,0.08) 70%, transparent)',
            boxShadow: '0 0 8px rgba(251,191,36,0.15)',
            animation: `ramadan-lantern-rise ${l.duration}s ease-in-out ${l.delay}s infinite`,
            opacity: l.opacity,
          }}
        />
      ))}

      {/* Desert Horizon with Mosque Silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-[120px] md:h-[160px] opacity-[0.04] md:opacity-[0.06]">
        {/* Distant dunes */}
        <svg viewBox="0 0 1200 140" preserveAspectRatio="xMidYMax slice" className="w-full h-full" fill="currentColor" color="#fbbf24">
          <path d="M0,140 L0,115 Q40,105 80,110 L120,100 Q160,88 200,95 L250,100 Q290,85 340,92 L380,88 Q420,75 460,85 L520,95 Q570,78 620,90 L670,85 Q710,72 750,82 L800,92 Q850,75 900,88 L950,82 Q990,70 1030,80 L1080,92 Q1130,78 1170,88 L1200,95 L1200,140 Z" />
          <path d="M0,140 L0,125 Q50,112 100,118 L150,110 Q190,100 230,108 L290,115 Q340,100 390,110 L440,105 Q480,92 520,102 L580,112 Q630,98 680,108 L730,102 Q770,90 810,100 L870,110 Q920,96 970,108 L1020,102 Q1060,90 1100,100 L1150,110 Q1180,100 1200,108 L1200,140 Z" opacity="0.5" />
          {/* Mosque minarets */}
          <path d="M260,100 L270,55 L280,100 Z" />
          <path d="M270,55 L270,45" stroke="currentColor" strokeWidth="1.5" />
          <path d="M570,95 L580,50 L590,95 Z" />
          <path d="M580,50 L580,40" stroke="currentColor" strokeWidth="1.5" />
          <path d="M880,100 L890,55 L900,100 Z" />
          <path d="M890,55 L890,45" stroke="currentColor" strokeWidth="1.5" />
          {/* Small domes */}
          <path d="M240,100 Q260,85 280,100 Z" />
          <path d="M550,95 Q570,80 590,95 Z" />
          <path d="M860,100 Q880,85 900,100 Z" />
          {/* Crescent moon tips on minarets */}
          <circle cx="270" cy="45" r="2" />
          <circle cx="580" cy="40" r="2" />
          <circle cx="890" cy="45" r="2" />
        </svg>
      </div>
    </div>
  );
}
