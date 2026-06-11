'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

export default function RolePieChart({ data, loading }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const total = data?.reduce((s, d) => s + d.value, 0) || 0;

  return (
    <div className="pie-wrap">
      <div className="pie-glass">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart tabIndex={-1} style={{ outline: 'none' }}>
            <Pie
              data={data || []}
              cx="50%" cy="50%"
              innerRadius={55}
              outerRadius={activeIndex >= 0 ? 96 : 90}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              animationDuration={300}
              animationEasing="ease-out"
              tabIndex={-1}
              style={{ outline: 'none' }}
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              {data?.map((entry, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={activeIndex >= 0 && i !== activeIndex ? 0.55 : 1}
                  stroke="none"
                  style={{ outline: 'none', cursor: 'pointer', transition: 'fill-opacity 0.25s ease' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pie-center">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">
            {activeIndex >= 0 && data[activeIndex] ? data[activeIndex].name : 'Total Users'}
          </p>
          <p className="text-xl font-black text-white">
            {activeIndex >= 0 && data[activeIndex] ? data[activeIndex].value : total}
          </p>
          <p className="text-[8px] font-bold text-slate-400">
            {activeIndex >= 0 && data[activeIndex] ? `${((data[activeIndex].value / total) * 100).toFixed(1)}%` : 'users'}
          </p>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-[20px]">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500/30 border-t-blue-400 animate-spin" />
        </div>
      )}

      <style>{`
        .pie-wrap { position: relative; min-height: 260px; }
        .pie-wrap *, .pie-wrap *::before, .pie-wrap *::after { outline: none !important; }
        .pie-wrap svg, .pie-wrap .recharts-wrapper, .pie-wrap .recharts-surface { outline: none !important; }
        .pie-glass {
          border-radius: 20px; padding: 16px; position: relative;
          background: linear-gradient(135deg, rgba(15,23,42,0.6), rgba(15,23,42,0.25));
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .pie-center {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          text-align: center; pointer-events: none; z-index: 10;
        }
        @media (max-width: 639px) { .pie-glass { border-radius: 16px; padding: 12px; } }
      `}</style>
    </div>
  );
}
