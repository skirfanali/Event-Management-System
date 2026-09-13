'use client';
import { motion } from 'framer-motion';

export default function EmptyState({ icon = '📭', title = 'Nothing here yet', description = '', action }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center">
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-6xl mb-6">{icon}</motion.div>
      <h3 className="text-xl font-bold font-display mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && <p className="text-sm max-w-xs mb-6" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      {action}
    </motion.div>
  );
}
