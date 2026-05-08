'use client';

import { useState, useEffect } from 'react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import NoteCard from '@/components/notes/NoteCard';
import NoteSkeleton from '@/components/notes/NoteSkeleton';
import { 
  Bookmark, 
  Search, 
  Library,
  ArrowRight
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BookmarkPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        // Assuming endpoint: /bookmarks
        const response = await apiRequest('/bookmarks');
        setBookmarks(response.data || response);
      } catch (err) {
        // Mock data for development
        const mockBookmarks = [
          { 
            id: 1, 
            title: 'Advanced Web Technologies - Final Review', 
            description: 'Comprehensive guide covering React, Next.js, and modern state management patterns.',
            authorName: 'Sarah Jenkins',
            createdAt: new Date().toISOString(),
            category: 'Computer Science'
          },
          { 
            id: 2, 
            title: 'Data Structures Cheat Sheet', 
            description: 'All essential algorithms and time complexities in one document.',
            authorName: 'Marcus Chen',
            createdAt: new Date().toISOString(),
            category: 'Computer Science'
          }
        ];
        // Only set mock if we fail to fetch
        setBookmarks(mockBookmarks);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchBookmarks();
  }, [user]);

  const filteredBookmarks = bookmarks.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500 pb-20">
      <DashboardNavbar />

      <div className="pt-32 px-6">
        <div className="max-w-[1440px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full -z-10" />
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <Bookmark size={14} /> My Collection
              </div>
              <h1 className="text-4xl font-black tracking-tight">Saved Resources</h1>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-[400px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search your bookmarks..."
                className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/30 transition-all shadow-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <NoteSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          ) : filteredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {filteredBookmarks.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-24 h-24 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl flex items-center justify-center text-slate-700 mb-8 shadow-2xl">
                <Library size={48} />
              </div>
              <h3 className="text-2xl font-black mb-2">No bookmarks found</h3>
              <p className="text-slate-500 font-medium max-w-[400px] mb-10">
                You haven&apos;t saved any notes yet. Explore the study feed to build your collection.
              </p>
              <Link 
                href="/notes" 
                className="flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20"
              >
                Explore Feed <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
