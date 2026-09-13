'use client';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function AnalyticsCard({ title, value, change, icon: Icon, color = '#6366f1', bg = 'rgba(99,102,241,0.12)', index = 0 }) {
  const isUp = change >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }} className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          <TrendingUp size={11} style={{ transform: isUp ? 'none' : 'scaleY(-1)' }} />
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-display font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{title}</p>
    </motion.div>
  );
}
