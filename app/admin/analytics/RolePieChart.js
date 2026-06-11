'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

const RADIAN = Math.PI / 180;

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) {
  const radius = innerRadius + (outerRadius - innerRadius) * 1.35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="rgba(148,163,184,0.8)"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={9}
      fontWeight={700}
      letterSpacing="0.05em"
      style={{ pointerEvents: 'none' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function CustomActiveShape({
  cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
  fill, payload, percent, value,
}) {
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  const mx = cx + cos * 7;
  const my = cy + sin * 7;
  const ex = mx + cos * 22;
  const ey = my + sin * 22;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={ex} y={ey} dy={-8} textAnchor={textAnchor} fill="#e2e8f0" fontSize={11} fontWeight={800}>
        {payload.name}
      </text>
      <text x={ex} y={ey} dy={12} textAnchor={textAnchor} fill={fill} fontSize={10} fontWeight={700}>
        {value} users ({`${(percent * 100).toFixed(1)}%`})
      </text>
      <Pie
        cx={cx} cy={cy}
        innerRadius={innerRadius + 1}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        data={[{ value: 1 }]}
        dataKey="value"
        stroke="none"
        style={{ filter: `drop-shadow(0 0 8px ${fill}80)` }}
      >
        <Cell fill={fill} fillOpacity={1} />
      </Pie>
    </g>
  );
}

function CustomTooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const total = entry.payload?.total || 1;
  const pct = ((entry.value / total) * 100).toFixed(1);
  return (
    <div className="glass-tooltip">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{entry.name}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-black text-white">{entry.value}</span>
        <span className="text-[9px] text-slate-400">users</span>
      </div>
      <div className="mt-1 h-1 w-full rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: entry.color }} />
      </div>
      <span className="text-[10px] font-bold text-slate-400 mt-1 block">{pct}% of total</span>
    </div>
  );
}

function getCSSVar(name) {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function RolePieChart({ data, loading }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [animValue, setAnimValue] = useState(0);
  const containerRef = useRef(null);
  const [bgColor, setBgColor] = useState('rgba(15,23,42,0.6)');
  const [borderColor, setBorderColor] = useState('rgba(255,255,255,0.06)');

  useEffect(() => {
    setBgColor(getCSSVar('--card-bg') || 'rgba(15,23,42,0.6)');
    setBorderColor(getCSSVar('--card-border') || 'rgba(255,255,255,0.06)');
  }, []);

  const total = data?.reduce((s, d) => s + d.value, 0) || 0;
  const activeItem = activeIndex >= 0 ? data[activeIndex] : null;

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
    setAnimValue(0);
    requestAnimationFrame(() => {
      let start = null;
      const duration = 500;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimValue(eased);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(-1);
    setAnimValue(0);
  }, []);

  return (
    <div className="relative">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" ref={containerRef}>
        <div className="stars-layer">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="star-particle"
              style={{
                left: `${((i * 37 + 13) % 100)}%`,
                top: `${((i * 53 + 7) % 100)}%`,
                width: `${1 + (i % 3)}px`,
                height: `${1 + (i % 3)}px`,
                animationDelay: `${(i * 0.4) % 4}s`,
                animationDuration: `${4 + (i % 5)}s`,
                opacity: 0.15 + (i % 4) * 0.05,
                transform: activeIndex >= 0 ? `translate(${(activeIndex - i % 5) * 0.3}px, ${(activeIndex - i % 4) * 0.2}px)` : 'translate(0,0)',
                transition: 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Chart container with glassmorphism */}
      <div
        className="chart-glass-container"
        style={{
          background: `linear-gradient(135deg, ${bgColor}, ${bgColor.replace('0.6', '0.3')})`,
          border: `1px solid ${borderColor}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="chart-float-wrapper">
          <div className="chart-scale-wrapper" style={{ transform: activeIndex >= 0 ? 'scale(1.02)' : 'scale(1)' }}>
            <div className="relative" style={{ minHeight: 260 }}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart
                  tabIndex={-1}
                  style={{ outline: 'none', userSelect: 'none' }}
                >
                  <defs>
                    {PIE_COLORS.map((color, i) => (
                      <filter key={i} id={`glow-${i}`}>
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    ))}
                  </defs>
                  <Pie
                    data={data || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
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
                  >
                    {data?.map((entry, i) => {
                      const isDimmed = activeIndex >= 0 && i !== activeIndex;
                      return (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                          fillOpacity={isDimmed ? 0.5 : 1}
                          stroke="transparent"
                          style={{
                            outline: 'none',
                            cursor: 'pointer',
                            transition: 'fill-opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            filter: activeIndex === i ? `url(#glow-${i})` : 'none',
                          }}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltipContent />} cursor={false} contentStyle={{ background: 'transparent', border: 'none', borderRadius: 0, boxShadow: 'none' }} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center content */}
              <div className="chart-center-content">
                {activeItem ? (
                  <div className="center-info-fade">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{activeItem.name}</p>
                    <p className="text-xl font-black text-white">{activeItem.value}</p>
                    <p className="text-[9px] font-bold text-slate-400">users</p>
                    <div className="mt-1.5 h-0.5 w-8 rounded-full mx-auto" style={{ backgroundColor: PIE_COLORS[activeIndex % PIE_COLORS.length] }} />
                    <p className="text-[10px] font-black mt-1" style={{ color: PIE_COLORS[activeIndex % PIE_COLORS.length] }}>
                      {animValue > 0 ? `${((activeItem.value / total) * 100 * animValue).toFixed(0)}%` : '0%'}
                    </p>
                  </div>
                ) : (
                  <div className="center-info-fade">
                    <p className="text-[10px] font-black text-slate-400">{total}</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Total Users</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-drift {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-4px) translateX(2px); }
          50% { transform: translateY(-2px) translateX(-2px); }
          75% { transform: translateY(-5px) translateX(1px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chart-float-wrapper {
          animation: float-drift 7s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }
        .chart-scale-wrapper {
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .chart-glass-container {
          border-radius: 20px;
          padding: 20px 16px 12px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.05),
            0 0 40px rgba(59,130,246,0.05);
          transition: box-shadow 0.5s ease;
        }
        .chart-glass-container:hover {
          box-shadow:
            0 12px 48px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.08),
            0 0 60px rgba(59,130,246,0.08);
        }
        .star-particle {
          position: absolute;
          border-radius: 50%;
          background: #94a3b8;
          animation: twinkle 3s ease-in-out infinite;
          pointer-events: none;
        }
        .stars-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .chart-center-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
          z-index: 10;
        }
        .center-info-fade {
          animation: fadeSlideUp 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        .glass-tooltip {
          background: rgba(15,23,42,0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 10px 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          animation: fadeSlideUp 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        @media (max-width: 639px) {
          .chart-glass-container {
            border-radius: 16px;
            padding: 16px 12px 8px;
          }
        }
      `}</style>
    </div>
  );
}
