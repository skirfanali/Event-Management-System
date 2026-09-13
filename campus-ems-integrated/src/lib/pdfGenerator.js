import { jsPDF } from 'jspdf';
import { formatDate } from './helpers';

export const generateTicketPDF = async (ticket, qrDataUrl) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [85, 140] });

  // Background
  doc.setFillColor(30, 27, 75);
  doc.rect(0, 0, 85, 140, 'F');

  // Header
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, 85, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CampusEvents', 42.5, 12, { align: 'center' });
  doc.setFontSize(8);
  doc.text('EVENT TICKET', 42.5, 20, { align: 'center' });

  // QR Code
  if (qrDataUrl) doc.addImage(qrDataUrl, 'PNG', 17.5, 30, 50, 50);

  // Event info
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const title = ticket.eventTitle || 'Event';
  doc.text(title.length > 28 ? title.slice(0, 28) + '…' : title, 42.5, 92, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(199, 210, 254);
  doc.text(`Date: ${formatDate(ticket.eventDate)}`, 42.5, 100, { align: 'center' });
  doc.text(`Venue: ${ticket.venue || 'TBD'}`, 42.5, 107, { align: 'center' });

  // Ticket ID
  doc.setDrawColor(99, 102, 241);
  doc.line(10, 115, 75, 115);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Ticket ID: ${ticket.id}`, 42.5, 122, { align: 'center' });
  doc.text(`${ticket.attendeeName || 'Attendee'}`, 42.5, 129, { align: 'center' });

  doc.save(`ticket-${ticket.id}.pdf`);
};

export const generateCertificatePDF = (data) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFillColor(30, 27, 75);
  doc.rect(0, 0, 297, 210, 'F');

  doc.setFillColor(99, 102, 241);
  doc.rect(10, 10, 277, 190, 'S');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Certificate of Participation', 148.5, 60, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(199, 210, 254);
  doc.text('This is to certify that', 148.5, 90, { align: 'center' });

  doc.setFontSize(24);
  doc.setTextColor(251, 191, 36);
  doc.text(data.name, 148.5, 110, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(199, 210, 254);
  doc.text(`successfully attended ${data.eventTitle}`, 148.5, 130, { align: 'center' });
  doc.text(`on ${formatDate(data.date)}`, 148.5, 142, { align: 'center' });

  doc.save(`certificate-${data.name}-${data.eventTitle}.pdf`);
};
