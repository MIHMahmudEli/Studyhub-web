'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Sparkles, Mail, Lock, ChevronLeft, CheckCircle2, ShieldCheck, RefreshCw, X } from 'lucide-react';
import StudyHubLogo from '@/components/ui/StudyHubLogo';
import AuthInput from '@/components/auth/AuthInput';
import ValidationRules from '@/components/auth/ValidationRules';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email'); // 'email', 'otp'
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', otp: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResendOTP = () => {
    if (resendTimer === 0) {
      setResendTimer(30);
    }
  };

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
      if (formData.otp && formData.otp.length !== 6) newErrors.otp = 'Must be 6 digits';
    }

    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);

    if (step === 'email') {
      setIsSubmitDisabled(!emailRegex.test(formData.email));
    } else {
      const allRulesMet = Object.values(passwordRules).every(Boolean);
      setIsSubmitDisabled(!(formData.otp.length === 6 && allRulesMet && formData.password === formData.confirmPassword));
    }
  }, [formData, step, passwordRules]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (!touched[e.target.name]) setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (step === 'email') {
        setStep('otp');
        setResendTimer(30);
      } else {
        setIsSuccess(true);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#06080f] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[120px] transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[120px] transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`} />

      <Link href="/auth" className={`absolute top-8 left-8 transition-all duration-700 delay-100 hover:scale-105 active:scale-95 group z-50 ${mounted ? 'opacity-100' : 'opacity-0 -translate-x-4'}`}>
        <StudyHubLogo size={32} textSize={18} />
      </Link>

      <div className={`w-full max-w-[420px] bg-[#0d111c]/70 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl overflow-hidden relative transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-cyan-600/50 opacity-30" />

        <div className="p-10">
          {isSuccess ? (
            <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                <CheckCircle2 size={40} className="text-emerald-400 animate-in zoom-in-50 duration-700" />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Password Reset!</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Your password has been successfully updated.
              </p>
                <Link 
                  href="/auth"
                  className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  Sign In Now
                </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8 relative">
                {step === 'otp' && (
                  <Link href="/auth" className="absolute -left-2 -top-2 p-2 text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                  </Link>
                )}
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                  {step === 'email' ? 'Reset Password' : 'Verify Identity'}
                </h1>
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.2em]">
                  {step === 'email' ? 'We will help you get back in' : 'Enter the code sent to your email'}
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {step === 'email' ? (
                  <AuthInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="Email Address" error={errors.email} touched={touched.email} />
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">OTP Code</label>
                        <button 
                          type="button" 
                          onClick={handleResendOTP}
                          disabled={resendTimer > 0}
                          className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${resendTimer > 0 ? 'text-gray-700' : 'text-blue-400 hover:text-blue-300'}`}
                        >
                          <RefreshCw size={10} className={resendTimer > 0 ? '' : 'animate-spin-slow'} />
                          {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                        </button>
                      </div>
                      <AuthInput icon={ShieldCheck} name="otp" value={formData.otp} onChange={handleChange} onBlur={handleBlur} placeholder="000000" error={errors.otp} touched={touched.otp} />
                    </div>

                    <div className="space-y-4">
                      <AuthInput icon={Lock} type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} placeholder="New Password" />
                      {formData.password && <ValidationRules rules={passwordRules} />}
                      <AuthInput icon={Lock} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} placeholder="Confirm New Password" error={errors.confirmPassword} touched={touched.confirmPassword} />
                    </div>
                  </div>
                )}

                <button 
                  disabled={isSubmitDisabled || isLoading} 
                  className={`w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-3 transition-all duration-500 group/btn ${
                    isSubmitDisabled || isLoading 
                      ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5' 
                      : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98]'
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

                {step === 'email' && (
                <Link href="/auth" className="w-full text-center text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  <ChevronLeft size={14} /> Back to Login
                </Link>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
