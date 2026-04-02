/* ─────────────────────────────────────────────────
   CyberWolf v3 — fierce angular battle wolf
   Sharp geometry, no round shapes, proper wolf anatomy
───────────────────────────────────────────────── */
export default function CyberWolf({ className = "" }: { className?: string }) {
  return (
    <div className={`cw3-wrap ${className}`} aria-hidden="true">
      <style>{`
        /* ── Breathing ── */
        @keyframes cw3-breath {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-7px); }
        }
        .cw3-body { animation: cw3-breath 4.2s ease-in-out infinite; }

        /* ── Left eye (blue) pulse ── */
        @keyframes cw3-eyeL {
          0%,100% { fill-opacity:1; filter:drop-shadow(0 0 10px #2563eb) drop-shadow(0 0 25px #3b82f6); }
          48%      { fill-opacity:0.6; filter:drop-shadow(0 0 4px #2563eb); }
        }
        /* ── Right eye (purple) pulse ── */
        @keyframes cw3-eyeR {
          0%,100% { fill-opacity:1; filter:drop-shadow(0 0 10px #7c3aed) drop-shadow(0 0 25px #a855f7); }
          48%      { fill-opacity:0.6; filter:drop-shadow(0 0 4px #7c3aed); }
        }
        .cw3-eyeL { animation: cw3-eyeL 2.8s ease-in-out infinite; }
        .cw3-eyeR { animation: cw3-eyeR 2.8s 0.9s ease-in-out infinite; }

        /* ── Outline neon flicker ── */
        @keyframes cw3-flicker {
          0%,88%,100% { opacity:1; }
          90%          { opacity:0.45; }
          94%          { opacity:0.9; }
        }
        .cw3-glow { animation: cw3-flicker 8s ease-in-out infinite; }

        /* ── Ambient halo ── */
        @keyframes cw3-halo {
          0%,100% { opacity:0.12; }
          50%      { opacity:0.06; }
        }
        .cw3-halo { animation: cw3-halo 3.8s ease-in-out infinite; }

        /* ── Particles ── */
        @keyframes cw3-floatA {
          0%,100% { transform:translate(0,0); opacity:0.7; }
          50%      { transform:translate(5px,-11px); opacity:1; }
        }
        @keyframes cw3-floatB {
          0%,100% { transform:translate(0,0); opacity:0.5; }
          50%      { transform:translate(-6px,-9px); opacity:0.95; }
        }
        .cw3-p1 { animation: cw3-floatA 3.1s ease-in-out infinite; }
        .cw3-p2 { animation: cw3-floatB 3.5s 0.7s ease-in-out infinite; }
        .cw3-p3 { animation: cw3-floatA 2.9s 1.4s ease-in-out infinite; }
        .cw3-p4 { animation: cw3-floatB 3.3s 0.3s ease-in-out infinite; }

        /* ── Scan line ── */
        @keyframes cw3-scan {
          0%   { transform:translateY(-300px); opacity:0; }
          5%   { opacity:0.55; }
          95%  { opacity:0.3; }
          100% { transform:translateY(300px); opacity:0; }
        }
        .cw3-scan { animation: cw3-scan 6s ease-in-out infinite 2s; }

        /* ── Status dot ── */
        @keyframes cw3-dot {
          0%,100% { opacity:1; box-shadow:0 0 6px #34d399,0 0 14px #34d399; }
          50%      { opacity:0.6; box-shadow:0 0 2px #34d399; }
        }
        .cw3-status-dot {
          display:inline-block; width:8px; height:8px;
          border-radius:50%; background:#34d399;
          animation: cw3-dot 2.2s ease-in-out infinite;
        }
        .cw3-status-dot2 {
          display:inline-block; width:8px; height:8px;
          border-radius:50%; background:#34d399;
          animation: cw3-dot 2.2s 1.1s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 500 590"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width:"100%", height:"auto", overflow:"visible" }}
      >
        <defs>
          <linearGradient id="cw3-grad-outline" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#2563eb"/>
            <stop offset="100%" stopColor="#7c3aed"/>
          </linearGradient>
          <linearGradient id="cw3-skull" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%"   stopColor="#0f1e38"/>
            <stop offset="40%"  stopColor="#0b1628"/>
            <stop offset="100%" stopColor="#060d1a"/>
          </linearGradient>
          <linearGradient id="cw3-muzzle-fill" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%"   stopColor="#14223a"/>
            <stop offset="100%" stopColor="#091220"/>
          </linearGradient>
          <linearGradient id="cw3-ear-L" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%"   stopColor="#1d3461" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#2563eb"  stopOpacity="0.2"/>
          </linearGradient>
          <linearGradient id="cw3-ear-R" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor="#3b1f7a" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#7c3aed"  stopOpacity="0.2"/>
          </linearGradient>
          <radialGradient id="cw3-eyeGradL" cx="38%" cy="32%" r="65%">
            <stop offset="0%"   stopColor="#bfdbfe"/>
            <stop offset="30%"  stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.3"/>
          </radialGradient>
          <radialGradient id="cw3-eyeGradR" cx="38%" cy="32%" r="65%">
            <stop offset="0%"   stopColor="#ede9fe"/>
            <stop offset="30%"  stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.3"/>
          </radialGradient>
          <radialGradient id="cw3-nose-fill" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#1e3a8a"/>
            <stop offset="100%" stopColor="#030610"/>
          </radialGradient>
          <radialGradient id="cw3-halo-fill" cx="50%" cy="45%" r="50%">
            <stop offset="0%"   stopColor="#2563eb" stopOpacity="0.25"/>
            <stop offset="55%"  stopColor="#7c3aed" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#000"    stopOpacity="0"/>
          </radialGradient>

          <filter id="cw3-bloom" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="cw3-glow-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="cw3-eye-bloom" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="7" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          <clipPath id="cw3-clip">
            <rect x="20" y="0" width="460" height="590"/>
          </clipPath>
        </defs>

        {/* ── Ambient halo ── */}
        <ellipse className="cw3-halo" cx="250" cy="340" rx="190" ry="230"
          fill="url(#cw3-halo-fill)"/>

        {/* ════════════════════════════════════
            ALL ANIMATED PARTS
        ════════════════════════════════════ */}
        <g className="cw3-body">

          {/* ════════════════════
              LEFT EAR
              Tall sharp triangle — base wide, peak high
          ════════════════════ */}
          {/* Ear outer dark shell */}
          <polygon
            points="95,185  42,8  192,158"
            fill="#0a1525"
            stroke="url(#cw3-grad-outline)" strokeWidth="2"
            className="cw3-glow"
          />
          {/* Ear inner neon triangle (smaller, inset) */}
          <polygon
            points="108,176  62,26  178,152"
            fill="url(#cw3-ear-L)"
          />
          {/* Ear edge highlight lines */}
          <line x1="62"  y1="28"  x2="118" y2="170" stroke="#2563eb" strokeWidth="1.4" opacity="0.6"/>
          <line x1="75"  y1="22"  x2="130" y2="165" stroke="#60a5fa" strokeWidth="0.8" opacity="0.4"/>
          <line x1="90"  y1="18"  x2="148" y2="160" stroke="#2563eb" strokeWidth="0.6" opacity="0.25"/>
          {/* Ear fur direction lines */}
          <line x1="115" y1="175" x2="98"  y2="100" stroke="#1d4ed8" strokeWidth="1" opacity="0.35" strokeLinecap="round"/>
          <line x1="130" y1="170" x2="115" y2="90"  stroke="#1d4ed8" strokeWidth="0.8" opacity="0.25" strokeLinecap="round"/>

          {/* ════════════════════
              RIGHT EAR
          ════════════════════ */}
          <polygon
            points="405,185  458,8  308,158"
            fill="#0a1525"
            stroke="url(#cw3-grad-outline)" strokeWidth="2"
            className="cw3-glow"
          />
          <polygon
            points="392,176  438,26  322,152"
            fill="url(#cw3-ear-R)"
          />
          <line x1="438" y1="28"  x2="382" y2="170" stroke="#7c3aed" strokeWidth="1.4" opacity="0.6"/>
          <line x1="425" y1="22"  x2="370" y2="165" stroke="#a855f7" strokeWidth="0.8" opacity="0.4"/>
          <line x1="410" y1="18"  x2="352" y2="160" stroke="#7c3aed" strokeWidth="0.6" opacity="0.25"/>
          <line x1="385" y1="175" x2="402" y2="100" stroke="#5b21b6" strokeWidth="1" opacity="0.35" strokeLinecap="round"/>
          <line x1="370" y1="170" x2="385" y2="90"  stroke="#5b21b6" strokeWidth="0.8" opacity="0.25" strokeLinecap="round"/>

          {/* ════════════════════
              SKULL
              Angular diamond / pentagonal shape
              Widest at cheekbones, narrows top and bottom
          ════════════════════ */}
          {/*
            Points (clockwise from top):
            top-center forehead: 250,118
            left-of-forehead: 160,148
            left-ear-base: 95,185
            left-cheek (widest): 38,305
            lower-left-jaw: 105,435
            chin-left: 178,490
            chin-right: 322,490
            lower-right-jaw: 395,435
            right-cheek: 462,305
            right-ear-base: 405,185
            right-of-forehead: 340,148
          */}
          <polygon
            points="
              250,118
              160,148  95,185  38,305  105,435  178,490
              322,490  395,435  462,305  405,185  340,148
            "
            fill="url(#cw3-skull)"
            stroke="url(#cw3-grad-outline)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="cw3-glow"
          />

          {/* ── Skull facet / fur panels ── */}
          {/* Left side facets */}
          <polygon points="95,185  38,305  115,270  125,195"
            fill="#0c1830" stroke="#2563eb" strokeWidth="0.7" opacity="0.5"/>
          <polygon points="38,305  105,435  138,380  115,270"
            fill="#091525" stroke="#2563eb" strokeWidth="0.6" opacity="0.4"/>
          {/* Right side facets */}
          <polygon points="405,185  462,305  385,270  375,195"
            fill="#0c1830" stroke="#7c3aed" strokeWidth="0.7" opacity="0.5"/>
          <polygon points="462,305  395,435  362,380  385,270"
            fill="#091525" stroke="#7c3aed" strokeWidth="0.6" opacity="0.4"/>
          {/* Forehead center panel */}
          <polygon points="250,118  195,152  218,200  250,210  282,200  305,152"
            fill="#0d1f3a" stroke="url(#cw3-grad-outline)" strokeWidth="0.8" opacity="0.5"/>

          {/* ── Fur direction strokes ── */}
          {/* Left cheek fur */}
          <g stroke="#1d4ed8" strokeWidth="1.2" strokeLinecap="round" opacity="0.22">
            <line x1="44"  y1="280" x2="88"  y2="265"/>
            <line x1="40"  y1="300" x2="85"  y2="288"/>
            <line x1="43"  y1="320" x2="88"  y2="310"/>
            <line x1="50"  y1="340" x2="94"  y2="334"/>
            <line x1="62"  y1="360" x2="104" y2="356"/>
            <line x1="78"  y1="380" x2="118" y2="378"/>
          </g>
          {/* Right cheek fur */}
          <g stroke="#6d28d9" strokeWidth="1.2" strokeLinecap="round" opacity="0.22">
            <line x1="456" y1="280" x2="412" y2="265"/>
            <line x1="460" y1="300" x2="415" y2="288"/>
            <line x1="457" y1="320" x2="412" y2="310"/>
            <line x1="450" y1="340" x2="406" y2="334"/>
            <line x1="438" y1="360" x2="396" y2="356"/>
            <line x1="422" y1="380" x2="382" y2="378"/>
          </g>
          {/* Forehead fur */}
          <g stroke="#2563eb" strokeWidth="0.9" strokeLinecap="round" opacity="0.18">
            <line x1="215" y1="120" x2="216" y2="148"/>
            <line x1="230" y1="118" x2="231" y2="145"/>
            <line x1="250" y1="118" x2="250" y2="144"/>
            <line x1="270" y1="118" x2="269" y2="145"/>
            <line x1="285" y1="120" x2="284" y2="148"/>
          </g>

          {/* ════════════════════
              BROW RIDGES
              Heavy angular ridges — cast shadow down onto eyes
              Inner corners LOWEST = fierce angry expression
          ════════════════════ */}
          {/* Left brow — shape */}
          <polygon
            points="88,222  140,196  196,210  200,228  144,218  92,240"
            fill="#09152a"
            stroke="#2563eb" strokeWidth="1.2"
          />
          {/* Left brow neon top edge */}
          <polyline
            points="90,224  142,198  196,212"
            fill="none"
            stroke="#2563eb" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round"
            className="cw3-glow"
            filter="url(#cw3-glow-soft)"
          />
          {/* Right brow */}
          <polygon
            points="412,222  360,196  304,210  300,228  356,218  408,240"
            fill="#09152a"
            stroke="#7c3aed" strokeWidth="1.2"
          />
          <polyline
            points="410,224  358,198  304,212"
            fill="none"
            stroke="#7c3aed" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round"
            className="cw3-glow"
            filter="url(#cw3-glow-soft)"
          />

          {/* ════════════════════
              LEFT EYE
              Fierce narrow almond — inner corner LOW, outer corner HIGH
          ════════════════════ */}
          {/* Eye socket dark pit */}
          <polygon points="92,248  144,222  200,234  205,256  152,272  92,260"
            fill="#030710"/>
          {/* Iris (fills most of socket) */}
          <polygon className="cw3-eyeL"
            points="96,250  146,226  198,238  202,254  150,268  96,258"
            fill="url(#cw3-eyeGradL)"
            filter="url(#cw3-eye-bloom)"
          />
          {/* Vertical slit pupil */}
          <ellipse cx="149" cy="249" rx="9" ry="21"
            fill="#01030a"
            transform="rotate(-8,149,249)"
          />
          {/* Eye shine */}
          <ellipse cx="136" cy="238" rx="6" ry="4"
            fill="#dbeafe" opacity="0.9"
            transform="rotate(-8,136,238)"
          />
          <ellipse cx="162" cy="256" rx="3" ry="2.5"
            fill="#93c5fd" opacity="0.5"
          />
          {/* Outer lower lid line */}
          <polyline points="94,258  148,270  204,254"
            fill="none" stroke="#1e3a8a" strokeWidth="1.2" opacity="0.6"/>

          {/* ════════════════════
              RIGHT EYE
          ════════════════════ */}
          <polygon points="408,248  356,222  300,234  295,256  348,272  408,260"
            fill="#030710"/>
          <polygon className="cw3-eyeR"
            points="404,250  354,226  302,238  298,254  350,268  404,258"
            fill="url(#cw3-eyeGradR)"
            filter="url(#cw3-eye-bloom)"
          />
          <ellipse cx="351" cy="249" rx="9" ry="21"
            fill="#01030a"
            transform="rotate(8,351,249)"
          />
          <ellipse cx="364" cy="238" rx="6" ry="4"
            fill="#ede9fe" opacity="0.9"
            transform="rotate(8,364,238)"
          />
          <ellipse cx="338" cy="256" rx="3" ry="2.5"
            fill="#c4b5fd" opacity="0.5"
          />
          <polyline points="406,258  352,270  296,254"
            fill="none" stroke="#4c1d95" strokeWidth="1.2" opacity="0.6"/>

          {/* Eye accent lines extending outward */}
          <line x1="30"  y1="250" x2="84"  y2="250"
            stroke="#2563eb" strokeWidth="1.8" opacity="0.5" strokeLinecap="round"/>
          <line x1="470" y1="250" x2="416" y2="250"
            stroke="#7c3aed" strokeWidth="1.8" opacity="0.5" strokeLinecap="round"/>

          {/* ════════════════════
              NOSE BRIDGE
              Central ridge between eyes, down to muzzle
          ════════════════════ */}
          <polygon
            points="210,258  250,248  290,258  278,318  250,328  222,318"
            fill="#0d1e38"
            stroke="url(#cw3-grad-outline)" strokeWidth="0.8" opacity="0.5"
          />

          {/* ════════════════════
              MUZZLE
              Distinct protruding shape, angular hexagon
              Occupies lower 45% of face
          ════════════════════ */}
          <polygon
            points="
              155,332  250,312  345,332
              362,400  338,452  250,472  162,452  138,400
            "
            fill="url(#cw3-muzzle-fill)"
            stroke="url(#cw3-grad-outline)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Muzzle center ridge */}
          <line x1="250" y1="315" x2="250" y2="468"
            stroke="url(#cw3-grad-outline)" strokeWidth="1" opacity="0.25"/>

          {/* Muzzle side shading */}
          <polygon points="155,332  210,332  200,400  138,400"
            fill="#091525" opacity="0.6"/>
          <polygon points="345,332  290,332  300,400  362,400"
            fill="#091525" opacity="0.6"/>

          {/* Whisker dots */}
          <circle cx="172" cy="362" r="2.5" fill="#1e40af" opacity="0.5"/>
          <circle cx="162" cy="380" r="2.5" fill="#1e40af" opacity="0.4"/>
          <circle cx="168" cy="396" r="2"   fill="#1e40af" opacity="0.35"/>
          <circle cx="328" cy="362" r="2.5" fill="#4c1d95" opacity="0.5"/>
          <circle cx="338" cy="380" r="2.5" fill="#4c1d95" opacity="0.4"/>
          <circle cx="332" cy="396" r="2"   fill="#4c1d95" opacity="0.35"/>

          {/* ════════════════════
              NOSE  (wolf-wide, flat, two nostrils)
          ════════════════════ */}
          {/* Nose pad */}
          <path
            d="M 205,320 C 218,308 240,304 250,304 C 260,304 282,308 295,320
               C 304,330 302,344 290,350 L 250,354 L 210,350
               C 198,344 196,330 205,320 Z"
            fill="url(#cw3-nose-fill)"
            stroke="#2563eb" strokeWidth="1.8"
            className="cw3-glow"
          />
          {/* Left nostril */}
          <ellipse cx="232" cy="338" rx="13" ry="9"
            fill="#01030a"
            transform="rotate(-12,232,338)"
          />
          {/* Right nostril */}
          <ellipse cx="268" cy="338" rx="13" ry="9"
            fill="#01030a"
            transform="rotate(12,268,338)"
          />
          {/* Nose top bridge */}
          <path d="M 218,315 C 232,308 268,308 282,315"
            fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.55"/>
          {/* Nose tip glint */}
          <ellipse cx="234" cy="320" rx="5" ry="3.5"
            fill="white" opacity="0.12"
            transform="rotate(-10,234,320)"
          />

          {/* ════════════════════
              UPPER LIP  (wolf V)
          ════════════════════ */}
          <polyline
            points="205,352  228,368  250,374  272,368  295,352"
            fill="none"
            stroke="url(#cw3-grad-outline)" strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round"
          />
          {/* Philtrum */}
          <line x1="250" y1="354" x2="250" y2="376"
            stroke="#1d4ed8" strokeWidth="1.5" opacity="0.6" strokeLinecap="round"/>

          {/* ════════════════════
              JAW / LOWER MUZZLE
          ════════════════════ */}
          {/* Lower lip / chin fur */}
          <polygon
            points="162,452  250,472  338,452  322,490  250,508  178,490"
            fill="#09142a"
            stroke="url(#cw3-grad-outline)" strokeWidth="1.2" strokeLinejoin="round"
          />

          {/* Chin detail line */}
          <polyline
            points="198,488  250,502  302,488"
            fill="none" stroke="url(#cw3-grad-outline)" strokeWidth="0.9" opacity="0.5"/>

          {/* Teeth hints */}
          <path
            d="M 198,454 L 208,468 L 220,454 M 240,456 L 250,470 L 260,456 M 280,454 L 292,468 L 302,454"
            fill="none" stroke="#1e3a8a" strokeWidth="1.5"
            strokeLinejoin="round" strokeLinecap="round" opacity="0.55"
          />

          {/* ════════════════════
              NECK / COLLAR TECH
          ════════════════════ */}
          <polygon
            points="178,490  155,518  345,518  322,490  250,508"
            fill="#08111e"
            stroke="url(#cw3-grad-outline)" strokeWidth="1.5"
          />
          {/* Collar hex badge */}
          <polygon
            points="250,504  262,510  262,522  250,528  238,522  238,510"
            fill="none"
            stroke="url(#cw3-grad-outline)" strokeWidth="1.5"
            className="cw3-glow"
          />
          {/* Collar circuit lines */}
          <line x1="160" y1="512" x2="236" y2="512"
            stroke="#2563eb" strokeWidth="0.9" opacity="0.4" strokeLinecap="round"/>
          <line x1="340" y1="512" x2="264" y2="512"
            stroke="#7c3aed" strokeWidth="0.9" opacity="0.4" strokeLinecap="round"/>
          <line x1="155" y1="518" x2="155" y2="525"
            stroke="#2563eb" strokeWidth="0.8" opacity="0.3"/>
          <line x1="345" y1="518" x2="345" y2="525"
            stroke="#7c3aed" strokeWidth="0.8" opacity="0.3"/>

        </g>{/* end .cw3-body */}

        {/* ════════════════════
            OUTER NEON GLOW TRACES  (on top, bloomed)
        ════════════════════ */}
        {/* Head outline glow */}
        <polygon className="cw3-glow"
          points="250,118  160,148  95,185  38,305  105,435  178,490  322,490  395,435  462,305  405,185  340,148"
          fill="none"
          stroke="url(#cw3-grad-outline)"
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#cw3-glow-soft)"
          opacity="0.55"
        />
        {/* Left ear glow */}
        <polygon className="cw3-glow"
          points="95,185  42,8  192,158"
          fill="none"
          stroke="url(#cw3-grad-outline)" strokeWidth="1.8"
          filter="url(#cw3-glow-soft)" opacity="0.55"
        />
        {/* Right ear glow */}
        <polygon className="cw3-glow"
          points="405,185  458,8  308,158"
          fill="none"
          stroke="url(#cw3-grad-outline)" strokeWidth="1.8"
          filter="url(#cw3-glow-soft)" opacity="0.55"
        />

        {/* ════════════════════
            SCAN LINE
        ════════════════════ */}
        <g clipPath="url(#cw3-clip)">
          <rect className="cw3-scan"
            x="30" y="295" width="440" height="1.8"
            fill="url(#cw3-grad-outline)" opacity="0"/>
        </g>

        {/* ════════════════════
            PARTICLES
        ════════════════════ */}
        <circle className="cw3-p1" cx="18"  cy="250" r="2.8" fill="#2563eb" opacity="0.7"/>
        <circle className="cw3-p2" cx="14"  cy="340" r="2.2" fill="#7c3aed" opacity="0.6"/>
        <circle className="cw3-p3" cx="482" cy="265" r="2.8" fill="#7c3aed" opacity="0.7"/>
        <circle className="cw3-p4" cx="486" cy="355" r="2.2" fill="#2563eb" opacity="0.55"/>
        <circle className="cw3-p1" cx="52"  cy="440" r="2"   fill="#60a5fa" opacity="0.4" style={{animationDelay:"1.3s"}}/>
        <circle className="cw3-p2" cx="448" cy="445" r="2"   fill="#a78bfa" opacity="0.4" style={{animationDelay:"0.6s"}}/>
      </svg>

      {/* ════════════════════
          UNIT-1 ONLINE LABEL
      ════════════════════ */}
      <div style={{
        marginTop: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}>
        <span className="cw3-status-dot"/>
        <span style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "11px",
          letterSpacing: "0.22em",
          color: "#60a5fa",
          opacity: 0.9,
        }}>
          UNIT-1 ONLINE
        </span>
        <span className="cw3-status-dot2"/>
      </div>
    </div>
  );
}
