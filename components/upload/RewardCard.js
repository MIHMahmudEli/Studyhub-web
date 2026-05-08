'use client';

import { Coins } from 'lucide-react';

export default function RewardCard({ points = 5 }) {
  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-[2rem] p-8 flex items-center gap-6">
      <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
        <Coins size={28} />
      </div>
      <div>
        <h4 className="font-black text-amber-500 text-sm uppercase tracking-wider mb-1">Earn Points</h4>
        <p className="text-slate-500 text-[11px] font-bold leading-relaxed">
          You will receive <span className="text-[var(--foreground)]">+{points} Points</span> for every verified note you contribute.
        </p>
      </div>
    </div>
  );
}
