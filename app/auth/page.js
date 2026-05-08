'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Sparkles, MousePointer2, Mail, Lock, User, Shield } from 'lucide-react';
import StudyHubLogo from '@/components/ui/StudyHubLogo';
import AuthInput from '@/components/auth/AuthInput';
import ValidationRules from '@/components/auth/ValidationRules';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => setMounted(true), []);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setTouched({});
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
    if (!isLogin) {
      const words = formData.fullName.trim().split(/\s+/);
      const isNameValid = words.length >= 2 && words.every(word => word.length >= 3);
      if (formData.fullName && !isNameValid) newErrors.fullName = 'Min 2 words, 3 chars';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!isLogin && formData.confirmPassword && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords mismatch';
    setErrors(newErrors);

    if (!isLogin) {
      const allRulesMet = Object.values(passwordRules).every(Boolean);
      setIsSubmitDisabled(!(allRulesMet && !newErrors.fullName && emailRegex.test(formData.email) && formData.password === formData.confirmPassword));
    } else {
      setIsSubmitDisabled(!(formData.email && formData.password));
    }
  }, [formData, isLogin, passwordRules]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (!touched[e.target.name]) setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#06080f] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Soft Ambient Background */}
      <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[120px] transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[120px] transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`} />

      {/* Header - Positioned Top Left */}
      <Link href="/" className={`absolute top-8 left-8 transition-all duration-700 delay-100 hover:scale-105 active:scale-95 group z-50 ${mounted ? 'opacity-100' : 'opacity-0 -translate-x-4'}`}>
        <StudyHubLogo size={32} textSize={18} />
      </Link>

      {/* Main Card - Clean & Stable (max-w-[420px]) */}
      <div className={`w-full max-w-[420px] bg-[#0d111c]/70 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl overflow-hidden relative transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Subtle Decorative Top Gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-cyan-600/50 opacity-30" />

        <div className="p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.2em]">
              {isLogin ? 'Continue your learning journey' : 'Start your academic success today'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <AuthInput icon={User} name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} placeholder="Full Name" error={errors.fullName} touched={touched.fullName} />
            )}

            <AuthInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="Email Address" error={errors.email} touched={touched.email} />

            <div className="space-y-3">
              <AuthInput icon={Lock} type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} placeholder="Password" />
              {isLogin && (
                <div className="flex justify-end pr-1">
                  <button type="button" className="text-[10px] font-bold text-blue-400/80 hover:text-blue-300 transition-colors uppercase tracking-widest flex items-center gap-1.5 group/link">
                    <MousePointer2 size={10} className="group-hover/link:animate-pulse" /> Forgot Password?
                  </button>
                </div>
              )}
            </div>

            {!isLogin && formData.password && <ValidationRules rules={passwordRules} />}

            {!isLogin && (
              <AuthInput icon={Lock} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} placeholder="Confirm Password" error={errors.confirmPassword} touched={touched.confirmPassword} />
            )}

            <button 
              disabled={isSubmitDisabled || isLoading} 
              className={`w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-3 transition-all duration-500 group/btn ${
                isSubmitDisabled || isLoading 
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5' 
                  : 'bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  {isLogin ? <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" /> : <Sparkles size={18} className="group-hover/btn:scale-125 transition-transform" />}
                </>
              )}
            </button>
          </form>

          {/* Footer Toggle */}
          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">
              {isLogin ? "New to StudyHub?" : "Already have an account?"}{' '}
              <button 
                onClick={toggleForm} 
                className="text-white hover:text-blue-400 transition-colors ml-1 font-black underline underline-offset-8 decoration-white/10 hover:decoration-blue-400/50"
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="mt-10 flex items-center gap-3 opacity-30 hover:opacity-60 transition-opacity duration-500 group cursor-default">
        <Shield size={14} className="text-emerald-500 group-hover:animate-bounce" />
        <p className="text-gray-400 text-[10px] font-bold tracking-[0.3em] uppercase">
          End-to-End Encrypted &bull; 256-bit AES
        </p>
      </div>
    </div>
  );
}
