import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { calcUserStats } from "@/lib/userStats";
import { useActivityFeed, relativeTime } from "@/lib/veloxfiApi";
import { useTokenStats } from "@/lib/tokenStats";

const ACTIVITY_COLORS: Record<string, string> = {
  claim:       "var(--cyan)",
  battle_win:  "var(--lime)",
  battle_loss: "var(--mute)",
  achievement: "var(--magenta)",
  mission:     "var(--yellow)",
  referral:    "var(--cyan)",
  level_up:    "var(--magenta)",
};

// ── Pack Tiers (based on WOLF balance) ─────────────────────────────────────
const TIERS = [
  { name: "Bronze",  icon: "🥉", min: 0,      max: 999,      color: "#CD7F32",      bonus: 0,   desc: "All wolves start here." },
  { name: "Silver",  icon: "🥈", min: 1000,   max: 4999,     color: "#C0C0C0",      bonus: 10,  desc: "+10% mining bonus." },
  { name: "Gold",    icon: "🥇", min: 5000,   max: 19999,    color: "var(--yellow)",bonus: 25,  desc: "+25% mining bonus." },
  { name: "Diamond", icon: "💎", min: 20000,  max: 99999,    color: "var(--cyan)",  bonus: 50,  desc: "+50% mining bonus." },
  { name: "Alpha",   icon: "👑", min: 100000, max: Infinity, color: "#FFD700",      bonus: 100, desc: "+100% · permanent title." },
];

function PackTiers({ wolfBalance }: { wolfBalance: number }) {
  const tierIdx = TIERS.findIndex(t => wolfBalance >= t.min && wolfBalance < t.max);
  const tier = TIERS[Math.max(0, tierIdx)];
  const nextTier = TIERS[tierIdx + 1];
  const pct = nextTier ? Math.min(100, ((wolfBalance - tier.min) / (nextTier.min - tier.min)) * 100) : 100;

  return (
    <div>
      <div className="section-title">
        <div><div className="eyebrow">Pack tiers</div><h2>Rank up your wolf</h2></div>
        <div className="grow" />
        <span className="pill" style={{ background: tier.color, fontSize: 11 }}>{tier.icon} {tier.name}</span>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18, background: `linear-gradient(120deg, ${tier.color}22, var(--paper))` }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "center" }}>
          <div style={{ fontSize: 56 }}>{tier.icon}</div>
          <div>
            <div className="display" style={{ fontSize: 28 }}>{tier.name}</div>
            <div style={{ fontSize: 13, color: "var(--mute)", marginTop: 2 }}>{tier.desc}</div>
            {nextTier && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>PROGRESS TO {nextTier.name.toUpperCase()}</span>
                  <span className="mono" style={{ fontSize: 10 }}>{wolfBalance.toLocaleString()} / {nextTier.min.toLocaleString()} WOLF</span>
                </div>
                <div className="bar thick"><div className="bar-fill" style={{ width: `${pct}%`, background: nextTier.color }} /></div>
                <div style={{ fontSize: 11, color: "var(--mute)", marginTop: 6 }}>Need {(nextTier.min - wolfBalance).toLocaleString()} more WOLF</div>
              </>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>MINING BONUS</div>
            <div className="display tabular" style={{ fontSize: 36, color: tier.bonus > 0 ? "var(--lime)" : "var(--mute)" }}>+{tier.bonus}%</div>
            {tier.name === "Alpha" && <div className="pill" style={{ background: "#FFD700", fontSize: 10, marginTop: 6 }}>PERMANENT</div>}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }} className="tier-grid">
        {TIERS.map((t, i) => {
          const isCurrent = i === Math.max(0, tierIdx);
          const unlocked = wolfBalance >= t.min;
          return (
            <div key={t.name} className="card" style={{ padding: 14, textAlign: "center", background: isCurrent ? `${t.color}33` : "var(--paper)", border: isCurrent ? `2.5px solid ${t.color}` : "2.5px solid var(--ink)", opacity: unlocked ? 1 : 0.5 }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{t.icon}</div>
              <div className="display" style={{ fontSize: 14 }}>{t.name}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--mute)", marginTop: 2 }}>{t.min === 0 ? "0" : t.min.toLocaleString()} WOLF</div>
              <div className="display tabular" style={{ fontSize: 14, color: t.bonus > 0 ? "var(--lime)" : "var(--mute)", marginTop: 4 }}>+{t.bonus}%</div>
              {isCurrent && <div className="pill" style={{ fontSize: 9, marginTop: 6, background: t.color, padding: "2px 6px" }}>YOURS</div>}
              {!unlocked && <div style={{ fontSize: 11, marginTop: 4 }}>🔒</div>}
            </div>
          );
        })}
      </div>
      <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 10, textAlign: "center" }}>
        Tier is based on your WOLF balance. Higher tiers earn future mining bonuses.
      </div>
    </div>
  );
}

function fmtHMS(totalSeconds: number): string {
  if (totalSeconds <= 0) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Mine() {
  const { user, getMiningProgress, startMiningSession, claimMiningReward } = useAuth();
  const stats = calcUserStats(user);
  const tokenStats = useTokenStats();
  const activity = useActivityFeed();

  // Tick every second to keep the timer + claimable counter live
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const [busy, setBusy] = useState<"" | "start" | "claim">("");
  const [pulsing, setPulsing] = useState(false);

  const progress = getMiningProgress();
  const isMining   = progress.active;
  const isComplete = !progress.active && progress.wolfEarned > 0;
  const isIdle     = !progress.active && progress.wolfEarned === 0;

  async function handleStart() {
    setBusy("start");
    await startMiningSession();
    setBusy("");
  }

  async function handleClaim() {
    setBusy("claim");
    setPulsing(true);
    await claimMiningReward();
    setPulsing(false);
    setBusy("");
  }

  const price       = tokenStats?.price ?? 0;
  const battleUsd   = (user?.battle ?? 0) * price;
  const wolfAsBattle = (user?.wolf ?? 0) / 5000;

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 30 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Mining Hub</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>
              {isMining ? "Your rig is running." : isComplete ? "Session complete — claim your WOLF." : "Ready to mine."}
            </div>
            <div className="pill">{user?.username ?? "guest"}</div>
          </div>

          {/* ── HERO ROW ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18 }} className="hero-row">

            {/* RIG PANEL */}
            <div className="card ink" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.85 }}>
                <img src="/mascot.jpg" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} alt="" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,11,26,0.2) 0%, rgba(11,11,26,0.95) 70%)" }} />
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 20%, rgba(255,43,214,0.25), transparent 50%)" }} />
              </div>
              <div style={{ position: "relative", padding: 28, minHeight: 360, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "white" }}>
                <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div className="row" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", border: `2px solid ${isMining ? "var(--cyan)" : isComplete ? "var(--lime)" : "rgba(255,255,255,0.3)"}`, padding: "6px 12px", borderRadius: 99, gap: 8 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: 99, flexShrink: 0,
                      background: isMining ? "var(--lime)" : isComplete ? "var(--lime)" : "var(--mute)",
                      boxShadow: isMining ? "0 0 8px var(--lime)" : isComplete ? "0 0 8px var(--lime)" : "none",
                    }} />
                    <span className="mono" style={{ fontSize: 11, color: isMining ? "var(--cyan)" : isComplete ? "var(--lime)" : "rgba(255,255,255,0.7)" }}>
                      {isMining ? "RIG ONLINE" : isComplete ? "READY TO CLAIM" : "RIG IDLE"}
                    </span>
                  </div>
                  {isMining && (
                    <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                      SESSION · {fmtHMS(progress.secondsLeft)} left
                    </div>
                  )}
                </div>

                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--cyan)", letterSpacing: 2 }}>
                    {isMining ? "WOLF EARNED SO FAR" : isComplete ? "WOLF READY TO CLAIM" : "WOLF MINED THIS SESSION"}
                  </div>
                  <div className="row" style={{ alignItems: "flex-end", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                    <div className="display tabular" style={{ fontSize: 72, lineHeight: 0.9, color: "white" }}>{progress.wolfEarned}</div>
                    <div className="display" style={{ fontSize: 24, color: "var(--magenta)", paddingBottom: 8 }}>WOLF</div>
                    <div style={{ flex: 1 }} />
                    <div className="mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", paddingBottom: 8 }}>
                      ≈ {(progress.wolfEarned / 5000).toFixed(4)} $BATTLE
                    </div>
                  </div>

                  {/* Progress bar */}
                  {isMining && (
                    <div style={{ marginTop: 14 }}>
                      <div className="bar thick" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="bar-fill" style={{ width: `${progress.percentDone}%`, background: "var(--cyan)" }} />
                      </div>
                      <div className="row" style={{ marginTop: 6, justifyContent: "space-between" }}>
                        <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{progress.percentDone.toFixed(1)}% complete</span>
                        <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{progress.minutesLeft} min left · max 240 WOLF</span>
                      </div>
                    </div>
                  )}

                  <div className="row" style={{ gap: 24, marginTop: 18, flexWrap: "wrap" }}>
                    {[
                      { label: "Tier",          value: `${stats.tier.icon} ${stats.tier.name}`, color: "var(--magenta)" },
                      { label: "Mining bonus",  value: `+${stats.tier.bonus}%`,                  color: "var(--lime)" },
                      { label: "Daily streak",  value: `${stats.dailyStreak}d`,                  color: "var(--yellow)" },
                      { label: "Rig level",     value: String(stats.level),                       color: "var(--cyan)" },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="mono" style={{ fontSize: 10, color: s.color, letterSpacing: 1.4 }}>{s.label.toUpperCase()}</div>
                        <div className="display tabular" style={{ fontSize: 22, color: "white", marginTop: 2 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="row" style={{ gap: 10, marginTop: 22, flexWrap: "wrap" }}>
                    {isIdle && (
                      <button className="btn lg primary" onClick={handleStart} disabled={busy === "start" || !user}>
                        {busy === "start" ? "Starting…" : "⛏ Start mining session"}
                      </button>
                    )}
                    {isMining && (
                      <button className="btn lg" disabled style={{ opacity: 0.6, color: "white", borderColor: "rgba(255,255,255,0.3)", background: "transparent" }}>
                        Mining in progress · {fmtHMS(progress.secondsLeft)}
                      </button>
                    )}
                    {isComplete && (
                      <button className="btn lg magenta" onClick={handleClaim} disabled={busy === "claim"} style={pulsing ? { animation: "pulse-ring 0.6s ease-out" } : {}}>
                        {busy === "claim" ? "Claiming…" : `💰 Claim ${progress.wolfEarned} WOLF`}
                      </button>
                    )}
                    {!user && <Link href="/login" className="btn lg primary">Sign in to start mining</Link>}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Daily streak */}
              <div className="card yellow">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div className="stat-label">Daily streak</div>
                    <div className="row" style={{ gap: 6, marginTop: 8 }}>
                      <div className="display tabular" style={{ fontSize: 44, lineHeight: 1 }}>{stats.dailyStreak}</div>
                      <span style={{ fontSize: 32 }}>🔥</span>
                    </div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Log in and claim daily to keep the streak alive.</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "end" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 14px)", gap: 4 }}>
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div key={i} style={{ width: 14, height: 14, borderRadius: 4, border: "1.5px solid var(--ink)", background: i < stats.dailyStreak ? "var(--tomato)" : "rgba(11,11,26,0.06)" }} />
                      ))}
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 4 }}>{Math.min(stats.dailyStreak, 14)} of 14 days</div>
                  </div>
                </div>
              </div>

              {/* Level progress */}
              <div className="card">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="stat-label">Level progress</div>
                  <span className="pill yellow" style={{ fontSize: 10 }}>LVL {stats.level} → {stats.level + 1}</span>
                </div>
                <div className="row" style={{ alignItems: "flex-end", gap: 8, marginTop: 6 }}>
                  <div className="display tabular" style={{ fontSize: 28 }}>{stats.xp.toLocaleString()}</div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--mute)", paddingBottom: 4 }}>/ {stats.xpToNextLevel.toLocaleString()} XP</div>
                </div>
                <div className="bar thick" style={{ marginTop: 10 }}>
                  <div className="bar-fill" style={{ width: `${Math.min((stats.xp / stats.xpToNextLevel) * 100, 100)}%`, background: "var(--magenta)" }} />
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: "var(--mute)" }}>
                  {Math.max(0, stats.xpToNextLevel - stats.xp).toLocaleString()} XP to next level · earn XP by claiming sessions and converting WOLF
                </div>
              </div>

              {/* Balance */}
              <div className="card cyan">
                <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div className="stat-label">Your balances</div>
                    <div className="row" style={{ gap: 16, alignItems: "flex-end", marginTop: 6, flexWrap: "wrap" }}>
                      <div>
                        <div className="display tabular" style={{ fontSize: 28, lineHeight: 1 }}>{(user?.wolf ?? 0).toLocaleString()}</div>
                        <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>WOLF</div>
                      </div>
                      <div>
                        <div className="display tabular" style={{ fontSize: 22, lineHeight: 1 }}>{(user?.battle ?? 0).toFixed(4)}</div>
                        <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>$BATTLE</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, marginTop: 8 }}>
                      ≈ {wolfAsBattle.toFixed(4)} $BATTLE in WOLF · {price > 0 ? `wallet ≈ $${battleUsd.toFixed(2)}` : "wallet ≈ —"}
                    </div>
                  </div>
                  <Link href="/convert" className="btn ink">Convert →</Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── ACTIVITY FEED (full width) ── */}
          <div className="card">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div className="eyebrow">Pack activity</div>
                <div className="display" style={{ fontSize: 22, marginTop: 4, lineHeight: 1 }}>Live feed</div>
              </div>
              <span className="pill dot" style={{ fontSize: 10 }}>LIVE</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {activity.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "var(--mute)", fontSize: 13 }}>
                  No activity yet. Be the first to mine, claim a reward, or hit a milestone.
                </div>
              ) : activity.slice(0, 12).map((a, i, arr) => (
                <div key={a.id} className="row" style={{ padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, overflow: "hidden", border: "2px solid var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0 }}>
                    <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}><b>{a.username}</b> {a.message}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 2 }}>{relativeTime(a.createdAt)}</div>
                  </div>
                  <div className="display" style={{ fontSize: 12, color: ACTIVITY_COLORS[a.type] ?? "var(--mute)", textTransform: "uppercase" }}>{a.type.replace(/_/g, " ")}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PACK TIERS ── */}
          <PackTiers wolfBalance={user?.wolf ?? 0} />

        </div>
      </main>
    </div>
  );
}
