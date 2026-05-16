'use client';

import { useRef, useState } from 'react';
import { UploadCloud, File, X } from 'lucide-react';

export default function FileUploader({ file, setFile, setStatus }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      setStatus({ type: 'error', message: 'Please upload a PDF, Word document, or Image.' });
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File size must be less than 50MB.' });
      return;
    }
    setFile(selectedFile);
    setStatus({ type: '', message: '' });
  };

  return (
    <div 
      className={`relative bg-[var(--card-bg)] border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center transition-all duration-500 ${
        dragActive ? 'border-blue-500 bg-blue-500/5 scale-105' : 'border-[var(--card-border)] hover:border-blue-500/30 hover:bg-white/[0.02]'
      } ${file ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {file ? (
        <div className="animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 text-emerald-400">
            <File size={32} />
          </div>
          <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest truncate max-w-[200px] mb-2">{file.name}</p>
          <p className="text-[10px] font-bold text-slate-500 mb-6 uppercase">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          <button 
            type="button"
            onClick={() => setFile(null)}
            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 text-blue-400">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">Drop your notes here</h3>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-8 leading-relaxed">
            Supports PDF, PNG, JPG, DOCX <br /> (Max 50MB)
          </p>
          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="px-6 py-3 rounded-xl bg-white text-black font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all shadow-lg"
          >
            Browse Files
          </button>
        </>
      )}
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
    </div>
  );
}
