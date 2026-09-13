'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

export default function SearchBar({ placeholder = 'Search events…', className = '' }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const ref = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/events?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <motion.div animate={{ scale: focused ? 1.02 : 1 }} transition={{ duration: 0.15 }}
        className="relative flex items-center">
        <Search size={18} className="absolute left-4 z-10" style={{ color: 'var(--text-muted)' }} />
        <input ref={ref} value={query} onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 rounded-2xl text-sm font-medium outline-none transition-all duration-200"
          style={{ background: 'var(--bg-tertiary)', border: `1px solid ${focused ? '#6366f1' : 'var(--border)'}`, color: 'var(--text-primary)', boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none' }} />
        <AnimatePresence>
          {query && (
            <motion.button type="button" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => { setQuery(''); ref.current?.focus(); }}
              className="absolute right-3 p-1 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </form>
  );
}
