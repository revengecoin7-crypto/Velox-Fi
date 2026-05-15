import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { calcUserStats } from "@/lib/userStats";

// ── Ticker data ──
const TICKER_ITEMS = [
  { label: "$BATTLE", val: "$0.00428", delta: "+12.6%", dir: "up" },
  { label: "HOLDERS", val: "14,902", delta: "+341 24h", dir: "up" },
  { label: "VOL 24h", val: "$1.84M", delta: "+22.1%", dir: "up" },
  { label: "MCAP", val: "$4.28M", delta: "+12.6%", dir: "up" },
  { label: "MINERS ONLINE", val: "3,217", delta: "LIVE", dir: "up" },
  { label: "GAMES PLAYED", val: "218,440", delta: "+1,212", dir: "up" },
  { label: "NEXT HALVING", val: "in 13d 04h", delta: "", dir: "" },
  { label: "SOL", val: "$184.21", delta: "-0.4%", dir: "down" },
];

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {items.map((t, i) => (
          <div className="ticker-item" key={i}>
            <span className="label">{t.label}</span>
            <span className="val">{t.val}</span>
            {t.delta && <span className={`val ${t.dir}`}>{t.delta}</span>}
            <span style={{ opacity: 0.3 }}>•</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const GAMES = [
  { id: "snake", name: "Crypto Snake", tag: "CLASSIC · SOLO", boost: 1.5, bg: "#C7F75F", dark: false, barColor: "var(--ink)", isNew: false, href: "/games/snake" },
  { id: "tetris", name: "Battle Tetris", tag: "1v1 · COMPETITIVE", boost: 2.4, bg: "var(--magenta)", dark: true, barColor: "var(--cyan)", isNew: false, href: "/games/tetris" },
  { id: "wolfrun", name: "Wolf Run", tag: "ENDLESS RUNNER", boost: 1.8, bg: "#FFB02E", dark: false, barColor: "var(--magenta)", isNew: false, href: "/games/runner" },
  { id: "rocket", name: "Rocket Miner", tag: "CRASH GAME", boost: 3.2, bg: "#0B0B1A", dark: true, barColor: "var(--cyan)", isNew: false, href: "/games/rocket" },
  { id: "howlhunt", name: "Howl & Hunt", tag: "BATTLE ROYALE · 10P", boost: 4.0, bg: "#1F1B2E", dark: true, barColor: "var(--lime)", isNew: true, href: "/games" },
  { id: "pump", name: "Pump Pulse", tag: "60s PREDICT", boost: 2.8, bg: "var(--cyan)", dark: false, barColor: "var(--magenta)", isNew: true, href: "/games" },
];

function GameMiniArt({ id }: { id: string }) {
  const style: React.CSSProperties = { position: "absolute", inset: 0, opacity: 0.85 };
  if (id === "snake") return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="none" style={style}>
      <path d="M10 30 Q 60 20, 80 50 T 150 60 T 190 90" stroke="var(--ink)" strokeWidth="14" fill="none" strokeLinecap="round" />
      <circle cx="190" cy="90" r="12" fill="var(--ink)" />
      <circle cx="194" cy="86" r="3" fill="var(--magenta)" />
      <circle cx="40" cy="80" r="6" fill="var(--magenta)" stroke="var(--ink)" strokeWidth="2" />
    </svg>
  );
  if (id === "tetris") return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="none" style={style}>
      <g stroke="var(--ink)" strokeWidth="2">
        <rect x="20" y="60" width="20" height="20" fill="var(--cyan)" />
        <rect x="40" y="60" width="20" height="20" fill="var(--cyan)" />
        <rect x="60" y="60" width="20" height="20" fill="var(--cyan)" />
        <rect x="80" y="60" width="20" height="20" fill="var(--cyan)" />
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
      <rect x="140" y="70" width="20" height="20" fill="var(--ink)" />
      <circle cx="170" cy="70" r="12" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" />
    </svg>
  );
  if (id === "rocket") return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="none" style={style}>
      <path d="M10 100 Q 80 100, 100 60 T 190 10" stroke="var(--cyan)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M170 30 L 190 10 L 180 30 Z" fill="var(--magenta)" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="40" cy="92" r="3" fill="var(--cyan)" />
      <circle cx="80" cy="80" r="3" fill="var(--cyan)" />
      <circle cx="120" cy="50" r="3" fill="var(--cyan)" />
    </svg>
  );
  if (id === "howlhunt") return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="none" style={style}>
      <g stroke="var(--lime)" strokeWidth="2" fill="none">
        <rect x="14" y="14" width="172" height="92" rx="6" />
        {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={14 + i * 19} y1="14" x2={14 + i * 19} y2="106" opacity="0.3" />)}
        {Array.from({ length: 5 }).map((_, i) => <line key={i} x1="14" y1={14 + i * 19} x2="186" y2={14 + i * 19} opacity="0.3" />)}
      </g>
      <circle cx="60" cy="60" r="6" fill="var(--lime)" />
      <circle cx="120" cy="80" r="6" fill="var(--magenta)" />
      <circle cx="150" cy="40" r="6" fill="var(--cyan)" />
    </svg>
  );
  return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="none" style={style}>
      <g stroke="var(--ink)" strokeWidth="2.5">
        <rect x="20" y="60" width="14" height="40" fill="var(--lime)" />
        <rect x="40" y="40" width="14" height="60" fill="var(--lime)" />
        <rect x="60" y="50" width="14" height="50" fill="var(--tomato)" />
        <rect x="80" y="30" width="14" height="70" fill="var(--lime)" />
        <rect x="100" y="20" width="14" height="80" fill="var(--lime)" />
        <rect x="120" y="45" width="14" height="55" fill="var(--tomato)" />
        <rect x="140" y="25" width="14" height="75" fill="var(--lime)" />
        <rect x="160" y="15" width="14" height="85" fill="var(--lime)" />
      </g>
    </svg>
  );
}

function TokenDonut() {
  const segments = [
    { v: 60, c: "var(--cyan)" },
    { v: 18, c: "var(--magenta)" },
    { v: 14, c: "var(--yellow)" },
    { v: 8, c: "var(--lime)" },
  ];
  const r = 56, cx = 70, cy = 70, sw = 24;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink-soft)" strokeWidth={sw} />
      {segments.map((d, i) => {
        const dashLen = (d.v / 100) * circumference;
        const dashOffset = -offset;
        offset += dashLen;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.c} strokeWidth={sw}
            strokeDasharray={`${dashLen} ${circumference}`}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${cx} ${cy})`} />
        );
      })}
      <circle cx={cx} cy={cy} r={r - sw / 2 - 1} fill="none" stroke="var(--ink)" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={r + sw / 2 + 1} fill="none" stroke="var(--ink)" strokeWidth="2" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="Bagel Fat One" fontSize="16" fill="white">BATTLE</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(255,255,255,0.6)">1B SUPPLY</text>
    </svg>
  );
}

export default function Home() {
  const { user } = useAuth();
  const stats = calcUserStats(user);
  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 64 }}>

          {/* ── HERO ── */}
          <section style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 36, alignItems: "center", position: "relative", paddingTop: 12 }} className="hero-section">

            <div>
              <div className="row" style={{ gap: 8, marginBottom: 18 }}>
                <span className="pill dot">LIVE ON PUMP.FUN</span>
                <span className="pill" style={{ background: "var(--cream)" }}>v2 — Pack mode just dropped</span>
              </div>
              <h1 className="display" style={{ fontSize: 90, lineHeight: 0.92, margin: 0 }}>
                MINE.<br />EARN.<br /><span style={{ color: "var(--magenta)" }}>HOWL.</span>
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.45, maxWidth: 520, marginTop: 22, color: "var(--ink-soft)" }}>
                Veloxfi is the cyber-wolf meme coin on Solana. Mine <b>$BATTLE</b> every day, complete daily missions, grow your wolf companion, and climb the pack on a leaderboard that pays in real tokens. No presale. No team allocation. Just the wolves.
              </p>
              <div className="row" style={{ marginTop: 26, gap: 12, flexWrap: "wrap" }}>
                <Link href="/register" className="btn lg magenta">Join the pack →</Link>
                <Link href="/mine" className="btn lg primary">⛏ Start mining</Link>
                <a href="#how-it-works" className="btn lg ghost">How it works ↓</a>
              </div>
              <div className="row" style={{ marginTop: 28, gap: 10, flexWrap: "wrap" }}>
                <div className="pill" style={{ maxWidth: 260, overflow: "hidden" }}>
                  <span className="mono" style={{ fontSize: 10 }}>CA</span>
                  <span className="mono" style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>HAytudteq...DpumP</span>
                </div>
                <a className="btn sm" href="https://pump.fun" target="_blank" rel="noreferrer">P pump.fun</a>
                <a className="btn sm" href="#">𝕏 X</a>
                <a className="btn sm" href="#">✈ Telegram</a>
                <a className="btn sm" href="#">Discord</a>
              </div>
            </div>

            {/* Right column — mascot */}
            <div style={{ position: "relative" }}>

              {/* Mascot frame */}
              <div className="mascot-frame" style={{ aspectRatio: "1/1" }}>
                <img src="/mascot.jpg" alt="Velox cyber wolf" />
                <div className="gloss" />
                <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between" }}>
                  <div className="mono" style={{ fontSize: 11, color: "var(--cyan)", textShadow: "0 0 8px var(--cyan)" }}>
                    <div>VELOX :: {stats.username.toUpperCase()}</div>
                    <div style={{ opacity: 0.7, marginTop: 2 }}>STATUS / {stats.isOnline ? "ONLINE" : "OFFLINE"}</div>
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--magenta)", textShadow: "0 0 8px var(--magenta)", textAlign: "right" }}>
                    <div>HASH ↑ {stats.hashRate} KH/s</div>
                    <div style={{ opacity: 0.7, marginTop: 2 }}>PACK / {stats.tier.name.toUpperCase()}</div>
                  </div>
                </div>
                <div style={{ position: "absolute", bottom: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ background: "rgba(11,11,26,0.7)", backdropFilter: "blur(8px)", border: "2px solid var(--cyan)", borderRadius: 10, padding: "6px 10px" }}>
                    <div className="mono" style={{ fontSize: 10, color: "var(--cyan)" }}>RIG POWER</div>
                    <div className="display" style={{ fontSize: 18, color: "white" }}>LVL {stats.level}</div>
                  </div>
                  <div style={{ background: "rgba(11,11,26,0.7)", backdropFilter: "blur(8px)", border: "2px solid var(--magenta)", borderRadius: 10, padding: "6px 10px" }}>
                    <div className="mono" style={{ fontSize: 10, color: "var(--magenta)" }}>CLAIMABLE</div>
                    <div className="display" style={{ fontSize: 18, color: "white" }}>{stats.claimable.toLocaleString()} BATTLE</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── TICKER ── */}
          <div style={{ margin: "0 -36px" }}><Ticker /></div>

          {/* ── STATS ── */}
          <section>
            <div className="grid-4">
              {[
                { label: "Holders", value: "14,902", sub: "+341 in 24h", color: "var(--paper)" },
                { label: "Total mined", value: "892M", sub: "of 1B max supply", color: "var(--cyan)" },
                { label: "Market cap", value: "$4.28M", sub: "+12.6% · 24h", color: "var(--paper)" },
                { label: "Active miners", value: "3,217", sub: "online right now", color: "var(--lime)" },
              ].map((s) => (
                <div className="card" key={s.label} style={{ background: s.color }}>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-num tabular">{s.value}</div>
                  <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section id="how-it-works">
            <div className="section-title">
              <div><div className="eyebrow">How it works</div><h2>Three steps to the pack</h2></div>
              <div className="grow" />
              <div className="sticker" style={{ background: "var(--lime)" }}>100% on-chain</div>
            </div>
            <div className="grid-3">
              {[
                { n: "01", t: "Connect your wallet", d: "Phantom, Solflare, or e-mail. No KYC. Your wolf avatar is generated on the fly.", c: "var(--paper)", icon: "👛" },
                { n: "02", t: "Mine + play daily", d: "Spin up your rig for passive mining, then play arcade games to multiply your hash rate.", c: "var(--cyan)", icon: "⛏" },
                { n: "03", t: "Claim straight to wallet", d: "Every 24h you can claim $BATTLE to your wallet. No bridges. No fees beyond Solana.", c: "var(--magenta)", icon: "💰" },
              ].map((s) => (
                <div className="card" key={s.n} style={{ background: s.c, color: s.c === "var(--magenta)" ? "white" : "var(--ink)" }}>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                    <div className="display tabular" style={{ fontSize: 36 }}>{s.n}</div>
                    <div style={{ width: 44, height: 44, border: "2.5px solid var(--ink)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)", fontSize: 20 }}>{s.icon}</div>
                  </div>
                  <div className="display" style={{ fontSize: 22, lineHeight: 1.1 }}>{s.t}</div>
                  <div style={{ fontSize: 14, marginTop: 8, opacity: 0.85 }}>{s.d}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── GAMES ── */}
          <section>
            <div className="section-title">
              <div><div className="eyebrow">The game den</div><h2>Six ways to multiply your hash</h2></div>
              <div className="grow" />
              <Link href="/games" className="btn">Open game den →</Link>
            </div>
            <div className="grid-3">
              {GAMES.map((g) => (
                <Link href={g.href} key={g.id} style={{ textDecoration: "none" }}>
                  <div className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}>
                    <div style={{ background: g.bg, height: 160, padding: 16, position: "relative", borderBottom: "2.5px solid var(--ink)", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                      <GameMiniArt id={g.id} />
                      {g.isNew && <div style={{ position: "absolute", top: 12, right: 12 }}><span className="pill magenta" style={{ fontSize: 10 }}>NEW</span></div>}
                      <div style={{ position: "relative", zIndex: 2 }}>
                        <div className="display" style={{ fontSize: 22, lineHeight: 1, color: g.dark ? "white" : "var(--ink)" }}>{g.name}</div>
                        <div className="mono" style={{ fontSize: 10, marginTop: 4, color: g.dark ? "rgba(255,255,255,0.7)" : "var(--mute)" }}>{g.tag}</div>
                      </div>
                    </div>
                    <div style={{ padding: 14 }}>
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <div style={{ fontSize: 12, color: "var(--mute)" }}>Hash boost</div>
                        <div className="display" style={{ fontSize: 16 }}>×{g.boost}</div>
                      </div>
                      <div className="bar" style={{ marginTop: 8 }}>
                        <div className="bar-fill" style={{ width: `${g.boost * 20}%`, background: g.barColor }} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── TOKENOMICS ── */}
          <section>
            <div className="section-title"><div><div className="eyebrow">Tokenomics</div><h2>Fair from day one</h2></div></div>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18 }}>
              <div className="card ink" style={{ padding: 28 }}>
                <div className="row" style={{ gap: 18, alignItems: "center" }}>
                  <TokenDonut />
                  <div style={{ flex: 1 }}>
                    <div className="mono" style={{ fontSize: 11, color: "var(--cyan)" }}>MAX SUPPLY</div>
                    <div className="display tabular" style={{ fontSize: 36, lineHeight: 1, marginTop: 6 }}>1,000,000,000</div>
                    <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>$BATTLE · SPL · Solana mainnet</div>
                    <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                      {[["Mining rewards", 60, "var(--cyan)"], ["Liquidity pool (LP)", 18, "var(--magenta)"], ["Game prize pool", 14, "var(--yellow)"], ["Community treasury", 8, "var(--lime)"]].map(([n, p, c]) => (
                        <div key={String(n)} className="row" style={{ gap: 10 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: String(c), flexShrink: 0 }} />
                          <div style={{ flex: 1, fontSize: 13 }}>{String(n)}</div>
                          <div className="display tabular" style={{ fontSize: 16 }}>{p}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[["0% tax", "No buy / sell tax. Forever.", "🌿"], ["LP burned", "Liquidity locked permanently on day one.", "🔥"], ["Contract renounced", "Mint authority revoked. Nobody can change the rules.", "🛡"]].map(([t, d, icon]) => (
                  <div className="card cream" key={String(t)}>
                    <div className="row" style={{ justifyContent: "space-between" }}>
                      <div className="display" style={{ fontSize: 22 }}>{t}</div>
                      <span style={{ fontSize: 22 }}>{icon}</span>
                    </div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>{String(d)}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── ROADMAP ── */}
          <section>
            <div className="section-title"><div><div className="eyebrow">Pack milestones</div><h2>The hunt so far</h2></div></div>
            <div className="card" style={{ padding: 26 }}>
              <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }}>
                <div style={{ position: "absolute", left: 14, right: 14, top: 13, height: 0, borderTop: "2px dashed rgba(11,11,26,0.12)", zIndex: 0 }} />
                {[
                  { q: "Q1", t: "Howl begins", items: ["Pump.fun launch", "Mining v1", "10k holders", "DEXTools listing"], done: true },
                  { q: "Q2", t: "Game den opens", items: ["4 arcade games", "Leaderboard", "Daily quests", "Web app v2"], done: true },
                  { q: "Q3", t: "Pack mode", items: ["Multiplayer raids", "2 new games", "Mobile beta", "$BATTLE staking"], done: false, now: true },
                  { q: "Q4", t: "CEX & NFT", items: ["Tier-1 CEX listing", "Wolf NFT mint", "Cross-chain bridge", "Partnerships"], done: false },
                  { q: "Q1+", t: "Veloxverse", items: ["Open world game", "Wolf DAO", "Merch drop", "IRL meetups"], done: false },
                ].map((r) => (
                  <div key={r.q} style={{ position: "relative", zIndex: 1 }}>
                    <div className="row" style={{ marginBottom: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 99, background: r.done ? "var(--lime)" : (r.now ? "var(--magenta)" : "var(--paper)"), border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", color: r.now ? "white" : "var(--ink)", flexShrink: 0, fontSize: 12, fontWeight: 700 }}>
                        {r.done ? "✓" : r.q}
                      </div>
                      {r.now && <span className="pill magenta" style={{ fontSize: 10 }}>NOW</span>}
                    </div>
                    <div className="display" style={{ fontSize: 16, lineHeight: 1.1, marginBottom: 8 }}>{r.t}</div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                      {r.items.map((it) => <li key={it} style={{ fontSize: 12, color: r.done ? "var(--mute)" : "var(--ink)", textDecoration: r.done ? "line-through" : "none" }}>· {it}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── COMMUNITY ── */}
          <section>
            <div className="card magenta" style={{ padding: 36, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(var(--ink) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px", opacity: 0.12 }} />
              <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 30, alignItems: "center" }}>
                <div>
                  <div className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>The pack</div>
                  <h2 className="display" style={{ fontSize: 48, lineHeight: 1, color: "white", margin: "6px 0 14px" }}>14,902 wolves and counting.</h2>
                  <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)" }}>Drop into the den. Memes, alpha, daily quests, and weekly $BATTLE raffles for active members.</p>
                  <div className="row" style={{ gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                    <button className="btn lg yellow">🎮 Join Discord</button>
                    <button className="btn lg primary">✈ Telegram</button>
                    <button className="btn lg">𝕏 Follow on X</button>
                  </div>
                </div>
                <div style={{ position: "relative", height: 280 }}>
                  {([[0, 0, 80], [60, 30, 64], [-20, 70, 70], [80, 110, 56], [-30, 150, 60], [50, 170, 50], [120, 50, 50]] as number[][]).map(([x, y, s], i) => (
                    <div key={i} style={{ position: "absolute", left: "50%", top: 0, transform: `translate(${x - s / 2}px, ${y}px) rotate(${(i % 2 ? -1 : 1) * 6}deg)` }}>
                      <div style={{ width: s, height: s, borderRadius: s * 0.28, overflow: "hidden", border: "2.5px solid var(--ink)", boxShadow: "2px 2px 0 0 var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)" }}>
                        <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section>
            <div className="section-title"><div><div className="eyebrow">FAQ</div><h2>Quick answers</h2></div></div>
            <div className="grid-2">
              {[
                ["Do I need to buy $BATTLE to start?", "No. Anyone can register with a wallet or email and start mining for free. Buying $BATTLE boosts your hash rate and unlocks higher tiers."],
                ["How is mining different from buying?", "Mining gives you daily passive $BATTLE based on your rig level. Buying lets you skip the grind and gives you tradeable tokens immediately."],
                ["Is this audited?", "The token contract is a standard SPL. The mint authority is revoked and LP is burned. A full audit of the game backend is scheduled for Q3."],
                ["Where can I buy?", "Pump.fun (linked above), Raydium, Jupiter aggregator, or directly via the wallet inside Veloxfi."],
              ].map(([q, a]) => (
                <div className="card" key={String(q)}>
                  <div className="display" style={{ fontSize: 18, marginBottom: 6 }}>{q}</div>
                  <div style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.5 }}>{a}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer style={{ borderTop: "2.5px solid var(--ink)", paddingTop: 26, marginTop: 16 }}>
            <div className="row" style={{ alignItems: "flex-start", gap: 36 }}>
              <div style={{ flex: 1 }}>
                <div className="row">
                  <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", border: "2.5px solid var(--ink)", boxShadow: "2px 2px 0 0 var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0 }}>
                    <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
                  </div>
                  <div>
                    <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>VELOXFI</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>BATTLE · SPL on Solana</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "var(--mute)", maxWidth: 440, marginTop: 14 }}>
                  $BATTLE is a community meme coin. It has no intrinsic value or expectation of financial return. Always DYOR.
                </p>
              </div>
              {[
                { title: "Product", links: [["Mining", "/mine"], ["Games", "/games"], ["Leaderboard", "/leaderboard"]] },
                { title: "Community", links: [["Pump.fun", "#"], ["X / Twitter", "#"], ["Telegram", "#"]] },
                { title: "Resources", links: [["Whitepaper", "/whitepaper"], ["FAQ", "/faq"], ["Privacy", "/privacy"]] },
              ].map((col) => (
                <div key={col.title}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>{col.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                    {col.links.map(([label, href]) => (
                      <Link key={label} href={href} style={{ color: "var(--ink)", textDecoration: "none" }}>{label}</Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1.5px solid rgba(11,11,26,0.12)", marginTop: 26, paddingTop: 16, fontSize: 11, color: "var(--mute)", display: "flex", justifyContent: "space-between" }}>
              <div>© 2026 Veloxfi · Howl loudly.</div>
              <div>v2.0 · ahooooo 🐺</div>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}
