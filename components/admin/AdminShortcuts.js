'use client';

import ShortcutCard from '@/components/admin/ShortcutCard';
import { Layers, Clock, LayoutDashboard } from 'lucide-react';

export default function AdminShortcuts({ user, loadingData, pendingNotes, pendingResources }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Management Shortcuts</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <ShortcutCard
          href="/resources/upload_resources"
          title="Upload Academic Resource"
          description="Publish official materials"
          badgeText="Portal Entry"
          icon={Layers}
          colorScheme="amber"
          loading={loadingData}
        />

        {(user?.role === 'admin' || user?.role === 'moderator') && (
          <ShortcutCard
            href="/admin/pending_resources"
            title="Resources Moderation"
            description="Review library uploads"
            badgeText={`${pendingResources.length} Pending`}
            icon={Layers}
            colorScheme="amber"
            loading={loadingData}
          />
        )}

        <ShortcutCard
          href="/admin/pending_notes"
          title="Notes Moderation Queue"
          description="Review student notes"
          badgeText={`${pendingNotes.length} Pending`}
          icon={Clock}
          colorScheme="purple"
          loading={loadingData}
        />

        <ShortcutCard
          href="/dashboard"
          title="My Student Dashboard"
          description="Access your student portal"
          badgeText="Student View"
          icon={LayoutDashboard}
          colorScheme="indigo"
          loading={loadingData}
        />
      </div>
    </div>
  );
}
