import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { calcUserStats } from "@/lib/userStats";

// ── Fetch real token stats from backend ──
interface TokenStats { price: number; marketCap: number; volume24h: number; holders: number; priceChange24h: number }

function useTokenStats() {
  const [stats, setStats] = useState<TokenStats | null>(null);
  useEffect(() => {
    const fetch_ = () => fetch("/api/veloxfi/token-stats")
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
    fetch_();
    const id = setInterval(fetch_, 60_000);
    return () => clearInterval(id);
  }, []);
  return stats;
}

interface SupplyStatus { cap: number; distributed: number; remaining: number; percentUsed: number; poolDepleted: boolean; waitlistCount: number }

function useSupplyStatus() {
  const [supply, setSupply] = useState<SupplyStatus | null>(null);
  useEffect(() => {
    const fetch_ = () => fetch("/api/veloxfi/supply-status").then(r => r.json()).then(setSupply).catch(() => {});
    fetch_();
    const id = setInterval(fetch_, 60_000);
    return () => clearInterval(id);
  }, []);
  return supply;
}

function fmtBattle(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

function fmt(n: number, decimals = 2) { return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); }
function fmtLarge(n: number) {
  if (n >= 1_000_000) return `$${fmt(n / 1_000_000)}M`;
  if (n >= 1_000) return `$${fmt(n / 1_000)}K`;
  return `$${fmt(n)}`;
}

function Ticker({ tokenStats }: { tokenStats: TokenStats | null }) {
  const t = tokenStats;
  const priceUp = (t?.priceChange24h ?? 0) >= 0;

  const items = [
    { label: "$BATTLE",       val: t ? `$${t.price < 0.01 ? t.price.toFixed(6) : t.price.toFixed(4)}` : "—",        delta: t ? `${priceUp ? "+" : ""}${fmt(t.priceChange24h)}%` : "",  dir: priceUp ? "up" : "down" },
    { label: "HOLDERS",       val: t ? t.holders.toLocaleString() : "—",                                             delta: "",                                                            dir: "" },
    { label: "VOL 24h",       val: t ? fmtLarge(t.volume24h) : "—",                                                  delta: "",                                                            dir: "" },
    { label: "MCAP",          val: t ? fmtLarge(t.marketCap) : "—",                                                  delta: t ? `${priceUp ? "+" : ""}${fmt(t.priceChange24h)}%` : "",  dir: priceUp ? "up" : "down" },
    { label: "MINERS ONLINE", val: "LIVE",                                                                            delta: "",                                                            dir: "" },
  ];

  const doubled = [...items, ...items, ...items];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <div className="ticker-item" key={i}>
            <span className="label">{item.label}</span>
            <span className="val">{item.val}</span>
            {item.delta && <span className={`val ${item.dir}`}>{item.delta}</span>}
            <span style={{ opacity: 0.3 }}>•</span>
          </div>
        ))}
      </div>
    </div>
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

const CA = "HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump";

export default function Home() {
  const { user } = useAuth();
  const stats = calcUserStats(user);
  const tokenStats = useTokenStats();
  const supply = useSupplyStatus();
  const [caCopied, setCaCopied] = useState(false);

  function copyCA() {
    navigator.clipboard.writeText(CA);
    setCaCopied(true);
    setTimeout(() => setCaCopied(false), 2000);
  }

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
                <button
                  onClick={copyCA}
                  className="pill"
                  style={{ cursor: "pointer", background: caCopied ? "var(--lime)" : "var(--paper)", border: "2px solid var(--ink)", transition: "background 0.2s" }}
                  title="Click to copy contract address"
                >
                  <span className="mono" style={{ fontSize: 10 }}>{caCopied ? "✓ Copied!" : "CA"}</span>
                  {!caCopied && <span className="mono" style={{ fontSize: 10 }}>HAytudteq...DpumP</span>}
                  {!caCopied && <span style={{ fontSize: 10 }}>📋</span>}
                </button>
                <a className="btn sm" href="https://pump.fun/coin/HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump" target="_blank" rel="noreferrer">P pump.fun</a>
                <a className="btn sm" href="https://x.com/Battle767629" target="_blank" rel="noreferrer">𝕏 X</a>
                <a className="btn sm" href="https://t.me/VeloxFiOfficial" target="_blank" rel="noreferrer">✈ Telegram</a>
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
          <div style={{ margin: "0 -36px" }}><Ticker tokenStats={tokenStats} /></div>

          {/* ── STATS ── */}
          <section>
            <div className="grid-4">
              {[
                { label: "Holders", value: tokenStats ? tokenStats.holders.toLocaleString() : "—", sub: "on Solana", color: "var(--paper)" },
                { label: "Market cap", value: tokenStats ? fmtLarge(tokenStats.marketCap) : "—", sub: tokenStats ? `${(tokenStats.priceChange24h >= 0 ? "+" : "") + fmt(tokenStats.priceChange24h)}% · 24h` : "", color: "var(--cyan)" },
                { label: "Volume 24h", value: tokenStats ? fmtLarge(tokenStats.volume24h) : "—", sub: "trading volume", color: "var(--paper)" },
                { label: "$BATTLE price", value: tokenStats ? `$${tokenStats.price < 0.01 ? tokenStats.price.toFixed(6) : tokenStats.price.toFixed(4)}` : "—", sub: "live on pump.fun", color: "var(--lime)" },
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
                { n: "01", t: "Register your wolf", d: "Sign up with e-mail or Solana wallet. No KYC. Your wolf companion is generated on the fly.", c: "var(--paper)", icon: "🐺" },
                { n: "02", t: "Mine & complete daily tasks", d: "Spin up your mining rig for passive $BATTLE. Complete daily missions, spin the wheel and open treasure chests every day.", c: "var(--cyan)", icon: "⛏" },
                { n: "03", t: "Claim straight to wallet", d: "Claim your $BATTLE directly to your Solana wallet. No bridges. No fees beyond the Solana network.", c: "var(--magenta)", icon: "💰" },
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

          {/* ── TOKENOMICS ── */}
          <section>
            <div className="section-title"><div><div className="eyebrow">Tokenomics</div><h2>Fair from day one — finite emission</h2></div></div>

            {supply && (
              <div className="card ink" style={{ padding: 24, marginBottom: 18 }}>
                <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 14 }}>
                  <div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--cyan)", letterSpacing: 1.5 }}>LIVE EMISSION POOL</div>
                    <div className="display tabular" style={{ fontSize: 36, color: "white", lineHeight: 1, marginTop: 6 }}>
                      {fmtBattle(supply.remaining)} <span style={{ fontSize: 16, color: "var(--magenta)" }}>$BATTLE left</span>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                      of {fmtBattle(supply.cap)} bought back on pump.fun · {supply.percentUsed.toFixed(2)}% claimed
                    </div>
                  </div>
                  {supply.poolDepleted ? (
                    <span className="pill" style={{ background: "var(--tomato)", color: "white", fontSize: 11 }}>⚠ Pool empty</span>
                  ) : supply.percentUsed >= 90 ? (
                    <span className="pill" style={{ background: "var(--yellow)", fontSize: 11 }}>🔥 Almost gone</span>
                  ) : (
                    <span className="pill" style={{ background: "var(--lime)", fontSize: 11 }}>✓ Open for claims</span>
                  )}
                </div>
                <div className="bar thick" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="bar-fill"
                    style={{
                      width: `${Math.min(100, supply.percentUsed)}%`,
                      background: supply.poolDepleted ? "var(--tomato)" : supply.percentUsed >= 90 ? "var(--yellow)" : "var(--lime)",
                    }}
                  />
                </div>
                <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 10 }}>
                  No team mint. No new emission. Every $BATTLE distributed is bought back on the open market.
                </div>
              </div>
            )}

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
                    <a href="https://t.me/VeloxFiOfficial" target="_blank" rel="noreferrer" className="btn lg primary">✈ Telegram</a>
                    <a href="https://x.com/Battle767629" target="_blank" rel="noreferrer" className="btn lg">𝕏 Follow on X</a>
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
