'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { ThemeContext } from './ThemeContext';
import { apiRequest } from '@/lib/api';

const VALID_MODES = ['dark', 'light'];
const VALID_VARIANTS = ['current', 'previous'];
const CACHE_KEY_DARK = 'admin_dark_theme';
const CACHE_KEY_LIGHT = 'admin_light_theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [darkThemeVariant, setDarkThemeVariant] = useState('current');
  const [lightThemeVariant, setLightThemeVariant] = useState('current');
  const [preview, setPreview] = useState(null);
  const lastSavedTheme = useRef('dark');

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

  useEffect(() => {
    const savedTheme = localStorage.getItem('preferred_theme') || localStorage.getItem('theme') || 'dark';
    if (VALID_MODES.includes(savedTheme)) {
      setTheme(savedTheme);
      lastSavedTheme.current = savedTheme;
    }

    // Restore cached admin theme variants instantly (no flash)
    const cachedDark = localStorage.getItem(CACHE_KEY_DARK);
    const cachedLight = localStorage.getItem(CACHE_KEY_LIGHT);
    if (VALID_VARIANTS.includes(cachedDark)) setDarkThemeVariant(cachedDark);
    if (VALID_VARIANTS.includes(cachedLight)) setLightThemeVariant(cachedLight);

    // Fetch fresh values from server in background, then update cache
    Promise.all([
      apiRequest('/admin/settings/dark_theme'),
      apiRequest('/admin/settings/light_theme'),
    ])
      .then(([darkRes, lightRes]) => {
        const newDark = VALID_VARIANTS.includes(darkRes?.value) ? darkRes.value : 'current';
        const newLight = VALID_VARIANTS.includes(lightRes?.value) ? lightRes.value : 'current';
        setDarkThemeVariant(newDark);
        setLightThemeVariant(newLight);
        localStorage.setItem(CACHE_KEY_DARK, newDark);
        localStorage.setItem(CACHE_KEY_LIGHT, newLight);
      })
      .catch(() => {});
  }, []);

  // Set theme locally (used by ThemeSync to restore from DB)
  const syncTheme = useCallback((newTheme) => {
    if (!VALID_MODES.includes(newTheme)) return;
    setPreview(null);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    localStorage.setItem('preferred_theme', newTheme);
    lastSavedTheme.current = newTheme;
  }, []);

  const toggleTheme = useCallback(() => {
    setPreview(null);
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.add('theme-transitioning');
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    localStorage.setItem('preferred_theme', newTheme);
    lastSavedTheme.current = newTheme;

    apiRequest('/users/profile', {
      method: 'PATCH',
      body: { preferred_theme: newTheme },
    }).catch(() => {});

    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 250);
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
      localStorage.setItem(CACHE_KEY_DARK, newDark);
      localStorage.setItem(CACHE_KEY_LIGHT, newLight);
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
      syncTheme,
      preview,
      previewTheme,
      clearPreview,
      refreshThemeVariants,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export { useTheme } from './ThemeContext';
