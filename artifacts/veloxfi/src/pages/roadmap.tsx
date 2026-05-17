import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Sidebar } from "@/components/Sidebar";

type Status = "done" | "active" | "upcoming";

const PHASES: { num: number; label: string; emoji: string; status: Status; color: string; items: string[] }[] = [
  { num: 1, label: "Build & launch", emoji: "🔥", status: "done",     color: "var(--lime)",
    items: ["$BATTLE token launched on pump.fun", "Free 4-hour WOLF mining live", "Wallet linking + Solana payouts", "Website live at veloxfi.io", "Community started on Telegram & X"] },
  { num: 2, label: "Grow",            emoji: "📈", status: "active",   color: "var(--cyan)",
    items: ["Live leaderboard (top $BATTLE holders)", "Mobile-friendly experience", "Daily streak rewards", "Referral system: earn bonus WOLF", "Influencer partnerships", "Community milestones & giveaways"] },
  { num: 3, label: "Distribute",      emoji: "💱", status: "upcoming", color: "var(--yellow)",
    items: ["Capped buyback distribution pool (95M $BATTLE)", "Conversion waitlist when pool depletes", "Live emission tracker on homepage", "Transparent buyback receipts", "Holder count >5k"] },
  { num: 4, label: "Scale",           emoji: "🚀", status: "upcoming", color: "var(--magenta)",
    items: ["DexScreener listing (post-migration)", "Raydium liquidity migration", "Native mobile experience", "CEX listing pursuit", "Ambassador program"] },
  { num: 5, label: "Global expansion", emoji: "🌍", status: "upcoming", color: "var(--lavender)",
    items: ["Community treasury and DAO voting", "Wolf NFT mint", "Multi-language platform support", "Merch drop and IRL meetups", "Cross-chain bridge"] },
];

const statusPill = (s: Status) => s === "done" ? "✓ LIVE" : s === "active" ? "IN PROGRESS" : "UPCOMING";

export default function Roadmap() {
  usePageMeta({
    title: "Roadmap — VeloxFi | From pump.fun launch to global distribution",
    description: "Follow the VeloxFi roadmap. From our pump.fun token launch and free WOLF mining, to capped buyback distribution, Raydium migration, CEX listings and global expansion.",
    canonical: "https://veloxfi.io/roadmap",
  });

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          <div className="topbar">
            <div className="crumb">Home / <b>Roadmap</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>From pump.fun launch to global distribution.</div>
            <span className="pill lavender">🗺️ 5 phases</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
            {/* Vertical spine */}
            <div style={{ position: "absolute", left: 22, top: 10, bottom: 10, width: 2, background: "linear-gradient(to bottom, var(--lime), var(--cyan), var(--yellow), var(--magenta), var(--lavender))", borderRadius: 2, zIndex: 0 }} />

            {PHASES.map(phase => {
              const done = phase.status === "done";
              const active = phase.status === "active";
              return (
                <div key={phase.num} className="row" style={{ alignItems: "flex-start", gap: 16, position: "relative", zIndex: 1 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, background: done ? phase.color : active ? phase.color : "var(--paper)",
                    border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: done ? "3px 3px 0 var(--ink)" : "2px 2px 0 var(--ink)", flexShrink: 0, fontSize: 20,
                    opacity: phase.status === "upcoming" ? 0.7 : 1,
                  }}>
                    {phase.emoji}
                  </div>

                  <div className="card" style={{ flex: 1, padding: 20, opacity: phase.status === "upcoming" ? 0.85 : 1, background: done ? `${phase.color}22` : active ? `${phase.color}14` : "var(--paper)" }}>
                    <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                      <div>
                        <div className="eyebrow">Phase {phase.num}</div>
                        <div className="display" style={{ fontSize: 22, lineHeight: 1.1 }}>{phase.label}</div>
                      </div>
                      <span className="pill" style={{
                        background: done ? phase.color : active ? phase.color : "var(--cream)",
                        color: done ? "var(--ink)" : active ? "var(--ink)" : "var(--mute)", fontSize: 11,
                      }}>{statusPill(phase.status)}</span>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 6 }}>
                      {phase.items.map(item => (
                        <li key={item} style={{ fontSize: 13, color: phase.status === "upcoming" ? "var(--mute)" : "var(--ink)", display: "flex", gap: 6 }}>
                          <span style={{ color: phase.color, fontWeight: 700, flexShrink: 0 }}>▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card yellow" style={{ padding: 30, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🚀</div>
            <h2 className="display" style={{ fontSize: 28, margin: "0 0 6px" }}>Join the journey</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 18 }}>We're in Phase 2 — start mining, climb the leaderboard, and be part of the early pack.</p>
            <div className="row" style={{ gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/mine" className="btn lg primary">⛏ Start mining</Link>
              <Link href="/convert" className="btn lg">💱 Convert WOLF</Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
