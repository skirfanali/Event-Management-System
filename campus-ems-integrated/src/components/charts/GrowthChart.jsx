'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ✅ FIX: Was fully hardcoded static data — now accepts real data prop.
// data shape: [ { month: 'Jan', users: 420, events: 12 }, … ]
export default function GrowthChart({ data = [] }) {
  if (!data.length) return (
    <div className="h-[220px] flex items-center justify-center">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No growth data yet</p>
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={false} tickLine={false}
        />
        <Tooltip contentStyle={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          fontSize: '12px',
        }} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line type="monotone" dataKey="users"  stroke="#6366f1" strokeWidth={2.5} dot={false} name="Users"  />
        <Line type="monotone" dataKey="events" stroke="#f43f5e" strokeWidth={2.5} dot={false} name="Events" />
      </LineChart>
    </ResponsiveContainer>
  );
}