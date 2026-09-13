'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Users } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import UserTable from '@/components/admin/UserTable';
import DeleteModal from '@/components/admin/DeleteModal';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalUsers,   setTotalUsers]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ page, size: 20, search: search || undefined });
      setUsers(data?.content || []);
      setTotalPages(data?.totalPages || 1);
      // Use totalElements from the paginated response; fall back to summing across pages
      setTotalUsers(data?.totalElements ?? null);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminService.deleteUser(deleteTarget.id);
      toast.success('User deleted');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async (u) => {
    try {
      await adminService.toggleUserStatus(u.id);
      toast.success(`User ${u.active ? 'blocked' : 'activated'}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } p-4 h-full`}
      >
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="Manage Users" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* ── Total Users stat card ── */}
          <div className="mb-6">
            <div
              className="inline-flex items-center gap-4 card px-6 py-4"
              style={{ minWidth: 220 }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.12)' }}
              >
                <Users size={22} style={{ color: '#6366f1' }} />
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>
                  Total Users
                </p>
                {loading && totalUsers === null ? (
                  <div
                    className="h-7 w-14 rounded-lg animate-pulse"
                    style={{ background: 'var(--bg-tertiary)' }}
                  />
                ) : (
                  <p className="text-2xl font-display font-bold" style={{ color: '#6366f1' }}>
                    {totalUsers ?? users.length}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Search ── */}
          <div className="relative mb-5 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search users…"
              className="input-field pl-10 text-sm"
            />
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              <UserTable users={users} onDelete={setDeleteTarget} onEdit={handleToggle} />
              <Pagination page={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
            </>
          )}
        </motion.div>
      </div>

      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete User"
        message={`Delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}