'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { apiRequest } from '@/lib/api';
import {
  ArrowLeft,
  Users,
  Search,
  UserX,
  UserCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  ShieldCheck,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [usersList, setUsersList] = useState([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [usersOffset, setUsersOffset] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });

  // ─── Toast ────────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  };
  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

  // ─── Role guard (Admin only) ───────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/auth');
      else if (user.role !== 'admin') router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // ─── Fetch users ──────────────────────────────────────────────────────────
  const fetchUsersBatch = useCallback(async (searchQuery = '', offsetVal = 0, reset = false) => {
    try {
      setLoadingUsers(true);
      const res = await apiRequest(`/users?search=${encodeURIComponent(searchQuery)}&limit=20&offset=${offsetVal}`);
      if (res && res.users) {
        if (reset) {
          setUsersList(res.users);
        } else {
          setUsersList(prev => [...prev, ...res.users]);
        }
        setTotalUsersCount(res.total || 0);
        const newLen = (reset ? 0 : usersList.length) + res.users.length;
        setHasMoreUsers(newLen < (res.total || 0));
        setUsersOffset(offsetVal + 20);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      showToast(err.message || 'Failed to fetch users.', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, [usersList.length]);

  // Debounced search
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const timer = setTimeout(() => {
      fetchUsersBatch(userSearch, 0, true);
    }, 400);
    return () => clearTimeout(timer);
  }, [user, userSearch]);

  // Infinite scroll
  useEffect(() => {
    if (loadingUsers || !hasMoreUsers) return;
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200) {
        fetchUsersBatch(userSearch, usersOffset, false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingUsers, hasMoreUsers, userSearch, usersOffset]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleBanUser = async (id, isBanned) => {
    try {
      const endpoint = isBanned ? `/users/${id}/unban` : `/users/${id}/ban`;
      await apiRequest(endpoint, { method: 'POST' });
      showToast(`User #${id} has been ${isBanned ? 'unbanned' : 'banned'} successfully.`, 'success');
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, banned: !isBanned } : u));
    } catch (err) {
      showToast(err.message || 'Failed to update ban status.', 'error');
    }
  };

  const handlePromoteUser = async (id) => {
    if (!confirm('Are you sure you want to promote this user to Moderator?')) return;
    try {
      await apiRequest(`/users/${id}/promote`, { method: 'POST' });
      showToast(`User #${id} promoted to Moderator.`, 'success');
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, role: 'moderator' } : u));
    } catch (err) {
      showToast(err.message || 'Failed to promote user.', 'error');
    }
  };

  const handleDemoteUser = async (id) => {
    if (!confirm('Are you sure you want to demote this moderator to Student?')) return;
    try {
      await apiRequest(`/users/${id}/demote`, { method: 'POST' });
      showToast(`User #${id} demoted to Student.`, 'success');
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, role: 'student' } : u));
    } catch (err) {
      showToast(err.message || 'Failed to demote user.', 'error');
    }
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 relative text-center md:text-left">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full -z-10 animate-pulse" />

            <div className="space-y-3 sm:space-y-4 w-full md:w-auto">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[var(--foreground)] transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                User <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">Directory</span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-[600px] mx-auto md:mx-0">
                Manage student access, ban violators, and assign moderator privileges across the platform.
              </p>
            </div>

            {/* Stats badge */}
            <div className="flex items-center gap-3.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.5rem] p-4 shadow-sm backdrop-blur-xl w-full md:w-auto justify-center md:justify-end shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 shadow-lg">
                <Users size={22} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider leading-none">Platform Users</p>
                <p className="text-sm font-black uppercase text-blue-500 mt-1.5 leading-none">
                  {totalUsersCount} Registered
                </p>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl overflow-hidden backdrop-blur-xl animate-in fade-in duration-500">
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck size={20} className="text-blue-500" /> Platform User Directory
                </h3>
                <p className="text-xs font-bold text-slate-500">Manage student access, ban violators, and assign moderator privileges.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search user by name, email, dept..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.05] rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold focus:outline-none focus:border-blue-500/40 transition-colors text-[var(--foreground)]"
                  />
                  {userSearch && (
                    <button onClick={() => setUserSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <span className="text-xs font-black px-4 py-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20 uppercase tracking-widest text-center shrink-0">
                  Total: {totalUsersCount}
                </span>
              </div>
            </div>

            {loadingUsers && usersList.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading user directory...</div>
            ) : usersList.length === 0 ? (
              <div className="py-16 text-center space-y-2 border-2 border-dashed border-[var(--card-border)] rounded-[2rem]">
                <p className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">No Users Found</p>
                <p className="text-xs font-bold text-slate-500">No users matched your search criteria.</p>
              </div>
            ) : (
              <>
                {/* ─── Desktop Table ──────────────────────────────────────── */}
                <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/[0.1]">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="border-b border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <th className="pb-4 pl-4 whitespace-nowrap">User & Email</th>
                        <th className="pb-4 whitespace-nowrap">Current Role</th>
                        <th className="pb-4 whitespace-nowrap">Points</th>
                        <th className="pb-4 text-right pr-4 whitespace-nowrap">Management Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)] text-xs font-bold">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 sm:py-5 pl-4 max-w-[220px] sm:max-w-[250px]">
                            <div className="flex items-center gap-3">
                              {u.profile_pic ? (
                                <img src={u.profile_pic} alt="" className="w-8 h-8 rounded-xl object-cover border border-[var(--card-border)] shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-black text-white shrink-0">
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
                          <td className="py-4 sm:py-5 text-right pr-4 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2">
                              {u.role !== 'admin' && (
                                <>
                                  {u.role === 'student' && (
                                    <button
                                      onClick={() => handlePromoteUser(u.id)}
                                      className="px-3 py-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white rounded-xl border border-purple-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1 cursor-pointer shrink-0"
                                      title="Promote to Moderator"
                                    >
                                      <Award size={14} /> Promote
                                    </button>
                                  )}
                                  {u.role === 'moderator' && (
                                    <button
                                      onClick={() => handleDemoteUser(u.id)}
                                      className="px-3 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl border border-amber-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1 cursor-pointer shrink-0"
                                      title="Demote to Student"
                                    >
                                      <UserX size={14} /> Demote
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleBanUser(u.id, u.banned)}
                                    className={`px-3 py-2 rounded-xl border transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1 cursor-pointer shrink-0 ${
                                      u.banned
                                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20'
                                    }`}
                                  >
                                    {u.banned ? <><UserCheck size={14} /> Unban</> : <><UserX size={14} /> Ban</>}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ─── Mobile Cards ───────────────────────────────────────── */}
                <div className="block md:hidden space-y-4">
                  {usersList.map((u) => (
                    <div key={u.id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 space-y-4 shadow-sm hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        {u.profile_pic ? (
                          <img src={u.profile_pic} alt="" className="w-10 h-10 rounded-xl object-cover border border-[var(--card-border)] shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-black text-white shrink-0">
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
                        <span className="font-black text-xs text-amber-500 shrink-0">{u.points || 0} PTS</span>
                      </div>

                      {u.role !== 'admin' && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--card-border)]">
                          {u.role === 'student' && (
                            <button
                              onClick={() => handlePromoteUser(u.id)}
                              className="flex-1 py-2.5 bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white rounded-xl border border-purple-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Award size={14} /> Promote
                            </button>
                          )}
                          {u.role === 'moderator' && (
                            <button
                              onClick={() => handleDemoteUser(u.id)}
                              className="flex-1 py-2.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl border border-amber-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <UserX size={14} /> Demote
                            </button>
                          )}
                          <button
                            onClick={() => handleBanUser(u.id, u.banned)}
                            className={`flex-1 py-2.5 rounded-xl border transition-all uppercase text-[10px] tracking-widest font-black flex items-center justify-center gap-1 cursor-pointer ${
                              u.banned
                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border-emerald-500/20'
                                : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20'
                            }`}
                          >
                            {u.banned ? <><UserCheck size={14} /> Unban</> : <><UserX size={14} /> Ban</>}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {loadingUsers && usersList.length > 0 && (
              <div className="py-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                Loading more users...
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ─── Toast ──────────────────────────────────────────────────────────── */}
      {toast.show && (
        <div className={`fixed top-24 right-6 z-[999999] transition-all duration-500 ease-in-out ${
          toast.isClosing ? 'translate-x-20 opacity-0 pointer-events-none' : 'animate-in slide-in-from-right fade-in'
        }`}>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-xl max-w-xs ${
            toast.type === 'error'
              ? 'bg-red-500/10 border-red-500/20 text-red-500'
              : toast.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle size={16} className="shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle size={16} className="shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="shrink-0" />
            )}
            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed flex-1">{toast.message}</p>

            <div className="relative w-6 h-6 shrink-0 flex items-center justify-center ml-1">
              <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-20" />
                <circle
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray="62.8"
                  strokeDashoffset="62.8"
                  style={{ animation: 'toastProgress 5s linear forwards', strokeLinecap: 'round' }}
                />
              </svg>
              <button
                onClick={closeToast}
                className="absolute inset-0 flex items-center justify-center hover:scale-110 transition-transform z-10 focus:outline-none cursor-pointer"
              >
                <X size={10} />
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes toastProgress {
              from { stroke-dashoffset: 62.8; }
              to { stroke-dashoffset: 0; }
            }
          `}</style>
        </div>
      )}
    </main>
  );
}
