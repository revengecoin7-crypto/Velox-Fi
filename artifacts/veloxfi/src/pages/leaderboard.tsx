import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useLeaderboard, shortAddr, type LeaderboardEntry, type LeaderboardSort, type LeaderboardPeriod } from "@/lib/veloxfiApi";

const PODIUM_COLORS = ["var(--yellow)", "var(--cyan)", "var(--magenta)"];

function badgeForRank(rank: number, level: number): string {
  if (rank === 1) return "Alpha Hunter";
  if (rank <= 3)  return "Pack Leader";
  if (rank <= 10) return "Plasma Wolf";
  if (level >= 20) return "Hunter Rig";
  if (level >= 10) return "Wolf Pup";
  return "Rookie Wolf";
}

const SORT_OPTIONS: { id: LeaderboardSort; label: string; unit: string; isEarned?: boolean }[] = [
  { id: "battle", label: "$BATTLE balance", unit: "$BATTLE" },
  { id: "wolf",   label: "WOLF balance",     unit: "WOLF" },
  { id: "xp",     label: "XP",               unit: "XP" },
  { id: "refs",   label: "Referrals",        unit: "refs" },
  { id: "earned", label: "WOLF earned",      unit: "WOLF", isEarned: true },
];

const PERIOD_OPTIONS: { id: LeaderboardPeriod; label: string }[] = [
  { id: "all",   label: "All-time" },
  { id: "today", label: "Today" },
  { id: "week",  label: "This week" },
  { id: "month", label: "This month" },
];

function primaryValue(entry: LeaderboardEntry, sort: LeaderboardSort): { value: string; unit: string } {
  switch (sort) {
    case "wolf":    return { value: entry.wolf.toLocaleString(),          unit: "WOLF" };
    case "xp":      return { value: entry.xp.toLocaleString(),            unit: "XP" };
    case "refs":    return { value: String(entry.referralCount),          unit: "refs" };
    case "earned":  return { value: entry.earnedAmount.toLocaleString(),  unit: "WOLF" };
    default:        return { value: entry.tokens.toLocaleString(),        unit: "$BATTLE" };
  }
}

function PodiumCard({ entry, height, crown, sort }: { entry: LeaderboardEntry; height: number; crown?: boolean; sort: LeaderboardSort }) {
  const pv = primaryValue(entry, sort);
  return (
    <div className="card" style={{ background: PODIUM_COLORS[entry.rank - 1] ?? "var(--paper)", display: "flex", flexDirection: "column", alignItems: "center", padding: "22px 18px", minHeight: height, justifyContent: "flex-end" }}>
      {crown && <div style={{ fontSize: 32, marginBottom: 8 }}>👑</div>}
      <div style={{ width: 64, height: 64, borderRadius: 18, overflow: "hidden", border: "3px solid var(--ink)", boxShadow: "3px 3px 0 0 var(--ink)", marginBottom: 12, background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)" }}>
        <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
      </div>
      <div className="display tabular" style={{ fontSize: 48, lineHeight: 1 }}>#{entry.rank}</div>
      <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4, wordBreak: "break-all", textAlign: "center" }}>{entry.username}</div>
      <div className="display tabular" style={{ fontSize: 16, marginTop: 6 }}>{pv.value} {pv.unit}</div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [sort,   setSort]   = useState<LeaderboardSort>("battle");
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");

  const data = useLeaderboard(user?.username, 100, sort, period);
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
  const periodEnabled = sort === "earned"; // period only applies to earned view

  // Reset period when switching away from "earned"
  function changeSort(s: LeaderboardSort) {
    setSort(s);
    if (s !== "earned" && period !== "all") setPeriod("all");
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Leaderboard</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>The Pack rankings.</div>
            <span className="pill dot">LIVE</span>
          </div>

          {/* Filters */}
          <div className="row" style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: 1, marginBottom: 4 }}>SORT BY</div>
              <div className="tabs">
                {SORT_OPTIONS.map(opt => (
                  <div key={opt.id} className={`tab${sort === opt.id ? " active" : ""}`} onClick={() => changeSort(opt.id)}>{opt.label}</div>
                ))}
              </div>
            </div>
            <div className="grow" />
            <div style={{ opacity: periodEnabled ? 1 : 0.45 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: 1, marginBottom: 4 }}>
                PERIOD{!periodEnabled && " · earned view only"}
              </div>
              <div className="tabs">
                {PERIOD_OPTIONS.map(opt => (
                  <div key={opt.id} className={`tab${period === opt.id ? " active" : ""}`} onClick={() => periodEnabled && setPeriod(opt.id)}>{opt.label}</div>
                ))}
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--mute)" }}>Loading leaderboard…</div>
          )}

          {isEmpty && (
            <div className="card" style={{ padding: 30, textAlign: "center" }}>
              <div className="display" style={{ fontSize: 22 }}>No wolves yet</div>
              <div style={{ fontSize: 13, color: "var(--mute)", marginTop: 6 }}>
                {sort === "earned"
                  ? "Nothing earned in this period yet. Mine, claim, spin or open a chest to land on the board."
                  : "Be the first to mine and claim, and your name will appear here."}
              </div>
            </div>
          )}

          {/* PODIUM */}
          {podium.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${podium.length}, 1fr)`, gap: 18, alignItems: "flex-end" }}>
              {podium.map(p => (
                <PodiumCard key={p.username} entry={p} height={p.rank === 1 ? 260 : p.rank === 2 ? 220 : 190} crown={p.rank === 1} sort={sort} />
              ))}
            </div>
          )}

          {/* YOUR POSITION */}
          {yourEntry && (
            <div className="card ink" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
              <div className="row" style={{ position: "relative", gap: 18, flexWrap: "wrap" }}>
                <div className="display tabular" style={{ fontSize: 64, color: "var(--cyan)", lineHeight: 1 }}>#{yourEntry.rank}</div>
                <div style={{ width: 56, height: 56, borderRadius: 16, overflow: "hidden", border: "2.5px solid rgba(255,255,255,0.3)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0 }}>
                  <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
                </div>
                <div style={{ flex: 1, color: "white", minWidth: 200 }}>
                  <div className="display" style={{ fontSize: 22 }}>You · {yourEntry.username}</div>
                  <div className="row" style={{ gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                    <span className="mono" style={{ fontSize: 12, color: "var(--cyan)" }}>{yourEntry.xp.toLocaleString()} XP</span>
                    <span className="mono" style={{ fontSize: 12, color: "var(--magenta)" }}>LVL {yourEntry.level}</span>
                    <span className="mono" style={{ fontSize: 12, color: "var(--lime)" }}>{yourEntry.referralCount} referrals</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
                    {sort === "earned" ? `EARNED ${period === "all" ? "ALL-TIME" : period.toUpperCase()}` : "BALANCE"}
                  </div>
                  <div className="display tabular" style={{ fontSize: 28, color: "white" }}>
                    {primaryValue(yourEntry, sort).value} <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{primaryValue(yourEntry, sort).unit}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TABLE */}
          {leaders.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="row" style={{ padding: "14px 22px", borderBottom: "2.5px solid var(--ink)", background: "var(--cream)", fontSize: 11, color: "var(--mute)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, gap: 0 }}>
                <div style={{ width: 70 }}>Rank</div>
                <div style={{ flex: 2 }}>Wolf</div>
                <div style={{ flex: 1, textAlign: "right" }}>WOLF</div>
                <div style={{ flex: 1, textAlign: "right" }}>Refs</div>
                <div style={{ flex: 1, textAlign: "right" }}>XP</div>
                <div style={{ flex: 1.2, textAlign: "right" }}>{sort === "earned" ? `Earned (${period})` : "$BATTLE"}</div>
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
                  <div style={{ flex: 1, textAlign: "right" }} className="mono">{l.referralCount}</div>
                  <div style={{ flex: 1, textAlign: "right" }} className="mono">{l.xp.toLocaleString()}</div>
                  <div style={{ flex: 1.2, textAlign: "right" }} className="display tabular">
                    {sort === "earned" ? l.earnedAmount.toLocaleString() : l.tokens.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Explainer */}
          <div className="card cream" style={{ padding: 18 }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--mute)", letterSpacing: 1, marginBottom: 6 }}>HOW THIS BOARD WORKS</div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink-soft)" }}>
              Rankings are live, refreshed every 30 seconds. The <b>WOLF earned</b> view sums every WOLF reward (mining claims, daily spins, chests, milestones, bounties, referrals) within the selected period. The other views show current account snapshots — period is only relevant for "WOLF earned".
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
