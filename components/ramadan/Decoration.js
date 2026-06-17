'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

// Builds one long looping keyframe set containing several randomized-but-logical
// moon arcs. Each arc rises from below the horizon, crosses the sky, and sets
// below again — and between arcs the moon waits below the screen (invisible
// gap). Because it's a single infinite Web Animation driven by the document
// timeline (which advances even when the tab is hidden), returning to the tab
// shows the moon exactly where it should be — no stop, no jump.
function buildLoopKeyframes(arcs) {
  const W = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const H = typeof window !== 'undefined' ? window.innerHeight : 800;
  const N = 14;
  const belowY = 85; // vh offset from centre → safely below the screen
  const pad = 0.14;  // fraction of each slice spent off-screen (the gap)
  const frames = [];
  for (let a = 0; a < arcs; a++) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const sideX = 46 + Math.random() * 12;     // arc half-width (vw)
    const xShift = (Math.random() - 0.5) * 26; // peak shifted off-centre
    const peakY = -(16 + Math.random() * 22);  // apex height
    const sliceStart = a / arcs;
    const sliceLen = 1 / arcs;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const xvw = xShift + (-sideX + 2 * sideX * t) * dir;
      const arch = 1 - Math.pow(2 * t - 1, 2);  // 0 at ends → 1 at apex
      const yvh = belowY + (peakY - belowY) * arch;
      const offset = sliceStart + (pad / 2 + (1 - pad) * t) * sliceLen;
      const x = ((xvw / 100) * W).toFixed(1);
      const y = ((yvh / 100) * H).toFixed(1);
      frames.push({ offset: Math.min(1, +offset.toFixed(5)), transform: `translate(${x}px, ${y}px)` });
    }
  }
  frames[0].offset = 0;
  frames[frames.length - 1].offset = 1;
  return frames;
}

// Soft magenta bokeh dots (fixed positions — no per-frame work).
const BOKEH = [
  { x: 16, y: 30, s: 90, o: 0.16 }, { x: 78, y: 22, s: 120, o: 0.14 },
  { x: 40, y: 16, s: 60, o: 0.18 }, { x: 62, y: 40, s: 80, o: 0.12 },
  { x: 28, y: 48, s: 50, o: 0.16 }, { x: 88, y: 46, s: 70, o: 0.12 },
  { x: 8, y: 56, s: 60, o: 0.12 }, { x: 52, y: 26, s: 40, o: 0.2 },
];

// A small star ornament (gold geometric ball) hanging from a cord.
function Ornament({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <defs>
        <radialGradient id="ornG" cx="38%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#ornG)" />
      <g stroke="#7c2d12" strokeWidth="0.8" opacity="0.45" fill="none">
        <path d="M20 3 L20 37 M3 20 L37 20 M8 8 L32 32 M32 8 L8 32" />
        <circle cx="20" cy="20" r="8" />
      </g>
    </svg>
  );
}

// An ornate gold lantern with a warm glowing core.
function Lantern({ scale = 1 }) {
  const w = 64 * scale;
  const h = 150 * scale;
  return (
    <svg width={w} height={h} viewBox="0 0 64 150" style={{ filter: 'drop-shadow(0 0 14px rgba(245,158,11,0.45))' }}>
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="48%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <radialGradient id="flame" cx="50%" cy="48%" r="55%">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="35%" stopColor="#fb923c" />
          <stop offset="72%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
      </defs>
      {/* cord */}
      <line x1="32" y1="0" x2="32" y2="20" stroke="#a16207" strokeWidth="1.3" />
      <circle cx="32" cy="22" r="3" fill="url(#gold)" />
      {/* top cap */}
      <path d="M23 28 L41 28 L37 38 L27 38 Z" fill="url(#gold)" />
      {/* body */}
      <path d="M20 38 Q32 33 44 38 L48 92 Q32 106 16 92 Z" fill="url(#gold)" />
      {/* glowing window */}
      <path d="M25 44 Q32 40 39 44 L43 88 Q32 99 21 88 Z" fill="url(#flame)" className="animate-ramadan-flicker" />
      {/* ribs */}
      <g stroke="#7c2d12" strokeWidth="0.9" opacity="0.45">
        <line x1="32" y1="42" x2="32" y2="95" />
        <line x1="26" y1="44" x2="23" y2="91" />
        <line x1="38" y1="44" x2="41" y2="91" />
      </g>
      {/* bottom cap + tassel */}
      <path d="M25 95 L39 95 L35 104 L29 104 Z" fill="url(#gold)" />
      <line x1="32" y1="104" x2="32" y2="116" stroke="#f59e0b" strokeWidth="1.2" />
      <circle cx="32" cy="119" r="3" fill="url(#gold)" />
    </svg>
  );
}

export default function RamadanDecoration() {
  const { theme, darkThemeVariant, lightThemeVariant, preview } = useTheme();
  const variant = preview?.variant || (theme === 'dark' ? darkThemeVariant : lightThemeVariant);
  const isActive = variant === 'ramadan';
  const moonRef = useRef(null);
  const rootRef = useRef(null);

  // One infinite Web Animation containing several randomized arcs. It's driven by
  // the document timeline (advances even when the tab is hidden) and uses no
  // timers, so leaving/returning to the tab never stalls or jumps — the moon is
  // always exactly where it should be. ~15–25 min per arc → imperceptibly slow.
  useEffect(() => {
    if (!isActive) return;
    const node = moonRef.current;
    const root = rootRef.current;
    let anim = null;
    if (node && typeof node.animate === 'function') {
      const ARCS = 6;
      const perArc = 900000 + Math.random() * 600000;
      const total = ARCS * perArc;
      anim = node.animate(buildLoopKeyframes(ARCS), { duration: total, easing: 'linear', iterations: Infinity });
      // Start partway through the first arc so the moon is already in the sky on load.
      anim.currentTime = perArc * (0.35 + Math.random() * 0.3);
    }

    // Pause everything while the tab is hidden — the moon (WAAPI) and the CSS
    // animations (lantern sway, window glow) — and resume from the same spot, so
    // returning to the tab never shows an instant jump.
    const onVisibility = () => {
      const hidden = document.hidden;
      try { if (anim) { hidden ? anim.pause() : anim.play(); } } catch { /* ignore */ }
      if (root) {
        if (hidden) root.setAttribute('data-ramadan-paused', '');
        else root.removeAttribute('data-ramadan-paused');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    if (document.hidden) onVisibility();

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      try { if (anim) anim.cancel(); } catch { /* ignore */ }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }} aria-hidden="true">
      {/* Soft magenta bokeh */}
      {BOKEH.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.s}px`,
            height: `${b.s}px`,
            background: 'radial-gradient(circle, rgba(236,72,153,0.5), transparent 70%)',
            opacity: b.o,
            filter: 'blur(6px)',
          }}
        />
      ))}

      {/* Hanging decorations — left side */}
      <div className="absolute top-0 left-[5%] md:left-[8%] flex flex-col items-center animate-ramadan-sway" style={{ animationDelay: '0.4s' }}>
        <div className="w-px h-[15vh] md:h-[11vh] bg-gradient-to-b from-[#a16207]/15 to-[#fbbf24]/75" />
        <Ornament size={30} />
      </div>
      <div className="absolute top-0 left-[15%] md:left-[16%] flex flex-col items-center animate-ramadan-sway">
        <div className="w-px h-[24vh] md:h-[20vh] bg-gradient-to-b from-[#a16207]/15 to-[#fbbf24]/75" />
        <Lantern scale={1} />
      </div>

      {/* Hanging decorations — right side (mirrors the left) */}
      <div className="absolute top-0 right-[5%] md:right-[8%] flex flex-col items-center animate-ramadan-sway" style={{ animationDelay: '0.8s' }}>
        <div className="w-px h-[15vh] md:h-[11vh] bg-gradient-to-b from-[#a16207]/15 to-[#fbbf24]/75" />
        <Ornament size={30} />
      </div>
      <div className="absolute top-0 right-[15%] md:right-[16%] flex flex-col items-center animate-ramadan-sway" style={{ animationDelay: '0.2s' }}>
        <div className="w-px h-[24vh] md:h-[20vh] bg-gradient-to-b from-[#a16207]/15 to-[#fbbf24]/75" />
        <Lantern scale={1} />
      </div>

      {/* Realistic crescent moon — random, off-screen rise/set arcs (JS-driven) */}
      <div className="absolute top-1/2 left-1/2">
        <div ref={moonRef} style={{ willChange: 'transform', transform: 'translate(-130vw, 0)' }}>
          <div className="-translate-x-1/2 -translate-y-1/2">
          <svg width="58" height="58" viewBox="0 0 100 100" className="md:w-[80px] md:h-[80px]">
            <defs>
              <radialGradient id="rMoonBody" cx="36%" cy="36%" r="70%">
                <stop offset="0%" stopColor="#fffdf5" />
                <stop offset="42%" stopColor="#fde68a" />
                <stop offset="80%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#c2780a" />
              </radialGradient>
              <radialGradient id="rMoonHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(251,191,36,0.4)" />
                <stop offset="55%" stopColor="rgba(251,191,36,0.1)" />
                <stop offset="100%" stopColor="rgba(251,191,36,0)" />
              </radialGradient>
              {/* crescent = body circle minus an offset circle (transparency, no hard cutout) */}
              <mask id="rCrescent">
                <circle cx="50" cy="50" r="36" fill="#fff" />
                <circle cx="64" cy="43" r="33" fill="#000" />
              </mask>
            </defs>
            <g mask="url(#rCrescent)">
              <circle cx="50" cy="50" r="36" fill="url(#rMoonBody)" />
              {/* craters for texture */}
              <g fill="#c9881f" opacity="0.4">
                <circle cx="37" cy="40" r="5" />
                <circle cx="31" cy="57" r="3.4" />
                <circle cx="43" cy="68" r="2.6" />
                <circle cx="28" cy="48" r="2" />
                <circle cx="40" cy="32" r="2.2" />
              </g>
              {/* subtle shading toward the terminator */}
              <circle cx="60" cy="48" r="33" fill="#92400e" opacity="0.28" />
            </g>
          </svg>
          </div>
        </div>
      </div>

      {/* Pink clouds hugging the dome tops */}
      <div className="absolute bottom-[22%] md:bottom-[27%] left-[36%] w-[170px] h-[56px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(219,39,119,0.55), transparent 70%)', filter: 'blur(20px)' }} />
      <div className="absolute bottom-[24%] md:bottom-[29%] right-[34%] w-[200px] h-[64px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(190,46,118,0.5), transparent 70%)', filter: 'blur(24px)' }} />

      {/* Mosque + city skyline silhouette (modeled on the template) */}
      <div className="absolute bottom-0 left-0 right-0 h-[36vh] md:h-[46vh] max-h-[500px]">
        <svg viewBox="0 0 1200 460" preserveAspectRatio="xMidYMax slice" className="w-full h-full">
          <defs>
            <linearGradient id="win" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff4d6" />
              <stop offset="38%" stopColor="#fbbf24" />
              <stop offset="72%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#a81616" />
            </linearGradient>
            {/* A real crescent (outer disc minus an offset disc), reusable. */}
            <symbol id="crescentMoon" viewBox="0 0 22 22">
              <mask id="cmMask">
                <circle cx="11" cy="11" r="9" fill="#fff" />
                <circle cx="15" cy="9" r="8.4" fill="#000" />
              </mask>
              <rect width="22" height="22" fill="#fbbf24" mask="url(#cmMask)" />
            </symbol>

            {/* Reusable mosque silhouette for depth effect */}
            <g id="mosque-silhouette">
              {/* left minaret */}
              <rect x="402" y="220" width="26" height="210" />
              <rect x="390" y="250" width="50" height="13" rx="2" />
              <path d="M401 220 C395 212 395 198 406.6 187 C411.8 180 414 178 415 176 C416 178 418.2 180 423.4 187 C435 198 435 212 429 220 Z" />
              <rect x="412" y="156" width="6" height="22" />
              {/* right minaret */}
              <rect x="772" y="220" width="26" height="210" />
              <rect x="760" y="250" width="50" height="13" rx="2" />
              <path d="M771 220 C765 212 765 198 776.6 187 C781.8 180 784 178 785 176 C786 178 788.2 180 793.4 187 C805 198 805 212 799 220 Z" />
              <rect x="782" y="156" width="6" height="22" />
              {/* flanking onion domes */}
              <rect x="500" y="236" width="10" height="20" />
              <path d="M465 312 C451 294 451 262 482.3 238 C496.4 222 502.3 216 505 212 C507.7 216 513.6 222 527.7 238 C559 262 559 294 545 312 Z" />
              <rect x="690" y="236" width="10" height="20" />
              <path d="M655 312 C641 294 641 262 672.3 238 C686.4 222 692.3 216 695 212 C697.7 216 703.6 222 717.7 238 C749 262 749 294 735 312 Z" />
              {/* central big onion dome */}
              <rect x="594" y="146" width="12" height="22" />
              <path d="M532 305 C508 276 508 225 561.4 187 C585.3 161 595.4 151 600 145 C604.6 151 614.7 161 638.6 187 C692 225 692 276 668 305 Z" />
              {/* arcade / facade */}
              <rect x="470" y="300" width="260" height="130" rx="4" />
              <rect x="486" y="384" width="38" height="46" />
              <path d="M492 384 C485 375 485 362 497 350 C502.5 344 504.9 341 506 339 C507.1 341 509.5 344 515 350 C527 362 527 375 520 384 Z" />
              <rect x="676" y="384" width="38" height="46" />
              <path d="M682 384 C675 375 675 362 687 350 C692.5 344 694.9 341 696 339 C697.1 341 699.5 344 705 350 C717 362 717 375 710 384 Z" />
            </g>
          </defs>

          {/* ── Faint background city skyline ── */}
          <g fill="#2a0a22" opacity="0.5">
            <rect x="40" y="372" width="58" height="88" />
            <rect x="92" y="336" width="9" height="124" />
            <path d="M92 336 Q96.5 325 101 336 Z" />
            <path d="M120 460 Q162 392 204 460 Z" />
            <rect x="159" y="404" width="6" height="14" />
            <rect x="232" y="388" width="46" height="72" />
            <path d="M300 460 Q332 414 364 460 Z" />
            <path d="M858 460 Q900 396 942 460 Z" />
            <rect x="897" y="408" width="6" height="14" />
            <rect x="978" y="380" width="56" height="80" />
            <path d="M1052 460 Q1086 404 1120 460 Z" />
            <rect x="1093" y="330" width="9" height="130" />
            <path d="M1093 330 Q1097.5 319 1102 330 Z" />
            <rect x="1150" y="362" width="46" height="98" />
          </g>

          {/* ── Far background mosque silhouettes ── */}
          <g fill="#1a0620" opacity="0.25">
            {/* small mosque left */}
            <rect x="40" y="395" width="5" height="48" />
            <rect x="70" y="395" width="5" height="48" />
            <rect x="45" y="405" width="25" height="38" />
            <rect x="52" y="393" width="11" height="12" />
            <path d="M52 393 Q57.5 385 63 393 Z" />
            <rect x="42" y="370" width="1.5" height="23" />
            <rect x="71" y="370" width="1.5" height="23" />
            {/* small mosque center-left */}
            <rect x="120" y="390" width="5" height="53" />
            <rect x="155" y="390" width="5" height="53" />
            <rect x="125" y="405" width="30" height="38" />
            <rect x="133" y="392" width="14" height="13" />
            <path d="M133 392 Q140 383 147 392 Z" />
            <rect x="122" y="365" width="1.5" height="23" />
            <rect x="156" y="365" width="1.5" height="23" />
            {/* small mosque center-right */}
            <rect x="1040" y="390" width="5" height="53" />
            <rect x="1075" y="390" width="5" height="53" />
            <rect x="1045" y="405" width="30" height="38" />
            <rect x="1053" y="392" width="14" height="13" />
            <path d="M1053 392 Q1060 383 1067 392 Z" />
            <rect x="1042" y="365" width="1.5" height="23" />
            <rect x="1076" y="365" width="1.5" height="23" />
            {/* small mosque right */}
            <rect x="1115" y="395" width="5" height="48" />
            <rect x="1145" y="395" width="5" height="48" />
            <rect x="1120" y="405" width="25" height="38" />
            <rect x="1127" y="393" width="11" height="12" />
            <path d="M1127 393 Q1132.5 385 1138 393 Z" />
            <rect x="1117" y="370" width="1.5" height="23" />
            <rect x="1146" y="370" width="1.5" height="23" />
          </g>

          {/* ── Mid background mosque silhouettes ── */}
          <g fill="#100314" opacity="0.4">
            {/* mid mosque far left */}
            <rect x="55" y="405" width="8" height="56" />
            <rect x="100" y="405" width="8" height="56" />
            <rect x="63" y="412" width="37" height="49" />
            <rect x="72" y="395" width="19" height="17" />
            <path d="M72 395 Q81.5 384 91 395 Z" />
            <rect x="58" y="375" width="2.5" height="28" />
            <rect x="102" y="375" width="2.5" height="28" />
            {/* connecting ground */}
            <path d="M55 455 Q77 448 108 455 Z" />
            {/* mid mosque left */}
            <rect x="210" y="400" width="9" height="60" />
            <rect x="260" y="400" width="9" height="60" />
            <rect x="219" y="408" width="41" height="52" />
            <rect x="230" y="392" width="19" height="16" />
            <path d="M230 392 Q239.5 380 249 392 Z" />
            <rect x="213" y="370" width="3" height="28" />
            <rect x="263" y="370" width="3" height="28" />
            {/* mid mosque right */}
            <rect x="930" y="400" width="9" height="60" />
            <rect x="980" y="400" width="9" height="60" />
            <rect x="939" y="408" width="41" height="52" />
            <rect x="950" y="392" width="19" height="16" />
            <path d="M950 392 Q959.5 380 969 392 Z" />
            <rect x="933" y="370" width="3" height="28" />
            <rect x="983" y="370" width="3" height="28" />
            {/* mid mosque far right */}
            <rect x="1090" y="405" width="8" height="56" />
            <rect x="1135" y="405" width="8" height="56" />
            <rect x="1098" y="412" width="37" height="49" />
            <rect x="1107" y="395" width="19" height="17" />
            <path d="M1107 395 Q1116.5 384 1126 395 Z" />
            <rect x="1093" y="375" width="2.5" height="28" />
            <rect x="1137" y="375" width="2.5" height="28" />
            <path d="M1088 455 Q1112 448 1143 455 Z" />
          </g>

          {/* ── Near background mosque silhouettes ── */}
          <g fill="#08030a" opacity="0.6">
            {/* near left mosque */}
            <rect x="35" y="420" width="11" height="40" />
            <rect x="95" y="420" width="11" height="40" />
            <rect x="46" y="425" width="49" height="35" />
            <rect x="58" y="408" width="25" height="17" />
            <path d="M58 408 Q70.5 396 83 408 Z" />
            <rect x="38" y="390" width="4" height="28" />
            <rect x="99" y="390" width="4" height="28" />
            {/* near left-center mosque */}
            <rect x="175" y="418" width="12" height="42" />
            <rect x="235" y="418" width="12" height="42" />
            <rect x="187" y="424" width="48" height="36" />
            <rect x="200" y="406" width="22" height="18" />
            <path d="M200 406 Q211 393 222 406 Z" />
            <rect x="178" y="386" width="4.5" height="30" />
            <rect x="239" y="386" width="4.5" height="30" />
            {/* near right-center mosque */}
            <rect x="955" y="418" width="12" height="42" />
            <rect x="1015" y="418" width="12" height="42" />
            <rect x="967" y="424" width="48" height="36" />
            <rect x="980" y="406" width="22" height="18" />
            <path d="M980 406 Q991 393 1002 406 Z" />
            <rect x="958" y="386" width="4.5" height="30" />
            <rect x="1019" y="386" width="4.5" height="30" />
            {/* near right mosque */}
            <rect x="1095" y="420" width="11" height="40" />
            <rect x="1155" y="420" width="11" height="40" />
            <rect x="1106" y="425" width="49" height="35" />
            <rect x="1118" y="408" width="25" height="17" />
            <path d="M1118 408 Q1130.5 396 1143 408 Z" />
            <rect x="1098" y="390" width="4" height="28" />
            <rect x="1159" y="390" width="4" height="28" />
          </g>

          {/* ── Foreground mosque ── */}
          <g fill="#080308">
            <use href="#mosque-silhouette" />
          </g>

          {/* ── Wavy foreground ground ── */}
          <path d="M0 460 L0 430 Q150 421 300 428 Q450 435 600 426 Q750 418 900 428 Q1050 437 1200 428 L1200 460 Z" fill="#050206" />

          {/* ── Glowing windows ── */}
          <g className="animate-ramadan-flicker">
            {Array.from({ length: 6 }).map((_, i) => {
              const x = 536 + i * 22;
              return <path key={i} d={`M${x} 426 L${x} 352 Q${x + 9} 332 ${x + 18} 352 L${x + 18} 426 Z`} fill="url(#win)" />;
            })}
            {/* minaret windows */}
            <path d="M408 348 L408 312 Q415 300 422 312 L422 348 Z" fill="url(#win)" />
            <path d="M778 348 L778 312 Q785 300 792 312 L792 348 Z" fill="url(#win)" />
            {/* kiosk glows */}
            <path d="M500 426 L500 406 Q506 398 512 406 L512 426 Z" fill="url(#win)" />
            <path d="M690 426 L690 406 Q696 398 702 406 L702 426 Z" fill="url(#win)" />
          </g>

          {/* ── Gold crescent moon finials ── */}
          <g fill="#fbbf24">
            {/* central dome */}
            <path transform="translate(600 136)" d="M0,-9 A9,9 0 1,0 0,9 A7,7 0 1,1 0,-9 Z" />
            {/* a crescent moon atop each minaret (opening upward) */}
            <path transform="translate(415 145) rotate(-90) scale(1.15)" d="M0,-9 A9,9 0 1,0 0,9 A7,7 0 1,1 0,-9 Z" />
            <path transform="translate(785 145) rotate(-90) scale(1.15)" d="M0,-9 A9,9 0 1,0 0,9 A7,7 0 1,1 0,-9 Z" />
          </g>
        </svg>
      </div>
    </div>
  );
}
