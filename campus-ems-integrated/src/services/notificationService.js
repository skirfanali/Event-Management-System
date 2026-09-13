import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const notificationService = {
  getAll:     (p)  => api.get(EP.NOTIFICATIONS.LIST, { params: p }),
  getUnread:  ()   => api.get(EP.NOTIFICATIONS.UNREAD),
  markRead:   (id) => api.put(EP.NOTIFICATIONS.READ(id)),
  markAllRead:()   => api.put(EP.NOTIFICATIONS.READ_ALL),
  deleteRead: ()   => api.delete(EP.NOTIFICATIONS.DELETE_READ),
};
