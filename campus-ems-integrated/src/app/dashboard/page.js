'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Ticket, Star, Award } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCard from '@/components/dashboard/StatsCard';
import ActivityCard from '@/components/dashboard/ActivityCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { registrationService } from '@/services/registrationService';
import { ticketService } from '@/services/ticketService';
import { reviewService } from '@/services/reviewService';
import { certificateService } from '@/services/certificateService';
import { eventService } from '@/services/eventService';
import EventCard from '@/components/event/EventCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats,       setStats]       = useState({ registrations:0, tickets:0, reviews:0, certificates:0 });
  const [events,      setEvents]      = useState([]);
  const [activities,  setActivities]  = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [regs, tickets, revs, certs] = await Promise.allSettled([
          registrationService.getMyList(0, 100),
          ticketService.getMyTickets(),
          reviewService.getMy({ page: 0, size: 100 }),
          certificateService.getMy(),
        ]);

        const regData  = regs.status    === 'fulfilled' ? regs.value    : null;
        const tktData  = tickets.status === 'fulfilled' ? tickets.value : null;
        const revData  = revs.status    === 'fulfilled' ? revs.value    : null;
        const certData = certs.status   === 'fulfilled' ? certs.value   : null;

        const regList  = regData?.content  || (Array.isArray(regData)  ? regData  : []);
        const tktList  = Array.isArray(tktData)  ? tktData  : [];
        const revList  = revData?.content  || (Array.isArray(revData)  ? revData  : []);
        const certList = Array.isArray(certData) ? certData : [];

        setStats({
          registrations: regData?.totalElements || regList.length,
          tickets:       tktList.length,
          reviews:       revData?.totalElements || revList.length,
          certificates:  certList.length,
        });

        // ── Build real activity feed ──────────────────────────────────────────
        const activityItems = [];

        regList.forEach(r => {
          activityItems.push({
            id:   `reg-${r.id}`,
            type: 'registered',
            text: `Registered for ${r.eventTitle}`,
            time: new Date(r.createdAt),
          });
        });

        tktList.forEach(t => {
          activityItems.push({
            id:   `tkt-${t.id || t.ticketCode}`,
            type: 'ticket',
            text: `Ticket confirmed for ${t.eventTitle}`,
            time: new Date(t.createdAt),
          });
        });

        revList.forEach(r => {
          activityItems.push({
            id:   `rev-${r.id}`,
            type: 'reviewed',
            text: `Reviewed ${r.eventTitle}`,
            time: new Date(r.createdAt),
          });
        });

        certList.forEach(c => {
          activityItems.push({
            id:   `cert-${c.id}`,
            type: 'certificate',
            text: `Earned certificate for ${c.eventTitle}`,
            time: new Date(c.issuedAt),
          });
        });

        // Sort by newest first, keep top 6
        activityItems.sort((a, b) => b.time - a.time);
        setActivities(activityItems.slice(0, 6));

        // ── Fetch REAL event data for the 2 most recent active registrations ─
        const activeRegs = regList.filter(r => r.status === 'ACTIVE').slice(0, 2);
        if (activeRegs.length > 0) {
          const eventResults = await Promise.allSettled(
            activeRegs.map(r => eventService.getById(r.eventId))
          );
          const realEvents = eventResults
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value);
          setEvents(realEvents);
        }

      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const statCards = [
    { title:'Events Registered', value:stats.registrations, subtitle:'Since joining', icon:Calendar, color:'#6366f1', bg:'rgba(99,102,241,0.12)', index:0 },
    { title:'Active Tickets',    value:stats.tickets,       subtitle:'Your tickets',  icon:Ticket,   color:'#f43f5e', bg:'rgba(244,63,94,0.12)',   index:1 },
    { title:'Reviews Given',     value:stats.reviews,       subtitle:'Event reviews', icon:Star,     color:'#f59e0b', bg:'rgba(245,158,11,0.12)',   index:2 },
    { title:'Certificates',      value:stats.certificates,  subtitle:'Downloadable',  icon:Award,    color:'#22c55e', bg:'rgba(34,197,94,0.12)',    index:3 },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <Sidebar user={user} onClose={()=>setSidebarOpen(false)}/>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={()=>setSidebarOpen(true)} title="Dashboard"/>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(s => <StatsCard key={s.title} {...s}/>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-display font-bold text-lg mb-4" style={{ color:'var(--text-primary)' }}>My Registrations</h2>
              {loading
                ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{Array(2).fill(0).map((_,i)=><SkeletonCard key={i}/>)}</div>
                : events.length === 0
                  ? <p className="text-sm" style={{ color:'var(--text-muted)' }}>No upcoming events. <a href="/events" className="text-brand-500 hover:underline">Browse events →</a></p>
                  : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{events.map((ev,i)=><EventCard key={ev.id} event={ev} index={i}/>)}</div>}
            </div>
          </div>
          {/* Pass real activities to ActivityCard */}
          <div><ActivityCard activities={activities}/></div>
        </div>
      </div>
    </div>
  );
}