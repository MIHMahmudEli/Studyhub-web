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
    if (user.preferred_theme) {
      syncTheme(user.preferred_theme);
    }
    synced.current = true;
  }, [user, loading, syncTheme]);

  return null;
}
