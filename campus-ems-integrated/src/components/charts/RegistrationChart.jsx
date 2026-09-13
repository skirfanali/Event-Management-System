'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ✅ FIX: Accept data prop — was rendering empty chart with no data
export default function RegistrationChart({ data = [] }) {
  if (!data.length) return (
    <div className="h-[220px] flex items-center justify-center">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No registration data yet</p>
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
        <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Registrations" />
      </BarChart>
    </ResponsiveContainer>
  );
}