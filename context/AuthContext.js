'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, setAccessToken } from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // The interceptor in lib/api.js will automatically try to /refresh 
      // if /me fails with 401, so this should recover the session on refresh.
      const data = await apiRequest('/auth/me');
      setUser(data);
    } catch (err) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    
    if (data.access_token) {
      setAccessToken(data.access_token);
    }

    const loggedUser = data.user || data;
    setUser(loggedUser); 

    // Role-based redirection
    if (loggedUser.role === 'student') {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
    
    return data;
  };

  const register = async (name, email, password) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    return data; // Usually returns a message about OTP
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
    router.push('/auth'); // Go to login after verification
    return data;
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setAccessToken(null);
      router.push('/auth');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyEmail, logout, checkUser, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
