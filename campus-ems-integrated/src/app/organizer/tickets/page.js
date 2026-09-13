'use client';
import { useState, useEffect, useCallback } from 'react';
import OrganizerSidebar from '@/components/organizer/OrganizerSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QRScanner from '@/components/attendance/QRScanner';
import AttendanceStats from '@/components/attendance/AttendanceStats';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export default function OrganizerTicketsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [events,       setEvents]      = useState([]);
  const [eventId,      setEventId]     = useState(null);
  const [eventsLoading,setEventsLoading] = useState(true);

  const [stats,        setStats]       = useState(null);
  const [statsLoading, setStatsLoading]= useState(false);

  const [attendance,   setAttendance]  = useState([]);
  const [attLoading,   setAttLoading]  = useState(false);
  const [attError,     setAttError]    = useState(null);

  // Step 1: Load organizer's events using the correct endpoint
  useEffect(() => {
    const load = async () => {
      setEventsLoading(true);
      try {
        // ✅ Correct endpoint: EP.ORGANIZER.EVENTS = '/organizer/events'
        const res  = await api.get(EP.ORGANIZER.EVENTS, { params: { page: 0, size: 50 } });
        const list = res?.content || res || [];
        setEvents(list);
        if (list.length > 0) setEventId(list[0].id);
      } catch (e) {
        console.error('Failed to load organizer events:', e);
      } finally {
        setEventsLoading(false);
      }
    };
    load();
  }, []);

  // Step 2: Fetch stats for selected event
  const fetchStats = useCallback(async () => {
    if (!eventId) return;
    setStatsLoading(true);
    try {
      // ✅ Correct endpoint: EP.ORGANIZER.ATT_STATS = '/organizer/events/:id/attendance/stats'
      const data = await api.get(EP.ORGANIZER.ATT_STATS(eventId));
      setStats(data);
    } catch (e) {
      console.error('Failed to load attendance stats:', e);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [eventId]);

  // Step 3: Fetch attendance table for selected event
  const fetchAttendance = useCallback(async () => {
    if (!eventId) return;
    setAttLoading(true);
    setAttError(null);
    try {
      // ✅ Correct endpoint: EP.ORGANIZER.ATTENDANCE = '/organizer/events/:id/attendance'
      const res = await api.get(EP.ORGANIZER.ATTENDANCE(eventId), { params: { page: 0, size: 100 } });
      setAttendance(res?.content || res || []);
    } catch (e) {
      console.error('Failed to load attendance:', e);
      setAttError(e?.message || 'Failed to load attendance data');
    } finally {
      setAttLoading(false);
    }
  }, [eventId]);

  // Reload when event changes
  useEffect(() => {
    if (!eventId) return;
    fetchStats();
    fetchAttendance();
  }, [eventId, fetchStats, fetchAttendance]);

  // Called by QRScanner after every successful scan
  const handleScanSuccess = useCallback(() => {
    fetchStats();
    fetchAttendance();
  }, [fetchStats, fetchAttendance]);

  const selectedEvent = events.find(e => e.id === eventId);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <OrganizerSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="Scan Tickets" />

        {/* Event selector — only shown if organizer has multiple events */}
        {eventsLoading ? (
          <div className="h-10 w-72 rounded-xl animate-pulse" style={{ background: 'var(--bg-tertiary)' }} />
        ) : events.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-2xl mb-2">📅</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No events found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create an event first to track attendance</p>
          </div>
        ) : (
          <>
            {events.length > 1 && (
              <div className="flex items-center gap-3 flex-wrap">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Viewing Event:
                </label>
                <select
                  className="input-field text-sm py-1.5"
                  style={{ maxWidth: '320px' }}
                  value={eventId || ''}
                  onChange={e => setEventId(Number(e.target.value))}>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>
            )}
              {/* Scanner + Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="card p-6">
                <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
                  QR Scanner
                </h2>
                <QRScanner onScanSuccess={handleScanSuccess} />
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    Checked In ({attendance.length})
                  </h2>
                  <button
                    onClick={() => { fetchStats(); fetchAttendance(); }}
                    className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-white/5"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    ↻ Refresh
                  </button>
                </div>
                <AttendanceTable data={attendance} loading={attLoading} error={attError} />
              </div>
            </motion.div>

            {/* Stats card */}
            <div className="card p-5">
              <h2 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
                Attendance Statistics
                {selectedEvent && (
                  <span className="text-sm font-normal ml-2" style={{ color: 'var(--text-muted)' }}>
                    — {selectedEvent.title}
                  </span>
                )}
              </h2>
              <AttendanceStats stats={stats} loading={statsLoading} />
            </div>

          
          </>
        )}
      </div>
    </div>
  );
}