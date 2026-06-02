import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export function useAdminDashboard() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();
  const usersFetchedRef = useRef(false);

  const [pendingNotes, setPendingNotes] = useState([]);
  const [pendingResources, setPendingResources] = useState([]);
  const [resources, setResources] = useState([]);
  const [notes, setNotes] = useState([]);
  const [uploadVisibility, setUploadVisibility] = useState('approved');
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [permissions, setPermissions] = useState([
    { key: 'perm_view_active_users', value: 'admin' },
    { key: 'perm_view_users', value: 'admin' },
    { key: 'perm_view_resources', value: 'admin' },
  ]);
  const [loadingData, setLoadingData] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });
  const [activeTab, setActiveTab] = useState('users');
  const [platformTotalUsers, setPlatformTotalUsers] = useState(0);

  const [usersList, setUsersList] = useState([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [usersOffset, setUsersOffset] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  }, []);

  const closeToast = useCallback(() => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (user.role !== 'admin' && user.role !== 'moderator') {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoadingData(true);

      const todayStr = `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}-${String(new Date().getUTCDate()).padStart(2, '0')}`;

      const permissionsData = await ((user?.role === 'admin' || user?.role === 'moderator')
        ? apiRequest('/admin/permissions').catch(() => [])
        : Promise.resolve([]));

      const permArr = Array.isArray(permissionsData) ? permissionsData : [];
      const activePerm = permArr.find(p => p.key === 'perm_view_active_users');
      const usersPerm = permArr.find(p => p.key === 'perm_view_users');
      const hasActivePerm = user?.role === 'admin' || activePerm?.value === 'admin+moderator';
      const canViewUsers = user?.role === 'admin' || usersPerm?.value === 'admin+moderator';

      const [
        pendingNotesData,
        pendingResData,
        resourcesData,
        notesData,
        visibilityData,
        activeData,
        platformTotalData,
      ] = await Promise.all([
        apiRequest('/notes/pending').catch(() => []),
        (user?.role === 'admin' || user?.role === 'moderator')
          ? apiRequest('/resources/admin/pending').catch(() => [])
          : Promise.resolve([]),
        apiRequest('/resources').catch(() => []),
        apiRequest('/notes').catch(() => []),
        apiRequest('/admin/settings/resource_upload_visibility').catch(() => null),
        hasActivePerm
          ? apiRequest(`/users/active?date=${todayStr}`).catch(() => null)
          : Promise.resolve(null),
        canViewUsers
          ? apiRequest('/users?limit=1').catch(() => ({ total: 0 }))
          : Promise.resolve({ total: 0 }),
      ]);

      setPendingNotes(Array.isArray(pendingNotesData) ? pendingNotesData : (pendingNotesData?.data || []));
      setPendingResources(Array.isArray(pendingResData) ? pendingResData : (pendingResData?.data || []));
      setResources(Array.isArray(resourcesData) ? resourcesData : (resourcesData?.data || []));
      setNotes(Array.isArray(notesData) ? notesData : (notesData?.data || []));

      if (visibilityData?.value) setUploadVisibility(visibilityData.value);

      setActiveUsersCount(activeData?.total || 0);
      setPlatformTotalUsers(platformTotalData?.total || 0);
      setPermissions(permArr);

    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (tokenReady && user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchAdminData();
    }
  }, [tokenReady, user, fetchAdminData]);

  const fetchPermissionsOnly = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiRequest('/admin/permissions');
      if (Array.isArray(data)) {
        const prevPerm = permissions.find(p => p.key === 'perm_view_users')?.value;
        const newPerm = data.find(p => p.key === 'perm_view_users')?.value;
        if (prevPerm !== newPerm && newPerm === 'admin+moderator') {
          const countData = await apiRequest('/users?limit=1').catch(() => ({ total: 0 }));
          setPlatformTotalUsers(countData?.total || 0);
        }
        setPermissions(data);
      }
    } catch (err) {}
  }, [user, permissions]);

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
  }, [tokenReady, user, fetchPermissionsOnly]);

  // ─── User Directory ──────────────────────────────────────────────────────────

  const fetchUsersBatch = useCallback(async (searchQuery = '', offsetVal = 0, reset = false) => {
    try {
      setLoadingUsers(true);
      const res = await apiRequest(`/users?search=${encodeURIComponent(searchQuery)}&limit=20&offset=${offsetVal}`);
      if (res && res.users) {
        setUsersList(prev => {
          const updatedList = reset ? res.users : [...prev, ...res.users];
          setTotalUsersCount(res.total || 0);
          setPlatformTotalUsers(res.total || 0);
          setHasMoreUsers(updatedList.length < (res.total || 0));
          setUsersOffset(offsetVal + 20);
          return updatedList;
        });
      }
    } catch (error) {
      if (error.status === 403 || error.message?.includes('Access denied')) { return; }
      console.error('Failed to fetch users:', error);
      showToast(error.message || 'Failed to fetch users.', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!tokenReady || !user || (user.role !== 'admin' && user.role !== 'moderator')) return;
    if (user.role !== 'admin' && permissions.find(p => p.key === 'perm_view_users')?.value !== 'admin+moderator') {
      usersFetchedRef.current = false;
      return;
    }
    if (userSearch === '' && usersFetchedRef.current) return;
    usersFetchedRef.current = userSearch === '';
    if (userSearch) {
      const timer = setTimeout(() => fetchUsersBatch(userSearch, 0, true), 400);
      return () => clearTimeout(timer);
    }
    fetchUsersBatch(userSearch, 0, true);
  }, [tokenReady, user, userSearch, permissions, fetchUsersBatch]);

  const loadMoreUsers = useCallback(() => {
    if (!loadingUsers && hasMoreUsers) {
      if (user?.role !== 'admin' && permissions.find(p => p.key === 'perm_view_users')?.value !== 'admin+moderator') return;
      fetchUsersBatch(userSearch, usersOffset, false);
    }
  }, [loadingUsers, hasMoreUsers, user, permissions, fetchUsersBatch, userSearch, usersOffset]);

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
  }, [activeTab, loadingUsers, hasMoreUsers, userSearch, usersOffset, user, permissions, loadMoreUsers]);

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  const handleVisibilityChange = useCallback(async (newVal) => {
    try {
      await apiRequest('/admin/settings', {
        method: 'POST',
        body: { key: 'resource_upload_visibility', value: newVal },
      });
      setUploadVisibility(newVal);
      showToast(`Resource upload visibility set to "${newVal.toUpperCase()}" by default.`, 'success');
    } catch (error) {
      console.error('Failed to update visibility setting:', error);
      showToast(error.message || 'Failed to update visibility setting.', 'error');
    }
  }, [showToast]);

  const handlePermissionToggle = useCallback(async (key, newValue) => {
    try {
      await apiRequest(`/admin/permissions/${key}`, {
        method: 'PATCH',
        body: { value: newValue },
      });
      setPermissions(prev => prev.map(p => p.key === key ? { ...p, value: newValue } : p));
      const label = permissions.find(p => p.key === key)?.label || key;
      showToast(`"${label}" is now ${newValue === 'admin+moderator' ? 'accessible to moderators' : 'restricted to admins only'}.`, 'success');
    } catch (error) {
      console.error('Failed to update permission:', error);
      showToast(error.message || 'Failed to update permission.', 'error');
    }
  }, [permissions, showToast]);

  const handleNoteStatus = useCallback(async (id, newStatus) => {
    try {
      await apiRequest(`/notes/${id}/status`, { method: 'PATCH', body: { status: newStatus } });
      showToast(`Note #${id} has been ${newStatus} successfully.`, 'success');
      setPendingNotes(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to update note status:', error);
      showToast(error.message || 'Failed to update note status.', 'error');
    }
  }, [showToast]);

  const handleResourceStatus = useCallback(async (id, newStatus) => {
    try {
      await apiRequest(`/resources/${id}/status`, { method: 'PATCH', body: { status: newStatus } });
      showToast(`Resource #${id} has been ${newStatus} successfully.`, 'success');
      setPendingResources(prev => prev.filter(r => r.id !== id));
      if (newStatus === 'approved') {
        const approvedRes = pendingResources.find(r => r.id === id);
        if (approvedRes) {
          setResources(prev => [approvedRes, ...prev]);
        }
      }
    } catch (error) {
      console.error('Failed to update resource status:', error);
      showToast(error.message || 'Failed to update resource status.', 'error');
    }
  }, [showToast, pendingResources]);

  const handleBanUser = useCallback(async (id, isBanned) => {
    try {
      const endpoint = isBanned ? `/users/${id}/unban` : `/users/${id}/ban`;
      await apiRequest(endpoint, { method: 'POST' });
      showToast(`User #${id} has been ${isBanned ? 'unbanned' : 'banned'} successfully.`, 'success');
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, banned: !isBanned } : u));
    } catch (error) {
      console.error('Failed to update user ban status:', error);
      showToast(error.message || 'Failed to update user ban status.', 'error');
    }
  }, [showToast]);

  const handlePromoteUser = useCallback(async (id) => {
    if (!confirm('Are you sure you want to promote this user to Moderator?')) return;
    try {
      await apiRequest(`/users/${id}/promote`, { method: 'POST' });
      showToast(`User #${id} has been promoted to Moderator.`, 'success');
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, role: 'moderator' } : u));
    } catch (error) {
      console.error('Failed to promote user:', error);
      showToast(error.message || 'Failed to promote user.', 'error');
    }
  }, [showToast]);

  const handleDemoteUser = useCallback(async (id) => {
    if (!confirm('Are you sure you want to demote this Moderator back to Student?')) return;
    try {
      await apiRequest(`/users/${id}/demote`, { method: 'POST' });
      showToast(`User #${id} has been demoted to Student.`, 'success');
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, role: 'student' } : u));
    } catch (error) {
      console.error('Failed to demote user:', error);
      showToast(error.message || 'Failed to demote user.', 'error');
    }
  }, [showToast]);

  return {
    user, authLoading, loadingData, toast, closeToast,
    uploadVisibility, permissions, activeUsersCount, platformTotalUsers,
    pendingNotes, pendingResources, resources, notes,
    activeTab, setActiveTab,
    usersList, setUsersList,
    totalUsersCount, setTotalUsersCount,
    userSearch, setUserSearch,
    loadingUsers, hasMoreUsers, loadMoreUsers,
    fetchAdminData,
    handleVisibilityChange, handlePermissionToggle,
    handleNoteStatus, handleResourceStatus,
    handleBanUser, handlePromoteUser, handleDemoteUser,
    showToast,
  };
}
