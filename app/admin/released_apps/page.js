'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Toast from '@/components/ui/Toast';
import { apiRequest } from '@/lib/api';
import {
  ArrowLeft, Smartphone, Apple, Download, Trash2, Pencil, Check, X, Loader2, UploadCloud, Plus,
} from 'lucide-react';

const PLATFORMS = {
  android: { label: 'Android', icon: Smartphone },
  ios: { label: 'iOS', icon: Apple },
};

function formatSize(bytes) {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export default function ReleasedAppsPage() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();

  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ version: '', notes: '' });
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Toast must carry `show: true` for the Toast component to render.
  const notify = (type, message) => setToast({ show: true, type, message });

  useEffect(() => {
    if (!toast?.show) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

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

  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({ version: r.version, notes: r.notes || '' });
  };

  const saveEdit = async (id) => {
    if (!form.version.trim()) {
      notify('error', 'Version cannot be empty.');
      return;
    }
    setSavingId(id);
    try {
      const updated = await apiRequest(`/app-releases/${id}`, {
        method: 'PATCH',
        body: { version: form.version.trim(), notes: form.notes.trim() || null },
      });
      setReleases((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      setEditingId(null);
      notify('success', 'Release updated.');
    } catch (err) {
      notify('error', err.message || 'Update failed.');
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this release? The build file will also be removed from storage.')) return;
    setDeletingId(id);
    try {
      await apiRequest(`/app-releases/${id}`, { method: 'DELETE' });
      setReleases((prev) => prev.filter((r) => r.id !== id));
      notify('success', 'Release deleted.');
    } catch (err) {
      notify('error', err.message || 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[900px] mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--text-2)] hover:text-[var(--foreground)] transition-colors mb-4">
                <ArrowLeft size={15} /> Back to dashboard
              </Link>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5">
                <Smartphone size={26} className="text-emerald-500" /> App Releases
              </h1>
              <p className="text-sm text-[var(--text-2)] mt-1.5">View, edit, and delete published Android &amp; iOS builds.</p>
            </div>
            <Link
              href="/admin/app_releases"
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl transition-colors"
            >
              <Plus size={16} /> Upload build
            </Link>
          </div>

          {/* List */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-4 sm:p-6">
            {loading ? (
              <p className="text-sm text-[var(--text-3)] py-6 text-center">Loading…</p>
            ) : releases.length === 0 ? (
              <div className="text-center py-12">
                <UploadCloud size={32} className="text-[var(--text-3)] mx-auto mb-3" />
                <p className="text-base text-[var(--text-2)] font-semibold">No releases yet</p>
                <Link href="/admin/app_releases" className="text-sm text-blue-500 hover:text-blue-400">Upload your first build →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {releases.map((r) => {
                  const P = PLATFORMS[r.platform] || PLATFORMS.android;
                  const Icon = P.icon;
                  const editing = editingId === r.id;
                  return (
                    <div key={r.id} className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--background)]/50 border border-[var(--card-border)]">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-emerald-400" />
                      </div>

                      <div className="min-w-0 flex-1">
                        {editing ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-[var(--text-3)] uppercase">{P.label}</span>
                              <input
                                value={form.version}
                                onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
                                placeholder="version"
                                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-2.5 py-1.5 text-sm w-32 outline-none focus:border-blue-500/50"
                              />
                            </div>
                            <textarea
                              value={form.notes}
                              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                              rows={2}
                              placeholder="release notes"
                              className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-blue-500/50 resize-none"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-bold text-[var(--text-3)] uppercase">{P.label}</span>
                              <span className="text-base font-bold">v{r.version}</span>
                              <span className="text-[11px] text-[var(--text-3)]">{formatSize(r.file_size)}</span>
                            </div>
                            {r.notes && <p className="text-sm text-[var(--text-2)] mt-1 leading-relaxed">{r.notes}</p>}
                            <p className="text-[11px] text-[var(--muted)] mt-1.5 flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-[var(--text-2)] font-semibold"><Download size={11} /> {r.downloads ?? 0} downloads</span>
                              <span>·</span>
                              <span>{new Date(r.created_at).toLocaleDateString()}</span>
                              {r.file_name && <><span>·</span><span className="truncate max-w-[180px]">{r.file_name}</span></>}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {editing ? (
                          <>
                            <button onClick={() => saveEdit(r.id)} disabled={savingId === r.id} className="w-9 h-9 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50" aria-label="Save">
                              {savingId === r.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            </button>
                            <button onClick={() => setEditingId(null)} className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-3)] hover:bg-[var(--text-1)]/10" aria-label="Cancel">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(r)} className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--text-1)]/10" aria-label="Edit">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => remove(r.id)} disabled={deletingId === r.id} className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 disabled:opacity-50" aria-label="Delete">
                              {deletingId === r.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={15} />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast toast={toast} closeToast={() => setToast(null)} />}
    </main>
  );
}
