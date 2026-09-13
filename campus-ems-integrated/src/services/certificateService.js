import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const certificateService = {
  getMy:     ()     => api.get(EP.CERTIFICATES.MY),
  download:  (code) => api.get(EP.CERTIFICATES.DOWNLOAD(code), { responseType: 'blob' }),
  verify:    (code) => api.get(EP.CERTIFICATES.VERIFY(code)),
};
