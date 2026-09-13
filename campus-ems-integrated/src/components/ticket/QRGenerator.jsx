'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { generateQR } from '@/lib/qrGenerator';
import Skeleton from '../ui/Skeleton';

export default function QRGenerator({ data, size = 200 }) {
  const [qr, setQR] = useState(null);
  useEffect(() => {
    if (!data) return;
    generateQR(data, { width: size }).then(setQR);
  }, [data, size]);

  return (
    <div className="flex flex-col items-center gap-3">
      {qr
        ? <motion.img initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            src={qr} alt="QR Code" className="rounded-2xl shadow-lg" style={{ width: size, height: size }} />
        : <Skeleton className="rounded-2xl" style={{ width: size, height: size }} />}
      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Show this QR at the venue</p>
    </div>
  );
}
