'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { apiRequest } from '@/lib/api';
import UserCard from '@/components/admin/UserCard';
import AdminPanel from '@/components/admin/AdminPanel';
import {
  Users,
  Calendar,
  ArrowLeft,
  Activity,
  Clock,
  Loader2,
  Radio,
  RefreshCw,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTodayStr() {
  const d = new Date();
  return [d.getUTCFullYear(), String(d.getUTCMonth() + 1).padStart(2, '0'), String(d.getUTCDate()).padStart(2, '0')].join('-');
}

function getYesterdayStr() {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return [y.getUTCFullYear(), String(y.getUTCMonth() + 1).padStart(2, '0'), String(y.getUTCDate()).padStart(2, '0')].join('-');
}

// ─── Active Status Helpers ───────────────────────────────────────────────────
const ACTIVE_NOW_THRESHOLD_SEC = 90; // within 90s = "Active Now"

function getPresenceStatus(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < ACTIVE_NOW_THRESHOLD_SEC) return { isNow: true, label: 'Active Now' };
  if (diff < 60) return { isNow: false, label: `${diff}s ago` };
  if (diff < 3600) return { isNow: false, label: `${Math.floor(diff / 60)}m ago` };
  return { isNow: false, label: `${Math.floor(diff / 3600)}h ago` };
}

// ─── Presence Dot ─────────────────────────────────────────────────────────────
function PresenceDot({ isNow }) {
  return (
    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
      <span className={`relative inline-flex rounded-full h-3 w-3 border-2 border-[var(--card-bg)] ${isNow ? 'bg-emerald-500' : 'bg-slate-500'}`} />
    </span>
  );
}

// ─── Live Dot (for mode toggle) ───────────────────────────────────────────────
function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
    </span>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────
function UserRow({ u, isLive, router }) {
  const presence = isLive ? getPresenceStatus(u.last_active_at) : null;

  return (
    <tr className="hover:bg-white/[0.02] group transition-colors">
      <td className="py-4 sm:py-5 pl-4 max-w-[220px] sm:max-w-[260px]">
        <button onClick={() => router.push(`/profile/${u.id}`)} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity text-left w-full">
          {/* Avatar with presence dot */}
          <div className="relative shrink-0">
            {u.profile_pic ? (
              <img src={u.profile_pic} alt="" className="w-9 h-9 rounded-xl object-cover border border-[var(--card-border)]" />
            ) : (
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white ${
                isLive && presence?.isNow
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  : isLive
                  ? 'bg-gradient-to-br from-slate-500 to-slate-600'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600'
              }`}>
                {u.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            {isLive && <PresenceDot isNow={presence?.isNow} />}
          </div>

          <div className="truncate">
            <p className="font-black text-sm text-[var(--foreground)] truncate flex items-center gap-2">
              {u.name}
              {u.banned && (
                <span className="text-[9px] font-black px-2 py-0.5 bg-red-500/10 text-red-500 rounded-md uppercase tracking-widest border border-red-500/20 shrink-0">Banned</span>
              )}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{u.email || '—'}</p>
          </div>
        </button>
      </td>

      <td className="py-4 sm:py-5 whitespace-nowrap text-xs font-bold text-slate-400">
        {u.dept?.toUpperCase() || 'GENERAL'}
      </td>

      <td className="py-4 sm:py-5 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          u.role === 'admin'
            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            : u.role === 'moderator'
            ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }`}>
          {u.role || 'student'}
        </span>
      </td>

      <td className="py-4 sm:py-5 font-black text-amber-500 whitespace-nowrap text-sm">
        {u.points || 0} <span className="text-[9px] text-amber-400/60">PTS</span>
      </td>

      {/* Last Seen / Active Now column */}
      <td className="py-4 sm:py-5 text-right pr-4 whitespace-nowrap">
        {isLive ? (
          presence?.isNow ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <span className="relative flex h-1.5 w-1.5">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Active Now
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-slate-400 text-[11px] font-black uppercase tracking-widest">
              <Clock size={13} className="shrink-0" />
              {presence?.label}
            </span>
          )
        ) : (
          <span className="inline-flex items-center gap-1.5 text-emerald-500 text-[11px] font-black">
            <Clock size={13} />
            {new Date(u.last_active_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ActiveUsersPage() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState('daily'); // 'daily' | 'live'

  // ── Daily state ──
  const [selectedDate, setSelectedDate] = useState(getTodayStr);
  const [dailyUsers, setDailyUsers] = useState([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [dailyPage, setDailyPage] = useState(1);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyLoadingMore, setDailyLoadingMore] = useState(false);
  const [dailyError, setDailyError] = useState(null);
  const observerRef = useRef(null);
  const limit = 12;

  // ── Live state ──
  const [liveUsers, setLiveUsers] = useState([]);
  const [liveTotal, setLiveTotal] = useState(0);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [countdown, setCountdown] = useState(15);
  const liveIntervalRef = useRef(null);
  const countdownRef = useRef(null);
  const LIVE_MINUTES = 5;
  const POLL_SECONDS = 15;

  // ── Fetch Daily ──────────────────────────────────────────────────────────────
  const fetchDailyUsers = useCallback(async (dateStr, pageNum, append = false) => {
    try {
      if (append) setDailyLoadingMore(true);
      else { setDailyLoading(true); setDailyError(null); }
      const res = await apiRequest(`/users/active?date=${dateStr}&page=${pageNum}&limit=${limit}`);
      const newData = res?.data || [];
      if (append) setDailyUsers(prev => [...prev, ...newData]);
      else setDailyUsers(newData);
      setDailyTotal(res?.total || 0);
      setDailyPage(pageNum);
    } catch (err) {
      if (err.status === 403) { router.push('/admin/dashboard'); return; }
      setDailyError(err.message || 'Failed to load.');
      if (!append) setDailyUsers([]);
    } finally {
      setDailyLoading(false);
      setDailyLoadingMore(false);
    }
  }, [router]);

  useEffect(() => {
    if (!tokenReady || !user || (user.role !== 'admin' && user.role !== 'moderator')) return;
    if (mode !== 'daily') return;
    setDailyUsers([]);
    setDailyPage(1);
    fetchDailyUsers(selectedDate, 1);
  }, [tokenReady, user, selectedDate, mode, fetchDailyUsers]);

  // Infinite scroll sentinel
  const dailyHasMore = dailyUsers.length < dailyTotal;
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && dailyHasMore && !dailyLoadingMore) {
        fetchDailyUsers(selectedDate, dailyPage + 1, true);
      }
    }, { threshold: 0.1 });
    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [dailyHasMore, dailyLoadingMore, dailyPage, selectedDate, fetchDailyUsers]);

  // ── Fetch Live ───────────────────────────────────────────────────────────────
  const fetchLiveUsers = useCallback(async () => {
    try {
      setLiveError(null);
      const res = await apiRequest(`/users/active/now?minutes=${LIVE_MINUTES}&page=1&limit=50`);
      setLiveUsers(res?.data || []);
      setLiveTotal(res?.total || 0);
      setLastRefreshed(new Date());
    } catch (err) {
      if (err.status === 403) { router.push('/admin/dashboard'); return; }
      setLiveError(err.message || 'Failed to load live users.');
    } finally {
      setLiveLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!tokenReady || !user || mode !== 'live') return;

    setLiveLoading(true);
    setCountdown(POLL_SECONDS);
    fetchLiveUsers();

    liveIntervalRef.current = setInterval(() => {
      fetchLiveUsers();
      setCountdown(POLL_SECONDS);
    }, POLL_SECONDS * 1000);

    countdownRef.current = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? POLL_SECONDS : prev - 1));
    }, 1000);

    return () => {
      clearInterval(liveIntervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [tokenReady, user, mode, fetchLiveUsers]);

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) return null;

  const isToday = selectedDate === getTodayStr();
  const isYesterday = selectedDate === getYesterdayStr();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-10">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 blur-[80px] rounded-full -z-10 animate-pulse" />

            <div className="space-y-3 w-full md:w-auto">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[var(--foreground)] transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500">Users</span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-[600px]">
                Monitor platform engagement and inspect student activity.
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-1.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-1.5 shadow-sm">
              <button
                onClick={() => setMode('daily')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  mode === 'daily'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-500 hover:text-[var(--foreground)]'
                }`}
              >
                <Calendar size={14} /> Daily
              </button>
              <button
                onClick={() => setMode('live')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  mode === 'live'
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'text-slate-500 hover:text-[var(--foreground)]'
                }`}
              >
                <LiveDot /> Live
              </button>
            </div>
          </div>

          {/* ── DAILY MODE ── */}
          {mode === 'daily' && (
            <>
              {/* Date controls */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.5rem] p-4 shadow-sm backdrop-blur-xl w-full md:w-fit">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/[0.05] p-1.5 rounded-2xl border border-slate-200 dark:border-white/[0.05]">
                  <button
                    onClick={() => setSelectedDate(getTodayStr())}
                    className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                      isToday ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]' : 'text-slate-500 hover:text-[var(--foreground)]'
                    }`}
                  >Today</button>
                  <button
                    onClick={() => setSelectedDate(getYesterdayStr())}
                    className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                      isYesterday ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]' : 'text-slate-500 hover:text-[var(--foreground)]'
                    }`}
                  >Yesterday</button>
                </div>
                <div className="relative flex items-center w-full sm:w-auto">
                  <div className="absolute left-3.5 text-emerald-500 pointer-events-none"><Calendar size={16} /></div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.05] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-[var(--foreground)] focus:outline-none focus:border-emerald-500/40 transition-colors w-full sm:w-auto cursor-pointer"
                  />
                </div>
              </div>

              <AdminPanel
                panelIcon={Activity}
                panelIconClass="text-emerald-500 animate-pulse"
                panelTitle={`Users Active on ${selectedDate}`}
                panelSubtitle="Displaying students who logged in or performed actions on this date."
                badgeText={`Active Count: ${dailyTotal}`}
                badgeColorClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                loading={dailyLoading}
                error={dailyError}
                isEmpty={dailyUsers.length === 0}
                emptyIcon={Users}
                emptyTitle="No Activity Found"
                emptyDescription={`No users were recorded active on ${selectedDate}.`}
              >
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="border-b border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <th className="pb-4 pl-4 whitespace-nowrap">User & Email</th>
                        <th className="pb-4 whitespace-nowrap">Department</th>
                        <th className="pb-4 whitespace-nowrap">Role</th>
                        <th className="pb-4 whitespace-nowrap">Points</th>
                        <th className="pb-4 text-right pr-4 whitespace-nowrap">Last Active Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)] text-xs font-bold">
                      {dailyUsers.map(u => <UserRow key={u.id} u={u} isLive={false} router={router} />)}
                    </tbody>
                  </table>
                </div>

                <div className="block md:hidden space-y-4">
                  {dailyUsers.map(u => <UserCard key={u.id} user={u} showActiveTime showDept={false} />)}
                </div>

                {dailyLoadingMore && (
                  <div className="flex items-center justify-center pt-8">
                    <div className="flex items-center gap-3 px-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
                      <Loader2 size={16} className="animate-spin text-emerald-500" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Loading more...</span>
                    </div>
                  </div>
                )}
                <div ref={observerRef} className="w-full h-4" />
              </AdminPanel>
            </>
          )}

          {/* ── LIVE MODE ── */}
          {mode === 'live' && (
            <>
              {/* Live status bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--card-bg)] border border-red-500/20 rounded-[1.5rem] p-4 shadow-sm backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <LiveDot />
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-red-400">Live Mode — Last {LIVE_MINUTES} Minutes</p>
                    {lastRefreshed && (
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        Last refreshed: {lastRefreshed.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <RefreshCw size={12} className={`text-red-400 ${countdown <= 3 ? 'animate-spin' : ''}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                      Refreshing in {countdown}s
                    </span>
                  </div>
                  <button
                    onClick={() => { setLiveLoading(true); fetchLiveUsers(); setCountdown(POLL_SECONDS); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all cursor-pointer"
                  >
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>
              </div>

              <AdminPanel
                panelIcon={Radio}
                panelIconClass="text-red-500 animate-pulse"
                panelTitle={`Currently Online — Last ${LIVE_MINUTES} min`}
                panelSubtitle="Users who made a request in the last 5 minutes. Auto-refreshes every 15 seconds."
                badgeText={`Online Now: ${liveTotal}`}
                badgeColorClass="bg-red-500/10 text-red-500 border-red-500/20"
                loading={liveLoading}
                error={liveError}
                isEmpty={liveUsers.length === 0}
                emptyIcon={Users}
                emptyTitle="No One Online"
                emptyDescription="No users have been active in the last 5 minutes."
              >
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="border-b border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <th className="pb-4 pl-4 whitespace-nowrap">User & Email</th>
                        <th className="pb-4 whitespace-nowrap">Department</th>
                        <th className="pb-4 whitespace-nowrap">Role</th>
                        <th className="pb-4 whitespace-nowrap">Points</th>
                        <th className="pb-4 text-right pr-4 whitespace-nowrap">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)] text-xs font-bold">
                      {liveUsers.map(u => <UserRow key={u.id} u={u} isLive={true} router={router} />)}
                    </tbody>
                  </table>
                </div>

                <div className="block md:hidden space-y-4">
                  {liveUsers.map(u => <UserCard key={u.id} user={u} showActiveTime isLive showDept={false} />)}
                </div>
              </AdminPanel>
            </>
          )}

        </div>
      </div>
    </main>
  );
}
