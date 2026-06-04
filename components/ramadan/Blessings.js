'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

const BLESSINGS = [
  { message: 'May your work be blessed 🤲', icon: '🤲' },
  { message: 'Ramadan Mubarak 🌙', icon: '🌙' },
  { message: 'Barakallah feek ✨', icon: '✨' },
  { message: 'May this effort be accepted 📿', icon: '📿' },
  { message: 'Blessings upon your day 🌅', icon: '🌅' },
  { message: 'Ameen, may Allah reward you 🤲', icon: '🤲' },
  { message: 'Jazakallah khair 🌟', icon: '🌟' },
  { message: 'Your deeds shine bright ✨', icon: '✨' },
];

const BlessingsContext = createContext();

export function useBlessings() {
  return useContext(BlessingsContext);
}

export function BlessingsProvider({ children }) {
  const { theme, darkThemeVariant, lightThemeVariant } = useTheme();
  const variant = theme === 'dark' ? darkThemeVariant : lightThemeVariant;
  const isActive = variant === 'ramadan';

  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);
  const cooldownRef = useRef(0);

  const trigger = useCallback((specificMessage) => {
    if (!isActive) return;
    const now = Date.now();
    if (now - cooldownRef.current < 12000) return;
    cooldownRef.current = now;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setVisible(false);
    }

    const blessing = specificMessage
      ? { message: specificMessage, icon: '🤲' }
      : BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];

    setCurrent(blessing);
    requestAnimationFrame(() => setVisible(true));

    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setCurrent(null), 600);
    }, 3500);
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <BlessingsContext.Provider value={{ trigger, isActive }}>
      {children}

      {/* Blessing toast */}
      {current && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999999] pointer-events-none"
          style={{
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: visible ? 1 : 0,
            transform: visible
              ? 'translateX(-50%) translateY(0) scale(1)'
              : 'translateX(-50%) translateY(16px) scale(0.9)',
          }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl"
            style={{
              background: 'rgba(6, 10, 20, 0.85)',
              borderColor: 'rgba(251, 191, 36, 0.25)',
              boxShadow: '0 0 30px rgba(251, 191, 36, 0.08), 0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-base">{current.icon}</span>
            <span
              className="text-[10px] font-black uppercase tracking-[0.12em]"
              style={{ color: '#fefce8' }}
            >
              {current.message}
            </span>
          </div>
        </div>
      )}
    </BlessingsContext.Provider>
  );
}
