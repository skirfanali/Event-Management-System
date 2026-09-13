'use client';
import { useState, useEffect } from 'react';
import { Calendar, Users, Star, DollarSign } from 'lucide-react';
import OrganizerSidebar from '@/components/organizer/OrganizerSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AnalyticsCard from '@/components/organizer/AnalyticsCard';
import RevenueChart from '@/components/charts/RevenueChart';
import AttendanceChart from '@/components/charts/AttendanceChart';
import Loader from '@/components/common/Loader';
import { useAuth } from '@/context/AuthContext';
import { organizerService } from '@/services/organizerService';
import { formatCurrency } from '@/lib/helpers';

export default function OrganizerPage() {
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

  const cards = stats ? [
    { title:'Total Events',    value: String(stats.totalEvents        ?? 0), change:15, icon:Calendar,   color:'#6366f1', bg:'rgba(99,102,241,0.12)', index:0 },
    { title:'Total Attendees', value: String(stats.totalRegistrations ?? 0), change:22, icon:Users,      color:'#f43f5e', bg:'rgba(244,63,94,0.12)',  index:1 },
    { title:'Upcoming Events', value: String(stats.upcomingEvents     ?? 0), change:5,  icon:Star,       color:'#f59e0b', bg:'rgba(245,158,11,0.12)', index:2 },
    // ✅ FIX: totalRevenue now comes from organizer's events revenue, not ₹0
    { title:'Total Revenue',   value: formatCurrency(stats.totalRevenue ?? 0), change:31, icon:DollarSign, color:'#22c55e', bg:'rgba(34,197,94,0.12)', index:3 },
  ] : [];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'var(--bg-primary)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <OrganizerSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="Organizer Dashboard" />

        {loading ? <Loader /> : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {cards.map(c => <AnalyticsCard key={c.title} {...c} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color:'var(--text-primary)' }}>
                  Revenue (6 months)
                </h3>
                {/* ✅ FIX: Pass revenueChart data — was empty before */}
                <RevenueChart data={stats?.revenueChart || []} />
              </div>
              <div className="card p-5">
                <h3 className="font-display font-bold text-base mb-4" style={{ color:'var(--text-primary)' }}>
                  Attendance Overview
                </h3>
                {/* ✅ FIX: Pass attendanceChart data — was empty before */}
                <AttendanceChart data={stats?.attendanceChart || []} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}