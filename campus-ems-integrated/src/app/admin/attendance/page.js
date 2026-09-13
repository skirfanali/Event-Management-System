'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QRScanner from '@/components/attendance/QRScanner';
import AttendanceStats from '@/components/attendance/AttendanceStats';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import toast from 'react-hot-toast';

export default function AdminAttendancePage() {
  const { user } = useAuth();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [events,       setEvents]       = useState([]);
  const [eventsLoading,setEventsLoading]= useState(true);
  const [selectedId,   setSelectedId]   = useState('');

  /* Fetch all events for the selector */
  useEffect(() => {
    (async () => {
      try {
        // adminService.getEvents should return a Page or array; adjust if your API differs
        const data = await adminService.getEvents({ size: 200 });
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        setEvents(list);
        // Pre-select the first event so stats aren't empty on load
        if (list.length > 0) setSelectedId(String(list[0].id));
      } catch {
        toast.error('Failed to load events');
      } finally {
        setEventsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } p-4 h-full`}
      >
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          title="Attendance Tracking"
        />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* ── Event Selector ── */}
          <div className="mb-6 max-w-sm">
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Select Event
            </label>
            <div className="relative">
              <CalendarDays
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={eventsLoading}
                className="input-field pl-10 text-sm w-full appearance-none"
              >
                {eventsLoading ? (
                  <option>Loading events…</option>
                ) : events.length === 0 ? (
                  <option value="">No events found</option>
                ) : (
                  <>
                    <option value="">— Choose an event —</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={String(ev.id)}>
                        {ev.title ?? ev.name ?? `Event #${ev.id}`}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2
                className="font-display font-bold text-lg mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                QR Scanner
              </h2>
              {/* Pass eventId so the scanner can mark attendance against the right event */}
              <QRScanner eventId={selectedId || null} />
            </div>

            <div className="card p-6">
              <h2
                className="font-display font-bold text-lg mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Quick Stats
              </h2>
              {/* AttendanceStats drives its own data fetch via eventId */}
              <AttendanceStats eventId={selectedId || null} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}