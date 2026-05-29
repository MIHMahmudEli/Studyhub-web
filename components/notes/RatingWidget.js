'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, AlertCircle, CheckCircle2, X, Edit2, Trash2, MessageSquarePlus, SendHorizonal, ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Toast from '@/components/ui/Toast';

function CommentItem({ review, uploaderId, currentUser, onDelete, onStartEdit, onSaveEdit, onCancelEdit, editingCommentId, editingCommentText, setEditingCommentText, commentInputRef, onToggleLike, onToggleDislike, onReply, replyToId, replyText, setReplyText, submitReply, replyingTo }) {
  const isOwner = review.user_id === uploaderId;
  const isAuthor = currentUser && currentUser.id === review.user_id;
  const isEditing = editingCommentId === review.id;
  const isTemp = typeof review.id === 'string' && review.id.startsWith('temp-');

  return (
    <div className={`bg-slate-50 dark:bg-white/[0.02] rounded-2xl p-4 sm:p-5 border border-[var(--card-border)] group transition-all hover:bg-slate-100/50 dark:hover:bg-white/[0.04] ${isTemp ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        {review.user?.profile_pic ? (
          <img src={review.user.profile_pic} alt={review.user?.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-[var(--card-border)] shadow-md shrink-0 select-none" />
        ) : (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xs font-black uppercase shrink-0 select-none shadow-inner">
            {review.user?.name ? review.user.name.charAt(0) : '#'}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none" title={review.user?.name || `Student #${review.user_id}`}>
                {review.user?.name || `Student #${review.user_id}`}
              </span>
              {isOwner && (
                <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                  Owner
                </span>
              )}
              {review.rating > 0 && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[8px] font-black shrink-0">
                  {review.rating} ★
                </span>
              )}
            </div>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2 mt-2">
              <textarea ref={commentInputRef} value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none transition-colors text-[var(--foreground)] resize-none h-16 focus:border-purple-500/40" />
              <div className="flex gap-2">
                <button onClick={() => onCancelEdit()} className="flex-1 py-2 border border-slate-200 dark:border-white/[0.08] rounded-xl text-[9px] font-black tracking-widest uppercase text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
                <button onClick={() => onSaveEdit(review.id)} className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-[9px] font-black tracking-widest uppercase transition-colors cursor-pointer shadow-md shadow-purple-500/10">Save Changes</button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-400 leading-relaxed break-words pl-0.5">
              {replyingTo && (
                <span className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-bold mr-1.5 cursor-pointer">
                  @{replyingTo}
                </span>
              )}
              {review.comment}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
            <button onClick={() => onToggleLike(review.id)} className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${review.userVote === 'like' ? 'text-blue-500' : 'text-slate-400 hover:text-blue-500'}`}>
              <ThumbsUp size={12} className={review.userVote === 'like' ? 'fill-blue-500' : ''} /> {review.likes_count || 0}
            </button>
            <button onClick={() => onToggleDislike(review.id)} className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${review.userVote === 'dislike' ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}>
              <ThumbsDown size={12} className={review.userVote === 'dislike' ? 'fill-red-500' : ''} /> {review.dislikes_count || 0}
            </button>
            {currentUser && !isOwner && (
              <button onClick={() => onReply(review)} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-purple-500 transition-colors cursor-pointer">
                <MessageSquare size={12} /> Reply
              </button>
            )}
            {isAuthor && !isEditing && (
              <>
                <button onClick={() => onStartEdit(review)} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-blue-500 transition-colors cursor-pointer">
                  <Edit2 size={10} /> Edit
                </button>
                <button onClick={() => onDelete(review.id)} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                  <Trash2 size={10} /> Delete
                </button>
              </>
            )}
          </div>

          {replyToId === review.id && (
            <div className="flex gap-3 mt-3 bg-[var(--card-bg)] p-3 rounded-2xl border border-[var(--card-border)] focus-within:border-purple-500/40 transition-colors">
              <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." className="flex-1 bg-transparent text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none h-12 py-1.5 px-2" />
              <button onClick={submitReply} disabled={!replyText.trim()} className="w-9 h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-md shadow-purple-500/20 disabled:opacity-40 cursor-pointer flex-shrink-0">
                <SendHorizonal size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RatingWidget({ noteId, uploaderId, onRateSuccess, onReviewsFetched }) {
  const { user } = useAuth();
  const [toast, setToast] = useState({ show: false, message: '', type: 'error', isClosing: false });

  const [allReviews, setAllReviews] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const commentInputRef = useRef(null);

  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [expandedReplies, setExpandedReplies] = useState(new Set());

  const toggleReplies = (reviewId) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  };

  const [hoveredStar, setHoveredStar] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [pendingRating, setPendingRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(true);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

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
      fetchComments();
      if (user) fetchMyRating();
      else setRatingLoading(false);
    }
  }, [user, noteId]);

  const fetchComments = async () => {
    try {
      const data = await apiRequest(`/reviews/note/${noteId}`);
      if (Array.isArray(data)) {
        setAllReviews(data);
        const totalRaters = data.filter(r => r.rating > 0).length;
        if (onReviewsFetched) onReviewsFetched(totalRaters);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const fetchMyRating = async () => {
    try {
      setRatingLoading(true);
      const data = await apiRequest(`/reviews/note/${noteId}/me`);
      if (data) {
        setMyRating(data.rating);
        setPendingRating(data.rating);
      }
    } catch (_) {
    } finally {
      setRatingLoading(false);
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────────
  const resolveParentId = (reviewId) => {
    if (typeof reviewId === 'string' && reviewId.startsWith('temp-')) return null;
    for (const r of allReviews) {
      if (r.id === reviewId) return reviewId;
      if (r.children?.some(c => c.id === reviewId)) return r.id;
    }
    return reviewId;
  };

  const findReviewInTree = (reviews, id) => {
    for (const r of reviews) {
      if (r.id === id) return r;
      if (r.children) {
        for (const c of r.children) {
          if (c.id === id) return c;
        }
      }
    }
    return null;
  };

  const removeFromTree = (reviews, id) => {
    const filtered = reviews.filter(r => r.id !== id);
    return filtered.map(r => {
      if (r.children) {
        return { ...r, children: r.children.filter(c => c.id !== id) };
      }
      return r;
    });
  };

  const addChildToTree = (reviews, parentId, child) => {
    return reviews.map(r => {
      if (r.id === parentId) {
        return { ...r, children: [...(r.children || []), child] };
      }
      return r;
    });
  };

  const replaceInTree = (reviews, id, replacement) => {
    return reviews.map(r => {
      if (r.id === id) return replacement;
      if (r.children) {
        return { ...r, children: r.children.map(c => c.id === id ? replacement : c) };
      }
      return r;
    });
  };

  const applyVoteOptimistically = (reviews, reviewId, type) => {
    return reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, ...computeOptimisticVote(r, type) };
      }
      if (r.children) {
        return { ...r, children: r.children.map(c => c.id === reviewId ? { ...c, ...computeOptimisticVote(c, type) } : c) };
      }
      return r;
    });
  };

  const computeOptimisticVote = (review, type) => {
    const wasLike = review.userVote === 'like';
    const wasDislike = review.userVote === 'dislike';
    let likes_count = review.likes_count || 0;
    let dislikes_count = review.dislikes_count || 0;
    let userVote;

    if (type === 'like') {
      if (wasLike) {
        likes_count = Math.max(0, likes_count - 1);
        userVote = null;
      } else {
        likes_count += 1;
        if (wasDislike) { dislikes_count = Math.max(0, dislikes_count - 1); }
        userVote = 'like';
      }
    } else {
      if (wasDislike) {
        dislikes_count = Math.max(0, dislikes_count - 1);
        userVote = null;
      } else {
        dislikes_count += 1;
        if (wasLike) { likes_count = Math.max(0, likes_count - 1); }
        userVote = 'dislike';
      }
    }

    return { likes_count, dislikes_count, userVote };
  };

  const buildOptimisticComment = (text, parentId = null) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      id: tempId,
      user_id: user.id,
      note_id: noteId,
      rating: 0,
      comment: text,
      parent_id: parentId,
      likes_count: 0,
      dislikes_count: 0,
      userVote: null,
      created_at: new Date().toISOString(),
      children: parentId ? undefined : [],
      user: {
        id: user.id,
        name: user.name,
        profile_pic: user.profile_pic,
      },
    };
  };

  // ─── Star Calculations ─────────────────────────────────────────────────────────
  const ratingsOnly = allReviews.filter(r => r.rating > 0);
  const totalRatingsCount = ratingsOnly.length;
  const avgRating = totalRatingsCount > 0
    ? (ratingsOnly.reduce((acc, curr) => acc + curr.rating, 0) / totalRatingsCount).toFixed(2)
    : '0.00';

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratingsOnly.forEach(r => {
    if (starCounts[r.rating] !== undefined) starCounts[r.rating]++;
  });

  const renderStars = (ratingVal) => {
    const stars = [];
    const rounded = Math.round(parseFloat(ratingVal) * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        stars.push(<Star key={i} size={14} className="text-amber-400 fill-amber-400" />);
      } else if (i - 0.5 === rounded) {
        stars.push(<div key={i} className="relative inline-block w-[14px] h-[14px]"><Star size={14} className="text-slate-200 dark:text-slate-800" /><div className="absolute top-0 left-0 w-1/2 overflow-hidden h-full"><Star size={14} className="text-amber-400 fill-amber-400 max-w-none" /></div></div>);
      } else {
        stars.push(<Star key={i} size={14} className="text-slate-200 dark:text-slate-800" />);
      }
    }
    return stars;
  };

  // ─── Rating Actions ────────────────────────────────────────────────────────────
  const handleStarClick = (star) => {
    if (!user) { showToast('Please log in to rate this note.', 'error'); return; }
    if (user.id === uploaderId) { showToast('You cannot rate your own note.', 'error'); return; }
    setPendingRating(star);
  };

  const submitRating = async () => {
    if (!user || pendingRating === 0) return;
    if (pendingRating === myRating) { showToast('No rating changes detected.', 'warning'); return; }
    setRatingSubmitting(true);
    try {
      await apiRequest(`/reviews/note/${noteId}/rate`, { method: 'POST', body: { rating: pendingRating } });
      setMyRating(pendingRating);
      showToast('Rating saved successfully!', 'success');
      fetchComments();
      if (onRateSuccess) onRateSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to save rating.', 'error');
    } finally {
      setRatingSubmitting(false);
    }
  };

  // ─── Optimistic: New Comment ───────────────────────────────────────────────────
  const submitComment = () => {
    if (!user) { showToast('Please log in to leave a comment.', 'error'); return; }
    if (user.id === uploaderId) { showToast('You cannot comment on your own note.', 'error'); return; }
    const text = newComment.trim();
    if (!text) { showToast('Comment cannot be empty.', 'warning'); return; }
    if (pendingFns.current['comment']) return;

    const optimistic = buildOptimisticComment(text);
    setAllReviews(prev => [...prev, optimistic]);
    setNewComment('');
    pendingFns.current['comment'] = true;

    apiRequest(`/reviews/note/${noteId}/comment`, { method: 'POST', body: { comment: text } })
      .then(real => {
        setAllReviews(prev => replaceInTree(prev, optimistic.id, { ...real, user: real.user || optimistic.user, children: [], userVote: null }));
      })
      .catch(err => {
        setAllReviews(prev => removeFromTree(prev, optimistic.id));
        showToast(err.message || 'Failed to post comment.', 'error');
      })
      .finally(() => {
        pendingFns.current['comment'] = false;
      });
  };

  // ─── Optimistic: Reply ─────────────────────────────────────────────────────────
  const handleReply = (review) => {
    setReplyToId(replyToId === review.id ? null : review.id);
    setReplyText('');
  };

  const submitReply = () => {
    if (!user || !replyToId) return;
    const text = replyText.trim();
    if (!text) { showToast('Reply cannot be empty.', 'warning'); return; }
    const key = `reply-${replyToId}`;
    if (pendingFns.current[key]) return;

    const topLevelParentId = resolveParentId(replyToId);
    if (!topLevelParentId) { showToast('Cannot resolve parent comment.', 'error'); return; }

    setExpandedReplies(prev => new Set(prev).add(topLevelParentId));

    const optimistic = buildOptimisticComment(text, topLevelParentId);
    setAllReviews(prev => addChildToTree(prev, topLevelParentId, optimistic));
    setReplyText('');
    setReplyToId(null);
    pendingFns.current[key] = true;

    apiRequest(`/reviews/note/${noteId}/comment`, { method: 'POST', body: { comment: text, parent_id: topLevelParentId } })
      .then(real => {
        setAllReviews(prev => replaceInTree(prev, optimistic.id, { ...real, user: real.user || optimistic.user, userVote: null }));
      })
      .catch(err => {
        setAllReviews(prev => removeFromTree(prev, optimistic.id));
        fetchComments();
        showToast(err.message || 'Failed to post reply.', 'error');
      })
      .finally(() => {
        pendingFns.current[key] = false;
      });
  };

  // ─── Optimistic: Edit ──────────────────────────────────────────────────────────
  const startEditComment = (review) => {
    setEditingCommentId(review.id);
    setEditingCommentText(review.comment);
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const saveEditComment = (reviewId) => {
    const text = editingCommentText.trim();
    if (!text) { showToast('Comment cannot be empty.', 'warning'); return; }
    if (pendingFns.current[`edit-${reviewId}`]) return;

    const snapshot = findReviewInTree(allReviews, reviewId);
    if (!snapshot) return;

    setAllReviews(prev => replaceInTree(prev, reviewId, { ...snapshot, comment: text }));
    setEditingCommentId(null);
    setEditingCommentText('');
    pendingFns.current[`edit-${reviewId}`] = true;

    apiRequest(`/reviews/${reviewId}`, { method: 'PUT', body: { comment: text } })
      .then(real => {
        setAllReviews(prev => replaceInTree(prev, reviewId, real));
      })
      .catch(err => {
        setAllReviews(prev => replaceInTree(prev, reviewId, snapshot));
        showToast(err.message || 'Failed to update comment.', 'error');
      })
      .finally(() => {
        pendingFns.current[`edit-${reviewId}`] = false;
      });
  };

  // ─── Optimistic: Delete ────────────────────────────────────────────────────────
  const deleteComment = (reviewId) => {
    if (pendingFns.current[`delete-${reviewId}`]) return;

    const snapshot = findReviewInTree(allReviews, reviewId);
    if (!snapshot) return;
    const snapshotAll = [...allReviews];

    setAllReviews(prev => removeFromTree(prev, reviewId));
    if (editingCommentId === reviewId) { setEditingCommentId(null); setEditingCommentText(''); }
    pendingFns.current[`delete-${reviewId}`] = true;

    apiRequest(`/reviews/${reviewId}`, { method: 'DELETE' })
      .then(() => {
        if (onRateSuccess) onRateSuccess();
      })
      .catch(err => {
        setAllReviews(snapshotAll);
        showToast(err.message || 'Failed to delete comment.', 'error');
      })
      .finally(() => {
        pendingFns.current[`delete-${reviewId}`] = false;
      });
  };

  // ─── Optimistic: Like / Dislike ────────────────────────────────────────────────
  const toggleLike = (reviewId) => {
    if (!user) { showToast('Please log in to react.', 'error'); return; }
    const key = `vote-${reviewId}`;
    if (pendingFns.current[key]) return;

    const snapshot = findReviewInTree(allReviews, reviewId);
    if (!snapshot) return;

    setAllReviews(prev => applyVoteOptimistically(prev, reviewId, 'like'));
    pendingFns.current[key] = true;

    apiRequest(`/reviews/${reviewId}/like`, { method: 'POST' })
      .then(result => {
        setAllReviews(prev => updateVoteInTree(prev, reviewId, result));
      })
      .catch(err => {
        setAllReviews(prev => replaceInTree(prev, reviewId, snapshot));
        showToast(err.message || 'Failed to update reaction.', 'error');
      })
      .finally(() => {
        pendingFns.current[key] = false;
      });
  };

  const toggleDislike = (reviewId) => {
    if (!user) { showToast('Please log in to react.', 'error'); return; }
    const key = `vote-${reviewId}`;
    if (pendingFns.current[key]) return;

    const snapshot = findReviewInTree(allReviews, reviewId);
    if (!snapshot) return;

    setAllReviews(prev => applyVoteOptimistically(prev, reviewId, 'dislike'));
    pendingFns.current[key] = true;

    apiRequest(`/reviews/${reviewId}/dislike`, { method: 'POST' })
      .then(result => {
        setAllReviews(prev => updateVoteInTree(prev, reviewId, result));
      })
      .catch(err => {
        setAllReviews(prev => replaceInTree(prev, reviewId, snapshot));
        showToast(err.message || 'Failed to update reaction.', 'error');
      })
      .finally(() => {
        pendingFns.current[key] = false;
      });
  };

  const updateVoteInTree = (reviews, reviewId, result) => {
    return reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, likes_count: result.likes_count, dislikes_count: result.dislikes_count, userVote: result.userVote };
      }
      if (r.children) {
        return { ...r, children: r.children.map(c => c.id === reviewId ? { ...c, likes_count: result.likes_count, dislikes_count: result.dislikes_count, userVote: result.userVote } : c) };
      }
      return r;
    });
  };

  const hasComments = allReviews.some(r => r.comment && r.comment.trim() !== '');

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">

        {/* ─── COLUMN 1: RATINGS ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6 lg:border-r lg:border-[var(--card-border)] lg:pr-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Reviews Summary</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{avgRating}</span>
              <span className="text-sm font-bold text-slate-400">/ 5</span>
            </div>
            <div className="flex items-center gap-1.5 my-2">{renderStars(avgRating)}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Based on {totalRatingsCount} student rating{totalRatingsCount === 1 ? '' : 's'}</p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-[var(--card-border)]">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starCounts[stars] || 0;
              const percentage = totalRatingsCount > 0 ? Math.round((count / totalRatingsCount) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-[9px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-wider shrink-0">{stars} Star</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-8 text-right text-[9px] font-black text-slate-700 dark:text-slate-400 shrink-0">{percentage}%</span>
                </div>
              );
            })}
          </div>

          {user && user.id !== uploaderId && (
            <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[1.5rem] p-5 border border-[var(--card-border)] text-center space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">
                {myRating > 0 ? 'Your Rating' : 'Rate this Document'}
              </p>
              {myRating > 0 && <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">You submitted {myRating} / 5 stars</p>}
              {ratingLoading ? (
                <div className="flex justify-center gap-2 animate-pulse py-1">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} onClick={() => handleStarClick(star)} className="transition-transform hover:scale-110 focus:outline-none cursor-pointer">
                        <Star size={24} className={`transition-colors duration-200 ${(hoveredStar || pendingRating) >= star ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-slate-200 dark:text-slate-800'}`} />
                      </button>
                    ))}
                  </div>
                  {pendingRating > 0 && pendingRating !== myRating && (
                    <button onClick={submitRating} disabled={ratingSubmitting} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[9px] font-black tracking-widest uppercase transition-colors shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                      {ratingSubmitting ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Submit {pendingRating}★ Rating</>}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {user && user.id === uploaderId && (
            <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[1.5rem] p-5 border border-[var(--card-border)] text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">Your Document</p>
              <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 mt-2 uppercase tracking-wide">You cannot rate your own study notes.</p>
            </div>
          )}
        </div>

        {/* ─── COLUMN 2 & 3: COMMENTS ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400">
              Comments ({allReviews.filter(r => r.comment && r.comment.trim() !== '' && !r.parent_id).length})
            </p>
          </div>

          {user && user.id !== uploaderId && (
            <div className="flex gap-3 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-[var(--card-border)] focus-within:border-purple-500/40 transition-colors">
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); }}} placeholder="Share your feedback, ask a question, or leave comments..." className="flex-1 bg-transparent text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none h-14 py-1.5 px-2" />
              <button onClick={submitComment} disabled={!newComment.trim()} className="w-10 h-14 bg-purple-500 hover:bg-purple-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-md shadow-purple-500/20 disabled:opacity-40 cursor-pointer flex-shrink-0" title="Post Comment">
                <SendHorizonal size={14} />
              </button>
            </div>
          )}

          {hasComments ? (
            <div className="space-y-4">
              {(showAllComments ? allReviews : allReviews.filter(r => r.comment && r.comment.trim() !== '' && !r.parent_id).slice(0, 4)).map((review) => {
                if (!review.comment || !review.comment.trim()) return null;
                const children = review.children?.filter(c => c.comment && c.comment.trim() !== '') || [];

                return (
                  <div key={review.id} className="space-y-3">
                    <CommentItem
                      review={review}
                      uploaderId={uploaderId}
                      currentUser={user}
                      onDelete={deleteComment}
                      onStartEdit={startEditComment}
                      onSaveEdit={saveEditComment}
                      onCancelEdit={cancelEdit}
                      editingCommentId={editingCommentId}
                      editingCommentText={editingCommentText}
                      setEditingCommentText={setEditingCommentText}
                      commentInputRef={commentInputRef}
                      onToggleLike={toggleLike}
                      onToggleDislike={toggleDislike}
                      onReply={handleReply}
                      replyToId={replyToId}
                      replyText={replyText}
                      setReplyText={setReplyText}
                      submitReply={submitReply}
                    />

                    {children.length > 0 && (
                      <>
                        <button onClick={() => toggleReplies(review.id)} className="ml-6 sm:ml-12 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-500 transition-colors cursor-pointer group">
                          <MessageSquare size={12} />
                          {children.length} {children.length === 1 ? 'Reply' : 'Replies'}
                          {expandedReplies.has(review.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        {expandedReplies.has(review.id) && (
                          <div className="ml-6 sm:ml-12 space-y-2">
                            {children.map(child => (
                              <CommentItem
                                key={child.id}
                                review={child}
                                uploaderId={uploaderId}
                                currentUser={user}
                                replyingTo={review.user?.name}
                                onDelete={deleteComment}
                                onStartEdit={startEditComment}
                                onSaveEdit={saveEditComment}
                                onCancelEdit={cancelEdit}
                                editingCommentId={editingCommentId}
                                editingCommentText={editingCommentText}
                                setEditingCommentText={setEditingCommentText}
                                commentInputRef={commentInputRef}
                                onToggleLike={toggleLike}
                                onToggleDislike={toggleDislike}
                                onReply={handleReply}
                                replyToId={replyToId}
                                replyText={replyText}
                                setReplyText={setReplyText}
                                submitReply={submitReply}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              {allReviews.filter(r => r.comment && r.comment.trim() !== '' && !r.parent_id).length > 4 && (
                <button onClick={() => setShowAllComments(prev => !prev)} className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.08] text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer group">
                  {showAllComments ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> View {allReviews.filter(r => r.comment && r.comment.trim() !== '' && !r.parent_id).length - 4} More Comments</>}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-14 bg-[var(--card-bg)] rounded-2xl border border-dashed border-[var(--card-border)]">
              <MessageSquarePlus size={36} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No comments left yet.</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

      </div>

      <Toast toast={toast} closeToast={closeToast} />
    </div>
  );
}
