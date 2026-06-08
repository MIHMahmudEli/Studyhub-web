'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, BellDot, CheckCheck, ChevronRight, ExternalLink, MessageCircle, FileText, AtSign, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

const typeIcons = {
  comment_reply: MessageCircle,
  mention: AtSign,
  note_approved: CheckCircle2,
  note_rejected: XCircle,
  resource_approved: CheckCircle2,
  resource_rejected: XCircle,
  note_comment: MessageCircle,
  community_reply: MessageCircle,
  community_mention: AtSign,
  note_like: Sparkles,
  comment_like: Sparkles,
  note_download: FileText,
  system: Sparkles,
};

const typeColors = {
  comment_reply: 'text-blue-500 bg-blue-500/10',
  mention: 'text-purple-500 bg-purple-500/10',
  note_approved: 'text-emerald-500 bg-emerald-500/10',
  note_rejected: 'text-red-500 bg-red-500/10',
  resource_approved: 'text-emerald-500 bg-emerald-500/10',
  resource_rejected: 'text-red-500 bg-red-500/10',
  note_comment: 'text-cyan-500 bg-cyan-500/10',
  community_reply: 'text-blue-500 bg-blue-500/10',
  community_mention: 'text-purple-500 bg-purple-500/10',
  note_like: 'text-pink-500 bg-pink-500/10',
  comment_like: 'text-pink-500 bg-pink-500/10',
  note_download: 'text-amber-500 bg-amber-500/10',
  system: 'text-slate-500 bg-slate-500/10',
};

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationBell() {
  const { user, tokenReady } = useAuth();
  const { on } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiRequest('/notifications/unread-count');
      setUnreadCount(res.count ?? 0);
    } catch {}
  }, []);

  const fetchDropdown = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/notifications?limit=5&unreadOnly=true');
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount ?? 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!tokenReady || !user) return;
    fetchUnreadCount();

    const unsub = on('notification:new', (notification) => {
      setUnreadCount(prev => prev + 1);
      if (open) {
        setNotifications(prev => [notification, ...prev].slice(0, 5));
      }
    });

    const onFocus = () => fetchUnreadCount();
    window.addEventListener('focus', onFocus);

    return () => {
      unsub();
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchUnreadCount, tokenReady, user, on, open]);

  useEffect(() => {
    if (open) fetchDropdown();
  }, [open, fetchDropdown]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleNotificationClick = async (n) => {
    if (!n.is_read) {
      try {
        await apiRequest(`/notifications/${n.id}/read`, { method: 'PATCH' });
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {}
    }
    setOpen(false);
    if (n.redirect_url) {
      router.push(n.redirect_url);
    }
  };

  const NotificationIcon = typeIcons[notifications[0]?.type] || Bell;
  const colorClass = typeColors[notifications[0]?.type] || 'text-slate-500 bg-slate-500/10';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-[var(--foreground)] transition-all cursor-pointer"
        title="Notifications"
      >
        {unreadCount > 0 ? <BellDot size={18} /> : <Bell size={18} />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-16 z-[9999] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-[380px] lg:w-[420px] bg-[var(--background)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
            <h3 className="text-[13px] font-black tracking-tight flex items-center gap-2">
              <Bell size={16} />
              Notifications
              {unreadCount > 0 && (
                <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
              >
                <CheckCheck size={13} />
                Mark Read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center mb-4">
                  <Bell size={22} className="text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-400">All caught up!</p>
                <p className="text-[11px] text-slate-500 mt-1">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--card-border)]">
                {notifications.map((n) => {
                  const Icon = typeIcons[n.type] || Bell;
                  const col = typeColors[n.type] || 'text-slate-500 bg-slate-500/10';
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left flex items-start gap-3 px-5 py-4 transition-all hover:bg-blue-500/[0.03] active:bg-blue-500/[0.06] ${
                        !n.is_read ? 'bg-blue-500/[0.02]' : ''
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${col}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] leading-snug ${!n.is_read ? 'font-bold' : 'font-medium'}`}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        )}
                        <p className="text-[10px] font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 py-4 border-t border-[var(--card-border)] text-[11px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 hover:bg-blue-500/[0.03] transition-all"
          >
            View All Notifications
            <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
