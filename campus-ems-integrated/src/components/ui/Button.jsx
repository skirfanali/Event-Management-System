'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/helpers';

const variants = {
  primary:   'gradient-bg text-white shadow-glow hover:opacity-90',
  secondary: 'bg-white/10 border border-white/20 text-current hover:bg-white/20 backdrop-blur-sm',
  danger:    'bg-red-500 text-white hover:bg-red-600',
  ghost:     'hover:bg-white/10 text-current',
  outline:   'border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white',
};

const sizes = {
  sm:  'px-3 py-1.5 text-sm rounded-lg',
  md:  'px-5 py-2.5 text-sm rounded-xl',
  lg:  'px-7 py-3.5 text-base rounded-xl',
  xl:  'px-8 py-4 text-lg rounded-2xl',
  icon:'p-2.5 rounded-xl',
};

export default function Button({ children, variant = 'primary', size = 'md', className, loading, disabled, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={cn('inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75"/></svg>}
      {children}
    </motion.button>
  );
}
