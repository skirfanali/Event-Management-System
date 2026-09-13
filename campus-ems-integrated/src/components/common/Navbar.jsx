'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, LogOut, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { label: 'Home',   href: '/' },
  { label: 'Events', href: '/events' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAdmin, isOrganizer } = useAuth();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardLink = isAdmin ? '/admin' : isOrganizer ? '/organizer' : '/dashboard';

  const navLinks = [
    ...NAV,
    ...(user ? [{ label: 'Dashboard', href: dashboardLink }] : []),
  ];

  return (
    <>
      <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'glass shadow-glass py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="gradient-text">CampusEvents</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <Link key={href} href={href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${pathname === href ? 'bg-brand-500/15 text-brand-500' : 'hover:bg-white/10'}`}
                style={{ color: pathname === href ? '#6366f1' : 'var(--text-secondary)' }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <NotificationBell />
                {/* Profile dropdown */}
                <div className="relative">
                  <button onClick={() => setProfileMenu(v => !v)}>
                    <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                  </button>
                  <AnimatePresence>
                    {profileMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setProfileMenu(false)} />
                        <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute right-0 top-12 w-48 rounded-2xl shadow-2xl z-20 overflow-hidden py-2"
                          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                          </div>
                          <Link href="/profile" onClick={() => setProfileMenu(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                            style={{ color: 'var(--text-secondary)' }}>
                            <User size={15} /> Profile
                          </Link>
                          <Link href={dashboardLink} onClick={() => setProfileMenu(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                            style={{ color: 'var(--text-secondary)' }}>
                            <Zap size={15} /> Dashboard
                          </Link>
                          <button onClick={() => { setProfileMenu(false); logout(); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                            <LogOut size={15} /> Sign Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link href="/register"><Button size="sm">Get Started</Button></Link>
              </div>
            )}
            <button onClick={() => setMobileOpen(v => !v)} className="md:hidden p-2 rounded-xl hover:bg-white/10">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-4 right-4 z-30 rounded-2xl p-4 shadow-2xl glass md:hidden">
            {navLinks.map(({ label, href }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-all"
                style={{ color: 'var(--text-primary)' }}>
                {label}
              </Link>
            ))}
            {user ? (
              <button onClick={() => { setMobileOpen(false); logout(); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all mt-2">
                Sign Out
              </button>
            ) : (
              <div className="mt-3 pt-3 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
                <Link href="/login" className="flex-1"><Button variant="secondary" size="sm" className="w-full">Login</Button></Link>
                <Link href="/register" className="flex-1"><Button size="sm" className="w-full">Sign Up</Button></Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
