import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const organizerRequestService = {
  // Public — applicant submits
  submit:       (d)                => api.post(EP.ORGANIZER_REQUESTS.SUBMIT, d),
  // Admin only
  getAll:       (page, size, status) => api.get(EP.ORGANIZER_REQUESTS.LIST, { params: { page, size, status } }),
  getPendingCount: ()              => api.get(EP.ORGANIZER_REQUESTS.PENDING_COUNT),
  approve:      (id, note)         => api.put(EP.ORGANIZER_REQUESTS.APPROVE(id), { adminNote: note }),
  reject:       (id, note)         => api.put(EP.ORGANIZER_REQUESTS.REJECT(id),  { adminNote: note }),
};