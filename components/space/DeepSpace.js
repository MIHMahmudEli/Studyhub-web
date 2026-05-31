'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function DeepSpace() {
  const canvasRef = useRef(null);
  const { theme, darkThemeVariant, preview } = useTheme();
  const effectiveVariant = preview?.variant || darkThemeVariant;
  const effectiveMode = preview?.mode || theme;
  const isActive = effectiveMode === 'dark' && effectiveVariant === 'current';

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];
    let shootingStars = [];
    let lastSSTime = 0;
    let ssInterval = 8000 + Math.random() * 12000;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(100, Math.floor((width * height) / 13000));
      stars = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        stars.push({
          x, y,
          originX: x,
          originY: y,
          size: 0.3 + Math.random() * 1.0,
          baseOpacity: 0.2 + Math.random() * 0.8,
          twinkleSpeed: 0.0007 + Math.random() * 0.0045,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleAmount: 0.1 + Math.random() * 0.3,
          orbitRadius: 25 + Math.random() * 25,
          orbitSpeed: 0.003 + Math.random() * 0.006,
          orbitAngle: Math.random() * Math.PI * 2,
          direction: Math.random() > 0.5 ? 1 : -1,
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const spawnShootingStar = () => {
      const angle = Math.PI / 3 + (Math.random() - 0.5) * (Math.PI / 3);
      const speed = 1.2 + Math.random() * 2.5;
      const life = 1;
      const totalLife = life;
      return {
        x: Math.random() * width,
        y: Math.random() * height * 0.4,
        angle,
        speed,
        length: 80 + Math.random() * 200,
        life,
        totalLife,
        decay: 0.0015 + Math.random() * 0.0035,
        opacity: 0.35 + Math.random() * 0.45,
        size: 1.2 + Math.random() * 1.2,
        hue: 200 + Math.random() * 40,
        spawnTime: performance.now(),
        fadeInDuration: 600 + Math.random() * 800,
      };
    };

    const animate = (timestamp) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.orbitAngle += s.orbitSpeed * s.direction;
        s.x = s.originX + Math.cos(s.orbitAngle) * s.orbitRadius;
        s.y = s.originY + Math.sin(s.orbitAngle) * s.orbitRadius;

        const twinkle = Math.sin(timestamp * s.twinkleSpeed + s.twinklePhase);
        const opacity = s.baseOpacity * (0.92 + twinkle * s.twinkleAmount);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0.02, opacity)})`;
        ctx.fill();
      }

      if (timestamp - lastSSTime > ssInterval) {
        shootingStars.push(spawnShootingStar());
        lastSSTime = timestamp;
        ssInterval = 7000 + Math.random() * 18000;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.life -= ss.decay * (ss.speed / 1.8);
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;

        if (ss.life <= 0 || ss.x > width + 100 || ss.y > height + 100) {
          shootingStars.splice(i, 1);
          continue;
        }

        const elapsed = timestamp - ss.spawnTime;
        const fadeIn = Math.min(1, elapsed / ss.fadeInDuration);
        const currentOpacity = ss.opacity * ss.life * fadeIn;
        if (currentOpacity < 0.01) continue;

        const tailLen = ss.length * (0.5 + ss.life * 0.5);
        const tailX = ss.x - Math.cos(ss.angle) * tailLen;
        const tailY = ss.y - Math.sin(ss.angle) * tailLen;

        const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        grad.addColorStop(0, `rgba(${ss.hue},${ss.hue + 30},255,${currentOpacity})`);
        grad.addColorStop(0.2, `rgba(${ss.hue},${ss.hue + 20},255,${currentOpacity * 0.5})`);
        grad.addColorStop(0.6, `rgba(${ss.hue + 20},${ss.hue + 40},255,${currentOpacity * 0.15})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        const lineW = ss.size * (0.6 + ss.life * 0.6) * fadeIn;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round';
        ctx.stroke();

        const glowRadius = ss.size * 2.5 * fadeIn;
        const glow = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, glowRadius);
        glow.addColorStop(0, `rgba(230,240,255,${currentOpacity * 0.6})`);
        glow.addColorStop(1, 'rgba(230,240,255,0)');
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ss.x, ss.y, ss.size * 0.8 * fadeIn, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230,240,255,${currentOpacity * 0.9})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars = [];
      shootingStars = [];
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
