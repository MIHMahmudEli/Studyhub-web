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
    let ssInterval = 2000 + Math.random() * 4000;

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

      const count = Math.min(50, Math.floor((w * h) / 1200));
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: 0.2 + Math.random() * 1.0,
          baseOpacity: 0.2 + Math.random() * 0.8,
          twinkleSpeed: 0.003 + Math.random() * 0.025,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      return { w, h };
    };

    let dims = resize();
    const ro = new ResizeObserver(() => { dims = resize(); });
    ro.observe(canvas.parentElement);

    const spawn = (w, h) => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.5,
      angle: Math.PI / 4 + (Math.random() - 0.35) * (Math.PI / 2.5),
      speed: 6 + Math.random() * 10,
      length: 40 + Math.random() * 80,
      life: 1,
      decay: 0.01 + Math.random() * 0.02,
      opacity: 0.4 + Math.random() * 0.6,
    });

    const animate = (ts) => {
      const { w, h } = dims;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const twinkle = Math.sin(ts * s.twinkleSpeed + s.twinklePhase);
        const opacity = s.baseOpacity + twinkle * 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0.04, opacity)})`;
        ctx.fill();
      }

      if (ts - lastSSTime > ssInterval) {
        shootingStars.push(spawn(w, h));
        lastSSTime = ts;
        ssInterval = 1500 + Math.random() * 4500;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.life -= ss.decay;
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;

        if (ss.life <= 0 || ss.x > w + 30 || ss.y > h + 30) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tx = ss.x - Math.cos(ss.angle) * ss.length;
        const ty = ss.y - Math.sin(ss.angle) * ss.length;

        const grad = ctx.createLinearGradient(ss.x, ss.y, tx, ty);
        grad.addColorStop(0, `rgba(200,215,255,${ss.opacity * ss.life})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2 + (1 - ss.life) * 0.6;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 1 + ss.life * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230,240,255,${ss.opacity * ss.life})`;
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
