'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import { formatDate, formatCurrency } from '@/lib/helpers';

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payments,    setPayments]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getPayments({ page, size:20 });
      setPayments(data?.content || []);
      setTotalPages(data?.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <AdminSidebar onClose={()=>setSidebarOpen(false)}/>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={()=>setSidebarOpen(true)} title="Payment Records"/>
        {loading ? <Loader/> : payments.length === 0 ? <EmptyState icon="💳" title="No payments yet"/> : (
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor:'var(--border)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wide" style={{ background:'var(--bg-tertiary)',color:'var(--text-muted)' }}>
                      {['User','Event','Amount','Gateway','Payment ID','Status','Date'].map(h=>(
                        <th key={h} className="text-left px-5 py-3.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p,i)=>(
                      <motion.tr key={p.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                        className="border-t hover:bg-white/3" style={{ borderColor:'var(--border)',background:'var(--bg-secondary)' }}>
                        <td className="px-5 py-3.5 text-sm font-medium" style={{ color:'var(--text-primary)' }}>{p.userName}</td>
                        <td className="px-5 py-3.5 max-w-[140px] truncate text-xs" style={{ color:'var(--text-muted)' }}>{p.eventTitle}</td>
                        <td className="px-5 py-3.5 font-semibold" style={{ color:'var(--text-primary)' }}>{p.amount===0?<span className="text-green-500">FREE</span>:formatCurrency(p.amount)}</td>
                        <td className="px-5 py-3.5 text-xs" style={{ color:'var(--text-secondary)' }}>{p.gateway||'—'}</td>
                        <td className="px-5 py-3.5"><span className="font-mono text-xs" style={{ color:'var(--text-muted)' }}>{(p.razorpayPaymentId||'—').slice(0,14)}</span></td>
                        <td className="px-5 py-3.5"><Badge variant={p.status==='SUCCESS'?'success':p.status==='FAILED'?'danger':'warning'}>{p.status}</Badge></td>
                        <td className="px-5 py-3.5 text-xs" style={{ color:'var(--text-muted)' }}>{formatDate(p.createdAt,'MMM dd, yyyy')}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination page={page+1} totalPages={totalPages} onPageChange={p=>setPage(p-1)}/>
          </motion.div>
        )}
      </div>
    </div>
  );
}
