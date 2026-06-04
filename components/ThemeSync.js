'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeSync() {
  const { user, loading } = useAuth();
  const { syncTheme } = useTheme();
  const synced = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      synced.current = false;
      return;
    }
    if (synced.current) return;

    // localStorage is set synchronously on toggle — it always reflects the
    // user's most recent action. Trust it over the sessionStorage-cached DB
    // value, which may be stale (the async PATCH may not have completed).
    const localPref = localStorage.getItem('preferred_theme');
    if (localPref === 'dark' || localPref === 'light') {
      syncTheme(localPref);
    } else if (user.preferred_theme) {
      syncTheme(user.preferred_theme);
    }

    synced.current = true;
  }, [user, loading, syncTheme]);

  return null;
}
