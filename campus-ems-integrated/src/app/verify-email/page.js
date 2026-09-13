'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const resend = async () => {
    setResending(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Verification email resent!');
    setResending(false);
    setCountdown(60);
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center"><Zap size={18} className="text-white" /></div>
          <span className="font-display font-bold text-xl gradient-text">CampusEvents</span>
        </div>
        <div className="card p-10">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-6">📧</motion.div>
          <h1 className="text-2xl font-display font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Verify your Email</h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
            We've sent a verification link to your email. Click the link to activate your account. The link expires in 24 hours.
          </p>
          <Button onClick={resend} loading={resending} disabled={countdown > 0} variant="secondary" className="w-full flex items-center justify-center gap-2 mb-4">
            <RefreshCw size={15} /> {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
          </Button>
          <Link href="/login"><Button variant="ghost" className="w-full">Back to Login</Button></Link>
        </div>
      </motion.div>
    </div>
  );
}
