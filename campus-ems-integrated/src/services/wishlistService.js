import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const wishlistService = {
  toggle:      (eventId) => api.post(EP.WISHLIST.TOGGLE(eventId)),
  getMy:       ()        => api.get(EP.WISHLIST.MY),
  isWishlisted:(eventId) => api.get(EP.WISHLIST.CHECK(eventId)),
};
