'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import DeleteModal from '../admin/DeleteModal';
import { formatDate, getStatusColor } from '@/lib/helpers';

// ✅ FIX: Accept onDelete prop from parent (OrganizerEventsPage) and call it
// Previously EventManager had its own mock handleDelete that did nothing real
export default function EventManager({ events = [], onDelete }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      // ✅ FIX: Call the real onDelete from parent instead of a mock setTimeout
      await onDelete?.(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>My Events</h2>
        <Link href="/events/create">
          <Button size="sm" className="flex items-center gap-1.5"><Plus size={15} /> New Event</Button>
        </Link>
      </div>

      <AnimatePresence>
        {events.map((ev, i) => (
          <motion.div key={ev.id}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-white/5"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>

            <img
              src={ev.imageUrl || ev.image || `https://picsum.photos/seed/${ev.id}/100/70`}
              alt={ev.title}
              className="w-20 h-14 rounded-xl object-cover flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{ev.title}</h3>
                <span className={`badge ${getStatusColor(ev.status)}`}>{ev.status}</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                {/* ✅ FIX: use ev.eventDate (backend field name) not ev.date */}
                <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(ev.eventDate || ev.date)}</span>
                <span className="flex items-center gap-1"><Users size={11} />{ev.registeredCount ?? ev.registered ?? 0}/{ev.capacity}</span>
                <span className="font-medium" style={{ color: ev.isFree ? '#22c55e' : 'var(--text-primary)' }}>
                  {ev.isFree ? 'FREE' : `₹${ev.price}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <Link href={`/events/${ev.id}`}>
                <button className="p-2 rounded-xl hover:bg-brand-500/10 text-brand-500 transition-colors"><Eye size={15} /></button>
              </Link>
              <Link href={`/events/${ev.id}/edit`}>
                <button className="p-2 rounded-xl hover:bg-blue-500/10 text-blue-500 transition-colors"><Edit size={15} /></button>
              </Link>
              <button
                onClick={() => setDeleteTarget(ev)}
                className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {events.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No events yet</p>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Create your first event to get started</p>
          <Link href="/events/create"><Button size="sm"><Plus size={14} /> Create Event</Button></Link>
        </div>
      )}

      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All registrations will be cancelled.`}
      />
    </div>
  );
}
