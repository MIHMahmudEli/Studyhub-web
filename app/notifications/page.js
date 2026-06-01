'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { Bell, BellDot, MessageCircle, FileText, AtSign, CheckCheck, CheckCircle2, XCircle, Sparkles, ChevronRight, ArrowUpDown, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

const typeIcons = {
  comment_reply: MessageCircle,
  mention: AtSign,
  note_approved: CheckCircle2,
  note_rejected: XCircle,
  note_comment: MessageCircle,
  community_reply: MessageCircle,
  community_mention: AtSign,
  note_like: Sparkles,
  comment_like: Sparkles,
  note_download: FileText,
  system: Sparkles,
};

const typeColors = {
  comment_reply: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  mention: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  note_approved: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  note_rejected: 'text-red-500 bg-red-500/10 border-red-500/20',
  note_comment: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  community_reply: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  community_mention: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  note_like: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  comment_like: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  note_download: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  system: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
};

const typeLabels = {
  comment_reply: 'Reply',
  mention: 'Mention',
  note_approved: 'Approved',
  note_rejected: 'Rejected',
  note_comment: 'Comment',
  community_reply: 'Reply',
  community_mention: 'Mention',
  note_like: 'Reaction',
  comment_like: 'Reaction',
  note_download: 'Download',
  system: 'System',
};

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 20;

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const params = `page=${pageNum}&limit=${limit}${filter === 'unread' ? '&unreadOnly=true' : ''}`;
      const res = await apiRequest(`/notifications?${params}`);
      setNotifications(prev => append ? [...prev, ...(res.data || [])] : (res.data || []));
      setTotal(res.total ?? 0);
      setUnreadCount(res.unreadCount ?? 0);
      setPage(pageNum);
    } catch {
      if (!append) setNotifications([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (tokenReady && user) {
      setNotifications([]);
      setPage(1);
      fetchNotifications(1);
    }
  }, [tokenReady, user, filter, fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotal(prev => prev - 1);
    } catch {}
  };

  const handleClick = async (n) => {
    if (!n.is_read) await handleMarkRead(n.id);
    if (n.redirect_url) router.push(n.redirect_url);
  };

  const hasMore = notifications.length < total;

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-28 pb-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                <Bell size={28} />
                Notifications
                {unreadCount > 0 && (
                  <span className="text-[13px] font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-500 mt-1">Stay updated with your activity</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === 'all'
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-500 hover:text-[var(--foreground)]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === 'unread'
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-500 hover:text-[var(--foreground)]'
                  }`}
                >
                  Unread
                </button>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                >
                  <CheckCheck size={14} />
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-500/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded-lg bg-slate-500/10" />
                    <div className="h-3 w-1/2 rounded-lg bg-slate-500/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl flex items-center justify-center mb-6">
                <BellDot size={36} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-2">No Notifications</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                {filter === 'unread' ? 'You have read all your notifications.' : 'You will see notifications here when someone interacts with your content.'}
              </p>
            </div>
          ) : (
            <>
              {/* Notifications List */}
              <div className="space-y-2">
                {notifications.map((n) => {
                  const Icon = typeIcons[n.type] || Bell;
                  const col = typeColors[n.type] || 'text-slate-500 bg-slate-500/10 border-slate-500/20';
                  return (
                    <div
                      key={n.id}
                      className={`group relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:bg-blue-500/[0.02] ${
                        n.is_read
                          ? 'bg-[var(--card-bg)] border-[var(--card-border)]'
                          : 'bg-blue-500/[0.03] border-blue-500/10'
                      }`}
                      onClick={() => handleClick(n)}
                    >
                      {/* Unread indicator */}
                      {!n.is_read && (
                        <div className="absolute top-5 left-0 w-1 h-8 bg-blue-500 rounded-r-full" />
                      )}

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${col}`}>
                        <Icon size={18} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${col}`}>
                            {typeLabels[n.type] || n.type}
                          </span>
                        </div>
                        <p className={`text-sm leading-snug ${!n.is_read ? 'font-bold' : 'font-medium'}`}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {timeAgo(n.created_at)}
                          </span>
                          {n.redirect_url && (
                            <span className="text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              <ExternalLink size={10} />
                              Open
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {!n.is_read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                            className="w-8 h-8 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all flex items-center justify-center"
                            title="Mark as read"
                          >
                            <CheckCheck size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                          className="w-8 h-8 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-red-500 hover:border-red-500/30 transition-all flex items-center justify-center"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => fetchNotifications(page + 1, true)}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-[var(--foreground)] hover:border-blue-500/30 transition-all disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    ) : (
                      <>
                        <ArrowUpDown size={14} />
                        Load More
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
