'use client';

import { forwardRef } from 'react';

const variants = {
  primary: 'bg-purple-500 text-white hover:bg-purple-600 shadow-xl shadow-purple-500/20',
  secondary: 'bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-500 hover:text-purple-500 shadow-sm',
  danger: 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white',
  ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-[var(--foreground)]',
  amber: 'bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white shadow-sm',
  emerald: 'bg-emerald-50 text-emerald-500 shadow-lg shadow-emerald-500/20 border border-emerald-500/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-[9px]',
  md: 'px-5 py-3 text-[10px]',
  lg: 'px-8 py-4 text-xs',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', disabled, children, className = '', icon: Icon, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-black tracking-widest uppercase transition-all duration-300 cursor-pointer',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        disabled ? 'opacity-60 cursor-not-allowed' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {Icon && <Icon size={14} className={Icon ? 'shrink-0' : ''} />}
      {children}
    </button>
  );
});

export default Button;
