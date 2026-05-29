'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function RoutinePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  if (authLoading) return null;
  if (!user && !authLoading) return null;

  return (
    <iframe
      src="https://routine-pro-fawn.vercel.app/"
      className="fixed inset-0 w-full h-full border-0"
      title="Routine Pro Planner"
      allow="clipboard-write; clipboard-read"
    />
  );
}
