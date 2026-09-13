'use client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="p-2.5 rounded-xl border transition-all disabled:opacity-40 hover:bg-white/10"
        style={{ borderColor: 'var(--border)' }}>
        <ChevronLeft size={16} style={{ color: 'var(--text-secondary)' }} />
      </button>
      {pages.map(p => (
        <motion.button key={p} whileTap={{ scale: 0.9 }} onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-xl text-sm font-semibold border transition-all ${p === page ? 'gradient-bg text-white border-transparent shadow-glow' : 'hover:bg-white/10'}`}
          style={{ borderColor: p === page ? 'transparent' : 'var(--border)', color: p === page ? '#fff' : 'var(--text-secondary)' }}>
          {p}
        </motion.button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="p-2.5 rounded-xl border transition-all disabled:opacity-40 hover:bg-white/10"
        style={{ borderColor: 'var(--border)' }}>
        <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
      </button>
    </div>
  );
}
