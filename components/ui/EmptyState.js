'use client';

import { FileText } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FileText,
  title = 'No Results Found',
  message = 'We couldn\'t find anything matching your criteria. Try adjusting your filters.',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-24 h-24 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-3xl flex items-center justify-center text-slate-400 mb-8 shadow-xl">
        <Icon size={48} strokeWidth={1} />
      </div>
      <h3 className="text-xl font-black uppercase tracking-widest mb-2">{title}</h3>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 max-w-[400px]">
        {message}
      </p>
    </div>
  );
}
