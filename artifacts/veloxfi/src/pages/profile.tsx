import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { calcUserStats, type UserStats } from "@/lib/userStats";
import { useTokenStats } from "@/lib/tokenStats";
import { shortAddr } from "@/lib/veloxfiApi";

// Mirrors the flat JSON shape returned by GET /veloxfi/profile.
interface ProfileData {
  username:       string;
  email:          string;
  tokens:         number;
  wolf:           number;
  xp:             number;
  level:          number;
  levelName:      string;
  referralCount:  number;
  referralTokens: number;
  achievements?:  { id: string; earnedAt: string }[];
}

// One-time achievements — only the ones the user can actually unlock from
// existing data flows (no speed_miner / alpha_hunter / genesis_wolf left
// because the backend never sets those IDs).
interface OneTimeAchievement {
  id:    string;
  name:  string;
  desc:  string;
  icon:  string;
  color: string;
  xp:    number;
  rare?: boolean;
  unlocked: (s: UserStats, refCount: number, profile: ProfileData | null) => boolean;
}

const ONE_TIME_DEFS: OneTimeAchievement[] = [
  { id: "first_howl",   name: "First Howl",    desc: "Mined and claimed your first WOLF.",  icon: "🐺", color: "var(--cyan)",    xp: 100,
    unlocked: (s) => s.wolfBalance > 0 || s.xp > 0 },
  { id: "first_claim",  name: "First $BATTLE", desc: "Hold at least 1  $BATTLE in your account.", icon: "⚔", color: "var(--yellow)",  xp: 200,
    unlocked: (s) => s.battleBalance >= 1 },
  { id: "pack_starter", name: "Pack Starter",  desc: "Invite your first wolf to the pack.", icon: "👤", color: "var(--lime)",    xp: 300,
    unlocked: (_s, r) => r >= 1 },
  { id: "pack_leader",  name: "Pack Leader",   desc: "Invite 10 wolves to the pack.",       icon: "👥", color: "var(--magenta)", xp: 1000, rare: true,
    unlocked: (_s, r) => r >= 10 },
  { id: "silver_tier",  name: "Silver Wolf",   desc: "Reach 1,000 WOLF balance (Silver tier).", icon: "🥈", color: "#C0C0C0",     xp: 500,
    unlocked: (s) => s.wolfBalance >= 1000 },
  { id: "gold_tier",    name: "Gold Wolf",     desc: "Reach 5,000 WOLF balance (Gold tier).",   icon: "🥇", color: "var(--yellow)", xp: 1000,
    unlocked: (s) => s.wolfBalance >= 5000 },
  { id: "diamond_paws", name: "Diamond Paws",  desc: "Hold 100,000 $BATTLE at once.",            icon: "💎", color: "var(--cyan)",   xp: 1500, rare: true,
    unlocked: (s) => s.battleBalance >= 100000 },
  { id: "thirty_day",   name: "30-Day Howl",   desc: "Hit a 30-day streak.",                     icon: "📅", color: "var(--tomato)", xp: 2000, rare: true,
    unlocked: (s) => s.dailyStreak >= 30 },
];

function useProfileData(token: string | null) {
  const [data, setData] = useState<ProfileData | null>(null);
  useEffect(() => {
    if (!token) { setData(null); return; }
    fetch("/api/veloxfi/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => {});
  }, [token]);
  return data;
}

interface MyClaim {
  id:            number;
  username:      string;
  walletAddress: string;
  amount:        number;
  requestedAt:   string;
  paidAt:        string | null;
}

// Polls the user's own claims so the profile reflects admin "mark paid"
// without needing a manual refresh.
function useMyClaims(token: string | null) {
  const [claims, setClaims] = useState<MyClaim[]>([]);
  useEffect(() => {
    if (!token) { setClaims([]); return; }
    const fetch_ = () => fetch("/api/veloxfi/my-claims", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setClaims)
      .catch(() => {});
    fetch_();
    const id = setInterval(fetch_, 30_000);
    return () => clearInterval(id);
  }, [token]);
  return claims;
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
  const myClaims = useMyClaims(token);
  const tokenStats = useTokenStats();
  const [copied, setCopied] = useState(false);

  if (!user || !token) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main style={{ minWidth: 0 }}>
          <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div className="topbar">
              <div className="crumb">Home / <b>Profile</b></div>
              <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Your profile.</div>
            </div>
            <div className="card" style={{ padding: 30, textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>👤</div>
              <h2 className="display" style={{ fontSize: 26, marginBottom: 8 }}>Sign in to view your profile</h2>
              <Link href="/login" className="btn lg primary">Sign in / Register</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const refLink = `veloxfi.io/r/${stats.username}`;
  const xpPct   = Math.min((stats.xp / stats.xpToNextLevel) * 100, 100);

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = () => {
    const text = `I'm mining free WOLF on @Battle767629 — join the pack with my referral link:`;
    const url  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent("https://" + refLink)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const refCount  = (user as any)?.referralCount  ?? profile?.referralCount  ?? 0;
  const refTokens = (user as any)?.referralTokens ?? profile?.referralTokens ?? 0;

  const oneTime = ONE_TIME_DEFS.map(d => ({
    ...d,
    unlocked: d.unlocked(stats, refCount, profile),
    earnedAt: profile?.achievements?.find(a => a.id === d.id)?.earnedAt ?? null,
  }));

  const price        = tokenStats?.price ?? 0;
  const battleUsd    = stats.battleBalance * price;
  const wolfAsBattle = stats.wolfBalance / 5000;

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Profile</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Your wolf, your numbers.</div>
          </div>

          {/* ── HERO ── */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ height: 140, background: "linear-gradient(120deg, #1F1B2E, #2b1a4d 50%, #1F1B2E)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
              <div className="mono" style={{ position: "absolute", top: 16, right: 20, fontSize: 11, color: "var(--cyan)", letterSpacing: 2 }}>LVL {stats.level} · {stats.levelName.toUpperCase()}</div>
            </div>
            <div style={{ padding: "0 28px 28px", display: "grid", gridTemplateColumns: "1fr 2fr 1.2fr", gap: 26, alignItems: "flex-end" }} className="profile-hero-grid">
              <div style={{ marginTop: -80 }}>
                <XPRing pct={xpPct} level={stats.level} />
              </div>
              <div style={{ paddingTop: 18 }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  {stats.walletAddress
                    ? <span className="pill lime" style={{ fontSize: 11 }}>✓ Wallet linked</span>
                    : <span className="pill" style={{ background: "var(--cream)", fontSize: 11 }}>👛 No wallet yet</span>}
                  {stats.dailyStreak > 0 && <span className="pill yellow" style={{ fontSize: 11 }}>🔥 {stats.dailyStreak}-day streak</span>}
                </div>
                <div className="display" style={{ fontSize: 48, lineHeight: 0.95, marginTop: 12 }}>{stats.username}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 6 }}>
                  {stats.walletAddress
                    ? `Solana wallet · ${shortAddr(stats.walletAddress)}`
                    : "No Solana wallet linked — add it on the Wallet page before converting."}
                </div>
                <div className="row" style={{ gap: 18, marginTop: 14, flexWrap: "wrap" }}>
                  {[
                    ["💎", stats.battleBalance.toFixed(2),                  "$BATTLE balance", "var(--yellow)"],
                    ["🐺", stats.wolfBalance.toLocaleString(),              "WOLF balance",    "var(--cyan)"],
                    ["🔥", `${stats.dailyStreak}d`,                          "streak",          "var(--tomato)"],
                    ["👑", `${stats.tier.icon} ${stats.tier.name}`,         "tier",            "var(--magenta)"],
                  ].map(([icon, val, sub, color]) => (
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
                <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>YOUR BALANCES</div>
                <div className="row" style={{ alignItems: "flex-end", gap: 12, marginTop: 4 }}>
                  <div>
                    <div className="display tabular" style={{ fontSize: 28, lineHeight: 1 }}>{stats.wolfBalance.toLocaleString()}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>WOLF</div>
                  </div>
                  <div>
                    <div className="display tabular" style={{ fontSize: 22, lineHeight: 1 }}>{stats.battleBalance.toFixed(4)}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>$BATTLE</div>
                  </div>
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 8 }}>
                  ≈ {wolfAsBattle.toFixed(4)} $BATTLE in WOLF · {price > 0 ? `wallet ≈ $${battleUsd.toFixed(2)}` : "USD —"}
                </div>
                <Link href="/convert" className="btn lg primary" style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>💱 Wallet & convert</Link>
              </div>
            </div>
          </div>

          {/* ── XP TO NEXT LEVEL ── */}
          <div className="card" style={{ padding: 20 }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div className="eyebrow">Level progress</div>
                <div className="display" style={{ fontSize: 22, marginTop: 4 }}>LVL {stats.level} → {stats.level + 1}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>XP</div>
                <div className="display tabular" style={{ fontSize: 18 }}>{stats.xp.toLocaleString()} / {stats.xpToNextLevel.toLocaleString()}</div>
              </div>
            </div>
            <div className="bar thick"><div className="bar-fill" style={{ width: `${xpPct}%`, background: "var(--magenta)" }} /></div>
            <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 8 }}>
              {Math.max(0, stats.xpToNextLevel - stats.xp).toLocaleString()} XP to go · earn XP by claiming mining sessions (1 WOLF = 1 XP)
            </div>
          </div>

          {/* ── WITHDRAWAL HISTORY ── */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">Withdrawals</div><h2>Your payout requests</h2></div>
              <div className="grow" />
              {myClaims.length > 0 && (
                <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>
                  {myClaims.filter(c => !c.paidAt).length} pending · {myClaims.filter(c => c.paidAt).length} paid
                </span>
              )}
            </div>

            {myClaims.length === 0 ? (
              <div className="card" style={{ padding: 22, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                <div className="display" style={{ fontSize: 18 }}>No withdrawals yet</div>
                <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 6 }}>
                  Convert WOLF → $BATTLE, then use the Withdraw card on the Wallet page to send $BATTLE to your Solana wallet.
                </div>
                <Link href="/convert" className="btn lg primary" style={{ marginTop: 14, display: "inline-flex" }}>💱 Go to Wallet</Link>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div className="row" style={{ padding: "12px 22px", borderBottom: "2.5px solid var(--ink)", background: "var(--cream)", fontSize: 11, color: "var(--mute)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, gap: 0 }}>
                  <div style={{ flex: 1 }}>Requested</div>
                  <div style={{ flex: 1.4 }}>Wallet</div>
                  <div style={{ width: 130, textAlign: "right" }}>Amount</div>
                  <div style={{ width: 120, textAlign: "right" }}>Status</div>
                </div>
                {myClaims.map((c, i) => (
                  <div key={c.id} className="row" style={{ padding: "12px 22px", borderBottom: i < myClaims.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", background: c.paidAt ? "rgba(182,242,63,0.06)" : "var(--paper)", gap: 0 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{new Date(c.requestedAt).toLocaleDateString()}</div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>{new Date(c.requestedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    <div style={{ flex: 1.4 }} className="mono">
                      <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{shortAddr(c.walletAddress)}</span>
                    </div>
                    <div style={{ width: 130, textAlign: "right" }} className="display tabular">
                      {Number(c.amount).toFixed(4)} <span style={{ fontSize: 11, color: "var(--mute)" }}>$BATTLE</span>
                    </div>
                    <div style={{ width: 120, textAlign: "right" }}>
                      {c.paidAt ? (
                        <span className="pill" style={{ background: "var(--lime)", fontSize: 10, padding: "3px 9px" }}>✓ Paid</span>
                      ) : (
                        <span className="pill" style={{ background: "var(--yellow)", fontSize: 10, padding: "3px 9px" }}>⏳ Pending</span>
                      )}
                      {c.paidAt && (
                        <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 4 }}>
                          {new Date(c.paidAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div style={{ padding: "10px 22px", background: "var(--cream-soft)", fontSize: 11, color: "var(--mute)" }}>
                  Pending withdrawals are processed by admin within 24h on weekdays. Once paid, $BATTLE arrives directly in your Solana wallet.
                </div>
              </div>
            )}
          </div>

          {/* ── ACHIEVEMENTS ── */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">Achievements</div><h2>The trophy room</h2></div>
              <div className="grow" />
              <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>{oneTime.filter(a => a.unlocked).length} / {oneTime.length} unlocked</span>
            </div>
            <div className="grid-4">
              {oneTime.map((a) => (
                <div key={a.id} className="card" style={{ padding: 16, opacity: a.unlocked ? 1 : 0.55, position: "relative", background: a.unlocked ? "var(--paper)" : "var(--cream-soft)" }}>
                  {a.unlocked && a.rare && <div className="sticker" style={{ position: "absolute", top: -10, right: 14, background: "var(--magenta)", color: "white", fontSize: 10, padding: "3px 8px" }}>RARE</div>}
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: a.unlocked ? a.color : "var(--cream)", border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: a.unlocked ? "2px 2px 0 0 var(--ink)" : "none" }}>
                    {a.unlocked ? a.icon : "🔒"}
                  </div>
                  <div className="display" style={{ fontSize: 15, marginTop: 12, lineHeight: 1.1 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 4 }}>{a.desc}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>
                      {a.unlocked ? (a.earnedAt ? new Date(a.earnedAt).toLocaleDateString() : "unlocked") : "locked"}
                    </span>
                    <span className="display" style={{ fontSize: 14, color: "var(--magenta)" }}>+{a.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── DAILY MISSIONS LINK + REFERRALS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="profile-bottom-grid">

            {/* Quick links to Daily Den & Mining */}
            <div className="card" style={{ padding: 22 }}>
              <div className="eyebrow">Daily things to do</div>
              <h3 className="display" style={{ fontSize: 22, marginTop: 4 }}>Earn more WOLF</h3>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 8 }}>
                The Daily Den has the live missions — spin once a day, open three chests on cooldown, claim streak milestones at days 3 / 7 / 14 / 21 / 30, and grab social/referral bounties.
              </p>
              <div className="row" style={{ gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <Link href="/daily" className="btn lg primary">🎰 Open Daily Den</Link>
                <Link href="/mine"  className="btn lg">⛏ Mining Hub</Link>
                <Link href="/pet"   className="btn lg">🐺 Pet Wolf</Link>
              </div>
            </div>

            {/* Referrals */}
            <div>
              <div className="card magenta" style={{ marginBottom: 14 }}>
                <div style={{ color: "white" }}>
                  <div style={{ fontSize: 14, opacity: 0.85 }}>Your referral link</div>
                  <div className="mono" style={{ fontSize: 13, marginTop: 8, background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 10, wordBreak: "break-all" }}>{refLink}</div>
                  <div className="row" style={{ gap: 8, marginTop: 12 }}>
                    <button className="btn sm yellow" style={{ flex: 1, justifyContent: "center" }} onClick={handleCopy}>
                      {copied ? "✓ Copied!" : "📋 Copy link"}
                    </button>
                    <button className="btn sm" style={{ background: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.4)", color: "white" }} onClick={handleShareX}>𝕏 Share</button>
                  </div>
                </div>
              </div>
              <div className="grid-2">
                <div className="card" style={{ textAlign: "center" }}>
                  <div className="stat-num tabular">{refCount}</div>
                  <div className="stat-label">pack size</div>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                  <div className="stat-num tabular">{refTokens.toLocaleString()}</div>
                  <div className="stat-label">$BATTLE earned via refs</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
