import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";

const ACHIEVEMENTS = [
  { name: "First Howl", desc: "Registered and claimed once.", icon: "🐺", color: "var(--cyan)", xp: 100, date: "Day 001", locked: false },
  { name: "Speed Miner", desc: "Claimed within 1hr of rig start.", icon: "⚡", color: "var(--yellow)", xp: 250, date: "Day 003", locked: false },
  { name: "Game Shark", desc: "Won 10 arcade games.", icon: "🎮", color: "var(--magenta)", xp: 500, date: "Day 012", locked: false },
  { name: "Alpha Hunter", desc: "Reached top 200 on leaderboard.", icon: "🏆", color: "var(--lime)", xp: 750, date: "Day 031", locked: false, rare: true },
  { name: "Pack Leader", desc: "Invited 5 wolves to the pack.", icon: "👥", color: "var(--lavender)", xp: 400, date: "Day 022", locked: false },
  { name: "Streak King", desc: "14-day mining streak.", icon: "🔥", color: "var(--tomato)", xp: 600, date: "Day 047", locked: false },
  { name: "Diamond Paws", desc: "Hold 100k BATTLE at once.", icon: "💎", color: "var(--cyan)", xp: 1000, locked: true, progress: 12, progressText: "12,840 / 100,000" },
  { name: "Apex Predator", desc: "Reach top 10 on leaderboard.", icon: "👑", color: "var(--yellow)", xp: 2000, locked: true, progress: 0, progressText: "#142 / top 10" },
  { name: "Tetris Legend", desc: "Win 100 Battle Tetris matches.", icon: "⬛", color: "var(--magenta)", xp: 800, locked: true, progress: 12, progressText: "12 / 100 wins" },
  { name: "Iron Rig", desc: "Upgrade to Plasma Rig.", icon: "⛏", color: "var(--mute)", xp: 500, locked: true, progress: 85, progressText: "4,280 / 4,500 BATTLE" },
  { name: "Referral Wolf", desc: "Invite 20 wolves.", icon: "🐾", color: "var(--lime)", xp: 1500, locked: true, progress: 25, progressText: "5 / 20 invites" },
  { name: "Night Miner", desc: "Mine for 30 consecutive nights.", icon: "🌙", color: "var(--lavender)", xp: 700, locked: true, progress: 23, progressText: "7 / 30 nights" },
];

const MISSIONS = [
  { t: "Play any game", icon: "🎮", color: "var(--cyan)", reward: 50, p: 100, progress: "1 / 1", done: true },
  { t: "Score 1,000 in Wolf Run", icon: "🐾", color: "var(--lime)", reward: 120, p: 100, progress: "1,240 pts", done: true },
  { t: "Win Battle Tetris", icon: "⬛", color: "var(--magenta)", reward: 200, p: 40, progress: "0 / 1 wins", done: false },
  { t: "Mine for 60 minutes", icon: "⛏", color: "var(--yellow)", reward: 80, p: 72, progress: "43 / 60 min", done: false },
  { t: "Invite 1 new wolf", icon: "👤", color: "var(--tomato)", reward: 300, p: 0, progress: "0 / 1", done: false },
];

function XPRing({ pct }: { pct: number }) {
  const r = 72, cx = 90, cy = 90, sw = 12;
  const circumference = 2 * Math.PI * r;
  const filled = (pct / 100) * circumference;
  return (
    <div style={{ position: "relative", width: 180, height: 180 }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(11,11,26,0.1)" strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--magenta)" strokeWidth={sw}
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink)" strokeWidth="2.5" opacity="0.4" />
      </svg>
      <div style={{ position: "absolute", inset: 20, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--ink)", boxShadow: "3px 3px 0 0 var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)" }}>
        <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
      </div>
      <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)" }}>
        <span className="pill yellow" style={{ fontSize: 11, whiteSpace: "nowrap" }}>LVL 14</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const refLink = `veloxfi.io/?ref=${user?.username ?? "wolfkid"}`;
  const xp = user?.totalMined ?? 4280;
  const xpPct = Math.min((xp / 5000) * 100, 100);

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 30 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Profile</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Your wolf, your numbers.</div>
            <button className="btn sm">⚙ Edit</button>
          </div>

          {/* ── HERO ── */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ height: 140, background: "linear-gradient(120deg, #1F1B2E, #2b1a4d 50%, #1F1B2E)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
              <div className="mono" style={{ position: "absolute", top: 16, right: 20, fontSize: 11, color: "var(--cyan)", letterSpacing: 2 }}>JOINED · DAY 047 · LVL 14 HUNTER</div>
            </div>
            <div style={{ padding: "0 28px 28px", display: "grid", gridTemplateColumns: "1fr 2fr 1.2fr", gap: 26, alignItems: "flex-end" }}>
              <div style={{ marginTop: -80 }}>
                <XPRing pct={xpPct} />
              </div>
              <div style={{ paddingTop: 18 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="pill">✓ VERIFIED WALLET</span>
                  <span className="pill dot">ONLINE</span>
                  <span className="pill yellow">🔥 7-day streak</span>
                </div>
                <div className="display" style={{ fontSize: 48, lineHeight: 0.95, marginTop: 12 }}>{user?.username ?? "wolfkid.sol"}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 6 }}>
                  {user?.wallet ? `${user.wallet.slice(0, 20)}...` : "7VLxw9zKbXcM3qPj4yR8nT2gH5fW1aC6bE8dZ9KuvLNS"}
                </div>
                <div className="row" style={{ gap: 18, marginTop: 14 }}>
                  {[["🏆", "142", "games won", "var(--yellow)"], ["⚡", "68%", "win rate", "var(--cyan)"], ["🔥", "7d", "streak", "var(--tomato)"], ["👑", "#142", "rank", "var(--magenta)"]].map(([icon, val, sub, color]) => (
                    <div key={String(sub)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 14 }}>{icon}</span>
                        <div className="display tabular" style={{ fontSize: 22, color: String(color) }}>{val}</div>
                      </div>
                      <div style={{ fontSize: 10, color: "var(--mute)", textTransform: "uppercase", letterSpacing: 0.8 }}>{sub}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card cream" style={{ padding: 16 }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>WALLET BALANCE</div>
                <div className="display tabular" style={{ fontSize: 36, lineHeight: 1, marginTop: 4 }}>{(user?.wolf ?? 12840).toLocaleString()}</div>
                <div className="mono" style={{ fontSize: 12, color: "var(--mute)" }}>BATTLE · ≈ ${((user?.wolf ?? 12840) * 0.00428).toFixed(2)}</div>
                <div className="row" style={{ marginTop: 12, gap: 8 }}>
                  <button className="btn sm magenta" style={{ flex: 1, justifyContent: "center" }}>Claim 428</button>
                  <Link href="/convert" className="btn sm">Wallet</Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── ACHIEVEMENTS ── */}
          <div>
            <div className="section-title">
              <div>
                <div className="eyebrow">Achievements · 6 of 12 unlocked</div>
                <h2>The trophy room</h2>
              </div>
              <div className="grow" />
              <div className="row" style={{ gap: 3 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 18, borderRadius: 2, background: i < 6 ? "var(--ink)" : "rgba(11,11,26,0.15)" }} />
                ))}
              </div>
            </div>
            <div className="grid-4">
              {ACHIEVEMENTS.map((a, i) => (
                <div key={i} className="card" style={{ padding: 16, opacity: a.locked ? 0.45 : 1, position: "relative", background: a.locked ? "var(--cream-soft)" : "var(--paper)" }}>
                  {!a.locked && (a as any).rare && <div className="sticker" style={{ position: "absolute", top: -10, right: 14, background: "var(--magenta)", color: "white", fontSize: 10, padding: "3px 8px" }}>RARE</div>}
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: a.locked ? "var(--cream)" : a.color, border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: a.locked ? "none" : "2px 2px 0 0 var(--ink)" }}>
                    {a.locked ? "🔒" : a.icon}
                  </div>
                  <div className="display" style={{ fontSize: 16, marginTop: 12, lineHeight: 1.1 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 4 }}>{a.desc}</div>
                  {!a.locked ? (
                    <div className="row" style={{ marginTop: 10, justifyContent: "space-between" }}>
                      <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>{a.date}</span>
                      <span className="display" style={{ fontSize: 14, color: "var(--magenta)" }}>+{a.xp} XP</span>
                    </div>
                  ) : (
                    <div style={{ marginTop: 10 }}>
                      <div className="bar"><div className="bar-fill" style={{ width: `${a.progress ?? 0}%`, background: "var(--mute)" }} /></div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 4 }}>{a.progressText}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── MISSIONS + REFERRAL ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 14 }}>
                <div><div className="eyebrow">Daily missions · resets 11h 24m</div><h2 style={{ fontSize: 26 }}>Today's hunt</h2></div>
                <div className="grow" />
                <span className="pill yellow">+850 BATTLE up</span>
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {MISSIONS.map((m, i) => (
                  <div key={i} className="row" style={{ padding: "14px 18px", borderBottom: i < MISSIONS.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", background: m.done ? "var(--cream-soft)" : "var(--paper)", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: m.done ? "var(--lime)" : m.color, border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
                      {m.done ? "✓" : m.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{m.t}</div>
                        <div className="display" style={{ fontSize: 14, color: "var(--magenta)" }}>+{m.reward}</div>
                      </div>
                      <div className="row" style={{ marginTop: 6, gap: 8 }}>
                        <div className="bar" style={{ flex: 1 }}><div className="bar-fill" style={{ width: `${m.p}%`, background: m.done ? "var(--lime)" : m.color }} /></div>
                        <span className="mono" style={{ fontSize: 11, color: "var(--mute)", flexShrink: 0 }}>{m.progress}</span>
                      </div>
                    </div>
                    {m.done ? <span style={{ fontSize: 16 }}>✓</span> : <button className="btn sm">Go →</button>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="section-title" style={{ marginBottom: 14 }}>
                <div><div className="eyebrow">Refer & earn</div><h2 style={{ fontSize: 26 }}>Bring the pack</h2></div>
              </div>
              <div className="card magenta" style={{ marginBottom: 14 }}>
                <div style={{ color: "white" }}>
                  <div style={{ fontSize: 14, opacity: 0.85 }}>Your referral link</div>
                  <div className="mono" style={{ fontSize: 13, marginTop: 8, background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 10, wordBreak: "break-all" }}>{refLink}</div>
                  <div className="row" style={{ gap: 8, marginTop: 12 }}>
                    <button className="btn sm yellow" style={{ flex: 1, justifyContent: "center" }} onClick={handleCopy}>
                      {copied ? "✓ Copied!" : "📋 Copy link"}
                    </button>
                    <button className="btn sm" style={{ background: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.4)", color: "white" }}>𝕏 Share</button>
                  </div>
                </div>
              </div>
              <div className="grid-2" style={{ marginBottom: 14 }}>
                <div className="card" style={{ textAlign: "center" }}>
                  <div className="stat-num tabular">5</div>
                  <div className="stat-label">pack size</div>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                  <div className="stat-num tabular">750</div>
                  <div className="stat-label">bonus earned</div>
                </div>
              </div>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: "var(--mute)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Latest invites</div>
                {["moonwolf42", "cryptobaby", "shibakid"].map((name) => (
                  <div key={name} className="row" style={{ padding: "8px 0", borderBottom: "1px dashed rgba(11,11,26,0.12)", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, overflow: "hidden", border: "2px solid var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0 }}>
                      <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{name}</div>
                    <span className="pill" style={{ background: "var(--lime)", fontSize: 10 }}>+150</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
