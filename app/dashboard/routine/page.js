'use client';

import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
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
    <>
      <button
        onClick={() => router.push('/dashboard')}
        className="fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-slate-500 hover:text-blue-500 hover:border-blue-500/30 transition-all shadow-lg backdrop-blur-xl"
        title="Back to Dashboard"
      >
        <ArrowLeft size={18} />
      </button>
      <iframe
        src="https://routine-pro-fawn.vercel.app/"
        className="fixed inset-0 w-full h-full border-0"
        title="Routine Pro Planner"
        allow="clipboard-write; clipboard-read"
      />
    </>
  );
}
