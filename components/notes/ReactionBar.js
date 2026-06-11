'use client';

import { useState, useEffect, useRef } from 'react';
import { ThumbsUp, Heart, Lightbulb, Palette, LifeBuoy } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Toast from '@/components/ui/Toast';

function formatCount(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

const REACTIONS = [
  { type: 'helpful', icon: ThumbsUp, label: 'Helpful', activeColor: 'text-blue-500', activeBg: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  { type: 'brilliant', icon: Heart, label: 'Brilliant', activeColor: 'text-rose-500', activeBg: 'bg-rose-500/10', borderColor: 'border-rose-500/30' },
  { type: 'insightful', icon: Lightbulb, label: 'Insightful', activeColor: 'text-amber-500', activeBg: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  { type: 'creative', icon: Palette, label: 'Creative', activeColor: 'text-teal-500', activeBg: 'bg-teal-500/10', borderColor: 'border-teal-500/30', noFill: true },
  { type: 'lifesaver', icon: LifeBuoy, label: 'Lifesaver', activeColor: 'text-indigo-500', activeBg: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30', noFill: true },
];

export default function ReactionBar({ noteId }) {
  const { user, tokenReady } = useAuth();
  const [reactions, setReactions] = useState({});
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error', isClosing: false });
  const pendingFns = useRef({});

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

  useEffect(() => {
    if (noteId && (!user || tokenReady)) {
      fetchReactions();
    }
  }, [noteId, user, tokenReady]);

  const fetchReactions = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/notes/${noteId}/reactions`);
      setReactions(data.reactions || {});
      setUserReaction(data.userReaction || null);
    } catch (err) {
      console.error('Failed to fetch reactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReact = (type) => {
    if (!user) { showToast('Please log in to react.', 'error'); return; }
    const key = `react-${noteId}`;
    if (pendingFns.current[key]) return;

    const prevReactions = { ...reactions };
    const prevUserReaction = userReaction;

    let newReactions = { ...reactions };
    let newUserReaction;

    if (userReaction === type) {
      newReactions[type] = Math.max(0, (newReactions[type] || 0) - 1);
      newUserReaction = null;
    } else {
      if (userReaction) {
        newReactions[userReaction] = Math.max(0, (newReactions[userReaction] || 0) - 1);
      }
      newReactions[type] = (newReactions[type] || 0) + 1;
      newUserReaction = type;
    }

    setReactions(newReactions);
    setUserReaction(newUserReaction);
    pendingFns.current[key] = true;

    apiRequest(`/notes/${noteId}/reactions`, { method: 'POST', body: { reaction: type } })
      .then(data => {
        setReactions(data.reactions || {});
        setUserReaction(data.userReaction || null);
      })
      .catch(err => {
        setReactions(prevReactions);
        setUserReaction(prevUserReaction);
        showToast(err.message || 'Failed to update reaction.', 'error');
      })
      .finally(() => {
        pendingFns.current[key] = false;
      });
  };

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  return (
    <>
      <div className="flex items-center justify-center sm:justify-center gap-2 sm:gap-4 w-full overflow-x-auto py-2 px-1 -mx-1 no-scrollbar scroll-smooth">
        {REACTIONS.map(({ type, icon: Icon, label, activeColor, activeBg, borderColor, noFill }) => {
          const count = reactions[type] || 0;
          const isActive = userReaction === type;
          return (
            <button
              key={type}
              onClick={() => handleReact(type)}
              disabled={!user}
              className={`group shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer select-none border ${
                isActive
                  ? `${activeColor} ${activeBg} ${borderColor} shadow-sm scale-105`
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] border-transparent'
              } ${!user ? 'opacity-40 cursor-not-allowed' : ''}`}
              title={label}
            >
              <Icon 
                size={18} 
                className={`${isActive && !noFill ? "fill-current" : "group-hover:scale-110 transition-transform"} shrink-0`} 
                strokeWidth={isActive && noFill ? 2.5 : 2}
              />
              {count > 0 && <span>{formatCount(count)}</span>}
              <span className="hidden sm:inline-block whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>
      
      {!user && (
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3 px-2">
          Log in to react
        </p>
      )}

      <Toast toast={toast} closeToast={closeToast} />
    </>
  );
}
