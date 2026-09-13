'use client';
import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-auto transform transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'} p-4 h-full`}>
        <AdminSidebar onClose={()=>setSidebarOpen(false)}/>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardHeader user={user} onMenuClick={()=>setSidebarOpen(true)} title="System Settings"/>
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="max-w-2xl space-y-6">
          <div className="card p-6">
            <h3 className="font-display font-bold text-base mb-4" style={{ color:'var(--text-primary)' }}>Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color:'var(--text-primary)' }}>Dark Mode</p>
                <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>Toggle between light and dark theme</p>
              </div>
              <ThemeToggle/>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-display font-bold text-base mb-4" style={{ color:'var(--text-primary)' }}>Admin Info</h3>
            <div className="space-y-3">
              {[['Name',user?.name],['Email',user?.email],['Role',user?.role]].map(([k,v])=>(
                <div key={k} className="flex justify-between py-2 border-b text-sm" style={{ borderColor:'var(--border)' }}>
                  <span style={{ color:'var(--text-muted)' }}>{k}</span>
                  <span className="font-semibold" style={{ color:'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-display font-bold text-base mb-4" style={{ color:'var(--text-primary)' }}>API Configuration</h3>
            <div className="p-3 rounded-xl" style={{ background:'var(--bg-tertiary)' }}>
              <p className="text-xs font-mono" style={{ color:'var(--text-muted)' }}>
                API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
