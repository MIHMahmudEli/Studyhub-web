'use client';

import { Sparkles } from 'lucide-react';
import ConfigCard from '@/components/admin/ConfigCard';

export default function AdminVisibilityConfig({ uploadVisibility, loadingData, onVisibilityChange }) {
  return (
    <ConfigCard
      title="Resource Upload Visibility"
      subtitle="Configure the default approval status for newly uploaded academic resources. If set to PENDING, an admin must approve them before they appear in the public library."
      badgeText="System Setting"
      badgeIcon={Sparkles}
      loading={loadingData}
    >
      <button
        onClick={() => onVisibilityChange('approved')}
        className={`w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all cursor-pointer shrink-0 ${
          uploadVisibility === 'approved'
            ? 'bg-emerald-50 text-emerald-500 shadow-lg shadow-emerald-500/20 scale-[1.02] sm:scale-105 border border-emerald-500/20 font-black'
            : 'text-slate-400 hover:text-[var(--foreground)]'
        }`}
      >
        Approved by Default
      </button>
      <button
        onClick={() => onVisibilityChange('pending')}
        className={`w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all cursor-pointer shrink-0 ${
          uploadVisibility === 'pending'
            ? 'bg-amber-50 text-amber-500 shadow-lg shadow-amber-500/20 scale-[1.02] sm:scale-105 border border-amber-500/20 font-black'
            : 'text-slate-400 hover:text-[var(--foreground)]'
        }`}
      >
        Pending by Default
      </button>
    </ConfigCard>
  );
}
