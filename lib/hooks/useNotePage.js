import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

export function useNotePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, tokenReady } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [totalRatings, setTotalRatings] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });

  const closeToast = useCallback(() => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  }, [closeToast]);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/notes/${id}`);
        const mappedNote = {
          ...data,
          subject: data.courseTitle,
          course_code: data.code,
          created_at: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A',
        };
        setNote(mappedNote);
      } catch (error) {
        if (error?.status !== 401 && error?.response?.status !== 401) {
          console.error('Failed to fetch note:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNote();
  }, [id]);

  useEffect(() => {
    if (!note?.id) return;
    const incrementView = async () => {
      try {
        const data = await apiRequest(`/notes/${id}/view`, { method: 'POST' });
        if (data.views !== undefined) {
          setNote(prev => ({ ...prev, views: data.views }));
        }
      } catch {
        // silently fail - view count is non-critical
      }
    };
    incrementView();
  }, [id, note?.id]);

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        const bookmarks = await apiRequest('/bookmarks');
        const bookmarked = bookmarks.some(b => b.note_id === parseInt(id));
        setIsBookmarked(bookmarked);
      } catch (error) {
        if (error?.status !== 401 && error?.response?.status !== 401) {
          console.error('Failed to check bookmark status:', error);
        }
      }
    };

    if (user && tokenReady) checkBookmarkStatus();
  }, [id, user, tokenReady]);

  const handleBookmarkToggle = useCallback(async () => {
    const prev = isBookmarked;
    setIsBookmarked(!prev);
    try {
      const res = await apiRequest('/bookmarks/toggle', {
        method: 'POST',
        body: { note_id: parseInt(id) },
      });
      setIsBookmarked(res.bookmarked);
    } catch (err) {
      setIsBookmarked(prev);
      if (err?.status !== 401 && err?.response?.status !== 401) {
        console.error('Failed to toggle bookmark:', err);
      }
    }
  }, [id, isBookmarked]);

  const handleDownload = useCallback(async () => {
    if (note?.file_path) {
      setDownloading(true);
      try {
        await apiRequest(`/notes/${id}/download`, { method: 'POST' });
        setNote(prev => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));

        const response = await fetch(note.file_path);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${note.title}.${note.file_type}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Download failed:', err);
        window.open(note.file_path, '_blank');
      } finally {
        setDownloading(false);
      }
    }
  }, [id, note]);

  const handleEditSave = useCallback((updatedData) => {
    setNote(prev => ({
      ...prev,
      ...updatedData,
      subject: updatedData.courseTitle,
      course_code: updatedData.code,
    }));
    setContentLoaded(false);
  }, []);

  const handleDeleteComplete = useCallback(() => {
    router.push('/notes');
  }, [router]);

  const handleRateSuccess = useCallback(async () => {
    try {
      const data = await apiRequest(`/notes/${id}`);
      setNote(prev => ({
        ...prev,
        avg_rating: data.avg_rating,
      }));
      if (data.total_ratings !== undefined) {
        setTotalRatings(data.total_ratings);
      }
    } catch (err) {
      console.error('Failed to refresh rating:', err);
    }
  }, [id]);

  const isUploaderOrAdmin = user && (user.id === note?.uploader_id || user.role === 'admin');

  return {
    note, loading, contentLoaded, setContentLoaded,
    isReadingMode, setIsReadingMode,
    isBookmarked, isEditModalOpen, setIsEditModalOpen,
    isDeleteConfirmOpen, setIsDeleteConfirmOpen,
    totalRatings, downloading, toast, isUploaderOrAdmin,
    handleBookmarkToggle, handleDownload,
    handleEditSave, handleDeleteComplete, handleRateSuccess,
    setTotalRatings,
    showToast, closeToast,
  };
}
