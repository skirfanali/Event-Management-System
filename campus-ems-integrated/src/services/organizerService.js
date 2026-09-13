import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const organizerService = {
  getDashboard:    ()                => api.get(EP.ORGANIZER.DASHBOARD),
  getEvents:       (p)               => api.get(EP.ORGANIZER.EVENTS, { params: p }),
  getRegistrations:(eventId, p)      => api.get(EP.ORGANIZER.REGISTRATIONS(eventId), { params: p }),
  getAttendance:   (eventId, p)      => api.get(EP.ORGANIZER.ATTENDANCE(eventId), { params: p }),
  getAttStats:     (eventId)         => api.get(EP.ORGANIZER.ATT_STATS(eventId)),
  issueCertificate:(eventId, userId) => api.post(EP.ORGANIZER.CERTIFICATE(eventId, userId)),
};
