'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { formatRelative } from '@/lib/helpers';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const icons = { EVENT:'📅', TICKET:'🎫', SYSTEM:'🔔', PAYMENT:'💳', REVIEW:'⭐', REMINDER:'⏰' };

  return (
    <div className="relative">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(v => !v)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
        style={{ color: 'var(--text-secondary)' }}>
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-20 overflow-hidden"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="font-bold text-sm font-display">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-brand-500 hover:underline flex items-center gap-1">
                      <Check size={12} /> All read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)}><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0
                  ? <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No notifications</p>
                  : notifications.map(n => (
                    <motion.div key={n.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      onClick={() => markRead(n.id)}
                      className={`flex gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors border-b ${!n.read ? 'bg-brand-500/5' : ''}`}
                      style={{ borderColor: 'var(--border)' }}>
                      <span className="text-xl flex-shrink-0 mt-0.5">{icons[n.type] || '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatRelative(n.createdAt)}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2" />}
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
