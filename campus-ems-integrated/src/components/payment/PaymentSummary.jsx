'use client';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Tag, ShieldCheck } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/helpers';

export default function PaymentSummary({ event, summary }) {
  const rows = [
    { label: 'Ticket Price',    value: formatCurrency(summary.price),    muted: false },
    { label: 'GST (5%)',        value: `+ ${formatCurrency(summary.tax)}`, muted: true  },
    summary.discount > 0
      ? { label: `Discount (${summary.coupon?.code})`, value: `- ${formatCurrency(summary.discount)}`, green: true }
      : null,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      {/* Event Info Card */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="relative h-28 overflow-hidden">
          <img
            src={event.image || `https://picsum.photos/seed/${event.id}/800/300`}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-white font-display font-bold text-sm leading-snug line-clamp-1">{event.title}</p>
          </div>
        </div>
        <div className="p-4 space-y-2" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Calendar size={13} className="text-brand-500 flex-shrink-0" />
            <span>{formatDate(event.date, 'EEE, MMM dd, yyyy • h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <MapPin size={13} className="text-accent-500 flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Tag size={13} className="text-yellow-500 flex-shrink-0" />
            <span>{event.category}</span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Price Breakdown</p>

        {event.isFree ? (
          <div className="flex justify-between items-center py-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ticket Price</span>
            <span className="font-bold text-green-500">FREE</span>
          </div>
        ) : (
          <>
            {rows.map(({ label, value, muted, green }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm" style={{ color: muted ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{label}</span>
                <span className={`text-sm font-semibold ${green ? 'text-green-500' : ''}`}
                  style={{ color: green ? undefined : 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </>
        )}

        <div className="border-t pt-3 flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Total Amount</span>
          <motion.span
            key={summary.total}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xl font-display font-bold gradient-text">
            {summary.total === 0 ? 'FREE' : formatCurrency(summary.total)}
          </motion.span>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />
        <span>Secured by Razorpay • 256-bit SSL encryption • PCI DSS compliant</span>
      </div>
    </div>
  );
}
