import { ChevronUp } from 'lucide-react';

export default function ScrollToTopButton({ showScrollBtn, onScrollToTop }) {
  return (
    <button
      onClick={onScrollToTop}
      aria-label="Scroll to top"
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 200,
        width: 44,
        height: 44,
        background: 'rgba(37,99,235,0.9)',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease',
        opacity: showScrollBtn ? 1 : 0,
        transform: showScrollBtn ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: showScrollBtn ? 'auto' : 'none',
        boxShadow: '0 4px 24px rgba(37,99,235,0.3)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(29,78,216,0.95)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.9)'; e.currentTarget.style.transform = showScrollBtn ? 'translateY(0)' : 'translateY(12px)'; }}
    >
      <ChevronUp size={18} />
    </button>
  );
}
