import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const ticketService = {
  getMyTickets: ()     => api.get(EP.TICKETS.MY),
  getByCode:    (code) => api.get(EP.TICKETS.GET(code)),
  getQR:        (code) => api.get(EP.TICKETS.QR(code)),
  download:     (code) => api.get(EP.TICKETS.DOWNLOAD(code), { responseType: 'blob' }),
};
