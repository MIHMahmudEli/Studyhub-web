'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { apiRequest } from '@/lib/api';
import { 
  User, 
  Lock, 
  Settings, 
  Eye, 
  EyeOff, 
  Save, 
  Check, 
  ShieldAlert, 
  Sparkles,
  Palette,
  Sun,
  Moon,
  ChevronRight,
  Info
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import coursesData from '@/lib/data/courses.json';

export default function SettingsPage() {
  const { user, loading: authLoading, checkUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Extract unique departments dynamically from courses.json
  const departments = useMemo(() => {
    return Array.from(new Set(coursesData.map(course => course.dept))).filter(Boolean).sort();
  }, []);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('profile'); // profile, security, preferences

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    dept: '',
    code: '' // student ID/code
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
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
        code: user.code || ''
      });
    }
  }, [user]);

  // Handle Input Changes
  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    clearAlerts();
  };

  const handleSecurityChange = (e) => {
    setSecurityForm({ ...securityForm, [e.target.name]: e.target.value });
    clearAlerts();
  };

  const clearAlerts = () => {
    setSuccessMsg('');
    setErrorMsg('');
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
      profileForm.code !== (user.code || '');

    if (!hasChanges) {
      setErrorMsg('No changes detected. You have not modified any profile details.');
      setSaving(false);
      return;
    }

    try {
      await apiRequest('/users/profile', {
        method: 'PATCH',
        body: {
          name: profileForm.name,
          dept: profileForm.dept || null, // Allow leaving it blank/nullable
          code: profileForm.code || null  // Allow leaving it blank/nullable
        }
      });
      
      // Update global context state
      await checkUser();
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
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
      setErrorMsg('Current password is required.');
      setSaving(false);
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setErrorMsg('New passwords do not match.');
      setSaving(false);
      return;
    }

    // Verify all password criteria
    const allRulesMet = Object.values(passwordRules).every(Boolean);
    if (!allRulesMet) {
      setErrorMsg('New password does not meet all security rules.');
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
      
      setSuccessMsg('Password updated successfully!');
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password. Please try again.');
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
          
          {/* Header */}
          <div className="space-y-4 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full -z-10 animate-pulse" />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[9px] font-black uppercase tracking-[0.3em]">
              <Settings size={12} className="animate-spin-slow" /> Preferences
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
              Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">Settings</span>
            </h1>
            <p className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-[500px]">
              Manage your personal student details, update passwords, and configure workspace views.
            </p>
          </div>

          {/* Feedback Alerts */}
          {successMsg && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl animate-fade-in shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Check size={16} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl animate-fade-in shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-bounce">
                <ShieldAlert size={16} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">{errorMsg}</p>
            </div>
          )}

          {/* Settings Shell Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Sidebar Tabs Navigation */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 shadow-sm backdrop-blur-xl space-y-2">
                
                {/* Profile Card Summary */}
                <div className="flex items-center gap-4 pb-6 border-b border-[var(--card-border)] mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg uppercase">
                    {user.name ? user.name[0] : 'U'}
                  </div>
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
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Personal Info</h3>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Review and update your university profile details.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</label>
                        <input 
                          type="text" 
                          name="name" 
                          value={profileForm.name} 
                          onChange={handleProfileChange}
                          required
                          className="w-full px-5 py-4 bg-slate-500/5 border border-[var(--card-border)] rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500/50 transition-colors"
                          placeholder="Your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address (Read-only)</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={profileForm.email} 
                          disabled
                          className="w-full px-5 py-4 bg-slate-500/[0.02] border border-[var(--card-border)] rounded-2xl text-xs font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed"
                          placeholder="yourname@student.edu"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Department / Major (Optional)</label>
                        <select 
                          name="dept" 
                          value={profileForm.dept} 
                          onChange={handleProfileChange}
                          className="w-full px-5 py-4 bg-slate-500/5 dark:bg-black border border-[var(--card-border)] rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                        >
                          <option value="" className="bg-white dark:bg-black text-slate-400">Select Department</option>
                          {departments.map((d, index) => (
                            <option key={index} value={d} className="bg-white dark:bg-black text-slate-800 dark:text-slate-100 font-semibold py-2">
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Student ID / Code (Optional)</label>
                        <input 
                          type="text" 
                          name="code" 
                          value={profileForm.code} 
                          onChange={handleProfileChange}
                          className="w-full px-5 py-4 bg-slate-500/5 border border-[var(--card-border)] rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500/50 transition-colors"
                          placeholder="Leave blank or enter Student Code"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--card-border)] flex justify-end">
                      <button 
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save size={14} /> Save Profile
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* 2. Security & Password Settings Form */}
                {activeTab === 'security' && (
                  <form onSubmit={handleUpdatePassword} className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Security & Password</h3>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Configure security updates for your login credentials.</p>
                    </div>

                    <div className="space-y-5">
                      {/* Current Password Field */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword.current ? "text" : "password"} 
                            name="currentPassword" 
                            value={securityForm.currentPassword} 
                            onChange={handleSecurityChange}
                            required
                            className="w-full px-5 py-4 bg-slate-500/5 border border-[var(--card-border)] rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500/50 transition-colors pr-12"
                            placeholder="Enter current password to verify"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          >
                            {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* New Password Field */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">New Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword.new ? "text" : "password"} 
                            name="newPassword" 
                            value={securityForm.newPassword} 
                            onChange={handleSecurityChange}
                            required
                            className="w-full px-5 py-4 bg-slate-500/5 border border-[var(--card-border)] rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500/50 transition-colors pr-12"
                            placeholder="Min. 8 characters"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          >
                            {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>

                        {/* Interactive Password Strength Indicators */}
                        {securityForm.newPassword && (
                          <div className="grid grid-cols-2 gap-2 mt-3 p-4 bg-slate-500/5 rounded-2xl border border-[var(--card-border)]">
                            {Object.entries(passwordRules).map(([key, met]) => (
                              <div key={key} className="flex items-center gap-2 text-[9px] uppercase font-black tracking-widest transition-colors">
                                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${met ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 scale-110' : 'bg-slate-400 dark:bg-slate-600'}`} />
                                <span className={met ? 'text-emerald-500 font-bold' : 'text-slate-500'}>
                                  {key === 'length' && 'Min 8 Characters'}
                                  {key === 'uppercase' && '1 Uppercase Letter'}
                                  {key === 'lowercase' && '1 Lowercase Letter'}
                                  {key === 'number' && '1 Digit (0-9)'}
                                  {key === 'special' && '1 Special (e.g. !@#)'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Confirm New Password Field */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Confirm New Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword.confirm ? "text" : "password"} 
                            name="confirmPassword" 
                            value={securityForm.confirmPassword} 
                            onChange={handleSecurityChange}
                            required
                            className="w-full px-5 py-4 bg-slate-500/5 border border-[var(--card-border)] rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500/50 transition-colors pr-12"
                            placeholder="Repeat new password"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          >
                            {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--card-border)] flex justify-end">
                      <button 
                        type="submit"
                        disabled={saving || !Object.values(passwordRules).every(Boolean)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save size={14} /> Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* 3. Appearance & Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Appearance & View</h3>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Configure layout themes and dark mode preferences.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-500/5 border border-[var(--card-border)] rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">Current Workspace Theme</p>
                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Toggle between bright light or cosmic dark theme</p>
                          </div>
                        </div>

                        <button 
                          onClick={toggleTheme}
                          className="px-5 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-blue-500/30 text-slate-800 dark:text-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          {theme === 'dark' ? (
                            <>
                              <Sun size={14} className="text-amber-500 animate-spin-slow" /> Switch to Light
                            </>
                          ) : (
                            <>
                              <Moon size={14} className="text-blue-500" /> Switch to Dark
                            </>
                          )}
                        </button>
                      </div>

                      {/* Info Tips */}
                      <div className="p-5 bg-blue-500/[0.02] border border-blue-500/10 rounded-2xl flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mt-0.5 flex-shrink-0">
                          <Sparkles size={14} className="animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Synchronized Preferences</h4>
                          <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                            Your interface settings automatically synchronize with your current device environment. Toggle settings freely to enhance readability.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
