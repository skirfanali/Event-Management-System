'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import OrganizerSidebar from '@/components/organizer/OrganizerSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/helpers';
import api from '@/lib/axios';
import EP from '@/lib/endpoints';
import toast from 'react-hot-toast';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={13}
          className={s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />
      ))}
    </div>
  );
}

export default function OrganizerReviewsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [events,        setEvents]        = useState([]);
  const [eventId,       setEventId]       = useState(null);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [reviews,       setReviews]       = useState([]);
  const [reviewsLoading,setReviewsLoading]= useState(false);
  const [reviewsError,  setReviewsError]  = useState(null);
  const [avgRating,     setAvgRating]     = useState(null);

  const [deletingId,    setDeletingId]    = useState(null);

  // Load organizer events
  useEffect(() => {
    const load = async () => {
      setEventsLoading(true);
      try {
        const res  = await api.get(EP.ORGANIZER.EVENTS, { params: { page: 0, size: 50 } });
        const list = res?.content || res || [];
        setEvents(list);
        if (list.length > 0) setEventId(list[0].id);
      } catch { toast.error('Failed to load events'); }
      finally { setEventsLoading(false); }
    };
    load();
  }, []);

  const fetchReviews = useCallback(async () => {
    if (!eventId) return;
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const res  = await api.get(EP.REVIEWS.LIST(eventId), { params: { page: 0, size: 50 } });
      const list = res?.content || res || [];
      setReviews(list);
      // Calculate avg from fetched list
      if (list.length > 0) {
        const avg = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
        setAvgRating(avg.toFixed(1));
      } else {
        setAvgRating(null);
      }
    } catch (e) {
      setReviewsError(e?.message || 'Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleDelete = async (reviewId) => {
    setDeletingId(reviewId);
    try {
      await api.delete(EP.REVIEWS.DELETE(reviewId));
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete review'); }
    finally { setDeletingId(null); }
  };

  const selectedEvent = events.find(e => e.id === eventId);

  const ratingDist = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0
  }));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <OrganizerSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="Event Reviews" />

        {eventsLoading ? (
          <div className="h-10 w-72 rounded-xl animate-pulse" style={{ background: 'var(--bg-tertiary)' }} />
        ) : events.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No events yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create an event to start receiving reviews</p>
          </div>
        ) : (
          <>
            {/* Event selector */}
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Event:</label>
              <select className="input-field text-sm py-1.5" style={{ maxWidth: '340px' }}
                value={eventId || ''} onChange={e => setEventId(Number(e.target.value))}>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>

            {/* Summary card */}
            {!reviewsLoading && reviews.length > 0 && (
              <div className="card p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-5xl font-display font-bold gradient-text">{avgRating}</p>
                  <StarRating rating={Math.round(Number(avgRating))} />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''} for{' '}
                    <span className="font-medium">{selectedEvent?.title}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  {ratingDist.map(({ star, count, pct }) => (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-right" style={{ color: 'var(--text-muted)' }}>{star}</span>
                      <Star size={11} className="fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="h-full rounded-full bg-yellow-400 transition-all"
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right" style={{ color: 'var(--text-muted)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews list */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <MessageSquare size={16} className="text-brand-500" />
                  Reviews ({reviews.length})
                </h2>
                <button onClick={fetchReviews}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-white/5"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  ↻ Refresh
                </button>
              </div>

              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--bg-tertiary)' }} />
                  ))}
                </div>
              ) : reviewsError ? (
                <div className="text-center py-10">
                  <p className="text-2xl mb-2">⚠️</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{reviewsError}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No reviews yet</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Reviews from attendees will appear here</p>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-3">
                    {reviews.map((r, i) => (
                      <motion.div key={r.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}
                        className="flex gap-4 p-4 rounded-2xl"
                        style={{ background: 'var(--bg-tertiary)' }}>
                        <Avatar name={r.userName} src={r.userAvatar} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{r.userName}</p>
                              {r.userCollege && (
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.userCollege}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <StarRating rating={r.rating} />
                              <Badge variant="default">{r.rating}/5</Badge>
                              <button
                                onClick={() => handleDelete(r.id)}
                                disabled={deletingId === r.id}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors disabled:opacity-50">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {formatDate(r.createdAt, 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}