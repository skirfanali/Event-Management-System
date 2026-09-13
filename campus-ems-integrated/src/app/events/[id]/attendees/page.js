'use client';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import AttendanceStats from '@/components/attendance/AttendanceStats';
import { motion } from 'framer-motion';

export default function EventAttendeesPage() {
  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Attendees</h1>
          <div className="mb-8"><AttendanceStats /></div>
          <AttendanceTable />
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
