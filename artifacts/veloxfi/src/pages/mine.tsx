import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { calcUserStats } from "@/lib/userStats";
import { useActivityFeed, relativeTime } from "@/lib/veloxfiApi";

const ACTIVITY_COLORS: Record<string, string> = {
  claim:       "var(--cyan)",
  battle_win:  "var(--lime)",
  battle_loss: "var(--mute)",
  achievement: "var(--magenta)",
  mission:     "var(--yellow)",
  referral:    "var(--cyan)",
  level_up:    "var(--magenta)",
};

// ── Pack Tiers ─────────────────────────────────────────────────────────────
const TIERS = [
  { name: "Bronze",  icon: "🥉", min: 0,      max: 999,    color: "#CD7F32", bonus: 0,   desc: "All wolves start here." },
  { name: "Silver",  icon: "🥈", min: 1000,   max: 4999,   color: "#C0C0C0", bonus: 10,  desc: "+10% mining rate." },
  { name: "Gold",    icon: "🥇", min: 5000,   max: 19999,  color: "var(--yellow)", bonus: 25, desc: "+25% mining rate." },
  { name: "Diamond", icon: "💎", min: 20000,  max: 99999,  color: "var(--cyan)", bonus: 50,  desc: "+50% mining rate." },
  { name: "Alpha",   icon: "👑", min: 100000, max: Infinity, color: "#FFD700", bonus: 100, desc: "+100% · permanent title." },
];

function PackTiers({ balance }: { balance: number }) {
  const tierIdx = TIERS.findIndex((t) => balance >= t.min && balance < t.max);
  const tier = TIERS[Math.max(0, tierIdx)];
  const nextTier = TIERS[tierIdx + 1];
  const pct = nextTier ? Math.min(100, ((balance - tier.min) / (nextTier.min - tier.min)) * 100) : 100;

  return (
    <div>
      <div className="section-title">
        <div><div className="eyebrow">Pack tiers</div><h2>Rank up your wolf</h2></div>
        <div className="grow" />
        <span className="pill" style={{ background: tier.color, fontSize: 11 }}>{tier.icon} {tier.name}</span>
      </div>

      {/* Current tier card */}
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
                  <span className="mono" style={{ fontSize: 10 }}>{balance.toLocaleString()} / {nextTier.min.toLocaleString()} $BATTLE</span>
                </div>
                <div className="bar thick"><div className="bar-fill" style={{ width: `${pct}%`, background: nextTier.color }} /></div>
                <div style={{ fontSize: 11, color: "var(--mute)", marginTop: 6 }}>Need {(nextTier.min - balance).toLocaleString()} more $BATTLE</div>
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

      {/* All tiers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {TIERS.map((t, i) => {
          const isCurrent = i === Math.max(0, tierIdx);
          const unlocked = balance >= t.min;
          return (
            <div key={t.name} className="card" style={{ padding: 14, textAlign: "center", background: isCurrent ? `${t.color}33` : "var(--paper)", border: isCurrent ? `2.5px solid ${t.color}` : "2.5px solid var(--ink)", opacity: unlocked ? 1 : 0.5 }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{t.icon}</div>
              <div className="display" style={{ fontSize: 14 }}>{t.name}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--mute)", marginTop: 2 }}>{t.min === 0 ? "0" : t.min.toLocaleString()} $B</div>
              <div className="display tabular" style={{ fontSize: 14, color: t.bonus > 0 ? "var(--lime)" : "var(--mute)", marginTop: 4 }}>+{t.bonus}%</div>
              {isCurrent && <div className="pill" style={{ fontSize: 9, marginTop: 6, background: t.color, padding: "2px 6px" }}>YOURS</div>}
              {!unlocked && <div style={{ fontSize: 11, marginTop: 4 }}>🔒</div>}
            </div>
          );
        })}
      </div>
      <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 10, textAlign: "center" }}>Tier resets weekly based on $BATTLE balance · Alpha tier is permanent once reached</div>
    </div>
  );
}

const RIGS = [
  { name: "Pup Rig", boost: 1.0, cost: 0, desc: "Starter gear. Every wolf gets one.", bg: "var(--cream)", owned: true, current: false },
  { name: "Hunter Rig", boost: 1.8, cost: 1200, desc: "Twin GPU + signal antenna.", bg: "var(--cyan)", owned: true, current: true },
  { name: "Plasma Rig", boost: 3.2, cost: 4500, desc: "Liquid-cooled. Alpha hashrate.", bg: "var(--magenta)", owned: false, current: false },
  { name: "Apex Rig", boost: 5.0, cost: 12000, desc: "Top of the pack. Only 100 ever minted.", bg: "var(--ink)", owned: false, current: false },
];

function MiningChart() {
  const bars = [8, 12, 6, 10, 14, 22, 28, 32, 26, 30, 38, 42, 35, 40, 48, 52, 45, 50, 58, 62, 55, 60, 68, 72];
  const boost = [2, 3, 1, 2, 3, 6, 8, 9, 7, 8, 10, 12, 9, 11, 13, 16, 14, 15, 18, 20, 17, 19, 22, 24];
  const max = 100;
  const w = 100 / bars.length;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      {[0, 25, 50, 75].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(11,11,26,0.12)" strokeWidth="0.3" />)}
      {bars.map((b, i) => {
        const x = i * w + 0.5;
        const totalH = (b / max) * 90;
        const boostH = (boost[i] / max) * 90;
        const baseH = totalH - boostH;
        return (
          <g key={i}>
            <rect x={x} y={100 - totalH} width={w - 1} height={boostH} fill="var(--magenta)" />
            <rect x={x} y={100 - baseH} width={w - 1} height={baseH} fill="var(--cyan)" />
          </g>
        );
      })}
      <line x1="0" y1="100" x2="100" y2="100" stroke="var(--ink)" strokeWidth="0.5" />
    </svg>
  );
}

function RigIllustration({ tier, dark }: { tier: number; dark?: boolean }) {
  return (
    <svg viewBox="0 0 120 90" style={{ width: "70%", height: "70%" }}>
      <rect x="14" y="20" width="92" height="60" rx="6" fill={dark ? "#1F1B2E" : "var(--paper)"} stroke="var(--ink)" strokeWidth="2.5" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${22 + i * 26}, 30)`}>
          <circle cx="12" cy="12" r="10" fill={dark ? "#2b2040" : "var(--paper)"} stroke="var(--ink)" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3" fill={tier >= 2 ? "var(--magenta)" : "var(--cyan)"} stroke="var(--ink)" strokeWidth="1.5" />
          <path d="M12 4 L 12 12 M12 12 L 20 14 M12 12 L 8 20" stroke="var(--ink)" strokeWidth="1.5" fill="none" />
        </g>
      ))}
      <rect x="20" y="60" width="80" height="10" rx="2" fill="var(--ink)" />
      {Array.from({ length: tier + 1 }).map((_, i) => (
        <circle key={i} cx={28 + i * 6} cy={65} r={1.8} fill={tier >= 2 ? "var(--magenta)" : "var(--cyan)"} />
      ))}
    </svg>
  );
}

export default function Mine() {
  const { user } = useAuth();
  const stats = calcUserStats(user);
  const [claimable, setClaimable] = useState(() => stats.claimable);
  const [pulsing, setPulsing] = useState(false);
  const [activeTab, setActiveTab] = useState("24h");
  const streak = stats.dailyStreak;
  const xp = stats.xp;
  const activity = useActivityFeed();

  useEffect(() => {
    const t = setInterval(() => setClaimable((c) => +(c + 0.04).toFixed(2)), 1500);
    return () => clearInterval(t);
  }, []);

  const handleClaim = () => {
    setPulsing(true);
    setTimeout(() => { setClaimable(0); setPulsing(false); }, 600);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 30 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Mining Hub</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Your rig is running.</div>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn sm">🔔 3</button>
              <div className="pill">{user?.username ?? "wolf"}</div>
            </div>
          </div>

          {/* ── HERO ROW ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18 }}>

            {/* RIG PANEL */}
            <div className="card ink" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.85 }}>
                <img src="/mascot.jpg" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} alt="" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,11,26,0.2) 0%, rgba(11,11,26,0.95) 70%)" }} />
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 20%, rgba(255,43,214,0.25), transparent 50%)" }} />
              </div>
              <div style={{ position: "relative", padding: 28, minHeight: 360, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "white" }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="row" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", border: "2px solid var(--cyan)", padding: "6px 12px", borderRadius: 99, gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--lime)", boxShadow: "0 0 8px var(--lime)", flexShrink: 0 }} />
                    <span className="mono" style={{ fontSize: 11, color: "var(--cyan)" }}>RIG ONLINE</span>
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>SESSION · 02:14:33</div>
                </div>

                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--cyan)", letterSpacing: 2 }}>CLAIMABLE BALANCE</div>
                  <div className="row" style={{ alignItems: "flex-end", gap: 12, marginTop: 4 }}>
                    <div className="display tabular" style={{ fontSize: 72, lineHeight: 0.9, color: "white" }}>{claimable.toFixed(2)}</div>
                    <div className="display" style={{ fontSize: 24, color: "var(--magenta)", paddingBottom: 8 }}>BATTLE</div>
                    <div style={{ flex: 1 }} />
                    <div className="mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", paddingBottom: 8 }}>≈ ${(claimable * 0.00428).toFixed(4)}</div>
                  </div>

                  <div className="row" style={{ gap: 24, marginTop: 18 }}>
                    {[
                      { label: "Hash rate", value: `${stats.hashRate} KH/s`, color: "var(--cyan)" },
                      { label: "Tier", value: `${stats.tier.icon} ${stats.tier.name}`, color: "var(--magenta)" },
                      { label: "Next halving", value: "13d 04h", color: "var(--yellow)" },
                      { label: "Rig level", value: String(stats.level), color: "var(--lime)" },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="mono" style={{ fontSize: 10, color: s.color, letterSpacing: 1.4 }}>{s.label.toUpperCase()}</div>
                        <div className="display tabular" style={{ fontSize: 22, color: "white", marginTop: 2 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="row" style={{ gap: 10, marginTop: 22 }}>
                    <button className="btn lg magenta" onClick={handleClaim} style={pulsing ? { animation: "pulse-ring 0.6s ease-out" } : {}}>
                      💰 Claim {claimable.toFixed(2)} BATTLE
                    </button>
                    <button className="btn lg primary">⚡ Boost rig</button>
                    <button className="btn lg ghost" style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
                      ⚙ Configure
                    </button>
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
                      <div className="display tabular" style={{ fontSize: 44, lineHeight: 1 }}>{streak}</div>
                      <span style={{ fontSize: 32 }}>🔥</span>
                    </div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Don't break the chain — +25% boost at day 14.</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "end" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 14px)", gap: 4 }}>
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div key={i} style={{ width: 14, height: 14, borderRadius: 4, border: "1.5px solid var(--ink)", background: i < streak ? "var(--tomato)" : "rgba(11,11,26,0.06)" }} />
                      ))}
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 4 }}>{streak} of 14 days</div>
                  </div>
                </div>
              </div>

              {/* Level progress */}
              <div className="card">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="stat-label">Level progress</div>
                  <span className="pill yellow" style={{ fontSize: 10 }}>LVL 14 → 15</span>
                </div>
                <div className="row" style={{ alignItems: "flex-end", gap: 8, marginTop: 6 }}>
                  <div className="display tabular" style={{ fontSize: 28 }}>{xp.toLocaleString()}</div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--mute)", paddingBottom: 4 }}>/ 5,000 XP</div>
                </div>
                <div className="bar thick" style={{ marginTop: 10 }}>
                  <div className="bar-fill" style={{ width: `${Math.min((xp / 5000) * 100, 100)}%`, background: "var(--magenta)" }} />
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: "var(--mute)" }}>
                  {Math.max(0, 5000 - xp)} XP to unlock <b style={{ color: "var(--ink)" }}>Plasma Rig</b> (×3.2 boost)
                </div>
              </div>

              {/* Balance */}
              <div className="card cyan">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div className="stat-label">$BATTLE balance</div>
                    <div className="display tabular" style={{ fontSize: 32, lineHeight: 1, marginTop: 4 }}>{stats.wolfBalance.toLocaleString()}</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>≈ ${(stats.wolfBalance * 0.00428).toFixed(2)} · in your wallet</div>
                  </div>
                  <Link href="/convert" className="btn ink">Wallet →</Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── CHART + ACTIVITY ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
            <div className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div className="eyebrow">Mining output</div>
                  <div className="display" style={{ fontSize: 26, marginTop: 4, lineHeight: 1 }}>Last 24 hours</div>
                </div>
                <div className="tabs">
                  {["24h", "7d", "30d", "ALL"].map((t) => (
                    <div key={t} className={`tab${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>{t}</div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 18, height: 180 }}>
                <MiningChart />
              </div>
              <div className="row" style={{ marginTop: 18, gap: 24, color: "var(--mute)", fontSize: 12 }}>
                <span>Bars show your hourly WOLF output. Magenta segments are your tier-bonus uplift.</span>
              </div>
            </div>

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
                    No activity yet. Be the first to mine, win a battle, or claim a reward.
                  </div>
                ) : activity.slice(0, 10).map((a, i, arr) => (
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
          </div>

          {/* ── BOOST RIG ── */}
          <div>
            <div className="section-title">
              <div>
                <div className="eyebrow">Boost your rig</div>
                <h2>Better gear, fatter bags</h2>
              </div>
            </div>
            <div className="grid-4">
              {RIGS.map((r, i) => (
                <div key={i} className="card" style={{ padding: 16, position: "relative", background: r.owned ? "var(--paper)" : "var(--cream-soft)" }}>
                  {r.current && <div className="sticker" style={{ position: "absolute", top: -10, left: 14, background: "var(--lime)", fontSize: 11, padding: "3px 10px" }}>EQUIPPED</div>}
                  <div style={{ aspectRatio: "4/3", borderRadius: 12, border: "2.5px solid var(--ink)", background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <RigIllustration tier={i} dark={i === 3} />
                  </div>
                  <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
                    <div className="display" style={{ fontSize: 17 }}>{r.name}</div>
                    <div className="display" style={{ fontSize: 16, color: "var(--magenta)" }}>×{r.boost}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--mute)", marginTop: 2 }}>{r.desc}</div>
                  <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
                    <div className="mono" style={{ fontSize: 12 }}>{r.owned ? "OWNED" : r.cost.toLocaleString() + " BATTLE"}</div>
                    <button className={`btn sm ${r.current ? "lime" : r.owned ? "primary" : "ghost"}`} disabled={r.current}>
                      {r.current ? "In use" : r.owned ? "Equip" : "Buy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PACK TIERS ── */}
          <PackTiers balance={stats.wolfBalance} />

        </div>
      </main>
    </div>
  );
}
