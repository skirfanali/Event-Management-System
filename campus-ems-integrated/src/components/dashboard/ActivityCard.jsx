'use client';
import { motion } from 'framer-motion';
import { formatRelative } from '@/lib/helpers';

const TYPE_CONFIG = {
  registered:  { icon: '🎫', color: 'rgba(99,102,241,0.15)',  label: 'Registered'  },
  ticket:      { icon: '🎟', color: 'rgba(34,197,94,0.15)',   label: 'Ticket'      },
  reviewed:    { icon: '⭐', color: 'rgba(251,191,36,0.15)',  label: 'Review'      },
  certificate: { icon: '🏆', color: 'rgba(245,158,11,0.15)',  label: 'Certificate' },
  attended:    { icon: '✅', color: 'rgba(34,197,94,0.15)',   label: 'Attended'    },
  wishlist:    { icon: '❤️', color: 'rgba(244,63,94,0.15)',   label: 'Wishlist'    },
};

export default function ActivityCard({ activities = [] }) {
  const hasReal = activities.length > 0;

  // Only show empty state if no real data — never show fake demo data
  const items = hasReal ? activities : [];

  return (
    <div className="card p-5">
      <h3 className="font-bold font-display text-base mb-4" style={{ color:'var(--text-primary)' }}>
        Recent Activity
      </h3>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm font-medium" style={{ color:'var(--text-primary)' }}>No activity yet</p>
          <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>
            Register for events to see your activity here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a, i) => {
            const cfg = TYPE_CONFIG[a.type] || { icon: '📌', color: 'rgba(99,102,241,0.15)' };
            return (
              <motion.div key={a.id}
                initial={{ opacity:0, x:-15 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-white/5"
                style={{ background: 'var(--bg-tertiary)' }}>
                {/* Icon bubble */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: cfg.color }}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug font-medium" style={{ color:'var(--text-primary)' }}>
                    {a.text}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
                    {a.time ? formatRelative(a.time) : ''}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}