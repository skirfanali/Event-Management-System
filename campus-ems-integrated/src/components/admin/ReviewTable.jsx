'use client';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import RatingStars from '../event/RatingStars';
import { formatRelative, truncate } from '@/lib/helpers';

export default function ReviewTable({ reviews = [], onDelete }) {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-bold uppercase tracking-wide" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {['User', 'Event', 'Rating', 'Comment', 'Date', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reviews.map((r, i) => (
              <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="border-t hover:bg-white/3 transition-colors" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Avatar name={r.userName} size="xs" />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.userName}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 max-w-[140px] truncate" style={{ color: 'var(--text-muted)' }}>{r.eventTitle}</td>
                <td className="px-5 py-3.5"><RatingStars rating={r.rating} size={13} /></td>
                <td className="px-5 py-3.5 max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>{truncate(r.comment, 60)}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{formatRelative(r.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => onDelete?.(r)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"><Trash2 size={14} /></button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
