'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function useAuthGuard(redirectTo = '/auth') {
  const { user, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);
}
