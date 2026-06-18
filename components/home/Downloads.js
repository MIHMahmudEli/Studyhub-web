'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Apple, Download, Clock, Link2, Check } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { getDisplayUrl } from '@/lib/r2';

const PLATFORMS = [
  { id: 'android', label: 'Android', icon: Smartphone, accent: '#10b981', tag: 'APK', note: 'Direct .apk install' },
  { id: 'ios',     label: 'iOS',     icon: Apple,      accent: '#a78bfa', tag: 'IPA', note: 'iPhone & iPad build' },
];

function formatSize(bytes) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function timeAgo(date) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Fire-and-forget download counter; never blocks the actual download.
function trackDownload(id) {
  apiRequest(`/app-releases/${id}/download`, { method: 'POST' }).catch(() => {});
}

function PlatformCard({ platform, releases }) {
  const { icon: Icon, accent } = platform;
  const latest = releases[0];
  const older = releases.slice(1, 4);

  return (
    <div className="bg-[var(--surface)] backdrop-blur-sm border border-[var(--border)] rounded-[24px] p-6 md:p-8 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-xl hover:border-[var(--border-h)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-[14px] flex items-center justify-center"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <Icon size={22} color={accent} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-[19px] font-bold text-[var(--text-1)] leading-tight">{platform.label}</h3>
          <p className="text-[12px] text-[var(--text-3)]">{platform.note}</p>
        </div>
        <span
          className="ml-auto text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
          style={{ background: `${accent}18`, color: accent }}
        >
          {platform.tag}
        </span>
      </div>

      {latest ? (
        <>
          {/* Latest version + download */}
          <div className="mb-5">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[13px] font-bold text-[var(--text-2)]">Latest</span>
              <span className="text-[22px] font-black tracking-tight text-[var(--text-1)]">v{latest.version}</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-[var(--text-3)]">
              <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(latest.created_at)}</span>
              {formatSize(latest.file_size) && <><span>•</span><span>{formatSize(latest.file_size)}</span></>}
            </div>
            {latest.notes && <p className="text-[13px] text-[var(--text-2)] leading-relaxed mt-3">{latest.notes}</p>}
          </div>

          <a
            href={getDisplayUrl(latest.file_path)}
            download
            onClick={() => trackDownload(latest.id)}
            className="group inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-[15px] text-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
            style={{ background: accent, boxShadow: `0 8px 30px ${accent}40` }}
          >
            <Download size={17} className="group-hover:translate-y-0.5 transition-transform duration-500" />
            Download for {platform.label}
          </a>

          {/* Older versions */}
          {older.length > 0 && (
            <div className="mt-6 pt-5 border-t border-[var(--border)]">
              <span className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--text-3)] mb-3">Previous versions</span>
              <div className="flex flex-col gap-1.5">
                {older.map((r) => (
                  <a
                    key={r.id}
                    href={getDisplayUrl(r.file_path)}
                    download
                    onClick={() => trackDownload(r.id)}
                    className="group flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-[13px] transition-colors hover:bg-[var(--text-1)]/[0.04]"
                  >
                    <span className="font-semibold text-[var(--text-2)] group-hover:text-[var(--text-1)] transition-colors">v{r.version}</span>
                    <span className="flex items-center gap-2 text-[var(--text-3)]">
                      {formatSize(r.file_size) && <span className="text-[11px]">{formatSize(r.file_size)}</span>}
                      <Download size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <Icon size={28} className="text-[var(--text-3)] mb-3" strokeWidth={1.5} />
          <p className="text-[14px] font-semibold text-[var(--text-2)]">Coming soon</p>
          <p className="text-[12px] text-[var(--text-3)] mt-1">The {platform.label} build isn&apos;t available yet.</p>
        </div>
      )}
    </div>
  );
}

export default function Downloads() {
  const [releases, setReleases] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest('/app-releases')
      .then((res) => { if (active) setReleases(res || []); })
      .catch(() => { if (active) setReleases([]); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  // Don't render the section at all until we know there's at least one release,
  // so the landing page never shows an empty "download" area.
  const hasAny = releases.length > 0;
  if (loaded && !hasAny) return null;

  const byPlatform = (id) => releases.filter((r) => r.platform === id); // already newest-first from API

  const [copied, setCopied] = useState(false);
  const copyShareLink = async () => {
    const url = `${window.location.origin}/#download`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard may be blocked; still reflect the link in the address bar
    }
    window.history.replaceState(null, '', '#download');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="download" className="px-6 pb-20 md:pb-[120px] relative overflow-hidden scroll-mt-24">
      <div className="max-w-[1120px] mx-auto">
        <div className="border-t border-[var(--border)] mb-12 md:mb-20" />
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div>
            <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.12em] uppercase text-emerald-500 mb-3">
              Get the app
            </span>
            <h2 className="text-[clamp(1.5rem,5vw,3rem)] font-extrabold leading-[1.2] md:leading-[1.15] tracking-tight text-[var(--text-1)] mb-4">
              Take StudyHub<br />
              <span className="text-[var(--text-3)]">anywhere you go.</span>
            </h2>
            <p className="text-sm md:text-base text-[var(--text-2)] leading-relaxed max-w-[480px]">
              Download the official StudyHub mobile app to browse notes, track your routine, and stay on top of the leaderboard — on the move.
            </p>
          </div>
          <button
            type="button"
            onClick={copyShareLink}
            className="group inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-[13px] font-bold border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-h)] hover:bg-[var(--surface)] transition-all duration-300 self-start whitespace-nowrap"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Link2 size={16} />}
            {copied ? 'Link copied' : 'Copy share link'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PLATFORMS.map((p) => (
            <PlatformCard key={p.id} platform={p} releases={byPlatform(p.id)} />
          ))}
        </div>

        <p className="text-[12px] text-[var(--text-3)] mt-6 max-w-[640px] leading-relaxed">
          Android: you may need to allow installs from unknown sources. iOS builds are distributed outside the App Store and may require a trusted developer profile.
        </p>
      </div>
    </section>
  );
}
