'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Camera } from 'lucide-react';
import Button from '../ui/Button';
import { attendanceService } from '@/services/attendanceService';
import toast from 'react-hot-toast';

// ✅ Accept onScanSuccess callback — parent (OrganizerTicketsPage) uses it to refresh stats + table
export default function QRScanner({ onScanSuccess }) {
  const [active,   setActive]   = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result,   setResult]   = useState(null);
  const html5QrRef = useRef(null);

  const scanQR = async (decoded) => {
    if (scanning) return;
    setScanning(true);
    try {
      const data = await attendanceService.scan(decoded);
      setResult({
        success: true,
        message: 'Attendance marked!',
        attendeeName: data?.userName   || '',
        ticketCode:   data?.ticketCode || '',
      });
      toast.success(`✅ Checked in: ${data?.userName || 'Attendee'}`);
      html5QrRef.current?.clear().catch(() => {});
      setActive(false);

      // ✅ Notify parent to refresh stats and attendance table
      onScanSuccess?.();
    } catch (err) {
      const msg = err?.message || 'Invalid QR code';
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setScanning(false);
    }
  };

  const startScanner = async () => {
    setActive(true);
    setResult(null);
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      html5QrRef.current = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 220 }, false);
      html5QrRef.current.render(
        (decoded) => scanQR(decoded),
        () => {}
      );
    } catch {
      toast.error('Camera not available');
      setActive(false);
    }
  };

  const stopScanner = () => {
    html5QrRef.current?.clear().catch(() => {});
    setActive(false);
  };

  useEffect(() => () => { html5QrRef.current?.clear().catch(() => {}); }, []);

  return (
    <div className="space-y-4">
      <div id="qr-reader" className="rounded-2xl overflow-hidden" style={{ display: active ? 'block' : 'none' }} />

      {!active && (
        <motion.div whileHover={{ scale: 1.02 }} onClick={startScanner}
          className="h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand-500 transition-colors"
          style={{ borderColor: 'var(--border)' }}>
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center">
            <Camera size={24} className="text-white" />
          </div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Click to Scan QR</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Point camera at attendee's ticket</p>
        </motion.div>
      )}

      {active && (
        <Button variant="danger" size="sm" onClick={stopScanner} className="w-full">
          Stop Scanner
        </Button>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 ${
              result.success
                ? 'bg-green-500/15 border border-green-500/30'
                : 'bg-red-500/15 border border-red-500/30'
            }`}>
            {result.success
              ? <CheckCircle className="text-green-500 flex-shrink-0" size={22} />
              : <XCircle    className="text-red-500 flex-shrink-0"   size={22} />}
            <div>
              <p className={`font-bold text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.message}
              </p>
              {result.attendeeName && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{result.attendeeName}</p>
              )}
              {result.ticketCode && (
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{result.ticketCode}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <Button size="sm" variant="secondary" className="w-full" onClick={() => setResult(null)}>
          Scan Another
        </Button>
      )}
    </div>
  );
}