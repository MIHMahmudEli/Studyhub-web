'use client';

import { useState } from 'react';
import { GitFork, Linkedin, Image, Globe, Save, Link2, Trash2 } from 'lucide-react';

const SOCIAL_FIELDS = [
  { key: 'github', icon: GitFork, label: 'GitHub', placeholder: 'https://github.com/username', color: 'text-gray-800 dark:text-gray-200' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username', color: 'text-blue-600' },
  { key: 'instagram', icon: Image, label: 'Instagram', placeholder: 'https://instagram.com/username', color: 'text-pink-500' },
  { key: 'facebook', icon: Globe, label: 'Facebook', placeholder: 'https://facebook.com/username', color: 'text-blue-700' },
];

export default function SocialLinksTab({ profileForm, handleProfileChange, handleSaveProfile, saving }) {
  const hasAnyLink = SOCIAL_FIELDS.some(f => profileForm[f.key]);

  const clearField = (key) => {
    handleProfileChange({ target: { name: key, value: '' } });
  };

  return (
    <form onSubmit={handleSaveProfile} className="space-y-6">
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Social Links</h3>
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">
          Connect your academic and professional presence. Links will appear on your public profile.
        </p>
      </div>

      <div className="space-y-4">
        {SOCIAL_FIELDS.map(({ key, icon: Icon, label, placeholder, color }) => (
          <div key={key} className="flex items-center gap-3 p-4 bg-slate-500/5 border border-[var(--card-border)] rounded-2xl group hover:border-blue-500/20 transition-colors">
            <div className={`shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1 block">
                {label}
              </label>
              <input
                type="url"
                name={key}
                value={profileForm[key] || ''}
                onChange={handleProfileChange}
                placeholder={placeholder}
                className="w-full bg-transparent border-none text-xs font-semibold text-[var(--foreground)] focus:outline-none placeholder:text-slate-400/50 p-0"
              />
            </div>
            {profileForm[key] && (
              <button
                type="button"
                onClick={() => clearField(key)}
                className="shrink-0 p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                title={`Remove ${label}`}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {!hasAnyLink && (
        <div className="flex items-center gap-2 p-4 bg-slate-500/5 border border-dashed border-[var(--card-border)] rounded-2xl">
          <Link2 size={14} className="text-slate-400" />
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            No social links added yet. Fill in any of the fields above — they will appear on your public profile.
          </p>
        </div>
      )}

      <div className="pt-4 border-t border-[var(--card-border)] flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <><Save size={14} /> Save Social Links</>
          )}
        </button>
      </div>
    </form>
  );
}
