'use client';
import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';
import RatingStars from './RatingStars';
import { formatRelative } from '@/lib/helpers';

export default function ReviewCard({ review, index = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
      className="p-5 rounded-2xl" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
      <div className="flex items-start gap-4">
        <Avatar src={review.userAvatar} name={review.userName} size="md" />
        <div className="flex-1">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{review.userName}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{review.userCollege}</p>
            </div>
            <div className="flex items-center gap-2">
              <RatingStars rating={review.rating} size={14} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelative(review.createdAt)}</span>
            </div>
          </div>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
        </div>
      </div>
    </motion.div>
  );
}
