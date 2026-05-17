'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, AlertCircle, CheckCircle2, X, Edit2, Trash2, MessageSquarePlus, SendHorizonal } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function RatingWidget({ noteId, uploaderId, onRateSuccess, onReviewsFetched }) {
  const { user } = useAuth();
  const [toast, setToast] = useState({ show: false, message: '', type: 'error', isClosing: false });

  // ─── Rating State ────────────────────────────────────────────────────────────
  const [hoveredStar, setHoveredStar] = useState(0);
  const [myRating, setMyRating] = useState(0);       // current saved rating
  const [pendingRating, setPendingRating] = useState(0); // star the user is about to submit
  const [ratingLoading, setRatingLoading] = useState(true);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // ─── Comments State ──────────────────────────────────────────────────────────
  const [allComments, setAllComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const commentInputRef = useRef(null);

  // ─── Toast ───────────────────────────────────────────────────────────────────
  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  };
  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

  // ─── Fetch on mount ──────────────────────────────────────────────────────────
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
        // Only show rows with actual comment text
        const comments = data.filter(r => r.comment && r.comment.trim() !== '');
        setAllComments(comments);
        // Total unique raters (rows where rating > 0)
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
      // 404 = no rating yet, fine
    } finally {
      setRatingLoading(false);
    }
  };

  // ─── Rating Handlers ─────────────────────────────────────────────────────────
  const handleStarClick = (star) => {
    if (!user) { showToast('Please log in to rate this note.', 'error'); return; }
    if (user.id === uploaderId) { showToast('You cannot rate your own note.', 'error'); return; }
    setPendingRating(star);
  };

  const submitRating = async () => {
    if (!user || pendingRating === 0) return;
    if (pendingRating === myRating) {
      showToast('This is already your saved rating.', 'error');
      return;
    }
    setRatingSubmitting(true);
    try {
      await apiRequest(`/reviews/note/${noteId}/rate`, {
        method: 'POST',
        body: { rating: pendingRating }
      });
      setMyRating(pendingRating);
      showToast('Rating saved!', 'success');
      fetchComments();
      if (onRateSuccess) onRateSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to save rating.', 'error');
    } finally {
      setRatingSubmitting(false);
    }
  };

  // ─── Comment Handlers ────────────────────────────────────────────────────────
  const submitComment = async () => {
    if (!user) { showToast('Please log in to leave a comment.', 'error'); return; }
    if (user.id === uploaderId) { showToast('You cannot comment on your own note.', 'error'); return; }
    const text = newComment.trim();
    if (!text) { showToast('Comment cannot be empty.', 'error'); return; }
    setCommentSubmitting(true);
    try {
      await apiRequest(`/reviews/note/${noteId}/comment`, {
        method: 'POST',
        body: { comment: text }
      });
      setNewComment('');
      showToast('Comment posted!', 'success');
      fetchComments();
    } catch (err) {
      showToast(err.message || 'Failed to post comment.', 'error');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const startEditComment = (review) => {
    setEditingCommentId(review.id);
    setEditingCommentText(review.comment);
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const saveEditComment = async () => {
    const text = editingCommentText.trim();
    if (!text) { showToast('Comment cannot be empty.', 'error'); return; }
    try {
      await apiRequest(`/reviews/${editingCommentId}`, {
        method: 'PUT',
        body: { comment: text }
      });
      setEditingCommentId(null);
      setEditingCommentText('');
      showToast('Comment updated!', 'success');
      fetchComments();
    } catch (err) {
      showToast(err.message || 'Failed to update comment.', 'error');
    }
  };

  const deleteComment = async (reviewId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await apiRequest(`/reviews/${reviewId}`, { method: 'DELETE' });
      showToast('Comment deleted.', 'success');
      fetchComments();
      if (onRateSuccess) onRateSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to delete comment.', 'error');
    }
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-6 shadow-sm text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Community Ratings &amp; Comments</p>
        <p className="text-xs font-bold text-slate-500">Log in to rate or comment on this note.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── RATING SECTION ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-6 shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 text-center">Your Rating</p>
        {myRating > 0 && (
          <p className="text-[9px] font-semibold text-center text-amber-500 mb-3">
            You rated this {myRating} / 5 — click a star to update
          </p>
        )}

        {ratingLoading ? (
          <div className="flex justify-center gap-2 animate-pulse">
            {[1,2,3,4,5].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />)}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              {[1,2,3,4,5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => handleStarClick(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={28}
                    className={`transition-colors duration-200 ${
                      (hoveredStar || pendingRating) >= star
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                        : 'text-slate-200 dark:text-slate-800'
                    }`}
                  />
                </button>
              ))}
            </div>

            {pendingRating > 0 && pendingRating !== myRating && (
              <div className="flex justify-center">
                <button
                  onClick={submitRating}
                  disabled={ratingSubmitting}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[9px] font-black tracking-widest uppercase transition-colors shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {ratingSubmitting ? (
                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Submit {pendingRating}★ Rating</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── COMMENT SECTION ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-6 shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 text-center">Community Comments</p>

        {/* New comment input */}
        <div className="flex gap-2 mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); }}}
            placeholder="Share your thoughts on this note…"
            className="flex-1 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-amber-500/50 transition-colors text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none h-16"
          />
          <button
            onClick={submitComment}
            disabled={commentSubmitting || !newComment.trim()}
            className="w-10 h-16 bg-amber-500 hover:bg-amber-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-md shadow-amber-500/20 disabled:opacity-40 cursor-pointer flex-shrink-0"
            title="Post comment"
          >
            {commentSubmitting
              ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              : <SendHorizonal size={14} />
            }
          </button>
        </div>

        {/* Comments list */}
        {allComments.length > 0 ? (
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {allComments.map((review) => (
              <div key={review.id} className="bg-slate-50 dark:bg-black/20 rounded-xl p-4 border border-slate-100 dark:border-white/[0.03] group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                        {review.user?.name || `Student #${review.user_id}`}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                        {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {editingCommentId === review.id ? (
                      <div className="space-y-2">
                        <textarea
                          ref={commentInputRef}
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          className="w-full bg-white dark:bg-black/50 border border-amber-400/50 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none transition-colors text-slate-800 dark:text-slate-200 resize-none h-16"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setEditingCommentId(null)} className="flex-1 py-1.5 border border-slate-200 dark:border-white/[0.08] rounded-lg text-[9px] font-black tracking-widest uppercase text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
                            Cancel
                          </button>
                          <button onClick={saveEditComment} className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[9px] font-black tracking-widest uppercase transition-colors cursor-pointer">
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                        "{review.comment}"
                      </p>
                    )}
                  </div>

                  {user && user.id === review.user_id && editingCommentId !== review.id && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => startEditComment(review)}
                        className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={10} />
                      </button>
                      <button
                        onClick={() => deleteComment(review.id)}
                        className="w-6 h-6 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <MessageSquarePlus size={28} className="text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No comments yet. Be the first!</p>
          </div>
        )}
      </div>

      {/* ── TOAST ──────────────────────────────────────────────────── */}
      {toast.show && (
        <div className={`fixed top-24 right-6 z-[999999] transition-all duration-500 ease-in-out ${
          toast.isClosing ? 'translate-x-20 opacity-0 pointer-events-none' : 'animate-in slide-in-from-right fade-in'
        }`}>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-xl max-w-xs ${
            toast.type === 'error'
              ? 'bg-red-500/10 border-red-500/20 text-red-500'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          }`}>
            {toast.type === 'error' ? <AlertCircle size={16} className="shrink-0" /> : <CheckCircle2 size={16} className="shrink-0" />}
            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed flex-1">{toast.message}</p>

            <div className="relative w-6 h-6 shrink-0 flex items-center justify-center ml-1">
              <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-20" />
                <circle
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray="62.8"
                  strokeDashoffset="62.8"
                  style={{ animation: 'toastProgress 5s linear forwards', strokeLinecap: 'round' }}
                />
              </svg>
              <button
                onClick={closeToast}
                className="absolute inset-0 flex items-center justify-center hover:scale-110 transition-transform z-10 focus:outline-none cursor-pointer"
              >
                <X size={10} />
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes toastProgress {
              from { stroke-dashoffset: 62.8; }
              to { stroke-dashoffset: 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
