'use client';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate, getStatusColor } from '@/lib/helpers';

export default function EventBanner({ event }) {
  const registered = event.registeredCount ?? event.registered ?? 0;
  const imageUrl   = event.imageUrl || event.image || `https://picsum.photos/seed/${event.id}/1200/500`;
  const startDate  = event.eventDate || event.date;
  const endDate    = event.endDate;

  // Check if start and end are on different calendar days
  const isMultiDay = endDate &&
    formatDate(startDate, 'yyyy-MM-dd') !== formatDate(endDate, 'yyyy-MM-dd');

  return (
    <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden">
      <img src={imageUrl} alt={event.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap gap-2 mb-3">
            {event.category && (
              <Badge className="glass text-white border-0">{event.category}</Badge>
            )}
            {event.status && (
              <span className={`badge ${getStatusColor(event.status)}`}>{event.status}</span>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-display font-bold text-white mb-3 leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-white/80 text-sm">

            {/* Date row */}
            {startDate && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="flex-shrink-0" />
                {isMultiDay ? (
                  // Multi-day: "Mon, Jun 20, 2026 → Wed, Jun 22, 2026"
                  <>
                    {formatDate(startDate, 'EEE, MMM dd, yyyy')}
                    <ArrowRight size={12} className="mx-0.5 opacity-70" />
                    {formatDate(endDate, 'EEE, MMM dd, yyyy')}
                  </>
                ) : (
                  // Single day
                  formatDate(startDate, 'EEE, MMM dd, yyyy')
                )}
              </span>
            )}

            {/* Time row */}
            {startDate && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="flex-shrink-0" />
                {formatDate(startDate, 'h:mm a')}
                {endDate && !isMultiDay && (
                  // Same-day end time: "9:00 AM – 5:00 PM"
                  <>
                    <span className="opacity-60 mx-0.5">–</span>
                    {formatDate(endDate, 'h:mm a')}
                  </>
                )}
                {endDate && isMultiDay && (
                  // Multi-day with end time: "9:00 AM → 6:00 PM (Jun 22)"
                  <>
                    <ArrowRight size={12} className="mx-0.5 opacity-70" />
                    {formatDate(endDate, 'h:mm a')}
                  </>
                )}
              </span>
            )}

            {/* Venue */}
            {event.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="flex-shrink-0" />
                {event.venue}
              </span>
            )}

            {/* Registrations */}
            <span className="flex items-center gap-1.5">
              <Users size={14} className="flex-shrink-0" />
              {registered} registered
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}