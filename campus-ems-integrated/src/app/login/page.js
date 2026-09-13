'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Zap, Mail, Lock } from 'lucide-react';
import { loginSchema } from '@/lib/validators';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema) });

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const role = user.role;
      if (role === 'ADMIN')     router.replace('/admin');
      else if (role === 'ORGANIZER') router.replace('/organizer');
      else router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const onSubmit = async (data) => {
    try {
      const userData = await login(data);
      if (userData.role === 'ADMIN')          router.push('/admin');
      else if (userData.role === 'ORGANIZER') router.push('/organizer');
      else                                     router.push('/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)' }}>
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <motion.div key={i} animate={{ y: [0,-20,0], opacity:[0.3,0.6,0.3] }}
              transition={{ duration: 4+i, repeat:Infinity, delay: i*0.8 }}
              className="absolute rounded-full blur-2xl"
              style={{ width:150+i*50, height:150+i*50, background: i%2===0?'rgba(99,102,241,0.3)':'rgba(244,63,94,0.2)', top:`${15+i*18}%`, left:`${8+i*14}%` }} />
          ))}
        </div>
        <div className="relative text-center text-white p-10 max-w-md">
          <motion.div initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}>
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6">
              <Zap size={30} className="text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-3">CampusEvents</h2>
            <p className="text-indigo-200 leading-relaxed">Your one-stop platform for discovering and experiencing unforgettable campus events.</p>
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[['1,200+','Events'],['84K+','Students'],['98%','Satisfaction']].map(([v,l])=>(
                <div key={l} className="glass rounded-2xl p-4 text-center">
                  <p className="text-2xl font-display font-bold">{v}</p>
                  <p className="text-xs text-indigo-200 mt-1">{l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center"><Zap size={18} className="text-white" /></div>
            <span className="font-display font-bold text-xl gradient-text">CampusEvents</span>
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2" style={{ color:'var(--text-primary)' }}>Welcome back 👋</h1>
            <p className="text-sm" style={{ color:'var(--text-muted)' }}>Sign in to access your events and tickets</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Email Address" type="email" placeholder="you@campus.edu" icon={<Mail size={16}/>}
              error={errors.email?.message} {...register('email')} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color:'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass?'text':'password'} placeholder="••••••••" className="input-field pl-10 pr-10"
                  {...register('password')} />
                <button type="button" onClick={()=>setShowPass(v=>!v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">⚠ {errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-brand-500" />
                <span style={{ color:'var(--text-secondary)' }}>Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-brand-500 hover:underline font-medium">Forgot password?</Link>
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">Sign In</Button>
          </form>

        

          <p className="text-center text-sm" style={{ color:'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-500 font-semibold hover:underline">Sign up free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
