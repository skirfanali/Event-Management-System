'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';

import ThemeToggle from '../common/ThemeToggle';
import NotificationBell from '../common/NotificationBell';
import Avatar from '../ui/Avatar';
import SearchBar from '../common/SearchBar';

export default function DashboardHeader({
  user,
  onMenuClick,
  title = 'Dashboard',
}) {
  const hour = new Date().getHours();

  const greet =
    hour < 12
      ? 'Good morning'
      : hour < 17
      ? 'Good afternoon'
      : 'Good evening';

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-4 mb-8 flex-wrap"
    >
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <Menu
            size={20}
            style={{ color: 'var(--text-secondary)' }}
          />
        </button>

        <div>
          <h1
            className="text-2xl font-display font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h1>

          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            {greet},{' '}
            {user?.name?.split(' ')[0] || 'there'}! 👋
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-brand-500"
            style={{ color: 'var(--text-secondary)' }}
          >
            Home
          </Link>

          <Link
            href="/events"
            className="text-sm font-medium transition-colors hover:text-brand-500"
            style={{ color: 'var(--text-secondary)' }}
          >
            Events
          </Link>

          <Link
            href="/dashboard"
            className="px-3 py-2 rounded-xl text-sm font-medium bg-brand-500/15 text-brand-500"
          >
            Dashboard
          </Link>
        </div>

        {/* Search */}
        <SearchBar
          className="hidden md:block w-56"
          placeholder="Search events..."
        />

        {/* Actions */}
        <ThemeToggle />
        <NotificationBell />

        <Avatar
          src={user?.avatar}
          name={user?.name}
          size="sm"
        />
      </div>
    </motion.header>
  );
}