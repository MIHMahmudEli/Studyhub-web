'use client';

import { useState } from 'react';
import { apiRequest } from '@/lib/api';
import { deleteFromR2 } from '@/lib/r2';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function DeleteConfirmModal({ isOpen, onClose, note, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteSubmit = async () => {
    setDeleting(true);
    try {
      if (note.file_path) {
        try {
          await deleteFromR2(note.file_path);
        } catch (err) {
          console.warn('Failed to delete note file from storage:', err);
        }
      }

      await apiRequest(`/notes/${note.id}`, {
        method: 'DELETE'
      });
      onDelete();
      onClose();
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDeleteSubmit}
      loading={deleting}
      title="Delete Publication?"
      description="This action is permanent and cannot be undone. All points earned and downloaded data will be archived."
      confirmText="Delete Note"
    />
  );
}
