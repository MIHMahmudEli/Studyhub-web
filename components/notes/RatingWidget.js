'use client';

import { useState, useEffect } from 'react';
import { Star, AlertCircle, CheckCircle2, X, Edit2, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function RatingWidget({ noteId, uploaderId, onRateSuccess, onReviewsFetched }) {
  const { user } = useAuth();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [currentRating, setCurrentRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [originalRating, setOriginalRating] = useState(0);
  const [originalComment, setOriginalComment] = useState('');
  const [allReviews, setAllReviews] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error', isClosing: false });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => {
      closeToast();
    }, 5000);
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false, isClosing: false }));
    }, 500); // 500ms allows the slide-out animation to finish before unmounting
  };

  useEffect(() => {
    if (noteId) {
      fetchAllReviews();
    }
    setLoading(false);
  }, [noteId]);

  const fetchAllReviews = async () => {
    try {
      const data = await apiRequest(`/reviews/note/${noteId}`);
      if (Array.isArray(data)) {
        setAllReviews(data);
        if (onReviewsFetched) onReviewsFetched(data.length);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleRate = async (ratingValue) => {
    if (!user) {
      showToast('Please log in to rate this note.', 'error');
      return;
    }
    if (user.id === uploaderId) {
      showToast('You cannot rate your own note.', 'error');
      return;
    }
    if (editingReviewId) {
      setCurrentRating(ratingValue);
      setShowCommentInput(true);
    } else {
      // New review
      setCurrentRating(ratingValue);
      setShowCommentInput(true);
      setOriginalRating(0);
      setOriginalComment('');
      setEditingReviewId(null);
    }
  };

  const submitRating = async () => {
    if (!user) return;
    
    const newComment = comment.trim();
    if (currentRating === originalRating && newComment === originalComment.trim()) {
      showToast('No changes detected. Please modify your rating or comment to update.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingReviewId) {
        await apiRequest(`/reviews/${editingReviewId}`, {
          method: 'PUT',
          body: { rating: currentRating, comment: newComment || undefined }
        });
      } else {
        await apiRequest(`/reviews/note/${noteId}`, {
          method: 'POST',
          body: { rating: currentRating, comment: newComment || undefined }
        });
      }
      
      setShowCommentInput(false);
      setCurrentRating(0);
      setComment('');
      setOriginalRating(0);
      setOriginalComment('');
      setEditingReviewId(null);
      
      showToast('Rating saved successfully!', 'success');
      fetchAllReviews(); // Refresh the comments list
      if (onRateSuccess) onRateSuccess();
    } catch (err) {
      console.error('Failed to submit rating:', err);
      showToast(err.message || 'Failed to save rating. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete your review?')) return;
    try {
      await apiRequest(`/reviews/${reviewId}`, { method: 'DELETE' });
      showToast('Review deleted successfully!', 'success');
      if (editingReviewId === reviewId) {
        setCurrentRating(0);
        setComment('');
        setOriginalRating(0);
        setOriginalComment('');
        setEditingReviewId(null);
        setShowCommentInput(false);
      }
      fetchAllReviews();
      if (onRateSuccess) onRateSuccess();
    } catch (err) {
      console.error('Failed to delete review:', err);
      showToast('Failed to delete review. Please try again.', 'error');
    }
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-6 shadow-sm text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Rate this document</p>
        <p className="text-xs font-bold text-slate-500">Log in to leave a rating and help other students.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-6 shadow-sm">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 text-center">Rate this document</p>
      
      {loading ? (
        <div className="flex justify-center gap-2 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleRate(star)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star 
                  size={28} 
                  className={`transition-colors duration-200 ${
                    (hoveredStar || currentRating) >= star 
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
                      : 'text-slate-200 dark:text-slate-800'
                  }`} 
                />
              </button>
            ))}
          </div>
          
          {currentRating > 0 && !showCommentInput && (
             <div className="text-center">
               <button 
                 onClick={() => setShowCommentInput(true)}
                 className="text-[9px] font-black uppercase tracking-widest text-purple-500 hover:text-purple-600 transition-colors"
               >
                 {comment ? 'Edit Review' : 'Add a written review'}
               </button>
             </div>
          )}

          {showCommentInput && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional: How did this note help you?"
                className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-amber-500/50 transition-colors text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none h-20"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowCommentInput(false)}
                  className="flex-1 py-2 border border-slate-200 dark:border-white/[0.08] rounded-xl text-[9px] font-black tracking-widest uppercase text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitRating}
                  disabled={submitting}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[9px] font-black tracking-widest uppercase transition-colors shadow-md shadow-amber-500/20 disabled:opacity-50 flex justify-center items-center cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Submit Rating'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews Display Section */}
      {allReviews.filter(r => r.comment && r.comment.trim() !== '').length > 0 && (
        <div className="mt-8 border-t border-slate-200 dark:border-white/[0.05] pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 text-center">
            Student Feedback
          </p>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {allReviews.filter(r => r.comment && r.comment.trim() !== '').map((review) => (
              <div key={review.id} className="bg-slate-50 dark:bg-black/20 rounded-xl p-4 border border-slate-100 dark:border-white/[0.03] group relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
                    {review.user?.name || `Student #${review.user_id}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-[9px] font-black text-amber-500">{review.rating}</span>
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 leading-relaxed break-words">
                  "{review.comment}"
                </p>
                
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  
                  {user && user.id === review.user_id && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingReviewId(review.id);
                          setCurrentRating(review.rating);
                          setComment(review.comment || '');
                          setOriginalRating(review.rating);
                          setOriginalComment(review.comment || '');
                          setShowCommentInput(true);
                          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }}
                        className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
                        title="Edit Review"
                      >
                        <Edit2 size={10} />
                      </button>
                      <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="w-6 h-6 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Beautiful Toast Notification with Circular Timer & Slide-Out */}
      {toast.show && (
        <div className={`fixed top-24 right-6 z-[999999] transition-all duration-500 ease-in-out ${
          toast.isClosing 
            ? 'translate-x-20 opacity-0 pointer-events-none' 
            : 'animate-in slide-in-from-right fade-in'
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
