'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import { Sparkles, Mail, Lock, User, ShieldCheck, ArrowLeft, RefreshCw, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StudyHubLogo from '@/components/ui/StudyHubLogo';
import AuthInput from '@/components/auth/AuthInput';
import ValidationRules from '@/components/auth/ValidationRules';
import { getNameValidation, sanitizeName } from '@/lib/nameUtils';

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

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('register');
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const { register, verifyEmail } = useAuth();
  const router = useRouter();
  const { navigating, navigate } = usePageTransition();
  const entered = useEntrance();

  const passwordRules = useMemo(() => ({
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  }), [formData.password]);

  const nameRules = useMemo(() => getNameValidation(formData.fullName), [formData.fullName]);

  const isNameValid = Object.values(nameRules).every(Boolean);

  useEffect(() => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.fullName && !isNameValid) newErrors.fullName = 'Please follow the name format below';
    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = 'Invalid email';
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mismatch';
    setErrors(newErrors);
  }, [formData, isNameValid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (!touched[name]) setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    const cleanedName = sanitizeName(formData.fullName);
    if (!cleanedName) {
      setStatus({ type: 'error', message: 'Please enter a valid full name.' });
      setIsLoading(false);
      return;
    }

    try {
      await register(cleanedName, formData.email, formData.password);
      setStep('verify');
      setIsLoading(false);
      setResendCooldown(30);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to create account' });
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await verifyEmail(formData.email, otp.join(''));
      setStatus({ type: 'success', message: 'Email verified! Redirecting to login...' });
      setTimeout(() => router.push('/auth'), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Invalid OTP' });
      setIsLoading(false);
    }
  };

  const allPasswordRulesMet = Object.values(passwordRules).every(Boolean);
  const isSubmitDisabled = !(allPasswordRulesMet && isNameValid && !errors.email && formData.password === formData.confirmPassword && formData.fullName && formData.email);

  const e = (delay) => `transition-all duration-[450ms] ease-out delay-${delay} ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`;
  const fade = (delay) => `transition-opacity duration-[450ms] ease-out delay-${delay} ${entered ? 'opacity-100' : 'opacity-0'}`;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans transition-colors duration-500">
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
              {step === 'register' ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-[var(--muted)] text-[11px] font-bold uppercase tracking-[0.2em]">
              {step === 'register' ? 'Start your academic success today' : `Enter the code sent to ${formData.email}`}
            </p>
          </div>

          {status.message && (
            <div className={`mb-6 p-4 border rounded-2xl ${fade(200)} ${
              status.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-center">
                {status.message}
              </p>
            </div>
          )}

          {step === 'register' ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className={`space-y-3 ${e(200)}`}>
                <AuthInput icon={User} name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} placeholder="Full Name (e.g. John Doe)" error={touched.fullName && !isNameValid ? errors.fullName : ''} touched={touched.fullName} />
                {formData.fullName && (
                  <div className={`p-3.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl space-y-2 transition-all duration-300 ease-out ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    <div className="flex items-center gap-2 border-b border-[var(--card-border)] pb-2">
                      <UserCheck size={11} className="text-blue-400" />
                      <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Name Format</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { key: 'twoWords',    label: 'At least 2 words (e.g. John Doe)' },
                        { key: 'twoChars',    label: 'Each word min. 2 characters' },
                        { key: 'lettersOnly', label: 'Letters only — no numbers, dots or symbols' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                            nameRules[key] ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-[var(--muted)]/30'
                          }`} />
                          <span className={`text-[9px] font-bold uppercase tracking-tight transition-colors duration-300 ${
                            nameRules[key] ? 'text-emerald-400' : 'text-[var(--muted)]'
                          }`}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={e(200)}>
                <AuthInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="Email Address" error={errors.email} touched={touched.email} />
              </div>

              <div className={`space-y-4 ${e(200)}`}>
                <AuthInput icon={Lock} type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} placeholder="Password" />
                {formData.password && <ValidationRules rules={passwordRules} />}
                <AuthInput icon={Lock} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} placeholder="Confirm Password" error={errors.confirmPassword} touched={touched.confirmPassword} />
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
                      Create Account
                      <Sparkles size={18} className="group-hover/btn:scale-125 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-8" onSubmit={handleVerifySubmit}>
              <div className={`flex justify-between gap-2 ${e(200)}`}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-9 h-11 sm:w-12 sm:h-14 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-center text-[var(--foreground)] text-base sm:text-xl font-black focus:border-blue-500/50 focus:bg-[var(--card-bg)] outline-none transition-all duration-300"
                  />
                ))}
              </div>

              <div className={`space-y-4 ${e(250)}`}>
                <button
                  disabled={otp.some(d => !d) || isLoading}
                  className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-300 ease-out group/btn ${
                    otp.some(d => !d) || isLoading
                      ? 'bg-[var(--card-bg)] text-[var(--muted)] cursor-not-allowed border border-[var(--card-border)]'
                      : 'bg-[var(--blue)] text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify Code
                      <ShieldCheck size={18} className="group-hover/btn:scale-110 transition-transform duration-300" />
                    </>
                  )}
                </button>

                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('register')}
                    className="text-[10px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-300 uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={12} /> Wrong email? Go back
                  </button>

                  {resendCooldown > 0 ? (
                    <p className="text-[10px] font-bold text-[var(--muted)]/50 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                      Resend in {resendCooldown}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors duration-300 uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={12} /> Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          <div className={`mt-8 text-center border-t border-[var(--card-border)] pt-6 space-y-4 ${fade(300)}`}>
            <p className="text-[var(--muted)] text-[11px] font-bold uppercase tracking-widest">
              Already have an account?{' '}
              <Link
                href="/auth"
                onClick={(e) => { e.preventDefault(); navigate('/auth'); }}
                className="text-[var(--foreground)] hover:text-blue-400 transition-colors duration-300 ml-1 font-black underline underline-offset-8 decoration-[var(--card-border)] hover:decoration-blue-400/50"
              >
                Sign In
              </Link>
            </p>
            <p className="text-[var(--muted)]/70 text-[9px] font-bold uppercase tracking-[0.15em] leading-relaxed max-w-[280px] mx-auto">
              By signing up, you agree to our{' '}
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
