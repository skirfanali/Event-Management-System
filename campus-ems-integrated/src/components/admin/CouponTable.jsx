'use client';
import { motion } from 'framer-motion';
import { Trash2, Copy } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate, copyToClipboard } from '@/lib/helpers';
import toast from 'react-hot-toast';

export default function CouponTable({ coupons = [], onDelete }) {
  const copy = async (code) => { await copyToClipboard(code); toast.success('Copied!'); };
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-bold uppercase tracking-wide" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {['Code', 'Discount', 'Type', 'Used / Limit', 'Expires', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map((c, i) => (
              <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="border-t hover:bg-white/3 transition-colors" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-brand-500 bg-brand-500/10 px-2 py-1 rounded-lg text-xs">{c.code}</code>
                    <button onClick={() => copy(c.code)} className="p-1 rounded text-gray-400 hover:text-brand-500"><Copy size={12} /></button>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{c.type === 'PERCENT' ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="px-5 py-3.5"><Badge variant="info">{c.type}</Badge></td>
                <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{c.used}/{c.limit}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{formatDate(c.expiresAt)}</td>
                <td className="px-5 py-3.5"><Badge variant={c.active ? 'success' : 'danger'}>{c.active ? 'Active' : 'Expired'}</Badge></td>
                <td className="px-5 py-3.5">
                  <button onClick={() => onDelete?.(c)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"><Trash2 size={14} /></button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
