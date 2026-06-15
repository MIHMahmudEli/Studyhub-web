'use client';

import { UserPlus, Check } from 'lucide-react';
import { useFollow } from '@/lib/hooks/useFollow';

/**
 * Follow / Following control.
 *
 * - variant="full"          → Follow (filled) ↔ Following (outline + check)
 * - variant="hide-on-follow" → prominent Follow CTA that disappears once
 *                              followed (YouTube-style), for compact spots.
 *
 * Renders nothing for yourself or before the real status has loaded.
 */
export default function FollowButton({ userId, variant = 'full', className = '' }) {
  const { following, isSelf, loaded, pending, toggle } = useFollow(userId);

  if (!userId || isSelf || !loaded) return null;
  if (variant === 'hide-on-follow' && following) return null;

  const base =
    'inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-60';
  const skin = following
    ? 'border border-purple-500 text-purple-500 hover:bg-purple-500/10'
    : 'bg-purple-500 text-white hover:bg-purple-600 shadow-sm';

  return (
    <button
      type="button"
      disabled={pending}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggle();
      }}
      className={`${base} ${skin} ${className}`}
    >
      {following ? <Check size={14} /> : <UserPlus size={14} />}
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
