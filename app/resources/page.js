'use client';

import { useEffect } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Academic Resource List
const courseList = [
  { id: 1, courseTitle: 'Computer Graphics - Course Outline' },
  { id: 2, courseTitle: 'Introduction to C Programming - Lecture Notes' },
  { id: 3, courseTitle: 'Differential Calculus and Coordinate Geometry - Course Outline' },
  { id: 4, courseTitle: 'Introduction to Artificial Intelligence - Course Outline' }
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
          {/* Classic Minimalist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {courseList.map((res) => (
              <div 
                key={res.id} 
                className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/5 flex items-center justify-center text-center h-28"
              >
                <h4 className="text-xs font-black tracking-widest uppercase leading-relaxed group-hover:text-blue-500 transition-colors">
                  {res.courseTitle}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
