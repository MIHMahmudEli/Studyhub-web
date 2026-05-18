import { AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function Toast({ toast, closeToast }) {
  if (!toast.show) return null;

  return (
    <div className={`fixed top-24 right-6 z-[999999] transition-all duration-500 ease-in-out ${
      toast.isClosing ? 'translate-x-20 opacity-0 pointer-events-none' : 'animate-in slide-in-from-right fade-in'
    }`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-xl max-w-xs ${
        toast.type === 'error'
          ? 'bg-red-500/10 border-red-500/20 text-red-500'
          : toast.type === 'warning'
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
      }`}>
        {toast.type === 'error' ? (
          <AlertCircle size={16} className="shrink-0" />
        ) : toast.type === 'warning' ? (
          <AlertTriangle size={16} className="shrink-0" />
        ) : (
          <CheckCircle2 size={16} className="shrink-0" />
        )}
        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed flex-1">{toast.message}</p>

        <div className="relative w-6 h-6 shrink-0 flex items-center justify-center ml-1">
          <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-20" />
            <circle
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="62.8"
              strokeDashoffset="62.8"
              style={{ animation: 'toastProgress 5s linear forwards', strokeLinecap: 'round' }}
            />
          </svg>
          <button
            onClick={closeToast}
            className="absolute inset-0 flex items-center justify-center hover:scale-110 transition-transform z-10 focus:outline-none cursor-pointer"
          >
            <X size={10} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes toastProgress {
          from { stroke-dashoffset: 62.8; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
