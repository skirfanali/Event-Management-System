'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Zap, User, Mail, Lock, Check, ArrowRight } from 'lucide-react';
import { registerSchema } from '@/lib/validators';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema), defaultValues: { role: 'USER' }
  });
  const role = watch('role');

  const onSubmit = async (data) => {
    // Organizer flow is handled separately — button below redirects directly
    if (data.role === 'ORGANIZER') {
      router.push('/register/organizer');
      return;
    }
    try {
      await registerUser({
        name:     data.name,
        email:    data.email,
        password: data.password,
        role:     data.role,
      });
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      toast.error(err?.message || 'Registration failed. Please try again.');
    }
  };

  const perks = [
    'Free event registrations',
    'QR ticket downloads',
    'Participation certificates',
    'Event wishlist & reminders',
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)' }}>
        <div className="relative text-white p-10 max-w-md">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-6">
              <Zap size={30} className="text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-3">Join the Community</h2>
            <p className="text-indigo-200 leading-relaxed mb-8">
              Create your free account and unlock access to hundreds of campus events.
            </p>
            <div className="space-y-4">
              {perks.map((p, i) => (
                <motion.div key={p} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check size={13} className="text-green-400" />
                  </div>
                  <span className="text-indigo-100 text-sm">{p}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md py-8">

          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-display font-bold gradient-text">CampusEvents</span>
            </Link>
            <h1 className="text-3xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Create Account 🚀
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Join thousands of students on CampusEvents
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'USER',      label: 'Student',   icon: '🎓', desc: 'Browse & attend events'  },
              { value: 'ORGANIZER', label: 'Organizer', icon: '🎪', desc: 'Create & manage events'  },
            ].map(r => (
              <label key={r.value} className="relative cursor-pointer p-4 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: role === r.value ? '#6366f1' : 'var(--border)',
                  background:  role === r.value ? 'rgba(99,102,241,0.08)' : 'var(--bg-tertiary)',
                }}>
                <input type="radio" value={r.value} {...register('role')} className="sr-only" />
                <div className="text-2xl mb-2">{r.icon}</div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{r.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.desc}</p>
                {role === r.value && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full gradient-bg flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </label>
            ))}
          </div>

          {/* ✅ FIX: Show completely different UI based on role */}
          <AnimatePresence mode="wait">

            {/* ── ORGANIZER selected: no form fields, just redirect button ── */}
            {role === 'ORGANIZER' && (
              <motion.div key="organizer"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} className="space-y-4">

                <div className="p-5 rounded-2xl border space-y-3"
                  style={{ background: 'rgba(99,102,241,0.07)', borderColor: 'rgba(99,102,241,0.25)' }}>
                  <p className="text-sm font-bold text-brand-500">📋 Approval Required</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Organizer accounts require admin approval before you can create events.
                  </p>
                  <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {[
                      '1. Fill in your organizer application',
                      '2. Admin reviews your request (24–48 hrs)',
                      '3. Get approved → login and start creating events',
                    ].map(s => (
                      <li key={s} className="flex items-center gap-2">
                        <Check size={11} className="text-green-500 flex-shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Single button — takes them to the full organizer application form */}
                <Button size="lg" className="w-full flex items-center justify-center gap-2"
                  onClick={() => router.push('/register/organizer')}>
                  Continue to Application <ArrowRight size={16} />
                </Button>

                <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <Link href="/login" className="text-brand-500 font-semibold hover:underline">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* ── STUDENT selected: full registration form ── */}
            {role === 'USER' && (
              <motion.div key="student"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input label="Full Name" placeholder="Your full name" icon={<User size={16} />}
                    error={errors.name?.message} {...register('name')} />
                  <Input label="Email Address" type="email" placeholder="you@campus.edu"
                    icon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showPass ? 'text' : 'password'}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        className="input-field pl-10 pr-10" {...register('password')} />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500">⚠ {errors.password.message}</p>}
                  </div>
                  <Input label="Confirm Password" type="password" placeholder="Repeat password"
                    icon={<Lock size={16} />} error={errors.confirmPassword?.message}
                    {...register('confirmPassword')} />
                  <label className="flex items-start gap-2 cursor-pointer mt-2">
                    <input type="checkbox" required className="mt-0.5 accent-brand-500" />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      I agree to the{' '}
                      <Link href="#" className="text-brand-500 hover:underline">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="#" className="text-brand-500 hover:underline">Privacy Policy</Link>
                    </span>
                  </label>
                  <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                    Create Free Account
                  </Button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <Link href="/login" className="text-brand-500 font-semibold hover:underline">Sign in</Link>
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}