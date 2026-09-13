'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function TicketsPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/tickets'); }, [router]);
  return null;
}
