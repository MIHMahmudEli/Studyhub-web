'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { apiRequest } from '@/lib/api';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  ArrowLeft, 
  Activity, 
  Search, 
  Clock, 
  Award, 
  UserCheck, 
  UserX,
  Sparkles
} from 'lucide-react';

export default function ActiveUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [activeUsers, setActiveUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Role verification (Only Admin can access)
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (user.role !== 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, authLoading, router]);

  // Fetch active users whenever selectedDate changes
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchActiveUsers(selectedDate);
    }
  }, [user, selectedDate]);

  const fetchActiveUsers = async (dateStr) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest(`/users/active?date=${dateStr}`);
      if (res && res.users) {
        setActiveUsers(res.users);
        setTotalCount(res.total || 0);
      } else {
        setActiveUsers([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Failed to fetch active users:', err);
      setError(err.message || 'Failed to load active users.');
      setActiveUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Helper to set date to Yesterday
  const handleYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  // Helper to set date to Today
  const handleToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = selectedDate === getTodayStr();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">
          
          {/* Navigation & Header */}
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 relative text-center md:text-left">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 blur-[80px] rounded-full -z-10 animate-pulse" />
            
            <div className="space-y-3 sm:space-y-4 w-full md:w-auto">
              <Link 
                href="/admin/dashboard" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[var(--foreground)] transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                Daily Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500">Users</span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-[600px] mx-auto md:mx-0">
                Monitor platform engagement and inspect student activity by specific calendar days.
              </p>
            </div>

            {/* Calendar Controls & Quick Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.5rem] p-4 shadow-sm backdrop-blur-xl w-full md:w-auto justify-center md:justify-end">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/[0.05] p-1.5 rounded-2xl border border-slate-200 dark:border-white/[0.05] w-full sm:w-auto justify-center">
                <button
                  onClick={handleToday}
                  className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                    isToday
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]'
                      : 'text-slate-500 hover:text-[var(--foreground)]'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={handleYesterday}
                  className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                    !isToday && selectedDate === (() => {
                      const y = new Date();
                      y.setDate(y.getDate() - 1);
                      const yr = y.getFullYear();
                      const mo = String(y.getMonth() + 1).padStart(2, '0');
                      const da = String(y.getDate()).padStart(2, '0');
                      return `${yr}-${mo}-${da}`;
                    })()
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]'
                      : 'text-slate-500 hover:text-[var(--foreground)]'
                  }`}
                >
                  Yesterday
                </button>
              </div>

              <div className="relative flex items-center w-full sm:w-auto">
                <div className="absolute left-3.5 text-emerald-500 pointer-events-none">
                  <Calendar size={16} />
                </div>
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.05] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-[var(--foreground)] focus:outline-none focus:border-emerald-500/40 transition-colors w-full sm:w-auto cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Active Users Table & Mobile Cards */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl overflow-hidden backdrop-blur-xl animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <Activity size={20} className="text-emerald-500 animate-pulse" /> Users Online on {selectedDate}
                </h3>
                <p className="text-xs font-bold text-slate-500">Displaying students who logged in or performed actions on this date.</p>
              </div>
              <span className="text-xs font-black px-4 py-2.5 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 uppercase tracking-widest text-center shrink-0">
                Active Count: {totalCount}
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                Fetching active users for {selectedDate}...
              </div>
            ) : error ? (
              <div className="py-16 text-center space-y-3 border-2 border-dashed border-red-500/20 rounded-[2rem] bg-red-500/5">
                <p className="text-sm font-black uppercase tracking-widest text-red-500">Error Loading Data</p>
                <p className="text-xs font-bold text-slate-500">{error}</p>
              </div>
            ) : activeUsers.length === 0 ? (
              <div className="py-16 text-center space-y-3 border-2 border-dashed border-[var(--card-border)] rounded-[2rem]">
                <div className="w-12 h-12 bg-slate-100 dark:bg-white/[0.05] text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-200 dark:border-white/[0.05] shrink-0">
                  <Users size={24} />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">No Activity Found</p>
                <p className="text-xs font-bold text-slate-500">No users were recorded active on {selectedDate}.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View (Hidden on mobile below md) */}
                <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/[0.1]">
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
                      {activeUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 sm:py-5 pl-4 max-w-[220px] sm:max-w-[250px]">
                            <div className="flex items-center gap-3">
                              {u.profile_pic ? (
                                <img src={u.profile_pic} alt="" className="w-8 h-8 rounded-xl object-cover border border-[var(--card-border)] shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-black text-white shrink-0">
                                  {u.name?.[0] || 'U'}
                                </div>
                              )}
                              <div className="truncate">
                                <p className="font-black text-sm text-[var(--foreground)] truncate flex items-center gap-2">
                                  {u.name} {u.banned && <span className="text-[9px] font-black px-2 py-0.5 bg-red-500/10 text-red-500 rounded-md uppercase tracking-widest border border-red-500/20 shrink-0">Banned</span>}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">{u.email || 'No email available'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 sm:py-5 whitespace-nowrap text-slate-300">
                            {u.dept?.toUpperCase() || 'GENERAL'}
                          </td>
                          <td className="py-4 sm:py-5 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${
                              u.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                              u.role === 'moderator' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                              'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }`}>
                              {u.role || 'student'}
                            </span>
                          </td>
                          <td className="py-4 sm:py-5 font-black text-amber-500 whitespace-nowrap">
                            {u.points || 0} PTS
                          </td>
                          <td className="py-4 sm:py-5 text-right pr-4 whitespace-nowrap font-black text-emerald-500">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <Clock size={14} />
                              {new Date(u.last_active_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View (Hidden on desktop md and above) */}
                <div className="block md:hidden space-y-4">
                  {activeUsers.map((u) => (
                    <div key={u.id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 space-y-4 shadow-sm hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        {u.profile_pic ? (
                          <img src={u.profile_pic} alt="" className="w-10 h-10 rounded-xl object-cover border border-[var(--card-border)] shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-black text-white shrink-0">
                            {u.name?.[0] || 'U'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-sm text-[var(--foreground)] truncate flex items-center gap-2">
                            {u.name} {u.banned && <span className="text-[9px] font-black px-2 py-0.5 bg-red-500/10 text-red-500 rounded-md uppercase tracking-widest border border-red-500/20 shrink-0">Banned</span>}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{u.email || 'No email available'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border)]">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${
                          u.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          u.role === 'moderator' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {u.role || 'student'}
                        </span>
                        <span className="font-black text-xs text-amber-500 shrink-0">
                          {u.points || 0} PTS
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border)] text-xs font-black text-emerald-500">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Active Time</span>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {new Date(u.last_active_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}
