'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import TicketPreview from '@/components/ticket/TicketPreview';
import PDFDownload from '@/components/ticket/PDFDownload';
import { ticketService } from '@/services/ticketService';
import toast from 'react-hot-toast';

export default function TicketDetailPage() {
  const { ticketId } = useParams();

  const [ticket, setTicket]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    ticketService.getByCode(ticketId)
      .then(setTicket)
      .catch((e) => {
        setError(e?.message || 'Ticket not found');
        toast.error('Failed to load ticket');
      })
      .finally(() => setLoading(false));
  }, [ticketId]);

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-md mx-auto px-4 pt-28 pb-16">
        {loading ? (
          <Loader text="Loading your ticket…" />
        ) : error || !ticket ? (
          <EmptyState
            icon="🎫"
            title="Ticket not found"
            description={error || "We couldn't find a ticket with this code."}
          />
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Your Ticket</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Show this QR code at the venue entrance</p>
            <TicketPreview ticket={ticket} />
            <div className="mt-6">
              <PDFDownload ticket={ticket} />
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}