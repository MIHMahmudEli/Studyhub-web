'use client';

import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Toast from '@/components/ui/Toast';
import AdminDashboardHeader from '@/components/admin/AdminDashboardHeader';
import AdminVisibilityConfig from '@/components/admin/AdminVisibilityConfig';
import AdminStatsGrid from '@/components/admin/AdminStatsGrid';
import AdminShortcuts from '@/components/admin/AdminShortcuts';
import { useAdminDashboard } from '@/lib/hooks/useAdminDashboard';

export default function AdminDashboardPage() {
  const {
    user, authLoading, loadingData, toast, closeToast,
    uploadVisibility, permissions,
    activeUsersCount, platformTotalUsers,
    pendingNotes, pendingNotesTotal, pendingResources, pendingResourcesTotal, resources, notes,
    handleVisibilityChange, handlePermissionToggle,
  } = useAdminDashboard();

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">

          <AdminDashboardHeader user={user} />

          {user?.role === 'admin' && (
            <AdminVisibilityConfig
              uploadVisibility={uploadVisibility}
              loadingData={loadingData}
              onVisibilityChange={handleVisibilityChange}
            />
          )}

          <AdminStatsGrid
            user={user}
            loadingData={loadingData}
            permissions={permissions}
            activeUsersCount={activeUsersCount}
            platformTotalUsers={platformTotalUsers}
            pendingNotes={pendingNotes}
            pendingNotesTotal={pendingNotesTotal}
            pendingResources={pendingResources}
            pendingResourcesTotal={pendingResourcesTotal}
            resources={resources}
            notes={notes}
            onPermissionToggle={handlePermissionToggle}
          />

          <AdminShortcuts
            user={user}
            loadingData={loadingData}
            pendingNotes={pendingNotes}
            pendingNotesTotal={pendingNotesTotal}
            pendingResources={pendingResources}
            pendingResourcesTotal={pendingResourcesTotal}
          />

        </div>
      </div>

      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
