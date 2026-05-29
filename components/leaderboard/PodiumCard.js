'use client';

import { Crown, Coins, FileText, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLevelInfo } from './leaderboardUtils';

export default function PodiumCard({ user, rank, color, isLarge = false }) {
  const router = useRouter();
  if (!user) return null;

  const goToProfile = () => router.push(`/profile/${user.id}`);

  const levelInfo = getLevelInfo(user.points);

  const medalColors = {
    gold: { bg: 'from-amber-400 via-yellow-500 to-amber-600', glow: 'shadow-amber-500/25', ring: 'ring-amber-400/40', medal: '🥇' },
    silver: { bg: 'from-slate-300 via-slate-400 to-slate-500', glow: 'shadow-slate-500/20', ring: 'ring-slate-400/30', medal: '🥈' },
    bronze: { bg: 'from-orange-400 via-orange-500 to-orange-600', glow: 'shadow-orange-500/20', ring: 'ring-orange-400/30', medal: '🥉' },
  };

  const mc = medalColors[color];

  return (
    <div className={`relative flex flex-col items-center group w-full ${isLarge ? 'z-10' : ''}`}>
      {/* Medal badge */}
      <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-11 h-11 rounded-2xl bg-gradient-to-br ${mc.bg} flex items-center justify-center text-white shadow-xl ${mc.glow} z-20 ring-2 ring-white/20 drop-shadow-lg`}>
        {rank === 1 ? <Crown size={20} /> : <span className="font-black text-base">{rank}</span>}
      </div>

      <div className={`w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 pt-8 text-center backdrop-blur-xl group-hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden ${isLarge ? 'shadow-2xl md:scale-105' : 'shadow-xl'}`}>
        {/* Glow decoration */}
        <div className={`absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br ${mc.bg} opacity-[0.04] blur-[60px] rounded-full pointer-events-none`} />

        {/* Avatar with medal ring */}
        <button onClick={goToProfile} className={`relative mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br ${mc.bg} p-[2.5px] shadow-lg group-hover:scale-105 transition-transform duration-500 cursor-pointer ${isLarge ? 'w-24 h-24' : ''}`}>
          <div className="w-full h-full rounded-[inherit] bg-[var(--background)] overflow-hidden flex items-center justify-center text-2xl font-black">
            {user.profile_pic ? (
              <img src={user.profile_pic} alt={user.name} className="w-full h-full object-cover rounded-[inherit]" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
        </button>

        {/* Name + dept */}
        <button onClick={goToProfile} className={`font-black mb-0.5 hover:text-blue-500 transition-colors ${isLarge ? 'text-xl' : 'text-lg'} line-clamp-1 cursor-pointer text-center w-full`}>{user.name}</button>
        {user.dept && (
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{user.dept}</p>
        )}

        {/* Level badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${levelInfo.currentLevel.bgColor} ${levelInfo.currentLevel.textColor} border ${levelInfo.currentLevel.borderColor} mb-4`}>
          <Zap size={12} />
          {levelInfo.currentLevel.name} Lv.{levelInfo.currentLevel.level}
        </div>

        {/* Points */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <Coins size={20} className="text-amber-500" />
          <span className={`font-black tracking-tighter ${isLarge ? 'text-2xl' : 'text-xl'}`}>
            {user.points.toLocaleString()}
          </span>
        </div>

        {/* XP Bar */}
        <div className="mb-4 px-2">
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-1.5">
            <span>XP</span>
            <span>{levelInfo.xpInLevel.toLocaleString()} / {levelInfo.nextLevel ? levelInfo.xpToNext.toLocaleString() : 'MAX'}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${levelInfo.currentLevel.barColor}`}
              style={{ width: `${levelInfo.progress * 100}%` }}
            />
          </div>
        </div>

        {/* Note count */}
        <div className="flex items-center justify-center gap-5 text-[11px] font-bold text-slate-400">
          <div className="flex items-center gap-1.5">
            <FileText size={14} />
            <span>{user.noteCount ?? 0} Notes</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="text-blue-500">Rank #{rank}</span>
        </div>
      </div>
    </div>
  );
}
