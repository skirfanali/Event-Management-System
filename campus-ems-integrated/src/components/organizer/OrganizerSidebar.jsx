'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  BarChart2,
  Users,
  Star,
  Ticket,
  Settings,
  Zap,
  X,
  LogOut,
  Bell,        // ✅ FIX: was 'Notification' which doesn't exist in lucide-react
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const LINKS = [
  { href: '/organizer',               label: 'Overview',      icon: LayoutDashboard },
  { href: '/organizer/events',        label: 'My Events',     icon: Calendar        },
  { href: '/organizer/analytics',     label: 'Analytics',     icon: BarChart2       },
  { href: '/organizer/attendees',     label: 'Attendees',     icon: Users           },
  { href: '/organizer/reviews',       label: 'Reviews',       icon: Star            },
  { href: '/organizer/tickets',       label: 'Tickets',       icon: Ticket          },
  { href: '/organizer/notifications', label: 'Notifications', icon: Bell            }, // ✅ FIX
  { href: '/organizer/settings',      label: 'Settings',      icon: Settings        },
];

export default function OrganizerSidebar({ onClose }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (onClose) onClose();
    logout();
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="w-64 flex-shrink-0 h-full flex flex-col rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>

      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm gradient-text">Organizer</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/10 rounded-lg">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active ? 'bg-brand-500/12 text-brand-500' : 'hover:bg-white/5'}`}
              style={{ color: active ? '#6366f1' : 'var(--text-secondary)' }}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
}