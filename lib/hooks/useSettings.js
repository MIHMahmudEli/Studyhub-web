'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuthGuard } from './useAuthGuard';
import { useToast } from './useToast';
import { apiRequest } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { sanitizeName } from '@/lib/nameUtils';
import coursesData from '@/lib/data/courses.json';

export function useSettings() {
  const { user, loading: authLoading, checkUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast, showToast, closeToast } = useToast();

  useAuthGuard();

  const departments = useMemo(() => {
    return Array.from(new Set(coursesData.map(course => course.dept))).filter(Boolean).sort();
  }, []);

  const [activeTab, setActiveTab] = useState('profile');

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

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);

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

  const passwordRules = useMemo(() => ({
    length: securityForm.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(securityForm.newPassword),
    lowercase: /[a-z]/.test(securityForm.newPassword),
    number: /[0-9]/.test(securityForm.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(securityForm.newPassword),
  }), [securityForm.newPassword]);

  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSecurityChange = useCallback((e) => {
    setSecurityForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleProfilePicUpload = async (file) => {
    if (!file) return;
    setUploadingPic(true);
    try {
      try {
        await supabase.storage.createBucket('profile-pics', { public: true });
      } catch (err) {}

      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pics')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pics')
        .getPublicUrl(filePath);

      const oldPicUrl = user.profile_pic;
      await apiRequest('/users/profile', {
        method: 'PATCH',
        body: { profile_pic: publicUrl }
      });
      await checkUser();

      if (oldPicUrl) {
        const oldFileName = oldPicUrl.split('/profile-pics/').pop();
        if (oldFileName) {
          try { await supabase.storage.from('profile-pics').remove([oldFileName]); }
          catch (delErr) { console.warn('Failed to delete old profile picture:', delErr); }
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
    const oldPicUrl = user.profile_pic;
    try {
      await apiRequest('/users/profile', {
        method: 'PATCH',
        body: { profile_pic: null }
      });
      await checkUser();
      if (oldPicUrl) {
        const oldFileName = oldPicUrl.split('/profile-pics/').pop();
        if (oldFileName) {
          try { await supabase.storage.from('profile-pics').remove([oldFileName]); }
          catch (delErr) { console.warn('Failed to delete old profile picture:', delErr); }
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

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
      await checkUser();
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSaving(true);

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

  return {
    user,
    authLoading,
    theme,
    toggleTheme,
    toast,
    showToast,
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
  };
}
