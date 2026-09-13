'use client';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import ReviewCard from '@/components/event/ReviewCard';
import RatingStars from '@/components/event/RatingStars';
import { MOCK_EVENTS } from '@/data/mockData';

const REVIEWS = [
  { id: 1, userName: 'Rahul S', userCollege: 'IIT Delhi', rating: 5, comment: 'Amazing event, well organized!', createdAt: new Date(Date.now() - 86400000) },
  { id: 2, userName: 'Priya K', userCollege: 'NIT',       rating: 4, comment: 'Good experience overall.', createdAt: new Date(Date.now() - 172800000) },
  { id: 3, userName: 'Amit R', userCollege: 'VIT',        rating: 5, comment: 'Best hackathon ever!', createdAt: new Date(Date.now() - 259200000) },
];

const avg = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;

export default function EventReviewsPage() {
  const { id } = useParams();
  const event = MOCK_EVENTS.find(e => e.id === id) || MOCK_EVENTS[0];
  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Reviews</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>{event.title}</p>
          <div className="card p-6 mb-8 flex items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-display font-bold gradient-text">{avg.toFixed(1)}</p>
              <RatingStars rating={Math.round(avg)} size={16} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{REVIEWS.length} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5,4,3,2,1].map(s => {
                const count = REVIEWS.filter(r => r.rating === s).length;
                return (
                  <div key={s} className="flex items-center gap-3 text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>{s}★</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                      <div className="h-full rounded-full bg-yellow-400" style={{ width: `${(count/REVIEWS.length)*100}%` }} />
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-4">
            {REVIEWS.map((r, i) => <ReviewCard key={r.id} review={r} index={i} />)}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
