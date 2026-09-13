'use client';
import { motion } from 'framer-motion';
import { CreditCard, Zap, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/helpers';

export default function RazorpayButton({ summary, processing, onClick, disabled }) {
  const isFree = summary.total === 0;

  return (
    <div className="space-y-3">
      <motion.div whileTap={{ scale: 0.98 }}>
        <button
          onClick={onClick}
          disabled={disabled || processing}
          className="w-full py-4 rounded-2xl font-bold text-base text-white relative overflow-hidden
                     disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200
                     hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: isFree ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#6366f1,#8b5cf6,#f43f5e)' }}>

          {/* Shimmer effect */}
          {!processing && !disabled && (
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
          )}

          <span className="relative flex items-center justify-center gap-2">
            {processing ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75"/>
                </svg>
                Opening Razorpay…
              </>
            ) : isFree ? (
              <>
                <Zap size={18} />
                Register for Free
              </>
            ) : (
              <>
                <CreditCard size={18} />
                Pay {formatCurrency(summary.total)} with Razorpay
              </>
            )}
          </span>
        </button>
      </motion.div>

      <div className="flex items-center justify-center gap-2">
        <Lock size={12} style={{ color: 'var(--text-muted)' }} />
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          {isFree
            ? 'No payment required • Instant ticket generation'
            : 'UPI • Cards • NetBanking • Wallets supported'}
        </p>
      </div>

      {/* Razorpay logo hint */}
      {!isFree && (
        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Powered by{' '}
          <span className="font-bold" style={{ color: '#072654' }}>Razorpay</span>
        </p>
      )}
    </div>
  );
}
