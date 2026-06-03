'use client';

import { useState } from 'react';
import { Save, Trash2, Link2, AlertCircle } from 'lucide-react';
import { socialLinksSchema, validate } from '@/lib/schemas';

// ─── Brand SVG Icons ─────────────────────────────────────────────────────────
function GitHubIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function FacebookIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ─── Social Fields Config ─────────────────────────────────────────────────────
const SOCIAL_FIELDS = [
  {
    key: 'github',
    icon: GitHubIcon,
    label: 'GitHub',
    placeholder: 'https://github.com/username',
    color: 'text-slate-400 dark:text-slate-300',
    iconBg: 'bg-slate-500/10 border-slate-500/20',
  },
  {
    key: 'linkedin',
    icon: LinkedInIcon,
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/username',
    color: 'text-blue-500',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    key: 'instagram',
    icon: InstagramIcon,
    label: 'Instagram',
    placeholder: 'https://instagram.com/username',
    color: 'text-pink-500',
    iconBg: 'bg-pink-500/10 border-pink-500/20',
  },
  {
    key: 'facebook',
    icon: FacebookIcon,
    label: 'Facebook',
    placeholder: 'https://facebook.com/username',
    color: 'text-blue-600',
    iconBg: 'bg-blue-600/10 border-blue-600/20',
  },
];

export default function SocialLinksTab({ profileForm, handleProfileChange, handleSaveProfile, saving }) {
  const [fieldErrors, setFieldErrors] = useState({});
  const hasAnyLink = SOCIAL_FIELDS.some(f => profileForm[f.key]);

  const clearField = (key) => {
    handleProfileChange({ target: { name: key, value: '' } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validate(socialLinksSchema, profileForm);
    if (!result.valid) {
      setFieldErrors(result.errors.fields);
      return;
    }
    setFieldErrors({});
    handleSaveProfile(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Social Links</h3>
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">
          Connect your academic and professional presence. Links will appear on your public profile.
        </p>
      </div>

      <div className="space-y-3">
        {SOCIAL_FIELDS.map(({ key, icon: Icon, label, placeholder, color, iconBg }) => (
          <div
            key={key}
            className="flex items-center gap-4 p-4 bg-slate-500/5 border border-[var(--card-border)] rounded-2xl group hover:border-blue-500/20 transition-colors"
          >
            {/* Brand icon badge */}
            <div className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${iconBg} ${color}`}>
              <Icon size={18} />
            </div>

            <div className="flex-1 min-w-0">
              <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1 block">
                {label}
              </label>
              <input
                type="url"
                name={key}
                value={profileForm[key] || ''}
                onChange={(e) => { setFieldErrors((prev) => ({ ...prev, [key]: undefined })); handleProfileChange(e); }}
                placeholder={placeholder}
                className="w-full bg-transparent border-none text-xs font-semibold text-[var(--foreground)] focus:outline-none placeholder:text-slate-400/50 p-0"
              />
              {fieldErrors[key] && (
                <p className="flex items-center gap-1 mt-1 text-[8px] font-bold text-red-400 uppercase tracking-widest">
                  <AlertCircle size={10} /> {fieldErrors[key][0]}
                </p>
              )}
            </div>

            {profileForm[key] && (
              <button
                type="button"
                onClick={() => clearField(key)}
                className="shrink-0 p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
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
