'use client';

import { useState, useEffect, useRef } from 'react';
import { SmilePlus } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Toast from '@/components/ui/Toast';

const REACTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😄', label: 'Haha' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
];

export default function ReactionBar({ noteId }) {
  const { user } = useAuth();
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
    if (noteId) {
      fetchReactions();
    }
  }, [noteId]);

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

  const handleReact = (emoji) => {
    if (!user) { showToast('Please log in to react.', 'error'); return; }
    const key = `react-${noteId}`;
    if (pendingFns.current[key]) return;

    const prevReactions = { ...reactions };
    const prevUserReaction = userReaction;

    let newReactions = { ...reactions };
    let newUserReaction;

    if (userReaction === emoji) {
      newReactions[emoji] = Math.max(0, (newReactions[emoji] || 0) - 1);
      newUserReaction = null;
    } else {
      if (userReaction) {
        newReactions[userReaction] = Math.max(0, (newReactions[userReaction] || 0) - 1);
      }
      newReactions[emoji] = (newReactions[emoji] || 0) + 1;
      newUserReaction = emoji;
    }

    setReactions(newReactions);
    setUserReaction(newUserReaction);
    pendingFns.current[key] = true;

    apiRequest(`/notes/${noteId}/reactions`, { method: 'POST', body: { reaction: emoji } })
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
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-5 shadow-sm">
        <div className="flex items-center gap-5 flex-wrap">
          {REACTIONS.map(({ emoji, label }) => {
            const count = reactions[emoji] || 0;
            const isActive = userReaction === emoji;
            return (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                disabled={!user}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-purple-500/10 text-purple-500 border border-purple-500/30 shadow-sm scale-105'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-transparent'
                } ${!user ? 'opacity-40 cursor-not-allowed' : ''}`}
                title={label}
              >
                <span className="text-base leading-none">{emoji}</span>
                {count > 0 && <span className="text-[9px]">{count}</span>}
              </button>
            );
          })}
        </div>

        {totalReactions > 0 && (
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-3 pl-1">
            {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
          </p>
        )}

        {!user && (
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-3 pl-1">
            Log in to react to this document
          </p>
        )}
      </div>

      <Toast toast={toast} closeToast={closeToast} />
    </>
  );
}
