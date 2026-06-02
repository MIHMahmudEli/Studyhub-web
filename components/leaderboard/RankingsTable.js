'use client';

import Image from 'next/image';
import { TrendingUp, Coins, FileText, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLevelInfo } from './leaderboardUtils';

function Avatar({ user, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-black text-sm shrink-0 cursor-pointer hover:opacity-80 transition-opacity bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-[var(--card-border)] text-blue-500"
    >
      {user.profile_pic
        ? <Image src={user.profile_pic} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
        : user.name.charAt(0)
      }
    </button>
  );
}

function RankNumber({ rank }) {
  return (
    <span className={`text-xs font-black w-7 text-center shrink-0 ${
      rank <= 5 ? 'text-blue-500' : 'text-slate-500'
    }`}>
      #{rank}
    </span>
  );
}

export default function RankingsTable({ leaders }) {
  const router = useRouter();

  if (!leaders || leaders.length === 0) return null;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
        <h2 className="font-black text-base flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-500" />
          Top Scholars
        </h2>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
          Live
        </span>
      </div>

      {/* ── MOBILE VIEW ── */}
      <div className="md:hidden divide-y divide-[var(--card-border)]">
        {leaders.map((player, index) => (
          <div
            key={player.id}
            onClick={() => router.push(`/profile/${player.id}`)}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-blue-500/[0.03] active:bg-blue-500/[0.06] transition-colors cursor-pointer"
          >
            <RankNumber rank={index + 4} />
            <Avatar user={player} onClick={() => router.push(`/profile/${player.id}`)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{player.name}</p>
              {player.dept && (
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider truncate mt-0.5">
                  {player.dept}
                </p>
              )}
            </div>
            {/* Right side: points + notes only on mobile */}
            <div className="shrink-0 flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1 text-amber-500 font-black text-xs">
                <Coins size={11} />
                {player.points.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                <FileText size={10} />
                {player.noteCount ?? 0}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-[var(--card-border)] bg-white/[0.01]">
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
                <tr
                  key={player.id}
                  onClick={() => router.push(`/profile/${player.id}`)}
                  className="group hover:bg-blue-500/[0.02] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <span className={`text-sm font-black transition-colors ${index < 2 ? 'text-blue-500' : 'text-slate-500 group-hover:text-blue-500'}`}>
                      #{index + 4}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar user={player} onClick={() => router.push(`/profile/${player.id}`)} />
                      <div>
                        <p className="text-sm font-bold group-hover:text-blue-500 transition-colors">{player.name}</p>
                        {player.dept && (
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{player.dept}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${li.currentLevel.bgColor} ${li.currentLevel.textColor} ${li.currentLevel.borderColor}`}>
                      <Zap size={9} />
                      {li.currentLevel.name} Lv.{li.currentLevel.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                      <FileText size={13} />
                      {player.noteCount ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1.5 text-amber-500 font-black text-sm">
                      <Coins size={15} />
                      {player.points.toLocaleString()}
                    </span>
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
