'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-8xl mb-6">🔍</motion.div>
        <h1 className="text-6xl font-display font-bold gradient-text mb-3">404</h1>
        <h2 className="text-2xl font-display font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Page not found</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/"><Button size="lg">Back to Home</Button></Link>
      </motion.div>
    </div>
  );
}
