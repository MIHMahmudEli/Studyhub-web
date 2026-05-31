'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useLayoutEffect, useCallback } from 'react';
import { ArrowRight, Mail, Lock, MousePointer2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StudyHubLogo from '@/components/ui/StudyHubLogo';
import AuthInput from '@/components/auth/AuthInput';

function usePageTransition() {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const navigate = useCallback((href) => {
    setNavigating(true);
    setTimeout(() => router.push(href), 250);
  }, [router]);

  return { navigating, navigate };
}

function useEntrance() {
  const [entered, setEntered] = useState(false);
  useLayoutEffect(() => setEntered(true), []);
  return entered;
}

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();
  const { navigating, navigate } = usePageTransition();
  const entered = useEntrance();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (!touched[e.target.name]) setTouched(prev => ({ ...prev, [e.target.name]: true }));
    if (error) setError('');
  };

  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = !(formData.email && formData.password);

  const e = (delay) => `transition-all duration-[450ms] ease-out delay-${delay} ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`;
  const fade = (delay) => `transition-opacity duration-[450ms] ease-out delay-${delay} ${entered ? 'opacity-100' : 'opacity-0'}`;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-500/30 transition-colors duration-500">
      {navigating && (
        <div className="fixed inset-0 bg-[var(--background)] z-[100] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200" />
      )}

      <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[var(--nebula-1)] rounded-full blur-[120px] ${fade(0)}`} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[var(--nebula-2)] rounded-full blur-[120px] ${fade(100)}`} />

      <Link href="/" className={`hidden sm:flex absolute top-8 left-8 transition-all duration-500 ease-out hover:scale-105 active:scale-95 group z-50 ${e(50)}`}>
        <StudyHubLogo size={32} textSize={18} />
      </Link>

      <div className={`w-full max-w-[420px] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl overflow-hidden relative ${e(100)}`}>
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-cyan-600/50 opacity-30" />

        <div className="p-6 sm:p-10">
          <div className={`flex sm:hidden justify-center mb-6 ${fade(150)}`}>
            <Link href="/" className="transition-all hover:scale-105 active:scale-95">
              <StudyHubLogo size={32} textSize={18} />
            </Link>
          </div>

          <div className={`text-center mb-8 ${e(150)}`}>
            <h1 className="text-3xl font-black text-[var(--foreground)] mb-2 tracking-tight bg-gradient-to-b from-[var(--foreground)] to-[var(--muted)] bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-[var(--muted)] text-[11px] font-bold uppercase tracking-[0.2em]">
              Continue your learning journey
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl ${fade(200)}`}>
              <p className="text-red-400 text-[11px] font-bold uppercase tracking-widest text-center">
                {error}
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className={e(200)}>
              <AuthInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="Email Address" />
            </div>

            <div className={`space-y-3 ${e(200)}`}>
              <AuthInput icon={Lock} type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} placeholder="Password" />
              <div className="flex justify-end pr-1">
                <Link
                  href="/auth/forgot-password"
                  onClick={(e) => { e.preventDefault(); navigate('/auth/forgot-password'); }}
                  className="text-[10px] font-bold text-blue-400/80 hover:text-blue-300 transition-colors duration-300 uppercase tracking-widest flex items-center gap-1.5 group/link"
                >
                  <MousePointer2 size={10} className="group-hover/link:animate-pulse" /> Forgot Password?
                </Link>
              </div>
            </div>

            <div className={e(250)}>
              <button
                disabled={isSubmitDisabled || isLoading}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-300 ease-out group/btn ${
                  isSubmitDisabled || isLoading
                    ? 'bg-[var(--card-bg)] text-[var(--muted)] cursor-not-allowed border border-[var(--card-border)]'
                    : 'bg-[var(--blue)] text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className={`mt-8 text-center border-t border-[var(--card-border)] pt-6 space-y-4 ${fade(300)}`}>
            <p className="text-[var(--muted)] text-[11px] font-bold uppercase tracking-widest">
              New to StudyHub?{' '}
              <Link
                href="/auth/register"
                onClick={(e) => { e.preventDefault(); navigate('/auth/register'); }}
                className="text-[var(--foreground)] hover:text-blue-400 transition-colors duration-300 ml-1 font-black underline underline-offset-8 decoration-[var(--card-border)] hover:decoration-blue-400/50"
              >
                Create Account
              </Link>
            </p>
            <p className="text-[var(--muted)]/70 text-[9px] font-bold uppercase tracking-[0.15em] leading-relaxed max-w-[280px] mx-auto">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-all duration-300 underline decoration-[var(--card-border)] underline-offset-4">
                Terms of Service
              </Link>{' '}
              &{' '}
              <Link href="/privacy" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-all duration-300 underline decoration-[var(--card-border)] underline-offset-4">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
