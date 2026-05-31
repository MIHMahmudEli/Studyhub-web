'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Toast from '@/components/ui/Toast';
import { apiRequest } from '@/lib/api';
import {
  BarChart3, Users, FileText, MessageSquare, BookOpen, Shield,
  TrendingUp, Clock, Calendar, Activity, UserPlus, Download,
  AlertCircle, ArrowLeft, FileDown, Loader2
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend
} from 'recharts';

const FILTERS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: 'year', label: 'This Year' },
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

function KpiCard({ title, value, subtitle, icon: Icon, color, loading }) {
  if (loading) {
    return (
      <div className="animate-pulse bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl sm:rounded-2xl p-3 sm:p-5 h-[90px] sm:h-[110px]" />
    );
  }
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:border-[var(--border-h)] transition-all duration-300">
      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-1">
        <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 leading-tight">{title}</span>
        <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ml-1 sm:ml-2`} style={{ backgroundColor: `${color}15`, color }}>
          <Icon size={12} className="sm:size-4" />
        </div>
      </div>
      <p className="text-base sm:text-2xl font-black tracking-tight mb-0.5 sm:mb-1" style={{ color }}>{value}</p>
      <p className="text-[6px] sm:text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{subtitle}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl sm:rounded-2xl p-4 sm:p-6 ${className}`}>
      <div className="mb-3 sm:mb-4">
        <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{title}</h3>
        {subtitle && <p className="text-[7px] sm:text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 sm:mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-3 shadow-xl backdrop-blur-xl">
      <p className="text-[9px] font-black uppercase tracking-widest mb-2 text-slate-500">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs font-bold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

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

      // Cover page
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
      const details = [
        `Date Range: ${filterLabel}`,
        `Generated: ${dateStr} at ${timeStr}`,
        `Report Period: ${overview?.reportPeriod || 'N/A'}`,
      ];
      details.forEach((d, i) => pdf.text(d, margin, ph * 0.46 + i * 7));

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
        const cols = 3;
        const cellW = contentWidth / cols;
        let sx = margin, sy = ph * 0.58;
        stats.forEach((s, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          pdf.setFillColor(30, 41, 59);
          pdf.roundedRect(sx + col * cellW + 2, sy + row * 16, cellW - 4, 13, 2, 2, 'F');
          pdf.setFontSize(7);
          pdf.setTextColor(148, 163, 184);
          pdf.text(s[0], sx + col * cellW + 5, sy + row * 16 + 5);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(255, 255, 255);
          pdf.text(s[1], sx + col * cellW + 5, sy + row * 16 + 13);
          pdf.setFont('helvetica', 'normal');
        });
      }
      pdf.addPage();

      // Capture each section via html-to-image
      const el = dashboardRef.current;
      if (!el) { setExporting(false); return; }

      const sections = el.querySelectorAll('[data-pdf-section]');
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const label = section.getAttribute('data-pdf-label') || '';

        const dataUrl = await toPng(section, {
          pixelRatio: 2,
          backgroundColor: '#0f172a',
        });

        const imgW = contentWidth;
        const img = new Image();
        img.src = dataUrl;
        await img.decode();
        const imgH = (img.naturalHeight / img.naturalWidth) * imgW;

        // Section header
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(59, 130, 246);
        const lines = pdf.splitTextToSize(label, contentWidth);
        const headerY = pdf.lastAutoPage || margin;
        pdf.text(lines, margin, headerY);
        pdf.lastAutoPage = headerY + 5;

        // Check if image needs a new page
        let yPos = (pdf.lastAutoPage || margin) + 2;
        if (yPos + imgH > ph - margin) {
          pdf.addPage();
          yPos = margin + 2;
        }

        pdf.addImage(dataUrl, 'PNG', margin, yPos, imgW, imgH);
        pdf.lastAutoPage = yPos + imgH + 10;
      }

      // Page numbers
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        if (i === 1) continue;
        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`StudyHub Analytics Report — ${filterLabel} — Page ${i - 1} of ${totalPages - 1}`, margin, ph - 8);
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
    setLoading(true);
    setError(null);
    try {
      const [ov, ua, aa, ca] = await Promise.all([
        apiRequest(`/admin/analytics/overview?filter=${f}`),
        apiRequest(`/admin/analytics/users?filter=${f}`),
        apiRequest(`/admin/analytics/activity?filter=${f}`),
        apiRequest(`/admin/analytics/content?filter=${f}`),
      ]);
      setOverview(ov);
      setUserAnalytics(ua);
      setActivityAnalytics(aa);
      setContentAnalytics(ca);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
      showToast(err.message || 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (tokenReady && user?.role === 'admin') {
      fetchAnalytics(filter);
    }
  }, [tokenReady, user, filter, fetchAnalytics]);

  if (authLoading || !user) return null;

  const overviewKpis = overview ? [
    { title: 'Total Users', value: overview.totalUsers.toLocaleString(), subtitle: 'Registered accounts', icon: Users, color: COLORS.blue },
    { title: 'Active Users', value: overview.activeUsers.toLocaleString(), subtitle: `In selected period`, icon: Activity, color: COLORS.emerald },
    { title: 'New Users', value: overview.newUsers.toLocaleString(), subtitle: 'In selected period', icon: UserPlus, color: COLORS.cyan },
    { title: 'Total Notes', value: overview.totalNotes.toLocaleString(), subtitle: 'All notes', icon: FileText, color: COLORS.purple },
    { title: 'Resources', value: overview.totalResources.toLocaleString(), subtitle: 'Library materials', icon: BookOpen, color: COLORS.amber },
    { title: 'Reviews', value: overview.totalReviews.toLocaleString(), subtitle: 'User reviews', icon: MessageSquare, color: COLORS.rose },
    { title: 'Moderators', value: overview.totalModerators.toLocaleString(), subtitle: 'Team members', icon: Shield, color: COLORS.indigo },
    { title: 'Banned', value: overview.totalBanned.toLocaleString(), subtitle: 'Suspended accounts', icon: AlertCircle, color: COLORS.orange },
  ] : [];

  const rolePieData = userAnalytics?.roleDistribution?.map(r => ({
    name: r.role.charAt(0).toUpperCase() + r.role.slice(1),
    value: parseInt(r.count, 10),
  })) || [];

  const deptBarData = userAnalytics?.deptDistribution?.slice(0, 10).map(d => ({
    name: d.dept,
    count: parseInt(d.count, 10),
  })) || [];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />
      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div ref={dashboardRef} className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[7px] sm:text-[9px] font-black uppercase tracking-[0.3em]">
                <BarChart3 size={10} className="sm:size-3" /> ADMIN ANALYTICS
              </div>
              <h1 className="text-lg sm:text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500">Analytics</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest max-w-[600px] mx-auto md:mx-0">
                Comprehensive platform metrics, user insights, and content performance data.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-full overflow-x-auto scrollbar-none -mx-4 md:mx-0 px-4 md:px-0">
                <div className="inline-flex items-center gap-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-1 shadow-sm min-w-0">
                  {FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shrink-0 ${
                        filter === f.key
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                          : 'text-slate-500 hover:text-[var(--foreground)] hover:bg-[var(--surface)] active:text-[var(--foreground)] active:bg-white/[0.06]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end md:hidden">
                <button
                  onClick={exportPDF}
                  disabled={exporting || loading || !overview}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {exporting ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={12} />}
                  <span>{exporting ? 'Exporting...' : 'PDF'}</span>
                </button>
              </div>
            </div>
            <button
              onClick={exportPDF}
              disabled={exporting || loading || !overview}
              className="hidden md:flex shrink-0 items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {exporting ? <Loader2 size={12} className="sm:size-3 animate-spin" /> : <FileDown size={12} className="sm:size-3" />}
              <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-3 px-5 py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <AlertCircle size={18} className="text-rose-500 shrink-0" />
              <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">{error}</p>
            </div>
          )}

          <div data-pdf-section data-pdf-label="Key Performance Indicators" className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {overviewKpis.map((kpi, i) => (
              <KpiCard key={i} {...kpi} loading={loading} />
            ))}
          </div>

          <div data-pdf-section data-pdf-label="Charts &amp; Visualizations" className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

            <ChartCard title="User Registrations" subtitle="New accounts over time">
              {loading ? (
                <div className="animate-pulse h-[230px] bg-white/[0.03] rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={userAnalytics?.registrations?.map(r => ({ date: r.date, registrations: parseInt(r.count, 10) })) || []}>
                    <defs>
                      <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'var(--text-2)' }} tickFormatter={v => v?.slice(5) || ''} angle={-30} textAnchor="end" height={40} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--text-2)' }} width={35} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="registrations" stroke={COLORS.blue} fill="url(#regGrad)" strokeWidth={2} name="Registrations" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Role Distribution" subtitle="Users by role">
              {loading ? (
                <div className="animate-pulse h-[230px] bg-white/[0.03] rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={rolePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {rolePieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Department Distribution" subtitle="Top 10 departments by user count">
              {loading ? (
                <div className="animate-pulse h-[230px] bg-white/[0.03] rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={deptBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize: 8, fill: 'var(--text-2)' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 7, fill: 'var(--text-2)' }} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={COLORS.purple} radius={[0, 4, 4, 0]} name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Login Activity" subtitle="Daily active users from sessions">
              {loading ? (
                <div className="animate-pulse h-[230px] bg-white/[0.03] rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={activityAnalytics?.loginActivity?.map(a => ({ date: a.date, activeUsers: parseInt(a.activeUsers, 10) })) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'var(--text-2)' }} tickFormatter={v => v?.slice(5) || ''} angle={-30} textAnchor="end" height={40} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--text-2)' }} width={35} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="activeUsers" stroke={COLORS.emerald} strokeWidth={2} dot={false} name="Active" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Content Created" subtitle="Notes & resources over time">
              {loading ? (
                <div className="animate-pulse h-[230px] bg-white/[0.03] rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={(() => {
                    const noteMap = {};
                    (contentAnalytics?.notesCreated || []).forEach(n => { noteMap[n.date] = { ...noteMap[n.date], notes: parseInt(n.count, 10) }; });
                    (contentAnalytics?.resourcesCreated || []).forEach(r => { noteMap[r.date] = { ...noteMap[r.date], resources: parseInt(r.count, 10) }; });
                    return Object.entries(noteMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, vals]) => ({ date, ...vals }));
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'var(--text-2)' }} tickFormatter={v => v?.slice(5) || ''} angle={-30} textAnchor="end" height={40} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--text-2)' }} width={35} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="notes" fill={COLORS.purple} radius={[3, 3, 0, 0]} name="Notes" stackId="a" />
                    <Bar dataKey="resources" fill={COLORS.amber} radius={[3, 3, 0, 0]} name="Resources" stackId="a" />
                    <Legend wrapperStyle={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Peak Activity Hours" subtitle="Most active hours of the day">
              {loading ? (
                <div className="animate-pulse h-[230px] bg-white/[0.03] rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={activityAnalytics?.peakHours?.map(h => ({ hour: `${h.hour}:00`, users: h.activeUsers })) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="hour" tick={{ fontSize: 7, fill: 'var(--text-2)' }} angle={-45} textAnchor="end" height={50} interval={1} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--text-2)' }} width={30} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="users" fill={COLORS.cyan} radius={[3, 3, 0, 0]} name="Active Users" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

          </div>

          <div data-pdf-section data-pdf-label="Popular Notes — Top 10 by Downloads" className="space-y-4 sm:space-y-6">
            <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-500">Popular Notes</h2>
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl sm:rounded-2xl overflow-hidden">
              {loading ? (
                <div className="animate-pulse p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 sm:h-10 bg-white/[0.03] rounded-lg sm:rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[500px] sm:min-w-0">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="p-3 sm:p-4 text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-500">Title</th>
                        <th className="p-3 sm:p-4 text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-500">Author</th>
                        <th className="p-3 sm:p-4 text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-500">Downloads</th>
                        <th className="p-3 sm:p-4 text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-500">Rating</th>
                        <th className="p-3 sm:p-4 text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-500">Dept</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contentAnalytics?.popularNotes?.map((note, i) => (
                        <tr key={note.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors">
                          <td className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold truncate max-w-[120px] sm:max-w-[200px]">{note.title}</td>
                          <td className="p-3 sm:p-4 text-[8px] sm:text-[10px] text-slate-500 whitespace-nowrap">{note.uploader?.name || 'Unknown'}</td>
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold whitespace-nowrap" style={{ color: COLORS.emerald }}>
                              <Download size={10} className="sm:size-3" /> {note.downloads}
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold whitespace-nowrap" style={{ color: COLORS.amber }}>{note.avgRating.toFixed(1)}</td>
                          <td className="p-3 sm:p-4 text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[80px] sm:max-w-none">{note.dept}</td>
                        </tr>
                      ))}
                      {(!contentAnalytics?.popularNotes || contentAnalytics.popularNotes.length === 0) && (
                        <tr>
                          <td colSpan={5} className="p-6 sm:p-8 text-center text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            No notes data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {contentAnalytics?.totals && (
            <div data-pdf-section data-pdf-label="Content Summary" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
                <p className="text-lg sm:text-2xl font-black tracking-tight" style={{ color: COLORS.purple }}>{contentAnalytics.totals.notes}</p>
                <p className="text-[6px] sm:text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5 sm:mt-1">Total Notes</p>
              </div>
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
                <p className="text-lg sm:text-2xl font-black tracking-tight" style={{ color: COLORS.emerald }}>{contentAnalytics.totals.approved}</p>
                <p className="text-[6px] sm:text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5 sm:mt-1">Approved</p>
              </div>
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
                <p className="text-lg sm:text-2xl font-black tracking-tight" style={{ color: COLORS.amber }}>{contentAnalytics.totals.pending}</p>
                <p className="text-[6px] sm:text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5 sm:mt-1">Pending</p>
              </div>
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
                <p className="text-lg sm:text-2xl font-black tracking-tight" style={{ color: COLORS.cyan }}>{contentAnalytics.totals.totalDownloads.toLocaleString()}</p>
                <p className="text-[6px] sm:text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5 sm:mt-1">Total Downloads</p>
              </div>
            </div>
          )}

        </div>
      </div>
      <Toast toast={toast} closeToast={() => setToast(prev => ({ ...prev, show: false }))} />
    </main>
  );
}
