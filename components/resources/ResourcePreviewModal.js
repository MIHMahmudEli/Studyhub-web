'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';

const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp'];
const OFFICE_TYPES = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
const ARCHIVE_TYPES = ['zip', 'rar'];
const TEXT_TYPES = ['txt', 'rtf'];

const R2_PUBLIC = 'https://pub-aef2edcdffe24ec4999b508f46e4bc59.r2.dev';

function getFileCategory(fileType) {
  const ft = (fileType || '').toLowerCase();
  if (ft === 'pdf') return 'pdf';
  if (IMAGE_TYPES.includes(ft)) return 'image';
  if (OFFICE_TYPES.includes(ft)) return 'office';
  if (ARCHIVE_TYPES.includes(ft)) return 'archive';
  if (TEXT_TYPES.includes(ft)) return 'text';
  return 'unknown';
}

function extractKey(proxyUrl) {
  if (!proxyUrl) return null;
  const param = proxyUrl.split('?key=')[1];
  return param || null;
}

function ProgressOverlay({ progress, visible }) {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--background)]">
      <div className="w-64 max-w-[80vw]">
        <div className="flex items-center gap-3 mb-3">
          <Loader2 size={18} className="text-blue-500 animate-spin shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Loading preview...
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right text-[10px] font-black text-slate-500 mt-1.5 tabular-nums">
          {progress}%
        </p>
      </div>
    </div>
  );
}

function usePdfProgress(directUrl) {
  const [progress, setProgress] = useState(0);
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset on every url change (including null)
    setProgress(0);
    setBlobUrl(null);
    setError(null);

    if (!directUrl) return;

    // Local flag captured by this closure — immune to stale ref mutations
    let active = true;

    (async () => {
      try {
        const response = await fetch(directUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const contentLength = +response.headers.get('Content-Length');
        const reader = response.body.getReader();
        let received = 0;
        const chunks = [];
        while (true) {
          if (!active) return;
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (contentLength && active) {
            setProgress(Math.min(Math.round((received / contentLength) * 100), 99));
          }
        }
        const blob = new Blob(chunks, { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        if (active) {
          setBlobUrl(url);
          setProgress(100);
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    })();

    return () => { active = false; };
  }, [directUrl]);

  useEffect(() => {
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [blobUrl]);

  const loading = !blobUrl && !error;
  return { progress, blobUrl, error, loading };
}

export default function ResourcePreviewModal({ resource, isOpen, onClose }) {
  const category = getFileCategory(resource?.file_type);
  const key = extractKey(resource?.file_path);
  const directUrl = key ? `${R2_PUBLIC}/${key}` : (resource?.file_path || '');
  const title = resource?.title || '';

  const { progress: pdfProgress, blobUrl, error: pdfError, loading: pdfLoading } = usePdfProgress(
    category === 'pdf' ? directUrl : null
  );

  const [contentLoaded, setContentLoaded] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const simTimerRef = useRef(null);

  useEffect(() => {
    if (contentLoaded) {
      setSimProgress(100);
      return;
    }
    setSimProgress(0);
    simTimerRef.current = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 90) return prev;
        const remaining = 90 - prev;
        return Math.min(90, prev + Math.max(0.5, remaining / 10));
      });
    }, 150);
    return () => clearInterval(simTimerRef.current);
  }, [contentLoaded]);

  const progress = category === 'pdf' ? pdfProgress : simProgress;
  const loading = category === 'pdf' ? pdfLoading : !contentLoaded;

  if (!isOpen || !resource) return null;

  const renderPreview = () => {
    switch (category) {
      case 'pdf':
        if (pdfError) {
          return (
            <iframe
              src={`${directUrl}#toolbar=0`}
              className="w-full h-full rounded-xl"
              title={title}
            />
          );
        }
        return (
          <div className="relative w-full h-full">
            <ProgressOverlay progress={pdfProgress} visible={pdfLoading} />
            {blobUrl && (
              <iframe
                src={`${blobUrl}#toolbar=0`}
                className="w-full h-full rounded-xl"
                title={title}
              />
            )}
            {!pdfLoading && !blobUrl && !pdfError && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                No preview available
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="relative w-full h-full">
            <ProgressOverlay progress={progress} visible={loading} />
            <div className={`flex items-center justify-center h-full p-4 ${loading ? 'opacity-0 absolute inset-0' : ''}`}>
              <img
                src={directUrl}
                alt={title}
                className="max-w-full max-h-full object-contain rounded-xl"
                onLoad={() => setContentLoaded(true)}
              />
            </div>
          </div>
        );

      case 'office':
        return (
          <div className="relative w-full h-full">
            <ProgressOverlay progress={progress} visible={loading} />
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(directUrl)}&embedded=true`}
              className="w-full h-full rounded-xl"
              title={title}
              onLoad={() => setContentLoaded(true)}
            />
          </div>
        );

      case 'text':
        return (
          <div className="relative w-full h-full">
            <ProgressOverlay progress={progress} visible={loading} />
            <iframe
              src={directUrl}
              className="w-full h-full rounded-xl"
              title={title}
              onLoad={() => setContentLoaded(true)}
            />
          </div>
        );

      default:
        return <FallbackView resource={resource} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--background)] pt-16">
      {renderPreview()}
    </div>
  );
}

function FallbackView({ resource }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center text-slate-400 mb-4">
        <FileText size={28} />
      </div>
      <p className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">
        Preview not available for this file type.
      </p>
      <p className="text-[10px] font-bold text-slate-500 mb-6">
        Download the file to view its contents.
      </p>
      <a
        href={resource.file_path}
        download
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all text-[10px] font-black uppercase tracking-widest"
      >
        <Download size={14} /> Download
      </a>
      <div className="mt-6 space-y-1 text-[8px] font-bold text-slate-500">
        <p>File Type: {(resource.file_type || 'N/A').toUpperCase()}</p>
        <p>File Name: {resource.title}</p>
      </div>
    </div>
  );
}
