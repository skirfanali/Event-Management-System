'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Calendar, Star, Award, CheckSquare, Bell, Heart, Settings, LogOut, Zap, X, Ticket, CreditCard } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useAuth } from '@/context/AuthContext';

const LINKS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/my-events', label: 'My Events', icon: Calendar },
  { href: '/dashboard/tickets', label: 'My Tickets', icon: Ticket },
  { href: '/dashboard/payments', label: 'Payment History', icon: CreditCard },
  { href: '/dashboard/reviews', label: 'My Reviews', icon: Star },
  { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { href: '/dashboard/attendance', label: 'Attendance', icon: CheckSquare },
  { href: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];


export default function Sidebar({ user, onClose }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  return (
    <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} transition={{ type: 'spring', damping: 25 }}
      className="w-64 flex-shrink-0 h-full flex flex-col rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm gradient-text">CampusEvents</span>
        </div>
        {onClose && <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/10 rounded-lg"><X size={16} /></button>}
      </div>
      {/* User */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.name} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Student'}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email || 'student@campus.edu'}</p>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-brand-500/12 text-brand-500' : 'hover:bg-white/5'}`}
              style={{ color: active ? '#6366f1' : 'var(--text-secondary)' }}>
              <Icon size={17} />
              {label}
              {active && <motion.div layoutId="sidebar-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
            </Link>
          );
        })}
      </nav>
      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => {
            if (onClose) onClose();
            logout();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </motion.aside >
  );
}
