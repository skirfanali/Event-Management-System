'use client';
import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ReviewTable from '@/components/admin/ReviewTable';
import DeleteModal from '@/components/admin/DeleteModal';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [reviews,      setReviews]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getReviews({ page, size: 20 });
      setReviews(data?.content || []);
      setTotalPages(data?.totalPages || 1);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminService.deleteReview(deleteTarget.id);
      toast.success('Review deleted');
      setDeleteTarget(null);
      fetchReviews();
    } catch { toast.error('Failed to delete review'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="Manage Reviews" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {loading ? <Loader /> : (
            <>
              <ReviewTable reviews={reviews} onDelete={setDeleteTarget} />
              <Pagination page={page + 1} totalPages={totalPages} onPageChange={p => setPage(p - 1)} />
            </>
          )}
        </motion.div>
      </div>
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Review" message="Delete this review? This cannot be undone." />
    </div>
  );
}
