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
  AlertCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [pendingNotes, setPendingNotes] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [resources, setResources] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'users'

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

  // 2. Fetch Admin Data
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoadingData(true);
      // Fetch pending notes
      const pendingData = await apiRequest('/notes/pending');
      setPendingNotes(pendingData || []);

      // Fetch users list
      const usersData = await apiRequest('/users/leaderboard');
      setUsersList(usersData || []);

      // Fetch resources
      const resourcesData = await apiRequest('/resources');
      setResources(resourcesData || []);

    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // --- Handlers for Notes Moderation ---
  const handleNoteStatus = async (id, newStatus) => {
    try {
      await apiRequest(`/notes/${id}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      });
      setStatusMsg({ type: 'success', text: `Note #${id} has been ${newStatus} successfully.` });
      setPendingNotes(prev => prev.filter(n => n.id !== id));
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error(`Failed to update note status:`, error);
      setStatusMsg({ type: 'error', text: error.message || `Failed to update note status.` });
    }
  };

  // --- Handlers for User Management ---
  const handleBanUser = async (id, isBanned) => {
    try {
      const endpoint = isBanned ? `/users/${id}/unban` : `/users/${id}/ban`;
      await apiRequest(endpoint, { method: 'POST' });
      setStatusMsg({ type: 'success', text: `User #${id} has been ${isBanned ? 'unbanned' : 'banned'} successfully.` });
      // Update local state
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, is_banned: !isBanned } : u));
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error(`Failed to update user ban status:`, error);
      setStatusMsg({ type: 'error', text: error.message || `Failed to update user ban status.` });
    }
  };

  const handlePromoteUser = async (id) => {
    if (!confirm('Are you sure you want to promote this user to Moderator?')) return;
    try {
      await apiRequest(`/users/${id}/promote`, { method: 'POST' });
      setStatusMsg({ type: 'success', text: `User #${id} has been promoted to Moderator.` });
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, role: 'moderator' } : u));
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error(`Failed to promote user:`, error);
      setStatusMsg({ type: 'error', text: error.message || `Failed to promote user.` });
    }
  };

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-12">
          
          {/* Admin Header Section */}
          <div className="flex flex-col items-center md:items-start md:flex-row md:items-center justify-between gap-6 relative text-center md:text-left">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/10 blur-[80px] rounded-full -z-10 animate-pulse" />
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[9px] font-black uppercase tracking-[0.3em]">
                <ShieldCheck size={12} className="animate-pulse" /> {user.role.toUpperCase()} PORTAL
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">Management</span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-[600px]">
                Review pending notes, manage platform users, publish academic resources, and monitor system metrics.
              </p>
            </div>

            <div className="flex items-center gap-3.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.25rem] p-3.5 shadow-sm backdrop-blur-xl min-w-0">
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

          {/* Status Alert Banner */}
          {statusMsg.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in fade-in ${
              statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
              <p className="text-[11px] font-bold uppercase tracking-widest">{statusMsg.text}</p>
            </div>
          )}

          {/* Admin Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pending Notes */}
            <div className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-sm hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">Pending Notes</span>
                  <h3 className="text-4xl font-black tracking-tight text-amber-500">
                    {loadingData ? '...' : pendingNotes.length}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mt-1">Awaiting moderation</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <Clock size={22} className="animate-pulse" />
                </div>
              </div>
            </div>

            {/* Total Users */}
            <div className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-sm hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-purple-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">Total Users</span>
                  <h3 className="text-4xl font-black tracking-tight text-purple-500">
                    {loadingData ? '...' : usersList.length}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mt-1">Registered students</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <Users size={22} />
                </div>
              </div>
            </div>

            {/* Published Resources */}
            <div className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-sm hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">Library Resources</span>
                  <h3 className="text-4xl font-black tracking-tight text-blue-500">
                    {loadingData ? '...' : resources.length}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mt-1">Official course materials</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <Layers size={22} />
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-sm hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">System Health</span>
                  <h3 className="text-3xl font-black tracking-tight text-emerald-500 mt-1">
                    100%
                  </h3>
                  <p className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-widest mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Fully Operational
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck size={22} />
                </div>
              </div>
            </div>

          </div>

          {/* Quick Shortcuts & Feature Cards */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Management Shortcuts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Feature Card: Upload Resource */}
              <Link 
                href="/resources/upload_resources" 
                className="group relative overflow-hidden p-8 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-[var(--card-bg)] border-2 border-amber-500/30 rounded-[2.5rem] hover:border-amber-500 shadow-lg hover:shadow-amber-500/10 transition-all hover:-translate-y-1 duration-500 flex flex-col justify-between h-[200px]"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -z-10 group-hover:bg-amber-500/20 transition-all" />
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-md group-hover:scale-110 transition-transform duration-500">
                    <Layers size={24} />
                  </div>
                  <span className="text-[9px] font-black px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full uppercase tracking-widest">
                    Portal Entry
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-black text-[var(--foreground)] uppercase tracking-tight group-hover:text-amber-500 transition-colors">
                    Upload Academic Resource
                  </h4>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    Publish official PDF, DOC, PPT materials <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </Link>

              {/* Feature Card: Pending Notes Tab Shortcut */}
              <button 
                onClick={() => setActiveTab('pending')}
                className={`group relative overflow-hidden p-8 bg-[var(--card-bg)] border-2 rounded-[2.5rem] shadow-lg transition-all hover:-translate-y-1 duration-500 flex flex-col justify-between h-[200px] text-left ${
                  activeTab === 'pending' ? 'border-purple-500 bg-purple-500/5' : 'border-[var(--card-border)] hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500 shadow-md group-hover:scale-110 transition-transform duration-500">
                    <Clock size={24} />
                  </div>
                  <span className="text-[9px] font-black px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded-full uppercase tracking-widest">
                    {pendingNotes.length} Pending
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-black text-[var(--foreground)] uppercase tracking-tight group-hover:text-purple-500 transition-colors">
                    Notes Moderation Queue
                  </h4>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    Review and approve student notes <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </button>

              {/* Feature Card: User Management Tab Shortcut */}
              <button 
                onClick={() => setActiveTab('users')}
                className={`group relative overflow-hidden p-8 bg-[var(--card-bg)] border-2 rounded-[2.5rem] shadow-lg transition-all hover:-translate-y-1 duration-500 flex flex-col justify-between h-[200px] text-left ${
                  activeTab === 'users' ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--card-border)] hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-md group-hover:scale-110 transition-transform duration-500">
                    <Users size={24} />
                  </div>
                  <span className="text-[9px] font-black px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full uppercase tracking-widest">
                    {usersList.length} Users
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-black text-[var(--foreground)] uppercase tracking-tight group-hover:text-blue-500 transition-colors">
                    User Access & Roles
                  </h4>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    Manage bans and promote moderators <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Section Tabs (Pending Notes vs User Management) */}
          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-4 border-b border-[var(--card-border)] pb-4">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  activeTab === 'pending'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-[var(--card-bg)] text-slate-500 border border-[var(--card-border)] hover:text-[var(--foreground)]'
                }`}
              >
                Pending Notes ({pendingNotes.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  activeTab === 'users'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-[var(--card-bg)] text-slate-500 border border-[var(--card-border)] hover:text-[var(--foreground)]'
                }`}
              >
                User Directory ({usersList.length})
              </button>
            </div>

            {/* TAB 1: Pending Notes Table */}
            {activeTab === 'pending' && (
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-xl overflow-hidden backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Notes Awaiting Approval</h3>
                    <p className="text-xs font-bold text-slate-500">Review content before it becomes public in the repository.</p>
                  </div>
                  <span className="text-xs font-black px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full border border-purple-500/20 uppercase tracking-widest">
                    Queue: {pendingNotes.length}
                  </span>
                </div>

                {loadingData ? (
                  <div className="py-12 text-center text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading pending notes...</div>
                ) : pendingNotes.length === 0 ? (
                  <div className="py-16 text-center space-y-3 border-2 border-dashed border-[var(--card-border)] rounded-[2rem]">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                      <CheckCircle2 size={24} />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">All Caught Up!</p>
                    <p className="text-xs font-bold text-slate-500">There are no pending notes awaiting moderation at this time.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <th className="pb-4 pl-4">Note Title & Course</th>
                          <th className="pb-4">Uploader</th>
                          <th className="pb-4">File Type</th>
                          <th className="pb-4 text-right pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--card-border)] text-xs font-bold">
                        {pendingNotes.map((note) => (
                          <tr key={note.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-5 pl-4 max-w-[300px]">
                              <p className="font-black text-sm text-[var(--foreground)] truncate">{note.title}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{note.course_code} • {note.dept}</p>
                            </td>
                            <td className="py-5">
                              <div className="flex items-center gap-2">
                                {note.uploader?.profile_pic ? (
                                  <img src={note.uploader.profile_pic} alt="" className="w-6 h-6 rounded-full object-cover border border-[var(--card-border)]" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-black text-white">
                                    {note.uploader?.name?.[0] || 'U'}
                                  </div>
                                )}
                                <span className="text-slate-300 truncate max-w-[120px]">{note.uploader?.name || `User #${note.uploader_id}`}</span>
                              </div>
                            </td>
                            <td className="py-5">
                              <a 
                                href={note.file_path} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors uppercase text-[10px] tracking-widest font-black"
                              >
                                {note.file_type || 'PDF'} <ArrowRight size={12} />
                              </a>
                            </td>
                            <td className="py-5 text-right pr-4">
                              <div className="inline-flex items-center gap-2">
                                <button 
                                  onClick={() => handleNoteStatus(note.id, 'approved')}
                                  className="px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl border border-emerald-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1"
                                >
                                  <CheckCircle2 size={14} /> Approve
                                </button>
                                <button 
                                  onClick={() => handleNoteStatus(note.id, 'rejected')}
                                  className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1"
                                >
                                  <XCircle size={14} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: User Management Table */}
            {activeTab === 'users' && (
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-xl overflow-hidden backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Platform User Directory</h3>
                    <p className="text-xs font-bold text-slate-500">Manage student access, ban violators, and assign moderator privileges.</p>
                  </div>
                  <span className="text-xs font-black px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 uppercase tracking-widest">
                    Total: {usersList.length}
                  </span>
                </div>

                {loadingData ? (
                  <div className="py-12 text-center text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading user directory...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <th className="pb-4 pl-4">User & Email</th>
                          <th className="pb-4">Current Role</th>
                          <th className="pb-4">Points</th>
                          <th className="pb-4 text-right pr-4">Management Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--card-border)] text-xs font-bold">
                        {usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-5 pl-4 max-w-[250px]">
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
                                    {u.name} {u.is_banned && <span className="text-[9px] font-black px-2 py-0.5 bg-red-500/10 text-red-500 rounded-md uppercase tracking-widest border border-red-500/20">Banned</span>}
                                  </p>
                                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                u.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                u.role === 'moderator' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-5 font-black text-amber-500">
                              {u.points || 0} PTS
                            </td>
                            <td className="py-5 text-right pr-4">
                              <div className="inline-flex items-center gap-2">
                                {u.role !== 'admin' && (
                                  <>
                                    {u.role === 'student' && user.role === 'admin' && (
                                      <button 
                                        onClick={() => handlePromoteUser(u.id)}
                                        className="px-3 py-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white rounded-xl border border-purple-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1"
                                        title="Promote to Moderator"
                                      >
                                        <Award size={14} /> Promote
                                      </button>
                                    )}

                                    <button 
                                      onClick={() => handleBanUser(u.id, u.is_banned)}
                                      className={`px-3 py-2 rounded-xl border transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1 ${
                                        u.is_banned 
                                          ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border-emerald-500/20' 
                                          : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20'
                                      }`}
                                    >
                                      {u.is_banned ? <><UserCheck size={14} /> Unban</> : <><UserX size={14} /> Ban</>}
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
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}
