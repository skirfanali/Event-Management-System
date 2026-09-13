import Link from 'next/link';
import { Zap, Github, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t mt-20" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-display font-bold text-xl mb-4">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="gradient-text">CampusEvents</span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
              The modern event management platform built for campuses. Discover, register, and experience unforgettable events.
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl border flex items-center justify-center hover:border-brand-500 hover:text-brand-500 transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 font-display">Platform</h4>
            {['Events', 'Create Event', 'Dashboard', 'Analytics'].map(l => (
              <Link key={l} href="#" className="block text-sm py-1.5 hover:text-brand-500 transition-colors" style={{ color: 'var(--text-muted)' }}>{l}</Link>
            ))}
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 font-display">Company</h4>
            {['About', 'Contact', 'Privacy Policy', 'Terms of Service'].map(l => (
              <Link key={l} href="#" className="block text-sm py-1.5 hover:text-brand-500 transition-colors" style={{ color: 'var(--text-muted)' }}>{l}</Link>
            ))}
          </div>
        </div>
        <div className="border-t mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} CampusEvents. All rights reserved.</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Built with Next.js 15 + Spring Boot</p>
        </div>
      </div>
    </footer>
  );
}
