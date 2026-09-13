'use client';
import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { formatDate } from '@/lib/helpers';

const statusMap = { PRESENT: 'success', ABSENT: 'danger', LATE: 'warning' };

export default function AttendanceTable({ data = [], loading = false, error = null }) {
  if (loading) return (
    <div className="rounded-2xl border p-10 flex items-center justify-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading attendance…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="rounded-2xl border p-10 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <p className="text-2xl mb-2">⚠️</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Failed to load attendance</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{error}</p>
    </div>
  );

  if (data.length === 0) return (
    <div className="rounded-2xl border p-10 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <p className="text-3xl mb-2">📋</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No attendance records yet</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Records will appear here after attendees check in via QR scan</p>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-bold uppercase tracking-wide"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {['Attendee', 'Email', 'Check-in Time', 'Ticket', 'Status'].map(h => (
                <th key={h} className="text-left px-5 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
            {data.map((row, i) => (
              <motion.tr key={row.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="hover:bg-white/5 transition-colors"
                style={{ background: 'var(--bg-secondary)' }}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={row.userName} size="sm" />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{row.userName}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{row.userEmail}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>
                  {row.checkedInAt ? formatDate(row.checkedInAt, 'h:mm a, MMM dd') : '—'}
                </td>
                <td className="px-5 py-3.5 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {row.ticketCode || '—'}
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={statusMap[row.status] || 'default'}>{row.status}</Badge>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}