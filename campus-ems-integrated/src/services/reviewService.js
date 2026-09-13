import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const reviewService = {
  add:      (eventId, d)  => api.post(EP.REVIEWS.ADD(eventId), d),
  getByEvent:(eventId, p) => api.get(EP.REVIEWS.LIST(eventId), { params: p }),
  update:   (id, d)       => api.put(EP.REVIEWS.UPDATE(id), d),
  delete:   (id)          => api.delete(EP.REVIEWS.DELETE(id)),
  getMy:    (p)           => api.get(EP.REVIEWS.MY, { params: p }),
};
