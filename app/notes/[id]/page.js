'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { FileText } from 'lucide-react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { NoteDetailSkeleton } from '@/components/ui/Skeleton';
import NoteHeader from '@/components/notes/NoteHeader';
import NotePreview from '@/components/notes/NotePreview';
import NoteMetadata from '@/components/notes/NoteMetadata';
import ReactionBar from '@/components/notes/ReactionBar';
import Toast from '@/components/ui/Toast';
import ResourcePreviewModal from '@/components/resources/ResourcePreviewModal';
import { useNotePage } from '@/lib/hooks/useNotePage';

const RatingWidget = dynamic(() => import('@/components/notes/RatingWidget'), {
  loading: () => <div className="animate-pulse h-32 rounded-2xl bg-[var(--card-bg)]" />,
});
const EditNoteModal = dynamic(() => import('@/components/notes/EditNoteModal'));
const DeleteConfirmModal = dynamic(() => import('@/components/notes/DeleteConfirmModal'));

export default function NotePreviewPage() {
  const {
    note, loading,
    isReadingMode,
    isBookmarked, isEditModalOpen, setIsEditModalOpen,
    isDeleteConfirmOpen, setIsDeleteConfirmOpen,
    totalRatings, setTotalRatings, downloading, toast, isUploaderOrAdmin,
    handleBookmarkToggle, handleDownload,
    handleEditSave, handleDeleteComplete, handleRateSuccess,
    showToast, closeToast,
  } = useNotePage();

  const [previewResource, setPreviewResource] = useState(null);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
        <DashboardNavbar />
        <div className="pt-24 md:pt-32 px-4 md:px-8 max-w-[1400px] mx-auto">
          <NoteDetailSkeleton />
        </div>
      </main>
    );
  }

  if (!note) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
        <DashboardNavbar />
        <div className="pt-32 px-6 flex flex-col items-center justify-center text-center">
          <FileText size={64} className="text-slate-400 mb-6" />
          <h1 className="text-3xl font-black uppercase tracking-widest mb-4">Note Not Found</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-8">
            The requested document could not be located in the archives.
          </p>
          <button
            onClick={() => window.location.href = '/notes'}
            className="px-8 py-3 bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-purple-600 transition-all cursor-pointer"
          >
            Return to Feed
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
      <DashboardNavbar showBackButton={!!previewResource} onBack={() => setPreviewResource(null)} />

      <div className="pt-24 md:pt-32 px-4 md:px-8 max-w-[1400px] mx-auto">
        <NoteHeader
          downloading={downloading}
          isBookmarked={isBookmarked}
          onBack={() => window.history.back()}
          onShare={() => {
            navigator.clipboard.writeText(window.location.href);
            showToast('Link copied to clipboard!', 'success');
          }}
          onToggleReadingMode={() => setPreviewResource(note)}
          onToggleBookmark={handleBookmarkToggle}
          onDownload={handleDownload}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`${isReadingMode ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6 transition-all duration-500`}>
            <NotePreview
              note={note}
              isReadingMode={isReadingMode}
              downloading={downloading}
              onDownload={handleDownload}
            />

            {!isReadingMode && (
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <ReactionBar noteId={note.id} />
              </div>
            )}
          </div>

          {!isReadingMode && (
            <NoteMetadata
              note={note}
              totalRatings={totalRatings}
              isUploaderOrAdmin={isUploaderOrAdmin}
              onEdit={() => setIsEditModalOpen(true)}
              onDelete={() => setIsDeleteConfirmOpen(true)}
            />
          )}
        </div>

        {!isReadingMode && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom duration-700">
            <RatingWidget
              noteId={note.id}
              uploaderId={note.uploader_id}
              onRateSuccess={handleRateSuccess}
              onReviewsFetched={setTotalRatings}
            />
          </div>
        )}
      </div>

      <EditNoteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        note={note}
        onSave={handleEditSave}
      />

      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        note={note}
        onDelete={handleDeleteComplete}
      />

      <ResourcePreviewModal
        resource={previewResource}
        isOpen={!!previewResource}
        onClose={() => setPreviewResource(null)}
      />

      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
