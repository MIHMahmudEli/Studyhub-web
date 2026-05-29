'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Toast from '@/components/ui/Toast';
import { apiRequest } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import StatsCard from '@/components/admin/StatsCard';
import ConfigCard from '@/components/admin/ConfigCard';
import ShortcutCard from '@/components/admin/ShortcutCard';
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
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();
  const usersFetchedRef = useRef(false);

  const [pendingNotes, setPendingNotes] = useState([]);
  const [pendingResources, setPendingResources] = useState([]);
  const [resources, setResources] = useState([]);
  const [notes, setNotes] = useState([]);
  const [uploadVisibility, setUploadVisibility] = useState('approved'); // 'approved' or 'pending'
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [permissions, setPermissions] = useState([
    { key: 'perm_view_active_users', value: 'admin' },
    { key: 'perm_view_users', value: 'admin' },
    { key: 'perm_view_resources', value: 'admin' },
    { key: 'perm_manage_notes', value: 'admin' },
    { key: 'perm_manage_resources', value: 'admin' },
    { key: 'perm_manage_trending', value: 'admin' },
  ]);
  const [loadingData, setLoadingData] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const [activeTab, setActiveTab] = useState('users'); // 'users'
  const [platformTotalUsers, setPlatformTotalUsers] = useState(0);

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
    if (tokenReady && user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchAdminData();
    }
  }, [tokenReady, user]);

  // Lightweight permission-only refetch on page focus / visibility change
  const fetchPermissionsOnly = async () => {
    if (!user) return;
    try {
      const data = await apiRequest('/admin/permissions');
      if (Array.isArray(data)) setPermissions(data);
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    if (!tokenReady || !user || (user.role !== 'admin' && user.role !== 'moderator')) return;
    window.addEventListener('focus', fetchPermissionsOnly);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') fetchPermissionsOnly();
    });
    return () => {
      window.removeEventListener('focus', fetchPermissionsOnly);
      document.removeEventListener('visibilitychange', fetchPermissionsOnly);
    };
  }, [tokenReady, user]);

  const fetchAdminData = async () => {
    try {
      setLoadingData(true);
      
      const d = new Date();
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      // Fetch all dashboard data in parallel to avoid sequential API waterfalls
      const [
        pendingNotesData,
        pendingResData,
        resourcesData,
        notesData,
        visibilityData,
        activeData,
        permissionsData,
        platformTotalData
      ] = await Promise.all([
        apiRequest('/notes/pending').catch(() => []),
        (user?.role === 'admin' || user?.role === 'moderator')
          ? apiRequest('/resources/admin/pending').catch(() => [])
          : Promise.resolve([]),
        apiRequest('/resources').catch(() => []),
        apiRequest('/notes').catch(() => []),
        apiRequest('/admin/settings/resource_upload_visibility').catch(() => null),
        user?.role === 'admin'
          ? apiRequest(`/users/active?date=${todayStr}`).catch(() => null)
          : Promise.resolve(null),
        (user?.role === 'admin' || user?.role === 'moderator')
          ? apiRequest('/admin/permissions').catch(() => [])
          : Promise.resolve([]),
        apiRequest('/users?limit=1').catch(() => ({ total: 0 })),
      ]);

      setPendingNotes(Array.isArray(pendingNotesData) ? pendingNotesData : (pendingNotesData?.data || []));
      setPendingResources(Array.isArray(pendingResData) ? pendingResData : (pendingResData?.data || []));
      setResources(Array.isArray(resourcesData) ? resourcesData : (resourcesData?.data || []));
      setNotes(Array.isArray(notesData) ? notesData : (notesData?.data || []));
      
      if (visibilityData && visibilityData.value) {
        setUploadVisibility(visibilityData.value);
      }
      
      setActiveUsersCount(activeData?.total || 0);
      if (Array.isArray(permissionsData)) setPermissions(permissionsData);
      setPlatformTotalUsers(platformTotalData?.total || 0);

    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // For moderators: fetch active users once permissions confirm the toggle is ON
  useEffect(() => {
    if (!user || user.role !== 'moderator') return;
    const perm = permissions.find(p => p.key === 'perm_view_active_users');
    if (perm?.value !== 'admin+moderator') return;
    const d = new Date();
    const todayStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    apiRequest(`/users/active?date=${todayStr}`)
      .then(res => setActiveUsersCount(res?.total || 0))
      .catch(() => {});
  }, [permissions, user]);

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
      if (error.status === 403 || error.message?.includes('Access denied')) { return; }
      console.error('Failed to fetch users:', error);
      showToast(error.message || 'Failed to fetch users.', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch user directory — initial load is immediate, search is debounced
  useEffect(() => {
    if (!tokenReady || !user || (user.role !== 'admin' && user.role !== 'moderator')) return;
    if (user.role !== 'admin' && permissions.find(p => p.key === 'perm_view_users')?.value !== 'admin+moderator') {
      usersFetchedRef.current = false;
      return;
    }
    // Skip if already fetched for empty search (guards against duplicate on permissions load)
    if (userSearch === '' && usersFetchedRef.current) return;
    usersFetchedRef.current = userSearch === '';
    const delay = userSearch ? 400 : 0;
    const timer = setTimeout(() => fetchUsersBatch(userSearch, 0, true), delay);
    return () => clearTimeout(timer);
  }, [tokenReady, user, userSearch, permissions]);

  const loadMoreUsers = () => {
    if (!loadingUsers && hasMoreUsers) {
      if (user?.role !== 'admin' && permissions.find(p => p.key === 'perm_view_users')?.value !== 'admin+moderator') return;
      fetchUsersBatch(userSearch, usersOffset, false);
    }
  };

  // Infinite scroll listener
  useEffect(() => {
    if (activeTab !== 'users' || loadingUsers || !hasMoreUsers) return;
    if (user?.role !== 'admin' && permissions.find(p => p.key === 'perm_view_users')?.value !== 'admin+moderator') return;

    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200) {
        loadMoreUsers();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, loadingUsers, hasMoreUsers, userSearch, usersOffset, user, permissions]);

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

  // --- Handler for Permission Toggle ---
  const handlePermissionToggle = async (key, newValue) => {
    try {
      await apiRequest(`/admin/permissions/${key}`, {
        method: 'PATCH',
        body: { value: newValue }
      });
      setPermissions(prev => prev.map(p => p.key === key ? { ...p, value: newValue } : p));
      const label = permissions.find(p => p.key === key)?.label || key;
      showToast(`"${label}" is now ${newValue === 'admin+moderator' ? 'accessible to moderators' : 'restricted to admins only'}.`, 'success');
    } catch (error) {
      console.error('Failed to update permission:', error);
      showToast(error.message || 'Failed to update permission.', 'error');
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
          {user?.role === 'admin' && (
            <ConfigCard
              title="Resource Upload Visibility"
              subtitle="Configure the default approval status for newly uploaded academic resources. If set to PENDING, an admin must approve them before they appear in the public library."
              badgeText="System Setting"
              badgeIcon={Sparkles}
              loading={loadingData}
            >
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
            </ConfigCard>
          )}

          {/* Admin Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Active Users (Admin & Moderator with permission) */}
            {(user?.role === 'admin' || permissions.find(p => p.key === 'perm_view_active_users')?.value === 'admin+moderator') && (
              <StatsCard
                href="/admin/active_users"
                title="Active Users"
                value={activeUsersCount}
                subtitle="Online today"
                icon={Activity}
                colorScheme="emerald"
                iconAnimation="animate-pulse"
                loading={loadingData}
                permissionKey={user?.role === 'admin' ? 'perm_view_active_users' : undefined}
                permissionValue={permissions.find(p => p.key === 'perm_view_active_users')?.value}
                onPermissionToggle={handlePermissionToggle}
              />
            )}

            {/* Pending Notes (Admin & Moderator) */}
            <StatsCard
              href="/admin/pending_notes"
              title="Pending Notes"
              value={pendingNotes.length}
              subtitle="Awaiting moderation"
              icon={Clock}
              colorScheme="purple"
              iconAnimation="animate-pulse"
              loading={loadingData}
              permissionKey={user?.role === 'admin' ? 'perm_manage_notes' : undefined}
              permissionValue={permissions.find(p => p.key === 'perm_manage_notes')?.value}
              onPermissionToggle={handlePermissionToggle}
            />

            {/* Pending Resources (Admin & Moderator) */}
            {(user?.role === 'admin' || user?.role === 'moderator') && (
              <StatsCard
                href="/admin/pending_resources"
                title="Pending Resources"
                value={pendingResources.length}
                subtitle="Awaiting approval"
                icon={Layers}
                colorScheme="amber"
                iconAnimation="animate-pulse"
                loading={loadingData}
                permissionKey={user?.role === 'admin' ? 'perm_manage_resources' : undefined}
                permissionValue={permissions.find(p => p.key === 'perm_manage_resources')?.value}
                onPermissionToggle={handlePermissionToggle}
              />
            )}

            {/* Total Users / User Directory (Admin & Moderator with permission) */}
            {(user?.role === 'admin' || permissions.find(p => p.key === 'perm_view_users')?.value === 'admin+moderator') && (
              <StatsCard
                href="/admin/users"
                title="Total Users"
                value={platformTotalUsers}
                subtitle="Registered students"
                icon={Users}
                colorScheme="blue"
                loading={loadingUsers || loadingData}
                permissionKey={user?.role === 'admin' ? 'perm_view_users' : undefined}
                permissionValue={permissions.find(p => p.key === 'perm_view_users')?.value}
                onPermissionToggle={handlePermissionToggle}
              />
            )}

            {/* Library Resources (Admin & Moderator with permission) */}
            {(user?.role === 'admin' || permissions.find(p => p.key === 'perm_view_resources')?.value === 'admin+moderator') && (
              <StatsCard
                href="/admin/resources"
                title="Library Resources"
                value={resources.length}
                subtitle="Official materials"
                icon={ShieldCheck}
                colorScheme="emerald"
                loading={loadingData}
                permissionKey={user?.role === 'admin' ? 'perm_view_resources' : undefined}
                permissionValue={permissions.find(p => p.key === 'perm_view_resources')?.value}
                onPermissionToggle={handlePermissionToggle}
              />
            )}

            {/* Trending Resources Card (Admin & Moderator) */}
            <StatsCard
              href="/admin/trending_resources"
              title="Trending Resources"
              value={resources.filter(r => r.downloads > 0 || r.avg_rating > 0).length || resources.length}
              subtitle="Top downloaded"
              icon={TrendingUp}
              colorScheme="orange"
              iconAnimation="animate-bounce"
              loading={loadingData}
              permissionKey={user?.role === 'admin' ? 'perm_manage_trending' : undefined}
              permissionValue={permissions.find(p => p.key === 'perm_manage_trending')?.value}
              onPermissionToggle={handlePermissionToggle}
            />

            {/* Trending Notes Card (Admin & Moderator) */}
            <StatsCard
              href="/admin/trending_notes"
              title="Trending Notes"
              value={notes.filter(n => n.downloads > 0).length || notes.length}
              subtitle="Top downloaded"
              icon={Flame}
              colorScheme="rose"
              iconAnimation="animate-pulse"
              loading={loadingData}
              permissionKey={user?.role === 'admin' ? 'perm_manage_trending' : undefined}
              permissionValue={permissions.find(p => p.key === 'perm_manage_trending')?.value}
              onPermissionToggle={handlePermissionToggle}
            />

          </div>

          {/* Quick Shortcuts & Feature Cards */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Management Shortcuts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              
              {/* Feature Card: Upload Resource */}
              <ShortcutCard
                href="/resources/upload_resources"
                title="Upload Academic Resource"
                description="Publish official materials"
                badgeText="Portal Entry"
                icon={Layers}
                colorScheme="amber"
                loading={loadingData}
              />

              {/* Feature Card: Pending Resources Tab Shortcut (Admin & Moderator) */}
              {(user?.role === 'admin' || user?.role === 'moderator') && (
                <ShortcutCard
                  href="/admin/pending_resources"
                  title="Resources Moderation"
                  description="Review library uploads"
                  badgeText={`${pendingResources.length} Pending`}
                  icon={Layers}
                  colorScheme="amber"
                  loading={loadingData}
                  permissionKey={user?.role === 'admin' ? 'perm_manage_resources' : undefined}
                  permissionValue={permissions.find(p => p.key === 'perm_manage_resources')?.value}
                  onPermissionToggle={handlePermissionToggle}
                />
              )}

              {/* Feature Card: Pending Notes Tab Shortcut */}
              <ShortcutCard
                href="/admin/pending_notes"
                title="Notes Moderation Queue"
                description="Review student notes"
                badgeText={`${pendingNotes.length} Pending`}
                icon={Clock}
                colorScheme="purple"
                loading={loadingData}
                permissionKey={user?.role === 'admin' ? 'perm_manage_notes' : undefined}
                permissionValue={permissions.find(p => p.key === 'perm_manage_notes')?.value}
                onPermissionToggle={handlePermissionToggle}
              />

              {/* Feature Card: Student Dashboard */}
              <ShortcutCard
                href="/dashboard"
                title="My Student Dashboard"
                description="Access your student portal"
                badgeText="Student View"
                icon={LayoutDashboard}
                colorScheme="indigo"
                loading={loadingData}
              />

            </div>
          </div>

        </div>
      </div>

      {/* ─── TOAST NOTIFICATION CONTAINER ─────────────────────────────────────── */}
      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
