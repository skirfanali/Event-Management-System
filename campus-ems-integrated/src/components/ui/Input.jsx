'use client';
import { forwardRef } from 'react';
import { cn } from '@/lib/helpers';

const Input = forwardRef(({ label, error, icon, className, ...props }, ref) => (
  <div className="w-full space-y-1.5">
    {label && <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
      <input ref={ref} className={cn('input-field', icon && 'pl-10', error && '!border-red-500', className)} {...props} />
    </div>
    {error && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>}
  </div>
));
Input.displayName = 'Input';
export default Input;
