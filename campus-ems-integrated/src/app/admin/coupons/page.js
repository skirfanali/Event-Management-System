'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import CouponTable from '@/components/admin/CouponTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [coupons,     setCoupons]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [modal,       setModal]       = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [form,        setForm]        = useState({ code:'', type:'PERCENT', value:'', usageLimit:100, description:'' });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getCoupons({ page, size: 20 });
      setCoupons(data?.content || []);
      setTotalPages(data?.totalPages || 1);
    } catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleCreate = async () => {
    if (!form.code || !form.value) { toast.error('Code and value are required'); return; }
    setSaving(true);
    try {
      await adminService.createCoupon({ ...form, value: Number(form.value), usageLimit: Number(form.usageLimit) });
      toast.success('Coupon created!');
      setModal(false);
      fetchCoupons();
    } catch (err) { toast.error(err?.message || 'Failed to create coupon'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (coupon) => {
    try { await adminService.deleteCoupon(coupon.id); toast.success('Coupon deactivated'); fetchCoupons(); }
    catch { toast.error('Failed to deactivate coupon'); }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="Manage Coupons" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-end mb-6">
            <Button onClick={() => setModal(true)} className="flex items-center gap-2"><Plus size={15} /> New Coupon</Button>
          </div>
          {loading ? <Loader /> : (
            <>
              <CouponTable coupons={coupons} onDelete={handleDelete} />
              <Pagination page={page + 1} totalPages={totalPages} onPageChange={p => setPage(p - 1)} />
            </>
          )}
        </motion.div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Create Coupon" size="sm">
        <div className="space-y-4">
          <Input label="Code *" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE10" className="font-mono uppercase" />
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Type</label>
            <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="PERCENT">Percentage (%)</option>
              <option value="FLAT">Flat Amount (₹)</option>
            </select>
          </div>
          <Input label={`Value (${form.type === 'PERCENT' ? '%' : '₹'}) *`} type="number" value={form.value}
            onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder={form.type === 'PERCENT' ? '10' : '50'} />
          <Input label="Usage Limit" type="number" value={form.usageLimit}
            onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="100" />
          <Input label="Description" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="10% off on any event" />
          <Button className="w-full" onClick={handleCreate} loading={saving}>Create Coupon</Button>
        </div>
      </Modal>
    </div>
  );
}
