'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Button from '@/components/ui/Button';

export default function PaymentFailurePage() {
  const router  = useRouter();
  const [error, setError] = useState('Payment was not completed.');

  useEffect(() => {
    const msg = sessionStorage.getItem('ems_payment_error');
    if (msg) { setError(msg); sessionStorage.removeItem('ems_payment_error'); }
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-24 pb-16 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ delay: 0.3, duration: 0.5 }}>
            <XCircle size={48} className="text-red-500" />
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-3xl font-display font-bold text-red-500 mb-3">Payment Failed</h1>
          <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
            We couldn't process your payment. No amount has been deducted.
          </p>
          <p className="text-xs mb-8 p-3 rounded-xl" style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)' }}>
            Reason: {error}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card p-5 mb-6 text-left">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <HelpCircle size={15} className="text-brand-500" /> What you can try
          </h3>
          <ul className="space-y-2">
            {[
              'Check your internet connection and retry',
              'Try a different payment method (UPI, Card, NetBanking)',
              'Ensure your bank account has sufficient balance',
              'Disable VPN if active, then retry',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="text-brand-500 font-bold flex-shrink-0">{i + 1}.</span> {tip}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="space-y-3">
          <Button onClick={() => router.back()} size="lg" className="w-full flex items-center justify-center gap-2">
            <RefreshCw size={17} /> Retry Payment
          </Button>
          <Link href="/events">
            <Button variant="secondary" size="lg" className="w-full flex items-center justify-center gap-2">
              <Home size={17} /> Back to Events
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
