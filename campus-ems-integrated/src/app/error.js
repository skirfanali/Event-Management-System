'use client';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="text-7xl mb-6">⚠️</div>
        <h2 className="text-2xl font-display font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Something went wrong</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{error?.message || 'An unexpected error occurred.'}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="secondary" onClick={() => window.location.href = '/'}>Go Home</Button>
        </div>
      </motion.div>
    </div>
  );
}
