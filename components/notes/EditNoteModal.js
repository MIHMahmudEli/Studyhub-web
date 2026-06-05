'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { FileText } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { uploadToR2, deleteFromR2 } from '@/lib/r2';
import coursesData from '@/lib/data/courses.json';

export default function EditNoteModal({ isOpen, onClose, note, onSave }) {
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    courseTitle: '',
    code: '',
    dept: '',
    description: ''
  });
  const [newFile, setNewFile] = useState(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (note && isOpen) {
      setEditForm({
        title: note.title || '',
        courseTitle: note.courseTitle || '',
        code: note.code || '',
        dept: note.dept || '',
        description: note.description || ''
      });
      setCourseSearch(note.courseTitle || note.subject || '');
      setNewFile(null);
    }
  }, [note, isOpen]);

  const filteredCourses = useMemo(() => {
    if (courseSearch.length < 2) return [];
    return coursesData.filter(course => 
      course.courseTitle.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.code?.toLowerCase().includes(courseSearch.toLowerCase())
    ).slice(0, 5);
  }, [courseSearch]);

  const selectCourse = (course) => {
    setEditForm(prev => ({
      ...prev,
      courseTitle: course.courseTitle,
      code: course.code,
      dept: course.dept
    }));
    setCourseSearch(course.courseTitle);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Strict course selection validation
    const isValidCourse = coursesData.some(c => c.courseTitle === editForm.courseTitle);
    if (!isValidCourse) {
      alert('Please select a valid course from the suggestions list.');
      return;
    }

    // 2. Prevent submitting if no changes were made to save database load
    const hasChanges = 
      editForm.title !== (note.title || '') ||
      editForm.courseTitle !== (note.courseTitle || '') ||
      editForm.code !== (note.code || '') ||
      editForm.dept !== (note.dept || '') ||
      editForm.description !== (note.description || '') ||
      newFile !== null;

    if (!hasChanges) {
      alert('No changes detected.');
      return;
    }

    setUpdating(true);
    try {
      let filePayload = {};
      if (newFile) {
        const fileExt = newFile.name.split('.').pop();
        const key = `notes/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const publicUrl = await uploadToR2(newFile, key);

        filePayload = {
          file_path: publicUrl,
          file_type: fileExt || 'pdf'
        };

        if (note.file_path) {
          try {
            await deleteFromR2(note.file_path);
          } catch (err) {
            console.warn('Failed to delete old file from storage:', err);
          }
        }
      }

      const updatedData = await apiRequest(`/notes/${note.id}`, {
        method: 'PATCH',
        body: {
          ...editForm,
          ...filePayload
        }
      });
      
      onSave(updatedData);
      onClose();
    } catch (err) {
      console.error('Failed to update note details:', err);
      alert(err.message || 'Failed to update note details.');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] w-full max-w-[600px] max-h-[85vh] overflow-y-auto rounded-[2rem] p-8 shadow-2xl space-y-6 relative text-slate-800 dark:text-slate-100 animate-scale-in">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Edit Note Details</h3>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Modify metadata, description, or replace your publication file.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</label>
            <input 
              type="text" 
              value={editForm.title} 
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              required
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-500/50 transition-colors text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Document Title"
            />
          </div>

          <div className="space-y-2 relative" ref={suggestionsRef}>
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Subject / Course Name</label>
            <input 
              type="text" 
              value={courseSearch} 
              onChange={(e) => {
                setCourseSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              required
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-500/50 transition-colors text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Type to search and select course..."
            />
            
            {courseSearch && !coursesData.some(c => c.courseTitle === courseSearch) && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1.5 animate-pulse flex items-center gap-1.5">
                <span>⚠️</span> Please select a valid course from the suggested list
              </p>
            )}
            
            {showSuggestions && filteredCourses.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-[999999] bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden max-h-[220px] overflow-y-auto">
                {filteredCourses.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectCourse(c)}
                    className="w-full text-left px-5 py-3.5 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-white/[0.03] last:border-b-0 cursor-pointer flex flex-col gap-0.5"
                  >
                    <span className="text-slate-900 dark:text-white font-bold">{c.courseTitle}</span>
                    <span className="text-[9px] font-black tracking-wider uppercase text-purple-500">{c.code} • {c.dept}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {editForm.courseTitle && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-1 px-5 py-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/[0.08] rounded-2xl">
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Selected Code</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{editForm.code || 'N/A'}</p>
              </div>
              <div className="space-y-1 px-5 py-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/[0.08] rounded-2xl">
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Selected Department</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{editForm.dept || 'N/A'}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
            <textarea 
              value={editForm.description} 
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs font-semibold focus:outline-none focus:border-purple-500/50 transition-colors text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
              placeholder="Summarize these study notes..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Replace Note File (Optional)</label>
            <div className="relative group">
              <input 
                type="file" 
                accept=".pdf,image/*"
                onChange={(e) => setNewFile(e.target.files[0])}
                className="hidden" 
                id="replace-file-input-component"
              />
              <label 
                htmlFor="replace-file-input-component"
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl cursor-pointer hover:border-purple-500/50 transition-all bg-slate-50 dark:bg-black/30"
              >
                <FileText size={24} className="text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 max-w-[400px] truncate">
                  {newFile ? newFile.name : 'Choose New File (PDF or Image)'}
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {newFile ? `${(newFile.size / 1024 / 1024).toFixed(2)} MB` : 'Leave blank to keep existing file'}
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => {
                onClose();
                setNewFile(null);
              }}
              className="px-5 py-3 border border-slate-200 dark:border-white/[0.08] rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 cursor-pointer font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={updating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-md shadow-purple-500/10 cursor-pointer disabled:opacity-50 font-bold"
            >
              {updating ? (
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
