'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import EventCard from '@/components/event/EventCard';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/ui/Button';
import Loader from '@/components/common/Loader';
import { useAuth } from '@/context/AuthContext';
import { wishlistService } from '@/services/wishlistService';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistService.getMy()
      .then(d => setEvents(Array.isArray(d) ? d : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="My Wishlist" />
        {loading ? <Loader /> : events.length === 0
          ? <EmptyState icon="❤️" title="Wishlist is empty" description="Save events you're interested in"
              action={<Link href="/events"><Button>Browse Events</Button></Link>} />
          : <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev, i) => <EventCard key={ev.id} event={{ ...ev, wishlisted: true }} index={i} />)}
            </motion.div>}
      </div>
    </div>
  );
}
