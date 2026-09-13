'use client';
import { motion } from 'framer-motion';
import { Download, QrCode, Calendar, MapPin } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate } from '@/lib/helpers';

const statusVariant = { CONFIRMED: 'success', PENDING: 'warning', CANCELLED: 'danger', USED: 'default' };

export default function TicketCard({ ticket, onDownload, onViewQR, index = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
      className="rounded-2xl overflow-hidden flex flex-col md:flex-row"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      {/* Left accent */}
      <div className="w-full md:w-2 gradient-bg flex-shrink-0" />
      {/* Content */}
      <div className="flex-1 p-5 md:p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold font-display text-base leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>{ticket.eventTitle}</h3>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>ID: {ticket.id}</p>
          </div>
          <Badge variant={statusVariant[ticket.status] || 'default'}>{ticket.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-brand-500" />{formatDate(ticket.eventDate, 'MMM dd, yyyy • h:mm a')}</span>
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-accent-500" />{ticket.venue}</span>
        </div>
        <div className="flex gap-2 mt-5">
          <Button size="sm" variant="secondary" onClick={() => onViewQR?.(ticket)} className="flex items-center gap-1.5">
            <QrCode size={14} /> View QR
          </Button>
          <Button size="sm" onClick={() => onDownload?.(ticket)} className="flex items-center gap-1.5">
            <Download size={14} /> Download PDF
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
