import { useState } from 'react';
import { attendanceService } from '@/services/attendanceService';
import toast from 'react-hot-toast';

export function useAttendance() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult]     = useState(null);

  const scan = async (qrData) => {
    setScanning(true);
    try {
      const data = await attendanceService.scan(qrData);
      setResult({ success: true, ...data });
      toast.success('Attendance marked!');
      return data;
    } catch (e) {
      setResult({ success: false, message: e.message });
      toast.error('Invalid QR code');
    } finally {
      setScanning(false);
    }
  };

  return { scanning, result, scan };
}
