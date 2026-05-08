'use client';

import { useState, useMemo, useEffect } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  Bookmark, 
  Search, 
  BookOpen, 
  FileText, 
  GraduationCap,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  Cpu,
  Globe,
  Database,
  Code2,
  Network
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import bookmarkData from '@/lib/data/bookmark.json';
import { courseList as masterResources } from '@/lib/data/resourceData';

export default function BookmarkPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  // Map master data for course details (counts, codes, depts)
  const masterCourseMap = useMemo(() => {
    const map = {};
    masterResources.forEach(item => {
      if (!map[item.courseTitle]) {
        map[item.courseTitle] = {
          code: item.course_code,
          dept: item.dept,
          count: 0
        };
      }
      map[item.courseTitle].count += 1;
    });
    return map;
  }, []);

  // Unified Filtering & Grouping Logic
  const { savedNotes, savedCourses, savedResources } = useMemo(() => {
    if (!user) return { savedNotes: [], savedCourses: [], savedResources: [] };

    // Strict User-Level Filtering
    const myBookmarks = bookmarkData.filter(b => b.user_id === user.id);

    return {
      savedNotes: myBookmarks.filter(b => b.note_id !== null),
      savedResources: myBookmarks.filter(b => b.resource_id !== null),
      savedCourses: myBookmarks.filter(b => b.courseTitle !== null && b.note_id === null && b.resource_id === null)
    };
  }, [user]);

  // Search filtering
  const filterBySearch = (items) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => {
      const target = item.matched_item || {};
      return (
        item.courseTitle?.toLowerCase().includes(q) ||
        target.title?.toLowerCase().includes(q) ||
        target.subject?.toLowerCase().includes(q) ||
        target.course_code?.toLowerCase().includes(q)
      );
    });
  };

  const getCourseIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('network')) return Network;
    if (t.includes('compiler') || t.includes('software')) return Code2;
    if (t.includes('intelligence') || t.includes('machine')) return Cpu;
    if (t.includes('web')) return Globe;
    if (t.includes('data')) return Database;
    return BookOpen;
  };

  if (authLoading || !user) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-32">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Majestic Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[9px] font-black uppercase tracking-[0.3em]">
                <Bookmark size={12} strokeWidth={3} /> Archived Content
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">
                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Collection</span>
              </h1>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest max-w-[500px]">
                Your personalized repository of essential academic resources and curated study materials.
              </p>
            </div>

            {/* Premium Search */}
            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH ARCHIVES..."
                className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-blue-500/30 transition-all shadow-xl dark:shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-20">
            {/* 1. SAVED RESOURCES SECTION (Majestic Grid - Course Hub) */}
            {savedCourses.length > 0 && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-lg">
                    <BookOpen size={20} />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Saved Resources</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filterBySearch(savedCourses).map((course, idx) => {
                    const masterData = masterCourseMap[course.courseTitle] || {};
                    const Icon = getCourseIcon(course.courseTitle);
                    const slug = course.courseTitle.replace(/\s+/g, '-').toLowerCase();

                    return (
                      <div 
                        key={course.bookmark_id}
                        onClick={() => router.push(`/resources/${slug}`)}
                        className="group relative h-[300px] md:h-[360px] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-700 hover:-translate-y-1 md:hover:-translate-y-2 shadow-sm animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-[var(--background)] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center text-blue-500 shadow-xl group-hover:scale-110 transition-all duration-700">
                          <Icon size={28} strokeWidth={1.5} className="md:w-8 md:h-8" />
                        </div>

                        <div className="relative z-10 text-center space-y-3">
                          <div className="space-y-2">
                            <p className="text-[7px] md:text-[7.5px] font-black tracking-[0.2em] text-blue-500/80 uppercase px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 inline-block">
                              {masterData.dept?.split(' ')[2] || 'FACULTY'}
                            </p>
                            <div className="space-y-1">
                              <p className="text-[8px] font-black tracking-[0.2em] text-slate-500 uppercase">{masterData.code || 'SAVED'}</p>
                              <h3 className="text-[11px] md:text-[12px] font-black uppercase tracking-widest leading-relaxed max-w-[180px] mx-auto group-hover:text-blue-500 transition-colors duration-500">
                                {course.courseTitle}
                              </h3>
                            </div>
                          </div>
                        </div>

                        <div className="relative z-10 w-full flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.05]">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">
                              {masterData.count || 0} Files
                            </span>
                          </div>
                          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                            <ArrowRight size={10} className="md:w-3 md:h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 2. SAVED NOTES SECTION */}
            {savedNotes.length > 0 && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 shadow-lg">
                    <FileText size={20} />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Saved Notes</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filterBySearch(savedNotes).map((note) => (
                    <Link 
                      key={note.bookmark_id} 
                      href={`/notes/${note.note_id}`}
                      className="group bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/[0.05] rounded-[1.5rem] p-6 hover:bg-white dark:hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 flex flex-col justify-between h-[180px] shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[7px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 uppercase tracking-widest">
                            {note.matched_item?.course_code || 'STUDY'}
                          </span>
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest truncate">
                            {note.courseTitle || note.matched_item?.subject || 'GENERAL'}
                          </span>
                        </div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest leading-relaxed line-clamp-2 pr-6 group-hover:text-blue-500 transition-colors">
                          {note.matched_item?.title || 'Course Notes'}
                        </h3>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-200/50 dark:border-white/[0.05] pt-4">
                        <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          <Clock size={10} /> {note.created_at?.split(' ')[0]}
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 3. SAVED FILES SECTION */}
            {savedResources.length > 0 && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 shadow-lg">
                    <ExternalLink size={20} />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Saved Files</h2>
                </div>
                <div className="space-y-3">
                  {filterBySearch(savedResources).map((resource) => (
                    <div 
                      key={resource.bookmark_id} 
                      className="group bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-2xl p-4 md:p-5 flex items-center justify-between hover:border-blue-500/30 transition-all duration-500 shadow-sm"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-slate-400 shrink-0 group-hover:text-blue-500 transition-colors">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest truncate pr-4 group-hover:text-blue-500 transition-colors">
                            {resource.matched_item?.title || 'Resource File'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                              {resource.courseTitle || resource.matched_item?.course_code}
                            </span>
                            <div className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-white/[0.1]" />
                            <span className="text-[7px] font-bold text-blue-500/70 uppercase tracking-widest">
                              {resource.matched_item?.file_type || 'PDF'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => router.push(`/resources/${(resource.courseTitle || resource.matched_item?.subject || '').replace(/\s+/g, '-').toLowerCase()}`)}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.05] text-slate-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* EMPTY STATE */}
            {savedNotes.length === 0 && savedCourses.length === 0 && savedResources.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-white/[0.03] flex items-center justify-center text-slate-300">
                  <Bookmark size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase tracking-widest">Archive Empty</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[300px]">
                    You haven't pinned any content yet. Start exploring the library to build your archive.
                  </p>
                </div>
                <Link 
                  href="/resources" 
                  className="px-8 py-3 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20"
                >
                  Explore Library
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
