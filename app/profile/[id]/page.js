'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Coins, FileText, Calendar, Zap, Sparkles, User,
  Trophy, Globe, Shield, ExternalLink,
  Star, ArrowRight, Hash
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { getLevelInfo } from '@/components/leaderboard/leaderboardUtils';
import { Skeleton } from '@/components/ui/Skeleton';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

// ─── Role Badge Config ──────────────────────────────────────────────────────
const ROLE_BADGES = {
  admin: {
    label: 'Admin',
    class: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    glow: 'from-rose-500/10',
  },
  moderator: {
    label: 'Moderator',
    class: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    glow: 'from-amber-500/10',
  },
  student: {
    label: 'Student',
    class: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    glow: 'from-blue-500/10',
  },
};

// ─── Social Brand SVG Icons ──────────────────────────────────────────────────
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

// ─── Social Link Config ─────────────────────────────────────────────────────
const SOCIAL_LINKS = [
  {
    key: 'github',
    icon: GitHubIcon,
    label: 'GitHub',
    color: 'hover:border-slate-500/50 hover:text-slate-300',
    badgeBg: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
  },
  {
    key: 'linkedin',
    icon: LinkedInIcon,
    label: 'LinkedIn',
    color: 'hover:border-blue-500/50 hover:text-blue-400',
    badgeBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  },
  {
    key: 'instagram',
    icon: InstagramIcon,
    label: 'Instagram',
    color: 'hover:border-pink-500/50 hover:text-pink-400',
    badgeBg: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
  },
  {
    key: 'facebook',
    icon: FacebookIcon,
    label: 'Facebook',
    color: 'hover:border-blue-600/50 hover:text-blue-500',
    badgeBg: 'bg-blue-600/10 border-blue-600/20 text-blue-500',
  },
];

// ─── Profile Skeleton ────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />
      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12 animate-pulse">
          {/* Header skeleton */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="h-6 w-28 bg-white/[0.05] rounded-full" />
              <div className="h-12 w-72 bg-white/[0.05] rounded-xl" />
              <div className="h-4 w-96 bg-white/[0.05] rounded-full" />
            </div>
            <div className="h-16 w-48 bg-white/[0.05] rounded-[1.25rem]" />
          </div>
          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-[420px] bg-white/[0.05] rounded-[2.5rem]" />
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-[140px] bg-white/[0.05] rounded-[2rem]" />
                ))}
              </div>
              <div className="h-[200px] bg-white/[0.05] rounded-[2.5rem]" />
              <div className="h-[120px] bg-white/[0.05] rounded-[2.5rem]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ title, value, subtitle, icon: Icon, colorScheme = 'blue' }) {
  const colors = {
    blue:    { border: 'hover:border-blue-500/30',    gradient: 'from-blue-500/[0.04]',    text: 'text-blue-500',    iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-500' },
    emerald: { border: 'hover:border-emerald-500/30', gradient: 'from-emerald-500/[0.04]', text: 'text-emerald-500', iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' },
    amber:   { border: 'hover:border-amber-500/30',   gradient: 'from-amber-500/[0.04]',   text: 'text-amber-500',   iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
    purple:  { border: 'hover:border-purple-500/30',  gradient: 'from-purple-500/[0.04]',  text: 'text-purple-500',  iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-500' },
  };
  const s = colors[colorScheme] || colors.blue;
  return (
    <div className={`group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 ${s.border}`}>
      <div className={`absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${s.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="flex justify-between items-start relative z-10 w-full">
        <div className="space-y-2 flex-1 min-w-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400 block">{title}</span>
          <h3 className={`text-3xl sm:text-4xl font-black tracking-tight ${s.text}`}>{value}</h3>
          <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest">{subtitle}</p>
        </div>
        {Icon && (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${s.iconBg} border flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0 ml-4`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Social Card ─────────────────────────────────────────────────────────────
function SocialCard({ href, icon: Icon, label, scheme }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden p-5 sm:p-6 border-2 rounded-[2rem] shadow-lg transition-all hover:-translate-y-1 duration-500 flex flex-col justify-between h-[130px] cursor-pointer bg-[var(--card-bg)] border-[var(--card-border)] ${scheme.color}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-all bg-current/5" />
      <div className="flex items-center justify-between relative z-10">
        <div className={`w-10 h-10 border rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500 ${scheme.badgeBg}`}>
          <Icon size={18} />
        </div>
        <ExternalLink size={14} className="text-slate-500 group-hover:text-current transition-colors" />
      </div>
      <div className="relative z-10 text-left mt-2">
        <h4 className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">{label}</h4>
        <p className="text-[10px] font-bold text-slate-500 mt-0.5 flex items-center gap-1">
          View Profile <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </p>
      </div>
    </a>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function PublicProfilePage() {
  const { id } = useParams();
  const { user: authUser, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !authUser) router.push('/auth');
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (!tokenReady || !authUser || !id) return;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest(`/users/${id}/public-profile`);
        setProfile(res);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, tokenReady, authUser]);

  if (authLoading || loading) return <ProfileSkeleton />;

  // ─── Error State ───────────────────────────────────────────────────────────
  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
        <DashboardNavbar />
        <div className="pt-24 md:pt-32 px-4 md:px-8">
          <div className="max-w-[1400px] mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors mb-8"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
                <User size={32} className="text-rose-500" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                <Shield size={12} /> Profile Error
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase mb-3">User Not Found</h1>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-8">
                {error || 'This profile does not exist.'}
              </p>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500/30 transition-all"
              >
                <ArrowLeft size={14} /> Go Back
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─── Data Prep ──────────────────────────────────────────────────────────────
  const levelInfo = getLevelInfo(profile.points);
  const roleBadge = ROLE_BADGES[profile.role] || ROLE_BADGES.student;
  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const activeSocials = SOCIAL_LINKS.filter(s => profile[s.key]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">

          {/* ── Page Header ─────────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
            {/* Decorative glow */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full -z-10 animate-pulse" />

            <div className="space-y-3 sm:space-y-4">
              {/* Back button */}
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              {/* Role badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border ${roleBadge.class}`}>
                <Shield size={12} /> {roleBadge.label} Profile
              </div>
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                {profile.name.split(' ')[0]}&apos;s{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                  Profile
                </span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {profile.dept || 'StudyHub Member'}{profile.code ? ` · ID: ${profile.code}` : ''}
              </p>
            </div>

            {/* Date widget */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-start md:justify-end">
              <div className="flex items-center gap-3.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.25rem] p-3.5 shadow-sm backdrop-blur-xl">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <Calendar size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider leading-none">Joined</p>
                  <p className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 mt-1.5 leading-none">
                    {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main Content Grid ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

            {/* ── Left Column: Identity Card ─────────────────────────────────── */}
            <div className="space-y-4 sm:space-y-6">
              {/* Profile card */}
              <div className="relative group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-8 text-center shadow-sm backdrop-blur-xl overflow-hidden hover:border-blue-500/20 transition-all duration-500">
                {/* Decorative gradient orb */}
                <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -z-10 opacity-50 bg-gradient-to-br ${roleBadge.glow} to-transparent`} />

                {/* Avatar */}
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-[var(--card-border)] overflow-hidden flex items-center justify-center text-3xl font-black shadow-2xl">
                    {profile.profile_pic ? (
                      <Image src={profile.profile_pic} alt={profile.name} width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-500">
                        {profile.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  {/* Level indicator dot */}
                  <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-xl border-2 border-[var(--background)] flex items-center justify-center ${levelInfo.currentLevel.bgColor}`}>
                    <Zap size={12} className={levelInfo.currentLevel.textColor} />
                  </div>
                </div>

                {/* Name */}
                <h2 className="text-xl font-black uppercase tracking-tight mb-2">{profile.name}</h2>

                {/* Role badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border mb-4 ${roleBadge.class}`}>
                  <Shield size={11} /> {roleBadge.label}
                </div>

                {/* Dept & ID */}
                {profile.dept && (
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{profile.dept}</p>
                )}
                {profile.code && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-500/5 border border-[var(--card-border)] text-[9px] font-black uppercase tracking-widest text-slate-500 mb-5">
                    <Hash size={10} /> {profile.code}
                  </div>
                )}

                {/* Level Badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${levelInfo.currentLevel.bgColor} ${levelInfo.currentLevel.textColor} border ${levelInfo.currentLevel.borderColor} mb-5`}>
                  <Zap size={12} />
                  {levelInfo.currentLevel.name} · Lv.{levelInfo.currentLevel.level}
                </div>

                {/* Points */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Coins size={22} className="text-amber-500" />
                  <span className="text-3xl font-black tracking-tighter">{profile.points.toLocaleString()}</span>
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest self-end mb-1">pts</span>
                </div>

                {/* XP Bar */}
                <div className="mb-2 px-2">
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
                    <span>XP Progress</span>
                    <span>{levelInfo.xpInLevel.toLocaleString()} / {levelInfo.nextLevel ? levelInfo.xpToNext.toLocaleString() : 'MAX'}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${levelInfo.currentLevel.barColor}`}
                      style={{ width: `${levelInfo.progress * 100}%` }}
                    />
                  </div>
                  {levelInfo.nextLevel && (
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 text-right">
                      Next: {levelInfo.nextLevel.name}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-[var(--card-border)] mt-5 pt-5">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Member Since</p>
                  <p className="text-[11px] font-black uppercase tracking-tight text-slate-400">{joinedDate}</p>
                </div>
              </div>

              {/* Leaderboard CTA Card */}
              <div
                onClick={() => router.push('/leaderboard')}
                className="group cursor-pointer p-5 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-[var(--card-bg)] border-2 border-blue-500/20 hover:border-blue-500/50 rounded-[2rem] transition-all hover:-translate-y-1 duration-500 flex items-center gap-3 shadow-lg"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-md group-hover:scale-110 transition-transform duration-500 shrink-0">
                  <Sparkles size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black uppercase tracking-tight text-[var(--foreground)] group-hover:text-blue-500 transition-colors">View Leaderboard</p>
                  <p className="text-[9px] font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                    See top contributors <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right Column: Stats + Social ──────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">

              {/* Stats Grid */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-4">
                  Activity Stats
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard
                    title="Points"
                    value={profile.points.toLocaleString()}
                    subtitle="Total earned"
                    icon={Coins}
                    colorScheme="amber"
                  />
                  <StatCard
                    title="Rank"
                    value={`#${profile.rank}`}
                    subtitle="Global position"
                    icon={Trophy}
                    colorScheme="purple"
                  />
                  <StatCard
                    title="Notes"
                    value={profile.noteCount}
                    subtitle="Uploaded"
                    icon={FileText}
                    colorScheme="blue"
                  />
                  <StatCard
                    title="Level"
                    value={levelInfo.currentLevel.level}
                    subtitle={levelInfo.currentLevel.name}
                    icon={Star}
                    colorScheme="emerald"
                  />
                </div>
              </div>

              {/* Level Progress Card */}
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm backdrop-blur-xl hover:border-blue-500/20 transition-all duration-500">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[9px] font-black uppercase tracking-[0.3em] mb-3">
                      <Zap size={11} /> Level Progression
                    </div>
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                      {levelInfo.currentLevel.name}{' '}
                      <span className={levelInfo.currentLevel.textColor}>Lv.{levelInfo.currentLevel.level}</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">
                      {levelInfo.nextLevel
                        ? `${(levelInfo.xpToNext - levelInfo.xpInLevel).toLocaleString()} XP to reach ${levelInfo.nextLevel.name}`
                        : 'Maximum level reached — congratulations!'}
                    </p>
                  </div>
                  <div className={`text-4xl font-black ${levelInfo.currentLevel.textColor} shrink-0`}>
                    {Math.round(levelInfo.progress * 100)}%
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${levelInfo.currentLevel.barColor} shadow-lg`}
                    style={{ width: `${levelInfo.progress * 100}%` }}
                  />
                </div>

                {/* Level milestones */}
                <div className="flex items-center justify-between">
                  {[
                    { name: 'Bronze', threshold: 0, color: 'text-orange-500' },
                    { name: 'Silver', threshold: 50, color: 'text-slate-400' },
                    { name: 'Gold', threshold: 150, color: 'text-amber-500' },
                    { name: 'Platinum', threshold: 350, color: 'text-purple-400' },
                    { name: 'Diamond', threshold: 700, color: 'text-cyan-400' },
                  ].map((milestone) => (
                    <div key={milestone.name} className="flex flex-col items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${profile.points >= milestone.threshold ? milestone.color.replace('text-', 'bg-') : 'bg-slate-600'}`} />
                      <span className={`text-[8px] font-black uppercase tracking-wide hidden sm:block ${profile.points >= milestone.threshold ? milestone.color : 'text-slate-600'}`}>
                        {milestone.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links Section */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-4">
                  Social Links
                </h3>
                {activeSocials.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {activeSocials.map(({ key, icon: Icon, label, color, badgeBg }) => (
                      <SocialCard
                        key={key}
                        href={profile[key]}
                        icon={Icon}
                        label={label}
                        scheme={{ color, badgeBg }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center mx-auto mb-3">
                      <Globe size={20} className="text-slate-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No social links added</p>
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
