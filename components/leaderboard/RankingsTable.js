'use client';

import { TrendingUp, Coins, FileText, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLevelInfo } from './leaderboardUtils';

function LevelBadge({ levelInfo }) {
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${levelInfo.currentLevel.bgColor} ${levelInfo.currentLevel.textColor} border ${levelInfo.currentLevel.borderColor}`}>
      <Zap size={10} />
      {levelInfo.currentLevel.name}
    </div>
  );
}

function Avatar({ user, onClick }) {
  return (
    <button onClick={onClick} className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-[var(--card-border)] overflow-hidden flex items-center justify-center text-blue-500 font-black text-xs shrink-0 cursor-pointer hover:border-blue-500/30 transition-colors">
      {user.profile_pic ? (
        <img src={user.profile_pic} alt={user.name} className="w-full h-full object-cover rounded-[inherit]" />
      ) : (
        user.name.charAt(0)
      )}
    </button>
  );
}

export default function RankingsTable({ leaders }) {
  const router = useRouter();
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl">
      <div className="p-6 border-b border-[var(--card-border)] flex items-center justify-between bg-white/[0.02]">
        <h2 className="text-lg font-black tracking-tight flex items-center gap-2.5">
          <TrendingUp className="text-blue-500" size={20} /> Top Scholars
        </h2>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
          Updated live
        </span>
      </div>

      {/* Mobile rows */}
      <div className="md:hidden divide-y divide-[var(--card-border)]">
        {leaders.map((player, index) => {
          const li = getLevelInfo(player.points);
          return (
            <div key={player.id} className="flex items-center gap-3 px-5 py-4 hover:bg-blue-500/[0.01] transition-colors">
              <span className="text-xs font-black text-slate-500 shrink-0 w-7 text-center">
                #{index + 4}
              </span>
              <Avatar user={player} onClick={() => router.push(`/profile/${player.id}`)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <button onClick={() => router.push(`/profile/${player.id}`)} className="text-sm font-bold truncate hover:text-blue-500 transition-colors cursor-pointer">{player.name}</button>
                  <LevelBadge levelInfo={li} />
                </div>
                {player.dept && (
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{player.dept}</p>
                )}
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <div className="inline-flex items-center gap-1 text-amber-500 font-black text-xs">
                  <Coins size={12} />
                  <span>{player.points.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-[9px] font-semibold">
                  <FileText size={10} />
                  <span>{player.noteCount ?? 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.01]">
              <th className="px-6 py-4 w-16">Rank</th>
              <th className="px-6 py-4">Scholar</th>
              <th className="px-6 py-4">Level</th>
              <th className="px-6 py-4 text-right">Notes</th>
              <th className="px-6 py-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {leaders.map((player, index) => {
              const li = getLevelInfo(player.points);
              return (
                <tr key={player.id} className="group hover:bg-blue-500/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-slate-500 group-hover:text-blue-500 transition-colors">
                      #{index + 4}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <Avatar user={player} onClick={() => router.push(`/profile/${player.id}`)} />
                      <div>
                        <button onClick={() => router.push(`/profile/${player.id}`)} className="text-sm font-bold hover:text-blue-500 transition-colors cursor-pointer">{player.name}</button>
                        {player.dept && (
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{player.dept}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <LevelBadge levelInfo={li} />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="inline-flex items-center gap-1.5 text-slate-400">
                      <FileText size={14} />
                      <span className="text-xs font-bold">{player.noteCount ?? 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="inline-flex items-center gap-1.5 text-amber-500 font-black text-sm">
                      <Coins size={16} />
                      {player.points.toLocaleString()}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
