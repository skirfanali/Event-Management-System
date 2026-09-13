'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, CheckCircle, Clock, Search } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/common/Loader';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/helpers';
import api from '@/lib/axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  PRESENT: { variant: 'success', label: 'Present',  icon: CheckCircle },
  ABSENT:  { variant: 'danger',  label: 'Absent',   icon: Clock       },
  LATE:    { variant: 'warning', label: 'Late',      icon: Clock       },
};

export default function AttendancePage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendance,  setAttendance]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await api.get('/attendance/my', { params: { page: 0, size: 50 } });
        const list = Array.isArray(res) ? res : (res?.content || []);
        setAttendance(list);
      } catch {
        toast.error('Failed to load attendance history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = attendance.filter(a =>
    a.eventTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
  const lateCount    = attendance.filter(a => a.status === 'LATE').length;

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
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="Attendance History" />

        {loading ? <Loader /> : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Attended', value: attendance.length, color: '#6366f1' },
                { label: 'Present',        value: presentCount,       color: '#22c55e' },
                { label: 'Late',           value: lateCount,          color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} className="card p-4 text-center">
                  <p className="text-2xl font-display font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            {attendance.length > 0 && (
              <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search events…" className="input-field pl-10 text-sm" />
              </div>
            )}

            {/* List */}
            {attendance.length === 0 ? (
              <EmptyState icon="✅" title="No attendance records yet"
                description="Your check-in records will appear here after attending events with QR scanning."
                action={<Link href="/events"><Button>Browse Events</Button></Link>} />
            ) : filtered.length === 0 ? (
              <EmptyState icon="🔍" title="No results" description={`No events matching "${search}"`} />
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filtered.map((a, i) => {
                    const cfg  = STATUS_MAP[a.status] || STATUS_MAP.PRESENT;
                    const Icon = cfg.icon;
                    return (
                      <motion.div key={a.id}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-4 p-5 rounded-2xl"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>

                        {/* Status icon */}
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0
                          ${a.status === 'PRESENT' ? 'bg-green-500/15' : a.status === 'LATE' ? 'bg-yellow-500/15' : 'bg-red-500/15'}`}>
                          <Icon size={20} className={
                            a.status === 'PRESENT' ? 'text-green-500' :
                            a.status === 'LATE'    ? 'text-yellow-500' : 'text-red-500'} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                              {a.eventTitle}
                            </p>
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          </div>

                          <div className="flex flex-wrap gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            {a.checkedInAt && (
                              <span className="flex items-center gap-1.5">
                                <CheckCircle size={12} className="text-green-500" />
                                Checked in: {formatDate(a.checkedInAt, 'MMM dd, yyyy • h:mm a')}
                              </span>
                            )}
                            {a.ticketCode && (
                              <span className="flex items-center gap-1.5 font-mono">
                                🎫 {a.ticketCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

          </motion.div>
        )}
      </div>
    </div>
  );
}