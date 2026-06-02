'use client';

import Image from 'next/image';
import { Crown, Coins, FileText, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLevelInfo } from './leaderboardUtils';

export default function PodiumCard({ user, rank, color, isLarge = false }) {
  const router = useRouter();
  if (!user) return null;

  const goToProfile = () => router.push(`/profile/${user.id}`);
  const levelInfo = getLevelInfo(user.points);

  const styles = {
    gold: {
      gradient: 'from-amber-400 via-yellow-400 to-amber-500',
      glow: 'shadow-amber-500/30',
      ring: 'ring-amber-400/50',
      podium: 'from-amber-500/20 via-yellow-500/10 to-transparent',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      rankBg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
      bar: 'h-20 sm:h-28',
      crown: true,
    },
    silver: {
      gradient: 'from-slate-300 via-slate-400 to-slate-500',
      glow: 'shadow-slate-400/20',
      ring: 'ring-slate-400/40',
      podium: 'from-slate-400/15 via-slate-500/8 to-transparent',
      badge: 'bg-slate-400/10 text-slate-400 border-slate-400/30',
      rankBg: 'bg-gradient-to-br from-slate-400 to-slate-500',
      bar: 'h-14 sm:h-20',
      crown: false,
    },
    bronze: {
      gradient: 'from-orange-400 via-orange-500 to-amber-600',
      glow: 'shadow-orange-500/20',
      ring: 'ring-orange-400/40',
      podium: 'from-orange-500/15 via-orange-600/8 to-transparent',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      rankBg: 'bg-gradient-to-br from-orange-400 to-amber-600',
      bar: 'h-10 sm:h-14',
      crown: false,
    },
  };

  const s = styles[color];

  return (
    <div
      onClick={goToProfile}
      className={`relative w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl text-center cursor-pointer transition-all duration-300 hover:border-opacity-60 hover:shadow-xl overflow-hidden group flex flex-col ${isLarge ? 'shadow-2xl pt-10 pb-8' : 'shadow-lg pt-6 pb-6'}`}
    >
      {/* Subtle top glow */}
      <div className={`absolute inset-0 bg-gradient-to-b ${s.podium} opacity-60 pointer-events-none`} />
      
      {/* Subtle top border glow instead of a solid block */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${s.gradient} opacity-80`} />

      <div className="px-4 sm:px-6 flex flex-col items-center relative z-10">
        {/* Rank badge */}
        <div className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${s.rankBg} flex items-center justify-center mx-auto mb-4 shadow-lg ${s.glow}`}>
          {s.crown
            ? <Crown size={18} className="text-white" />
            : <span className="font-black text-white text-sm sm:text-base">{rank}</span>
          }
        </div>

        {/* Avatar */}
        <div className={`relative mx-auto mb-4 ${isLarge ? 'w-16 h-16 sm:w-24 sm:h-24' : 'w-14 h-14 sm:w-20 sm:h-20'} rounded-2xl sm:rounded-3xl bg-gradient-to-br ${s.gradient} p-[2px] sm:p-[3px] shadow-md ${s.glow} group-hover:scale-105 transition-transform duration-300`}>
          <div className="w-full h-full rounded-[inherit] bg-[var(--background)] overflow-hidden flex items-center justify-center font-black text-xl sm:text-2xl">
            {user.profile_pic
              ? <Image src={user.profile_pic} alt={user.name} width={96} height={96} className="w-full h-full object-cover" />
              : <span className={`bg-gradient-to-br ${s.gradient} bg-clip-text text-transparent`}>{user.name.charAt(0)}</span>
            }
          </div>
        </div>

        {/* Name */}
        <p className={`relative z-10 font-black leading-tight truncate w-full ${isLarge ? 'text-base sm:text-xl' : 'text-sm sm:text-lg'} group-hover:text-blue-500 transition-colors duration-300`}>
          {user.name}
        </p>

        {/* Dept */}
        {user.dept && (
          <p className="relative z-10 text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 truncate w-full">
            {user.dept}
          </p>
        )}

        {/* Level badge — hidden on mobile */}
        <div className={`relative z-10 hidden sm:inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${s.badge}`}>
          <Zap size={10} />
          {levelInfo.currentLevel.name} Lv.{levelInfo.currentLevel.level}
        </div>

        {/* Points */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 mt-4">
          <Coins size={isLarge ? 20 : 16} className="text-amber-500" />
          <span className={`font-black tracking-tighter ${isLarge ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            {user.points.toLocaleString()}
          </span>
        </div>

        {/* Notes */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 mt-2 text-slate-500 text-[10px] sm:text-xs font-bold">
          <FileText size={12} />
          <span>{user.noteCount ?? 0} notes</span>
        </div>
      </div>
    </div>
  );
}
