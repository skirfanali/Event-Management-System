'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Building, Calendar, Star, LogOut,
  Tag, Ticket, CreditCard, CheckSquare, Bell, BarChart2,
  Settings, Shield, X, ClipboardList,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { organizerRequestService } from '@/services/organizerRequestService';

const LINKS = [
  { href: '/admin',                      label: 'Dashboard',          icon: LayoutDashboard },
  { href: '/admin/users',                label: 'Users',              icon: Users           },
  { href: '/admin/organizers',           label: 'Organizers',         icon: Building        },
  { href: '/admin/organizer-requests',   label: 'Organizer Requests', icon: ClipboardList, badge: true },
  { href: '/admin/events',               label: 'Events',             icon: Calendar        },
  { href: '/admin/reviews',              label: 'Reviews',            icon: Star            },
  { href: '/admin/categories',           label: 'Categories',         icon: Tag             },
  { href: '/admin/coupons',              label: 'Coupons',            icon: Ticket          },
  { href: '/admin/payments',             label: 'Payments',           icon: CreditCard      },
  { href: '/admin/attendance',           label: 'Attendance',         icon: CheckSquare     },
  { href: '/admin/notifications',        label: 'Notifications',      icon: Bell            },
  { href: '/admin/reports',              label: 'Reports',            icon: BarChart2       },
  { href: '/admin/settings',             label: 'Settings',           icon: Settings        },
];

export default function AdminSidebar({ onClose }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  // ✅ Fetch pending organizer requests count for badge
  useEffect(() => {
    organizerRequestService.getPendingCount()
      .then(count => setPendingCount(Number(count) || 0))
      .catch(() => setPendingCount(0));
  }, [pathname]); // refresh on navigation

  const handleLogout = () => {
    if (onClose) onClose();
    logout();
  };

  return (
    <motion.aside
      initial={{ x: -280 }} animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="w-64 flex-shrink-0 h-full flex flex-col rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>

      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Shield size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm gradient-text">Admin Panel</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/10 rounded-lg">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {LINKS.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href;
          const showBadge = badge && pendingCount > 0;
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active ? 'bg-brand-500/12 text-brand-500' : 'hover:bg-white/5'}`}
              style={{ color: active ? '#6366f1' : 'var(--text-secondary)' }}>
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {/* ✅ Pending badge for organizer requests */}
              {showBadge && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500 text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Badge */}
      <div className="p-4 m-3 rounded-xl"
        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-brand-500" />
          <p className="text-xs font-bold text-brand-500">Admin Access</p>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Full system access enabled</p>
      </div>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </motion.aside>
  );
}