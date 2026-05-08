'use client';

import { useEffect } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  Download,
  ExternalLink,
  BookMarked
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Academic Resource List
const courseList = [
  {
    id: 1,
    courseTitle: 'Computer Graphics - Course Outline',
    dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
    faculty: 'fst',
    type: 'PDF',
    size: '1.2 MB',
    downloads: 124
  },
  {
    id: 2,
    courseTitle: 'Introduction to C Programming - Lecture Notes',
    dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
    faculty: 'fst',
    type: 'PDF',
    size: '1.8 MB',
    downloads: 250
  },
  {
    id: 3,
    courseTitle: 'Differential Calculus and Coordinate Geometry - Course Outline',
    dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
    faculty: 'fst',
    type: 'PDF',
    size: '1.5 MB',
    downloads: 180
  },
  {
    id: 4,
    courseTitle: 'Introduction to Artificial Intelligence - Course Outline',
    dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
    faculty: 'fst',
    type: 'PDF',
    size: '2.0 MB',
    downloads: 150
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

      <div className="pt-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Direct Resource Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {courseList.map((res) => (
              <div 
                key={res.id} 
                className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.05] flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500">
                    <BookMarked size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{res.dept}</p>
                    <h4 className="text-xl font-black tracking-tight mb-2 group-hover:text-blue-500 transition-colors line-clamp-1">{res.courseTitle}</h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>{res.type}</span>
                      <div className="w-1 h-1 bg-slate-700 rounded-full" />
                      <span>{res.size}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-3.5 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-90">
                    <Download size={20} />
                  </button>
                  <button className="p-3.5 rounded-2xl bg-white/[0.05] text-slate-500 hover:bg-white/[0.1] transition-all active:scale-90">
                    <ExternalLink size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
