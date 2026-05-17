import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { calcUserStats, type UserStats } from "@/lib/userStats";

// Mirrors the flat JSON shape returned by GET /veloxfi/profile.
interface ProfileData {
  username:      string;
  email:         string;
  tokens:        number;
  wolf:          number;
  xp:            number;
  level:         number;
  levelName:     string;
  referralCount: number;
  referralTokens: number;
  stats?:        { totalBattles: number; totalWins: number; totalLosses: number; totalTokens: number };
  battles?:      any[];
  achievements?: { id: string; earnedAt: string }[];
  missions?:     {
    date:           string;
    battlesPlayed:  number;
    thirtyMinWins:  number;
    teamBattles:    number;
    referrals:      number;
    m1Rewarded:     boolean;
    m2Rewarded:     boolean;
    m3Rewarded:     boolean;
    m4Rewarded:     boolean;
  };
}

// Achievement definitions: each evaluator returns { unlocked, progress, pct, requirement }
interface OneTimeAchievement {
  id:     string;
  name:   string;
  desc:   string;
  icon:   string;
  color:  string;
  xp:     number;
  rare?:  boolean;
  hidden?: boolean;
  unlocked: (s: UserStats, refCount: number, achievementIds: Set<string>) => boolean;
}

const ONE_TIME_DEFS: OneTimeAchievement[] = [
  { id: "first_howl",   name: "First Howl",   desc: "Registered and claimed once.",        icon: "🐺", color: "var(--cyan)",     xp: 100,  unlocked: (s) => s.wolfBalance > 0 || !!s.walletAddress },
  { id: "speed_miner",  name: "Speed Miner",  desc: "Claimed within 1hr of rig start.",    icon: "⚡", color: "var(--yellow)",   xp: 250,  unlocked: (_s, _r, ids) => ids.has("speed_miner") },
  { id: "alpha_hunter", name: "Alpha Hunter", desc: "Reached top 200 on leaderboard.",     icon: "🏆", color: "var(--lime)",     xp: 750,  rare: true,  unlocked: (_s, _r, ids) => ids.has("alpha_hunter") },
  { id: "pack_leader",  name: "Pack Leader",  desc: "Invite 10 wolves to the pack.",       icon: "👥", color: "var(--magenta)",  xp: 1000, unlocked: (_s, r) => r >= 10 },
  { id: "diamond_paws", name: "Diamond Paws", desc: "Hold 100k $BATTLE at once.",          icon: "💎", color: "var(--cyan)",     xp: 1500, unlocked: (s) => s.battleBalance >= 100000 },
  { id: "thirty_day",   name: "30-Day Howl",  desc: "Log in for 30 consecutive days.",     icon: "📅", color: "var(--tomato)",   xp: 2000, unlocked: (s) => s.dailyStreak >= 30 },
  { id: "genesis_wolf", name: "Genesis Wolf", desc: "One of the first 1,000 registered.",  icon: "🌟", color: "#FFD700",         xp: 5000, rare: true, unlocked: (_s, _r, ids) => ids.has("genesis_wolf") },
];

interface TieredAchievement {
  name:   string;
  icon:   string;
  color:  string;
  metric: (s: UserStats, refCount: number) => number;
  tiers:  { label: string; req: number; reward: number }[];
}

const TIERED_DEFS: TieredAchievement[] = [
  { name: "Mining Output", icon: "⛏", color: "var(--cyan)", metric: (s) => s.xp,
    tiers: [
      { label: "Bronze", req: 1000,    reward: 50   },
      { label: "Silver", req: 10000,   reward: 200  },
      { label: "Gold",   req: 100000,  reward: 500  },
      { label: "Legend", req: 1000000, reward: 2000 },
    ],
  },
  { name: "Referrals", icon: "👥", color: "var(--lime)", metric: (_s, r) => r,
    tiers: [
      { label: "Bronze", req: 1,   reward: 100  },
      { label: "Silver", req: 5,   reward: 300  },
      { label: "Gold",   req: 25,  reward: 1000 },
      { label: "Legend", req: 100, reward: 5000 },
    ],
  },
  { name: "Daily Streak", icon: "🔥", color: "var(--tomato)", metric: (s) => s.dailyStreak,
    tiers: [
      { label: "Bronze", req: 7,  reward: 100  },
      { label: "Silver", req: 14, reward: 250  },
      { label: "Gold",   req: 21, reward: 500  },
      { label: "Legend", req: 30, reward: 1000 },
    ],
  },
  { name: "Hold $BATTLE", icon: "💎", color: "var(--magenta)", metric: (s) => s.battleBalance,
    tiers: [
      { label: "Bronze", req: 100,    reward: 150  },
      { label: "Silver", req: 1000,   reward: 400  },
      { label: "Gold",   req: 10000,  reward: 1000 },
      { label: "Legend", req: 100000, reward: 5000 },
    ],
  },
];

function useProfileData(token: string | null) {
  const [data, setData] = useState<ProfileData | null>(null);
  useEffect(() => {
    if (!token) return;
    fetch("/api/veloxfi/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => {});
  }, [token]);
  return data;
}

interface MissionView { t: string; icon: string; color: string; reward: number; p: number; progress: string; done: boolean }

function buildMissions(m: ProfileData["missions"] | null): MissionView[] {
  return [
    { t: "Play 3 battles",          icon: "⚔",  color: "var(--cyan)",    reward: 50,  p: m ? Math.min(100, (m.battlesPlayed / 3) * 100) : 0, progress: m ? `${m.battlesPlayed} / 3 battles`  : "0 / 3 battles",  done: !!m?.m1Rewarded || (m?.battlesPlayed ?? 0) >= 3 },
    { t: "Win within 30 min",       icon: "⚡", color: "var(--yellow)",  reward: 120, p: m ? Math.min(100, (m.thirtyMinWins / 1) * 100) : 0, progress: m ? `${m.thirtyMinWins} / 1 wins`      : "0 / 1 wins",      done: !!m?.m2Rewarded || (m?.thirtyMinWins ?? 0) >= 1 },
    { t: "Play a team battle",      icon: "🤝", color: "var(--magenta)", reward: 200, p: m ? Math.min(100, (m.teamBattles / 1) * 100)   : 0, progress: m ? `${m.teamBattles} / 1 team`       : "0 / 1 team",      done: !!m?.m3Rewarded || (m?.teamBattles ?? 0) >= 1 },
    { t: "Invite 1 new wolf",       icon: "👤", color: "var(--tomato)",  reward: 300, p: m ? Math.min(100, (m.referrals / 1) * 100)     : 0, progress: m ? `${m.referrals} / 1 referrals`    : "0 / 1 referrals", done: !!m?.m4Rewarded || (m?.referrals ?? 0) >= 1 },
  ];
}

function XPRing({ pct, level }: { pct: number; level: number }) {
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
        <span className="pill yellow" style={{ fontSize: 11, whiteSpace: "nowrap" }}>LVL {level}</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, token } = useAuth();
  const stats = calcUserStats(user);
  const profile = useProfileData(token);
  const [copied, setCopied] = useState(false);
  const refLink = `veloxfi.io/r/${stats.username}`;
  const xp = stats.xp;
  const xpPct = Math.min((xp / stats.xpToNextLevel) * 100, 100);

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refCount    = (user as any)?.referralCount  ?? profile?.referralCount  ?? 0;
  const refTokens   = (user as any)?.referralTokens ?? profile?.referralTokens ?? 0;
  const achievementIds = new Set((profile?.achievements ?? []).map(a => a.id));

  const oneTime = ONE_TIME_DEFS.map(d => ({
    ...d,
    unlocked: d.unlocked(stats, refCount, achievementIds),
    earnedAt: profile?.achievements?.find(a => a.id === d.id)?.earnedAt ?? null,
  }));

  const tiered = TIERED_DEFS.map(t => {
    const value = t.metric(stats, refCount);
    return {
      ...t,
      tiers: t.tiers.map(tier => ({
        ...tier,
        done: value >= tier.req,
        progress: value,
        pct: Math.min(100, (value / tier.req) * 100),
      })),
    };
  });

  const missions = buildMissions(profile?.missions ?? null);
  const missionPending = missions.filter(m => !m.done);
  const missionsUpReward = missionPending.reduce((s, m) => s + m.reward, 0);

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
              <div className="mono" style={{ position: "absolute", top: 16, right: 20, fontSize: 11, color: "var(--cyan)", letterSpacing: 2 }}>LVL {stats.level} · {stats.levelName.toUpperCase()}</div>
            </div>
            <div style={{ padding: "0 28px 28px", display: "grid", gridTemplateColumns: "1fr 2fr 1.2fr", gap: 26, alignItems: "flex-end" }}>
              <div style={{ marginTop: -80 }}>
                <XPRing pct={xpPct} level={stats.level} />
              </div>
              <div style={{ paddingTop: 18 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="pill">✓ VERIFIED WALLET</span>
                  <span className="pill dot">ONLINE</span>
                  <span className="pill yellow">🔥 {stats.dailyStreak}-day streak</span>
                </div>
                <div className="display" style={{ fontSize: 48, lineHeight: 0.95, marginTop: 12 }}>{stats.username}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 6 }}>
                  {stats.walletAddress ? `${stats.walletAddress.slice(0, 24)}...` : "No wallet connected yet"}
                </div>
                <div className="row" style={{ gap: 18, marginTop: 14 }}>
                  {[["🏆", stats.battleBalance.toLocaleString(), "$BATTLE earned", "var(--yellow)"], ["⚡", `LVL ${stats.level}`, "mining level", "var(--cyan)"], ["🔥", `${stats.dailyStreak}d`, "streak", "var(--tomato)"], ["👑", stats.tier.icon, stats.tier.name, "var(--magenta)"]].map(([icon, val, sub, color]) => (
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
                <div className="display tabular" style={{ fontSize: 36, lineHeight: 1, marginTop: 4 }}>{stats.wolfBalance.toLocaleString()}</div>
                <div className="mono" style={{ fontSize: 12, color: "var(--mute)" }}>BATTLE · ≈ ${(stats.wolfBalance * 0.00428).toFixed(2)}</div>
                <div className="row" style={{ marginTop: 12, gap: 8 }}>
                  <button className="btn sm magenta" style={{ flex: 1, justifyContent: "center" }}>Claim 428</button>
                  <Link href="/convert" className="btn sm">Wallet</Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── ONE-TIME ACHIEVEMENTS ── */}
          <div>
            <div className="section-title">
              <div>
                <div className="eyebrow">Achievements · one-time</div>
                <h2>The trophy room</h2>
              </div>
              <div className="grow" />
              <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>{oneTime.filter(a => a.unlocked).length} / {oneTime.length} unlocked</span>
            </div>
            <div className="grid-4">
              {oneTime.map((a) => {
                const isHidden = !a.unlocked && a.hidden;
                return (
                  <div key={a.id} className="card" style={{ padding: 16, opacity: a.unlocked ? 1 : 0.5, position: "relative", background: a.unlocked ? "var(--paper)" : "var(--cream-soft)" }}>
                    {a.unlocked && a.rare && <div className="sticker" style={{ position: "absolute", top: -10, right: 14, background: "var(--magenta)", color: "white", fontSize: 10, padding: "3px 8px" }}>RARE</div>}
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: a.unlocked ? a.color : "var(--cream)", border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: a.unlocked ? "2px 2px 0 0 var(--ink)" : "none" }}>
                      {isHidden ? "❓" : a.unlocked ? a.icon : "🔒"}
                    </div>
                    <div className="display" style={{ fontSize: 15, marginTop: 12, lineHeight: 1.1 }}>{isHidden ? "???" : a.name}</div>
                    <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 4 }}>{isHidden ? "Keep playing to discover this." : a.desc}</div>
                    {a.unlocked && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                        <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>
                          {a.earnedAt ? new Date(a.earnedAt).toLocaleDateString() : "earned"}
                        </span>
                        <span className="display" style={{ fontSize: 14, color: "var(--magenta)" }}>+{a.xp} XP</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── TIERED ACHIEVEMENTS ── */}
          <div>
            <div className="section-title">
              <div>
                <div className="eyebrow">Achievements · tiered</div>
                <h2>Bronze to Legendary</h2>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {tiered.map((a) => (
                <div key={a.name} className="card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: a.color, border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "2px 2px 0 0 var(--ink)", flexShrink: 0 }}>{a.icon}</div>
                    <div className="display" style={{ fontSize: 22 }}>{a.name}</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {a.tiers.map((t) => (
                      <div key={t.label} style={{ padding: "12px 14px", borderRadius: 12, border: `2px solid ${t.done ? a.color : "var(--ink)"}`, background: t.done ? `${a.color}22` : "var(--cream-soft)", opacity: t.done ? 1 : 0.8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span className="pill" style={{ fontSize: 9, background: t.done ? a.color : "var(--cream)", padding: "1px 7px" }}>{t.label}</span>
                          {t.done && <span style={{ fontSize: 14 }}>✓</span>}
                        </div>
                        <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>REQ</div>
                        <div className="display tabular" style={{ fontSize: 16 }}>{t.req >= 1000 ? `${(t.req / 1000).toFixed(0)}k` : t.req}</div>
                        <div className="display tabular" style={{ fontSize: 14, color: "var(--magenta)", marginTop: 4 }}>+{t.reward} $B</div>
                        {!t.done && (
                          <div style={{ marginTop: 8 }}>
                            <div className="bar"><div className="bar-fill" style={{ width: `${t.pct}%`, background: a.color }} /></div>
                            <div className="mono" style={{ fontSize: 9, color: "var(--mute)", marginTop: 3 }}>{t.pct.toFixed(1)}%</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── MISSIONS + REFERRAL ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 14 }}>
                <div><div className="eyebrow">Daily missions · resets at 00:00 UTC</div><h2 style={{ fontSize: 26 }}>Today's hunt</h2></div>
                <div className="grow" />
                {missionsUpReward > 0 && <span className="pill yellow">+{missionsUpReward} BATTLE up</span>}
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {missions.map((m, i) => (
                  <div key={i} className="row" style={{ padding: "14px 18px", borderBottom: i < missions.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", background: m.done ? "var(--cream-soft)" : "var(--paper)", gap: 14 }}>
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
                    {m.done ? <span style={{ fontSize: 16 }}>✓</span> : null}
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
                  <div className="stat-num tabular">{refCount}</div>
                  <div className="stat-label">pack size</div>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                  <div className="stat-num tabular">{refTokens.toLocaleString()}</div>
                  <div className="stat-label">bonus earned</div>
                </div>
              </div>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: "var(--mute)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Refer wolves</div>
                {refCount === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--mute)", textAlign: "center", padding: 10 }}>
                    Share your link to invite your first wolf. You'll earn $BATTLE for every active referral.
                  </div>
                ) : (
                  <div style={{ fontSize: 13, padding: "4px 0" }}>
                    You've brought <b>{refCount}</b> wolf{refCount === 1 ? "" : "ves"} to the pack so far —
                    <b> {refTokens.toLocaleString()} $BATTLE</b> earned in referral bonuses.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
