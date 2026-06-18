'use client';

import { useRouter } from 'next/navigation';
import { Clock, Award, UserX, UserCheck, Globe, Smartphone, Apple } from 'lucide-react';

function PlatformBadge({ platform }) {
  const map = {
    web:     { label: 'Web',     icon: Globe,      cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    android: { label: 'Android', icon: Smartphone, cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
    ios:     { label: 'iOS',     icon: Apple,      cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  };
  const p = map[platform];
  if (!p) return <span className="text-xs font-black text-slate-500">—</span>;
  const Icon = p.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${p.cls}`}>
      <Icon size={11} /> {p.label}
    </span>
  );
}

const ACTIVE_NOW_THRESHOLD_SEC = 90;

function getPresenceStatus(dateStr) {
  if (!dateStr) return { isNow: false, label: 'Unknown' };
  const ts = new Date(dateStr).getTime();
  if (isNaN(ts)) return { isNow: false, label: 'Unknown' };
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < ACTIVE_NOW_THRESHOLD_SEC) return { isNow: true, label: 'Active Now' };
  if (diff < 60) return { isNow: false, label: `${diff}s ago` };
  if (diff < 3600) return { isNow: false, label: `${Math.floor(diff / 60)}m ago` };
  return { isNow: false, label: `${Math.floor(diff / 3600)}h ago` };
}

function PresenceDot({ isNow }) {
  return (
    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
      <span className={`relative inline-flex rounded-full h-3 w-3 border-2 border-[var(--card-bg)] ${isNow ? 'bg-emerald-500' : 'bg-slate-500'}`} />
    </span>
  );
}

export default function UserCard({
  user: u,
  showActiveTime = false,
  showActions = false,
  isLive = false,
  showDept = true,
  showPlatform = false,
  onPromote,
  onDemote,
  onBan
}) {
  const router = useRouter();
  const presence = isLive ? getPresenceStatus(u.last_active_at) : null;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 space-y-4 shadow-sm hover:border-blue-500/30 transition-all w-full text-left">
      <button onClick={() => router.push(`/profile/${u.id}`)} className="flex items-center gap-3 w-full text-left cursor-pointer hover:opacity-80 transition-opacity">
        <div className="relative shrink-0">
          {u.profile_pic ? (
            <img src={u.profile_pic} alt="" className="w-10 h-10 rounded-xl object-cover border border-[var(--card-border)]" />
          ) : (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white ${
              isLive && presence?.isNow
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                : isLive
                ? 'bg-gradient-to-br from-slate-500 to-slate-600'
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}>
              {u.name?.[0] || 'U'}
            </div>
          )}
          {isLive && <PresenceDot isNow={presence?.isNow} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-sm text-[var(--foreground)] truncate flex items-center gap-2">
            {u.name} {u.banned && <span className="text-[9px] font-black px-2 py-0.5 bg-red-500/10 text-red-500 rounded-md uppercase tracking-widest border border-red-500/20 shrink-0">Banned</span>}
          </p>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">{u.email || 'No email available'}</p>
        </div>
      </button>

      <div className="space-y-3 pt-2 border-t border-[var(--card-border)]">
        <div className="flex items-center justify-between gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${
            u.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
            u.role === 'moderator' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
            'bg-blue-500/10 text-blue-500 border-blue-500/20'
          }`}>
            {u.role || 'student'}
          </span>
          <span className="font-black text-xs text-amber-500 shrink-0">{u.points || 0} PTS</span>
        </div>
        {showDept && u.dept && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Department</span>
            <span className="text-xs font-black text-slate-400">{u.dept.toUpperCase()}</span>
          </div>
        )}
        {showPlatform && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Platform</span>
            <PlatformBadge platform={u.last_active_platform} />
          </div>
        )}
      </div>

      {showActiveTime && u.last_active_at && (
        <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border)] text-xs font-black">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">
            {isLive ? 'Last Seen' : 'Active Time'}
          </span>
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
            <span className="inline-flex items-center gap-1.5 text-emerald-500">
              <Clock size={14} />
              {new Date(u.last_active_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      )}

      {showActions && u.role !== 'admin' && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--card-border)]">
          {u.role === 'student' && onPromote && (
            <button
              onClick={() => onPromote(u.id)}
              className="flex-1 py-2.5 bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white rounded-xl border border-purple-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center justify-center gap-1 cursor-pointer"
            >
              <Award size={14} /> Promote
            </button>
          )}
          {u.role === 'moderator' && onDemote && (
            <button
              onClick={() => onDemote(u.id)}
              className="flex-1 py-2.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl border border-amber-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center justify-center gap-1 cursor-pointer"
            >
              <UserX size={14} /> Demote
            </button>
          )}
          {onBan && (
            <button
              onClick={() => onBan(u.id, u.banned)}
              className={`flex-1 py-2.5 rounded-xl border transition-all uppercase text-[10px] tracking-widest font-black flex items-center justify-center gap-1 cursor-pointer ${
                u.banned
                  ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border-emerald-500/20'
                  : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20'
              }`}
            >
              {u.banned ? <><UserCheck size={14} /> Unban</> : <><UserX size={14} /> Ban</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
