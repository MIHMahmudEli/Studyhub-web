'use client';

import { useState } from 'react';
import { Play, SquarePlay, ArrowUpRight, Clock } from 'lucide-react';

const CHANNEL_URL = 'https://www.youtube.com/@studyhub991';

/*
 * Featured videos from the StudyHub YouTube channel (@studyhub991).
 * To swap a video, copy its ID from the URL
 *   https://www.youtube.com/watch?v=XXXXXXXXXXX  →  id: 'XXXXXXXXXXX'
 * Thumbnails are pulled automatically from YouTube. The first item is the
 * one shown on the stage when the section first loads.
 */
const videos = [
  { id: 'vaVYbn1ZdPg', title: 'COA Final Term — Complete Syllabus One Shot', category: 'Computer Architecture', duration: '4:48:59', accent: '#ef4444' },
  { id: 'WGK4fRw4bDs', title: 'OS Mid Term — Shell Commands (Lab Part 1)',   category: 'Operating Systems',     duration: '24:12', accent: '#f59e0b' },
  { id: 'oZ-yKuju-sI', title: 'CN Final Term — Transport Layer Protocols II', category: 'Computer Networks',     duration: '40:49', accent: '#3b82f6' },
  { id: 'Y1j1yJbhhvY', title: 'EM Final Term — North-West Corner Method',    category: 'Engineering Math',      duration: '4:23',  accent: '#8b5cf6' },
];

/** YouTube thumbnail with graceful quality fallback: maxres → hq → gradient. */
function Thumbnail({ video, large }) {
  const chain = large ? ['maxresdefault', 'hqdefault'] : ['hqdefault'];
  const [step, setStep] = useState(0);
  const broken = step >= chain.length;

  return (
    <>
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${video.accent}40, #0a0a12 72%)` }} />
      {video.id && !broken && (
        <img
          src={`https://i.ytimg.com/vi/${video.id}/${chain[step]}.jpg`}
          alt={video.title}
          loading="lazy"
          onError={() => setStep(s => s + 1)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </>
  );
}

/** Animated three-bar "now playing" equalizer. */
function Equalizer({ color = '#fff' }) {
  return (
    <span className="flex items-end gap-[2px] h-3.5" aria-hidden="true">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-[3px] rounded-full animate-pulse"
          style={{ height: ['100%', '60%', '85%'][i], background: color, animationDelay: `${i * 150}ms`, animationDuration: '900ms' }}
        />
      ))}
    </span>
  );
}

export default function Videos() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const active = videos[activeIndex];

  const select = (i) => {
    setActiveIndex(i);
    setPlaying(true);
  };

  return (
    <section id="videos" className="px-6 pb-20 md:pb-[120px] relative overflow-hidden scroll-mt-24">
      <div className="max-w-[1120px] mx-auto">
        <div className="border-t border-[var(--border)] mb-12 md:mb-20" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div>
            <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.12em] uppercase text-red-500 mb-3">
              Watch &amp; Learn
            </span>
            <h2 className="text-[clamp(1.5rem,5vw,3rem)] font-extrabold leading-[1.2] md:leading-[1.15] tracking-tight text-[var(--text-1)] mb-4">
              Study with us<br />
              <span className="text-[var(--text-3)]">on YouTube.</span>
            </h2>
            <p className="text-sm md:text-base text-[var(--text-2)] leading-relaxed max-w-[480px]">
              Full course breakdowns, one-shot revisions, and exam prep — from Computer Architecture and Operating Systems to Networks and beyond, straight from the StudyHub team.
            </p>
          </div>
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 py-3 px-6 bg-red-600 text-white font-bold text-[14px] rounded-xl no-underline whitespace-nowrap shadow-[0_4px_20px_rgba(220,38,38,0.3)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-red-700 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(220,38,38,0.4)] self-start md:self-auto"
          >
            <SquarePlay size={18} />
            Subscribe
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500" />
          </a>
        </div>

        {/* Premium player + playlist */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-4 md:gap-5">
          {/* Ambient glow behind the stage */}
          <div className="pointer-events-none absolute -inset-x-10 -top-10 h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.16),transparent_70%)] -z-10 blur-2xl" />

          {/* ── Stage ── */}
          <div className="group relative rounded-[24px] overflow-hidden border border-[var(--border)] bg-black shadow-2xl ring-1 ring-white/5 aspect-video">
            {playing && active.id ? (
              <iframe
                key={active.id}
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${active.id}?autoplay=1&rel=0&modestbranding=1`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="absolute inset-0 w-full h-full text-left cursor-pointer"
                aria-label={`Play ${active.title}`}
              >
                <Thumbnail video={active} large />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

                {/* Now-playing chip */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/10 text-white text-[10px] font-black tracking-widest uppercase">
                  <Equalizer color={active.accent} /> Now Playing
                </div>

                {/* Big play */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[72px] h-[72px] md:w-20 md:h-20 rounded-full bg-red-600 flex items-center justify-center shadow-[0_8px_40px_rgba(220,38,38,0.55)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110">
                    <Play size={30} className="text-white translate-x-[2px]" fill="currentColor" />
                  </div>
                </div>

                {/* Title + meta */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: active.accent }}>{active.category}</span>
                    <span className="text-white/40">•</span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-white/70"><Clock size={11} /> {active.duration}</span>
                  </div>
                  <h3 className="text-lg md:text-2xl font-extrabold text-white leading-tight max-w-[92%]">
                    {active.title}
                  </h3>
                </div>
              </button>
            )}
          </div>

          {/* ── Playlist rail ── */}
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] backdrop-blur-sm p-2.5 md:p-3 flex flex-col">
            <div className="flex items-center justify-between px-2.5 py-2 mb-1">
              <span className="text-[11px] font-black tracking-[0.14em] uppercase text-[var(--text-1)]">Playlist</span>
              <span className="text-[11px] font-semibold text-[var(--text-3)]">{videos.length} videos</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {videos.map((v, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => select(i)}
                    className={`group/row relative flex items-center gap-3 p-2 rounded-2xl text-left transition-all duration-300 cursor-pointer ${
                      isActive ? 'bg-[var(--text-1)]/[0.06] ring-1 ring-red-500/30' : 'hover:bg-[var(--text-1)]/[0.04]'
                    }`}
                  >
                    {/* active accent bar */}
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full transition-all duration-300 ${isActive ? 'h-7 opacity-100' : 'h-0 opacity-0'}`}
                      style={{ background: v.accent }}
                    />
                    {/* thumbnail */}
                    <div className="relative w-[116px] shrink-0 aspect-video rounded-xl overflow-hidden">
                      <Thumbnail video={v} />
                      <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover/row:bg-black/10" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isActive ? (
                          <span className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                            <Equalizer />
                          </span>
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
                            <Play size={12} className="text-white translate-x-[1px]" fill="currentColor" />
                          </span>
                        )}
                      </div>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-white text-[9px] font-semibold">{v.duration}</span>
                    </div>
                    {/* text */}
                    <div className="min-w-0 pr-1">
                      <span className="text-[9px] font-bold tracking-[0.1em] uppercase" style={{ color: v.accent }}>{v.category}</span>
                      <h4 className={`text-[13px] font-bold leading-snug line-clamp-2 transition-colors ${isActive ? 'text-[var(--text-1)]' : 'text-[var(--text-2)] group-hover/row:text-[var(--text-1)]'}`}>
                        {v.title}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
