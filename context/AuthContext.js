'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, setAccessToken, setRefreshToken, getRefreshToken, refreshTokens } from '@/lib/api';

const AuthContext = createContext();

// ─── Inactivity timeout constants ────────────────────────────────────────────
const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes
const CHECK_INTERVAL_MS = 15 * 1000;  // check every 15 seconds

// ─── sessionStorage user cache (cleared on browser close) ──────────────────
const USER_CACHE_KEY = 'studyhub_user';

const getCachedUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setCachedUser = (user) => {
  if (typeof window === 'undefined') return;
  if (user) {
    sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(USER_CACHE_KEY);
  }
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenReady, setTokenReady] = useState(false);
  const router = useRouter();
  const validating = useRef(false);
  const lastActivity = useRef(Date.now());

  // ─── Activity tracking for 30-min inactivity logout ──────────────────────
  useEffect(() => {
    const update = () => { lastActivity.current = Date.now(); };
    window.addEventListener('mousedown', update);
    window.addEventListener('keydown', update);
    window.addEventListener('touchstart', update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('mousedown', update);
      window.removeEventListener('keydown', update);
      window.removeEventListener('touchstart', update);
      window.removeEventListener('scroll', update);
    };
  }, []);

  // ─── Periodic inactivity check ───────────────────────────────────────────
  useEffect(() => {
    if (!user || loading) return;
    const id = setInterval(() => {
      if (Date.now() - lastActivity.current >= INACTIVITY_MS) {
        performLogout(false);
      }
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [user, loading]);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    if (validating.current) return;
    validating.current = true;

    const cachedUser   = getCachedUser();
    const refreshToken = getRefreshToken();

    // ── Fast path: no refresh token stored → definitely logged out ──────────
    if (!refreshToken) {
      setCachedUser(null);
      setUser(null);
      setLoading(false);
      validating.current = false;
      return;
    }

    // ── Show UI immediately from cache (zero network wait) ──────────────────
    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);          // ← UI renders NOW, no blank screen
      // NOTE: tokenReady stays false — API-calling pages must wait
    }

    // ── Background validation: proactively refresh → then confirm /auth/me ──
    try {
      // Step 1: get a fresh access token WITHOUT letting /auth/me 401 first
      await refreshTokens();

      // Step 2: fetch up-to-date user profile with the new access token
      const freshUser = await apiRequest('/auth/me');
      setUser(freshUser);
      setCachedUser(freshUser);   // update cache with latest data
      setTokenReady(true);        // ← access token is now valid
    } catch {
      // Refresh token expired or invalid → log out cleanly
      setUser(null);
      setCachedUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setTokenReady(false);
    } finally {
      // If there was no cached user we haven't unblocked loading yet
      if (!cachedUser) setLoading(false);
      validating.current = false;
    }

    // If refresh failed (catch branch ran), tokenReady stays false → pages
    // that depend on it will not fire authenticated requests.
  };

  // Kept for external callers (e.g. after email verify)
  const checkUser = initAuth;

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (data.access_token) setAccessToken(data.access_token);
    if (data.refresh_token) setRefreshToken(data.refresh_token);
    setTokenReady(true);  // token is valid right after login

    const loggedUser = data.user || data;
    setUser(loggedUser);
    setCachedUser(loggedUser);  // ← persist so next refresh is instant

    if (loggedUser.role === 'admin' || loggedUser.role === 'moderator') {
      router.push('/admin/dashboard');
    } else {
      router.push('/notes');
    }

    return data;
  };

  const register = async (name, email, password) => {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
  };

  const forgotPassword = async (email) => {
    return await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  };

  const resetPassword = async (email, otp, newPassword) => {
    const data = await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { email, otp, newPassword },
    });
    router.push('/auth');
    return data;
  };

  const verifyEmail = async (email, otp) => {
    const data = await apiRequest('/auth/verify-email', {
      method: 'POST',
      body: { email, otp },
    });
    router.push('/auth');
    return data;
  };

  const performLogout = useCallback(async (silent = false) => {
    if (!silent) {
      try { await apiRequest('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    }
    setUser(null);
    setCachedUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setTokenReady(false);
    if (!silent) router.push('/auth');
  }, [router]);

  const logout = useCallback(() => performLogout(false), [performLogout]);

  return (
    <AuthContext.Provider value={{ user, loading, tokenReady, login, register, verifyEmail, logout, checkUser, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
