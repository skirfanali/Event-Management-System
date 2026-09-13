'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, BookOpen, Camera, Lock, Trash2, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { profileSchema } from '@/lib/validators';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const TABS = ['Profile', 'Password', 'Delete Account'];

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const router  = useRouter();
  const [editing,       setEditing]       = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [activeTab,     setActiveTab]     = useState('Profile');
  const [pwSaving,      setPwSaving]      = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting,      setDeleting]      = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  const isOrganizer = user?.role === 'ORGANIZER';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      name:         user?.name         || '',
      phone:        user?.phone        || '',
      bio:          user?.bio          || '',
      // student fields
      college:      user?.college      || '',
      year:         user?.year         || '',
      // organizer fields
      organization: user?.organization || '',
      designation:  user?.designation  || '',
      website:      user?.website      || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await userService.updateProfile(data);
      await refreshUser();
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) { toast.error(err?.message || 'Update failed'); }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await userService.uploadAvatar(file);
      await refreshUser();
      toast.success('Avatar updated!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handlePasswordChange = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error('Fill in all fields'); return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('Minimum 8 characters'); return;
    }
    setPwSaving(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword,
      });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      toast.error(e?.message || 'Current password is incorrect');
    } finally { setPwSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      toast.error('Email does not match'); return;
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
    <div style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
            My Profile
          </h1>

          {/* Tab bar */}
          <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: 'var(--bg-secondary)' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setEditing(false); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${activeTab === tab
                    ? tab === 'Delete Account' ? 'bg-red-500 text-white' : 'gradient-bg text-white shadow-lg'
                    : 'hover:bg-white/5'}`}
                style={{ color: activeTab === tab ? 'white' : tab === 'Delete Account' ? '#f43f5e' : 'var(--text-muted)' }}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── Profile Tab ── */}
          {activeTab === 'Profile' && (
            <div className="card p-8 space-y-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar src={user?.avatarUrl} name={user?.name} size="xl" />
                  <label className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-bg
                    flex items-center justify-center shadow-lg cursor-pointer ${uploading ? 'opacity-60' : ''}`}>
                    <Camera size={14} className="text-white" />
                    <input type="file" accept="image/*" className="sr-only" onChange={handleAvatar} disabled={uploading} />
                  </label>
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                  <span className="badge bg-brand-500/10 text-brand-500 mt-2">{user?.role}</span>
                </div>
                <div className="ml-auto">
                  <Button onClick={() => setEditing(v => !v)} variant={editing ? 'secondary' : 'primary'} size="sm">
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </div>

              {editing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input label="Full Name" icon={<User size={16}/>} error={errors.name?.message} {...register('name')} />
                  <Input label="Phone" type="tel" icon={<Phone size={16}/>} {...register('phone')} />

                  {isOrganizer ? (
                    <>
                      <Input label="Organization" icon={<BookOpen size={16}/>}
                        placeholder="Club / Company / Department" {...register('organization')} />
                      <Input label="Designation" placeholder="e.g. Event Head, Club President" {...register('designation')} />
                      <Input label="Website / Link" type="url" placeholder="https://yourportfolio.com" {...register('website')} />
                    </>
                  ) : (
                    <>
                      <Input label="College" icon={<BookOpen size={16}/>} {...register('college')} />
                      <Input label="Year / Semester" placeholder="3rd Year" {...register('year')} />
                    </>
                  )}

                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Bio</label>
                    <textarea rows={3} className="input-field resize-none" placeholder="Tell us about yourself…" {...register('bio')} />
                  </div>
                  <Button type="submit" loading={isSubmitting} className="w-full">Save Changes</Button>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(isOrganizer ? [
                    ['Email',        user?.email,          '📧'],
                    ['Phone',        user?.phone  || '—',  '📱'],
                    ['Organization', user?.organization || '—', '🏢'],
                    ['Designation',  user?.designation  || '—', '🎖️'],
                    ['Website',      user?.website      || '—', '🌐'],
                  ] : [
                    ['Email',        user?.email,          '📧'],
                    ['Phone',        user?.phone  || '—',  '📱'],
                    ['College',      user?.college || '—', '🏫'],
                    ['Year / Branch',`${user?.branch || ''} ${user?.year || ''}`.trim() || '—', '📚'],
                  ]).map(([k, v, emoji]) => (
                    <div key={k} className="p-4 rounded-2xl" style={{ background: 'var(--bg-tertiary)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{emoji} {k}</p>
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{v}</p>
                    </div>
                  ))}
                  {user?.bio && (
                    <div className="col-span-2 p-4 rounded-2xl" style={{ background: 'var(--bg-tertiary)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>💬 Bio</p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{user.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Password Tab ── */}
          {activeTab === 'Password' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card p-8 space-y-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Choose a strong password with at least 8 characters.
              </p>
              {[
                { label: 'Current Password', key: 'currentPassword', placeholder: 'Enter current password' },
                { label: 'New Password',     key: 'newPassword',     placeholder: 'At least 8 characters'  },
                { label: 'Confirm Password', key: 'confirmPassword', placeholder: 'Repeat new password'    },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {f.label}
                  </label>
                  <input type="password" className={inp} placeholder={f.placeholder}
                    value={passwords[f.key]}
                    onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <Button className="w-full flex items-center justify-center gap-2 mt-2"
                onClick={handlePasswordChange} loading={pwSaving}>
                <Lock size={15} /> Change Password
              </Button>
            </motion.div>
          )}

          {/* ── Delete Account Tab ── */}
          {activeTab === 'Delete Account' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card p-8 space-y-5 border border-red-500/30">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10">
                <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-red-500">Delete Account</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    This will permanently delete your account, all registrations, tickets, and data.
                    This action <strong>cannot be undone</strong>.
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Type your email <span className="font-mono text-red-400">{user?.email}</span> to confirm
                </label>
                <input className={inp} type="email" placeholder={user?.email}
                  value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} />
              </div>
              <button onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== user?.email}
                className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2
                  bg-red-500 text-white hover:bg-red-600 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed">
                {deleting ? 'Deleting…' : <><Trash2 size={15}/> Delete My Account</>}
              </button>
            </motion.div>
          )}

        </motion.div>
      </div>
      <Footer />
    </div>
  );
}