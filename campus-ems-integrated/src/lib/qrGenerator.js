import QRCode from 'qrcode';

export const generateQR = async (data, options = {}) => {
  try {
    return await QRCode.toDataURL(typeof data === 'string' ? data : JSON.stringify(data), {
      width: options.width || 300,
      margin: options.margin || 2,
      color: { dark: options.dark || '#1e1b4b', light: options.light || '#ffffff' },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('QR generation failed:', err);
    return null;
  }
};

export const generateTicketQR = (ticket) =>
  generateQR({ ticketId: ticket.id, eventId: ticket.eventId, userId: ticket.userId, timestamp: Date.now() });
