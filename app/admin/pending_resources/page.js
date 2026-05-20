'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Toast from '@/components/ui/Toast';
import Skeleton from '@/components/ui/Skeleton';
import { apiRequest } from '@/lib/api';
import PendingModerationCard from '@/components/admin/PendingModerationCard';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminPanel from '@/components/admin/AdminPanel';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Layers, 
  FileText, 
  ExternalLink,
  Sparkles,
  AlertCircle,
  X
} from 'lucide-react';

export default function PendingResourcesPage() {
  const { user, loading: authLoading, tokenReady } = useAuth();
  const router = useRouter();

  const [pendingResources, setPendingResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isClosing: false });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => closeToast(), 5000);
  };
  
  const closeToast = () => {
    setToast(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => setToast(prev => ({ ...prev, show: false, isClosing: false })), 500);
  };

  // Role verification (Admin & Moderator)
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (user.role !== 'admin' && user.role !== 'moderator') {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  // Fetch pending resources
  useEffect(() => {
    if (tokenReady && user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchPendingResources();
    }
  }, [tokenReady, user]);

  const fetchPendingResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest('/resources/admin/pending');
      setPendingResources(res || []);
    } catch (err) {
      console.error('Failed to fetch pending resources:', err);
      setError(err.message || 'Failed to load pending resources.');
      setPendingResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceStatus = async (id, newStatus) => {
    try {
      await apiRequest(`/resources/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      showToast(`Resource #${id} has been ${newStatus} successfully.`, 'success');
      setPendingResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(`Failed to update resource status:`, err);
      showToast(err.message || `Failed to update resource status.`, 'error');
    }
  };

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32 transition-colors duration-500">
      <DashboardNavbar />

      <div className="pt-24 md:pt-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">
          
          {/* Reusable Admin Header */}
          <AdminHeader
            title="Pending"
            titleHighlight="Resources"
            titleHighlightGradient="from-amber-500 via-orange-500 to-yellow-500"
            description="Review and moderate uploaded academic resources before publishing them to the course library."
            glowColor="bg-amber-500/10"
            statsIcon={Layers}
            statsTitle="Moderation Queue"
            statsValue={`${pendingResources.length} Awaiting Approval`}
            statsColorClass="text-amber-500 bg-amber-500/10 border-amber-500/20"
          />

          {/* Reusable Admin Panel Container */}
          <AdminPanel
            panelIcon={Sparkles}
            panelIconClass="text-amber-500 animate-pulse"
            panelTitle="Resources Moderation Queue"
            panelSubtitle="Review uploaded academic materials before publishing them to the course library."
            badgeText={`Queue: ${pendingResources.length}`}
            badgeColorClass="bg-amber-500/10 text-amber-500 border-amber-500/20"
            loading={loading}
            error={error}
            isEmpty={pendingResources.length === 0}
            emptyIcon={CheckCircle2}
            emptyTitle="All Caught Up!"
            emptyDescription="There are no pending resources awaiting moderation at this time."
          >
            {/* Desktop Table View (Hidden on mobile below md) */}
            <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/[0.1]">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="pb-4 pl-4 whitespace-nowrap">Resource Title & Subject</th>
                    <th className="pb-4 whitespace-nowrap">Uploader</th>
                    <th className="pb-4 whitespace-nowrap">File Type</th>
                    <th className="pb-4 text-right pr-4 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)] text-xs font-bold">
                  {pendingResources.map((res) => (
                    <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 sm:py-5 pl-4 max-w-[250px] sm:max-w-[300px]">
                        <p className="font-black text-sm text-[var(--foreground)] truncate">{res.title}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 truncate">{res.subject || res.course_code || 'RESOURCE'} • {res.term?.toUpperCase() || 'MID'}</p>
                      </td>
                      <td className="py-4 sm:py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {res.uploader?.profile_pic ? (
                            <img src={res.uploader.profile_pic} alt="" className="w-6 h-6 rounded-full object-cover border border-[var(--card-border)] shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                              {res.uploader?.name?.[0] || 'U'}
                            </div>
                          )}
                          <span className="text-slate-300 truncate max-w-[120px]">{res.uploader?.name || `User #${res.uploader_id}`}</span>
                        </div>
                      </td>
                      <td className="py-4 sm:py-5 whitespace-nowrap">
                        <a 
                          href={res.file_path} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 transition-colors uppercase text-[10px] tracking-widest font-black shrink-0"
                        >
                          {res.file_type || 'PDF'} <ExternalLink size={12} />
                        </a>
                      </td>
                      <td className="py-4 sm:py-5 text-right pr-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 sm:gap-2">
                          <button 
                            onClick={() => handleResourceStatus(res.id, 'approved')}
                            className="px-3.5 py-2 sm:px-4 sm:py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl border border-emerald-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button 
                            onClick={() => handleResourceStatus(res.id, 'rejected')}
                            className="px-3.5 py-2 sm:px-4 sm:py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all uppercase text-[10px] tracking-widest font-black flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Hidden on desktop md and above) */}
            <div className="block md:hidden space-y-4">
              {pendingResources.map((res) => (
                <PendingModerationCard
                  key={res.id}
                  item={res}
                  type="resource"
                  onApprove={handleResourceStatus}
                  onReject={handleResourceStatus}
                />
              ))}
            </div>
          </AdminPanel>

        </div>
      </div>

      {/* ─── TOAST NOTIFICATION CONTAINER ─────────────────────────────────────── */}
      <Toast toast={toast} closeToast={closeToast} />
    </main>
  );
}
