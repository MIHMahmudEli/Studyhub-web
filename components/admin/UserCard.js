'use client';

import { Clock, Award, UserX, UserCheck } from 'lucide-react';

export default function UserCard({
  user: u,
  showActiveTime = false,
  showActions = false,
  onPromote,
  onDemote,
  onBan
}) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 space-y-4 shadow-sm hover:border-blue-500/30 transition-all w-full text-left">
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

      {showActiveTime && u.last_active_at && (
        <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border)] text-xs font-black text-emerald-500">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Active Time</span>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            {new Date(u.last_active_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
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
