'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, AlertCircle, CheckCircle2, X, Edit2, Trash2, MessageSquarePlus, SendHorizonal, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function RatingWidget({ noteId, uploaderId, onRateSuccess, onReviewsFetched }) {
  const { user } = useAuth();
  const [toast, setToast] = useState({ show: false, message: '', type: 'error', isClosing: false });

  // ─── Reviews & Comments State ────────────────────────────────────────────────
  const [allReviews, setAllReviews] = useState([]);  // Raw reviews data from server
  const [allComments, setAllComments] = useState([]); // Filtered reviews with comments
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const commentInputRef = useRef(null);

  // ─── Rating State ────────────────────────────────────────────────────────────
  const [hoveredStar, setHoveredStar] = useState(0);
  const [myRating, setMyRating] = useState(0);       // Current user's saved rating
  const [pendingRating, setPendingRating] = useState(0); // Star value currently selected
  const [ratingLoading, setRatingLoading] = useState(true);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // ─── Toast System ────────────────────────────────────────────────────────────
  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  };
  
  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

  // ─── Fetch Data ──────────────────────────────────────────────────────────────
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
        // Filter out items without comments
        const comments = data.filter(r => r.comment && r.comment.trim() !== '');
        setAllComments(comments);
        
        // Count total ratings (star score > 0)
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
      // 404 means no rating submitted yet, which is normal behavior
    } finally {
      setRatingLoading(false);
    }
  };

  // ─── Star Calculations ───────────────────────────────────────────────────────
  const ratingsOnly = allReviews.filter(r => r.rating > 0);
  const totalRatingsCount = ratingsOnly.length;
  const avgRating = totalRatingsCount > 0 
    ? (ratingsOnly.reduce((acc, curr) => acc + curr.rating, 0) / totalRatingsCount).toFixed(2)
    : '0.00';

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratingsOnly.forEach(r => {
    if (starCounts[r.rating] !== undefined) {
      starCounts[r.rating]++;
    }
  });

  const renderStars = (ratingVal) => {
    const stars = [];
    const rounded = Math.round(parseFloat(ratingVal) * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        stars.push(<Star key={i} size={14} className="text-amber-400 fill-amber-400" />);
      } else if (i - 0.5 === rounded) {
        stars.push(
          <div key={i} className="relative inline-block w-[14px] h-[14px]">
            <Star size={14} className="text-slate-200 dark:text-slate-800" />
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden h-full">
              <Star size={14} className="text-amber-400 fill-amber-400 max-w-none" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} size={14} className="text-slate-200 dark:text-slate-800" />);
      }
    }
    return stars;
  };

  // ─── Rating Action Handlers ──────────────────────────────────────────────────
  const handleStarClick = (star) => {
    if (!user) { showToast('Please log in to rate this note.', 'error'); return; }
    if (user.id === uploaderId) { showToast('You cannot rate your own note.', 'error'); return; }
    setPendingRating(star);
  };

  const submitRating = async () => {
    if (!user || pendingRating === 0) return;
    if (pendingRating === myRating) {
      showToast('No rating changes detected.', 'warning');
      return;
    }
    setRatingSubmitting(true);
    try {
      await apiRequest(`/reviews/note/${noteId}/rate`, {
        method: 'POST',
        body: { rating: pendingRating }
      });
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

  // ─── Comment Action Handlers ────────────────────────────────────────────────
  const submitComment = async () => {
    if (!user) { showToast('Please log in to leave a comment.', 'error'); return; }
    if (user.id === uploaderId) { showToast('You cannot comment on your own note.', 'error'); return; }
    const text = newComment.trim();
    if (!text) { showToast('Comment cannot be empty.', 'warning'); return; }
    
    setCommentSubmitting(true);
    try {
      await apiRequest(`/reviews/note/${noteId}/comment`, {
        method: 'POST',
        body: { comment: text }
      });
      setNewComment('');
      showToast('Comment posted successfully!', 'success');
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
    if (!text) { showToast('Comment cannot be empty.', 'warning'); return; }
    
    const original = allComments.find(r => r.id === editingCommentId);
    if (original && text === original.comment.trim()) {
      showToast('Comment has not been changed.', 'warning');
      return;
    }
    
    try {
      await apiRequest(`/reviews/${editingCommentId}`, {
        method: 'PUT',
        body: { comment: text }
      });
      setEditingCommentId(null);
      setEditingCommentText('');
      showToast('Comment updated successfully!', 'success');
      fetchComments();
    } catch (err) {
      showToast(err.message || 'Failed to update comment.', 'error');
    }
  };

  const deleteComment = async (reviewId) => {
    try {
      await apiRequest(`/reviews/${reviewId}`, { method: 'DELETE' });
      showToast('Comment deleted successfully.', 'success');
      
      if (editingCommentId === reviewId) {
        setEditingCommentId(null);
        setEditingCommentText('');
      }
      fetchComments();
      if (onRateSuccess) onRateSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to delete comment.', 'error');
    }
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* ─── COLUMN 1: RATINGS SUMMARY & ACTION ───────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6 lg:border-r lg:border-[var(--card-border)] lg:pr-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Reviews Summary</p>
            
            {/* Big Aggregate Rating */}
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                {avgRating}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 5</span>
            </div>
            
            {/* Star Icons */}
            <div className="flex items-center gap-1.5 my-2">
              {renderStars(avgRating)}
            </div>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Based on {totalRatingsCount} student rating{totalRatingsCount === 1 ? '' : 's'}
            </p>
          </div>

          {/* Star Rating Progress Breakdown */}
          <div className="space-y-2.5 pt-4 border-t border-[var(--card-border)]">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starCounts[stars] || 0;
              const percentage = totalRatingsCount > 0 ? Math.round((count / totalRatingsCount) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-[9px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-wider shrink-0">{stars} Star</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[9px] font-black text-slate-700 dark:text-slate-400 shrink-0">{percentage}%</span>
                </div>
              );
            })}
          </div>

          {/* User's Interactive Star Rater */}
          {user && user.id !== uploaderId && (
            <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[1.5rem] p-5 border border-[var(--card-border)] text-center space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">
                {myRating > 0 ? 'Your Rating' : 'Rate this Document'}
              </p>
              
              {myRating > 0 && (
                <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                  You submitted {myRating} / 5 stars
                </p>
              )}

              {ratingLoading ? (
                <div className="flex justify-center gap-2 animate-pulse py-1">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => handleStarClick(star)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          size={24}
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
                    <button
                      onClick={submitRating}
                      disabled={ratingSubmitting}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[9px] font-black tracking-widest uppercase transition-colors shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {ratingSubmitting ? (
                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Submit {pendingRating}★ Rating</>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {user && user.id === uploaderId && (
            <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[1.5rem] p-5 border border-[var(--card-border)] text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400">Your Document</p>
              <p className="text-[9px] font-bold text-slate-700 dark:text-slate-400 mt-2 uppercase tracking-wide">
                You cannot rate your own study notes.
              </p>
            </div>
          )}
        </div>

        {/* ─── COLUMN 2 & 3: COMMENTS SECTION ───────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400">Student Comments ({allComments.length})</p>

          {/* New Comment Textarea Form */}
          {user && user.id !== uploaderId && (
            <div className="flex gap-3 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-[var(--card-border)] focus-within:border-purple-500/40 transition-colors">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); }}}
                placeholder="Share your feedback, ask a question, or leave comments..."
                className="flex-1 bg-transparent text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none h-14 py-1.5 px-2"
              />
              <button
                onClick={submitComment}
                disabled={commentSubmitting || !newComment.trim()}
                className="w-10 h-14 bg-purple-500 hover:bg-purple-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-md shadow-purple-500/20 disabled:opacity-40 cursor-pointer flex-shrink-0"
                title="Post Comment"
              >
                {commentSubmitting
                  ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  : <SendHorizonal size={14} />
                }
              </button>
            </div>
          )}

          {/* Comment Thread List */}
          {allComments.length > 0 ? (
            <div className="space-y-4">
              {(showAllComments ? allComments : allComments.slice(0, 4)).map((review) => {
                const authorInitial = review.user?.name ? review.user.name.charAt(0) : '#';
                return (
                  <div key={review.id} className="bg-slate-50 dark:bg-white/[0.02] rounded-2xl p-5 border border-[var(--card-border)] group transition-all hover:bg-slate-100/50 dark:hover:bg-white/[0.04]">
                    <div className="flex items-start gap-4">
                      
                      {/* Avatar Bubble */}
                      {review.user?.profile_pic ? (
                        <img 
                          src={review.user.profile_pic} 
                          alt={review.user?.name} 
                          className="w-9 h-9 rounded-xl object-cover border border-[var(--card-border)] shadow-md shrink-0 select-none"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xs font-black uppercase shrink-0 select-none shadow-inner">
                          {authorInitial}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                            <span 
                              className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none"
                              title={review.user?.name || `Student #${review.user_id}`}
                            >
                              {review.user?.name || `Student #${review.user_id}`}
                            </span>
                            {review.rating > 0 && (
                              <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[8px] font-black shrink-0">
                                {review.rating} ★
                              </div>
                            )}
                          </div>
                          
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                            {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        {editingCommentId === review.id ? (
                          <div className="space-y-2 mt-2">
                            <textarea
                              ref={commentInputRef}
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none transition-colors text-[var(--foreground)] resize-none h-16 focus:border-purple-500/40"
                            />
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setEditingCommentId(null)} 
                                className="flex-1 py-2 border border-slate-200 dark:border-white/[0.08] rounded-xl text-[9px] font-black tracking-widest uppercase text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={saveEditComment} 
                                className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-[9px] font-black tracking-widest uppercase transition-colors cursor-pointer shadow-md shadow-purple-500/10"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-400 leading-relaxed break-words pl-0.5">
                            "{review.comment}"
                          </p>
                        )}
                      </div>

                      {/* Comment Mod Actions */}
                      {user && user.id === review.user_id && editingCommentId !== review.id && (
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0">
                          <button
                            onClick={() => startEditComment(review)}
                            className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={10} />
                          </button>
                          <button
                            onClick={() => deleteComment(review.id)}
                            className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Show All Comments Expand Toggle */}
              {allComments.length > 4 && (
                <button
                  onClick={() => setShowAllComments(prev => !prev)}
                  className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.08] text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer group"
                >
                  {showAllComments ? (
                    <>
                      <svg className="w-3 h-3 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6"/></svg>
                      Show Less Comments
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                      View {allComments.length - 4} More Comment{allComments.length - 4 === 1 ? '' : 's'}
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-10 bg-[var(--card-bg)] rounded-2xl border border-dashed border-[var(--card-border)]">
              <MessageSquarePlus size={32} className="text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No comments left yet.</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

      </div>

      {/* ─── TOAST NOTIFICATION CONTAINER ─────────────────────────────────────── */}
      {toast.show && (
        <div className={`fixed top-24 right-6 z-[999999] transition-all duration-500 ease-in-out ${
          toast.isClosing ? 'translate-x-20 opacity-0 pointer-events-none' : 'animate-in slide-in-from-right fade-in'
        }`}>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-xl max-w-xs ${
            toast.type === 'error'
              ? 'bg-red-500/10 border-red-500/20 text-red-500'
              : toast.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle size={16} className="shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle size={16} className="shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="shrink-0" />
            )}
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
