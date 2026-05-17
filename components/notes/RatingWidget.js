'use client';

import { useState, useEffect } from 'react';
import { Star, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function RatingWidget({ noteId, onRateSuccess }) {
  const { user } = useAuth();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [currentRating, setCurrentRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  useEffect(() => {
    if (user && noteId) {
      fetchMyRating();
    } else {
      setLoading(false);
    }
  }, [user, noteId]);

  const fetchMyRating = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/reviews/note/${noteId}/me`);
      if (data) {
        setCurrentRating(data.rating);
        setComment(data.comment || '');
      }
    } catch (err) {
      // 404 means no rating yet, ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (ratingValue) => {
    if (!user) {
      showToast('Please log in to rate this note.', 'error');
      return;
    }
    setCurrentRating(ratingValue);
    setShowCommentInput(true);
  };

  const submitRating = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await apiRequest(`/reviews/note/${noteId}`, {
        method: 'POST',
        body: { rating: currentRating, comment: comment.trim() || undefined }
      });
      setShowCommentInput(false);
      showToast('Rating saved successfully!', 'success');
      if (onRateSuccess) onRateSuccess();
    } catch (err) {
      console.error('Failed to submit rating:', err);
      showToast(err.message || 'Failed to save rating. Please try again.', 'error');
    } finally {
      setSubmitting(false);
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

      {/* Beautiful Toast Notification */}
      {toast.show && (
        <div className="fixed top-24 right-6 z-[999999] animate-in slide-in-from-right fade-in duration-500">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl max-w-sm ${
            toast.type === 'error' 
              ? 'bg-red-500/10 border-red-500/20 text-red-500' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          }`}>
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <p className="text-xs font-black uppercase tracking-widest leading-relaxed">{toast.message}</p>
            <button 
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="ml-2 hover:scale-110 transition-transform opacity-70 hover:opacity-100 focus:outline-none cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
