'use client';
import { useState, useEffect } from 'react';
import OrganizerSidebar from '@/components/organizer/OrganizerSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import RevenueChart from '@/components/charts/RevenueChart';
import RegistrationChart from '@/components/charts/RegistrationChart';
import AttendanceChart from '@/components/charts/AttendanceChart';
import CategoryChart from '@/components/charts/CategoryChart';
import Loader from '@/components/common/Loader';
import { useAuth } from '@/context/AuthContext';
import { organizerService } from '@/services/organizerService';
import { formatCurrency } from '@/lib/helpers';
import { motion } from 'framer-motion';

export default function OrganizerAnalyticsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats,  setStats]  = useState(null);
  const [loading,setLoading]= useState(true);

  useEffect(() => {
    organizerService.getDashboard()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <OrganizerSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="Analytics" />

        {loading ? <Loader /> : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Summary cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'My Events',           value: stats.totalEvents        ?? 0,                      color: '#6366f1' },
                  { label: 'Total Registrations', value: stats.totalRegistrations ?? 0,                      color: '#f43f5e' },
                  { label: 'Upcoming Events',     value: stats.upcomingEvents     ?? 0,                      color: '#f59e0b' },
                  { label: 'Revenue',             value: formatCurrency(stats.totalRevenue ?? 0),            color: '#22c55e' },
                ].map(s => (
                  <div key={s.label} className="card p-4 text-center">
                    <p className="text-xl font-display font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
                  Revenue Trend
                </h3>
                {/* ✅ FIX: Pass revenueChart data from backend */}
                <RevenueChart data={stats?.revenueChart || []} />
              </div>

              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
                  Registrations per Month
                </h3>
                {/* ✅ FIX: Pass registrationChart data from backend */}
                <RegistrationChart data={stats?.registrationChart || []} />
              </div>

              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
                  Attendance by Event
                </h3>
                {/* ✅ FIX: Pass attendanceChart data from backend */}
                <AttendanceChart data={stats?.attendanceChart || []} />
              </div>

              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
                  Events by Category
                </h3>
                {/* ✅ FIX: Pass categoryChart data from backend */}
                <CategoryChart data={stats?.categoryChart || []} />
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}