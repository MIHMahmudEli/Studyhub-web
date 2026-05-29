'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import PageHeader from '@/components/ui/PageHeader';
import { apiRequest } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { sanitizeName } from '@/lib/nameUtils';
import { 
  User, 
  Lock, 
  Settings, 
  Palette,
  Link2,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import coursesData from '@/lib/data/courses.json';
import Toast from '@/components/ui/Toast';
import ProfileTab from '@/components/settings/ProfileTab';
import SecurityTab from '@/components/settings/SecurityTab';
import PreferencesTab from '@/components/settings/PreferencesTab';
import SocialLinksTab from '@/components/settings/SocialLinksTab';

export default function SettingsPage() {
  const { user, loading: authLoading, checkUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Extract unique departments dynamically from courses.json
  const departments = useMemo(() => {
    return Array.from(new Set(coursesData.map(course => course.dept))).filter(Boolean).sort();
  }, []);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('profile'); // profile, security, preferences, social

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    dept: '',
    code: '',
    github: '',
    linkedin: '',
    instagram: '',
    facebook: '',
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI state
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error', isClosing: false });
  const [uploadingPic, setUploadingPic] = useState(false);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type, isClosing: false });
    // Reset timer just in case
    setTimeout(() => closeToast(), 5000);
  };
  
  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearAlerts();

    // 1. Enforce size limit of 2MB
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      showToast('File size must not exceed 2MB. Please select a smaller image.', 'error');
      return;
    }

    // 2. Validate file type (image only)
    if (!file.type.startsWith('image/')) {
      showToast('Invalid file type. Please upload a valid image (PNG, JPG, WEBP).', 'error');
      return;
    }

    setUploadingPic(true);

    try {
      // 3. Programmatically try to create the bucket 'profile-pics' if needed
      try {
        await supabase.storage.createBucket('profile-pics', { public: true });
      } catch (err) {
        // Safe to ignore if bucket already exists or permissions don't allow bucket creation
      }

      // 4. Upload file to Supabase Storage in 'profile-pics' bucket
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pics')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 5. Get the Public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pics')
        .getPublicUrl(filePath);

      // Save previous picture URL to delete after successful update
      const oldPicUrl = user.profile_pic;

      // 6. Save the image public URL to the user profile via our backend API
      await apiRequest('/users/profile', {
        method: 'PATCH',
        body: {
          profile_pic: publicUrl
        }
      });

      // 7. Refresh user profile in global AuthContext
      await checkUser();

      // 8. Delete the old picture from Supabase Storage to keep space clean
      if (oldPicUrl) {
        const oldFileName = oldPicUrl.split('/profile-pics/').pop();
        if (oldFileName) {
          try {
            await supabase.storage.from('profile-pics').remove([oldFileName]);
          } catch (delErr) {
            console.warn('Failed to delete old profile picture:', delErr);
          }
        }
      }

      showToast('Profile picture updated successfully!', 'success');
    } catch (err) {
      console.error('Profile pic upload error:', err);
      showToast(err.message || 'Failed to upload profile picture. Please try again.', 'error');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleProfilePicDelete = async () => {
    if (!user.profile_pic) return;

    setUploadingPic(true);
    clearAlerts();

    const oldPicUrl = user.profile_pic;

    try {
      // 1. Clear profile_pic in backend database first
      await apiRequest('/users/profile', {
        method: 'PATCH',
        body: {
          profile_pic: null
        }
      });

      // 2. Refresh user profile in global AuthContext
      await checkUser();

      // 3. Delete the old picture from Supabase Storage
      if (oldPicUrl) {
        const oldFileName = oldPicUrl.split('/profile-pics/').pop();
        if (oldFileName) {
          try {
            await supabase.storage.from('profile-pics').remove([oldFileName]);
          } catch (delErr) {
            console.warn('Failed to delete old profile picture:', delErr);
          }
        }
      }

      showToast('Profile picture deleted successfully!', 'success');
    } catch (err) {
      console.error('Profile pic delete error:', err);
      showToast(err.message || 'Failed to remove profile picture. Please try again.', 'error');
    } finally {
      setUploadingPic(false);
    }
  };

  // Password rules validation
  const passwordRules = useMemo(() => ({
    length: securityForm.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(securityForm.newPassword),
    lowercase: /[a-z]/.test(securityForm.newPassword),
    number: /[0-9]/.test(securityForm.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(securityForm.newPassword),
  }), [securityForm.newPassword]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        dept: user.dept || '',
        code: user.code || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        instagram: user.instagram || '',
        facebook: user.facebook || '',
      });
    }
  }, [user]);

  // Handle Input Changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    clearAlerts();
  };

  const handleSecurityChange = (e) => {
    setSecurityForm({ ...securityForm, [e.target.name]: e.target.value });
    clearAlerts();
  };

  const clearAlerts = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  // Submit Profile Form
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    clearAlerts();

    // Check if anything has actually changed
    const hasChanges = 
      profileForm.name !== (user.name || '') ||
      profileForm.dept !== (user.dept || '') ||
      profileForm.code !== (user.code || '') ||
      profileForm.github !== (user.github || '') ||
      profileForm.linkedin !== (user.linkedin || '') ||
      profileForm.instagram !== (user.instagram || '') ||
      profileForm.facebook !== (user.facebook || '');

    if (!hasChanges) {
      showToast('No changes detected. You have not modified any profile details.', 'warning');
      setSaving(false);
      return;
    }

    const nameChanged = profileForm.name !== (user.name || '');
    const cleanedName = nameChanged ? sanitizeName(profileForm.name) : user.name;
    if (nameChanged && !cleanedName) {
      showToast('Please enter a valid name.', 'error');
      setSaving(false);
      return;
    }
    if (nameChanged) {
      setProfileForm(prev => ({ ...prev, name: cleanedName }));
    }
    try {
      await apiRequest('/users/profile', {
        method: 'PATCH',
        body: {
          name: cleanedName,
          dept: profileForm.dept || null,
          code: profileForm.code || null,
          github: profileForm.github || null,
          linkedin: profileForm.linkedin || null,
          instagram: profileForm.instagram || null,
          facebook: profileForm.facebook || null
        }
      });
      
      // Update global context state
      await checkUser();
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Submit Security Form
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    clearAlerts();

    if (!securityForm.currentPassword) {
      showToast('Current password is required.', 'error');
      setSaving(false);
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      setSaving(false);
      return;
    }

    // Verify all password criteria
    const allRulesMet = Object.values(passwordRules).every(Boolean);
    if (!allRulesMet) {
      showToast('New password does not meet all security rules.', 'error');
      setSaving(false);
      return;
    }

    try {
      await apiRequest('/users/profile', {
        method: 'PATCH',
        body: {
          currentPassword: securityForm.currentPassword,
          password: securityForm.newPassword
        }
      });
      
      showToast('Password updated successfully!', 'success');
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      showToast(err.message || 'Failed to update password. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

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

          {/* Settings Shell Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Sidebar Tabs Navigation */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 shadow-sm backdrop-blur-xl space-y-2">
                
                {/* Profile Card Summary */}
                <div className="flex items-center gap-4 pb-6 border-b border-[var(--card-border)] mb-4">
                  {user.profile_pic ? (
                    <img 
                      src={user.profile_pic} 
                      alt={user.name} 
                      className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-[var(--card-border)]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg uppercase">
                      {user.name ? user.name[0] : 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm">{user.name}</p>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-500/5 px-2 py-0.5 rounded border border-[var(--card-border)] mt-1 inline-block">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => { setActiveTab('profile'); clearAlerts(); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === 'profile' 
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm shadow-blue-500/5' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-[var(--foreground)] hover:bg-slate-500/5 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <User size={16} /> Personal Info
                  </span>
                  <ChevronRight size={14} className={`transition-transform duration-300 ${activeTab === 'profile' ? 'translate-x-0.5' : 'opacity-0'}`} />
                </button>

                <button 
                  onClick={() => { setActiveTab('security'); clearAlerts(); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === 'security' 
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm shadow-blue-500/5' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-[var(--foreground)] hover:bg-slate-500/5 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Lock size={16} /> Security & Password
                  </span>
                  <ChevronRight size={14} className={`transition-transform duration-300 ${activeTab === 'security' ? 'translate-x-0.5' : 'opacity-0'}`} />
                </button>

                <button 
                  onClick={() => { setActiveTab('social'); clearAlerts(); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === 'social' 
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm shadow-blue-500/5' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-[var(--foreground)] hover:bg-slate-500/5 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Link2 size={16} /> Social Links
                  </span>
                  <ChevronRight size={14} className={`transition-transform duration-300 ${activeTab === 'social' ? 'translate-x-0.5' : 'opacity-0'}`} />
                </button>

                <button 
                  onClick={() => { setActiveTab('preferences'); clearAlerts(); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === 'preferences' 
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm shadow-blue-500/5' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-[var(--foreground)] hover:bg-slate-500/5 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Palette size={16} /> Appearance & View
                  </span>
                  <ChevronRight size={14} className={`transition-transform duration-300 ${activeTab === 'preferences' ? 'translate-x-0.5' : 'opacity-0'}`} />
                </button>

              </div>
            </div>

            {/* Config Forms Area */}
            <div className="lg:col-span-8">
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-8 shadow-sm backdrop-blur-xl">
                
                {/* 1. Profile Settings Form */}
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

                {/* 2. Security & Password Settings Form */}
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

                {/* 3. Social Links Tab */}
                {activeTab === 'social' && (
                  <SocialLinksTab
                    profileForm={profileForm}
                    handleProfileChange={handleProfileChange}
                    handleSaveProfile={handleSaveProfile}
                    saving={saving}
                  />
                )}

                {/* 4. Appearance & Preferences Tab */}
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

      {/* Reusable Toast Message container */}
      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
