'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Zap } from 'lucide-react';
import { forgotPasswordSchema } from '@/lib/validators';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async () => {
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    toast.success('Reset email sent!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center"><Zap size={18} className="text-white" /></div>
          <span className="font-display font-bold text-xl gradient-text">CampusEvents</span>
        </div>

        <div className="card p-8">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-4">📬</div>
              <h2 className="text-2xl font-display font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Check your inbox</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>We've sent a password reset link to <strong>{getValues('email')}</strong>. Check your spam folder if you don't see it.</p>
              <Link href="/login"><Button className="w-full">Back to Login</Button></Link>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Forgot Password? 🔐</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Email Address" type="email" placeholder="you@campus.edu" icon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
                <Button type="submit" loading={isSubmitting} className="w-full" size="lg">Send Reset Link</Button>
              </form>
            </>
          )}
          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'var(--border)' }}>
            <Link href="/login" className="text-sm text-brand-500 hover:underline font-medium flex items-center justify-center gap-1">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
