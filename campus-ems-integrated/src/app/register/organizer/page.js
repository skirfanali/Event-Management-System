'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, User, Mail, Lock, Building, Briefcase, Phone, FileText, ArrowLeft, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { organizerRequestService } from '@/services/organizerRequestService';
import toast from 'react-hot-toast';

export default function OrganizerRegisterPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', organization: '', designation: '', reason: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())            e.name         = 'Name is required';
    if (!form.email.trim())           e.email        = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email   = 'Invalid email';
    if (form.password.length < 8)     e.password     = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (form.reason.trim().length < 20) e.reason     = 'Please provide at least 20 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await organizerRequestService.submit({
        name:         form.name,
        email:        form.email,
        password:     form.password,
        phone:        form.phone,
        organization: form.organization,
        designation:  form.designation,
        reason:       form.reason,
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.message || 'Failed to submit request');
    } finally {
      setSaving(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--bg-primary)' }}>
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
          className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500
            flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-3" style={{ color:'var(--text-primary)' }}>
            Request Submitted! 🎉
          </h1>
          <p className="text-sm mb-2" style={{ color:'var(--text-muted)' }}>
            Your organizer request has been sent to the admin team.
          </p>
          <p className="text-sm mb-8" style={{ color:'var(--text-muted)' }}>
            You'll receive an email at <strong>{form.email}</strong> once your request is reviewed
            (usually within 24–48 hours).
          </p>
          <Link href="/login">
            <Button size="lg" className="w-full">Go to Login</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const inp = "input-field w-full";

  return (
    <div className="min-h-screen" style={{ background:'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-16">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>

          {/* Header */}
          <Link href="/register" className="flex items-center gap-2 text-sm mb-6 hover:text-brand-500 transition-colors"
            style={{ color:'var(--text-muted)' }}>
            <ArrowLeft size={16} /> Back to Register
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold" style={{ color:'var(--text-primary)' }}>
              Organizer Application
            </h1>
          </div>
          <p className="text-sm mb-8 ml-13" style={{ color:'var(--text-muted)' }}>
            Tell us about yourself — our admin team will review and approve your account.
          </p>

          {/* Info banner */}
          <div className="p-4 rounded-2xl mb-6 border"
            style={{ background:'rgba(99,102,241,0.08)', borderColor:'rgba(99,102,241,0.25)' }}>
            <p className="text-xs font-semibold text-brand-500 mb-1">ℹ️ How it works</p>
            <p className="text-xs" style={{ color:'var(--text-muted)' }}>
              Submit your details → Admin reviews → You get an email → Login and start creating events.
              Approval usually takes 24–48 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-5">

            {/* Personal info */}
            <div>
              <h3 className="text-sm font-bold mb-4 pb-2 border-b"
                style={{ color:'var(--text-primary)', borderColor:'var(--border)' }}>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color:'var(--text-secondary)' }}>
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input className={`${inp} pl-10`} placeholder="Your full name"
                      value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1">⚠ {errors.name}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color:'var(--text-secondary)' }}>
                    Phone
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input className={`${inp} pl-10`} placeholder="+91 XXXXX XXXXX" type="tel"
                      value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium block mb-1.5" style={{ color:'var(--text-secondary)' }}>
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input className={`${inp} pl-10`} placeholder="you@campus.edu" type="email"
                      value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">⚠ {errors.email}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color:'var(--text-secondary)' }}>
                    Password *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input className={`${inp} pl-10`} placeholder="Min 8 characters" type="password"
                      value={form.password} onChange={e => set('password', e.target.value)} />
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">⚠ {errors.password}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color:'var(--text-secondary)' }}>
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input className={`${inp} pl-10`} placeholder="Repeat password" type="password"
                      value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">⚠ {errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Organization info */}
            <div>
              <h3 className="text-sm font-bold mb-4 pb-2 border-b"
                style={{ color:'var(--text-primary)', borderColor:'var(--border)' }}>
                Organization Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color:'var(--text-secondary)' }}>
                    Organization / Club / College
                  </label>
                  <div className="relative">
                    <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input className={`${inp} pl-10`} placeholder="e.g. IEEE MAKAUT, TechFest Club"
                      value={form.organization} onChange={e => set('organization', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color:'var(--text-secondary)' }}>
                    Your Role / Designation
                  </label>
                  <div className="relative">
                    <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input className={`${inp} pl-10`} placeholder="e.g. Event Head, Club President"
                      value={form.designation} onChange={e => set('designation', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <h3 className="text-sm font-bold mb-4 pb-2 border-b"
                style={{ color:'var(--text-primary)', borderColor:'var(--border)' }}>
                Why do you want to become an organizer? *
              </h3>
              <div className="relative">
                <FileText size={15} className="absolute left-3.5 top-3.5 text-gray-400"/>
                <textarea className={`${inp} pl-10 resize-none`} rows={4}
                  placeholder="Tell us about your events, what you plan to organize, and your experience..."
                  value={form.reason} onChange={e => set('reason', e.target.value)} />
              </div>
              <div className="flex justify-between mt-1">
                {errors.reason
                  ? <p className="text-xs text-red-500">⚠ {errors.reason}</p>
                  : <span />}
                <p className="text-xs" style={{ color:'var(--text-muted)' }}>
                  {form.reason.length}/1000
                </p>
              </div>
            </div>

            <Button type="submit" loading={saving} className="w-full" size="lg">
              📋 Submit Organizer Request
            </Button>

            <p className="text-center text-xs" style={{ color:'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link href="/login" className="text-brand-500 hover:underline">Sign in</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}