'use client';

import { useState, useMemo } from 'react';
import { FileText, Download, Star, ChevronDown, BookOpen } from 'lucide-react';

const COLORS = { amber: '#f59e0b', emerald: '#10b981', blue: '#3b82f6' };

function SectionHeader({ label, title, color = COLORS.blue }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-6 rounded-full shrink-0" style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }} />
      <div>
        <p className="text-[8px] font-black uppercase tracking-[0.25em]" style={{ color }}>{label}</p>
        <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-[var(--foreground)]">{title}</h2>
      </div>
    </div>
  );
}

function RankBadge({ rank }) {
  const styles = {
    1: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    2: 'bg-slate-400/10 text-slate-400 border-slate-400/25',
    3: 'bg-orange-600/10 text-orange-500 border-orange-500/25',
  };
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[9px] font-black border shrink-0 ${styles[rank] || 'bg-white/[0.03] text-slate-500 border-white/[0.06]'}`}>
      {rank}
    </span>
  );
}

export default function PopularResourcesSection({ popularResources, loading }) {
  const [expandedCourses, setExpandedCourses] = useState({});

  const grouped = useMemo(() => {
    if (!popularResources?.length) return [];
    const map = {};
    popularResources.forEach(r => {
      const key = r.subject || 'Uncategorized';
      if (!map[key]) { map[key] = { subject: key, course_code: r.course_code || '', resources: [], totalDownloads: 0 }; }
      map[key].resources.push(r);
      map[key].totalDownloads += r.downloads || 0;
    });
    return Object.values(map).sort((a, b) => b.totalDownloads - a.totalDownloads).slice(0, 10);
  }, [popularResources]);

  const toggleCourse = (subject) => {
    setExpandedCourses(prev => ({ ...prev, [subject]: !prev[subject] }));
  };

  return (
    <div data-pdf-section data-pdf-label="Popular Resources — Grouped by Subject">
      <div className="mb-5">
        <SectionHeader label="Leaderboard" title="Popular Resources" color={COLORS.amber} />
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-5 sm:p-7 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-white/[0.03] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !grouped.length ? (
          <div className="py-16 text-center">
            <BookOpen size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No resources data available</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--card-border)]">
            <div className="px-5 sm:px-7 py-3 hidden sm:grid grid-cols-[2rem_1fr_auto_auto] gap-4 items-center">
              {['#', 'Subject', 'Total Downloads', ''].map(h => (
                <span key={h} className="text-[8px] font-black uppercase tracking-widest text-slate-500">{h}</span>
              ))}
            </div>

            {grouped.map((group, i) => {
              const isOpen = expandedCourses[group.subject];
              return (
                <div key={group.subject}>
                  <div
                    onClick={() => toggleCourse(group.subject)}
                    className="px-5 sm:px-7 py-3.5 sm:py-4 flex items-center gap-3 sm:grid sm:grid-cols-[2rem_1fr_auto_auto] sm:gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <RankBadge rank={i + 1} />

                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <span
                        className="text-blue-500 transition-transform duration-200 inline-block"
                        style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                      >
                        <ChevronDown size={14} />
                      </span>
                      <div>
                        <p className="text-[11px] sm:text-xs font-bold text-[var(--foreground)] truncate">{group.subject}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{group.course_code} · {group.resources.length} file{group.resources.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5" style={{ color: COLORS.emerald }}>
                      <Download size={11} />
                      <span className="text-[11px] font-black">{group.totalDownloads}</span>
                    </div>

                    <div className="sm:hidden flex items-center gap-3 shrink-0">
                      <span className="text-[9px] font-black" style={{ color: COLORS.emerald }}>↓{group.totalDownloads}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="bg-white/[0.015] border-t border-[var(--card-border)]">
                            <div className="px-5 sm:px-7 py-2 hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                              {['File', 'Downloads', 'Rating'].map(h => (
                          <span key={h} className="text-[7px] font-black uppercase tracking-widest text-slate-500">{h}</span>
                        ))}
                      </div>
                      {group.resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="px-5 sm:px-7 py-3 flex sm:grid sm:grid-cols-[1fr_auto_auto] gap-3 sm:gap-4 items-center hover:bg-white/[0.02] transition-colors border-t border-[var(--card-border)]/50"
                        >
                          <div className="flex-1 min-w-0 pl-3 sm:pl-0">
                            <p className="text-[10px] sm:text-[11px] font-bold truncate text-[var(--foreground)]" title={resource.title}>
                              {resource.title}
                            </p>
                            <p className="text-[8px] text-slate-500 font-semibold truncate">{resource.uploader?.name || 'Unknown'}</p>
                          </div>

                          <div className="hidden sm:flex items-center gap-1.5" style={{ color: COLORS.emerald }}>
                            <Download size={10} />
                            <span className="text-[10px] font-black">{resource.downloads}</span>
                          </div>

                          <div className="hidden sm:flex items-center gap-1" style={{ color: COLORS.amber }}>
                            <Star size={9} className="fill-current" />
                            <span className="text-[10px] font-black">{resource.avgRating?.toFixed(1)}</span>
                          </div>

                          <div className="sm:hidden flex items-center gap-3 shrink-0">
                            <span className="text-[8px] font-black" style={{ color: COLORS.emerald }}>↓{resource.downloads}</span>
                            <span className="text-[8px] font-black" style={{ color: COLORS.amber }}>★{resource.avgRating?.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
