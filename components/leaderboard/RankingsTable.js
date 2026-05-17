'use client';

import { TrendingUp, Star, Coins } from 'lucide-react';

export default function RankingsTable({ leaders }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
      <div className="p-8 border-b border-[var(--card-border)] flex items-center justify-between bg-white/[0.02]">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
          <TrendingUp className="text-blue-500" /> Top Scholars
        </h2>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Updated in real-time
        </span>
      </div>

      {/* Mobile Scholar List Layout - Hidden on Desktop */}
      <div className="md:hidden divide-y divide-[var(--card-border)]">
        {leaders.map((player, index) => (
          <div key={player.id} className="flex items-center justify-between p-5 hover:bg-blue-500/[0.01] transition-colors gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-black text-slate-500 shrink-0 w-8 text-center bg-slate-500/5 py-1 rounded-lg border border-[var(--card-border)]">
                #{index + 4}
              </span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-[var(--card-border)] overflow-hidden flex items-center justify-center text-blue-500 font-black text-xs shrink-0">
                {player.profile_pic ? (
                  <img 
                    src={player.profile_pic} 
                    alt={player.name} 
                    className="w-full h-full object-cover rounded-[inherit]"
                  />
                ) : (
                  player.name.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{player.name}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Verified Student</p>
              </div>
            </div>
            
            <div className="text-right shrink-0 flex flex-col items-end gap-1">
              <div className="inline-flex items-center gap-1 text-amber-500 font-black text-xs">
                <Coins size={12} />
                <span>{player.points.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-[9px] font-semibold">
                <Star size={10} />
                <span>{player.uploads} Shared</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout - Hidden on Mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.01]">
              <th className="px-8 py-5">Rank</th>
              <th className="px-8 py-5">Student</th>
              <th className="px-8 py-5">Resources</th>
              <th className="px-8 py-5 text-right">Academic Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {leaders.map((player, index) => (
              <tr key={player.id} className="group hover:bg-blue-500/[0.02] transition-colors">
                <td className="px-8 py-6">
                  <span className="text-sm font-black text-slate-500 group-hover:text-blue-500 transition-colors">#{index + 4}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-[var(--card-border)] overflow-hidden flex items-center justify-center text-blue-500 font-black text-xs">
                      {player.profile_pic ? (
                        <img 
                          src={player.profile_pic} 
                          alt={player.name} 
                          className="w-full h-full object-cover rounded-[inherit]"
                        />
                      ) : (
                        player.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold group-hover:text-blue-500 transition-colors">{player.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Student</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Star size={14} />
                    <span className="text-xs font-bold">{player.uploads} Shared</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="inline-flex items-center gap-2 text-amber-500 font-black text-sm">
                    <Coins size={16} />
                    {player.points.toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
