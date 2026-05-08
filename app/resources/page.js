'use client';

import { useEffect } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  FileText,
  Layers
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Academic Course & Resource Registry
const courseList = [
  {
    id: 1,
    courseTitle: 'Computer Graphics - Course Outline',
    dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
    faculty: 'fst',
    resources: [
      { id: 1, title: 'Course Outline PDF' },
      { id: 2, title: 'Lecture Notes - Intro' }
    ]
  },
  {
    id: 2,
    courseTitle: 'Introduction to C Programming - Lecture Notes',
    dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
    faculty: 'fst',
    resources: [
      { id: 1, title: 'Loops & Conditionals' },
      { id: 2, title: 'Pointers Guide' }
    ]
  },
  {
    id: 3,
    courseTitle: 'Differential Calculus and Coordinate Geometry - Course Outline',
    dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
    faculty: 'fst',
    resources: [
      { id: 1, title: 'Derivatives Worksheet' },
      { id: 2, title: 'Limit Theory' }
    ]
  },
  {
    id: 4,
    courseTitle: 'Introduction to Artificial Intelligence - Course Outline',
    dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
    faculty: 'fst',
    resources: [
      { id: 1, title: 'Neural Networks 101' },
      { id: 2, title: 'AI Ethics Paper' }
    ]
  }
];

export default function ResourcesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
      <DashboardNavbar />

      <div className="pt-40 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Classic Grid with Resource Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {courseList.map((res) => (
              <div 
                key={res.id} 
                className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-8 hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/5 flex flex-col items-center justify-between text-center h-64"
              >
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.05] flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-500/5">
                    <FileText size={28} />
                  </div>
                  <h4 className="text-[11px] font-black tracking-[0.18em] uppercase leading-relaxed group-hover:text-blue-500 transition-colors max-w-[180px]">
                    {res.courseTitle}
                  </h4>
                </div>

                {/* Resource Counter Bottom */}
                <div className="mt-6 pt-4 border-t border-white/[0.05] w-full flex items-center justify-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-blue-500/20">
                    <Layers size={10} />
                    {res.resources?.length || 0} Resources
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
