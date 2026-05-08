'use client';

import { useState, useEffect, useMemo } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import StudyHubLogo from '@/components/ui/StudyHubLogo';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Validation States
  const [errors, setErrors] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  // Toggle form
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setShowPassword(false);
  };

  // Password Rules Check
  const passwordRules = useMemo(() => ({
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  }), [formData.password]);

  // Real-time Validation Logic
  useEffect(() => {
    const newErrors = {};
    
    // Name Validation
    if (!isLogin) {
      const words = formData.fullName.trim().split(/\s+/);
      const isNameValid = words.length >= 2 && words.every(word => word.length >= 3);
      if (formData.fullName && !isNameValid) {
        newErrors.fullName = 'Enter at least 2 words (min 3 chars each)';
      }
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    // Confirm Password
    if (!isLogin && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    // Check if Register button should be disabled
    if (!isLogin) {
      const allRulesMet = Object.values(passwordRules).every(Boolean);
      const nameWords = formData.fullName.trim().split(/\s+/);
      const isNameValid = nameWords.length >= 2 && nameWords.every(word => word.length >= 3);
      const isEmailValid = emailRegex.test(formData.email);
      const isConfirmValid = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

      setIsSubmitDisabled(!(allRulesMet && isNameValid && isEmailValid && isConfirmValid));
    } else {
      // For Login, just check if fields aren't empty
      setIsSubmitDisabled(!(formData.email && formData.password));
    }
  }, [formData, isLogin, passwordRules]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[#06080f] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`} />

      {/* Logo Header */}
      <div className={`mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <StudyHubLogo size={48} textSize={24} />
      </div>

      {/* Main Auth Card */}
      <div className={`w-full max-w-md bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-500 delay-200 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              {isLogin 
                ? 'Enter your credentials to access your academic hub.' 
                : 'Join the community and start sharing your knowledge.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            
            {/* Full Name Field (Register Only) */}
            {!isLogin && (
              <div className="space-y-1.5 group animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className={`relative flex items-center transition-all duration-300 ${errors.fullName ? 'ring-1 ring-red-500 border-red-500/50' : 'focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50'} bg-white/[0.03] border border-white/10 rounded-xl`}>
                  <User className="absolute left-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Mohsin Ali" 
                    className="w-full bg-transparent py-3.5 pl-12 pr-4 text-white placeholder-gray-600 outline-none"
                  />
                </div>
                {errors.fullName && <p className="text-[11px] text-red-400 font-medium ml-1">{errors.fullName}</p>}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5 group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className={`relative flex items-center transition-all duration-300 ${errors.email ? 'ring-1 ring-red-500 border-red-500/50' : 'focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50'} bg-white/[0.03] border border-white/10 rounded-xl`}>
                <Mail className="absolute left-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@institution.com" 
                  className="w-full bg-transparent py-3.5 pl-12 pr-4 text-white placeholder-gray-600 outline-none"
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-400 font-medium ml-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
                {isLogin && (
                  <button type="button" className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 bg-white/[0.03] border border-white/10 rounded-xl">
                <Lock className="absolute left-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  className="w-full bg-transparent py-3.5 pl-12 pr-12 text-white placeholder-gray-600 outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Validation UI (Register Only) */}
            {!isLogin && formData.password && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl transition-all duration-300">
                <RuleItem label="8+ Characters" met={passwordRules.length} />
                <RuleItem label="Uppercase" met={passwordRules.uppercase} />
                <RuleItem label="Lowercase" met={passwordRules.lowercase} />
                <RuleItem label="Number" met={passwordRules.number} />
                <RuleItem label="Special Char" met={passwordRules.special} />
              </div>
            )}

            {/* Confirm Password (Register Only) */}
            {!isLogin && (
              <div className="space-y-1.5 group animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className={`relative flex items-center transition-all duration-300 ${errors.confirmPassword ? 'ring-1 ring-red-500 border-red-500/50' : 'focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50'} bg-white/[0.03] border border-white/10 rounded-xl`}>
                  <Lock className="absolute left-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••" 
                    className="w-full bg-transparent py-3.5 pl-12 pr-4 text-white placeholder-gray-600 outline-none"
                  />
                </div>
                {errors.confirmPassword && <p className="text-[11px] text-red-400 font-medium ml-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Action Button */}
            <button
              disabled={isSubmitDisabled}
              className={`w-full py-4 rounded-xl font-extrabold text-white flex items-center justify-center gap-2 transition-all duration-500 ${
                isSubmitDisabled 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              {!isSubmitDisabled && <ArrowRight size={18} className="animate-pulse" />}
            </button>
          </form>

          {/* Footer Toggle */}
          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-gray-400 text-sm font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={toggleForm}
                className="text-blue-400 font-extrabold hover:text-blue-300 transition-colors relative group"
              >
                {isLogin ? 'Register Now' : 'Login Here'}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full" />
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Legal Footer */}
      <p className="mt-8 text-gray-700 text-[10px] font-bold tracking-[0.2em] uppercase">
        &copy; {new Date().getFullYear()} StudyHub &bull; Secured with TLS 1.3
      </p>
    </div>
  );
}
}

function RuleItem({ label, met }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 size={14} className="text-emerald-400" />
      ) : (
        <XCircle size={14} className="text-gray-600" />
      )}
      <span className={`text-[10px] font-medium ${met ? 'text-emerald-400' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}
