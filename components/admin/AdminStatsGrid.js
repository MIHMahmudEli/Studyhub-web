'use client';

import StatsCard from '@/components/admin/StatsCard';
import {
  Clock, Layers, TrendingUp, Flame, Palette, BarChart3,
  Users, ShieldCheck, Activity, Smartphone,
} from 'lucide-react';

export default function AdminStatsGrid({
  user, loadingData,
  permissions, activeUsersCount, platformTotalUsers,
  pendingNotes, pendingNotesTotal, pendingResources, pendingResourcesTotal, resources, notes,
  onPermissionToggle,
}) {
  const hasPermission = (key) =>
    user?.role === 'admin' || permissions.find(p => p.key === key)?.value === 'admin+moderator';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {hasPermission('perm_view_active_users') && (
        <StatsCard
          href="/admin/active_users"
          title="Active Users"
          value={activeUsersCount}
          subtitle="Online today"
          icon={Activity}
          colorScheme="emerald"
          iconAnimation="animate-pulse"
          loading={loadingData}
          permissionKey={user?.role === 'admin' ? 'perm_view_active_users' : undefined}
          permissionValue={permissions.find(p => p.key === 'perm_view_active_users')?.value}
          onPermissionToggle={onPermissionToggle}
        />
      )}

      <StatsCard
        href="/admin/pending_notes"
        title="Pending Notes"
        value={pendingNotesTotal}
        subtitle="Awaiting moderation"
        icon={Clock}
        colorScheme="purple"
        iconAnimation="animate-pulse"
        loading={loadingData}
      />

      {(user?.role === 'admin' || user?.role === 'moderator') && (
        <StatsCard
          href="/admin/pending_resources"
          title="Pending Resources"
          value={pendingResourcesTotal}
          subtitle="Awaiting approval"
          icon={Layers}
          colorScheme="amber"
          iconAnimation="animate-pulse"
          loading={loadingData}
        />
      )}

      {hasPermission('perm_view_users') && (
        <StatsCard
          href="/admin/users"
          title="Total Users"
          value={platformTotalUsers}
          subtitle="Registered students"
          icon={Users}
          colorScheme="blue"
          loading={loadingData}
          permissionKey={user?.role === 'admin' ? 'perm_view_users' : undefined}
          permissionValue={permissions.find(p => p.key === 'perm_view_users')?.value}
          onPermissionToggle={onPermissionToggle}
        />
      )}

      {hasPermission('perm_view_resources') && (
        <StatsCard
          href="/admin/resources"
          title="Library Resources"
          value={resources.length}
          subtitle="Official materials"
          icon={ShieldCheck}
          colorScheme="emerald"
          loading={loadingData}
          permissionKey={user?.role === 'admin' ? 'perm_view_resources' : undefined}
          permissionValue={permissions.find(p => p.key === 'perm_view_resources')?.value}
          onPermissionToggle={onPermissionToggle}
        />
      )}

      <StatsCard
        href="/admin/trending_resources"
        title="Trending Resources"
        value={resources.filter(r => r.downloads > 0 || r.avg_rating > 0).length || resources.length}
        subtitle="Top downloaded"
        icon={TrendingUp}
        colorScheme="orange"
        iconAnimation="animate-bounce"
        loading={loadingData}
      />

      <StatsCard
        href="/admin/trending_notes"
        title="Trending Notes"
        value={notes.filter(n => n.downloads > 0).length || notes.length}
        subtitle="Top downloaded"
        icon={Flame}
        colorScheme="rose"
        iconAnimation="animate-pulse"
        loading={loadingData}
      />

      {user?.role === 'admin' && (
        <StatsCard
          href="/admin/theme"
          title="Theme Management"
          value="Global"
          subtitle="Dark / Light variants"
          icon={Palette}
          colorScheme="purple"
          iconAnimation="animate-pulse"
          loading={loadingData}
        />
      )}

      {user?.role === 'admin' && (
        <StatsCard
          href="/admin/analytics"
          title="Analytics"
          value="Dashboard"
          subtitle="Platform insights & charts"
          icon={BarChart3}
          colorScheme="blue"
          iconAnimation="animate-pulse"
          loading={loadingData}
        />
      )}

      {user?.role === 'admin' && (
        <StatsCard
          href="/admin/released_apps"
          title="App Releases"
          value="Manage"
          subtitle="Android & iOS builds"
          icon={Smartphone}
          colorScheme="emerald"
          iconAnimation="animate-pulse"
          loading={loadingData}
        />
      )}
    </div>
  );
}
