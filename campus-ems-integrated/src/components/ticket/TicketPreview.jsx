'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Calendar, MapPin, User } from 'lucide-react';
import { formatDate } from '@/lib/helpers';

export default function TicketPreview({ ticket, qrOverride }) {
  const [qrSrc, setQrSrc] = useState(qrOverride || null);

  useEffect(() => {
    if (qrOverride) { setQrSrc(qrOverride); return; }
    if (!ticket?.qrData) return;
    // Generate local QR as fallback
    import('@/lib/qrGenerator').then(({ generateQR }) => {
      generateQR(ticket.qrData, { width: 200 }).then(url => { if (url) setQrSrc(url); });
    });
  }, [ticket?.qrData, qrOverride]);

  useEffect(() => {
    if (qrOverride) setQrSrc(qrOverride);
  }, [qrOverride]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="w-72 mx-auto rounded-3xl overflow-hidden shadow-2xl"
      style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)', border: '1px solid rgba(99,102,241,0.3)' }}>
      {/* Header */}
      <div className="gradient-bg px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-white" />
          <span className="font-display font-bold text-white text-sm">CampusEvents</span>
        </div>
        <span className="text-white/70 text-xs font-mono uppercase tracking-widest">e-Ticket</span>
      </div>

      {/* QR */}
      <div className="px-6 py-5 flex justify-center">
        {qrSrc
          ? <img src={qrSrc} alt="QR Code" className="w-40 h-40 rounded-xl bg-white p-1" />
          : <div className="w-40 h-40 rounded-xl bg-white/10 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full" />
            </div>}
      </div>

      {/* Divider */}
      <div className="relative mx-6 my-1">
        <div className="border-t border-dashed border-white/20" />
        <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full" style={{ background: 'var(--bg-primary)' }} />
        <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full" style={{ background: 'var(--bg-primary)' }} />
      </div>

      {/* Details */}
      <div className="px-6 py-5 space-y-3">
        <h3 className="font-display font-bold text-white text-sm leading-snug line-clamp-2">
          {ticket?.eventTitle || 'Event Ticket'}
        </h3>
        <div className="space-y-2 text-xs text-indigo-200">
          {ticket?.eventDate && (
            <div className="flex items-center gap-2">
              <Calendar size={12} />
              {formatDate(ticket.eventDate, 'EEE, MMM dd, yyyy • h:mm a')}
            </div>
          )}
          {ticket?.venue && (
            <div className="flex items-center gap-2"><MapPin size={12} />{ticket.venue}</div>
          )}
          {ticket?.attendeeName && (
            <div className="flex items-center gap-2"><User size={12} />{ticket.attendeeName}</div>
          )}
        </div>
        <div className="pt-2 border-t border-white/10">
          <p className="text-xs font-mono text-indigo-300 truncate">#{ticket?.ticketCode || '—'}</p>
        </div>
      </div>
    </motion.div>
  );
}
