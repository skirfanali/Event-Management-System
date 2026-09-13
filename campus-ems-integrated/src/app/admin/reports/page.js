'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import RevenueChart from '@/components/charts/RevenueChart';
import GrowthChart from '@/components/charts/GrowthChart';
import CategoryChart from '@/components/charts/CategoryChart';
import AttendanceChart from '@/components/charts/AttendanceChart';
import Loader from '@/components/common/Loader';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import { formatCurrency } from '@/lib/helpers';

// ── Fallback mock data (used only when backend is unreachable) ─────────────
const MOCK_STATS = {
  totalRevenue: 0, totalUsers: 0, totalEvents: 0, totalTickets: 0,
};
const MOCK_CHARTS = {
  revenueChart:    [
    { month: 'Jan', revenue: 0 }, { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 }, { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 }, { month: 'Jun', revenue: 0 },
  ],
  growthChart:     [
    { month: 'Jan', users: 0, events: 0 }, { month: 'Feb', users: 0, events: 0 },
    { month: 'Mar', users: 0, events: 0 }, { month: 'Apr', users: 0, events: 0 },
    { month: 'May', users: 0, events: 0 }, { month: 'Jun', users: 0, events: 0 },
  ],
  categoryChart:   [],
  attendanceChart: [],
};

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [stats,        setStats]        = useState(null);
  const [charts,       setCharts]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [usingMock,    setUsingMock]    = useState(false);

  useEffect(() => {
    // Fire both requests in parallel
    Promise.allSettled([
      adminService.getDashboard(),
      adminService.getAnalytics(),
    ]).then(([dashResult, analyticsResult]) => {
      // Summary stats
      if (dashResult.status === 'fulfilled') {
        setStats(dashResult.value);
      } else {
        setStats(MOCK_STATS);
        setUsingMock(true);
      }
      // Chart data
      if (analyticsResult.status === 'fulfilled') {
        setCharts(analyticsResult.value);
      } else {
        setCharts(MOCK_CHARTS);
        setUsingMock(true);
      }
    }).finally(() => setLoading(false));
  }, []);

  const c = charts || MOCK_CHARTS;
  const s = stats  || MOCK_STATS;

  const SUMMARY = [
    { label: 'Total Revenue', value: formatCurrency(s.totalRevenue  || 0), color: '#22c55e' },
    { label: 'Total Users',   value: (s.totalUsers   || 0).toLocaleString(), color: '#6366f1' },
    { label: 'Total Events',  value: (s.totalEvents  || 0).toLocaleString(), color: '#f43f5e' },
    { label: 'Total Tickets', value: (s.totalTickets || 0).toLocaleString(), color: '#f59e0b' },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="Reports & Analytics" />

        {loading ? <Loader /> : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Mock data warning */}
            {usingMock && (
              <div className="text-xs px-4 py-2 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                ⚠️ Backend unreachable — showing placeholder data
              </div>
            )}

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SUMMARY.map((s) => (
                <div key={s.label} className="card p-4 text-center">
                  <p className="text-xl font-display font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
                  Revenue Trend
                </h3>
                {/* data → [ { month, revenue } ] */}
                <RevenueChart data={c.revenueChart || []} />
              </div>

              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
                  Platform Growth
                </h3>
                {/* data → [ { month, users, events } ] */}
                <GrowthChart data={c.growthChart || []} />
              </div>

              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
                  Events by Category
                </h3>
                {/* data → [ { name, value (%), count } ] */}
                <CategoryChart data={c.categoryChart || []} />
              </div>

              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
                  Attendance Overview
                </h3>
                {/* data → [ { event, registered, attended } ] */}
                <AttendanceChart data={c.attendanceChart || []} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}