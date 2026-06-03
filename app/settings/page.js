'use client';

import { Settings } from 'lucide-react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import PageHeader from '@/components/ui/PageHeader';
import Toast from '@/components/ui/Toast';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import { useSettings } from '@/lib/hooks/useSettings';
import dynamic from 'next/dynamic';

const ProfileTab = dynamic(() => import('@/components/settings/ProfileTab'));
const SecurityTab = dynamic(() => import('@/components/settings/SecurityTab'));
const PreferencesTab = dynamic(() => import('@/components/settings/PreferencesTab'));
const SocialLinksTab = dynamic(() => import('@/components/settings/SocialLinksTab'));

export default function SettingsPage() {
  const {
    user,
    authLoading,
    theme,
    toggleTheme,
    toast,
    closeToast,
    departments,
    activeTab,
    setActiveTab,
    profileForm,
    handleProfileChange,
    handleSaveProfile,
    handleProfilePicUpload,
    handleProfilePicDelete,
    uploadingPic,
    securityForm,
    handleSecurityChange,
    handleUpdatePassword,
    showPassword,
    setShowPassword,
    passwordRules,
    saving,
  } = useSettings();

  if (authLoading || !user) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto space-y-10">

          <PageHeader
            badgeIcon={Settings}
            badgeText="Preferences"
            badgeColorClass="text-blue-500 bg-blue-500/10 border-blue-500/20"
            glowColor="bg-blue-500/10"
            title="Account"
            titleHighlight="Settings"
            titleGradient="from-blue-500 via-indigo-500 to-purple-500"
            description="Manage your personal student details, update passwords, and configure workspace views."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            <div className="lg:col-span-4 space-y-4">
              <SettingsSidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="lg:col-span-8">
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-8 shadow-sm backdrop-blur-xl">

                {activeTab === 'profile' && (
                  <ProfileTab
                    user={user}
                    profileForm={profileForm}
                    handleProfileChange={handleProfileChange}
                    handleSaveProfile={handleSaveProfile}
                    uploadingPic={uploadingPic}
                    handleProfilePicUpload={handleProfilePicUpload}
                    handleProfilePicDelete={handleProfilePicDelete}
                    departments={departments}
                    saving={saving}
                  />
                )}

                {activeTab === 'security' && (
                  <SecurityTab
                    securityForm={securityForm}
                    handleSecurityChange={handleSecurityChange}
                    handleUpdatePassword={handleUpdatePassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    passwordRules={passwordRules}
                    saving={saving}
                  />
                )}

                {activeTab === 'social' && (
                  <SocialLinksTab
                    profileForm={profileForm}
                    handleProfileChange={handleProfileChange}
                    handleSaveProfile={handleSaveProfile}
                    saving={saving}
                  />
                )}

                {activeTab === 'preferences' && (
                  <PreferencesTab
                    theme={theme}
                    toggleTheme={toggleTheme}
                  />
                )}

              </div>
            </div>

          </div>

        </div>
      </div>

      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
