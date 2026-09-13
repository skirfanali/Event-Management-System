'use client';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import TicketPreview from '@/components/ticket/TicketPreview';
import PDFDownload from '@/components/ticket/PDFDownload';


export default function TicketDetailPage() {
  const { ticketId } = useParams();
 
  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-md mx-auto px-4 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Your Ticket</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Show this QR code at the venue entrance</p>
          <TicketPreview ticket={ticket} />
          <div className="mt-6">
            <PDFDownload ticket={ticket} />
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
