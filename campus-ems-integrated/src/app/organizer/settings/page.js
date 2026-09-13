'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Bell, Camera, Save, Trash2, AlertTriangle } from 'lucide-react';
import OrganizerSidebar from '@/components/organizer/OrganizerSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import EP from '@/lib/endpoints';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User       },
  { id: 'password',      label: 'Password',      icon: Lock       },
  { id: 'notifications', label: 'Notifications', icon: Bell       },
  { id: 'danger',        label: 'Danger Zone',   icon: Trash2     },
];

export default function OrganizerSettingsPage() {
  const { user, setUser, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [activeTab,     setActiveTab]     = useState('profile');
  const [saving,        setSaving]        = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting,      setDeleting]      = useState(false);

  // ✅ Organizer profile fields — no student year/branch/college
  const [profile, setProfile] = useState({
    name:         '',
    phone:        '',
    organization: '',   // club / company / department
    designation:  '',   // Event Head, President, etc.
    website:      '',   // portfolio / social link
    bio:          '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name:         user.name         || '',
        phone:        user.phone        || '',
        organization: user.organization || '',
        designation:  user.designation  || '',
        website:      user.website      || '',
        bio:          user.bio          || '',
      });
    }
  }, [user]);

  const handleProfileSave = async () => {
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const updated = await api.put(EP.USERS.PROFILE, profile);
      setUser?.(prev => ({ ...prev, ...updated }));
      toast.success('Profile updated!');
    } catch (e) {
      toast.error(e?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error('Fill in all password fields'); return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match'); return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters'); return;
    }
    setSaving(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword,
      });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      toast.error(e?.message || 'Current password is incorrect');
    } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const url = await api.post(EP.USERS.AVATAR, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser?.(prev => ({ ...prev, avatarUrl: url }));
      toast.success('Avatar updated!');
    } catch (e) {
      toast.error(e?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      toast.error('Please type your email to confirm'); return;
    }
    setDeleting(true);
    try {
      await api.delete('/users/account');
      toast.success('Account deleted');
      logout?.();
      router.push('/');
    } catch (e) {
      toast.error(e?.message || 'Failed to delete account');
    } finally { setDeleting(false); }
  };

  const inp = "input-field w-full";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <OrganizerSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <DashboardHeader user={user} onMenuClick={() => setSidebarOpen(true)} title="Settings" />

        <div className="max-w-2xl mx-auto space-y-6">

          {/* Tab bar */}
          <div className="flex gap-1 p-1 rounded-2xl flex-wrap" style={{ background: 'var(--bg-secondary)' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium transition-all min-w-[70px]
                  ${activeTab === tab.id
                    ? tab.id === 'danger' ? 'bg-red-500 text-white shadow-lg' : 'gradient-bg text-white shadow-lg'
                    : 'hover:bg-white/5'}`}
                style={{ color: activeTab === tab.id ? 'white' : tab.id === 'danger' ? '#f43f5e' : 'var(--text-muted)' }}>
                <tab.icon size={13} /> {tab.label}
              </button>
            ))}
          </div>

          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card p-6 space-y-5">

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar name={user?.name} src={user?.avatarUrl} size="lg" />
                  <label className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-bg
                    flex items-center justify-center cursor-pointer shadow-lg
                    ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Camera size={13} className="text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>ORGANIZER</span>
                  {uploading && <p className="text-xs text-brand-500 mt-1">Uploading…</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name *',    key: 'name',         type: 'text', placeholder: 'Your full name'              },
                  { label: 'Phone',          key: 'phone',        type: 'tel',  placeholder: '+91 XXXXX XXXXX'             },
                  { label: 'Organization',   key: 'organization', type: 'text', placeholder: 'Club / Company / Department' },
                  { label: 'Designation',    key: 'designation',  type: 'text', placeholder: 'e.g. Event Head, President'  },
                  { label: 'Website / Link', key: 'website',      type: 'url',  placeholder: 'https://yourportfolio.com'   },
                ].map(f => (
                  <div key={f.key} className={f.key === 'website' ? 'sm:col-span-2' : ''}>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      {f.label}
                    </label>
                    <input type={f.type} className={inp} placeholder={f.placeholder}
                      value={profile[f.key]}
                      onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bio</label>
                <textarea className={inp} rows={3} maxLength={500}
                  placeholder="Tell attendees about yourself or your organization…"
                  value={profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
                <p className="text-xs text-right mt-1" style={{ color: 'var(--text-muted)' }}>
                  {profile.bio.length}/500
                </p>
              </div>

              <Button className="w-full flex items-center justify-center gap-2"
                onClick={handleProfileSave} loading={saving}>
                <Save size={15} /> Save Profile
              </Button>
            </motion.div>
          )}

          {/* ── Password Tab ── */}
          {activeTab === 'password' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card p-6 space-y-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Choose a strong password with at least 8 characters.
              </p>
              {[
                { label: 'Current Password', key: 'currentPassword', placeholder: 'Enter current password' },
                { label: 'New Password',     key: 'newPassword',     placeholder: 'At least 8 characters'  },
                { label: 'Confirm Password', key: 'confirmPassword', placeholder: 'Repeat new password'    },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {f.label}
                  </label>
                  <input type="password" className={inp} placeholder={f.placeholder}
                    value={passwords[f.key]}
                    onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <Button className="w-full flex items-center justify-center gap-2 mt-2"
                onClick={handlePasswordSave} loading={saving}>
                <Lock size={15} /> Change Password
              </Button>
            </motion.div>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card p-6 space-y-4">
              {[
                { label: 'New registrations', desc: 'When someone registers for your event'  },
                { label: 'Payment received',  desc: 'When a paid registration is confirmed'  },
                { label: 'Review submitted',  desc: 'When an attendee reviews your event'    },
                { label: 'Event reminders',   desc: '24 hours before your event starts'      },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: 'var(--bg-tertiary)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5 rounded-full transition-colors peer-checked:bg-brand-500
                      after:content-[''] after:absolute after:top-0.5 after:left-0.5
                      after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all
                      peer-checked:after:translate-x-5"
                      style={{ background: 'var(--bg-secondary)' }} />
                  </label>
                </div>
              ))}
              <Button className="w-full flex items-center justify-center gap-2"
                onClick={() => toast.success('Preferences saved!')}>
                <Save size={15} /> Save Preferences
              </Button>
            </motion.div>
          )}

          {/* ── Danger Zone Tab ── */}
          {activeTab === 'danger' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card p-6 space-y-5 border border-red-500/30">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10">
                <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-red-500">Delete Account</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    This will permanently delete your account, all your events, registrations, and data.
                    This action <strong>cannot be undone</strong>.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Type your email <span className="font-mono text-red-400">{user?.email}</span> to confirm
                </label>
                <input className={inp} type="email" placeholder={user?.email}
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)} />
              </div>

              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== user?.email}
                className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2
                  bg-red-500 text-white hover:bg-red-600 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed">
                {deleting ? 'Deleting…' : <><Trash2 size={15} /> Delete My Account</>}
              </button>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}