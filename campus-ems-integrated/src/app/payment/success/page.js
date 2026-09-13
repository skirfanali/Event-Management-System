'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Ticket, Calendar, MapPin, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Button from '@/components/ui/Button';
import { ticketService } from '@/services/ticketService';
import { formatDate } from '@/lib/helpers';
import toast from 'react-hot-toast';

export default function PaymentSuccessPage() {
  const router  = useRouter();
  const [data,  setData]  = useState(null);
  const [ticket, setTicket] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('ems_last_payment');
      if (!raw) { router.replace('/events'); return; }
      const parsed = JSON.parse(raw);
      setData(parsed);
    } catch { router.replace('/events'); }
  }, [router]);

  // ✅ FIX: Fetch the correct ticket by registrationId, not the last ticket in list
  useEffect(() => {
    if (!data?.registration?.id) return;

    const registrationId = data.registration.id;

    // ✅ FIX: Poll for ticket (PaymentServiceImpl creates it async after verify)
    let attempts = 0;
    const maxAttempts = 8;
    const intervalMs  = 2000; // retry every 2s, up to 16s total

    const fetchTicket = async () => {
      try {
        const tickets = await ticketService.getMyTickets();
        const list = Array.isArray(tickets) ? tickets : [];

        // ✅ FIX: Match ticket by registrationId (returned in TicketResponse)
        const matched = list.find(
          (t) => String(t.registrationId) === String(registrationId)
        );

        if (matched) {
          setTicket(matched);
          return true; // found
        }
      } catch {
        // ignore, retry
      }
      return false;
    };

    // Try immediately first
    fetchTicket().then((found) => {
      if (!found) {
        const interval = setInterval(async () => {
          attempts++;
          const found = await fetchTicket();
          if (found || attempts >= maxAttempts) {
            clearInterval(interval);
            if (!found) {
              toast.error('Ticket not ready yet. Check My Tickets in a moment.');
            }
          }
        }, intervalMs);
      }
    });
  }, [data]);

  const handleDownload = async () => {
    if (!ticket?.ticketCode) return;
    setDownloading(true);
    try {
      const blob = await ticketService.download(ticket.ticketCode);
      const url  = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]));
      const a    = document.createElement('a');
      a.href = url; a.download = `ticket-${ticket.ticketCode}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Ticket downloaded!');
    } catch { toast.error('Download failed'); }
    finally { setDownloading(false); }
  };

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent" />
    </div>
  );

  const eventTitle = ticket?.eventTitle || data?.event?.title || 'Your Event';
  const eventDate  = ticket?.eventDate  || data?.event?.date;
  const venue      = ticket?.venue      || data?.event?.venue;
  const ticketCode = ticket?.ticketCode || '—';

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">

        {/* Success header */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }} className="text-center mb-8">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-500" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold mb-2 text-green-500">
            {data?.event?.isFree ? 'Registration Confirmed!' : 'Payment Successful!'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {ticket
              ? 'Your ticket has been generated and is ready to use.'
              : 'Generating your ticket, please wait a moment…'}
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="relative mb-8 overflow-hidden h-1.5 rounded-full">
          <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0 gradient-bg opacity-60 rounded-full" />
          <div className="absolute inset-0 gradient-bg rounded-full opacity-30" />
        </div>

        {/* Details card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card p-6 mb-6 space-y-4">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>Booking Details</h2>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Ticket Code',  value: ticketCode },
              { label: 'Reg ID',       value: data?.registration?.id ? `REG-${data.registration.id}` : '—' },
              { label: 'Amount Paid',  value: data?.registration?.amountPaid === 0 ? 'FREE' : data?.registration?.amountPaid ? `₹${data.registration.amountPaid}` : 'FREE' },
              { label: 'Status',       value: '✅ Confirmed' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-sm font-semibold font-mono truncate" style={{ color: 'var(--text-primary)' }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{eventTitle}</p>
            <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              {eventDate && <span className="flex items-center gap-1"><Calendar size={12} className="text-brand-500" />{formatDate(eventDate, 'EEE, MMM dd, yyyy • h:mm a')}</span>}
              {venue && <span className="flex items-center gap-1"><MapPin size={12} className="text-accent-500" />{venue}</span>}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button onClick={handleDownload} loading={downloading} disabled={!ticket?.ticketCode}
            className="flex items-center justify-center gap-2" size="lg">
            <Download size={17} /> Download PDF Ticket
          </Button>
          <Link href="/dashboard/tickets">
            <Button variant="secondary" size="lg" className="w-full flex items-center justify-center gap-2">
              <Ticket size={17} /> My Tickets <ArrowRight size={15} />
            </Button>
          </Link>
        </motion.div>

        <div className="text-center mt-6">
          <Link href="/events" className="text-sm text-brand-500 hover:underline flex items-center justify-center gap-1">
            <Home size={14} /> Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );
}