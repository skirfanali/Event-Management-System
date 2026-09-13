import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const attendanceService = {
  scan:      (qrData)  => api.post(EP.ATTENDANCE.SCAN, { qrData }),
  getEvent:  (id, p)   => api.get(EP.ATTENDANCE.EVENT(id), { params: p }),
  getStats:  (id)      => api.get(EP.ATTENDANCE.STATS(id)),
};
