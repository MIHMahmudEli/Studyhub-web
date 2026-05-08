'use client';

import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AuthInput({ 
  icon: Icon, 
  type = "text", 
  placeholder, 
  name, 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full transition-all duration-300">
      <div className={`group relative flex items-center transition-all duration-300 rounded-2xl border 
        ${error && touched 
          ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
          : 'border-white/10 bg-white/[0.03] focus-within:border-blue-500/50 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_20px_rgba(59,130,246,0.1)]'
        }`}>
        
        {Icon && <Icon className={`absolute left-4 transition-colors duration-300 ${error && touched ? 'text-red-400' : 'text-gray-500 group-focus-within:text-blue-400'}`} size={16} />}
        
        <input 
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full bg-transparent py-3.5 ${Icon ? 'pl-11' : 'px-5'} ${isPassword ? 'pr-12' : 'pr-5'} text-sm text-white placeholder-gray-500 outline-none`}
        />

        {isPassword && (
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      
      {error && touched && (
        <div className="flex items-center gap-1 mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
          <AlertCircle size={10} className="text-red-400" />
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
