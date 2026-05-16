import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useLeaderboard, shortAddr, type LeaderboardEntry } from "@/lib/veloxfiApi";

const PODIUM_COLORS = ["var(--yellow)", "var(--cyan)", "var(--magenta)"];

function badgeForRank(rank: number, level: number): string {
  if (rank === 1) return "Alpha Hunter";
  if (rank <= 3)  return "Pack Leader";
  if (rank <= 10) return "Plasma Wolf";
  if (level >= 20) return "Hunter Rig";
  if (level >= 10) return "Wolf Pup";
  return "Rookie Wolf";
}

function PodiumCard({ entry, height, crown }: { entry: LeaderboardEntry; height: number; crown?: boolean }) {
  return (
    <div className="card" style={{ background: PODIUM_COLORS[entry.rank - 1] ?? "var(--paper)", display: "flex", flexDirection: "column", alignItems: "center", padding: "22px 18px", minHeight: height, justifyContent: "flex-end" }}>
      {crown && <div style={{ fontSize: 32, marginBottom: 8 }}>👑</div>}
      <div style={{ width: 64, height: 64, borderRadius: 18, overflow: "hidden", border: "3px solid var(--ink)", boxShadow: "3px 3px 0 0 var(--ink)", marginBottom: 12, background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)" }}>
        <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
      </div>
      <div className="display tabular" style={{ fontSize: 48, lineHeight: 1 }}>#{entry.rank}</div>
      <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4, wordBreak: "break-all", textAlign: "center" }}>{entry.username}</div>
      <div className="display tabular" style={{ fontSize: 16, marginTop: 6 }}>{entry.tokens.toLocaleString()} BATTLE</div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("all");
  const [category, setCategory] = useState("total");
  const { user } = useAuth();
  const data = useLeaderboard(user?.username, 100);

  const leaders = data?.leaderboard ?? [];
  const top3 = leaders.slice(0, 3);
  const yourEntry = data?.yourEntry ?? leaders.find(l => l.isYou) ?? null;

  // Reorder podium so #1 is in the middle visually (2nd-1st-3rd)
  const podium: LeaderboardEntry[] = [];
  if (top3[1]) podium.push(top3[1]);
  if (top3[0]) podium.push(top3[0]);
  if (top3[2]) podium.push(top3[2]);

  const isLoading = data == null;
  const isEmpty   = !isLoading && leaders.length === 0;

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Leaderboard</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>The Pack rankings.</div>
            <span className="pill yellow">Top 100 split weekly</span>
          </div>

          {/* Filters — visual only for now; the API returns lifetime totals */}
          <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
            <div className="tabs">
              {[["all", "All-time"], ["weekly", "This week"], ["monthly", "Month"], ["daily", "Today"]].map(([id, label]) => (
                <div key={id} className={`tab${period === id ? " active" : ""}`} onClick={() => setPeriod(id)}>{label}</div>
              ))}
            </div>
            <div className="grow" />
            <div className="tabs">
              {[["total", "Total BATTLE"], ["wolf", "WOLF"], ["games", "Games"], ["xp", "XP"]].map(([id, label]) => (
                <div key={id} className={`tab${category === id ? " active" : ""}`} onClick={() => setCategory(id)}>{label}</div>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--mute)" }}>Loading leaderboard…</div>
          )}

          {isEmpty && (
            <div className="card" style={{ padding: 30, textAlign: "center" }}>
              <div className="display" style={{ fontSize: 22 }}>No wolves yet</div>
              <div style={{ fontSize: 13, color: "var(--mute)", marginTop: 6 }}>Be the first to mine and claim, and your name will appear here.</div>
            </div>
          )}

          {/* ── PODIUM ── */}
          {podium.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${podium.length}, 1fr)`, gap: 18, alignItems: "flex-end" }}>
              {podium.map(p => (
                <PodiumCard key={p.username} entry={p} height={p.rank === 1 ? 260 : p.rank === 2 ? 220 : 190} crown={p.rank === 1} />
              ))}
            </div>
          )}

          {/* ── YOUR POSITION ── */}
          {yourEntry && (
            <div className="card ink" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
              <div className="row" style={{ position: "relative", gap: 18 }}>
                <div className="display tabular" style={{ fontSize: 64, color: "var(--cyan)", lineHeight: 1 }}>#{yourEntry.rank}</div>
                <div style={{ width: 56, height: 56, borderRadius: 16, overflow: "hidden", border: "2.5px solid rgba(255,255,255,0.3)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0 }}>
                  <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
                </div>
                <div style={{ flex: 1, color: "white" }}>
                  <div className="display" style={{ fontSize: 22 }}>You · {yourEntry.username}</div>
                  <div className="row" style={{ gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                    <span className="mono" style={{ fontSize: 12, color: "var(--cyan)" }}>{yourEntry.xp.toLocaleString()} XP</span>
                    <span className="mono" style={{ fontSize: 12, color: "var(--magenta)" }}>LVL {yourEntry.level}</span>
                    <span className="mono" style={{ fontSize: 12, color: "var(--lime)" }}>{yourEntry.gamesPlayed} games played</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>TOTAL EARNED</div>
                  <div className="display tabular" style={{ fontSize: 28, color: "white" }}>{yourEntry.tokens.toLocaleString()} BATTLE</div>
                </div>
              </div>
            </div>
          )}

          {/* ── TABLE ── */}
          {leaders.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="row" style={{ padding: "14px 22px", borderBottom: "2.5px solid var(--ink)", background: "var(--cream)", fontSize: 11, color: "var(--mute)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, gap: 0 }}>
                <div style={{ width: 70 }}>Rank</div>
                <div style={{ flex: 2 }}>Wolf</div>
                <div style={{ flex: 1, textAlign: "right" }}>WOLF</div>
                <div style={{ flex: 1, textAlign: "right" }}>Games</div>
                <div style={{ flex: 1, textAlign: "right" }}>XP</div>
                <div style={{ flex: 1.2, textAlign: "right" }}>$BATTLE</div>
              </div>
              {leaders.map((l, i) => (
                <div key={l.username} className="row" style={{ padding: "12px 22px", borderBottom: i < leaders.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", background: l.isYou ? "var(--cream-soft)" : "var(--paper)", gap: 0 }}>
                  <div style={{ width: 70 }}>
                    <div className="display tabular" style={{ fontSize: 22 }}>
                      {l.rank <= 3 ? ["🥇", "🥈", "🥉"][l.rank - 1] : `#${l.rank}`}
                    </div>
                  </div>
                  <div className="row" style={{ flex: 2 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, overflow: "hidden", border: "2px solid var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0, marginRight: 10 }}>
                      <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {l.username}
                        {l.isYou && <span className="pill cyan" style={{ fontSize: 9, padding: "1px 5px", marginLeft: 6 }}>YOU</span>}
                      </div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>LVL {l.level} · {badgeForRank(l.rank, l.level)}{l.walletAddress ? ` · ${shortAddr(l.walletAddress)}` : ""}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }} className="mono">{l.wolf.toLocaleString()}</div>
                  <div style={{ flex: 1, textAlign: "right" }} className="mono">{l.gamesPlayed}</div>
                  <div style={{ flex: 1, textAlign: "right" }} className="mono">{l.xp.toLocaleString()}</div>
                  <div style={{ flex: 1.2, textAlign: "right" }} className="display tabular">{l.tokens.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── WEEKLY PAYOUT (config) ── */}
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

        </div>
      </main>
    </div>
  );
}
