'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Ticket, DollarSign, ClipboardList } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/charts/RevenueChart';
import CategoryChart from '@/components/charts/CategoryChart';
import GrowthChart from '@/components/charts/GrowthChart';
import RegistrationChart from '@/components/charts/RegistrationChart';
import Loader from '@/components/common/Loader';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import { organizerRequestService } from '@/services/organizerRequestService';
import { formatCurrency } from '@/lib/helpers';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [stats,         setStats]         = useState(null);
  const [pendingCount,  setPendingCount]  = useState(0);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getDashboard(),
      organizerRequestService.getPendingCount(),
    ])
      .then(([s, count]) => { setStats(s); setPendingCount(Number(count) || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { title:'Total Users',   value: stats.totalUsers?.toLocaleString()   || '0', icon:Users,       color:'#6366f1', bg:'rgba(99,102,241,0.12)', trend:18, index:0 },
    { title:'Total Events',  value: stats.totalEvents?.toLocaleString()  || '0', icon:Calendar,    color:'#f43f5e', bg:'rgba(244,63,94,0.12)',  trend:12, index:1 },
    { title:'Total Tickets', value: stats.totalTickets?.toLocaleString() || '0', icon:Ticket,      color:'#22c55e', bg:'rgba(34,197,94,0.12)',  trend:25, index:2 },
    { title:'Revenue',       value: formatCurrency(stats.totalRevenue||0), icon:DollarSign,        color:'#f59e0b', bg:'rgba(245,158,11,0.12)', trend:33, index:3 },
  ] : [];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'var(--bg-primary)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform
        duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="Admin Dashboard" />

        {loading ? <Loader /> : (
          <>
            {/* ✅ Pending organizer requests alert */}
            {pendingCount > 0 && (
              <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
                className="mb-6 p-4 rounded-2xl flex items-center justify-between gap-4"
                style={{ background:'rgba(245,158,11,0.10)', border:'1px solid rgba(245,158,11,0.3)' }}>
                <div className="flex items-center gap-3">
                  <ClipboardList size={20} className="text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-500">
                      {pendingCount} pending organizer request{pendingCount > 1 ? 's' : ''} awaiting review
                    </p>
                    <p className="text-xs" style={{ color:'var(--text-muted)' }}>
                      Review and approve or reject organizer applications
                    </p>
                  </div>
                </div>
                <Link href="/admin/organizer-requests"
                  className="text-xs px-4 py-2 rounded-xl font-semibold bg-yellow-500 text-white hover:bg-yellow-600 transition-colors flex-shrink-0">
                  Review Now
                </Link>
              </motion.div>
            )}

            {/* Top stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map(s => <StatsCard key={s.title} {...s} />)}
            </div>

            {/* Secondary counts */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                  { label:'Active Events',         value:stats.activeEvents    ||0, color:'#22c55e' },
                  { label:'Upcoming Events',        value:stats.upcomingEvents  ||0, color:'#6366f1' },
                  { label:'Total Organizers',       value:stats.totalOrganizers ||0, color:'#f59e0b' },
                ].map(s => (
                  <div key={s.label} className="card p-4 text-center">
                    <p className="text-2xl font-display font-bold" style={{ color:s.color }}>{s.value}</p>
                    <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color:'var(--text-primary)' }}>Revenue (6 months)</h3>
                <RevenueChart data={stats?.revenueChart || []} />
              </div>
              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color:'var(--text-primary)' }}>Events by Category</h3>
                <CategoryChart data={stats?.categoryStats || []} />
              </div>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color:'var(--text-primary)' }}>Platform Growth</h3>
                <GrowthChart data={stats?.monthlyGrowth || []} />
              </div>
              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color:'var(--text-primary)' }}>Registration Trends</h3>
                <RegistrationChart data={stats?.registrationChart || []} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}