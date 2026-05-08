'use client';

import { useState, useEffect } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { 
  Layers, 
  Search, 
  Filter, 
  Download,
  ExternalLink,
  BookMarked,
  LayoutGrid,
  Library,
  ChevronRight
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const faculties = [
  { id: 'all', name: 'All Faculties', icon: Library },
  { id: 'fst', name: 'Science & Technology', icon: LayoutGrid },
  { id: 'fe', name: 'Engineering', icon: LayoutGrid },
  { id: 'fass', name: 'Arts & Social Sciences', icon: LayoutGrid },
  { id: 'fba', name: 'Business Administration', icon: LayoutGrid }
];

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFaculty, setActiveFaculty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const response = await apiRequest('/resources');
        setResources(response.data || response);
      } catch (err) {
        // Mock data for development
        const mockResources = [
          { 
            id: 1, 
            title: 'Computer Graphics - Course Outline', 
            dept: 'FACULTY OF SCIENCE & TECHNOLOGY',
            faculty: 'fst',
            type: 'PDF',
            size: '1.2 MB',
            downloads: 124
          },
          { 
            id: 2, 
            title: 'Calculus II Problem Set', 
            dept: 'FACULTY OF ENGINEERING',
            faculty: 'fe',
            type: 'DOCX',
            size: '850 KB',
            downloads: 89
          },
          { 
            id: 3, 
            title: 'Business Communication Guide', 
            dept: 'FACULTY OF BUSINESS ADMINISTRATION',
            faculty: 'fba',
            type: 'PDF',
            size: '2.4 MB',
            downloads: 215
          },
          { 
            id: 4, 
            title: 'Linguistics Foundations', 
            dept: 'FACULTY OF ARTS AND SOCIAL SCIENCES',
            faculty: 'fass',
            type: 'PDF',
            size: '1.8 MB',
            downloads: 56
          },
          { 
            id: 5, 
            title: 'Digital Logic Design Lab Manual', 
            dept: 'FACULTY OF ENGINEERING',
            faculty: 'fe',
            type: 'PDF',
            size: '3.1 MB',
            downloads: 142
          }
        ];
        setResources(mockResources);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchResources();
  }, [user]);

  const filteredResources = resources.filter(res => {
    const matchesFaculty = activeFaculty === 'all' || res.faculty === activeFaculty;
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.dept.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFaculty && matchesSearch;
  });

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
      <DashboardNavbar />

      <div className="pt-32 px-6">
        <div className="max-w-[1440px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <Layers size={14} /> Global Repository
                </div>
                <h1 className="text-4xl font-black tracking-tight">Academic Resources</h1>
              </div>

              <div className="relative w-full md:w-[450px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by title, department, or keyword..."
                  className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/30 transition-all shadow-xl backdrop-blur-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Sidebar Filter */}
            <div className="w-full lg:w-[300px] space-y-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 px-4">Browse by Faculty</h3>
              {faculties.map((fac) => {
                const Icon = fac.icon;
                return (
                  <button
                    key={fac.id}
                    onClick={() => setActiveFaculty(fac.id)}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group ${
                      activeFaculty === fac.id 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-transparent text-slate-500 hover:bg-white/[0.03] hover:text-[var(--foreground)]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">{fac.name}</span>
                    </div>
                    <ChevronRight size={16} className={`transition-transform duration-300 ${activeFaculty === fac.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                  </button>
                );
              })}
            </div>

            {/* Resource Grid */}
            <div className="flex-1 w-full">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-40 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {filteredResources.map((res) => (
                    <div 
                      key={res.id} 
                      className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden flex items-center justify-between"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.05] flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500">
                          <BookMarked size={28} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{res.dept}</p>
                          <h4 className="text-lg font-black tracking-tight mb-2 group-hover:text-blue-500 transition-colors line-clamp-1">{res.title}</h4>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span>{res.type}</span>
                            <div className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span>{res.size}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-3 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-lg hover:shadow-blue-500/20 active:scale-90">
                          <Download size={18} />
                        </button>
                        <button className="p-3 rounded-xl bg-white/[0.05] text-slate-500 hover:bg-white/[0.1] transition-all active:scale-90">
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-40 text-center">
                  <div className="w-20 h-20 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl flex items-center justify-center text-slate-700 mb-8 shadow-2xl">
                    <Filter size={32} />
                  </div>
                  <h3 className="text-xl font-black mb-2">No resources found</h3>
                  <p className="text-slate-500 text-sm font-medium max-w-[300px]">
                    Try adjusting your search or faculty filters to find what you&apos;re looking for.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
