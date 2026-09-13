'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, CheckCircle, Loader } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CouponSection({ couponCode, setCouponCode, coupon, couponError, couponLoading, onApply, onRemove }) {
  const handleKey = (e) => { if (e.key === 'Enter') onApply(); };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Have a coupon?
      </p>

      {!coupon ? (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={handleKey}
              placeholder="Enter coupon code"
              className="input-field pl-10 text-sm uppercase tracking-widest font-mono"
              maxLength={20}
            />
          </div>
          <Button size="sm" variant="secondary" onClick={onApply} disabled={!couponCode.trim() || couponLoading}
            className="flex items-center gap-1.5 flex-shrink-0">
            {couponLoading ? <Loader size={14} className="animate-spin" /> : 'Apply'}
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="font-mono font-bold text-sm text-green-600">{coupon.code}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>— {coupon.description}</span>
          </div>
          <button onClick={onRemove} className="p-1 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
            <X size={14} />
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {couponError && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-500 flex items-center gap-1">
            ⚠ {couponError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!coupon && !couponError && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Try: <button onClick={() => setCouponCode('SAVE10')} className="text-brand-500 hover:underline font-mono">SAVE10</button>
          {', '}
          <button onClick={() => setCouponCode('FEST20')} className="text-brand-500 hover:underline font-mono">FEST20</button>
          {', '}
          <button onClick={() => setCouponCode('WELCOME50')} className="text-brand-500 hover:underline font-mono">WELCOME50</button>
        </p>
      )}
    </div>
  );
}
