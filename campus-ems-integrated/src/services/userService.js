import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const userService = {
  getById:       (id) => api.get(EP.USERS.GET(id)),
  getProfile:    ()   => api.get(EP.AUTH.ME),
  updateProfile: (d)  => api.put(EP.USERS.PROFILE, d),
  uploadAvatar:  (f)  => {
    const fd = new FormData(); fd.append('file', f);
    return api.post(EP.USERS.AVATAR, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
