'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Award } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/ui/Button';
import Loader from '@/components/common/Loader';
import { useAuth } from '@/context/AuthContext';
import { certificateService } from '@/services/certificateService';
import { formatDate } from '@/lib/helpers';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [certs,   setCerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    certificateService.getMy()
      .then(d => setCerts(Array.isArray(d) ? d : []))
      .catch(() => setCerts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (cert) => {
    setDownloading(cert.certificateCode);
    try {
      const blob = await certificateService.download(cert.certificateCode);
      const url  = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]));
      const a    = document.createElement('a');
      a.href = url; a.download = `certificate-${cert.certificateCode}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!');
    } catch { toast.error('Download failed'); }
    finally { setDownloading(null); }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <Sidebar user={user} onClose={()=>setSidebarOpen(false)}/>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={()=>setSidebarOpen(true)} title="My Certificates"/>
        {loading ? <Loader/> : certs.length === 0
          ? <EmptyState icon="🏆" title="No certificates yet" description="Attend events to earn participation certificates"/>
          : <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certs.map((c,i) => (
                <motion.div key={c.id} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.08 }}
                  className="card p-6 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
                    <Award size={22} className="text-white"/>
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>{c.eventTitle}</p>
                    <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>Issued: {formatDate(c.issuedAt)}</p>
                    <p className="text-xs font-mono mt-1" style={{ color:'var(--text-muted)' }}>{c.certificateCode}</p>
                  </div>
                  <Button size="sm" onClick={()=>handleDownload(c)} loading={downloading===c.certificateCode}
                    className="flex items-center gap-2 mt-auto">
                    <Download size={14}/> Download PDF
                  </Button>
                </motion.div>
              ))}
            </motion.div>}
      </div>
    </div>
  );
}
