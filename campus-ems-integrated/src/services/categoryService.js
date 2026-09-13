import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const categoryService = {
  getAll:  () => api.get(EP.CATEGORIES.LIST),
  getById: (id) => api.get(EP.CATEGORIES.GET(id)),
};
