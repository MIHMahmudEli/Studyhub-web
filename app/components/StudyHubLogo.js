// Shared logo component — uses the favicon.svg icon + "StudyHub" wordmark
// size: controls the icon box size (default 36)
export default function StudyHubLogo({ size = 36, textSize = 18 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
      {/* Icon — the graduation cap from favicon.svg */}
      <div style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        borderRadius: Math.round(size * 0.28),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
        flexShrink: 0,
        padding: Math.round(size * 0.14),
      }}>
        <img
          src="/favicon.svg"
          alt="StudyHub icon"
          width={size * 0.6}
          height={size * 0.6}
          style={{ display: 'block' }}
        />
      </div>

      {/* Wordmark */}
      <span style={{
        fontSize: textSize,
        fontWeight: 800,
        color: '#f0f4ff',
        letterSpacing: '-0.03em',
        fontFamily: "'Outfit', 'Manrope', sans-serif",
        lineHeight: 1,
      }}>
        Study<span style={{ color: '#60a5fa' }}>Hub</span>
      </span>
    </div>
  );
}
