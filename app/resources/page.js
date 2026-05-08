'use client';

import { useEffect, useMemo } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  FileText,
  Layers
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { courseList } from '@/lib/data/resourceData';

export default function ResourcesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  // Virtual Grouping: Consolidate flat resource list into unique Courses
  const uniqueCourses = useMemo(() => {
    const groups = {};
    courseList.forEach(item => {
      if (!groups[item.courseTitle]) {
        groups[item.courseTitle] = {
          title: item.courseTitle,
          code: item.course_code,
          dept: item.dept,
          resourceCount: 0,
          slug: item.courseTitle.replace(/\s+/g, '-').toLowerCase()
        };
      }
      groups[item.courseTitle].resourceCount += 1;
    });
    return Object.values(groups);
  }, []);

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
      <DashboardNavbar />

      <div className="pt-40 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Grouped Course Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {uniqueCourses.map((course) => (
              <div 
                key={course.title} 
                onClick={() => router.push(`/resources/${course.slug}`)}
                className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-8 hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/5 flex flex-col items-center justify-between text-center h-64"
              >
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.05] flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-500/5">
                    <FileText size={28} />
                  </div>
                  <h4 className="text-[11px] font-black tracking-[0.18em] uppercase leading-relaxed group-hover:text-blue-500 transition-colors max-w-[180px]">
                    {course.title}
                  </h4>
                  {course.code && (
                    <p className="text-[9px] font-bold text-slate-500 mt-2 tracking-widest">{course.code}</p>
                  )}
                </div>

                {/* Dynamic Resource Counter */}
                <div className="mt-6 pt-4 border-t border-white/[0.05] w-full flex items-center justify-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-blue-500/20">
                    <Layers size={10} />
                    {course.resourceCount} Resources
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
