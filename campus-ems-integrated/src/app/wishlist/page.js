'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import EventCard from '@/components/event/EventCard';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/ui/Button';
import Loader from '@/components/common/Loader';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function WishlistPage() {
  const { user } = useAuth();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    wishlistService.getMy()
      .then(d => setEvents(Array.isArray(d) ? d : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-40 pb-16 text-center">
        <EmptyState icon="❤️" title="Login to view wishlist"
          description="Sign in to save and view your favourite events"
          action={<Link href="/login"><Button>Login</Button></Link>} />
      </div>
      <Footer />
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                <Heart className="text-accent-500 fill-accent-500" size={28} /> My Wishlist
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{events.length} events saved</p>
            </div>
          </div>

          {loading ? <Loader /> : events.length === 0
            ? <EmptyState icon="❤️" title="Your wishlist is empty"
                description="Save events you're interested in and find them here anytime."
                action={<Link href="/events"><Button>Browse Events</Button></Link>} />
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {events.map((ev, i) => (
                    <motion.div key={ev.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: i * 0.06 }}>
                      <EventCard event={{ ...ev, wishlisted: true }} index={i} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
