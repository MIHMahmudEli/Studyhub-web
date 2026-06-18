'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SERIES = [
  { key: 'web', label: 'Web', color: '#3b82f6' },
  { key: 'android', label: 'Android', color: '#22c55e' },
  { key: 'ios', label: 'iOS', color: '#a78bfa' },
];

function formatLabel(ts, rangeHours) {
  const d = new Date(ts);
  if (rangeHours <= 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function PresenceHistoryChart({ data, rangeHours = 24 }) {
  const chartData = (data || []).map((d) => ({
    t: formatLabel(d.captured_at, rangeHours),
    web: d.web,
    android: d.android,
    ios: d.ios,
    total: d.total,
  }));

  if (!chartData.length) {
    return (
      <p className="text-sm text-[var(--text-3)] py-12 text-center">
        No history yet — online counts are captured every 10 minutes.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          {SERIES.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.03} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="t" tick={{ fontSize: 11, fill: 'var(--text-3)' }} tickLine={false} axisLine={false} minTickGap={28} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-3)' }} tickLine={false} axisLine={false} width={34} />
        <Tooltip
          contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: 'var(--text-2)', fontWeight: 700 }}
          itemStyle={{ padding: 0 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
        {SERIES.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stackId="1"
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
            animationDuration={300}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
