'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { apiRequest } from '@/lib/api';
import { supabase } from '@/lib/supabase';

// Modular Sub-Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RoutineBanner from '@/components/dashboard/RoutineBanner';
import QuickShortcuts from '@/components/dashboard/QuickShortcuts';
import MyNotesTable from '@/components/dashboard/MyNotesTable';

export default function StudentDashboard() {
  const { user, loading: authLoading, checkUser } = useAuth();
  const router = useRouter();
  
  const [myNotes, setMyNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [stats, setStats] = useState({
    points: 0,
    uploads: 0,
    downloads: 0,
    rank: '--'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoadingNotes(true);
      // 1. Fetch user's uploaded notes
      const notesData = await apiRequest('/notes/my-notes');
      setMyNotes(notesData);

      // 2. Fetch leaderboard to determine current rank
      const leaderboardData = await apiRequest('/users/leaderboard');
      const rankIndex = leaderboardData.findIndex(u => u.id === user.id);
      const userRank = rankIndex !== -1 ? `#${rankIndex + 1}` : 'Rank #--';

      // 3. Compute stats
      const totalDownloads = notesData.reduce((acc, note) => acc + (note.downloads || 0), 0);
      
      setStats({
        points: user.points || 0,
        uploads: notesData.length,
        downloads: totalDownloads,
        rank: userRank
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!confirm('Are you absolutely sure you want to delete this note? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeletingId(id);

      // 1. Delete file from Supabase storage first to save space
      const noteToDelete = myNotes.find(n => n.id === id);
      if (noteToDelete && noteToDelete.file_path) {
        try {
          const fileName = noteToDelete.file_path.split('/notes/').pop();
          if (fileName) {
            await supabase.storage
              .from('notes')
              .remove([fileName]);
          }
        } catch (err) {
          console.warn('Failed to delete file from Supabase storage:', err);
        }
      }

      // 2. Call the backend DELETE API
      await apiRequest(`/notes/${id}`, { method: 'DELETE' });
      
      // Update local state
      setMyNotes(prev => prev.filter(n => n.id !== id));
      // Re-trigger auth context update to refresh points
      await checkUser();
      // Re-fetch calculations
      setStats(prev => ({
        ...prev,
        uploads: prev.uploads - 1
      }));
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-12">
          {/* Welcome Header */}
          <DashboardHeader user={user} />

          {/* Premium Overview Cards */}
          <StatsGrid stats={stats} loading={loadingNotes} />

          {/* Premium Routine Generator Banner */}
          <RoutineBanner />

          {/* Quick Shortcuts Hub */}
          <QuickShortcuts />

          {/* Uploaded Notes Table Section */}
          <MyNotesTable 
            notes={myNotes} 
            loading={loadingNotes} 
            deletingId={deletingId} 
            onDelete={handleDeleteNote} 
          />
        </div>
      </div>
    </main>
  );
}
