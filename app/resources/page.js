'use client';

import { useEffect } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  FileText
} from 'lucide-react';
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
          {/* Classic Minimalist Grid with Taller Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {courseList.map((res) => (
              <div 
                key={res.id} 
                className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/5 flex flex-col items-center justify-center text-center h-56"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.05] flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-500/5">
                  <FileText size={28} />
                </div>
                <h4 className="text-[11px] font-black tracking-[0.18em] uppercase leading-relaxed group-hover:text-blue-500 transition-colors max-w-[180px]">
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
