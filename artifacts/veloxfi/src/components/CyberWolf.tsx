/* ─────────────────────────────────────────────────
   CyberWolf — pure SVG + CSS cyber wolf mascot
   VeloxFi dark theme: blue #2563eb / purple #7c3aed
───────────────────────────────────────────────── */
export default function CyberWolf({ className = "" }: { className?: string }) {
  return (
    <div className={`cyber-wolf-root ${className}`} aria-hidden="true">
      <style>{`
        .cyber-wolf-root {
          position: relative;
          width: 100%;
          max-width: 420px;
          filter: drop-shadow(0 0 40px rgba(37,99,235,0.25)) drop-shadow(0 0 80px rgba(124,58,237,0.15));
        }

        /* ── Breathing (whole figure) ── */
        @keyframes cw-breathe {
          0%, 100% { transform: scaleY(1) translateY(0); }
          50%       { transform: scaleY(1.012) translateY(-4px); }
        }
        .cw-body { animation: cw-breathe 3.8s ease-in-out infinite; transform-origin: center bottom; }

        /* ── Eye glow pulse ── */
        @keyframes cw-eye-l {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px #2563eb) drop-shadow(0 0 14px #2563eb); }
          50%       { opacity: 0.75; filter: drop-shadow(0 0 3px #2563eb) drop-shadow(0 0 8px #2563eb); }
        }
        @keyframes cw-eye-r {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px #7c3aed) drop-shadow(0 0 14px #7c3aed); }
          50%       { opacity: 0.75; filter: drop-shadow(0 0 3px #7c3aed) drop-shadow(0 0 8px #7c3aed); }
        }
        .cw-eye-left  { animation: cw-eye-l 2.4s ease-in-out infinite; }
        .cw-eye-right { animation: cw-eye-r 2.4s 0.6s ease-in-out infinite; }

        /* ── Hex orbit spin ── */
        @keyframes cw-hex-orbit {
          from { transform: rotate(0deg) translateX(188px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(188px) rotate(-360deg); }
        }
        @keyframes cw-hex-orbit-rev {
          from { transform: rotate(0deg) translateX(168px) rotate(0deg); }
          to   { transform: rotate(-360deg) translateX(168px) rotate(360deg); }
        }
        .cw-hex-1 { animation: cw-hex-orbit 18s linear infinite; transform-origin: 200px 248px; }
        .cw-hex-2 { animation: cw-hex-orbit 18s 6s linear infinite; transform-origin: 200px 248px; opacity: 0.6; }
        .cw-hex-3 { animation: cw-hex-orbit-rev 24s linear infinite; transform-origin: 200px 248px; opacity: 0.45; }

        /* ── Neon outline flicker ── */
        @keyframes cw-flicker {
          0%, 93%, 100% { opacity: 1; }
          95%            { opacity: 0.6; }
          97%            { opacity: 0.9; }
        }
        .cw-outline { animation: cw-flicker 7s ease-in-out infinite; }

        /* ── Scan line ── */
        @keyframes cw-scan {
          0%   { transform: translateY(-220px); opacity: 0; }
          5%   { opacity: 0.6; }
          95%  { opacity: 0.4; }
          100% { transform: translateY(220px); opacity: 0; }
        }
        .cw-scanline { animation: cw-scan 5s ease-in-out infinite 1s; }

        /* ── Particle dots ── */
        @keyframes cw-float-a {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50%       { transform: translate(6px, -12px) scale(1.3); opacity: 1; }
        }
        @keyframes cw-float-b {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50%       { transform: translate(-8px, -10px) scale(1.2); opacity: 0.9; }
        }
        .cw-dot-a { animation: cw-float-a 3.2s ease-in-out infinite; }
        .cw-dot-b { animation: cw-float-b 2.8s 0.9s ease-in-out infinite; }
        .cw-dot-c { animation: cw-float-a 3.6s 1.6s ease-in-out infinite; }
        .cw-dot-d { animation: cw-float-b 3s 0.4s ease-in-out infinite; }

        /* ── Armor plates gleam ── */
        @keyframes cw-gleam {
          0%, 80%, 100% { opacity: 0; }
          85%            { opacity: 0.5; }
          90%            { opacity: 0.15; }
        }
        .cw-gleam { animation: cw-gleam 6s ease-in-out infinite; }
        .cw-gleam2 { animation: cw-gleam 6s 2.5s ease-in-out infinite; }
      `}</style>

      <svg
        viewBox="0 0 400 500"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "auto", overflow: "visible" }}
      >
        <defs>
          {/* Glow filter — blue */}
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Glow filter — purple */}
          <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Soft edge glow for eyes */}
          <filter id="eye-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Inner outline gradient */}
          <linearGradient id="grad-outline" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb"/>
            <stop offset="100%" stopColor="#7c3aed"/>
          </linearGradient>
          {/* Body fill gradient */}
          <linearGradient id="grad-body" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#0d1525"/>
            <stop offset="60%" stopColor="#080d18"/>
            <stop offset="100%" stopColor="#050810"/>
          </linearGradient>
          {/* Fur shading */}
          <linearGradient id="grad-fur" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#131e35"/>
            <stop offset="100%" stopColor="#060b15"/>
          </linearGradient>
          {/* Ear inner gradient */}
          <linearGradient id="grad-ear" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2"/>
          </linearGradient>
          {/* Chest armor gradient */}
          <linearGradient id="grad-armor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#172040"/>
            <stop offset="100%" stopColor="#0a1020"/>
          </linearGradient>
          {/* Scanline clip */}
          <clipPath id="wolf-clip">
            <rect x="60" y="20" width="280" height="460"/>
          </clipPath>
          {/* Eye glow radial */}
          <radialGradient id="eye-l-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60a5fa"/>
            <stop offset="60%" stopColor="#2563eb"/>
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.3"/>
          </radialGradient>
          <radialGradient id="eye-r-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c084fc"/>
            <stop offset="60%" stopColor="#7c3aed"/>
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.3"/>
          </radialGradient>
        </defs>

        {/* ═══════════════════════════════════════
            ORBITING HEXAGONS (background layer)
        ═══════════════════════════════════════ */}
        <g opacity="0.25">
          <polygon className="cw-hex-1" points="200,228 208,232 208,240 200,244 192,240 192,232"
            fill="none" stroke="#2563eb" strokeWidth="1.5"/>
          <polygon className="cw-hex-2" points="200,228 208,232 208,240 200,244 192,240 192,232"
            fill="none" stroke="#7c3aed" strokeWidth="1"/>
          <polygon className="cw-hex-3" points="200,230 209,234.5 209,243.5 200,248 191,243.5 191,234.5"
            fill="none" stroke="#2563eb" strokeWidth="0.8"/>
        </g>

        {/* ═══════════════════════════════════════
            MAIN WOLF BODY (breathing group)
        ═══════════════════════════════════════ */}
        <g className="cw-body">

          {/* ── Base glow halo behind wolf ── */}
          <ellipse cx="200" cy="340" rx="130" ry="30" fill="#2563eb" opacity="0.04"/>
          <ellipse cx="200" cy="250" rx="150" ry="200" fill="url(#grad-body)" opacity="0.6"/>

          {/* ─────────────────────────
              EARS
          ───────────────────────── */}
          {/* Left ear — outer */}
          <polygon
            points="90,130 65,30 130,110"
            fill="url(#grad-fur)"
            className="cw-outline"
            stroke="url(#grad-outline)" strokeWidth="1.5"
          />
          {/* Left ear — inner neon triangle */}
          <polygon
            points="92,118 78,48 122,108"
            fill="url(#grad-ear)"
            opacity="0.7"
          />
          {/* Left ear inner lines */}
          <line x1="78" y1="50" x2="110" y2="110" stroke="#2563eb" strokeWidth="1" opacity="0.5"/>
          <line x1="90" y1="48" x2="118" y2="108" stroke="#7c3aed" strokeWidth="0.8" opacity="0.4"/>

          {/* Right ear — outer */}
          <polygon
            points="310,130 335,30 270,110"
            fill="url(#grad-fur)"
            className="cw-outline"
            stroke="url(#grad-outline)" strokeWidth="1.5"
          />
          {/* Right ear — inner */}
          <polygon
            points="308,118 322,48 278,108"
            fill="url(#grad-ear)"
            opacity="0.7"
          />
          <line x1="322" y1="50" x2="290" y2="110" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
          <line x1="310" y1="48" x2="282" y2="108" stroke="#2563eb" strokeWidth="0.8" opacity="0.4"/>

          {/* ─────────────────────────
              HEAD SILHOUETTE
          ───────────────────────── */}
          {/* Main head shape */}
          <path
            d="M 100 145
               C  75 170,  62 210,  68 250
               C  72 280,  82 300,  95 315
               C 108 330, 125 340, 145 348
               C 162 354, 180 358, 200 358
               C 220 358, 238 354, 255 348
               C 275 340, 292 330, 305 315
               C 318 300, 328 280, 332 250
               C 338 210, 325 170, 300 145
               C 278 125, 240 115, 200 115
               C 160 115, 122 125, 100 145 Z"
            fill="url(#grad-fur)"
            className="cw-outline"
            stroke="url(#grad-outline)"
            strokeWidth="1.8"
          />

          {/* ── Fur texture panels (geometric facets) ── */}
          {/* Left cheek panel */}
          <path d="M 80 195 L 118 175 L 128 230 L 88 235 Z"
            fill="#0e1928" stroke="#2563eb" strokeWidth="0.7" opacity="0.6"/>
          {/* Right cheek panel */}
          <path d="M 320 195 L 282 175 L 272 230 L 312 235 Z"
            fill="#0e1928" stroke="#7c3aed" strokeWidth="0.7" opacity="0.6"/>
          {/* Forehead center panel */}
          <path d="M 165 120 L 200 115 L 235 120 L 225 165 L 200 170 L 175 165 Z"
            fill="#0d1830" stroke="url(#grad-outline)" strokeWidth="0.8" opacity="0.5"/>
          {/* Top of nose bridge */}
          <path d="M 180 168 L 200 163 L 220 168 L 215 210 L 200 215 L 185 210 Z"
            fill="#0a1220" stroke="#2563eb" strokeWidth="0.6" opacity="0.6"/>

          {/* ─────────────────────────
              EYES
          ───────────────────────── */}
          {/* Left eye socket */}
          <ellipse cx="148" cy="195" rx="28" ry="20" fill="#040810" opacity="0.9"/>
          {/* Left eye glow halo */}
          <ellipse cx="148" cy="195" rx="22" ry="16" fill="#2563eb" opacity="0.15" filter="url(#eye-glow)"/>
          {/* Left eye iris */}
          <ellipse className="cw-eye-left" cx="148" cy="195" rx="20" ry="14"
            fill="url(#eye-l-grad)" filter="url(#eye-glow)"/>
          {/* Left pupil */}
          <ellipse cx="148" cy="195" rx="8" ry="10" fill="#020408"/>
          {/* Left highlight */}
          <ellipse cx="143" cy="190" rx="4" ry="3" fill="#93c5fd" opacity="0.9"/>
          {/* Left eye sharp lines */}
          <line x1="120" y1="195" x2="128" y2="195" stroke="#2563eb" strokeWidth="1.5" opacity="0.7"/>
          <line x1="168" y1="195" x2="178" y2="195" stroke="#2563eb" strokeWidth="1.5" opacity="0.7"/>

          {/* Right eye socket */}
          <ellipse cx="252" cy="195" rx="28" ry="20" fill="#040810" opacity="0.9"/>
          {/* Right eye glow halo */}
          <ellipse cx="252" cy="195" rx="22" ry="16" fill="#7c3aed" opacity="0.15" filter="url(#eye-glow)"/>
          {/* Right eye iris */}
          <ellipse className="cw-eye-right" cx="252" cy="195" rx="20" ry="14"
            fill="url(#eye-r-grad)" filter="url(#eye-glow)"/>
          {/* Right pupil */}
          <ellipse cx="252" cy="195" rx="8" ry="10" fill="#020408"/>
          {/* Right highlight */}
          <ellipse cx="247" cy="190" rx="4" ry="3" fill="#d8b4fe" opacity="0.9"/>
          {/* Right eye sharp lines */}
          <line x1="222" y1="195" x2="232" y2="195" stroke="#7c3aed" strokeWidth="1.5" opacity="0.7"/>
          <line x1="272" y1="195" x2="282" y2="195" stroke="#7c3aed" strokeWidth="1.5" opacity="0.7"/>

          {/* ─────────────────────────
              BROW RIDGES
          ───────────────────────── */}
          <path d="M 120 175 L 148 168 L 176 175" fill="none" stroke="#2563eb" strokeWidth="2" opacity="0.8" strokeLinecap="round"/>
          <path d="M 224 175 L 252 168 L 280 175" fill="none" stroke="#7c3aed" strokeWidth="2" opacity="0.8" strokeLinecap="round"/>

          {/* ─────────────────────────
              SNOUT / MUZZLE
          ───────────────────────── */}
          {/* Muzzle base */}
          <path
            d="M 168 240 L 200 232 L 232 240 L 238 290 L 225 315 L 200 322 L 175 315 L 162 290 Z"
            fill="#0d1828"
            stroke="url(#grad-outline)" strokeWidth="1.2"
          />
          {/* Muzzle highlight ridge */}
          <line x1="200" y1="235" x2="200" y2="310" stroke="#1d4ed8" strokeWidth="1" opacity="0.3"/>

          {/* Nose */}
          <path d="M 185 248 L 200 238 L 215 248 L 210 262 L 200 266 L 190 262 Z"
            fill="#060c18" stroke="#2563eb" strokeWidth="1" opacity="0.9"/>
          <path d="M 192 245 L 200 240 L 208 245" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.6"/>

          {/* Upper lip line */}
          <path d="M 200 268 L 190 280 M 200 268 L 210 280"
            fill="none" stroke="#1e40af" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          {/* Lower jaw / teeth suggestion */}
          <path d="M 175 310 L 186 318 L 190 308 L 200 320 L 210 308 L 214 318 L 225 310"
            fill="#0a0f1e" stroke="#2563eb" strokeWidth="1" opacity="0.6" strokeLinejoin="round"/>

          {/* ─────────────────────────
              CHEST — BATTLE ARMOR
          ───────────────────────── */}
          {/* Neck */}
          <path d="M 152 348 L 152 380 L 248 380 L 248 348"
            fill="url(#grad-fur)" stroke="url(#grad-outline)" strokeWidth="1.2" opacity="0.8"/>

          {/* Central chest plate */}
          <path
            d="M 120 378 L 145 360 L 200 355 L 255 360 L 280 378
               L 290 440 L 260 470 L 200 480 L 140 470 L 110 440 Z"
            fill="url(#grad-armor)"
            stroke="url(#grad-outline)" strokeWidth="1.8"
            className="cw-outline"
          />
          {/* Chest center diamond emblem */}
          <polygon points="200,375 218,398 200,421 182,398"
            fill="#0a1225" stroke="url(#grad-outline)" strokeWidth="1.5"/>
          <polygon points="200,382 212,398 200,414 188,398"
            fill="#2563eb" opacity="0.12"/>
          {/* Chest dividing line */}
          <line x1="200" y1="360" x2="200" y2="478" stroke="url(#grad-outline)" strokeWidth="1" opacity="0.4"/>

          {/* Left shoulder plate */}
          <path d="M 120 378 L 85 365 L 78 410 L 110 430 L 120 415 Z"
            fill="url(#grad-armor)" stroke="#2563eb" strokeWidth="1.2" opacity="0.85"/>
          <path d="M 85 368 L 95 378 L 88 392" fill="none" stroke="#2563eb" strokeWidth="0.8" opacity="0.5"/>

          {/* Right shoulder plate */}
          <path d="M 280 378 L 315 365 L 322 410 L 290 430 L 280 415 Z"
            fill="url(#grad-armor)" stroke="#7c3aed" strokeWidth="1.2" opacity="0.85"/>
          <path d="M 315 368 L 305 378 L 312 392" fill="none" stroke="#7c3aed" strokeWidth="0.8" opacity="0.5"/>

          {/* Chest hexagonal details */}
          <polygon points="168,388 175,392 175,400 168,404 161,400 161,392"
            fill="none" stroke="#2563eb" strokeWidth="1" opacity="0.6"/>
          <polygon points="232,388 239,392 239,400 232,404 225,400 225,392"
            fill="none" stroke="#7c3aed" strokeWidth="1" opacity="0.6"/>
          <polygon points="200,430 208,434 208,442 200,446 192,442 192,434"
            fill="none" stroke="url(#grad-outline)" strokeWidth="1.2" opacity="0.5"/>

          {/* Circuit line details on chest */}
          <path d="M 145 405 L 160 405 L 160 415 L 168 415"
            fill="none" stroke="#2563eb" strokeWidth="0.8" opacity="0.4" strokeLinecap="square"/>
          <path d="M 255 405 L 240 405 L 240 415 L 232 415"
            fill="none" stroke="#7c3aed" strokeWidth="0.8" opacity="0.4" strokeLinecap="square"/>
          <path d="M 148 450 L 158 450 L 162 440"
            fill="none" stroke="#2563eb" strokeWidth="0.8" opacity="0.35" strokeLinecap="round"/>
          <path d="M 252 450 L 242 450 L 238 440"
            fill="none" stroke="#7c3aed" strokeWidth="0.8" opacity="0.35" strokeLinecap="round"/>

          {/* Armor gleam (animated) */}
          <path d="M 135 390 L 155 375 L 160 380 L 140 395 Z"
            fill="white" className="cw-gleam" opacity="0"/>
          <path d="M 260 390 L 240 375 L 235 380 L 255 395 Z"
            fill="white" className="cw-gleam2" opacity="0"/>

        </g>{/* end cw-body */}

        {/* ═══════════════════════════════════════
            SCAN LINE (overlays everything)
        ═══════════════════════════════════════ */}
        <g clipPath="url(#wolf-clip)">
          <rect className="cw-scanline" x="60" y="248" width="280" height="2"
            fill="url(#grad-outline)" opacity="0"/>
        </g>

        {/* ═══════════════════════════════════════
            FLOATING PARTICLES
        ═══════════════════════════════════════ */}
        <circle className="cw-dot-a" cx="70"  cy="200" r="2.5" fill="#2563eb" opacity="0.7"/>
        <circle className="cw-dot-b" cx="55"  cy="280" r="2"   fill="#7c3aed" opacity="0.6"/>
        <circle className="cw-dot-c" cx="345" cy="220" r="2.5" fill="#7c3aed" opacity="0.7"/>
        <circle className="cw-dot-d" cx="355" cy="310" r="2"   fill="#2563eb" opacity="0.5"/>
        <circle className="cw-dot-a" cx="100" cy="460" r="1.8" fill="#60a5fa" opacity="0.4"/>
        <circle className="cw-dot-b" cx="310" cy="455" r="1.8" fill="#a78bfa" opacity="0.4"/>

        {/* ═══════════════════════════════════════
            OUTER NEON OUTLINE (traced separately for glow)
        ═══════════════════════════════════════ */}
        <path
          className="cw-outline"
          d="M 100 145
             C  75 170,  62 210,  68 250
             C  72 280,  82 300,  95 315
             C 108 330, 125 340, 145 348
             C 162 354, 180 358, 200 358
             C 220 358, 238 354, 255 348
             C 275 340, 292 330, 305 315
             C 318 300, 328 280, 332 250
             C 338 210, 325 170, 300 145
             C 278 125, 240 115, 200 115
             C 160 115, 122 125, 100 145 Z"
          fill="none"
          stroke="url(#grad-outline)"
          strokeWidth="2.5"
          filter="url(#glow-blue)"
          opacity="0.6"
        />
        <polygon points="90,130 65,30 130,110" fill="none"
          stroke="url(#grad-outline)" strokeWidth="1.5" filter="url(#glow-blue)" opacity="0.5"/>
        <polygon points="310,130 335,30 270,110" fill="none"
          stroke="url(#grad-outline)" strokeWidth="1.5" filter="url(#glow-blue)" opacity="0.5"/>

      </svg>
    </div>
  );
}
