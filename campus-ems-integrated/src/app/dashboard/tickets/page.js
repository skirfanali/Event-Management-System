'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, QrCode, Calendar, MapPin, Search } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import TicketPreview from '@/components/ticket/TicketPreview';
import { useAuth } from '@/context/AuthContext';
import { ticketService } from '@/services/ticketService';
import { formatDate } from '@/lib/helpers';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardTicketsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tickets,     setTickets]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [qrTicket,    setQrTicket]    = useState(null);
  const [qrBase64,    setQrBase64]    = useState(null);
  const [search,      setSearch]      = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    ticketService.getMyTickets()
      .then(d => setTickets(Array.isArray(d) ? d : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter(t =>
    t.eventTitle?.toLowerCase().includes(search.toLowerCase()) ||
    t.ticketCode?.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewQR = async (ticket) => {
    setQrTicket(ticket); setQrBase64(null);
    try {
      const qr = await ticketService.getQR(ticket.ticketCode);
      setQrBase64(typeof qr === 'string' ? qr : null);
    } catch {}
  };

  const handleDownload = async (ticket) => {
    setDownloading(ticket.ticketCode);
    try {
      const blob = await ticketService.download(ticket.ticketCode);
      const url  = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]));
      const a    = document.createElement('a');
      a.href = url; a.download = `ticket-${ticket.ticketCode}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Ticket downloaded!');
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
        <DashboardHeader user={user} onMenuClick={()=>setSidebarOpen(true)} title="My Tickets"/>
        {loading ? <Loader/> : (
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[{label:'Total',value:tickets.length,color:'#6366f1'},
                {label:'Confirmed',value:tickets.filter(t=>t.status==='CONFIRMED').length,color:'#22c55e'},
                {label:'Used',value:tickets.filter(t=>t.status==='USED').length,color:'#f59e0b'}].map(s=>(
                <div key={s.label} className="card p-4 text-center">
                  <p className="text-2xl font-display font-bold" style={{ color:s.color }}>{s.value}</p>
                  <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
            {tickets.length > 0 && (
              <div className="relative mb-5 max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search tickets…" className="input-field pl-10 text-sm"/>
              </div>
            )}
            {filtered.length === 0
              ? <EmptyState icon="🎫" title="No tickets yet" description="Register for an event to get your first ticket"
                  action={<Link href="/events"><Button>Browse Events</Button></Link>}/>
              : <div className="space-y-4">
                  {filtered.map((t,i)=>(
                    <motion.div key={t.ticketCode||t.id} initial={{ opacity:0,y:15 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}
                      className="rounded-2xl overflow-hidden flex flex-col md:flex-row"
                      style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                      <div className="w-full md:w-2 gradient-bg flex-shrink-0"/>
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between flex-wrap gap-3">
                          <div>
                            <h3 className="font-bold font-display text-sm leading-tight mb-1" style={{ color:'var(--text-primary)' }}>{t.eventTitle}</h3>
                            <p className="text-xs font-mono" style={{ color:'var(--text-muted)' }}>{t.ticketCode}</p>
                          </div>
                          <Badge variant={t.status==='CONFIRMED'?'success':t.status==='USED'?'default':'danger'}>{t.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-3 text-xs" style={{ color:'var(--text-muted)' }}>
                          <span className="flex items-center gap-1.5"><Calendar size={12} className="text-brand-500"/>{formatDate(t.eventDate,'MMM dd, yyyy • h:mm a')}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={12} className="text-accent-500"/>{t.venue}</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="secondary" onClick={()=>handleViewQR(t)} className="flex items-center gap-1.5">
                            <QrCode size={13}/> View QR
                          </Button>
                          <Button size="sm" loading={downloading===t.ticketCode} onClick={()=>handleDownload(t)} className="flex items-center gap-1.5">
                            <Download size={13}/> Download PDF
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>}
          </motion.div>
        )}
      </div>

      <Modal open={!!qrTicket} onClose={()=>{setQrTicket(null);setQrBase64(null);}} title="Your QR Ticket" size="sm">
        {qrTicket && (
          <div className="flex flex-col items-center gap-4 py-2">
            <TicketPreview ticket={qrTicket} qrOverride={qrBase64}/>
            <Button onClick={()=>handleDownload(qrTicket)} loading={downloading===qrTicket?.ticketCode}
              className="flex items-center gap-2 w-full justify-center">
              <Download size={15}/> Download PDF
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
