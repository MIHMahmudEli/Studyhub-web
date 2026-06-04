'use client';

import { FileText, Download } from 'lucide-react';

const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp'];
const OFFICE_TYPES = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
const ARCHIVE_TYPES = ['zip', 'rar'];
const TEXT_TYPES = ['txt', 'rtf'];

function getFileCategory(fileType) {
  const ft = (fileType || '').toLowerCase();
  if (ft === 'pdf') return 'pdf';
  if (IMAGE_TYPES.includes(ft)) return 'image';
  if (OFFICE_TYPES.includes(ft)) return 'office';
  if (ARCHIVE_TYPES.includes(ft)) return 'archive';
  if (TEXT_TYPES.includes(ft)) return 'text';
  return 'unknown';
}

export default function ResourcePreviewModal({ resource, isOpen, onClose }) {
  if (!isOpen || !resource) return null;

  const category = getFileCategory(resource.file_type);
  const filePath = resource.file_path;
  const title = resource.title;
  const fileType = (resource.file_type || '').toUpperCase() || 'UNKNOWN';

  const renderPreview = () => {
    switch (category) {
      case 'pdf':
        return (
          <iframe
            src={`${filePath}#toolbar=0`}
            className="w-full h-full rounded-xl"
            title={title}
          />
        );
      case 'image':
        return (
          <div className="flex items-center justify-center h-full p-4">
            <img
              src={filePath}
              alt={title}
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </div>
        );
      case 'office':
        return (
          <iframe
            src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(filePath)}&wdDownloadButton=0&wdToolbar=0&embed=1`}
            className="w-full h-full rounded-xl"
            title={title}
          />
        );
      case 'text':
        return (
          <iframe
            src={filePath}
            className="w-full h-full rounded-xl"
            title={title}
          />
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
