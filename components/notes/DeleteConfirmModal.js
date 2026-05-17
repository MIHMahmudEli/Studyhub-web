'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function DeleteConfirmModal({ isOpen, onClose, note, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteSubmit = async () => {
    setDeleting(true);
    try {
      // 1. Delete the file from Supabase storage
      if (note.file_path) {
        try {
          const fileName = note.file_path.split('/notes/').pop();
          if (fileName) {
            await supabase.storage
              .from('notes')
              .remove([fileName]);
          }
        } catch (err) {
          console.warn('Failed to delete note file from storage:', err);
        }
      }

      // 2. Delete note record from backend database
      await apiRequest(`/notes/${note.id}`, {
        method: 'DELETE'
      });
      onDelete();
      onClose();
    } catch (err) {
      console.error('Failed to delete note:', err);
      alert(err.message || 'Failed to delete note.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] w-full max-w-[400px] rounded-[2rem] p-8 shadow-2xl space-y-6 relative text-center text-slate-800 dark:text-slate-100 animate-scale-in">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
          <Trash2 size={28} />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Delete Publication?</h3>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-loose">
            This action is permanent and cannot be undone. All points earned and downloaded data will be archived.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClose}
            className="w-1/2 py-3.5 border border-slate-200 dark:border-white/[0.08] rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 cursor-pointer font-bold"
          >
            Cancel
          </button>
          <button 
            onClick={handleDeleteSubmit}
            disabled={deleting}
            className="w-1/2 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-md shadow-red-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-bold"
          >
            {deleting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Delete Note'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
