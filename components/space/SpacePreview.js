'use client';

import { useEffect, useRef } from 'react';

export default function SpacePreview({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];
    let shootingStars = [];
    let lastSSTime = 0;
    let ssInterval = 8000 + Math.random() * 10000;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(30, Math.floor((w * h) / 2000));
      stars = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        stars.push({
          x, y,
          originX: x,
          originY: y,
          size: 0.3 + Math.random() * 0.9,
          baseOpacity: 0.2 + Math.random() * 0.8,
          twinkleSpeed: 0.0007 + Math.random() * 0.004,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleAmount: 0.1 + Math.random() * 0.28,
          orbitRadius: 20 + Math.random() * 20,
          orbitSpeed: 0.003 + Math.random() * 0.005,
          orbitAngle: Math.random() * Math.PI * 2,
          direction: Math.random() > 0.5 ? 1 : -1,
        });
      }
      return { w, h };
    };

    let dims = resize();
    const ro = new ResizeObserver(() => { dims = resize(); });
    ro.observe(canvas.parentElement);

    const spawn = (w, h) => {
      const angle = Math.PI / 3 + (Math.random() - 0.5) * (Math.PI / 3);
      const speed = 1 + Math.random() * 2;
      return {
        x: Math.random() * w,
        y: Math.random() * h * 0.4,
        angle,
        speed,
        length: 50 + Math.random() * 120,
        life: 1,
        totalLife: 1,
        decay: 0.002 + Math.random() * 0.004,
        opacity: 0.3 + Math.random() * 0.4,
        size: 1 + Math.random() * 1,
        hue: 200 + Math.random() * 40,
        spawnTime: performance.now(),
        fadeInDuration: 400 + Math.random() * 600,
      };
    };

    const animate = (ts) => {
      const { w, h } = dims;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.orbitAngle += s.orbitSpeed * s.direction;
        s.x = s.originX + Math.cos(s.orbitAngle) * s.orbitRadius;
        s.y = s.originY + Math.sin(s.orbitAngle) * s.orbitRadius;

        const twinkle = Math.sin(ts * s.twinkleSpeed + s.twinklePhase);
        const opacity = s.baseOpacity * (0.92 + twinkle * s.twinkleAmount);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0.02, opacity)})`;
        ctx.fill();
      }

      if (ts - lastSSTime > ssInterval) {
        shootingStars.push(spawn(w, h));
        lastSSTime = ts;
        ssInterval = 6000 + Math.random() * 14000;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.life -= ss.decay * (ss.speed / 1.5);
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;

        if (ss.life <= 0 || ss.x > w + 50 || ss.y > h + 50) {
          shootingStars.splice(i, 1);
          continue;
        }

        const elapsed = ts - ss.spawnTime;
        const fadeIn = Math.min(1, elapsed / ss.fadeInDuration);
        const currentOpacity = ss.opacity * ss.life * fadeIn;
        if (currentOpacity < 0.01) continue;

        const tailLen = ss.length * (0.5 + ss.life * 0.5);
        const tx = ss.x - Math.cos(ss.angle) * tailLen;
        const ty = ss.y - Math.sin(ss.angle) * tailLen;

        const grad = ctx.createLinearGradient(ss.x, ss.y, tx, ty);
        grad.addColorStop(0, `rgba(${ss.hue},${ss.hue + 30},255,${currentOpacity})`);
        grad.addColorStop(0.2, `rgba(${ss.hue},${ss.hue + 20},255,${currentOpacity * 0.5})`);
        grad.addColorStop(0.6, `rgba(${ss.hue + 20},${ss.hue + 40},255,${currentOpacity * 0.15})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        const lineW = ss.size * (0.6 + ss.life * 0.6) * fadeIn;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = grad;
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round';
        ctx.stroke();

        const glowRadius = ss.size * 2 * fadeIn;
        const glow = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, glowRadius);
        glow.addColorStop(0, `rgba(230,240,255,${currentOpacity * 0.5})`);
        glow.addColorStop(1, 'rgba(230,240,255,0)');
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ss.x, ss.y, ss.size * 0.7 * fadeIn, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230,240,255,${currentOpacity * 0.8})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      ro.disconnect();
      if (canvas) {
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (rect) ctx.clearRect(0, 0, rect.width, rect.height);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
