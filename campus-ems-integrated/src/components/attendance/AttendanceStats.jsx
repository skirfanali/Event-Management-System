'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { adminService } from '@/services/adminService';

/**
 * AttendanceStats
 *
 * Props:
 *   eventId – the selected event id (string | number | null).
 *             When null / empty the component shows a prompt to pick an event.
 *
 * Backend:  GET /api/admin/events/{eventId}/attendance/stats
 * Returns:  { totalRegistered, totalCheckedIn, absent, attendanceRate, eventTitle }
 *
 * Uses adminService (your axios instance) so auth headers and base URL
 * are handled automatically — no raw fetch() anywhere.
 */

const CARDS = [
  { key: 'totalRegistered', label: 'Total Registered', icon: Users,      color: '#6366f1', bg: 'rgba(99,102,241,0.12)'          },
  { key: 'totalCheckedIn',  label: 'Checked In',       icon: UserCheck,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)'           },
  { key: 'absent',          label: 'Not Checked In',   icon: UserX,      color: '#f43f5e', bg: 'rgba(244,63,94,0.12)'           },
  { key: 'attendanceRate',  label: 'Attendance Rate',  icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', suffix: '%' },
];

export default function AttendanceStats({ eventId = null }) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!eventId) {
      setStats(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    adminService
      .getAttendanceStats(eventId)
      .then((data) => {
        // axios interceptor already unwraps ApiResponse → data field
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load stats');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [eventId]);

  // ── No event selected ────────────────────────────────────────────────────
  if (!eventId && !loading) {
    return (
      <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
        Select an event above to view attendance stats.
      </p>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error && !loading) {
    return (
      <div className="text-sm text-center py-6 px-4 rounded-xl"
        style={{ background: 'rgba(244,63,94,0.08)', color: '#f43f5e' }}>
        <p className="font-semibold mb-1">Could not load stats</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{error}</p>
      </div>
    );
  }

  // ── Stat grid ────────────────────────────────────────────────────────────
  return (
    <div>
      {stats?.eventTitle && !loading && (
        <p className="text-xs font-medium mb-3 truncate" style={{ color: 'var(--text-muted)' }}>
          {stats.eventTitle}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card text-center p-5"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: card.bg }}
            >
              <card.icon size={20} style={{ color: card.color }} />
            </div>

            {loading ? (
              <div
                className="h-8 w-12 rounded-lg mx-auto animate-pulse mb-1"
                style={{ background: 'var(--bg-tertiary)' }}
              />
            ) : (
              <p className="text-2xl font-display font-bold" style={{ color: card.color }}>
                {stats ? (stats[card.key] ?? 0) : '—'}{card.suffix || ''}
              </p>
            )}

            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {card.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}