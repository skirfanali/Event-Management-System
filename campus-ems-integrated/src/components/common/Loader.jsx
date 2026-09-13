'use client';
import { motion } from 'framer-motion';

export default function Loader({ fullScreen = false, text = 'Loading…' }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-4 border-t-brand-500" style={{ borderColor: 'var(--border)', borderTopColor: '#6366f1' }} />
      <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{text}</motion.p>
    </div>
  );
  return fullScreen
    ? <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'var(--bg-primary)' }}>{content}</div>
    : <div className="flex items-center justify-center py-16">{content}</div>;
}
