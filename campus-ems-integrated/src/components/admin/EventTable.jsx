'use client';
import { motion } from 'framer-motion';
import { Trash2, Edit, Eye } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/helpers';
import Link from 'next/link';

export default function EventTable({ events = [], onDelete, onEdit }) {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-bold uppercase tracking-wide" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {['Event', 'Category', 'Date', 'Capacity', 'Price', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((ev, i) => (
              <motion.tr key={ev.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="border-t hover:bg-white/3 transition-colors" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <img src={ev.image || `https://picsum.photos/seed/${ev.id}/80/50`} alt="" className="w-12 h-8 rounded-lg object-cover flex-shrink-0" />
                    <span className="font-medium max-w-[180px] truncate" style={{ color: 'var(--text-primary)' }}>{ev.title}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5"><Badge variant="brand">{ev.category}</Badge></td>
                <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{formatDate(ev.date)}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{ev.registered}/{ev.capacity}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{ev.isFree ? <span className="text-green-500 font-semibold">Free</span> : formatCurrency(ev.price)}</td>
                <td className="px-5 py-3.5"><span className={`badge ${getStatusColor(ev.status)}`}>{ev.status}</span></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <Link href={`/events/${ev.id}`}><button className="p-1.5 rounded-lg hover:bg-brand-500/10 text-brand-500 transition-colors"><Eye size={14} /></button></Link>
                    <button onClick={() => onEdit?.(ev)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"><Edit size={14} /></button>
                    <button onClick={() => onDelete?.(ev)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
