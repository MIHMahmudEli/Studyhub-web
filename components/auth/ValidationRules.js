'use client';

import { CheckCircle2, ShieldCheck } from 'lucide-react';

function RuleItem({ label, met }) {
  return (
    <div className="flex items-center gap-1.5 transition-all duration-300">
      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${met ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-gray-700'}`} />
      <span className={`text-[9px] font-bold uppercase tracking-tight transition-colors duration-300 ${met ? 'text-emerald-400' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}

export default function ValidationRules({ rules }) {
  return (
    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-2">
        <ShieldCheck size={12} className="text-blue-400" />
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Check</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <RuleItem label="8+ Characters" met={rules.length} />
        <RuleItem label="Uppercase" met={rules.uppercase} />
        <RuleItem label="Lowercase" met={rules.lowercase} />
        <RuleItem label="Numbers" met={rules.number} />
        <RuleItem label="Special Symbol" met={rules.special} />
      </div>
    </div>
  );
}
