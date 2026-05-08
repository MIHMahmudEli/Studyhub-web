'use client';

import { Crown, Coins } from 'lucide-react';

export default function PodiumCard({ user, rank, color, isLarge = false }) {
  if (!user) return null;

  const colors = {
    gold: 'from-amber-400 via-yellow-500 to-amber-600',
    silver: 'from-slate-300 via-slate-400 to-slate-500',
    bronze: 'from-orange-400 via-orange-500 to-orange-600'
  };

  const glows = {
    gold: 'shadow-amber-500/20',
    silver: 'shadow-slate-500/20',
    bronze: 'shadow-orange-500/20'
  };

  return (
    <div className={`relative flex flex-col items-center group ${isLarge ? 'mb-4 scale-110 z-10' : ''}`}>
      {/* Rank Indicator */}
      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-xl ${glows[color]} z-20 group-hover:scale-110 transition-transform duration-500`}>
        {rank === 1 ? <Crown size={24} /> : <span className="font-black text-lg">{rank}</span>}
      </div>

      <div className={`w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 pt-10 text-center backdrop-blur-xl group-hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden ${isLarge ? 'shadow-2xl' : 'shadow-xl'}`}>
        {/* Decorative Glow */}
        <div className={`absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br ${colors[color]} opacity-5 blur-[40px] rounded-full`} />
        
        <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 bg-gradient-to-br ${colors[color]} p-[2px] shadow-lg group-hover:rotate-3 transition-transform duration-500`}>
          <div className="w-full h-full rounded-[inherit] bg-[var(--background)] flex items-center justify-center text-2xl font-black">
            {user.name.charAt(0)}
          </div>
        </div>

        <h3 className="text-xl font-black mb-1 line-clamp-1">{user.name}</h3>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Top Contributor</p>

        <div className="flex items-center justify-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-2xl py-3 px-4">
          <div className="flex items-center gap-2 text-amber-500">
            <Coins size={18} />
            <span className="text-lg font-black tracking-tighter">{user.points.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
           <span>{user.uploads} Notes</span>
           <div className="w-1 h-1 bg-slate-700 rounded-full" />
           <span className="text-blue-500">Rank {rank}</span>
        </div>
      </div>
    </div>
  );
}
