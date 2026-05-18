'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Toast from '@/components/ui/Toast';
import { apiRequest } from '@/lib/api';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  UserX, 
  UserCheck, 
  Award,
  Sparkles,
  Calendar,
  AlertCircle,
  FileText,
  ExternalLink,
  X,
  AlertTriangle,
  Search,
  Activity,
  Settings,
  TrendingUp,
  Flame,
  LayoutDashboard
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [pendingNotes, setPendingNotes] = useState([]);
  const [pendingResources, setPendingResources] = useState([]);
  const [resources, setResources] = useState([]);
  const [notes, setNotes] = useState([]);
  const [uploadVisibility, setUploadVisibility] = useState('approved'); // 'approved' or 'pending'
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const [activeTab, setActiveTab] = useState('users'); // 'users'

  // --- User Directory Pagination & Search State ---
  const [usersList, setUsersList] = useState([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [usersOffset, setUsersOffset] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);

  // ─── Toast System ────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  };
  
  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

  // 1. Role & Auth Verification
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (user.role !== 'admin' && user.role !== 'moderator') {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  // 2. Fetch Initial Admin Data (Notes, Resources, Settings, Active Users)
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoadingData(true);
      // Fetch pending notes (admin + moderator)
      const pendingData = await apiRequest('/notes/pending');
      setPendingNotes(pendingData || []);

      // Fetch pending resources (admin only)
      if (user?.role === 'admin') {
        try {
          const pendingResData = await apiRequest('/resources/admin/pending');
          setPendingResources(pendingResData || []);
        } catch (resErr) {
          console.warn('Could not fetch pending resources:', resErr);
        }
      }

      // Fetch resources
      const resourcesData = await apiRequest('/resources');
      setResources(resourcesData || []);

      // Fetch notes
      const notesData = await apiRequest('/notes');
      setNotes(notesData || []);

      // Fetch upload visibility setting
      const visibilityData = await apiRequest('/admin/settings/resource_upload_visibility');
      if (visibilityData && visibilityData.value) {
        setUploadVisibility(visibilityData.value);
      }

      // Fetch today's active users count (Admin only)
      if (user?.role === 'admin') {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        const activeData = await apiRequest(`/users/active?date=${todayStr}`);
        setActiveUsersCount(activeData?.total || 0);
      }

    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // 3. User Directory Fetch & Infinite Scroll Logic
  const fetchUsersBatch = async (searchQuery = '', offsetVal = 0, reset = false) => {
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
        const newTotalLen = (reset ? 0 : usersList.length) + res.users.length;
        setHasMoreUsers(newTotalLen < (res.total || 0));
        setUsersOffset(offsetVal + 20);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast(error.message || 'Failed to fetch users.', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      const timer = setTimeout(() => {
        fetchUsersBatch(userSearch, 0, true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [user, userSearch]);

  const loadMoreUsers = () => {
    if (!loadingUsers && hasMoreUsers) {
      fetchUsersBatch(userSearch, usersOffset, false);
    }
  };

  // Infinite scroll listener
  useEffect(() => {
    if (activeTab !== 'users' || loadingUsers || !hasMoreUsers) return;

    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200) {
        loadMoreUsers();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, loadingUsers, hasMoreUsers, userSearch, usersOffset]);

  // --- Handler for Changing Visibility Setting ---
  const handleVisibilityChange = async (newVal) => {
    try {
      await apiRequest('/admin/settings', {
        method: 'POST',
        body: { key: 'resource_upload_visibility', value: newVal }
      });
      setUploadVisibility(newVal);
      showToast(`Resource upload visibility set to "${newVal.toUpperCase()}" by default.`, 'success');
    } catch (error) {
      console.error('Failed to update visibility setting:', error);
      showToast(error.message || 'Failed to update visibility setting.', 'error');
    }
  };

  // --- Handlers for Notes Moderation ---
  const handleNoteStatus = async (id, newStatus) => {
    try {
      await apiRequest(`/notes/${id}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      });
      showToast(`Note #${id} has been ${newStatus} successfully.`, 'success');
      setPendingNotes(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error(`Failed to update note status:`, error);
      showToast(error.message || `Failed to update note status.`, 'error');
    }
  };

  // --- Handlers for Resources Moderation ---
  const handleResourceStatus = async (id, newStatus) => {
    try {
      await apiRequest(`/resources/${id}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      });
      showToast(`Resource #${id} has been ${newStatus} successfully.`, 'success');
      setPendingResources(prev => prev.filter(r => r.id !== id));
      // If approved, add to resources list
      if (newStatus === 'approved') {
        const approvedRes = pendingResources.find(r => r.id === id);
        if (approvedRes) {
          setResources(prev => [approvedRes, ...prev]);
        }
      }
    } catch (error) {
      console.error(`Failed to update resource status:`, error);
      showToast(error.message || `Failed to update resource status.`, 'error');
    }
  };

  // --- Handlers for User Management ---
  const handleBanUser = async (id, isBanned) => {
    try {
      const endpoint = isBanned ? `/users/${id}/unban` : `/users/${id}/ban`;
      await apiRequest(endpoint, { method: 'POST' });
      showToast(`User #${id} has been ${isBanned ? 'unbanned' : 'banned'} successfully.`, 'success');
      // Update local state matching 'banned' property from backend
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, banned: !isBanned } : u));
    } catch (error) {
      console.error(`Failed to update user ban status:`, error);
      showToast(error.message || `Failed to update user ban status.`, 'error');
    }
  };

  const handlePromoteUser = async (id) => {
    if (!confirm('Are you sure you want to promote this user to Moderator?')) return;
    try {
      await apiRequest(`/users/${id}/promote`, { method: 'POST' });
      showToast(`User #${id} has been promoted to Moderator.`, 'success');
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, role: 'moderator' } : u));
    } catch (error) {
      console.error(`Failed to promote user:`, error);
      showToast(error.message || `Failed to promote user.`, 'error');
    }
  };

  const handleDemoteUser = async (id) => {
    if (!confirm('Are you sure you want to demote this Moderator back to Student?')) return;
    try {
      await apiRequest(`/users/${id}/demote`, { method: 'POST' });
      showToast(`User #${id} has been demoted to Student.`, 'success');
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, role: 'student' } : u));
    } catch (error) {
      console.error(`Failed to demote user:`, error);
      showToast(error.message || `Failed to demote user.`, 'error');
    }
  };

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">
          
          {/* Admin Header Section */}
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 relative text-center md:text-left">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/10 blur-[80px] rounded-full -z-10 animate-pulse" />
            
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[9px] font-black uppercase tracking-[0.3em]">
                <ShieldCheck size={12} className="animate-pulse" /> {user.role.toUpperCase()} PORTAL
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">Management</span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-[600px] mx-auto md:mx-0">
                Review pending notes, manage platform users, configure resource visibility, and monitor system metrics.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
              <Link 
                href="/settings"
                className="flex-1 md:w-14 md:h-14 md:flex-initial flex items-center justify-center gap-2.5 rounded-[1.25rem] bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-amber-500/30 text-slate-500 hover:text-amber-500 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm backdrop-blur-xl py-4 md:py-0"
                title="Account Settings"
              >
                <Settings size={20} className="animate-spin-slow flex-shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest md:hidden">Settings</span>
              </Link>
              
              <div className="flex-1 md:flex-initial flex items-center gap-3.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.25rem] p-3.5 shadow-sm backdrop-blur-xl min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 flex-shrink-0">
                  <Calendar size={18} />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider leading-none">System Date</p>
                  <p className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 mt-1.5 truncate leading-none">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Configuration Card (Admin Only) */}
          {user.role === 'admin' && (
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-in fade-in duration-500 hover:border-blue-500/30 transition-all">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[9px] font-black uppercase tracking-[0.3em]">
                  <Sparkles size={12} /> System Setting
                </div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">Resource Upload Visibility</h3>
                <p className="text-xs font-bold text-slate-500 max-w-[600px] mx-auto sm:mx-0">
                  Configure the default approval status for newly uploaded academic resources. If set to PENDING, an admin must approve them before they appear in the public library.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-100 dark:bg-white/[0.05] p-1.5 rounded-2xl border border-slate-200 dark:border-white/[0.05] shrink-0 w-full sm:w-auto justify-center">
                <button
                  onClick={() => handleVisibilityChange('approved')}
                  className={`w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all cursor-pointer shrink-0 ${
                    uploadVisibility === 'approved'
                      ? 'bg-emerald-50 text-emerald-500 shadow-lg shadow-emerald-500/20 scale-[1.02] sm:scale-105 border border-emerald-500/20 font-black'
                      : 'text-slate-400 hover:text-[var(--foreground)]'
                  }`}
                >
                  Approved by Default
                </button>
                <button
                  onClick={() => handleVisibilityChange('pending')}
                  className={`w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all cursor-pointer shrink-0 ${
                    uploadVisibility === 'pending'
                      ? 'bg-amber-50 text-amber-500 shadow-lg shadow-amber-500/20 scale-[1.02] sm:scale-105 border border-amber-500/20 font-black'
                      : 'text-slate-400 hover:text-[var(--foreground)]'
                  }`}
                >
                  Pending by Default
                </button>
              </div>
            </div>
          )}

          {/* Admin Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Active Users (Admin Only) */}
            {user.role === 'admin' && (
              <Link 
                href="/admin/active_users"
                className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/30 block cursor-pointer"
              >
                <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-2 sm:space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">Active Users</span>
                    <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-500">
                      {loadingData ? '...' : activeUsersCount}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mt-1">Online today</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                    <Activity size={20} className="animate-pulse" />
                  </div>
                </div>
              </Link>
            )}

            {/* Pending Notes (Admin & Moderator) */}
            <Link 
              href="/admin/pending_notes"
              className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-purple-500/30 block cursor-pointer"
            >
              <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-purple-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-2 sm:space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">Pending Notes</span>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-purple-500">
                    {loadingData ? '...' : pendingNotes.length}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mt-1">Awaiting moderation</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                  <Clock size={20} className="animate-pulse" />
                </div>
              </div>
            </Link>

            {/* Pending Resources (Admin Only) */}
            {user.role === 'admin' && (
              <Link 
                href="/admin/pending_resources"
                className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/30 block cursor-pointer"
              >
                <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-2 sm:space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">Pending Resources</span>
                    <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-amber-500">
                      {loadingData ? '...' : pendingResources.length}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mt-1">Awaiting approval</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                    <Layers size={20} className="animate-pulse" />
                  </div>
                </div>
              </Link>
            )}

            {/* Total Users (Admin Only) */}
            {user.role === 'admin' && (
              <Link
                href="/admin/users"
                className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-blue-500/30 block cursor-pointer"
              >
                <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-2 sm:space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">Total Users</span>
                    <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-blue-500">
                      {totalUsersCount}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mt-1">Registered students</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                    <Users size={20} />
                  </div>
                </div>
              </Link>
            )}

            {/* Published Resources */}
            <div className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-2 sm:space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">Library Resources</span>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-500">
                    {loadingData ? '...' : resources.length}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mt-1">Official materials</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                  <ShieldCheck size={20} />
                </div>
              </div>
            </div>

            {/* Trending Resources Card (Admin & Moderator) */}
            <Link 
              href="/admin/trending_resources"
              className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-orange-500/30 block cursor-pointer"
            >
              <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-orange-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-2 sm:space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">Trending Resources</span>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-orange-500">
                    {loadingData ? '...' : resources.filter(r => r.downloads > 0 || r.avg_rating > 0).length || resources.length}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mt-1">Top downloaded</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                  <TrendingUp size={20} className="animate-bounce" />
                </div>
              </div>
            </Link>

            {/* Trending Notes Card (Admin & Moderator) */}
            <Link 
              href="/admin/trending_notes"
              className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-rose-500/30 block cursor-pointer"
            >
              <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-rose-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-2 sm:space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">Trending Notes</span>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-rose-500">
                    {loadingData ? '...' : notes.filter(n => n.downloads > 0).length || notes.length}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mt-1">Top downloaded</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                  <Flame size={20} className="animate-pulse" />
                </div>
              </div>
            </Link>

          </div>

          {/* Quick Shortcuts & Feature Cards */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Management Shortcuts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              
              {/* Feature Card: Upload Resource */}
              <Link 
                href="/resources/upload_resources" 
                className="group relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-[var(--card-bg)] border-2 border-amber-500/30 rounded-[2rem] sm:rounded-[2.5rem] hover:border-amber-500 shadow-lg hover:shadow-amber-500/10 transition-all hover:-translate-y-1 duration-500 flex flex-col justify-between h-[180px] sm:h-[200px]"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -z-10 group-hover:bg-amber-500/20 transition-all" />
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-md group-hover:scale-110 transition-transform duration-500 shrink-0">
                    <Layers size={20} />
                  </div>
                  <span className="text-[9px] font-black px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full uppercase tracking-widest">
                    Portal Entry
                  </span>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-[var(--foreground)] uppercase tracking-tight group-hover:text-amber-500 transition-colors truncate">
                    Upload Academic Resource
                  </h4>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 truncate">
                    Publish official materials <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform shrink-0" />
                  </p>
                </div>
              </Link>

              {/* Feature Card: Pending Resources Tab Shortcut (Admin Only) */}
              {user.role === 'admin' && (
                <Link 
                  href="/admin/pending_resources"
                  className="group relative overflow-hidden p-6 sm:p-8 bg-[var(--card-bg)] border-2 border-[var(--card-border)] hover:border-amber-500/50 rounded-[2rem] sm:rounded-[2.5rem] shadow-lg transition-all hover:-translate-y-1 duration-500 flex flex-col justify-between h-[180px] sm:h-[200px] text-left cursor-pointer block"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-md group-hover:scale-110 transition-transform duration-500 shrink-0">
                      <Layers size={20} />
                    </div>
                    <span className="text-[9px] font-black px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full uppercase tracking-widest">
                      {pendingResources.length} Pending
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-[var(--foreground)] uppercase tracking-tight group-hover:text-amber-500 transition-colors truncate">
                      Resources Moderation
                    </h4>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 truncate">
                      Review library uploads <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform shrink-0" />
                    </p>
                  </div>
                </Link>
              )}

              {/* Feature Card: Pending Notes Tab Shortcut */}
              <Link 
                href="/admin/pending_notes"
                className="group relative overflow-hidden p-6 sm:p-8 bg-[var(--card-bg)] border-2 border-[var(--card-border)] hover:border-purple-500/50 rounded-[2rem] sm:rounded-[2.5rem] shadow-lg transition-all hover:-translate-y-1 duration-500 flex flex-col justify-between h-[180px] sm:h-[200px] text-left cursor-pointer block"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500 shadow-md group-hover:scale-110 transition-transform duration-500 shrink-0">
                    <Clock size={20} />
                  </div>
                  <span className="text-[9px] font-black px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded-full uppercase tracking-widest">
                    {pendingNotes.length} Pending
                  </span>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-[var(--foreground)] uppercase tracking-tight group-hover:text-purple-500 transition-colors truncate">
                    Notes Moderation Queue
                  </h4>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 truncate">
                    Review student notes <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform shrink-0" />
                  </p>
                </div>
              </Link>

              {/* Feature Card: Student Dashboard */}
              <Link 
                href="/dashboard"
                className="group relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-[var(--card-bg)] border-2 border-indigo-500/30 rounded-[2rem] sm:rounded-[2.5rem] hover:border-indigo-500 shadow-lg hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 duration-500 flex flex-col justify-between h-[180px] sm:h-[200px]"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -z-10 group-hover:bg-indigo-500/20 transition-all" />
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-500 shadow-md group-hover:scale-110 transition-transform duration-500 shrink-0">
                    <LayoutDashboard size={20} />
                  </div>
                  <span className="text-[9px] font-black px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-full uppercase tracking-widest">
                    Student View
                  </span>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-[var(--foreground)] uppercase tracking-tight group-hover:text-indigo-500 transition-colors truncate">
                    My Student Dashboard
                  </h4>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 truncate">
                    Access your student portal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform shrink-0" />
                  </p>
                </div>
              </Link>

            </div>
          </div>

        </div>
      </div>

      {/* ─── TOAST NOTIFICATION CONTAINER ─────────────────────────────────────── */}
      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
