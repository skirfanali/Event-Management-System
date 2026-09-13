'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import toast from 'react-hot-toast';

const TYPES = ['EVENT','TICKET','PAYMENT','SYSTEM','REVIEW','REMINDER'];

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({ type:'SYSTEM', title:'', message:'' });
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState('broadcast'); // broadcast | user
  const [userId, setUserId] = useState('');

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) { toast.error('Title and message are required'); return; }
    setSending(true);
    try {
      if (mode === 'broadcast') {
        await adminService.broadcast(form);
        toast.success('Notification broadcast to all users!');
      } else {
        if (!userId) { toast.error('User ID is required'); return; }
        await adminService.notifyUser({ ...form, userId: Number(userId) });
        toast.success('Notification sent to user!');
      }
      setForm({ type:'SYSTEM', title:'', message:'' });
      setUserId('');
    } catch (err) { toast.error(err?.message || 'Failed to send notification'); }
    finally { setSending(false); }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <AdminSidebar onClose={()=>setSidebarOpen(false)}/>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={()=>setSidebarOpen(true)} title="Send Notifications"/>
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="max-w-2xl">
          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[{value:'broadcast',label:'📢 Broadcast',desc:'Send to all users'},
              {value:'user',     label:'👤 Single User',desc:'Send to specific user'}].map(m=>(
              <button key={m.value} type="button" onClick={()=>setMode(m.value)}
                className="p-4 rounded-2xl border-2 text-left transition-all"
                style={{ borderColor:mode===m.value?'#6366f1':'var(--border)', background:mode===m.value?'rgba(99,102,241,0.08)':'var(--bg-tertiary)' }}>
                <p className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>{m.label}</p>
                <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{m.desc}</p>
              </button>
            ))}
          </div>

          <div className="card p-6 space-y-4">
            {mode === 'user' && (
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color:'var(--text-secondary)' }}>User ID *</label>
                <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder="Enter user ID" className="input-field"/>
              </div>
            )}
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color:'var(--text-secondary)' }}>Type</label>
              <select className="input-field" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color:'var(--text-secondary)' }}>Title *</label>
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Notification title" className="input-field"/>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color:'var(--text-secondary)' }}>Message *</label>
              <textarea rows={4} value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}
                placeholder="Notification message…" className="input-field resize-none"/>
            </div>
            <Button onClick={handleSend} loading={sending} className="w-full flex items-center justify-center gap-2">
              <Send size={16}/> {mode==='broadcast'?'Broadcast to All Users':'Send to User'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
