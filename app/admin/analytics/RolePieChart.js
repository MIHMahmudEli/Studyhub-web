'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];
const RADIAN = Math.PI / 180;

function polarToCartesian(cx, cy, r, angle) {
  return { x: cx + r * Math.cos(-angle * RADIAN), y: cy + r * Math.sin(-angle * RADIAN) };
}

function describeArc(cx, cy, ir, or, sa, ea) {
  const s1 = polarToCartesian(cx, cy, ir, ea);
  const s2 = polarToCartesian(cx, cy, ir, sa);
  const e1 = polarToCartesian(cx, cy, or, ea);
  const e2 = polarToCartesian(cx, cy, or, sa);
  const large = ea - sa > 180 ? 1 : 0;
  return `M${s1.x},${s1.y}A${ir},${ir} 0 ${large} 0 ${s2.x},${s2.y}L${e2.x},${e2.y}A${or},${or} 0 ${large} 1 ${e1.x},${e1.y}Z`;
}

function ActiveArc({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }) {
  const d = describeArc(cx, cy, innerRadius + 1, outerRadius + 8, startAngle, endAngle);
  return <path d={d} fill={fill} stroke="none" style={{ filter: `drop-shadow(0 0 10px ${fill}80)` }} />;
}

function CustomActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props;
  const mid = startAngle + (endAngle - startAngle) / 2;
  const sin = Math.sin(-mid * RADIAN);
  const cos = Math.cos(-mid * RADIAN);
  const mx = cx + cos * 7;
  const my = cy + sin * 7;
  const ex = mx + cos * 24;
  const ey = my + sin * 24;
  const anchor = cos >= 0 ? 'start' : 'end';
  return (
    <g style={{ outline: 'none' }}>
      <ActiveArc {...{ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }} />
      <text x={ex} y={ey} dy={-9} textAnchor={anchor} fill="#f1f5f9" fontSize={11} fontWeight={800} style={{ pointerEvents: 'none' }}>{payload.name}</text>
      <text x={ex} y={ey} dy={13} textAnchor={anchor} fill={fill} fontSize={10} fontWeight={700} style={{ pointerEvents: 'none' }}>{value} users ({`${(percent * 100).toFixed(1)}%`})</text>
    </g>
  );
}

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const total = entry.payload?.total || 1;
  const pct = ((entry.value / total) * 100).toFixed(1);
  return (
    <div className="pie-tooltip">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{entry.name}</span>
      </div>
      <div className="text-sm font-black text-white">{entry.value} <span className="text-[9px] font-bold text-slate-400">users</span></div>
      <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">{pct}% of total</span>
    </div>
  );
}

export default function RolePieChart({ data, loading }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  return (
    <div className="pie-wrap">
      <div className="pie-glass">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart tabIndex={-1} style={{ outline: 'none' }}>
            <Pie
              data={data || []}
              cx="50%" cy="50%"
              innerRadius={55} outerRadius={90}
              paddingAngle={3} dataKey="value"
              strokeWidth={0}
              activeIndex={activeIndex >= 0 ? activeIndex : undefined}
              activeShape={CustomActiveShape}
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(-1)}
              onClick={(_, i) => setActiveIndex(i)}
              animationDuration={500}
              animationEasing="ease-out"
              tabIndex={-1}
              style={{ outline: 'none' }}
            >
              {data?.map((entry, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={activeIndex >= 0 && i !== activeIndex ? 0.5 : 1}
                  stroke="none"
                  style={{ outline: 'none', cursor: 'pointer', transition: 'fill-opacity 0.35s ease' }}
                />
              ))}
            </Pie>
            <Tooltip content={<TooltipContent />} cursor={false} contentStyle={{ background: 'transparent', border: 'none' }} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pie-center">
          {activeIndex >= 0 ? (
            <div className="pie-center-inner">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{data[activeIndex]?.name}</p>
              <p className="text-xl font-black text-white">{data[activeIndex]?.value}</p>
              <p className="text-[9px] font-bold text-slate-400">users</p>
            </div>
          ) : (
            <div className="pie-center-inner">
              <p className="text-[11px] font-black text-slate-400">{data?.reduce((s, d) => s + d.value, 0) || 0}</p>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Total Users</p>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-[20px]">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500/30 border-t-blue-400 animate-spin" />
        </div>
      )}

      <style>{`
        .pie-wrap { position: relative; min-height: 260px; }
        .pie-wrap *, .pie-wrap *::before, .pie-wrap *::after { outline: none !important; box-shadow: none !important; }
        .pie-wrap svg, .pie-wrap svg *, .pie-wrap .recharts-wrapper, .pie-wrap .recharts-surface { outline: none !important; }
        .pie-glass {
          border-radius: 20px; padding: 16px; position: relative;
          background: linear-gradient(135deg, rgba(15,23,42,0.6), rgba(15,23,42,0.25));
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
          transition: box-shadow 0.4s ease;
        }
        .pie-glass:hover { box-shadow: 0 12px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08); }
        .pie-center {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          text-align: center; pointer-events: none; z-index: 10;
        }
        .pie-center-inner { animation: pieFade 0.3s ease both; }
        .pie-tooltip {
          background: rgba(15,23,42,0.88); backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 14px;
          padding: 10px 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.45);
          animation: pieFade 0.25s ease both;
        }
        @keyframes pieFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 639px) { .pie-glass { border-radius: 16px; padding: 12px; } }
      `}</style>
    </div>
  );
}
