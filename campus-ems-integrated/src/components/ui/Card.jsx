'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/helpers';

export default function Card({ children, className, hover = true, glass = false, onClick, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn('rounded-2xl border transition-all duration-300', glass ? 'glass' : 'card', onClick && 'cursor-pointer', className)}
      style={{ borderColor: 'var(--border)', background: glass ? 'var(--glass-bg)' : 'var(--bg-secondary)' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
