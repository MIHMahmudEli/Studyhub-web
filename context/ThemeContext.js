'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiRequest } from '@/lib/api';

const VALID_MODES = ['dark', 'light'];
const VALID_VARIANTS = ['current', 'previous'];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [darkThemeVariant, setDarkThemeVariant] = useState('current');
  const [lightThemeVariant, setLightThemeVariant] = useState('current');
  const [preview, setPreview] = useState(null); // { mode, variant } for admin live-preview

  // Sync effective theme + variant to DOM
  useEffect(() => {
    const mode = preview?.mode || theme;
    const variant = preview?.variant || (mode === 'dark' ? darkThemeVariant : lightThemeVariant);
    document.documentElement.setAttribute('data-theme', mode);
    if (VALID_VARIANTS.includes(variant)) {
      document.documentElement.setAttribute('data-theme-variant', variant);
    } else {
      document.documentElement.removeAttribute('data-theme-variant');
    }
  }, [theme, darkThemeVariant, lightThemeVariant, preview]);

  // On mount: read localStorage, then fetch admin-selected theme variants
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (VALID_MODES.includes(savedTheme)) {
      setTheme(savedTheme);
    }

    Promise.all([
      apiRequest('/admin/settings/dark_theme'),
      apiRequest('/admin/settings/light_theme'),
    ])
      .then(([darkRes, lightRes]) => {
        setDarkThemeVariant(
          VALID_VARIANTS.includes(darkRes?.value) ? darkRes.value : 'current'
        );
        setLightThemeVariant(
          VALID_VARIANTS.includes(lightRes?.value) ? lightRes.value : 'current'
        );
      })
      .catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setPreview(null);
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.add('theme-transitioning');
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 500);
  }, [theme]);

  const previewTheme = useCallback((mode, variant) => {
    setPreview({ mode, variant });
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  const refreshThemeVariants = useCallback(async () => {
    setPreview(null);
    try {
      const [darkRes, lightRes] = await Promise.all([
        apiRequest('/admin/settings/dark_theme'),
        apiRequest('/admin/settings/light_theme'),
      ]);
      const newDark = VALID_VARIANTS.includes(darkRes?.value) ? darkRes.value : 'current';
      const newLight = VALID_VARIANTS.includes(lightRes?.value) ? lightRes.value : 'current';
      setDarkThemeVariant(newDark);
      setLightThemeVariant(newLight);
      return { darkThemeVariant: newDark, lightThemeVariant: newLight };
    } catch {
      return { darkThemeVariant: 'current', lightThemeVariant: 'current' };
    }
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      darkThemeVariant,
      lightThemeVariant,
      toggleTheme,
      previewTheme,
      clearPreview,
      refreshThemeVariants,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
