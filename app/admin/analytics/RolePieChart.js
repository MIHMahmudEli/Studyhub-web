'use client';

import { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];
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
  return (
    <path
      d={d}
      fill={fill}
      stroke="none"
      style={{ filter: `drop-shadow(0 0 10px ${fill}99)` }}
    />
  );
}

function CustomActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props;
  const midAngle = startAngle + (endAngle - startAngle) / 2;
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  const mx = cx + cos * 7;
  const my = cy + sin * 7;
  const ex = mx + cos * 24;
  const ey = my + sin * 24;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g tabIndex={-1} style={{ outline: 'none' }}>
      <ActiveArc {...{ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }} />
      <text x={ex} y={ey} dy={-9} textAnchor={textAnchor} fill="#f1f5f9" fontSize={11} fontWeight={800} style={{ pointerEvents: 'none', outline: 'none' }}>
        {payload.name}
      </text>
      <text x={ex} y={ey} dy={13} textAnchor={textAnchor} fill={fill} fontSize={10} fontWeight={700} style={{ pointerEvents: 'none', outline: 'none' }}>
        {value} users ({`${(percent * 100).toFixed(1)}%`})
      </text>
    </g>
  );
}

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const total = entry.payload?.total || 1;
  const pct = ((entry.value / total) * 100).toFixed(1);
  return (
    <div className="pie-glass-tooltip">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{entry.name}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-black text-white">{entry.value}</span>
        <span className="text-[9px] text-slate-400">users</span>
      </div>
      <div className="mt-1 h-1 w-full rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full duration-500" style={{ width: `${pct}%`, backgroundColor: entry.color, transition: 'width 0.5s ease' }} />
      </div>
      <span className="text-[10px] font-bold text-slate-400 mt-1 block">{pct}% of total</span>
    </div>
  );
}

export default function RolePieChart({ data, loading }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [animValue, setAnimValue] = useState(0);
  const total = data?.reduce((s, d) => s + d.value, 0) || 0;
  const activeItem = activeIndex >= 0 ? data[activeIndex] : null;

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
    setAnimValue(0);
    requestAnimationFrame(() => {
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 500, 1);
        setAnimValue(1 - Math.pow(1 - p, 3));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(-1);
    setAnimValue(0);
  }, []);

  const handleFocus = useCallback((e) => {
    if (e.target?.blur) e.target.blur();
  }, []);

  return (
    <div className="pie-root">
      {/* Stars */}
      <div className="pie-stars-layer">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="pie-star"
            style={{
              left: `${((i * 37 + 13) % 100)}%`,
              top: `${((i * 53 + 7) % 100)}%`,
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              animationDelay: `${(i * 0.4) % 4}s`,
              animationDuration: `${4 + (i % 5)}s`,
              opacity: 0.12 + (i % 4) * 0.04,
              transition: 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
        ))}
      </div>

      {/* Glass container */}
      <div className="pie-glass">
        <div className="pie-float">
          <div className="pie-scale" style={{ transform: activeIndex >= 0 ? 'scale(1.02)' : 'scale(1)' }}>
            <div className="pie-chart-area">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart
                  tabIndex={-1}
                  style={{ outline: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
                  onFocus={handleFocus}
                >
                  <defs>
                    {PIE_COLORS.map((c, i) => (
                      <filter key={i} id={`pg-${i}`}>
                        <feGaussianBlur stdDeviation="3.5" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    ))}
                  </defs>
                  <Pie
                    data={data || []}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                    activeIndex={activeIndex >= 0 ? activeIndex : undefined}
                    activeShape={CustomActiveShape}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    onClick={onPieEnter}
                    animationBegin={0}
                    animationDuration={600}
                    animationEasing="ease-out"
                    tabIndex={-1}
                    style={{ outline: 'none', userSelect: 'none' }}
                    isAnimationActive={!loading}
                  >
                    {data?.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                        fillOpacity={activeIndex >= 0 && i !== activeIndex ? 0.5 : 1}
                        stroke="none"
                        style={{
                          outline: 'none',
                          cursor: 'pointer',
                          filter: activeIndex === i ? `url(#pg-${i})` : 'none',
                          transition: 'fill-opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        }}
                        tabIndex={-1}
                        onFocus={handleFocus}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipContent />} cursor={false} contentStyle={{ background: 'transparent', border: 'none', borderRadius: 0, boxShadow: 'none' }} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center */}
              <div className="pie-center">
                {activeItem ? (
                  <div className="pie-center-inner">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{activeItem.name}</p>
                    <p className="text-xl font-black text-white">{activeItem.value}</p>
                    <p className="text-[9px] font-bold text-slate-400">users</p>
                    <div className="mt-1.5 h-0.5 w-8 rounded-full mx-auto" style={{ backgroundColor: PIE_COLORS[activeIndex % PIE_COLORS.length] }} />
                    <p className="text-[10px] font-black mt-1" style={{ color: PIE_COLORS[activeIndex % PIE_COLORS.length] }}>
                      {animValue > 0 ? `${((activeItem.value / total) * 100 * animValue).toFixed(0)}%` : '0%'}
                    </p>
                  </div>
                ) : (
                  <div className="pie-center-inner">
                    <p className="text-[10px] font-black text-slate-400">{total}</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Total Users</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 rounded-[20px] flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(4px)' }}>
          <div className="w-6 h-6 rounded-full border-2 border-blue-500/30 border-t-blue-400 animate-spin" />
        </div>
      )}

      <style>{`
        .pie-root {
          position: relative;
          min-height: 280px;
        }
        .pie-root *,
        .pie-root *::before,
        .pie-root *::after {
          outline: none !important;
          box-shadow: none !important;
        }
        .pie-root :focus,
        .pie-root :focus-visible,
        .pie-root :focus-within {
          outline: none !important;
          box-shadow: none !important;
        }
        .pie-root svg,
        .pie-root svg *,
        .pie-root .recharts-wrapper,
        .pie-root .recharts-surface,
        .pie-root .recharts-pie,
        .pie-root .recharts-layer,
        .pie-root .recharts-sector,
        .pie-root .recharts-tooltip-wrapper {
          outline: none !important;
          box-shadow: none !important;
        }
        @keyframes pieDrift {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-3px) translateX(1.5px); }
          67% { transform: translateY(-1.5px) translateX(-1.5px); }
        }
        @keyframes pieTwinkle {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.35; }
        }
        @keyframes pieFadeUp {
          from { opacity: 0; transform: translateY(7px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pie-float {
          animation: pieDrift 7s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }
        .pie-scale {
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .pie-glass {
          border-radius: 20px;
          padding: 20px 16px 12px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(15,23,42,0.65), rgba(15,23,42,0.3));
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 8px 32px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.05),
            0 0 50px rgba(59,130,246,0.04);
          transition: box-shadow 0.5s ease;
        }
        .pie-glass:hover {
          box-shadow:
            0 12px 48px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.08),
            0 0 70px rgba(59,130,246,0.07);
        }
        .pie-stars-layer {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .pie-star {
          position: absolute;
          border-radius: 50%;
          background: #94a3b8;
          animation: pieTwinkle 3.5s ease-in-out infinite;
          pointer-events: none;
        }
        .pie-chart-area {
          position: relative;
          min-height: 260px;
        }
        .pie-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
          z-index: 10;
        }
        .pie-center-inner {
          animation: pieFadeUp 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        .pie-glass-tooltip {
          background: rgba(15,23,42,0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 10px 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.45);
          animation: pieFadeUp 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        @media (max-width: 639px) {
          .pie-glass { border-radius: 16px; padding: 16px 12px 8px; }
        }
      `}</style>
    </div>
  );
}
