'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Moon, Sunrise, Flame, Sparkles, Heart } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import {
  getRamadanStatus,
  getNextEvent,
  formatCountdown,
  tickStreak,
} from '@/lib/ramadan';

/* ─────────────────────────────────────────────────────────────
   1. Suhoor / Iftar live countdown
   ───────────────────────────────────────────────────────────── */

function CountdownWidget() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const event = useMemo(() => getNextEvent(now), [now]);
  const remaining = event.target.getTime() - now.getTime();
  const { h, m, s } = formatCountdown(remaining);
  const Icon = event.mode === 'iftar' ? Moon : Sunrise;
  const accent = event.mode === 'iftar' ? '#f59e0b' : '#10b981';

  return (
    <div
      data-ramadan-decor
      className="relative overflow-hidden rounded-[1.75rem] border bg-gradient-to-br from-amber-500/[0.04] via-transparent to-emerald-500/[0.03] backdrop-blur-xl animate-ramadan-breathe p-6"
      style={{ borderColor: 'rgba(251, 191, 36, 0.16)' }}
    >
      {/* Rotating ring */}
      <div
        className="absolute -right-16 -top-16 w-56 h-56 rounded-full pointer-events-none animate-ramadan-ring opacity-30"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${accent}55, transparent 40%)`,
        }}
      />
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Icon size={14} style={{ color: accent }} />
          <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: accent }}>
            {event.label}
          </span>
        </div>

        <div className="flex items-end gap-1 mb-2">
          <TickBlock value={h} accent={accent} />
          <span className="text-2xl font-black opacity-30 pb-1" style={{ color: accent }}>:</span>
          <TickBlock value={m} accent={accent} />
          <span className="text-2xl font-black opacity-30 pb-1" style={{ color: accent }}>:</span>
          <TickBlock value={s} accent={accent} />
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(251,191,36,0.1)' }}>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-3)]">
            {event.sublabel}
          </span>
          <span className="ml-auto text-[8px] font-black uppercase tracking-[0.18em] opacity-60" style={{ color: accent }}>
            {event.target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}

function TickBlock({ value, accent }) {
  const prev = useRef(value);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (prev.current !== value) {
      setBump(true);
      const id = setTimeout(() => setBump(false), 400);
      prev.current = value;
      return () => clearTimeout(id);
    }
  }, [value]);

  return (
    <div
      className={`min-w-[2.6rem] px-2 py-1.5 rounded-xl border text-center ${bump ? 'ramadan-tick' : ''}`}
      style={{
        background: 'rgba(15, 18, 30, 0.45)',
        borderColor: `${accent}33`,
      }}
    >
      <span
        className="text-2xl font-black tracking-tighter tabular-nums"
        style={{ color: '#fefce8', textShadow: `0 0 14px ${accent}40` }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. Ramadan Journey Progress (arc + day pill)
   ───────────────────────────────────────────────────────────── */

function JourneyWidget() {
  const status = useMemo(() => getRamadanStatus(), []);
  const day = status.currentDay ?? (status.isPostRamadan ? status.totalDays : 0);
  const percent = status.isRamadan ? status.percent : (status.isPostRamadan ? 100 : 0);

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  let phase = 'Awaiting';
  if (status.isRamadan) {
    if (day <= 10)      phase = 'First Ashra · Mercy';
    else if (day <= 20) phase = 'Second Ashra · Forgiveness';
    else                phase = 'Third Ashra · Freedom';
  } else if (status.isPostRamadan) {
    phase = 'Mubarak · Reflection';
  } else if (status.daysUntil) {
    phase = `${status.daysUntil} days until Ramadan`;
  }

  return (
    <div
      data-ramadan-decor
      className="relative overflow-hidden rounded-[1.75rem] border bg-gradient-to-br from-amber-500/[0.05] to-transparent backdrop-blur-xl p-6 animate-ramadan-breathe"
      style={{ borderColor: 'rgba(251, 191, 36, 0.16)' }}
    >
      <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative flex items-center gap-5">
        {/* Circular arc */}
        <div className="relative w-[148px] h-[148px] flex items-center justify-center shrink-0">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 160 160">
            <defs>
              <linearGradient id="ramadanArcGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#fde68a" />
                <stop offset="50%"  stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <circle
              cx="80" cy="80" r={radius}
              fill="none"
              stroke="rgba(251, 191, 36, 0.10)"
              strokeWidth="6"
            />
            <circle
              cx="80" cy="80" r={radius}
              fill="none"
              stroke="url(#ramadanArcGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.4))',
              }}
            />
          </svg>
          <div className="relative text-center">
            <div className="text-[8px] font-black uppercase tracking-[0.25em] text-amber-500/70">Day</div>
            <div
              className="text-4xl font-black tracking-tighter"
              style={{ color: '#fefce8', textShadow: '0 0 20px rgba(251,191,36,0.4)' }}
            >
              {day}
            </div>
            <div className="text-[8px] font-black uppercase tracking-[0.25em] text-amber-500/70">
              of {status.totalDays}
            </div>
          </div>
        </div>

        {/* Info column */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-500">
              Journey
            </span>
          </div>
          <p className="text-[12px] font-black uppercase tracking-tight text-[var(--foreground)] leading-tight">
            {phase}
          </p>
          {status.isRamadan && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-3)]">
              {status.daysRemaining} days remain · {percent}%
            </p>
          )}
          {!status.isRamadan && !status.isPostRamadan && status.daysUntil && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-3)]">
              Preview mode · sky already lit
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. Barakah Streak
   ───────────────────────────────────────────────────────────── */

function StreakWidget() {
  // Lazy initializer — runs once per mount, ticks the streak (writes
  // localStorage once per UTC day) and returns the resulting numbers.
  const [streak] = useState(() => {
    if (typeof window === 'undefined') return { current: 0, best: 0 };
    const r = tickStreak();
    return { current: r.current, best: r.best };
  });

  // Generate a 7-day flame strip showing the trailing window
  const dots = Array.from({ length: 7 }, (_, i) => {
    const dayIndex = 6 - i;            // oldest left → newest right
    const active = dayIndex < streak.current;
    return { active, dayIndex };
  }).reverse();

  return (
    <div
      data-ramadan-decor
      className="relative overflow-hidden rounded-[1.75rem] border bg-gradient-to-br from-amber-500/[0.04] via-transparent to-orange-500/[0.04] backdrop-blur-xl p-6 animate-ramadan-breathe"
      style={{ borderColor: 'rgba(251, 191, 36, 0.16)' }}
    >
      <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={14} className="text-orange-400 animate-ramadan-flame" />
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-orange-400">
                Barakah Streak
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-4xl font-black tracking-tighter"
                style={{ color: '#fefce8', textShadow: '0 0 20px rgba(251,146,60,0.45)' }}
              >
                {streak.current}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)]">
                day{streak.current === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[var(--text-3)] mt-1">
              Best · {streak.best} days
            </p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Heart size={16} className="text-orange-400" />
          </div>
        </div>

        {/* 7-day mini strip */}
        <div className="flex items-center gap-1.5 pt-3 border-t" style={{ borderColor: 'rgba(251,191,36,0.1)' }}>
          {dots.map((d, idx) => (
            <div
              key={idx}
              className="flex-1 h-1.5 rounded-full transition-all duration-500"
              style={{
                background: d.active
                  ? 'linear-gradient(90deg, rgba(251,191,36,0.7), rgba(251,146,60,0.7))'
                  : 'rgba(251,191,36,0.08)',
                boxShadow: d.active ? '0 0 6px rgba(251,146,60,0.4)' : 'none',
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 text-[7px] font-black uppercase tracking-[0.22em] text-[var(--text-3)]">
          <span>7-day window</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Composite dashboard panel — only renders inside Ramadan theme
   ───────────────────────────────────────────────────────────── */

export default function RamadanDashboardPanel() {
  const { theme, darkThemeVariant, lightThemeVariant } = useTheme();
  const variant = theme === 'dark' ? darkThemeVariant : lightThemeVariant;
  const isActive = variant === 'ramadan';
  if (!isActive) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <Link
          href="/settings"
          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/80 hover:text-amber-500 transition-colors"
        >
          <Moon size={11} /> Ramadan Companion
        </Link>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CountdownWidget />
        <JourneyWidget />
        <StreakWidget />
      </div>
    </section>
  );
}
