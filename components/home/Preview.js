'use client';

import {
  LayoutDashboard, FileText, FolderOpen, Trophy, Bookmark, CalendarDays,
  Bell, Search, Star, Upload, Flame, ChevronRight,
} from 'lucide-react';

const nav = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: FileText,        label: 'Notes' },
  { icon: FolderOpen,      label: 'Resources' },
  { icon: Trophy,          label: 'Leaderboard' },
  { icon: Bookmark,        label: 'Bookmarks' },
  { icon: CalendarDays,    label: 'Routine' },
];

const tiles = [
  { icon: Star,   label: 'Reputation', value: '1,240', sub: 'points',     accent: '#3b82f6' },
  { icon: Trophy, label: 'Rank',       value: '#7',     sub: 'this month', accent: '#f59e0b' },
  { icon: Upload, label: 'Uploads',    value: '23',     sub: 'notes',      accent: '#10b981' },
];

const notes = [
  { code: 'CSE321', title: 'Operating Systems — Midterm Notes',  author: 'Mahmud A.', pts: '+120', accent: '#3b82f6' },
  { code: 'CSE331', title: 'Computer Architecture One-Shot',     author: 'Rifat H.',  pts: '+95',  accent: '#8b5cf6' },
  { code: 'CSE391', title: 'Computer Networks — Transport Layer', author: 'Nabila K.', pts: '+88',  accent: '#10b981' },
  { code: 'MAT215', title: 'Engineering Math — NWCM Practice',   author: 'Sadia R.',  pts: '+74',  accent: '#f59e0b' },
];

const board = [
  { rank: 1, name: 'Mahmud A.', pts: '1,240', medal: '#fbbf24' },
  { rank: 2, name: 'Rifat H.',  pts: '1,108', medal: '#cbd5e1' },
  { rank: 3, name: 'Nabila K.', pts: '960',   medal: '#d97757' },
];

export default function Preview() {
  return (
    <section id="preview" className="px-6 pb-20 md:pb-[120px] relative overflow-hidden scroll-mt-24">
      <div className="max-w-[1040px] mx-auto">
        {/* Compact intro */}
        <div className="text-center mb-10 md:mb-12">
          <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.12em] uppercase text-indigo-400 mb-3">
            A peek inside
          </span>
          <h2 className="text-[clamp(1.5rem,5vw,2.6rem)] font-extrabold leading-[1.15] tracking-tight text-[var(--text-1)]">
            Your whole semester, organized.
          </h2>
        </div>

        {/* Browser-framed dashboard mockup */}
        <div className="relative">
          {/* Glow */}
          <div className="pointer-events-none absolute -inset-x-8 -top-8 bottom-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_65%)] blur-2xl -z-10" />

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-3 px-4 h-10 border-b border-[var(--border)] bg-[var(--background)]/60">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/80" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-3 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--text-3)] max-w-[260px] w-full text-center truncate">
                  studyhub.app/dashboard
                </div>
              </div>
            </div>

            {/* App body (decorative) */}
            <div aria-hidden="true" className="flex bg-[var(--background)]/40">
              {/* Sidebar */}
              <aside className="hidden sm:flex flex-col gap-1 w-[176px] shrink-0 p-3 border-r border-[var(--border)]">
                <div className="px-2 py-2 mb-2 text-[13px] font-black tracking-tighter text-[var(--text-1)]">
                  Study<span className="text-blue-500">Hub</span>
                </div>
                {nav.map(({ icon: Icon, label, active }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] font-semibold ${
                      active
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                        : 'text-[var(--text-3)]'
                    }`}
                  >
                    <Icon size={14} strokeWidth={2} />
                    {label}
                  </div>
                ))}
              </aside>

              {/* Main */}
              <div className="flex-1 min-w-0 p-4 md:p-5">
                {/* Top bar */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-[15px] md:text-[17px] font-extrabold text-[var(--text-1)] leading-tight">Welcome back, Mahmud 👋</h3>
                    <p className="text-[11px] text-[var(--text-3)]">You&apos;re #7 on the leaderboard this month</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2 px-3 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-3)]">
                      <Search size={13} />
                      <span className="text-[11px]">Search notes…</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-3)] relative">
                      <Bell size={14} />
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-black">M</div>
                  </div>
                </div>

                {/* Stat tiles */}
                <div className="grid grid-cols-3 gap-2.5 md:gap-3 mb-5">
                  {tiles.map(({ icon: Icon, label, value, sub, accent }) => (
                    <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${accent}1f`, border: `1px solid ${accent}33` }}>
                          <Icon size={12} style={{ color: accent }} />
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-3)]">{label}</span>
                      </div>
                      <div className="text-[18px] md:text-[22px] font-black text-[var(--text-1)] leading-none">{value}</div>
                      <div className="text-[10px] text-[var(--text-3)] mt-1">{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Content: notes + mini leaderboard */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3">
                  {/* Recent notes */}
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-black text-[var(--text-1)]">Recent notes</span>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-blue-400">View all <ChevronRight size={11} /></span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {notes.map((n) => (
                        <div key={n.title} className="rounded-lg border border-[var(--border)] bg-[var(--background)]/40 p-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide" style={{ background: `${n.accent}1f`, color: n.accent }}>{n.code}</span>
                            <span className="text-[10px] font-bold text-emerald-400">{n.pts}</span>
                          </div>
                          <p className="text-[11px] font-bold text-[var(--text-1)] leading-snug line-clamp-2 mb-1.5">{n.title}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[var(--border)] text-[8px] font-black text-[var(--text-2)] flex items-center justify-center">{n.author[0]}</span>
                            <span className="text-[9px] text-[var(--text-3)]">{n.author}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini leaderboard */}
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Flame size={13} className="text-amber-400" />
                      <span className="text-[12px] font-black text-[var(--text-1)]">Top this month</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {board.map((b) => (
                        <div key={b.rank} className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-[#06080f]" style={{ background: b.medal }}>{b.rank}</span>
                          <span className="w-5 h-5 rounded-full bg-[var(--border)] text-[9px] font-black text-[var(--text-2)] flex items-center justify-center">{b.name[0]}</span>
                          <span className="flex-1 text-[11px] font-bold text-[var(--text-1)] truncate">{b.name}</span>
                          <span className="text-[10px] font-bold text-[var(--text-3)]">{b.pts}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-1.5 text-[10px] text-[var(--text-3)]">
                      <Trophy size={11} className="text-amber-400" /> Earn points with every upload
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
