'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Sparkles, Mail, Lock, ChevronLeft, CheckCircle2, ShieldCheck, RefreshCw, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StudyHubLogo from '@/components/ui/StudyHubLogo';
import AuthInput from '@/components/auth/AuthInput';
import ValidationRules from '@/components/auth/ValidationRules';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email'); // 'email', 'otp'
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const { forgotPassword, resetPassword } = useAuth();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const passwordRules = useMemo(() => ({
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  }), [formData.password]);

  useEffect(() => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (step === 'otp') {
      if (formData.confirmPassword && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords mismatch';
    }

    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);

    if (step === 'email') {
      setIsSubmitDisabled(!emailRegex.test(formData.email));
    } else {
      const allRulesMet = Object.values(passwordRules).every(Boolean);
      const isOtpComplete = otp.every(digit => digit !== '');
      setIsSubmitDisabled(!(isOtpComplete && allRulesMet && formData.password === formData.confirmPassword));
    }
  }, [formData, step, passwordRules, otp]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (!touched[e.target.name]) setTouched(prev => ({ ...prev, [e.target.name]: true }));
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs[index + 1].current.focus();
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs[index - 1].current.focus();
  };

  const handleResend = async () => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await forgotPassword(formData.email);
      setResendTimer(30);
      setStatus({ type: 'success', message: 'A new OTP has been sent to your email.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to resend OTP' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      if (step === 'email') {
        await forgotPassword(formData.email);
        setStep('otp');
        setResendTimer(30);
      } else {
        await resetPassword(formData.email, otp.join(''), formData.password);
        setIsSuccess(true);
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans transition-colors duration-500">
      <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[var(--nebula-1)] rounded-full blur-[120px] transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[var(--nebula-2)] rounded-full blur-[120px] transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`} />

      <Link href="/auth" className={`hidden sm:flex absolute top-8 left-8 transition-all duration-700 delay-100 hover:scale-105 active:scale-95 group z-50 ${mounted ? 'opacity-100' : 'opacity-0 -translate-x-4'}`}>
        <StudyHubLogo size={32} textSize={18} />
      </Link>

      <div className={`w-full max-w-[420px] bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl overflow-hidden relative transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-cyan-600/50 opacity-30" />

        <div className="p-6 sm:p-10">
          {/* Mobile-only Top Logo */}
          <div className="flex sm:hidden justify-center mb-6">
            <Link href="/auth" className="transition-all hover:scale-105 active:scale-95">
              <StudyHubLogo size={32} textSize={18} />
            </Link>
          </div>
          {isSuccess ? (
            <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                <CheckCircle2 size={40} className="text-emerald-400 animate-in zoom-in-50 duration-700" />
              </div>
              <h2 className="text-2xl font-black text-[var(--foreground)] mb-3">Password Reset!</h2>
              <p className="text-[var(--muted)] text-sm leading-relaxed mb-8">
                Your password has been successfully updated.
              </p>
                <Link
                  href="/auth"
                  className="w-full py-4 rounded-2xl bg-[var(--blue)] text-white font-black text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  Sign In Now
                </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8 relative">
                <h1 className="text-3xl font-black text-[var(--foreground)] mb-2 tracking-tight bg-gradient-to-b from-[var(--foreground)] to-[var(--muted)] bg-clip-text text-transparent">
                  {step === 'email' ? 'Reset Password' : 'Verify Identity'}
                </h1>
                <p className="text-[var(--muted)] text-[11px] font-bold uppercase tracking-[0.2em]">
                  {step === 'email' ? 'We will help you get back in' : `Enter the code sent to ${formData.email}`}
                </p>
              </div>

              {status.message && (
                <div className={`mb-6 p-4 border rounded-2xl ${
                  status.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-center">
                    {status.message}
                  </p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {step === 'email' ? (
                  <AuthInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="Email Address" error={errors.email} touched={touched.email} />
                ) : (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex justify-between gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-9 h-11 sm:w-12 sm:h-14 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-center text-[var(--foreground)] text-base sm:text-xl font-black focus:border-blue-500/50 focus:bg-[var(--card-bg)] outline-none transition-all"
                        />
                      ))}
                    </div>

                    <div className="space-y-4">
                      <AuthInput icon={Lock} type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} placeholder="New Password" />
                      {formData.password && <ValidationRules rules={passwordRules} />}
                      <AuthInput icon={Lock} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} placeholder="Confirm New Password" error={errors.confirmPassword} touched={touched.confirmPassword} />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    disabled={isSubmitDisabled || isLoading}
                    className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-500 group/btn ${
                      isSubmitDisabled || isLoading
                        ? 'bg-[var(--card-bg)] text-[var(--muted)] cursor-not-allowed border border-[var(--card-border)]'
                        : 'bg-[var(--blue)] text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98]'
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        {step === 'email' ? 'Send OTP Code' : 'Reset Password'}
                        {step === 'email' ? <ArrowRight size={18} /> : <Sparkles size={18} />}
                      </>
                    )}
                  </button>

                  <div className="flex flex-col gap-4">
                    {step === 'email' ? (
                      <Link href="/auth" className="w-full text-center text-[10px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <ChevronLeft size={14} /> Back to Login
                      </Link>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setStep('email')}
                          className="text-[10px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <ArrowLeft size={12} /> Wrong email? Go back
                        </button>

                        {resendTimer > 0 ? (
                          <p className="text-[10px] font-bold text-[var(--muted)]/50 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                            Resend in {resendTimer}s
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResend}
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                            <RefreshCw size={12} /> Resend OTP
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
