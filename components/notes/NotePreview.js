'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FileText, Loader2, ExternalLink } from 'lucide-react';
import { getDisplayUrl } from '@/lib/r2';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function CircularProgress({ percent }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  const intPercent = Math.round(Math.min(percent, 100));

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-purple-500/10" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none" stroke="currentColor" strokeWidth="6"
          className="text-purple-500 transition-all duration-300 ease-out"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-xl font-black text-purple-500 tabular-nums">{intPercent}%</span>
    </div>
  );
}

function usePdfProgress(directUrl) {
  const [progress, setProgress] = useState(0);
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!directUrl) {
      setProgress(0);
      setBlobUrl(null);
      setError(null);
      return;
    }
    let active = true;
    setProgress(0);
    setBlobUrl(null);
    setError(null);

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

    return () => {
      active = false;
    };
  }, [directUrl]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const loading = !blobUrl && !error;
  return { progress, blobUrl, error, loading };
}

export default function NotePreview({ note, isReadingMode, downloading, onDownload }) {
  const displayUrl = getDisplayUrl(note.file_path);
  const isMobile = useIsMobile();
  const isPdf = displayUrl && note.file_type?.toLowerCase() === 'pdf';
  const isImage = displayUrl && ['jpg', 'jpeg', 'png', 'webp'].includes(note.file_type?.toLowerCase());
  const isPreviewable = displayUrl && (isPdf || isImage);

  // Hook for real PDF progress
  const { progress: pdfProgress, blobUrl, error: pdfError, loading: pdfLoading } = usePdfProgress(
    isPdf ? displayUrl : null
  );

  const [frameLoaded, setFrameLoaded] = useState(false);
  const [overlayDone, setOverlayDone] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const simRef = useRef(null);
  const fillRef = useRef(null);
  const fallbackTimeoutRef = useRef(null);

  // Reset states when note changes
  useEffect(() => {
    setFrameLoaded(false);
    setOverlayDone(false);
    setLoadProgress(0);
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }
  }, [note.id, displayUrl]);

  // Handle PDF progress synchronization
  useEffect(() => {
    if (!isPdf) return;

    setLoadProgress(pdfProgress);

    if (pdfProgress === 100) {
      // Set a fallback timer in case iframe onLoad doesn't fire
      fallbackTimeoutRef.current = setTimeout(() => {
        setFrameLoaded(true);
      }, 1500);
    }
  }, [pdfProgress, isPdf]);

  // Handle overlay hide once PDF is loaded in the frame
  useEffect(() => {
    if (!isPdf) return;
    if (pdfProgress === 100 && frameLoaded) {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
      const t = setTimeout(() => setOverlayDone(true), 500); // 500ms render buffer
      return () => clearTimeout(t);
    }
  }, [pdfProgress, frameLoaded, isPdf]);

  // Handle PDF error fallback
  useEffect(() => {
    if (isPdf && pdfError) {
      setOverlayDone(true);
    }
  }, [pdfError, isPdf]);

  // Handle simulated progress for non-PDF files (e.g. images)
  useEffect(() => {
    if (isPdf) return;

    setFrameLoaded(false);
    setOverlayDone(false);
    setLoadProgress(0);

    simRef.current = setInterval(() => {
      setLoadProgress(prev => {
        if (prev >= 85) {
          clearInterval(simRef.current);
          return 85;
        }
        const inc = Math.max(1, (85 - prev) * 0.08 + Math.random() * 4);
        return Math.min(85, prev + inc);
      });
    }, 350);

    return () => {
      clearInterval(simRef.current);
      clearInterval(fillRef.current);
    };
  }, [note.id, displayUrl, isPdf]);

  // Fill up simulated progress when non-PDF frame loads
  useEffect(() => {
    if (isPdf) return;
    if (!frameLoaded) return;

    clearInterval(simRef.current);
    const start = loadProgress;
    const startedAt = Date.now();
    const DURATION = 2200;
    fillRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, start + (100 - start) * Math.min(elapsed / DURATION, 1));
      setLoadProgress(pct);
      if (pct >= 100) {
        clearInterval(fillRef.current);
        setTimeout(() => setOverlayDone(true), 300);
      }
    }, 50);
    return () => clearInterval(fillRef.current);
  }, [frameLoaded, isPdf]);

  const showOverlay = !overlayDone && isPreviewable;

  return (
    <div className={`w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] overflow-hidden shadow-2xl relative group transition-all duration-500 ${isReadingMode ? 'h-[85vh]' : 'h-[500px] md:h-[800px]'}`}>
      {displayUrl ? (
        <>
          <div className={`absolute inset-0 w-full h-full bg-slate-50 dark:bg-black/60 flex flex-col items-center justify-center z-10 space-y-5 transition-opacity duration-700 ${showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <CircularProgress percent={loadProgress} />
            <div className="text-center space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                {isPdf ? 'Downloading Document' : 'Loading Document'}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {isPdf ? 'Fetching file stream...' : 'Preparing preview...'}
              </p>
            </div>
          </div>

          {isPdf ? (
            isMobile ? (
              // Mobile: iframes can't render PDFs — show a styled open button instead
              <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
                <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center">
                  <FileText size={40} className="text-purple-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-base font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
                    {note.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                    PDF preview is not supported on mobile browsers
                  </p>
                </div>
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-4 bg-purple-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-purple-600 active:scale-95 transition-all shadow-lg shadow-purple-500/30"
                >
                  <ExternalLink size={16} />
                  Open PDF
                </a>
              </div>
            ) : pdfError ? (
              // Desktop fallback to direct URL if blob fetch fails (e.g. CORS)
              <iframe
                src={`${displayUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-none"
                title={note.title}
              />
            ) : blobUrl ? (
              <iframe
                src={`${blobUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-none"
                title={note.title}
                onLoad={() => setFrameLoaded(true)}
              />
            ) : (
              <div className="w-full h-full bg-[var(--card-bg)]" />
            )
          ) : isImage ? (
            <Image
              src={displayUrl}
              alt={note.title}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 66vw"
              onLoad={() => setFrameLoaded(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <FileText size={64} className="text-purple-500/20" />
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">Preview Not Available</h3>
              <button
                onClick={onDownload}
                disabled={downloading}
                className="px-6 py-3 bg-purple-500/10 text-purple-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {downloading ? <Loader2 size={14} className="animate-spin inline" /> : <FileText size={14} className="inline" />}
                {downloading ? ' Downloading...' : ' Download to View'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <FileText size={64} className="text-purple-500/20 mb-6" />
          <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">No Document Found</h3>
        </div>
      )}
    </div>
  );
}
