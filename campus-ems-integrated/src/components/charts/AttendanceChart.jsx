'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ✅ FIX: Accept data prop — old component had no data prop so chart was always blank
export default function AttendanceChart({ data = [] }) {
  if (!data.length) return (
    <div className="h-[220px] flex items-center justify-center">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No attendance data yet</p>
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="event" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="registered" fill="#6366f1" radius={[4,4,0,0]} name="Registered" />
        <Bar dataKey="attended"   fill="#22c55e" radius={[4,4,0,0]} name="Attended"   />
      </BarChart>
    </ResponsiveContainer>
  );
}