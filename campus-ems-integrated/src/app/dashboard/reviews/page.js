'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/ui/Button';
import Loader from '@/components/common/Loader';
import RatingStars from '@/components/event/RatingStars';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { reviewService } from '@/services/reviewService';
import { formatRelative } from '@/lib/helpers';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MyReviewsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewService.getMy({ page: 0, size: 50 })
      .then(d => setReviews(d?.content || (Array.isArray(d) ? d : [])))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await reviewService.delete(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete review'); }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="My Reviews" />
        {loading ? <Loader /> : reviews.length === 0
          ? <EmptyState icon="⭐" title="No reviews yet" description="Attend events and share your experience!"
              action={<Link href="/events"><Button>Browse Events</Button></Link>} />
          : <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {reviews.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="card p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{r.eventTitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <RatingStars rating={r.rating} size={14} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelative(r.createdAt)}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Delete</Button>
                  </div>
                  <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>
                </motion.div>
              ))}
            </motion.div>}
      </div>
    </div>
  );
}
