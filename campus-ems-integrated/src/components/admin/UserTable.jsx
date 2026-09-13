'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit, MoreVertical } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { getRoleColor, formatDate } from '@/lib/helpers';

export default function UserTable({ users = [], onDelete, onEdit }) {
  const [openMenu, setOpenMenu] = useState(null);
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-bold uppercase tracking-wide" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="border-t hover:bg-white/3 transition-colors" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} src={u.avatar} size="sm" />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                <td className="px-5 py-3.5"><span className={`badge ${getRoleColor(u.role)}`}>{u.role}</span></td>
                <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                <td className="px-5 py-3.5"><Badge variant={u.active ? 'success' : 'danger'}>{u.active ? 'Active' : 'Blocked'}</Badge></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onEdit?.(u)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"><Edit size={14} /></button>
                    <button onClick={() => onDelete?.(u)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"><Trash2 size={14} /></button>
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
