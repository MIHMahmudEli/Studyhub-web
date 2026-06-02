'use client';

import Image from 'next/image';
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

export default function PendingModerationCard({
  item,
  type = 'note', // 'note' | 'resource'
  onApprove,
  onReject
}) {
  const isNote = type === 'note';
  
  // Theme definitions for styling overrides
  const theme = {
    note: {
      hoverBorder: 'hover:border-purple-500/30',
      avatarBg: 'bg-gradient-to-br from-purple-500 to-blue-500',
      badgeBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20'
    },
    resource: {
      hoverBorder: 'hover:border-amber-500/30',
      avatarBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
      badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
    }
  }[type] || {
    hoverBorder: 'hover:border-blue-500/30',
    avatarBg: 'bg-gradient-to-br from-blue-500 to-purple-500',
    badgeBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20'
  };

  const subtitle = isNote 
    ? `${item.course_code} • ${item.dept}`
    : `${item.subject || item.course_code || 'RESOURCE'} • ${item.term?.toUpperCase() || 'MID'}`;

  return (
    <div className={`bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 space-y-4 shadow-sm transition-all text-left ${theme.hoverBorder}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-black text-sm text-[var(--foreground)] truncate">{item.title}</h4>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 truncate">{subtitle}</p>
        </div>
        <a 
          href={item.file_path} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors uppercase text-[9px] tracking-widest font-black shrink-0 ${theme.badgeBg}`}
        >
          {item.file_type || 'PDF'} <ExternalLink size={10} />
        </a>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-[var(--card-border)]">
        {item.uploader?.profile_pic ? (
          <Image src={item.uploader.profile_pic} alt="" width={24} height={24} className="w-6 h-6 rounded-full object-cover border border-[var(--card-border)] shrink-0" />
        ) : (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${theme.avatarBg}`}>
            {item.uploader?.name?.[0] || 'U'}
          </div>
        )}
        <span className="text-xs text-slate-300 truncate">{item.uploader?.name || `User #${item.uploader_id}`}</span>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-[var(--card-border)]">
        <button 
          onClick={() => onApprove(item.id, 'approved')}
          className="flex-1 py-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl border border-emerald-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <CheckCircle2 size={14} /> Approve
        </button>
        <button 
          onClick={() => onReject(item.id, 'rejected')}
          className="flex-1 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <XCircle size={14} /> Reject
        </button>
      </div>
    </div>
  );
}
