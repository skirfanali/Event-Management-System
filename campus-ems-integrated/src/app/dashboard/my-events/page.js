'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import EventCard from '@/components/event/EventCard';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { registrationService } from '@/services/registrationService';
import { eventService } from '@/services/eventService';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MyEventsPage() {
  const { user } = useAuth();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [events,       setEvents]       = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Step 1: fetch user's registrations
        const regData = await registrationService.getMyList(0, 50);
        const regList = regData?.content || (Array.isArray(regData) ? regData : []);

        if (regList.length === 0) { setLoading(false); return; }

        // Step 2: fetch real event details for each unique eventId
        const uniqueIds = [...new Set(regList.map(r => r.eventId).filter(Boolean))];
        const results   = await Promise.allSettled(uniqueIds.map(id => eventService.getById(id)));

        // Map eventId → real event object
        const eventMap = {};
        results.forEach((res, idx) => {
          if (res.status === 'fulfilled' && res.value) {
            eventMap[uniqueIds[idx]] = res.value;
          }
        });

        // Step 3: merge real event data with registration status
        const merged = regList.map(reg => {
          const real = eventMap[reg.eventId];
          if (real) {
            // Use ALL real fields — correct capacity, registeredCount, avgRating, etc.
            return { ...real, _regStatus: reg.status, _amountPaid: reg.amountPaid };
          }
          // Fallback: registration data only — avoid misleading capacity
          return {
            id:             reg.eventId,
            title:          reg.eventTitle,
            eventDate:      reg.eventDate,
            venue:          reg.venue,
            status:         reg.status === 'ACTIVE' ? 'UPCOMING' : 'CANCELLED',
            isFree:         !reg.amountPaid || Number(reg.amountPaid) === 0,
            price:          reg.amountPaid || 0,
            registeredCount: 0,
            capacity:        0,   // 0 means "unknown" — EventCard won't show bar
            avgRating:       0,
            reviewCount:     0,
            _regStatus:     reg.status,
            _amountPaid:    reg.amountPaid,
          };
        });

        setEvents(merged);
      } catch {
        toast.error('Failed to load your events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const active    = events.filter(e => e._regStatus === 'ACTIVE');
  const pending   = events.filter(e => e._regStatus === 'WAITLISTED');
  const cancelled = events.filter(e => e._regStatus === 'CANCELLED');

  const Section = ({ title, badge, badgeVariant, items, labelText, labelColor }) => (
    items.length > 0 && (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <Badge variant={badgeVariant}>{items.length}</Badge>
        </div>
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${badgeVariant === 'danger' ? 'opacity-60' : ''}`}>
          {items.map((ev, i) => (
            <div key={`${ev.id}-${i}`} className="relative">
              <EventCard event={ev} index={i} />
              <div className="absolute top-12 left-3 z-10">
                <span className="px-2 py-0.5 rounded-md text-xs font-bold text-white shadow"
                  style={{ background: labelColor }}>{labelText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="My Registered Events" />

        {loading ? <Loader /> : events.length === 0
          ? <EmptyState icon="📅" title="No registrations yet"
              description="Register for events to see them here"
              action={<Link href="/events"><Button>Browse Events</Button></Link>} />
          : <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Active',   value: active.length,    color: '#22c55e' },
                  { label: 'Pending',  value: pending.length,   color: '#f59e0b' },
                  { label: 'Cancelled',value: cancelled.length, color: '#f43f5e' },
                ].map(s => (
                  <div key={s.label} className="card p-3 text-center">
                    <p className="text-xl font-display font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <Section title="Active Registrations"  badgeVariant="success" badge={active.length}
                items={active}    labelText="✅ Registered"      labelColor="#22c55e" />
              <Section title="Pending Payment"        badgeVariant="warning" badge={pending.length}
                items={pending}   labelText="⏳ Payment Pending" labelColor="#f59e0b" />
              <Section title="Cancelled"              badgeVariant="danger"  badge={cancelled.length}
                items={cancelled} labelText="❌ Cancelled"       labelColor="#f43f5e" />
            </motion.div>}
      </div>
    </div>
  );
}
