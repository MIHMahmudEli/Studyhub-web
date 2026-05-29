'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Coins, FileText, Calendar, Zap, Sparkles, User,
  Trophy, GitFork, Linkedin, Image, Globe, ExternalLink, Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { getLevelInfo } from '@/components/leaderboard/leaderboardUtils';
import Skeleton from '@/components/ui/Skeleton';

const ROLE_BADGES = {
  admin: { label: 'Admin', class: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  moderator: { label: 'Moderator', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  student: { label: 'Student', class: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
};

const SOCIAL_ICONS = [
  { key: 'github', icon: GitFork, href: (v) => v, color: 'hover:text-gray-800 dark:hover:text-gray-200' },
  { key: 'linkedin', icon: Linkedin, href: (v) => v, color: 'hover:text-blue-600' },
  { key: 'instagram', icon: Image, href: (v) => v, color: 'hover:text-pink-500' },
  { key: 'facebook', icon: Globe, href: (v) => v, color: 'hover:text-blue-700' },
];

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

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
        <div className="max-w-lg mx-auto px-6 pt-32">
          <Skeleton type="list" count={1} />
          <div className="mt-8 space-y-4">
            <Skeleton className="w-24 h-24 rounded-3xl mx-auto" />
            <Skeleton className="w-48 h-6 rounded mx-auto" />
            <Skeleton className="w-32 h-4 rounded mx-auto" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
        <div className="max-w-lg mx-auto px-6 pt-32 text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <User size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-2">User Not Found</h2>
          <p className="text-slate-500 text-sm font-medium mb-8">{error || 'This profile does not exist.'}</p>
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500/30 transition-all">
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </main>
    );
  }

  const levelInfo = getLevelInfo(profile.points);
  const roleBadge = ROLE_BADGES[profile.role] || ROLE_BADGES.student;
  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
      <div className="max-w-lg mx-auto px-6 pt-24 pb-20">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors mb-8">
          <ArrowLeft size={14} /> Back
        </button>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 text-center backdrop-blur-xl shadow-2xl">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-3xl mx-auto mb-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-[var(--card-border)] overflow-hidden flex items-center justify-center text-3xl font-black shadow-lg">
            {profile.profile_pic ? (
              <img src={profile.profile_pic} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.name.charAt(0)
            )}
          </div>

          {/* Name + Role badge */}
          <h1 className="text-2xl font-black mb-2">{profile.name}</h1>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border mb-4 ${roleBadge.class}`}>
            <Shield size={12} />
            {roleBadge.label}
          </div>

          {/* Dept + Code */}
          {profile.dept && (
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{profile.dept}</p>
          )}
          {profile.code && (
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">ID: {profile.code}</p>
          )}

          {/* Level badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${levelInfo.currentLevel.bgColor} ${levelInfo.currentLevel.textColor} border ${levelInfo.currentLevel.borderColor} mb-5`}>
            <Zap size={12} />
            {levelInfo.currentLevel.name} Lv.{levelInfo.currentLevel.level}
          </div>

          {/* Points + XP Bar */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coins size={22} className="text-amber-500" />
            <span className="text-2xl font-black tracking-tighter">{profile.points.toLocaleString()}</span>
          </div>
          <div className="mb-6 px-2">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-1.5">
              <span>XP</span>
              <span>{levelInfo.xpInLevel.toLocaleString()} / {levelInfo.nextLevel ? levelInfo.xpToNext.toLocaleString() : 'MAX'}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ease-out ${levelInfo.currentLevel.barColor}`} style={{ width: `${levelInfo.progress * 100}%` }} />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 py-4 border-t border-[var(--card-border)] mb-4">
            <div className="flex items-center gap-2 text-slate-400">
              <FileText size={16} />
              <span className="text-sm font-bold">{profile.noteCount} Notes</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Trophy size={16} />
              <span className="text-sm font-bold">#{profile.rank} Rank</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={16} />
              <span className="text-sm font-bold">{joinedDate}</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-[var(--card-border)]">
            {SOCIAL_ICONS.map(({ key, icon: Icon, href, color }) => {
              const url = profile[key];
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={href(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-xl bg-slate-500/5 border border-[var(--card-border)] flex items-center justify-center text-slate-500 ${color} hover:border-blue-500/30 transition-all`}
                  title={key}
                >
                  <Icon size={18} />
                </a>
              );
            })}
            {!profile.github && !profile.linkedin && !profile.instagram && !profile.facebook && (
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No social links</p>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-3">
          <Sparkles size={16} className="text-blue-500 shrink-0" />
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            View all top contributors on the{' '}
            <button onClick={() => router.push('/leaderboard')} className="text-blue-500 hover:underline cursor-pointer">Leaderboard</button>
          </p>
        </div>
      </div>
    </main>
  );
}
