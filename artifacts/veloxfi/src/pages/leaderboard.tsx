import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

const LEADERS = [
  { rank: 1, name: "alphawolf.sol", lvl: 38, badge: "Alpha Hunter", mined: 141890, wins: 284, streak: 21, total: 241890, delta: 12, you: false },
  { rank: 2, name: "moonwolf42", lvl: 31, badge: "Plasma Wolf", mined: 98210, wins: 201, streak: 14, total: 184210, delta: 5, you: false },
  { rank: 3, name: "pumpqueen.sol", lvl: 28, badge: "Pack Leader", mined: 84440, wins: 178, streak: 18, total: 156440, delta: -2, you: false },
  { rank: 4, name: "fangmaster", lvl: 25, badge: "Hunter Rig", mined: 72100, wins: 142, streak: 9, total: 128900, delta: 8, you: false },
  { rank: 5, name: "shibakid", lvl: 22, badge: "Wolf Pup", mined: 61200, wins: 98, streak: 7, total: 108400, delta: 3, you: false },
  { rank: 6, name: "cryptobaby", lvl: 19, badge: "Rookie Wolf", mined: 52100, wins: 76, streak: 5, total: 94200, delta: -1, you: false },
  { rank: 7, name: "wolfkid.sol", lvl: 14, badge: "Rookie Wolf", mined: 2840, wins: 12, streak: 7, total: 4820, delta: 8, you: true },
];

const PODIUM = [
  { rank: 2, name: "moonwolf42", amount: "184,210 BATTLE", color: "var(--cyan)", height: 220 },
  { rank: 1, name: "alphawolf.sol", amount: "241,890 BATTLE", color: "var(--yellow)", height: 260, crown: true },
  { rank: 3, name: "pumpqueen.sol", amount: "156,440 BATTLE", color: "var(--magenta)", height: 190 },
];

const HALL_OF_FAME = [
  { title: "Biggest single win", name: "alphawolf.sol", value: "12,840 BATTLE", icon: "⚡", color: "var(--yellow)" },
  { title: "Longest streak", name: "moonwolf42", value: "42 days 🔥", icon: "🔥", color: "var(--tomato)" },
  { title: "First miner", name: "agent_zero", value: "Genesis Wolf", icon: "🐺", color: "var(--lime)" },
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("weekly");
  const [category, setCategory] = useState("total");

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Leaderboard</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>The Pack rankings.</div>
            <span className="pill yellow">Top 100 split 50,000 BATTLE weekly</span>
          </div>

          {/* Filters */}
          <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
            <div className="tabs">
              {[["daily", "Today"], ["weekly", "This week"], ["monthly", "Month"], ["all", "All-time"]].map(([id, label]) => (
                <div key={id} className={`tab${period === id ? " active" : ""}`} onClick={() => setPeriod(id)}>{label}</div>
              ))}
            </div>
            <div className="grow" />
            <div className="tabs">
              {[["total", "Total BATTLE"], ["mining", "Mining"], ["games", "Games"], ["streak", "Streak"]].map(([id, label]) => (
                <div key={id} className={`tab${category === id ? " active" : ""}`} onClick={() => setCategory(id)}>{label}</div>
              ))}
            </div>
          </div>

          {/* ── PODIUM ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, alignItems: "flex-end" }}>
            {PODIUM.map((p) => (
              <div key={p.rank} className="card" style={{ background: p.color, display: "flex", flexDirection: "column", alignItems: "center", padding: "22px 18px", minHeight: p.height, justifyContent: "flex-end" }}>
                {p.crown && <div style={{ fontSize: 32, marginBottom: 8 }}>👑</div>}
                <div style={{ width: 64, height: 64, borderRadius: 18, overflow: "hidden", border: "3px solid var(--ink)", boxShadow: "3px 3px 0 0 var(--ink)", marginBottom: 12, background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)" }}>
                  <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
                </div>
                <div className="display tabular" style={{ fontSize: 48, lineHeight: 1 }}>#{p.rank}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>{p.name}</div>
                <div className="display tabular" style={{ fontSize: 16, marginTop: 6 }}>{p.amount}</div>
              </div>
            ))}
          </div>

          {/* ── YOUR POSITION ── */}
          <div className="card ink" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
            <div className="row" style={{ position: "relative", gap: 18 }}>
              <div className="display tabular" style={{ fontSize: 64, color: "var(--cyan)", lineHeight: 1 }}>#142</div>
              <div style={{ width: 56, height: 56, borderRadius: 16, overflow: "hidden", border: "2.5px solid rgba(255,255,255,0.3)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0 }}>
                <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
              </div>
              <div style={{ flex: 1, color: "white" }}>
                <div className="display" style={{ fontSize: 22 }}>You · wolfkid.sol</div>
                <div className="row" style={{ gap: 14, marginTop: 6 }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--cyan)" }}>4,280 XP</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--magenta)" }}>+8 ranks this week</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--lime)" }}>52 ranks to top 100</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>TOTAL EARNED · WEEK</div>
                <div className="display tabular" style={{ fontSize: 28, color: "white" }}>4,820 BATTLE</div>
              </div>
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="row" style={{ padding: "14px 22px", borderBottom: "2.5px solid var(--ink)", background: "var(--cream)", fontSize: 11, color: "var(--mute)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, gap: 0 }}>
              <div style={{ width: 70 }}>Rank</div>
              <div style={{ flex: 2 }}>Wolf</div>
              <div style={{ flex: 1, textAlign: "right" }}>Mined</div>
              <div style={{ flex: 1, textAlign: "right" }}>Wins</div>
              <div style={{ flex: 1, textAlign: "right" }}>Streak</div>
              <div style={{ flex: 1.2, textAlign: "right" }}>Total</div>
              <div style={{ width: 80, textAlign: "right" }}>Δ Week</div>
            </div>
            {LEADERS.map((l, i) => (
              <div key={i} className="row" style={{ padding: "12px 22px", borderBottom: i < LEADERS.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", background: l.you ? "var(--cream-soft)" : "var(--paper)", gap: 0 }}>
                <div style={{ width: 70 }}>
                  <div className="display tabular" style={{ fontSize: 22 }}>
                    {l.rank <= 3 ? ["🥇", "🥈", "🥉"][l.rank - 1] : `#${l.rank}`}
                  </div>
                </div>
                <div className="row" style={{ flex: 2 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, overflow: "hidden", border: "2px solid var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0, marginRight: 10 }}>
                    <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{l.name} {l.you && <span className="pill cyan" style={{ fontSize: 9, padding: "1px 5px", marginLeft: 6 }}>YOU</span>}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>LVL {l.lvl} · {l.badge}</div>
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "right" }} className="mono">{l.mined.toLocaleString()}</div>
                <div style={{ flex: 1, textAlign: "right" }} className="mono">{l.wins}</div>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <span className="pill" style={{ background: l.streak >= 14 ? "var(--tomato)" : l.streak >= 7 ? "var(--yellow)" : "var(--cream)", color: l.streak >= 14 ? "white" : "var(--ink)", fontSize: 11, padding: "2px 7px" }}>
                    🔥 {l.streak}d
                  </span>
                </div>
                <div style={{ flex: 1.2, textAlign: "right" }} className="display tabular">{l.total.toLocaleString()}</div>
                <div style={{ width: 80, textAlign: "right" }}>
                  <span className="mono" style={{ color: l.delta >= 0 ? "#2A9D3C" : "var(--tomato)", fontSize: 12, fontWeight: 700 }}>
                    {l.delta >= 0 ? "▲" : "▼"} {Math.abs(l.delta)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── WEEKLY PAYOUT ── */}
          <div>
            <div className="section-title"><div><div className="eyebrow">Weekly distribution</div><h2>Top wolves eat first</h2></div></div>
            <div className="grid-4">
              {[["#1", "15,000 BATTLE", "var(--yellow)"], ["#2", "10,000 BATTLE", "var(--cyan)"], ["#3", "7,500 BATTLE", "var(--magenta)"], ["#4-100", "500 BATTLE each", "var(--paper)"]].map(([rank, prize, color]) => (
                <div className="card" key={String(rank)} style={{ background: String(color), textAlign: "center" }}>
                  <div className="display tabular" style={{ fontSize: 36 }}>{rank}</div>
                  <div className="display tabular" style={{ fontSize: 20, marginTop: 8 }}>{prize}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── HALL OF FAME ── */}
          <div>
            <div className="section-title"><div><div className="eyebrow">Legends</div><h2>Hall of fame</h2></div></div>
            <div className="grid-3">
              {HALL_OF_FAME.map((h) => (
                <div className="card" key={h.title} style={{ background: h.color }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{h.icon}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--mute)", textTransform: "uppercase", letterSpacing: 1 }}>{h.title}</div>
                  <div className="display" style={{ fontSize: 22, marginTop: 4 }}>{h.name}</div>
                  <div style={{ fontSize: 14, marginTop: 6, fontWeight: 600 }}>{h.value}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
