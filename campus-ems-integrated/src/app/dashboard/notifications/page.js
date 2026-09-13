'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/ui/Button';
import Loader from '@/components/common/Loader';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { formatRelative } from '@/lib/helpers';

const TYPE_CONFIG = {
  EVENT:    { icon: '📅', color: 'rgba(99,102,241,0.12)',  text: '#6366f1' },
  TICKET:   { icon: '🎫', color: 'rgba(34,197,94,0.12)',   text: '#22c55e' },
  SYSTEM:   { icon: '🔔', color: 'rgba(245,158,11,0.12)',  text: '#f59e0b' },
  PAYMENT:  { icon: '💳', color: 'rgba(244,63,94,0.12)',   text: '#f43f5e' },
  REVIEW:   { icon: '⭐', color: 'rgba(251,191,36,0.12)',  text: '#fbbf24' },
  REMINDER: { icon: '⏰', color: 'rgba(139,92,246,0.12)', text: '#8b5cf6' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead, deleteRead, loading, refresh } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="Notifications" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={refresh}
                className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-muted)' }} title="Refresh">
                <RefreshCw size={15} />
              </button>
              {notifications.some(n => n.read) && (
                <Button size="sm" variant="secondary" onClick={deleteRead} className="flex items-center gap-1.5">
                  <Trash2 size={13} /> Clear read
                </Button>
              )}
              {unreadCount > 0 && (
                <Button size="sm" variant="secondary" onClick={markAllRead} className="flex items-center gap-1.5">
                  <Check size={14} /> Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <Loader />
          ) : notifications.length === 0 ? (
            <EmptyState icon="🔕" title="No notifications"
              description="You'll be notified about events, tickets, and payments here." />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {notifications.map((n, i) => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.SYSTEM;
                  return (
                    <motion.div key={n.id}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => !n.read && markRead(n.id)}
                      className={`flex items-start gap-4 p-5 rounded-2xl transition-all
                        ${!n.read ? 'cursor-pointer hover:scale-[1.01] ring-1 ring-brand-500/20' : ''}`}
                      style={{
                        background: !n.read ? 'rgba(99,102,241,0.04)' : 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                      }}>
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                        style={{ background: cfg.color }}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                              style={{ background: cfg.text }} />
                          )}
                        </div>
                        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {n.message}
                        </p>
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                          {formatRelative(n.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}