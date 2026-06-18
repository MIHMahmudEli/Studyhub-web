'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import PresenceHistoryChart from '@/components/admin/PresenceHistoryChart';
import { apiRequest } from '@/lib/api';
import { getDisplayUrl } from '@/lib/r2';
import { ArrowLeft, Globe, Smartphone, Apple, Radio, Users, LineChart } from 'lucide-react';

const RANGES = [
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
  { label: '30d', hours: 720 },
];

const EMPTY = {
  total: 0,
  web: { count: 0, users: [] },
  app: { count: 0, android: { count: 0, users: [] }, ios: { count: 0, users: [] } },
};

function UserRow({ u }) {
  const pic = getDisplayUrl(u.profile_pic);
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--text-1)]/[0.04] transition-colors">
      {pic ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pic} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
      ) : (
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-black flex items-center justify-center shrink-0">
          {u.name?.[0]?.toUpperCase() || '?'}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--text-1)] truncate">{u.name}</p>
        <p className="text-[11px] text-[var(--text-3)] truncate">{u.dept || u.email}</p>
      </div>
      {u.role && u.role !== 'student' && (
        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 shrink-0">{u.role}</span>
      )}
    </div>
  );
}

function PlatformColumn({ icon: Icon, label, accent, users }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}1f`, border: `1px solid ${accent}33` }}>
          <Icon size={16} style={{ color: accent }} />
        </span>
        <h3 className="text-sm font-black text-[var(--text-1)]">{label}</h3>
        <span className="ml-auto text-sm font-black" style={{ color: accent }}>{users.length}</span>
      </div>
      {users.length === 0 ? (
        <p className="text-xs text-[var(--text-3)] py-6 text-center">No one online</p>
      ) : (
        <div className="space-y-1 max-h-[420px] overflow-y-auto">
          {users.map((u) => <UserRow key={`${u.id}`} u={u} />)}
        </div>
      )}
    </div>
  );
}

function StatPill({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center gap-3">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}1f`, border: `1px solid ${accent}33` }}>
        <Icon size={18} style={{ color: accent }} />
      </span>
      <div>
        <div className="text-2xl font-black leading-none text-[var(--text-1)]">{value}</div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function OnlineUsersPage() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const { on } = useSocket();
  const router = useRouter();

  const [data, setData] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [history, setHistory] = useState([]);
  const [rangeHours, setRangeHours] = useState(24);

  // Admin only
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/auth');
      else if (user.role !== 'admin') router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const fetchOnline = useCallback(async () => {
    try {
      const res = await apiRequest('/admin/online-users');
      setData(res || EMPTY);
    } catch {
      /* keep last snapshot */
    } finally {
      setLoaded(true);
    }
  }, []);

  // Initial fetch + polling fallback
  useEffect(() => {
    if (!tokenReady || user?.role !== 'admin') return;
    fetchOnline();
    const id = setInterval(fetchOnline, 8000);
    return () => clearInterval(id);
  }, [tokenReady, user, fetchOnline]);

  // Live push from the gateway (instant updates as users connect/disconnect)
  useEffect(() => {
    const off = on('online-presence:updated', (payload) => {
      if (payload) setData(payload);
    });
    return off;
  }, [on]);

  // Online-history timeline (refetch on range change + slow poll)
  const fetchHistory = useCallback(async (hours) => {
    try {
      const res = await apiRequest(`/admin/online-users/history?hours=${hours}`);
      setHistory(Array.isArray(res) ? res : []);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    if (!tokenReady || user?.role !== 'admin') return;
    fetchHistory(rangeHours);
    const id = setInterval(() => fetchHistory(rangeHours), 60000);
    return () => clearInterval(id);
  }, [tokenReady, user, rangeHours, fetchHistory]);

  if (authLoading || !user || user.role !== 'admin') return null;

  const web = data.web || EMPTY.web;
  const app = data.app || EMPTY.app;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1100px] mx-auto space-y-8">

          {/* Header */}
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--text-2)] hover:text-[var(--foreground)] transition-colors mb-4">
              <ArrowLeft size={15} /> Back to dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              Online Now
            </h1>
            <p className="text-sm text-[var(--text-2)] mt-1.5">
              Accounts currently using StudyHub, live — separated by client. {!loaded && 'Loading…'}
            </p>
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatPill icon={Radio}      label="Total online" value={data.total || 0}        accent="#10b981" />
            <StatPill icon={Globe}      label="Web"          value={web.count || 0}          accent="#3b82f6" />
            <StatPill icon={Smartphone} label="Android"      value={app.android?.count || 0} accent="#22c55e" />
            <StatPill icon={Apple}      label="iOS"          value={app.ios?.count || 0}     accent="#a78bfa" />
          </div>

          {/* App total banner */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-2)]">
            <Users size={15} className="text-[var(--text-3)]" />
            <span><span className="font-bold text-[var(--text-1)]">{app.count || 0}</span> using the mobile app · <span className="font-bold text-[var(--text-1)]">{web.count || 0}</span> on web</span>
          </div>

          {/* History chart */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="text-sm font-black flex items-center gap-2 text-[var(--text-1)]">
                <LineChart size={16} className="text-emerald-500" /> Online history
              </h3>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--background)]/60 border border-[var(--card-border)]">
                {RANGES.map((r) => (
                  <button
                    key={r.hours}
                    onClick={() => setRangeHours(r.hours)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors ${
                      rangeHours === r.hours ? 'bg-emerald-500 text-white' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <PresenceHistoryChart data={history} rangeHours={rangeHours} />
          </div>

          {/* Platform columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <PlatformColumn icon={Globe}      label="Web"     accent="#3b82f6" users={web.users || []} />
            <PlatformColumn icon={Smartphone} label="Android" accent="#22c55e" users={app.android?.users || []} />
            <PlatformColumn icon={Apple}      label="iOS"     accent="#a78bfa" users={app.ios?.users || []} />
          </div>
        </div>
      </div>
    </main>
  );
}
