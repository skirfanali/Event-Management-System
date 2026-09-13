'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Building, Briefcase, Mail, Phone, FileText, RefreshCw } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { organizerRequestService } from '@/services/organizerRequestService';
import { formatDate } from '@/lib/helpers';
import toast from 'react-hot-toast';

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
const STATUS_VARIANT = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };

export default function AdminOrganizerRequestsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState('PENDING');
  const [actionModal, setActionModal] = useState(null); // { type: 'approve'|'reject', request }
  const [adminNote,   setAdminNote]   = useState('');
  const [actioning,   setActioning]   = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await organizerRequestService.getAll(0, 50, activeTab);
      const list = Array.isArray(res) ? res : (res?.content || []);
      setRequests(list);
    } catch { toast.error('Failed to load requests'); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async () => {
    if (!actionModal) return;
    setActioning(true);
    try {
      if (actionModal.type === 'approve') {
        await organizerRequestService.approve(actionModal.request.id, adminNote);
        toast.success(`✅ ${actionModal.request.name}'s account has been created!`);
      } else {
        await organizerRequestService.reject(actionModal.request.id, adminNote);
        toast.success(`Request rejected. Rejection email sent.`);
      }
      setActionModal(null);
      setAdminNote('');
      fetchRequests();
    } catch (e) {
      toast.error(e?.message || 'Action failed');
    } finally { setActioning(false); }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)}
          title="Organizer Requests" />

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending Review', value: requests.filter(r=>r.status==='PENDING').length,  color: '#f59e0b' },
            { label: 'Approved',       value: requests.filter(r=>r.status==='APPROVED').length, color: '#22c55e' },
            { label: 'Rejected',       value: requests.filter(r=>r.status==='REJECTED').length, color: '#f43f5e' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className="text-2xl font-display font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: 'var(--bg-secondary)' }}>
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all
                ${activeTab === tab ? 'gradient-bg text-white shadow' : 'hover:bg-white/5'}`}
              style={{ color: activeTab === tab ? 'white' : 'var(--text-muted)' }}>
              {tab}
              {tab === 'PENDING' && pendingCount > 0 && activeTab !== 'PENDING' && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-yellow-500 text-white text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
          <button onClick={fetchRequests}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            <RefreshCw size={14} />
          </button>
        </div>

        {/* List */}
        {loading ? <Loader /> : requests.length === 0 ? (
          <EmptyState icon="📋" title="No requests"
            description={`No ${activeTab.toLowerCase()} organizer requests.`} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {requests.map((r, i) => (
                <motion.div key={r.id}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}
                  className="card p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
                        <Badge variant={STATUS_VARIANT[r.status] || 'default'}>{r.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1"><Mail size={11}/>{r.email}</span>
                        {r.phone && <span className="flex items-center gap-1"><Phone size={11}/>{r.phone}</span>}
                        {r.organization && <span className="flex items-center gap-1"><Building size={11}/>{r.organization}</span>}
                        {r.designation && <span className="flex items-center gap-1"><Briefcase size={11}/>{r.designation}</span>}
                        <span className="flex items-center gap-1"><Clock size={11}/>{formatDate(r.createdAt, 'MMM dd, yyyy')}</span>
                      </div>
                      {r.reason && (
                        <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          <span className="font-semibold">Reason:</span> {r.reason}
                        </p>
                      )}
                      {r.adminNote && r.status !== 'PENDING' && (
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          <span className="font-semibold">Admin note:</span> {r.adminNote}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setDetailModal(r)}
                        className="text-xs px-3 py-1.5 rounded-xl border transition-colors hover:bg-white/5"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        View Details
                      </button>
                      {r.status === 'PENDING' && (
                        <>
                          <button onClick={() => { setActionModal({ type:'approve', request:r }); setAdminNote(''); }}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl
                              bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors font-semibold">
                            <Check size={13} /> Approve
                          </button>
                          <button onClick={() => { setActionModal({ type:'reject', request:r }); setAdminNote(''); }}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl
                              bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-semibold">
                            <X size={13} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)}
        title="Organizer Request Details" size="md">
        {detailModal && (
          <div className="space-y-4">
            {[
              ['Name',         detailModal.name],
              ['Email',        detailModal.email],
              ['Phone',        detailModal.phone || '—'],
              ['Organization', detailModal.organization || '—'],
              ['Designation',  detailModal.designation || '—'],
              ['Submitted',    formatDate(detailModal.createdAt, 'MMM dd, yyyy • h:mm a')],
              ['Status',       detailModal.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-2 border-b"
                style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span className="font-semibold text-right max-w-xs" style={{ color: 'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
            <div className="pt-2">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Reason</p>
              <p className="text-sm p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                {detailModal.reason}
              </p>
            </div>
            {detailModal.adminNote && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Admin Note</p>
                <p className="text-sm p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                  {detailModal.adminNote}
                </p>
              </div>
            )}
            {detailModal.status === 'PENDING' && (
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => { setDetailModal(null); setActionModal({ type:'approve', request:detailModal }); setAdminNote(''); }}>
                  <Check size={15} /> Approve
                </Button>
                <Button variant="danger" className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => { setDetailModal(null); setActionModal({ type:'reject', request:detailModal }); setAdminNote(''); }}>
                  <X size={15} /> Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve / Reject Confirmation Modal */}
      <Modal
        open={!!actionModal}
        onClose={() => !actioning && setActionModal(null)}
        title={actionModal?.type === 'approve' ? '✅ Approve Organizer Request' : '❌ Reject Organizer Request'}
        size="sm">
        {actionModal && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {actionModal.type === 'approve'
                ? `This will create an organizer account for ${actionModal.request.name} (${actionModal.request.email}) and send them a welcome email.`
                : `This will reject ${actionModal.request.name}'s request and send them a rejection email.`}
            </p>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {actionModal.type === 'approve' ? 'Welcome note (optional)' : 'Rejection reason (optional — sent to applicant)'}
              </label>
              <textarea rows={3} className="input-field w-full resize-none"
                placeholder={actionModal.type === 'approve'
                  ? 'e.g. Welcome! Your account is ready.'
                  : 'e.g. Insufficient information provided.'}
                value={adminNote} onChange={e => setAdminNote(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1"
                onClick={() => setActionModal(null)} disabled={actioning}>
                Cancel
              </Button>
              <Button
                className={`flex-1 flex items-center justify-center gap-2 ${actionModal.type === 'reject' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                onClick={handleAction} loading={actioning}>
                {actionModal.type === 'approve' ? <><Check size={15}/> Confirm Approve</> : <><X size={15}/> Confirm Reject</>}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}