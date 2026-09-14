'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import ReviewCard from '@/components/event/ReviewCard';
import RatingStars from '@/components/event/RatingStars';
import { eventService } from '@/services/eventService';
import { reviewService } from '@/services/reviewService';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export default function EventReviewsPage() {
  const { id } = useParams();

  const [event, setEvent]               = useState(null);
  const [eventLoading, setEventLoading] = useState(true);

  const [reviews, setReviews]           = useState([]);
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    if (!id) return;
    setEventLoading(true);
    eventService.getById(id)
      .then(setEvent)
      .catch(() => toast.error('Failed to load event'))
      .finally(() => setEventLoading(false));
  }, [id]);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    setError(null);
    try {
      const res = await reviewService.getByEvent(id, { page, size: PAGE_SIZE });
      setReviews(res?.content || res || []);
      setTotalPages(res?.totalPages ?? 1);
      setTotalReviews(res?.totalElements ?? (res?.content || res || []).length);
    } catch (e) {
      setError(e?.message || 'Failed to load reviews');
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  }, [id, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // Prefer the event's own aggregate (covers all reviews); fall back to the
  // currently loaded page if the event hasn't reported one yet.
  const avg = event?.avgRating
    ?? (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0);
  const reviewCount = event?.reviewCount ?? totalReviews;

  const ratingDist = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { star, count, pct: reviews.length ? (count / reviews.length) * 100 : 0 };
  });

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Reviews</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            {eventLoading ? 'Loading…' : event?.title}
          </p>

          {reviewsLoading ? (
            <Loader text="Loading reviews…" />
          ) : error ? (
            <EmptyState icon="⚠️" title="Couldn't load reviews" description={error} />
          ) : reviews.length === 0 ? (
            <EmptyState
              icon="💬"
              title="No reviews yet"
              description="Be the first to share your experience for this event."
            />
          ) : (
            <>
              <div className="card p-6 mb-8 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-5xl font-display font-bold gradient-text">{Number(avg).toFixed(1)}</p>
                  <RatingStars rating={Math.round(avg)} size={16} />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{reviewCount} reviews</p>
                </div>
                <div className="flex-1 space-y-2">
                  {ratingDist.map(({ star, count, pct }) => (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>{star}★</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="h-full rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {reviews.map((r, i) => <ReviewCard key={r.id} review={r} index={i} />)}
              </div>
              <Pagination page={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}