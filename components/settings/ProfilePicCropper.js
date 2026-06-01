'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Crop, ZoomIn, ZoomOut, Check, X, Loader2 } from 'lucide-react';

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      'image/jpeg',
      0.95,
    );
  });
}

function compressImage(blob, maxSize = 2 * 1024 * 1024) {
  return new Promise((resolve) => {
    if (blob.size <= maxSize) return resolve(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_DIM = 1200;
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const ratio = blob.size / maxSize;
      const startQuality = Math.min(0.92, Math.max(0.3, 0.85 / ratio));

      const tryCompress = (q) => {
        canvas.toBlob(
          (compressed) => {
            if (compressed.size <= maxSize || q <= 0.1) {
              resolve(compressed);
            } else {
              tryCompress(Math.max(0.1, q - 0.08));
            }
          },
          'image/jpeg',
          q,
        );
      };

      tryCompress(startQuality);
    };
    img.src = URL.createObjectURL(blob);
  });
}

export default function ProfilePicCropper({
  file,
  onSave,
  onCancel,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  const imageUrl = URL.createObjectURL(file);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
      const compressedBlob = await compressImage(croppedBlob);
      const finalFile = new File([compressedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), {
        type: 'image/jpeg',
      });
      onSave(finalFile);
    } catch (err) {
      onCancel();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-[2rem] w-full max-w-lg mx-4 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2">
            <Crop size={16} className="text-blue-500" />
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]">
              Adjust Profile Picture
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative w-full h-[400px] bg-slate-900">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="px-6 py-4 border-t border-[var(--card-border)] space-y-4">
          <div className="flex items-center gap-3">
            <ZoomOut size={14} className="text-slate-400 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-500/20 rounded-full appearance-none cursor-pointer accent-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-md"
            />
            <ZoomIn size={14} className="text-slate-400 shrink-0" />
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[var(--foreground)] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {saving ? 'Processing...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
