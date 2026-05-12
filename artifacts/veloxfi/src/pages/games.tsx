import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";

const CLASSIC_GAMES = [
  { id: "snake", name: "Crypto Snake", tag: "CLASSIC · SOLO", boost: 1.5, bg: "#C7F75F", dark: false, href: "/games/snake", desc: "Eat coins, grow your tail, don't bite yourself. Every coin = mining boost." },
  { id: "tetris", name: "Battle Tetris", tag: "1v1 · COMPETITIVE", boost: 2.4, bg: "var(--magenta)", dark: true, href: "/games/tetris", desc: "Clear lines faster than your opponent. Send trash rows, win big." },
  { id: "wolfrun", name: "Wolf Run", tag: "ENDLESS RUNNER", boost: 1.8, bg: "#FFB02E", dark: false, href: "/games/runner", desc: "Dodge obstacles, collect power-ups. How far can your wolf run?" },
  { id: "rocket", name: "Rocket Miner", tag: "CRASH GAME", boost: 3.2, bg: "#0B0B1A", dark: true, href: "/games/rocket", desc: "Watch the multiplier rise. Cash out before it crashes." },
];

const TOURNAMENTS = [
  { name: "Battle Tetris Weekly", prize: "5,000 BATTLE", ends: "3d 14h", color: "var(--magenta)", icon: "⬛" },
  { name: "Daily play raffle", prize: "500 BATTLE", ends: "11h 24m", color: "var(--yellow)", icon: "🎲" },
  { name: "Win 5 in a row", prize: "2,000 BATTLE", ends: "Ongoing", color: "var(--lime)", icon: "🏆" },
];

function GameMiniArt({ id }: { id: string }) {
  const style: React.CSSProperties = { position: "absolute", inset: 0, opacity: 0.85 };
  if (id === "snake") return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="none" style={style}>
      <path d="M10 30 Q 60 20, 80 50 T 150 60 T 190 90" stroke="var(--ink)" strokeWidth="14" fill="none" strokeLinecap="round" />
      <circle cx="190" cy="90" r="12" fill="var(--ink)" />
      <circle cx="194" cy="86" r="3" fill="var(--magenta)" />
    </svg>
  );
  if (id === "tetris") return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="none" style={style}>
      <g stroke="var(--ink)" strokeWidth="2">
        <rect x="20" y="60" width="20" height="20" fill="var(--cyan)" />
        <rect x="40" y="60" width="20" height="20" fill="var(--cyan)" />
        <rect x="60" y="60" width="20" height="20" fill="var(--cyan)" />
        <rect x="120" y="40" width="20" height="20" fill="var(--yellow)" />
        <rect x="140" y="40" width="20" height="20" fill="var(--yellow)" />
        <rect x="120" y="60" width="20" height="20" fill="var(--yellow)" />
        <rect x="140" y="60" width="20" height="20" fill="var(--yellow)" />
      </g>
    </svg>
  );
  if (id === "wolfrun") return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="none" style={style}>
      <path d="M0 90 L 200 90" stroke="var(--ink)" strokeWidth="3" />
      <rect x="40" y="60" width="20" height="30" fill="var(--ink)" />
      <rect x="80" y="40" width="40" height="50" fill="var(--ink)" />
      <circle cx="170" cy="70" r="12" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" />
    </svg>
  );
  return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="none" style={style}>
      <path d="M10 100 Q 80 100, 100 60 T 190 10" stroke="var(--cyan)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M170 30 L 190 10 L 180 30 Z" fill="var(--magenta)" stroke="var(--ink)" strokeWidth="2" />
    </svg>
  );
}

export default function GamesPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 30 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Game Den</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>The Game Den.</div>
            <span className="pill yellow">+850 BATTLE daily quests</span>
          </div>

          <p style={{ fontSize: 16, color: "var(--ink-soft)", maxWidth: 640, marginTop: -16 }}>
            Six games. Every win multiplies your mining hash rate for the next 24 hours. Pick your weapon.
          </p>

          {/* ── FEATURED GAMES ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>

            {/* Howl & Hunt */}
            <div className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}>
              <div style={{ background: "var(--ink)", color: "white", padding: 28, minHeight: 380, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -40, top: -20, width: 360, height: 360, opacity: 0.7 }}>
                  <img src="/mascot.jpg" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 99, filter: "saturate(1.2)" }} alt="" />
                </div>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, var(--ink) 30%, transparent 70%)" }} />

                <div style={{ position: "relative" }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="pill magenta">NEW</span>
                    <span className="pill" style={{ background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.3)", color: "white" }}>10 PLAYERS</span>
                    <span className="pill" style={{ background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.3)", color: "white" }}>BATTLE ROYALE</span>
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--lime)", letterSpacing: 2, marginTop: 18 }}>FEATURED · DROP #014</div>
                  <h2 className="display" style={{ fontSize: 64, lineHeight: 0.9, margin: "8px 0" }}>HOWL<br /><span style={{ color: "var(--magenta)" }}>& HUNT</span></h2>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", maxWidth: 420 }}>
                    Ten wolves drop onto a shrinking hex grid. Last fang standing eats the pool. 2-minute matches, real $BATTLE prizes every round.
                  </p>
                </div>

                <div className="row" style={{ position: "relative", gap: 22, alignItems: "flex-end" }}>
                  {[["var(--cyan)", "NEXT MATCH", "00:48"], ["var(--magenta)", "POOL", "2,840 BATTLE"], ["var(--yellow)", "BOOST", "×4.0"]].map(([c, l, v]) => (
                    <div key={String(l)}>
                      <div className="mono" style={{ fontSize: 10, color: String(c) }}>{l}</div>
                      <div className="display tabular" style={{ fontSize: 26 }}>{v}</div>
                    </div>
                  ))}
                  <div style={{ flex: 1 }} />
                  <button className="btn lg yellow">Drop in →</button>
                </div>
              </div>
            </div>

            {/* Pump Pulse */}
            <div className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}>
              <div style={{ background: "var(--cyan)", padding: 24, minHeight: 380, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
                <div>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="pill magenta">NEW</span>
                    <span className="pill">60 SECONDS</span>
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", letterSpacing: 2, marginTop: 18 }}>FEATURED · CHART GAME</div>
                  <h2 className="display" style={{ fontSize: 48, lineHeight: 0.95, margin: "8px 0" }}>PUMP<br />PULSE.</h2>
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", maxWidth: 320 }}>
                    Predict the next 60 seconds of a fake meme chart. Stack multipliers. Cash out before the rug.
                  </p>
                </div>
                <div style={{ height: 100, position: "relative" }}>
                  <svg viewBox="0 0 100 50" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                    <path d="M0 40 L 10 35 L 18 38 L 25 30 L 32 25 L 40 28 L 50 20 L 60 15 L 70 10 L 78 8 L 90 5 L 100 12" stroke="var(--ink)" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <circle cx="78" cy="8" r="3" fill="var(--magenta)" stroke="var(--ink)" strokeWidth="1.5" />
                  </svg>
                  <div style={{ position: "absolute", top: 0, right: 0 }}>
                    <div className="display tabular" style={{ fontSize: 32 }}>×6.4</div>
                  </div>
                </div>
                <button className="btn lg ink" style={{ width: "100%", justifyContent: "center" }}>Open chart →</button>
              </div>
            </div>
          </div>

          {/* ── CLASSIC GAMES ── */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">Arcade</div><h2>The original four</h2></div>
              <div className="grow" />
              <div className="tabs">
                {["All", "Solo", "PvP"].map((t) => <div key={t} className={`tab${t === "All" ? " active" : ""}`}>{t}</div>)}
              </div>
            </div>
            <div className="grid-4">
              {CLASSIC_GAMES.map((g) => (
                <Link key={g.id} href={g.href} style={{ textDecoration: "none" }}>
                  <div className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}>
                    <div style={{ background: g.bg, height: 140, position: "relative", borderBottom: "2.5px solid var(--ink)", display: "flex", alignItems: "flex-end", padding: 14, overflow: "hidden" }}>
                      <GameMiniArt id={g.id} />
                      <div style={{ position: "relative", zIndex: 2 }}>
                        <div className="display" style={{ fontSize: 20, lineHeight: 1, color: g.dark ? "white" : "var(--ink)" }}>{g.name}</div>
                        <div className="mono" style={{ fontSize: 10, marginTop: 3, color: g.dark ? "rgba(255,255,255,0.7)" : "var(--mute)" }}>{g.tag}</div>
                      </div>
                    </div>
                    <div style={{ padding: 14 }}>
                      <div style={{ fontSize: 12, color: "var(--mute)", marginBottom: 10 }}>{g.desc}</div>
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <div style={{ fontSize: 12, color: "var(--mute)" }}>Hash boost</div>
                        <div className="display" style={{ fontSize: 16 }}>×{g.boost}</div>
                      </div>
                      <div className="bar" style={{ marginTop: 8 }}>
                        <div className="bar-fill" style={{ width: `${g.boost * 20}%` }} />
                      </div>
                      <button className="btn sm primary" style={{ marginTop: 12, width: "100%", justifyContent: "center" }}>Play now →</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── TOURNAMENTS ── */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">This week</div><h2>Tournaments & raffles</h2></div>
            </div>
            <div className="grid-3">
              {TOURNAMENTS.map((t) => (
                <div key={t.name} className="card" style={{ background: t.color }}>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{t.icon}</span>
                    <span className="pill" style={{ fontSize: 11 }}>Ends {t.ends}</span>
                  </div>
                  <div className="display" style={{ fontSize: 22, lineHeight: 1.1 }}>{t.name}</div>
                  <div style={{ marginTop: 10 }}>
                    <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>PRIZE POOL</div>
                    <div className="display tabular" style={{ fontSize: 28 }}>{t.prize}</div>
                  </div>
                  <button className="btn sm ink" style={{ marginTop: 14 }}>Enter →</button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
