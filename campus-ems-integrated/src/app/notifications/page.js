'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// ✅ Smart redirect based on user role instead of always going to /dashboard/notifications
export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (user.role === 'ORGANIZER') router.replace('/organizer/notifications');
    else if (user.role === 'ADMIN')     router.replace('/admin/notifications');
    else                                router.replace('/dashboard/notifications');
  }, [user, loading, router]);

  return null;
}