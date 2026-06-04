'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';

const QUOTES = [
  { text: 'The best of you are those who learn the Quran and teach it.', source: 'Bukhari' },
  { text: 'Whoever fasts Ramadan with faith and expectation of reward, all their past sins are forgiven.', source: 'Bukhari & Muslim' },
  { text: 'The month of Ramadan in which the Quran was revealed — a guidance for mankind.', source: 'Quran 2:185' },
  { text: 'When Ramadan begins, the gates of Paradise are opened and the gates of Hell are closed.', source: 'Bukhari & Muslim' },
  { text: 'Whoever gives iftar to one who is fasting will have a reward equal to theirs, without detracting from the reward of the fasting person in the slightest.', source: 'Tirmidhi' },
  { text: 'Be steadfast in prayer and practice regular charity. Whatever good you send forth for your souls, you shall find it with Allah.', source: 'Quran 2:110' },
  { text: 'The most beloved of deeds to Allah are those that are most consistent, even if small.', source: 'Bukhari & Muslim' },
  { text: 'Every action of the son of Adam is multiplied — a good deed is multiplied tenfold up to seven hundred times. Allah says: Except fasting, for it is for Me and I shall reward for it.', source: 'Bukhari & Muslim' },
  { text: 'Patience is a pillar of faith. Ramadan is the month of patience, and the reward for patience is Paradise.', source: 'Various' },
  { text: 'O you who believe, fasting is prescribed for you as it was prescribed for those before you, that you may attain taqwa (God-consciousness).', source: 'Quran 2:183' },
];

const SHOW_DURATION = 10000;
const MIN_GAP = 40000;
const MAX_GAP = 90000;

function randomIndex() {
  return Math.floor(Math.random() * QUOTES.length);
}

function randomDelay() {
  return MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
}

export default function RamadanReflectionPanel() {
  const { theme, darkThemeVariant, lightThemeVariant } = useTheme();
  const variant = theme === 'dark' ? darkThemeVariant : lightThemeVariant;
  const isActive = variant === 'ramadan';

  const [quote, setQuote] = useState(null);
  const [visible, setVisible] = useState(false);

  const scheduleNext = useCallback(() => {
    const delay = isActive ? randomDelay() : 0;
    return setTimeout(() => {
      if (!isActive) return;
      setQuote(QUOTES[randomIndex()]);
      requestAnimationFrame(() => setVisible(true));
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => setQuote(null), 500);
      }, SHOW_DURATION);
    }, delay);
  }, [isActive]);

  useEffect(() => {
    const t = scheduleNext();
    return () => clearTimeout(t);
  }, [scheduleNext]);

  if (!isActive || !quote) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[999999] pointer-events-none flex items-end justify-center pb-8"
      style={{
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="pointer-events-auto"
        style={{
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: visible ? 1 : 0,
          transform: visible
            ? 'translateY(0) scale(1)'
            : 'translateY(16px) scale(0.9)',
          maxWidth: 'min(90vw, 480px)',
        }}
      >
        <div
        className="relative p-4 rounded-2xl border backdrop-blur-xl shadow-2xl"
        style={{
          background: 'rgba(6, 10, 20, 0.88)',
          borderColor: 'rgba(251, 191, 36, 0.2)',
          boxShadow: '0 0 30px rgba(251, 191, 36, 0.06), 0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px]">🌙</span>
          <span className="text-[7px] font-black uppercase tracking-[0.15em]" style={{ color: 'rgba(251,191,36,0.5)' }}>
            Reflection
          </span>
        </div>
        <p className="text-[11px] font-medium leading-relaxed" style={{ color: '#d4c5a0' }}>
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-[7px] font-bold uppercase tracking-wider mt-1.5" style={{ color: 'rgba(251,191,36,0.4)' }}>
          — {quote.source}
        </p>
      </div>
      </div>
    </div>
  );
}
