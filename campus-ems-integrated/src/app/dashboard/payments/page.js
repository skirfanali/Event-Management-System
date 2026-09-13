'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/ui/Button';
import Loader from '@/components/common/Loader';
import { useAuth } from '@/context/AuthContext';
import { paymentService } from '@/services/paymentService';
import { formatDate, formatCurrency } from '@/lib/helpers';
import Link from 'next/link';

export default function DashboardPaymentsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payments,    setPayments]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');

  useEffect(() => {
    paymentService.getMyPayments({ page:0, size:50 })
      .then(d => setPayments(d?.content || (Array.isArray(d) ? d : [])))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p =>
    p.eventTitle?.toLowerCase().includes(search.toLowerCase()) ||
    p.razorpayPaymentId?.toLowerCase().includes(search.toLowerCase())
  );
  const totalSpent = payments.filter(p=>p.status==='SUCCESS').reduce((s,p)=>s+(p.amount||0),0);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <Sidebar user={user} onClose={()=>setSidebarOpen(false)}/>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={()=>setSidebarOpen(true)} title="Payment History"/>
        {loading ? <Loader/> : (
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[{label:'Total Payments',value:payments.length,color:'#6366f1'},
                {label:'Successful',value:payments.filter(p=>p.status==='SUCCESS').length,color:'#22c55e'},
                {label:'Total Spent',value:formatCurrency(totalSpent),color:'#f59e0b'}].map(s=>(
                <div key={s.label} className="card p-4 text-center">
                  <p className="text-xl font-display font-bold" style={{ color:s.color }}>{s.value}</p>
                  <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
            {payments.length > 0 && (
              <div className="relative mb-5 max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search payments…" className="input-field pl-10 text-sm"/>
              </div>
            )}
            {filtered.length === 0
              ? <EmptyState icon="💳" title="No payments yet" description="Payment history will appear here after registering for paid events."
                  action={<Link href="/events"><Button>Browse Events</Button></Link>}/>
              : <div className="rounded-2xl overflow-hidden border" style={{ borderColor:'var(--border)' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs font-bold uppercase tracking-wide" style={{ background:'var(--bg-tertiary)',color:'var(--text-muted)' }}>
                          {['Payment ID','Event','Amount','Gateway','Status','Date'].map(h=>(
                            <th key={h} className="text-left px-5 py-3.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((p,i)=>(
                          <motion.tr key={p.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}
                            className="border-t hover:bg-white/3 transition-colors" style={{ borderColor:'var(--border)',background:'var(--bg-secondary)' }}>
                            <td className="px-5 py-3.5"><span className="font-mono text-xs" style={{ color:'var(--text-muted)' }}>{(p.razorpayPaymentId||'FREE').slice(0,16)}…</span></td>
                            <td className="px-5 py-3.5 max-w-[160px]"><p className="font-medium text-sm truncate" style={{ color:'var(--text-primary)' }}>{p.eventTitle}</p></td>
                            <td className="px-5 py-3.5 font-semibold" style={{ color:'var(--text-primary)' }}>
                              {p.amount===0 ? <span className="text-green-500">FREE</span> : formatCurrency(p.amount)}
                            </td>
                            <td className="px-5 py-3.5 text-xs" style={{ color:'var(--text-secondary)' }}>{p.gateway||'—'}</td>
                            <td className="px-5 py-3.5">
                              <Badge variant={p.status==='SUCCESS'?'success':p.status==='FAILED'?'danger':'warning'}>{p.status}</Badge>
                            </td>
                            <td className="px-5 py-3.5 text-xs" style={{ color:'var(--text-muted)' }}>{formatDate(p.createdAt,'MMM dd, yyyy')}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>}
          </motion.div>
        )}
      </div>
    </div>
  );
}
