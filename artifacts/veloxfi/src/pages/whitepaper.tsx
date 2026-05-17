import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Sidebar } from "@/components/Sidebar";

const DIST = [
  { label: "Public Market (pump.fun)", pct: 70, color: "var(--magenta)" },
  { label: "Buyback Distribution Pool", pct: 20, color: "var(--cyan)" },
  { label: "Community & Marketing",     pct: 10, color: "var(--lime)" },
];

const PHASES = [
  { num: "01", name: "Build & launch",    done: true,  color: "var(--lime)",     items: ["$BATTLE live on pump.fun", "Free 4-hour mining sessions", "Wallet linking + Solana payouts", "Website live at veloxfi.io"] },
  { num: "02", name: "Grow",              done: false, color: "var(--cyan)",     items: ["Live leaderboard", "Mobile-friendly experience", "Daily streak rewards", "Referral system"] },
  { num: "03", name: "Distribute",        done: false, color: "var(--yellow)",   items: ["Capped buyback pool (95M $BATTLE)", "Waitlist when pool depletes", "Live emission tracker", "Transparent buyback receipts"] },
  { num: "04", name: "Scale",             done: false, color: "var(--magenta)",  items: ["Raydium liquidity migration", "DexScreener listing", "CEX listing pursuit", "Ambassador program"] },
  { num: "05", name: "Global expansion",  done: false, color: "var(--lavender)", items: ["Community treasury and DAO", "Wolf NFT mint", "Multi-language platform", "Merch drop and IRL meetups"] },
];

export default function Whitepaper() {
  usePageMeta({
    title: "Whitepaper — VeloxFi | Mining-only meme coin on Solana | $BATTLE Token",
    description: "Read the VeloxFi whitepaper. Free WOLF mining, fixed 5,000:1 conversion to $BATTLE, capped buyback distribution pool, and a 5-phase roadmap on Solana.",
    canonical: "https://veloxfi.io/whitepaper",
  });

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          <div className="topbar">
            <div className="crumb">Home / <b>Whitepaper</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>VeloxFi whitepaper.</div>
            <span className="pill yellow">📄 v3.0 · 2026</span>
          </div>

          {/* Intro card */}
          <div className="card ink" style={{ padding: 30, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
            <div style={{ position: "relative" }}>
              <div className="eyebrow" style={{ color: "var(--cyan)" }}>Abstract</div>
              <h2 className="display" style={{ fontSize: 32, lineHeight: 1.05, color: "white", margin: "6px 0 14px" }}>Mining-only meme coin on Solana</h2>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.85)", marginBottom: 12 }}>
                VeloxFi is a mining-only meme coin platform on Solana. Users mine free WOLF tokens in passive 4-hour sessions, then convert them to <b>$BATTLE</b> — a real Solana token live on pump.fun — at a fixed 5,000:1 rate.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.75)" }}>
                Unlike most reward platforms that mint endless supply, VeloxFi caps distribution at the $BATTLE we've already bought back on the open market. No emission-driven dilution — when the pool depletes, conversions queue.
              </p>
              <a href="/VeloxFi-Whitepaper.pdf" download className="btn lg" style={{ marginTop: 18, background: "var(--yellow)" }}>📥 Download PDF</a>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid-3">
            {[
              { label: "Speed",  value: "Solana · 65K TPS",   color: "var(--cyan)" },
              { label: "Access", value: "No wallet to mine",   color: "var(--lime)" },
              { label: "Mining", value: "Free 4-hour sessions", color: "var(--yellow)" },
            ].map(s => (
              <div key={s.label} className="card" style={{ background: s.color, textAlign: "center", padding: 20 }}>
                <div className="eyebrow">{s.label}</div>
                <div className="display" style={{ fontSize: 18, marginTop: 4 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 18, background: "rgba(255,200,40,0.12)", borderColor: "var(--yellow)" }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.5 }}>
              <b>⚠ DISCLAIMER:</b> This whitepaper is for informational purposes only and does not constitute financial advice. WOLF has no monetary value on its own. $BATTLE is a freely tradeable Solana token — always do your own research.
            </div>
          </div>

          {/* Mining */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">02 · Mining</div><h2>WOLF mining system</h2></div>
              <div className="grow" />
              <span className="pill lime">⛏ Free</span>
            </div>
            <div className="card" style={{ padding: 22 }}>
              <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 14, color: "var(--ink-soft)" }}>
                Every registered user can run a free WOLF mining session. The session lasts <b>4 hours</b> and pays <b>1 WOLF per minute</b>, capped at 240 WOLF per session. Sessions track server-side, so closing the tab doesn't stop progress. Claim when the timer hits zero and start the next session — up to six per day.
              </p>
              <div className="grid-4">
                {[["Session", "4 hours"], ["Rate", "1 WOLF/min"], ["Max/session", "240 WOLF"], ["Cost", "Free"]].map(([l, v]) => (
                  <div key={l} className="card cream" style={{ textAlign: "center", padding: 14 }}>
                    <div className="eyebrow">{l}</div>
                    <div className="display tabular" style={{ fontSize: 18, marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Capped buyback */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">03 · Distribution</div><h2>Capped buyback pool</h2></div>
              <div className="grow" />
              <span className="pill cyan">🛡 95M cap</span>
            </div>
            <div className="card" style={{ padding: 22 }}>
              <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 14, color: "var(--ink-soft)" }}>
                Every $BATTLE we distribute has already been bought back on pump.fun. The pool is currently capped at <b>95,000,000 $BATTLE</b> (≈9.5% of total supply). When users convert WOLF, $BATTLE leaves the pool and lands in their Solana wallet. When the pool depletes, new conversions join a <b>waitlist</b> — your WOLF stays untouched until we refill the pool.
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "No emission-driven dilution — we never mint reward tokens",
                  "Live emission pool widget on the homepage shows remaining $BATTLE",
                  "Buybacks create continuous open-market buy pressure on pump.fun",
                  "Waitlist is FIFO — first-come, first-served when the pool refills",
                ].map(item => (
                  <li key={item} style={{ fontSize: 14, display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--cyan)", fontWeight: 700 }}>▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tokenomics */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">04 · Tokenomics</div><h2>$BATTLE token</h2></div>
              <div className="grow" />
              <span className="pill magenta">SPL · Solana</span>
            </div>
            <div className="card" style={{ padding: 22 }}>
              <div className="grid-2" style={{ marginBottom: 18 }}>
                {[
                  ["Token Name", "$BATTLE"],
                  ["Blockchain", "Solana (SPL)"],
                  ["Total Supply", "1,000,000,000"],
                  ["Listed on", "pump.fun"],
                  ["WOLF Rate", "5,000 WOLF = 1 $BATTLE"],
                  ["Mint Authority", "Revoked"],
                ].map(([l, v]) => (
                  <div key={l} className="row" style={{ justifyContent: "space-between", padding: "10px 12px", background: "var(--cream)", borderRadius: 8 }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>{l}</span>
                    <span className="display tabular" style={{ fontSize: 14 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="eyebrow" style={{ marginBottom: 6 }}>Supply held by</div>
              <div className="bar thick" style={{ marginBottom: 10 }}>
                {DIST.map(d => <div key={d.label} className="bar-fill" style={{ width: `${d.pct}%`, background: d.color, height: "100%", display: "inline-block" }} title={`${d.label}: ${d.pct}%`} />)}
              </div>
              <div className="row" style={{ flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                {DIST.map(d => (
                  <div key={d.label} className="row" style={{ gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, border: "1.5px solid var(--ink)" }} />
                    <span style={{ fontSize: 12 }}>{d.label} — <b>~{d.pct}%</b></span>
                  </div>
                ))}
              </div>
              <p className="mono" style={{ fontSize: 10, color: "var(--mute)", marginBottom: 16, fontStyle: "italic" }}>
                Percentages are approximations — the buyback pool grows as the team buys more $BATTLE on pump.fun. Track the live state on the homepage.
              </p>

              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Convert WOLF to $BATTLE at a fixed 5,000:1 rate — no minimum",
                  "Trade freely on pump.fun (Solana mainnet)",
                  "Leaderboard rewards for top $BATTLE holders",
                  "Mint authority revoked, LP burned — no rug possible",
                ].map(item => (
                  <li key={item} style={{ fontSize: 14, display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--magenta)", fontWeight: 700 }}>▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Roadmap */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">05 · Roadmap</div><h2>5-phase plan</h2></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PHASES.map(p => (
                <div key={p.num} className="card" style={{ padding: 18, background: p.done ? `${p.color}22` : "var(--paper)", opacity: p.done ? 1 : 0.95 }}>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
                    <div className="display" style={{ fontSize: 18 }}>Phase {p.num} — {p.name}</div>
                    {p.done && <span className="pill" style={{ background: p.color, fontSize: 10 }}>✓ LIVE</span>}
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 4 }}>
                    {p.items.map(item => (
                      <li key={item} style={{ fontSize: 13, color: p.done ? "var(--ink)" : "var(--ink-soft)", display: "flex", gap: 6 }}>
                        <span style={{ color: p.color }}>▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="card yellow" style={{ padding: 28, textAlign: "center" }}>
            <h3 className="display" style={{ fontSize: 26, margin: "0 0 6px" }}>Start mining now</h3>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 16 }}>Register for free, run 4-hour mining sessions, and convert WOLF to $BATTLE on Solana.</p>
            <div className="row" style={{ gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/mine" className="btn lg primary">⛏ Start mining</Link>
              <Link href="/convert" className="btn lg">💱 Convert WOLF</Link>
              <a href="/VeloxFi-Whitepaper.pdf" download className="btn lg">📥 PDF</a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
