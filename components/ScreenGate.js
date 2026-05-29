'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const PUBLIC_ROUTES = ['/auth', '/', '/terms', '/privacy'];

export default function ScreenGate({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.replace('/auth');
    }
  }, [loading, user, isPublic, router]);

  if (isPublic) return children;

  if (loading) return null;

  if (!user) return null;

  return children;
}
