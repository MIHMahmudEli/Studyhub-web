'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Toast from '@/components/ui/Toast';
import { apiRequest } from '@/lib/api';
import { uploadToR2 } from '@/lib/r2';
import {
  ArrowLeft, Smartphone, Apple, UploadCloud, Trash2, Tag, Loader2, Plus,
} from 'lucide-react';

const PLATFORMS = [
  { id: 'android', label: 'Android', icon: Smartphone, accept: '.apk,application/vnd.android.package-archive', hint: '.apk file' },
  { id: 'ios',     label: 'iOS',     icon: Apple,      accept: '.ipa',                                          hint: '.ipa file' },
];

function formatSize(bytes) {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function sanitize(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export default function AdminAppReleasesPage() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();

  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // form state
  const [platform, setPlatform] = useState('android');
  const [version, setVersion] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const activePlatform = PLATFORMS.find((p) => p.id === platform);

  // Admin only
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/auth');
      else if (user.role !== 'admin') router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const fetchReleases = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/app-releases');
      setReleases(res || []);
    } catch {
      setReleases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tokenReady && user?.role === 'admin') fetchReleases();
  }, [tokenReady, user, fetchReleases]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !version.trim()) {
      setToast({ type: 'error', message: 'Pick a file and enter a version.' });
      return;
    }
    setSubmitting(true);
    try {
      const ver = version.trim();
      const key = `apks/${platform}/${ver}/${sanitize(file.name)}`;
      const file_path = await uploadToR2(file, key);

      await apiRequest('/app-releases', {
        method: 'POST',
        body: {
          platform,
          version: ver,
          file_path,
          file_name: file.name,
          file_size: file.size,
          notes: notes.trim() || undefined,
        },
      });

      setToast({ type: 'success', message: `${activePlatform.label} v${ver} published.` });
      setVersion('');
      setNotes('');
      setFile(null);
      e.target.reset?.();
      fetchReleases();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Upload failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this release? The file will be removed from storage.')) return;
    setDeletingId(id);
    try {
      await apiRequest(`/app-releases/${id}`, { method: 'DELETE' });
      setReleases((prev) => prev.filter((r) => r.id !== id));
      setToast({ type: 'success', message: 'Release deleted.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Delete failed.' });
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  const byPlatform = (id) => releases.filter((r) => r.platform === id);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1000px] mx-auto space-y-8">

          {/* Header */}
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--text-2)] hover:text-[var(--foreground)] transition-colors mb-4">
              <ArrowLeft size={15} /> Back to dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <UploadCloud size={26} className="text-blue-500" /> App Releases
            </h1>
            <p className="text-sm text-[var(--text-2)] mt-1.5">Upload Android (.apk) and iOS (.ipa) builds. They appear on the landing page for users to download.</p>
          </div>

          {/* Upload form */}
          <form onSubmit={handleSubmit} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 md:p-8 space-y-5">
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-2)] flex items-center gap-2"><Plus size={14} /> New release</h2>

            {/* Platform toggle */}
            <div className="flex gap-2">
              {PLATFORMS.map((p) => {
                const Icon = p.icon;
                const active = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setPlatform(p.id); setFile(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border transition-all ${
                      active
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                        : 'border-[var(--card-border)] text-[var(--text-2)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    <Icon size={16} /> {p.label}
                  </button>
                );
              })}
            </div>

            {/* Version */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-2)] mb-1.5">Version</label>
              <div className="relative">
                <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 1.0.0"
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            {/* Release notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-2)] mb-1.5">Release notes <span className="text-[var(--muted)] normal-case font-normal">(optional)</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="What's new in this version…"
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-2xl py-3 px-4 text-sm outline-none focus:border-blue-500/50 resize-none"
              />
            </div>

            {/* File */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-2)] mb-1.5">Build file <span className="text-[var(--muted)] normal-case font-normal">({activePlatform.hint})</span></label>
              <input
                key={platform}
                type="file"
                accept={activePlatform.accept}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-[var(--text-2)] file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-500/15 file:text-blue-400 hover:file:bg-blue-500/25 file:cursor-pointer cursor-pointer"
              />
              {file && <p className="text-xs text-[var(--text-3)] mt-1.5">{file.name} · {formatSize(file.size)}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-2xl transition-all"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : <><UploadCloud size={16} /> Publish release</>}
            </button>
          </form>

          {/* Existing releases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PLATFORMS.map((p) => {
              const Icon = p.icon;
              const list = byPlatform(p.id);
              return (
                <div key={p.id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-5">
                  <h3 className="text-sm font-black flex items-center gap-2 mb-4"><Icon size={16} className="text-blue-500" /> {p.label} <span className="text-[var(--text-3)] font-semibold">· {list.length}</span></h3>
                  {loading ? (
                    <p className="text-sm text-[var(--text-3)]">Loading…</p>
                  ) : list.length === 0 ? (
                    <p className="text-sm text-[var(--text-3)]">No releases yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {list.map((r) => (
                        <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--background)]/50 border border-[var(--card-border)]">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">v{r.version}</span>
                              <span className="text-[10px] text-[var(--text-3)]">{formatSize(r.file_size)}</span>
                            </div>
                            {r.notes && <p className="text-xs text-[var(--text-3)] line-clamp-1 mt-0.5">{r.notes}</p>}
                            <p className="text-[10px] text-[var(--muted)] mt-0.5">{new Date(r.created_at).toLocaleDateString()}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(r.id)}
                            disabled={deletingId === r.id}
                            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            aria-label="Delete release"
                          >
                            {deletingId === r.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {toast && <Toast toast={toast} closeToast={() => setToast(null)} />}
    </main>
  );
}
