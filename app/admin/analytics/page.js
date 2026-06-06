'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Toast from '@/components/ui/Toast';
import { apiRequest } from '@/lib/api';
import {
  BarChart3, Users, FileText, MessageSquare, BookOpen, Shield,
  TrendingUp, Activity, UserPlus, Download,
  AlertCircle, FileDown, Loader2, Star, CheckCircle2, Clock, Zap
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend
} from 'recharts';

const FILTERS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: 'year', label: 'Year' },
];

const COLORS = {
  emerald: '#10b981',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  cyan: '#06b6d4',
  indigo: '#6366f1',
  orange: '#f97316',
};

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  if (m >= 1 && m <= 12) return `${MONTHS[m - 1]} ${d}`;
  return dateStr;
};

const formatHourLabel = (hourStr) => {
  const h = parseInt(hourStr, 10);
  if (isNaN(h)) return hourStr;
  if (h === 0) return '12AM';
  if (h < 12) return `${h}AM`;
  if (h === 12) return '12PM';
  return `${h - 12}PM`;
};

// ─── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-white/[0.04] rounded-xl ${className}`} />
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────
function KpiCard({ title, value, subtitle, icon: Icon, color, loading }) {
  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-7 h-[130px] sm:h-[150px] animate-pulse" />
    );
  }
  return (
    <div
      className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-7 shadow-sm transition-all duration-500 hover:-translate-y-1 overflow-hidden"
      style={{ '--accent': color }}
    >
      {/* hover glow overlay */}
      <div
        className="absolute inset-0 rounded-[1.75rem] sm:rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 30%, ${color}12, transparent 70%)` }}
      />
      {/* top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-[1.5px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
      />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="space-y-2 flex-1 min-w-0">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</span>
          <p className="text-2xl sm:text-3xl font-black tracking-tight leading-none" style={{ color }}>{value}</p>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{subtitle}</p>
        </div>
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, color }}
        >
          <Icon size={18} className="sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
}

// ─── Chart Card ────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, badge, children, className = '' }) {
  return (
    <div className={`group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-7 shadow-sm transition-all duration-500 hover:border-[var(--border-h)] ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {badge && (
              <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{ color: badge.color, backgroundColor: `${badge.color}12`, borderColor: `${badge.color}25` }}>
                {badge.label}
              </span>
            )}
          </div>
          <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[var(--foreground)]">{title}</h3>
          {subtitle && <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, hideLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--card-bg)]/90 border border-[var(--card-border)] rounded-2xl p-3 shadow-2xl backdrop-blur-xl">
      {!hideLabel && <p className="text-[8px] font-black uppercase tracking-widest mb-2 text-slate-500">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: entry.color }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-black">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────
function SectionHeader({ label, title, color = COLORS.blue }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-6 rounded-full shrink-0" style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }} />
      <div>
        <p className="text-[8px] font-black uppercase tracking-[0.25em]" style={{ color }}>{label}</p>
        <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-[var(--foreground)]">{title}</h2>
      </div>
    </div>
  );
}

// ─── Rank Badge ────────────────────────────────────────────────────────────
function RankBadge({ rank }) {
  const styles = {
    1: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    2: 'bg-slate-400/10 text-slate-400 border-slate-400/25',
    3: 'bg-orange-600/10 text-orange-500 border-orange-500/25',
  };
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[9px] font-black border shrink-0 ${styles[rank] || 'bg-white/[0.03] text-slate-500 border-white/[0.06]'}`}>
      {rank}
    </span>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });

  const dashboardRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const [overview, setOverview] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [activityAnalytics, setActivityAnalytics] = useState(null);
  const [contentAnalytics, setContentAnalytics] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isClosing: true }));
      setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
    }, 5000);
  };

  const exportPDF = useCallback(async () => {
    const { toPng } = await import('html-to-image');
    const { jsPDF } = await import('jspdf');
    setExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pw - 2 * margin;
      const filterLabel = FILTERS.find(f => f.key === filter)?.label || '30 Days';
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      pdf.setFillColor(18, 24, 38);
      pdf.rect(0, 0, pw, ph, 'F');
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, ph * 0.38, pw, 4, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.text('StudyHub', margin, ph * 0.28);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Platform Analytics Report', margin, ph * 0.33);
      pdf.setFontSize(11);
      pdf.setTextColor(148, 163, 184);
      [
        `Date Range: ${filterLabel}`,
        `Generated: ${dateStr} at ${timeStr}`,
        `Report Period: ${overview?.reportPeriod || 'N/A'}`,
      ].forEach((d, i) => pdf.text(d, margin, ph * 0.46 + i * 7));

      if (overview) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        const stats = [
          ['Total Users', overview.totalUsers.toLocaleString()],
          ['Active Users', overview.activeUsers.toLocaleString()],
          ['New Users', overview.newUsers.toLocaleString()],
          ['Total Notes', overview.totalNotes.toLocaleString()],
          ['Resources', overview.totalResources.toLocaleString()],
          ['Reviews', overview.totalReviews.toLocaleString()],
        ];
        const cols = 3, cellW = contentWidth / cols;
        let sx = margin, sy = ph * 0.58;
        stats.forEach((s, i) => {
          const col = i % cols, row = Math.floor(i / cols);
          pdf.setFillColor(30, 41, 59);
          pdf.roundedRect(sx + col * cellW + 2, sy + row * 16, cellW - 4, 13, 2, 2, 'F');
          pdf.setFontSize(7); pdf.setTextColor(148, 163, 184);
          pdf.text(s[0], sx + col * cellW + 5, sy + row * 16 + 5);
          pdf.setFontSize(10); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(255, 255, 255);
          pdf.text(s[1], sx + col * cellW + 5, sy + row * 16 + 13);
          pdf.setFont('helvetica', 'normal');
        });
      }
      pdf.addPage();

      const el = dashboardRef.current;
      if (!el) { setExporting(false); return; }
      const sections = el.querySelectorAll('[data-pdf-section]');
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const label = section.getAttribute('data-pdf-label') || '';
        const dataUrl = await toPng(section, { pixelRatio: 2, backgroundColor: '#0f172a' });
        const imgW = contentWidth;
        const img = new Image();
        img.src = dataUrl;
        await img.decode();
        const imgH = (img.naturalHeight / img.naturalWidth) * imgW;
        pdf.setFontSize(11); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(59, 130, 246);
        const lines = pdf.splitTextToSize(label, contentWidth);
        const headerY = pdf.lastAutoPage || margin;
        pdf.text(lines, margin, headerY);
        pdf.lastAutoPage = headerY + 5;
        let yPos = (pdf.lastAutoPage || margin) + 2;
        if (yPos + imgH > ph - margin) { pdf.addPage(); yPos = margin + 2; }
        pdf.addImage(dataUrl, 'PNG', margin, yPos, imgW, imgH);
        pdf.lastAutoPage = yPos + imgH + 10;
      }
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        if (i === 1) continue;
        pdf.setFontSize(7); pdf.setTextColor(148, 163, 184); pdf.setFont('helvetica', 'normal');
        pdf.text(`StudyHub Analytics — ${filterLabel} — Page ${i - 1} of ${totalPages - 1}`, margin, ph - 8);
      }
      pdf.save(`StudyHub_Analytics_${filter}_${now.toISOString().slice(0, 10)}.pdf`);
      showToast('PDF exported successfully');
    } catch (err) {
      showToast('Failed to export PDF: ' + err.message, 'error');
    } finally {
      setExporting(false);
    }
  }, [filter, overview]);

  const fetchAnalytics = useCallback(async (f) => {
    setLoading(true); setError(null);
    try {
      const [ov, ua, aa, ca] = await Promise.all([
        apiRequest(`/admin/analytics/overview?filter=${f}`),
        apiRequest(`/admin/analytics/users?filter=${f}`),
        apiRequest(`/admin/analytics/activity?filter=${f}`),
        apiRequest(`/admin/analytics/content?filter=${f}`),
      ]);
      setOverview(ov); setUserAnalytics(ua); setActivityAnalytics(aa); setContentAnalytics(ca);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
      showToast(err.message || 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) router.push('/dashboard');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (tokenReady && user?.role === 'admin') fetchAnalytics(filter);
  }, [tokenReady, user, filter, fetchAnalytics]);

  if (authLoading || !user || user.role !== 'admin') return null;

  const overviewKpis = overview ? [
    { title: 'Total Users', value: overview.totalUsers.toLocaleString(), subtitle: 'Registered accounts', icon: Users, color: COLORS.blue },
    { title: 'Active Users', value: overview.activeUsers.toLocaleString(), subtitle: 'In selected period', icon: Activity, color: COLORS.emerald },
    { title: 'New Users', value: overview.newUsers.toLocaleString(), subtitle: 'In selected period', icon: UserPlus, color: COLORS.cyan },
    { title: 'Total Notes', value: overview.totalNotes.toLocaleString(), subtitle: 'Uploaded notes', icon: FileText, color: COLORS.purple },
    { title: 'Resources', value: overview.totalResources.toLocaleString(), subtitle: 'Library materials', icon: BookOpen, color: COLORS.amber },
    { title: 'Reviews', value: overview.totalReviews.toLocaleString(), subtitle: 'User reviews', icon: MessageSquare, color: COLORS.rose },
    { title: 'Moderators', value: overview.totalModerators.toLocaleString(), subtitle: 'Team members', icon: Shield, color: COLORS.indigo },
    { title: 'Banned', value: overview.totalBanned.toLocaleString(), subtitle: 'Suspended accounts', icon: AlertCircle, color: COLORS.orange },
  ] : [];

  const rolePieData = userAnalytics?.roleDistribution?.map(r => ({
    name: r.role.charAt(0).toUpperCase() + r.role.slice(1),
    value: parseInt(r.count, 10),
  })) || [];

  const deptBarData = userAnalytics?.deptDistribution?.slice(0, 8).map(d => ({
    name: d.dept && d.dept.length > 12 ? d.dept.slice(0, 12) + '…' : (d.dept || 'Unknown'),
    count: parseInt(d.count, 10),
  })) || [];

  const contentChartData = (() => {
    const noteMap = {};
    (contentAnalytics?.notesCreated || []).forEach(n => { noteMap[n.date] = { ...noteMap[n.date], notes: parseInt(n.count, 10) }; });
    (contentAnalytics?.resourcesCreated || []).forEach(r => { noteMap[r.date] = { ...noteMap[r.date], resources: parseInt(r.count, 10) }; });
    return Object.entries(noteMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, vals]) => ({ date, ...vals }));
  })();

  const axisStyle = { fontSize: 9, fill: 'var(--text-2)', fontWeight: 700 };
  const gridStyle = { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.05)' };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div ref={dashboardRef} className="max-w-[1400px] mx-auto space-y-10 sm:space-y-14">

          {/* ─── Page Header ─────────────────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 sm:gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <BarChart3 size={11} className="text-blue-400" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400">Admin Analytics</span>
                {!loading && overview && (
                  <>
                    <span className="w-px h-3 bg-blue-500/30" />
                    <span className="text-[8px] font-bold text-blue-400/60 uppercase tracking-widest">{overview.reportPeriod || ''}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">
                Platform{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
                  Analytics
                </span>
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-md">
                Comprehensive metrics · User insights · Content performance
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Filter pills */}
              <div className="flex items-center gap-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-1.5 shadow-sm">
                {FILTERS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                      filter === f.key
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-500 hover:text-[var(--foreground)] hover:bg-white/[0.05]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Export button */}
              <button
                onClick={exportPDF}
                disabled={exporting || loading || !overview}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 whitespace-nowrap"
              >
                {exporting ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
                {exporting ? 'Exporting…' : 'Export PDF'}
              </button>
            </div>
          </div>

          {/* ─── Error Banner ─────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-center gap-3 px-5 py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{error}</p>
            </div>
          )}

          {/* ─── KPI Grid ─────────────────────────────────────────────────── */}
          <div data-pdf-section data-pdf-label="Key Performance Indicators">
            <div className="mb-5">
              <SectionHeader label="Overview" title="Key Metrics" color={COLORS.blue} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {loading
                ? [...Array(8)].map((_, i) => <KpiCard key={i} loading />)
                : overviewKpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)
              }
            </div>
          </div>

          {/* ─── Charts Grid ─────────────────────────────────────────────── */}
          <div data-pdf-section data-pdf-label="Charts & Visualizations">
            <div className="mb-5">
              <SectionHeader label="Trends" title="Visual Analytics" color={COLORS.purple} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

              {/* User Registrations */}
              <ChartCard
                title="User Registrations"
                subtitle="New accounts over time"
                badge={{ label: 'Users', color: COLORS.blue }}
              >
                {loading ? <Skeleton className="h-[180px] sm:h-[220px]" /> : (
                  <div className="h-[180px] sm:h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userAnalytics?.registrations?.map(r => ({ date: r.date?.slice(5) || '', registrations: parseInt(r.count, 10) })) || []}>
                      <defs>
                        <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid {...gridStyle} />
                      <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={axisStyle} interval="preserveStartEnd" />
                      <YAxis tick={axisStyle} width={28} />
                      <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Area type="monotone" dataKey="registrations" stroke={COLORS.blue} fill="url(#regGrad)" strokeWidth={2} name="Registrations" dot={false} activeDot={{ r: 4, fill: COLORS.blue }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ChartCard>

              {/* Login Activity */}
              <ChartCard
                title="Login Activity"
                subtitle="Daily active sessions"
                badge={{ label: 'Activity', color: COLORS.emerald }}
              >
                {loading ? <Skeleton className="h-[180px] sm:h-[220px]" /> : (
                  <div className="h-[180px] sm:h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activityAnalytics?.loginActivity?.map(a => ({ date: a.date?.slice(5) || '', activeUsers: parseInt(a.activeUsers, 10) })) || []}>
                        <defs>
                          <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid {...gridStyle} />
                        <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={axisStyle} interval="preserveStartEnd" />
                        <YAxis tick={axisStyle} width={28} />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Line type="monotone" dataKey="activeUsers" stroke={COLORS.emerald} strokeWidth={2.5} dot={false} name="Active Users" activeDot={{ r: 4, fill: COLORS.emerald }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ChartCard>

              {/* Content Created */}
              <ChartCard
                title="Content Created"
                subtitle="Notes & resources over time"
                badge={{ label: 'Content', color: COLORS.purple }}
              >
                {loading ? <Skeleton className="h-[180px] sm:h-[220px]" /> : (
                  <div className="h-[180px] sm:h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={contentChartData} barGap={2}>
                        <CartesianGrid {...gridStyle} />
                        <XAxis dataKey="date" tick={axisStyle} tickFormatter={formatDateLabel} interval="preserveStartEnd" />
                        <YAxis tick={axisStyle} width={28} />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Bar dataKey="notes" fill={COLORS.purple} radius={[4, 4, 0, 0]} name="Notes" stackId="a" activeBar={{ stroke: COLORS.purple, strokeWidth: 2, fillOpacity: 1 }} />
                        <Bar dataKey="resources" fill={COLORS.amber} radius={[4, 4, 0, 0]} name="Resources" stackId="a" activeBar={{ stroke: COLORS.amber, strokeWidth: 2, fillOpacity: 1 }} />
                        <Legend wrapperStyle={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', paddingTop: '8px' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ChartCard>

              {/* Peak Activity Hours */}
              <ChartCard
                title="Peak Activity Hours"
                subtitle="Most active hours of the day"
                badge={{ label: 'Heatmap', color: COLORS.cyan }}
              >
                {loading ? <Skeleton className="h-[180px] sm:h-[220px]" /> : (
                  <div className="h-[180px] sm:h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityAnalytics?.peakHours?.map(h => ({ hour: `${h.hour}`, users: h.activeUsers })) || []}>
                        <CartesianGrid {...gridStyle} />
                        <XAxis dataKey="hour" tickFormatter={formatHourLabel} tick={axisStyle} interval={1} />
                        <YAxis tick={axisStyle} width={28} />
                        <Tooltip content={<CustomTooltip hideLabel />} cursor={false} />
                        <Bar dataKey="users" radius={[4, 4, 0, 0]} name="Active Users" activeBar={{ stroke: COLORS.cyan, strokeWidth: 2, fillOpacity: 0.9 }}>
                          {(activityAnalytics?.peakHours || []).map((entry, i) => {
                            const max = Math.max(...(activityAnalytics?.peakHours || []).map(h => h.activeUsers));
                            const ratio = max > 0 ? entry.activeUsers / max : 0;
                            const opacity = 0.3 + ratio * 0.7;
                            return <Cell key={i} fill={COLORS.cyan} fillOpacity={opacity} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ChartCard>

              {/* Role Distribution */}
              <ChartCard
                title="Role Distribution"
                subtitle="Users by assigned role"
                badge={{ label: 'Roles', color: COLORS.indigo }}
              >
                {loading ? <Skeleton className="h-[180px] sm:h-[220px]" /> : (
                  <div className="h-[180px] sm:h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 10, left: 0 }}>
                        <Pie data={rolePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {rolePieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Legend wrapperStyle={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ChartCard>

              {/* Department Distribution */}
              <ChartCard
                title="Department Distribution"
                subtitle="Top departments by user count"
                badge={{ label: 'Depts', color: COLORS.orange }}
              >
                {loading ? <Skeleton className="h-[180px] sm:h-[220px]" /> : (
                  <div className="h-[180px] sm:h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptBarData} layout="vertical" barSize={10}>
                        <CartesianGrid {...gridStyle} />
                        <XAxis type="number" tick={axisStyle} />
                        <YAxis dataKey="name" type="category" tick={axisStyle} width={80} />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Bar dataKey="count" radius={[0, 5, 5, 0]} name="Users">
                          {deptBarData.map((_, i) => (
                            <Cell key={i} fill={COLORS.orange} fillOpacity={0.45 + (i % 4) * 0.14} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ChartCard>

            </div>
          </div>

          {/* ─── Content Summary Cards ────────────────────────────────────── */}
          {(loading || contentAnalytics?.totals) && (
            <div data-pdf-section data-pdf-label="Content Summary">
              <div className="mb-5">
                <SectionHeader label="Summary" title="Content Overview" color={COLORS.emerald} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {loading ? [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.75rem] p-5 sm:p-7 h-[110px] animate-pulse" />
                )) : [
                  { label: 'Total Notes', value: contentAnalytics.totals.notes, color: COLORS.purple, icon: FileText },
                  { label: 'Approved', value: contentAnalytics.totals.approved, color: COLORS.emerald, icon: CheckCircle2 },
                  { label: 'Pending', value: contentAnalytics.totals.pending, color: COLORS.amber, icon: Clock },
                  { label: 'Downloads', value: contentAnalytics.totals.totalDownloads?.toLocaleString(), color: COLORS.cyan, icon: Download },
                ].map((s, i) => (
                  <div key={i}
                    className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-7 shadow-sm transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 rounded-[1.75rem] sm:rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `radial-gradient(circle at 30% 30%, ${s.color}12, transparent 70%)` }}
                    />
                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{s.label}</p>
                        <p className="text-2xl sm:text-3xl font-black tracking-tight leading-none" style={{ color: s.color }}>{s.value}</p>
                      </div>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundColor: `${s.color}12`, borderColor: `${s.color}25`, color: s.color }}
                      >
                        <s.icon size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Resource Summary Cards ──────────────────────────────────── */}
          {(loading || contentAnalytics?.totals) && (
            <div data-pdf-section data-pdf-label="Resource Summary">
              <div className="mb-5">
                <SectionHeader label="Summary" title="Resources Overview" color={COLORS.amber} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {loading ? [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.75rem] p-5 sm:p-7 h-[110px] animate-pulse" />
                )) : [
                  { label: 'Total Resources', value: contentAnalytics.totals.totalResources, color: COLORS.amber, icon: BookOpen },
                  { label: 'Approved', value: contentAnalytics.totals.approvedResources, color: COLORS.emerald, icon: CheckCircle2 },
                  { label: 'Pending', value: contentAnalytics.totals.pendingResources, color: COLORS.amber, icon: Clock },
                  { label: 'Downloads', value: contentAnalytics.totals.resourceDownloads?.toLocaleString(), color: COLORS.cyan, icon: Download },
                ].map((s, i) => (
                  <div key={i}
                    className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-7 shadow-sm transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 rounded-[1.75rem] sm:rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `radial-gradient(circle at 30% 30%, ${s.color}12, transparent 70%)` }}
                    />
                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{s.label}</p>
                        <p className="text-2xl sm:text-3xl font-black tracking-tight leading-none" style={{ color: s.color }}>{s.value}</p>
                      </div>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundColor: `${s.color}12`, borderColor: `${s.color}25`, color: s.color }}
                      >
                        <s.icon size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Popular Notes Table ──────────────────────────────────────── */}
          <div data-pdf-section data-pdf-label="Popular Notes — Top 10 by Downloads">
            <div className="mb-5">
              <SectionHeader label="Leaderboard" title="Popular Notes" color={COLORS.amber} />
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-5 sm:p-7 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-white/[0.03] rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : !contentAnalytics?.popularNotes?.length ? (
                <div className="py-16 text-center">
                  <FileText size={36} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No notes data available</p>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="px-5 sm:px-7 py-3 border-b border-[var(--card-border)] hidden sm:grid grid-cols-[2rem_1fr_1fr_auto_auto_auto] gap-4 items-center">
                    {['#', 'Title', 'Author', 'Downloads', 'Rating', 'Dept'].map(h => (
                      <span key={h} className="text-[8px] font-black uppercase tracking-widest text-slate-500">{h}</span>
                    ))}
                  </div>

                  <div className="divide-y divide-[var(--card-border)]">
                    {contentAnalytics.popularNotes.map((note, i) => (
                      <div
                        key={note.id}
                        className="px-5 sm:px-7 py-3.5 sm:py-4 flex sm:grid sm:grid-cols-[2rem_1fr_1fr_auto_auto_auto] gap-3 sm:gap-4 items-center hover:bg-white/[0.02] transition-colors"
                      >
                        <RankBadge rank={i + 1} />

                        <div className="flex-1 min-w-0 sm:contents">
                          <p className="text-[11px] sm:text-xs font-bold truncate text-[var(--foreground)]" title={note.title}>
                            {note.title}
                          </p>
                          <p className="text-[9px] text-slate-500 font-semibold truncate">{note.uploader?.name || 'Unknown'}</p>
                        </div>

                        <div className="hidden sm:flex items-center gap-1.5" style={{ color: COLORS.emerald }}>
                          <Download size={11} />
                          <span className="text-[11px] font-black">{note.downloads}</span>
                        </div>

                        <div className="hidden sm:flex items-center gap-1" style={{ color: COLORS.amber }}>
                          <Star size={10} className="fill-current" />
                          <span className="text-[11px] font-black">{note.avgRating?.toFixed(1)}</span>
                        </div>

                        <span className="hidden sm:block text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[90px]">
                          {note.dept}
                        </span>

                        {/* Mobile extras */}
                        <div className="sm:hidden flex items-center gap-3 shrink-0">
                          <span className="text-[9px] font-black" style={{ color: COLORS.emerald }}>↓{note.downloads}</span>
                          <span className="text-[9px] font-black" style={{ color: COLORS.amber }}>★{note.avgRating?.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      <Toast toast={toast} closeToast={() => setToast(prev => ({ ...prev, show: false }))} />
    </main>
  );
}
