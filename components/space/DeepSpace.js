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
    let lastShootingStarTime = 0;
    let shootingStarInterval = 3000 + Math.random() * 5000;
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

      const count = Math.min(180, Math.floor((width * height) / 7000));
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.2 + Math.random() * 1.0,
          baseOpacity: 0.15 + Math.random() * 0.85,
          twinkleSpeed: 0.002 + Math.random() * 0.018,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const spawnShootingStar = () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.45,
      angle: Math.PI / 4 + (Math.random() - 0.35) * (Math.PI / 2.5),
      speed: 8 + Math.random() * 14,
      length: 60 + Math.random() * 140,
      life: 1,
      decay: 0.005 + Math.random() * 0.015,
      opacity: 0.5 + Math.random() * 0.5,
    });

    const animate = (timestamp) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const twinkle = Math.sin(timestamp * s.twinkleSpeed + s.twinklePhase);
        const opacity = s.baseOpacity + twinkle * 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0.04, opacity)})`;
        ctx.fill();
      }

      if (timestamp - lastShootingStarTime > shootingStarInterval) {
        shootingStars.push(spawnShootingStar());
        lastShootingStarTime = timestamp;
        shootingStarInterval = 2000 + Math.random() * 7000;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.life -= ss.decay;
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;

        if (ss.life <= 0 || ss.x > width + 50 || ss.y > height + 50) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        grad.addColorStop(0, `rgba(200,215,255,${ss.opacity * ss.life})`);
        grad.addColorStop(0.15, `rgba(180,200,255,${ss.opacity * ss.life * 0.7})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5 + (1 - ss.life) * 0.8;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 1.5 + ss.life * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230,240,255,${ss.opacity * ss.life})`;
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
