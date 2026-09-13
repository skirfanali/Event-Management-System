'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import { categoryService } from '@/services/categoryService';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState({ name:'', icon:'', color:'', description:'' });
  const [saving,      setSaving]      = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try { setCategories(await categoryService.getAll()); }
    catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => { setEditing(null); setForm({ name:'',icon:'',color:'',description:'' }); setModal(true); };
  const openEdit   = (cat) => { setEditing(cat); setForm({ name:cat.name, icon:cat.icon||'', color:cat.color||'', description:cat.description||'' }); setModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editing) { await adminService.updateCategory(editing.id, form); toast.success('Category updated'); }
      else          { await adminService.createCategory(form);             toast.success('Category created'); }
      setModal(false);
      fetchCategories();
    } catch (err) { toast.error(err?.message || 'Failed to save category'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this category?')) return;
    try { await adminService.deleteCategory(id); toast.success('Category deactivated'); fetchCategories(); }
    catch { toast.error('Failed to deactivate'); }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="Event Categories" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-end mb-6">
            <Button onClick={openCreate} className="flex items-center gap-2"><Plus size={15} /> Add Category</Button>
          </div>
          {loading ? <Loader /> : categories.length === 0
            ? <EmptyState icon="🏷️" title="No categories" action={<Button onClick={openCreate}>Add Category</Button>} />
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat, i) => (
                  <motion.div key={cat.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: cat.color ? `${cat.color}22` : 'var(--bg-tertiary)' }}>
                      {cat.icon || '📌'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{cat.eventCount || 0} events</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </motion.div>
                ))}
              </div>}
        </motion.div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Category' : 'Add Category'} size="sm">
        <div className="space-y-4">
          <Input label="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Technical" />
          <Input label="Icon (emoji)" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="💻" />
          <Input label="Color (hex)" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="#6366f1" />
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea rows={3} className="input-field resize-none" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description…" />
          </div>
          <Button className="w-full" onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'} Category</Button>
        </div>
      </Modal>
    </div>
  );
}
