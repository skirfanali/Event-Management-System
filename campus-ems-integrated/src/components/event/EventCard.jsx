'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Heart, Star } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate, formatCurrency } from '@/lib/helpers';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function EventCard({ event, index = 0 }) {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(event.wishlisted || false);

  // Support both backend (registeredCount, avgRating) and legacy field names
  const registered  = event.registeredCount ?? event.registered ?? 0;
  const capacity    = event.capacity ?? 0;
  const rating      = Number(event.avgRating ?? event.rating ?? 0);
  const reviewCount = event.reviewCount ?? 0;

  // spotsLeft — only meaningful when capacity > 0
  const spotsLeft = capacity > 0 ? Math.max(0, capacity - registered) : null;
  const isFull    = capacity > 0 && spotsLeft === 0;
  const pct       = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to save events'); return; }
    const prev = wishlisted;
    setWishlisted(!prev);
    try {
      await wishlistService.toggle(event.id);
      toast.success(prev ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch { setWishlisted(prev); toast.error('Failed to update wishlist'); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="group rounded-2xl overflow-hidden flex flex-col"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl || event.image || `https://picsum.photos/seed/${event.id}/800/400`}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <motion.button whileTap={{ scale: 0.8 }} onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center">
          <Heart size={16} className={wishlisted ? 'fill-accent-500 text-accent-500' : 'text-white'} />
        </motion.button>
        {event.category && (
          <div className="absolute top-3 left-3">
            <Badge variant="brand" className="glass text-white border-0 text-xs">{event.category}</Badge>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${event.isFree ? 'bg-green-500 text-white' : 'gradient-bg text-white'}`}>
            {event.isFree ? 'FREE' : formatCurrency(event.price)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3
          className="font-bold font-display text-base leading-snug mb-3 line-clamp-2 group-hover:text-brand-500 transition-colors"
          style={{ color: 'var(--text-primary)' }}>
          {event.title}
        </h3>

        <div className="space-y-1.5 mb-4">
          {(event.eventDate || event.date) && (
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Calendar size={13} className="flex-shrink-0 text-brand-500" />
              <span>{formatDate(event.eventDate || event.date, 'EEE, MMM dd • h:mm a')}</span>
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <MapPin size={13} className="flex-shrink-0 text-accent-500" />
              <span className="truncate">{event.venue}</span>
            </div>
          )}

          {/* Registration count — only shown when capacity is known */}
          {capacity > 0 && (
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Users size={13} className="flex-shrink-0 text-green-500" />
              <span>{registered}/{capacity} registered</span>
              {spotsLeft !== null && spotsLeft > 0 && spotsLeft < 20 && (
                <span className="text-orange-500 font-semibold">({spotsLeft} left!)</span>
              )}
              {isFull && (
                <span className="text-red-500 font-semibold">(Full)</span>
              )}
            </div>
          )}
        </div>

        {/* Progress bar — only when capacity is known and > 0 */}
        {capacity > 0 && (
          <div className="mb-4">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.3 + index * 0.05, duration: 0.6 }}
                className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-500' : 'gradient-bg'}`}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            <Star size={13} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{rating.toFixed(1)}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({reviewCount})</span>
          </div>
          <Link href={`/events/${event.id}`}>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl text-xs font-bold gradient-bg text-white">
              View Event
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
