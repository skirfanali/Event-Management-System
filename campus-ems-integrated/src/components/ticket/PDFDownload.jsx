'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import Button from '../ui/Button';
import { generateTicketPDF } from '@/lib/pdfGenerator';
import { generateQR } from '@/lib/qrGenerator';
import toast from 'react-hot-toast';

export default function PDFDownload({ ticket }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      const qr = await generateQR(ticket.qrData || ticket.id);
      await generateTicketPDF(ticket, qr);
      toast.success('Ticket downloaded!');
    } catch { toast.error('Download failed'); }
    finally { setLoading(false); }
  };
  return (
    <Button onClick={handle} loading={loading} className="flex items-center gap-2">
      <Download size={16} /> Download PDF
    </Button>
  );
}
