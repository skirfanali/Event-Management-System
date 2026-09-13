'use client';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={toggleTheme}
      className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
      style={{ color: 'var(--text-secondary)' }} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      <AnimIcon isDark={theme === 'dark'} />
    </motion.button>
  );
}

function AnimIcon({ isDark }) {
  const { AnimatePresence } = require('framer-motion');
  return (
    <AnimatePresence mode="wait">
      <motion.div key={isDark ? 'moon' : 'sun'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
      </motion.div>
    </AnimatePresence>
  );
}
