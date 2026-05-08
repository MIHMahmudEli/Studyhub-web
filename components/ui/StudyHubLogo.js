export default function StudyHubLogo({ size = 36, textSize = 18 }) {
  return (
    <div className="flex items-center gap-2.5 no-underline">
      {/* Icon — the graduation cap from favicon.svg */}
      <div 
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          padding: Math.round(size * 0.14),
        }}
        className="flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(59,130,246,0.4)] bg-gradient-to-br from-blue-500 to-purple-600"
      >
        <img
          src="/favicon.svg"
          alt="StudyHub icon"
          style={{ width: '60%', height: '60%' }}
          className="block"
        />
      </div>

      {/* Wordmark */}
      <span 
        style={{ fontSize: textSize }}
        className="font-black text-[#f0f4ff] tracking-tighter leading-none"
      >
        Study<span className="text-blue-400">Hub</span>
      </span>
    </div>
  );
}
