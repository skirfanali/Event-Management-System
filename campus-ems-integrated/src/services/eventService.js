import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const eventService = {
  getAll:        (params) => api.get(EP.EVENTS.LIST, { params }),
  search:        (params) => api.get(EP.EVENTS.SEARCH, { params }),
  getFeatured:   ()       => api.get(EP.EVENTS.FEATURED),
  getTrending:   ()       => api.get(EP.EVENTS.TRENDING),
  getById:       (id)     => api.get(EP.EVENTS.GET(id)),
  create:        (d)      => api.post(EP.EVENTS.CREATE, d),
  update:        (id, d)  => api.put(EP.EVENTS.UPDATE(id), d),
  delete:        (id)     => api.delete(EP.EVENTS.DELETE(id)),
  uploadImage:   (id, f)  => {
    const fd = new FormData(); fd.append('file', f);
    return api.post(EP.EVENTS.IMAGE(id), fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
