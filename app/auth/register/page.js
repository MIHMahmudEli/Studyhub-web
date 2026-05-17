'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Mail, Lock, User, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StudyHubLogo from '@/components/ui/StudyHubLogo';
import AuthInput from '@/components/auth/AuthInput';
import ValidationRules from '@/components/auth/ValidationRules';

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const { register, verifyEmail } = useAuth();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

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
    const words = formData.fullName.trim().split(/\s+/);
    const isNameValid = words.length >= 2 && words.every(word => word.length >= 3);
    
    if (formData.fullName && !isNameValid) newErrors.fullName = 'Invalid Name';
    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = 'Invalid email';
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mismatch';
    setErrors(newErrors);
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (!touched[e.target.name]) setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
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

    try {
      await register(formData.fullName, formData.email, formData.password);
      setStep('verify');
      setIsLoading(false);
      setResendCooldown(30); // Start 30s cooldown
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

  const allRulesMet = Object.values(passwordRules).every(Boolean);
  const isSubmitDisabled = !(allRulesMet && !errors.fullName && !errors.email && formData.password === formData.confirmPassword && formData.fullName && formData.email);

  return (
    <div className="min-h-screen bg-[#06080f] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[120px] transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[120px] transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`} />

      <Link href="/" className={`hidden sm:flex absolute top-8 left-8 transition-all duration-700 delay-100 hover:scale-105 active:scale-95 group z-50 ${mounted ? 'opacity-100' : 'opacity-0 -translate-x-4'}`}>
        <StudyHubLogo size={32} textSize={18} />
      </Link>

      <div className={`w-full max-w-[420px] bg-[#0d111c]/70 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl overflow-hidden relative transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-cyan-600/50 opacity-30" />

        <div className="p-6 sm:p-10">
          {/* Mobile-only Top Logo */}
          <div className="flex sm:hidden justify-center mb-6">
            <Link href="/" className="transition-all hover:scale-105 active:scale-95">
              <StudyHubLogo size={32} textSize={18} />
            </Link>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              {step === 'register' ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.2em]">
              {step === 'register' ? 'Start your academic success today' : `Enter the code sent to ${formData.email}`}
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

          {step === 'register' ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <AuthInput icon={User} name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} placeholder="Full Name" error={errors.fullName} touched={touched.fullName} />
              
              <AuthInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="Email Address" error={errors.email} touched={touched.email} />

              <div className="space-y-4">
                <AuthInput icon={Lock} type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} placeholder="Password" />
                {formData.password && <ValidationRules rules={passwordRules} />}
                <AuthInput icon={Lock} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} placeholder="Confirm Password" error={errors.confirmPassword} touched={touched.confirmPassword} />
              </div>

              <button 
                disabled={isSubmitDisabled || isLoading} 
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-500 group/btn ${
                  isSubmitDisabled || isLoading 
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5' 
                    : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <Sparkles size={18} className="group-hover/btn:scale-125 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form className="space-y-8" onSubmit={handleVerifySubmit}>
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
                    className="w-9 h-11 sm:w-12 sm:h-14 bg-white/5 border border-white/10 rounded-xl text-center text-white text-base sm:text-xl font-black focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button 
                  disabled={otp.some(d => !d) || isLoading} 
                  className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-500 group/btn ${
                    otp.some(d => !d) || isLoading 
                      ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5' 
                      : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98]'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify Code
                      <ShieldCheck size={18} className="group-hover/btn:scale-110 transition-transform" />
                    </>
                  )}
                </button>

                <div className="flex flex-col gap-4">
                  <button 
                    type="button"
                    onClick={() => setStep('register')}
                    className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={12} /> Wrong email? Go back
                  </button>
                  
                  {resendCooldown > 0 ? (
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                      Resend in {resendCooldown}s
                    </p>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleSubmit}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={12} /> Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">
              Already have an account?{' '}
              <Link href="/auth" className="text-white hover:text-blue-400 transition-colors ml-1 font-black underline underline-offset-8 decoration-white/10 hover:decoration-blue-400/50">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
