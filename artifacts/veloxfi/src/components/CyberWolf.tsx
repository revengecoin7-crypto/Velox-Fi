/* ─────────────────────────────────────────────────
   CyberWolf v2 — actual wolf face, pure SVG + CSS
   VeloxFi: #2563eb blue / #7c3aed purple
───────────────────────────────────────────────── */
export default function CyberWolf({ className = "" }: { className?: string }) {
  return (
    <div className={`cw2-root ${className}`} aria-hidden="true">
      <style>{`
        .cw2-root {
          position: relative;
          width: 100%;
          max-width: 460px;
        }

        /* ── Breathing ── */
        @keyframes cw2-breathe {
          0%,100% { transform: scaleY(1) translateY(0px); }
          50%      { transform: scaleY(1.015) translateY(-5px); }
        }
        .cw2-body {
          animation: cw2-breathe 4s ease-in-out infinite;
          transform-origin: center 90%;
        }

        /* ── Blue eye glow ── */
        @keyframes cw2-eye-b {
          0%,100% { filter: drop-shadow(0 0 8px #2563eb) drop-shadow(0 0 20px #3b82f6); opacity:1; }
          45%      { filter: drop-shadow(0 0 3px #2563eb) drop-shadow(0 0 8px #3b82f6); opacity:0.75; }
        }
        /* ── Purple eye glow ── */
        @keyframes cw2-eye-p {
          0%,100% { filter: drop-shadow(0 0 8px #7c3aed) drop-shadow(0 0 20px #a855f7); opacity:1; }
          45%      { filter: drop-shadow(0 0 3px #7c3aed) drop-shadow(0 0 8px #a855f7); opacity:0.75; }
        }
        .cw2-eye-l { animation: cw2-eye-b 2.6s ease-in-out infinite; }
        .cw2-eye-r { animation: cw2-eye-p 2.6s 0.7s ease-in-out infinite; }

        /* ── Outer neon halo pulse ── */
        @keyframes cw2-halo {
          0%,100% { opacity:0.18; }
          50%      { opacity:0.08; }
        }
        .cw2-halo { animation: cw2-halo 3.5s ease-in-out infinite; }

        /* ── Neon outline flicker ── */
        @keyframes cw2-flicker {
          0%,91%,100% { opacity:1; }
          93%          { opacity:0.55; }
          96%          { opacity:0.85; }
        }
        .cw2-neon { animation: cw2-flicker 9s ease-in-out infinite; }

        /* ── Fur strand shimmer ── */
        @keyframes cw2-fur {
          0%,100% { opacity:0.18; }
          50%      { opacity:0.35; }
        }
        .cw2-fur { animation: cw2-fur 4s ease-in-out infinite; }
        .cw2-fur2 { animation: cw2-fur 4s 1.3s ease-in-out infinite; }
        .cw2-fur3 { animation: cw2-fur 4s 2.6s ease-in-out infinite; }

        /* ── Floating particles ── */
        @keyframes cw2-float {
          0%,100% { transform:translate(0,0) scale(1); opacity:0.7; }
          50%      { transform:translate(5px,-10px) scale(1.4); opacity:1; }
        }
        @keyframes cw2-float2 {
          0%,100% { transform:translate(0,0) scale(1); opacity:0.5; }
          50%      { transform:translate(-6px,-9px) scale(1.2); opacity:0.9; }
        }
        .cw2-p1 { animation: cw2-float  3s ease-in-out infinite; }
        .cw2-p2 { animation: cw2-float2 3.4s 0.8s ease-in-out infinite; }
        .cw2-p3 { animation: cw2-float  2.8s 1.5s ease-in-out infinite; }
        .cw2-p4 { animation: cw2-float2 3.2s 0.3s ease-in-out infinite; }

        /* ── Scanline ── */
        @keyframes cw2-scan {
          0%   { transform:translateY(-240px); opacity:0; }
          6%   { opacity:0.5; }
          94%  { opacity:0.3; }
          100% { transform:translateY(240px); opacity:0; }
        }
        .cw2-scan { animation: cw2-scan 5.5s ease-in-out infinite 1.5s; }

        /* ── Nose glint ── */
        @keyframes cw2-glint {
          0%,85%,100% { opacity:0; }
          88%          { opacity:0.8; }
          92%          { opacity:0.2; }
        }
        .cw2-glint { animation: cw2-glint 5s ease-in-out infinite; }
      `}</style>

      <svg
        viewBox="0 0 400 520"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "auto", overflow: "visible" }}
      >
        <defs>
          {/* ── Gradients ── */}
          <linearGradient id="g-outline" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb"/>
            <stop offset="100%" stopColor="#7c3aed"/>
          </linearGradient>
          <linearGradient id="g-head" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%"   stopColor="#111d36"/>
            <stop offset="45%"  stopColor="#0c1628"/>
            <stop offset="100%" stopColor="#070c18"/>
          </linearGradient>
          <linearGradient id="g-muzzle" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%"   stopColor="#182540"/>
            <stop offset="100%" stopColor="#0d1828"/>
          </linearGradient>
          <linearGradient id="g-ear-l" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.15"/>
          </linearGradient>
          <linearGradient id="g-ear-r" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.15"/>
          </linearGradient>
          <radialGradient id="g-eye-l" cx="40%" cy="35%" r="60%">
            <stop offset="0%"   stopColor="#93c5fd"/>
            <stop offset="35%"  stopColor="#2563eb"/>
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.4"/>
          </radialGradient>
          <radialGradient id="g-eye-r" cx="40%" cy="35%" r="60%">
            <stop offset="0%"   stopColor="#d8b4fe"/>
            <stop offset="35%"  stopColor="#7c3aed"/>
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.4"/>
          </radialGradient>
          <radialGradient id="g-halo" cx="50%" cy="42%" r="50%">
            <stop offset="0%"   stopColor="#2563eb" stopOpacity="0.3"/>
            <stop offset="60%"  stopColor="#7c3aed" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="g-nose" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#1e3a8a"/>
            <stop offset="100%" stopColor="#040810"/>
          </radialGradient>

          {/* ── Glow filters ── */}
          <filter id="f-eye" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="f-outline" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="f-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* ── Clip ── */}
          <clipPath id="cw2-clip">
            <rect x="30" y="0" width="340" height="520"/>
          </clipPath>
        </defs>

        {/* ═══ BACKGROUND HALO ═══ */}
        <ellipse className="cw2-halo" cx="200" cy="280" rx="175" ry="220" fill="url(#g-halo)"/>

        {/* ═══ BREATHING GROUP ═══ */}
        <g className="cw2-body">

          {/* ──────────────────────────────────
              EARS  (tall, fierce, pointed)
          ────────────────────────────────── */}
          {/* Left ear — dark base */}
          <path
            d="M 72,190 L 28,12 L 155,125 Z"
            fill="url(#g-head)"
            stroke="url(#g-outline)" strokeWidth="2"
            className="cw2-neon"
          />
          {/* Left ear — neon inner fill */}
          <path
            d="M 84,178 L 50,28 L 145,118 Z"
            fill="url(#g-ear-l)"
          />
          {/* Left ear — interior fur lines */}
          <line x1="52" y1="35" x2="120" y2="120" stroke="#2563eb" strokeWidth="1.2" opacity="0.5"/>
          <line x1="64" y1="28" x2="132" y2="116" stroke="#60a5fa" strokeWidth="0.7" opacity="0.35"/>
          <line x1="76" y1="26" x2="140" y2="115" stroke="#2563eb" strokeWidth="0.6" opacity="0.25"/>

          {/* Right ear — dark base */}
          <path
            d="M 328,190 L 372,12 L 245,125 Z"
            fill="url(#g-head)"
            stroke="url(#g-outline)" strokeWidth="2"
            className="cw2-neon"
          />
          {/* Right ear — neon inner fill */}
          <path
            d="M 316,178 L 350,28 L 255,118 Z"
            fill="url(#g-ear-r)"
          />
          {/* Right ear — interior fur lines */}
          <line x1="348" y1="35" x2="280" y2="120" stroke="#7c3aed" strokeWidth="1.2" opacity="0.5"/>
          <line x1="336" y1="28" x2="268" y2="116" stroke="#a855f7" strokeWidth="0.7" opacity="0.35"/>
          <line x1="324" y1="26" x2="260" y2="115" stroke="#7c3aed" strokeWidth="0.6" opacity="0.25"/>

          {/* ──────────────────────────────────
              HEAD  (wide cheeks, strong jaw)
          ────────────────────────────────── */}
          <path
            d="M 72,190
               C 38,210 28,260 32,308
               C 36,356 60,392 95,418
               C 125,440 162,452 200,452
               C 238,452 275,440 305,418
               C 340,392 364,356 368,308
               C 372,260 362,210 328,190
               C 305,175 255,158 200,156
               C 145,158 95,175 72,190 Z"
            fill="url(#g-head)"
            stroke="url(#g-outline)" strokeWidth="2.2"
            className="cw2-neon"
          />

          {/* ── Fur texture: layered dark panels ── */}
          {/* Forehead centre stripe */}
          <path
            d="M 178,158 L 200,153 L 222,158 L 216,210 L 200,215 L 184,210 Z"
            fill="#0d1932" stroke="#2563eb" strokeWidth="0.7" opacity="0.5"
          />
          {/* Left cheek fur panel */}
          <path d="M 40,240 L 88,220 L 100,280 L 52,295 Z"
            fill="#0c1828" stroke="#2563eb" strokeWidth="0.6" opacity="0.45"/>
          {/* Right cheek fur panel */}
          <path d="M 360,240 L 312,220 L 300,280 L 348,295 Z"
            fill="#0c1828" stroke="#7c3aed" strokeWidth="0.6" opacity="0.45"/>
          {/* Left lower cheek */}
          <path d="M 40,310 L 80,295 L 92,345 L 52,358 Z"
            fill="#0a1422" stroke="#2563eb" strokeWidth="0.5" opacity="0.4"/>
          {/* Right lower cheek */}
          <path d="M 360,310 L 320,295 L 308,345 L 348,358 Z"
            fill="#0a1422" stroke="#7c3aed" strokeWidth="0.5" opacity="0.4"/>

          {/* ── Fur strand lines (shimmer) ── */}
          <g className="cw2-fur" stroke="#2563eb" strokeWidth="1" strokeLinecap="round" opacity="0.18">
            <line x1="42" y1="250" x2="72" y2="238"/>
            <line x1="38" y1="270" x2="68" y2="260"/>
            <line x1="42" y1="290" x2="74" y2="282"/>
            <line x1="48" y1="310" x2="78" y2="304"/>
            <line x1="55" y1="330" x2="84" y2="326"/>
          </g>
          <g className="cw2-fur2" stroke="#7c3aed" strokeWidth="1" strokeLinecap="round" opacity="0.18">
            <line x1="358" y1="250" x2="328" y2="238"/>
            <line x1="362" y1="270" x2="332" y2="260"/>
            <line x1="358" y1="290" x2="326" y2="282"/>
            <line x1="352" y1="310" x2="322" y2="304"/>
            <line x1="345" y1="330" x2="316" y2="326"/>
          </g>
          <g className="cw2-fur3" stroke="#60a5fa" strokeWidth="0.8" strokeLinecap="round" opacity="0.12">
            <line x1="158" y1="158" x2="162" y2="178"/>
            <line x1="175" y1="155" x2="178" y2="175"/>
            <line x1="192" y1="153" x2="194" y2="172"/>
            <line x1="208" y1="153" x2="206" y2="172"/>
            <line x1="225" y1="155" x2="222" y2="175"/>
            <line x1="242" y1="158" x2="238" y2="178"/>
          </g>

          {/* ──────────────────────────────────
              BROW RIDGES  (fierce, angular)
          ────────────────────────────────── */}
          {/* Left brow — heavy angular ridge */}
          <path
            d="M 72,192 L 110,172 L 148,178 L 152,185 L 114,181 L 76,200 Z"
            fill="#0a1525" stroke="#2563eb" strokeWidth="1"
          />
          {/* Left brow neon edge */}
          <path d="M 75,194 L 112,173 L 150,180"
            fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"
            className="cw2-neon" filter="url(#f-soft)"
          />
          {/* Right brow */}
          <path
            d="M 328,192 L 290,172 L 252,178 L 248,185 L 286,181 L 324,200 Z"
            fill="#0a1525" stroke="#7c3aed" strokeWidth="1"
          />
          <path d="M 325,194 L 288,173 L 250,180"
            fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"
            className="cw2-neon" filter="url(#f-soft)"
          />

          {/* ──────────────────────────────────
              EYES  (fierce almond, slanted)
          ────────────────────────────────── */}
          {/* LEFT EYE */}
          {/* Outer shadow socket */}
          <ellipse cx="132" cy="208" rx="34" ry="22" fill="#040a14" transform="rotate(-12,132,208)"/>
          {/* Eye white/sclera (very dark) */}
          <ellipse cx="132" cy="208" rx="30" ry="18" fill="#08101e" transform="rotate(-12,132,208)"/>
          {/* Iris */}
          <ellipse className="cw2-eye-l" cx="132" cy="208" rx="26" ry="15"
            fill="url(#g-eye-l)" transform="rotate(-12,132,208)" filter="url(#f-eye)"/>
          {/* Pupil (vertical slit — wolf!) */}
          <ellipse cx="132" cy="208" rx="7" ry="14" fill="#02040a" transform="rotate(-12,132,208)"/>
          {/* Highlight */}
          <ellipse cx="124" cy="201" rx="5" ry="4" fill="#bfdbfe" opacity="0.95" transform="rotate(-12,124,201)"/>
          <ellipse cx="140" cy="213" rx="2.5" ry="2" fill="#bfdbfe" opacity="0.4" transform="rotate(-12,140,213)"/>
          {/* Eye lid lines */}
          <path d="M 98,212 C 110,195 150,195 165,210" fill="none" stroke="#1e40af" strokeWidth="1.5" opacity="0.7"/>
          <path d="M 100,216 C 112,228 148,226 164,214" fill="none" stroke="#1e40af" strokeWidth="1" opacity="0.5"/>

          {/* RIGHT EYE */}
          <ellipse cx="268" cy="208" rx="34" ry="22" fill="#040a14" transform="rotate(12,268,208)"/>
          <ellipse cx="268" cy="208" rx="30" ry="18" fill="#08101e" transform="rotate(12,268,208)"/>
          <ellipse className="cw2-eye-r" cx="268" cy="208" rx="26" ry="15"
            fill="url(#g-eye-r)" transform="rotate(12,268,208)" filter="url(#f-eye)"/>
          {/* Pupil */}
          <ellipse cx="268" cy="208" rx="7" ry="14" fill="#02040a" transform="rotate(12,268,208)"/>
          {/* Highlights */}
          <ellipse cx="260" cy="201" rx="5" ry="4" fill="#f3e8ff" opacity="0.95" transform="rotate(12,260,201)"/>
          <ellipse cx="276" cy="213" rx="2.5" ry="2" fill="#f3e8ff" opacity="0.4" transform="rotate(12,276,213)"/>
          {/* Eye lid lines */}
          <path d="M 235,210 C 250,193 290,193 302,210" fill="none" stroke="#5b21b6" strokeWidth="1.5" opacity="0.7"/>
          <path d="M 236,215 C 252,228 288,226 300,214" fill="none" stroke="#5b21b6" strokeWidth="1" opacity="0.5"/>

          {/* Eye glow accent lines */}
          <line x1="62"  y1="208" x2="80"  y2="208" stroke="#2563eb" strokeWidth="1.5" opacity="0.55" strokeLinecap="round"/>
          <line x1="338" y1="208" x2="320" y2="208" stroke="#7c3aed" strokeWidth="1.5" opacity="0.55" strokeLinecap="round"/>

          {/* ──────────────────────────────────
              NOSE BRIDGE  (between eyes)
          ────────────────────────────────── */}
          <path d="M 160,222 L 176,230 L 200,235 L 224,230 L 240,222"
            fill="none" stroke="#1e3a8a" strokeWidth="1" opacity="0.4"/>

          {/* ──────────────────────────────────
              MUZZLE  (prominent wolf snout)
          ────────────────────────────────── */}
          {/* Muzzle outer shape — wide at top, rounded at bottom */}
          <path
            d="M 148,270
               C 135,270 124,278 120,292
               C 116,308 118,330 124,348
               C 130,364 148,382 170,392
               C 182,398 191,400 200,400
               C 209,400 218,398 230,392
               C 252,382 270,364 276,348
               C 282,330 284,308 280,292
               C 276,278 265,270 252,270
               C 234,264 218,260 200,260
               C 182,260 166,264 148,270 Z"
            fill="url(#g-muzzle)"
            stroke="url(#g-outline)" strokeWidth="1.5"
            opacity="0.95"
          />

          {/* Muzzle fur texture dots */}
          <circle cx="160" cy="288" r="1.5" fill="#1e3a8a" opacity="0.4"/>
          <circle cx="170" cy="282" r="1.5" fill="#1e3a8a" opacity="0.35"/>
          <circle cx="152" cy="298" r="1.5" fill="#1e3a8a" opacity="0.35"/>
          <circle cx="240" cy="288" r="1.5" fill="#4c1d95" opacity="0.4"/>
          <circle cx="230" cy="282" r="1.5" fill="#4c1d95" opacity="0.35"/>
          <circle cx="248" cy="298" r="1.5" fill="#4c1d95" opacity="0.35"/>

          {/* Muzzle dividing line */}
          <line x1="200" y1="265" x2="200" y2="395"
            stroke="url(#g-outline)" strokeWidth="0.8" opacity="0.25"/>

          {/* ──────────────────────────────────
              NOSE  (wolf-shaped — wide, flat)
          ────────────────────────────────── */}
          {/* Nose base */}
          <path
            d="M 168,285
               C 175,275 190,270 200,270
               C 210,270 225,275 232,285
               C 238,293 236,305 228,310
               C 220,315 210,316 200,316
               C 190,316 180,315 172,310
               C 164,305 162,293 168,285 Z"
            fill="url(#g-nose)"
            stroke="#2563eb" strokeWidth="1.5"
            className="cw2-neon"
          />
          {/* Nostril left */}
          <ellipse cx="183" cy="302" rx="10" ry="7" fill="#020408"
            transform="rotate(-15,183,302)"/>
          {/* Nostril right */}
          <ellipse cx="217" cy="302" rx="10" ry="7" fill="#020408"
            transform="rotate(15,217,302)"/>
          {/* Nose bridge ridge */}
          <path d="M 192,276 C 196,271 204,271 208,276"
            fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6"/>
          {/* Nose glint */}
          <ellipse className="cw2-glint" cx="185" cy="282" rx="5" ry="3"
            fill="white" opacity="0" transform="rotate(-10,185,282)"/>

          {/* ──────────────────────────────────
              UPPER LIP  (wolf V-shape)
          ────────────────────────────────── */}
          <path
            d="M 172,316 C 182,326 192,330 200,330 C 208,330 218,326 228,316"
            fill="none" stroke="url(#g-outline)" strokeWidth="1.8" strokeLinecap="round"
          />
          {/* Philtrum line */}
          <line x1="200" y1="316" x2="200" y2="332"
            stroke="#1e40af" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>

          {/* ──────────────────────────────────
              LOWER JAW / TEETH HINT
          ────────────────────────────────── */}
          <path
            d="M 150,385 C 160,400 178,410 200,412 C 222,410 240,400 250,385"
            fill="none" stroke="url(#g-outline)" strokeWidth="1.2" opacity="0.6"
          />
          {/* Tooth tips (subtle) */}
          <path d="M 182,385 L 186,396 L 191,385 M 200,386 L 200,398 M 209,385 L 214,396 L 218,385"
            fill="none" stroke="#1e3a8a" strokeWidth="1.2" strokeLinejoin="round" opacity="0.5"/>

          {/* ──────────────────────────────────
              NECK / COLLAR
          ────────────────────────────────── */}
          <path
            d="M 148,448 L 145,475 L 200,485 L 255,475 L 252,448"
            fill="url(#g-head)" stroke="url(#g-outline)" strokeWidth="1.2" opacity="0.8"
          />
          {/* Collar hexagon detail */}
          <polygon points="200,458 210,463 210,473 200,478 190,473 190,463"
            fill="none" stroke="url(#g-outline)" strokeWidth="1.5" opacity="0.6"/>
          {/* Tech lines on collar */}
          <line x1="150" y1="462" x2="188" y2="462" stroke="#2563eb" strokeWidth="0.8" opacity="0.35" strokeLinecap="round"/>
          <line x1="250" y1="462" x2="212" y2="462" stroke="#7c3aed" strokeWidth="0.8" opacity="0.35" strokeLinecap="round"/>

        </g>{/* end cw2-body */}

        {/* ═══ SCAN LINE ═══ */}
        <g clipPath="url(#cw2-clip)">
          <rect className="cw2-scan" x="30" y="260" width="340" height="1.5"
            fill="url(#g-outline)" opacity="0"/>
        </g>

        {/* ═══ OUTER NEON GLOW TRACES ═══ */}
        {/* Head outline glow (layered on top for bloom) */}
        <path className="cw2-neon"
          d="M 72,190
             C 38,210 28,260 32,308
             C 36,356 60,392 95,418
             C 125,440 162,452 200,452
             C 238,452 275,440 305,418
             C 340,392 364,356 368,308
             C 372,260 362,210 328,190
             C 305,175 255,158 200,156
             C 145,158 95,175 72,190 Z"
          fill="none"
          stroke="url(#g-outline)"
          strokeWidth="2.5"
          filter="url(#f-outline)"
          opacity="0.45"
        />
        {/* Ear glow traces */}
        <path className="cw2-neon"
          d="M 72,190 L 28,12 L 155,125"
          fill="none" stroke="url(#g-outline)" strokeWidth="2"
          filter="url(#f-outline)" opacity="0.4"
        />
        <path className="cw2-neon"
          d="M 328,190 L 372,12 L 245,125"
          fill="none" stroke="url(#g-outline)" strokeWidth="2"
          filter="url(#f-outline)" opacity="0.4"
        />

        {/* ═══ FLOATING PARTICLES ═══ */}
        <circle className="cw2-p1" cx="22"  cy="220" r="2.5" fill="#2563eb"/>
        <circle className="cw2-p2" cx="18"  cy="310" r="2"   fill="#7c3aed"/>
        <circle className="cw2-p3" cx="378" cy="240" r="2.5" fill="#7c3aed"/>
        <circle className="cw2-p4" cx="382" cy="335" r="2"   fill="#2563eb"/>
        <circle className="cw2-p1" cx="45"  cy="410" r="1.8" fill="#60a5fa" style={{animationDelay:"1.2s"}}/>
        <circle className="cw2-p2" cx="355" cy="420" r="1.8" fill="#a78bfa" style={{animationDelay:"0.5s"}}/>

      </svg>

      {/* ── UNIT-1 label ── */}
      <div style={{
        marginTop: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}>
        <span style={{
          display: "inline-block",
          width: "8px", height: "8px",
          borderRadius: "50%",
          background: "#34d399",
          boxShadow: "0 0 8px #34d399",
          animation: "cw2-halo 2s ease-in-out infinite",
          flexShrink: 0,
        }}/>
        <span style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "11px",
          letterSpacing: "0.2em",
          color: "#60a5fa",
          opacity: 0.85,
        }}>
          UNIT-1 ONLINE
        </span>
        <span style={{
          display: "inline-block",
          width: "8px", height: "8px",
          borderRadius: "50%",
          background: "#34d399",
          boxShadow: "0 0 8px #34d399",
          animation: "cw2-halo 2s 1s ease-in-out infinite",
          flexShrink: 0,
        }}/>
      </div>
    </div>
  );
}
