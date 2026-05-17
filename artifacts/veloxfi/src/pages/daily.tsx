import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useDailyStatus, dailyAction, type DailyStatus } from "@/lib/veloxfiApi";

const SPIN_REWARDS = [25, 50, 100, 250, 500, 1000, 5000];
const SPIN_COLORS  = ["var(--lavender)", "var(--cream)", "var(--cyan)", "var(--magenta)", "var(--yellow)", "var(--tomato)", "#FFD700"];

const CHEST_META: Record<string, { name: string; icon: string; color: string; range: string }> = {
  bronze: { name: "Bronze chest", icon: "🥉", color: "var(--cream)",  range: "50 – 200 WOLF" },
  silver: { name: "Silver chest", icon: "🥈", color: "var(--cyan)",   range: "200 – 800 WOLF" },
  gold:   { name: "Gold chest",   icon: "🥇", color: "var(--yellow)", range: "1,000 – 5,000 WOLF" },
};

const MILESTONE_DAYS = [3, 7, 14, 21, 30];

const BOUNTY_META: Record<string, { t: string; d: string; icon: string; color: string; href?: string }> = {
  bounty_telegram:   { t: "Join our Telegram",       d: "Tap, join the channel, then claim.",        icon: "✈", color: "var(--cyan)",    href: "https://t.me/VeloxFiOfficial" },
  bounty_x:          { t: "Follow @veloxfi on X",     d: "Follow on X, then claim.",                  icon: "𝕏", color: "var(--cyan)",    href: "https://x.com/Battle767629" },
  bounty_referral_1: { t: "Refer your first wolf",    d: "Your referral made their first claim.",     icon: "👤", color: "var(--lime)" },
  bounty_referral_5: { t: "Refer 5 wolves",           d: "Five active referrals — pack-leader vibes.",icon: "🐺", color: "var(--lime)" },
  bounty_referral_10:{ t: "Refer 10 wolves",          d: "You're building a real pack now.",          icon: "👑", color: "var(--magenta)" },
};

function fmtCountdown(ms: number): string {
  if (ms <= 0) return "ready";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function pickSegmentFromReward(reward: number): number {
  const idx = SPIN_REWARDS.indexOf(reward);
  return idx >= 0 ? idx : 0;
}

export default function DailyPage() {
  const { user, token, refreshUser } = useAuth();
  const { status, refresh } = useDailyStatus(token);
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick(t => t + 1), 1000); return () => clearInterval(id); }, []);

  const [wheelAngle, setWheelAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [chestResult, setChestResult] = useState<{ tier: string; reward: number } | null>(null);
  const [busy, setBusy] = useState<string>("");
  const [errMsg, setErrMsg] = useState<string>("");

  if (!user || !token) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main style={{ minWidth: 0 }}>
          <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div className="topbar">
              <div className="crumb">Home / <b>Daily Den</b></div>
              <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Daily rewards await.</div>
            </div>
            <div className="card" style={{ padding: 30, textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>🔒</div>
              <h2 className="display" style={{ fontSize: 28, marginBottom: 8 }}>Sign in to enter the den</h2>
              <p style={{ fontSize: 14, color: "var(--mute)", marginBottom: 18 }}>Spin the wheel, open chests, hit streak milestones — all in WOLF.</p>
              <Link href="/login" className="btn lg primary">Sign in / Register</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const streak = user.dailyStreak;

  async function handleSpin() {
    if (!token || spinning || !status?.spin.availableToday) return;
    setSpinning(true);
    setErrMsg("");
    const result = await dailyAction(token, "/spin");
    if (!result.ok) {
      setSpinning(false);
      setErrMsg(result.error ?? "Spin failed");
      return;
    }
    const reward = result.reward ?? 0;
    const idx = pickSegmentFromReward(reward);
    const segSize = 360 / SPIN_REWARDS.length;
    const target = 360 * 5 + (360 - (idx * segSize + segSize / 2));
    setWheelAngle(target);
    setTimeout(async () => {
      setSpinning(false);
      setSpinResult(reward);
      await refreshUser();
      refresh();
    }, 3000);
  }

  async function handleChest(tier: string) {
    if (!token) return;
    setBusy(`chest_${tier}`);
    setErrMsg("");
    const result = await dailyAction(token, `/chest/${tier}`);
    setBusy("");
    if (!result.ok) { setErrMsg(result.error ?? "Open failed"); return; }
    setChestResult({ tier, reward: result.reward ?? 0 });
    await refreshUser();
    refresh();
  }

  async function handleMilestone(day: number) {
    if (!token) return;
    setBusy(`ms_${day}`);
    setErrMsg("");
    const result = await dailyAction(token, `/milestone/${day}`);
    setBusy("");
    if (!result.ok) { setErrMsg(result.error ?? "Claim failed"); return; }
    await refreshUser();
    refresh();
  }

  async function handleBounty(id: string) {
    if (!token) return;
    setBusy(id);
    setErrMsg("");
    const result = await dailyAction(token, `/bounty/${id}`);
    setBusy("");
    if (!result.ok) { setErrMsg(result.error ?? "Claim failed"); return; }
    await refreshUser();
    refresh();
  }

  const totalAvailable = status ? sumAvailable(status) : 0;
  const milestoneList = MILESTONE_DAYS.map(d => status?.milestones?.[String(d)]).filter(Boolean) as DailyStatus["milestones"][string][];

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Daily Den</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Today's hunt.</div>
            <div className="pill" style={{ background: "var(--ink)", color: "white" }}>🔥 DAY {streak}</div>
          </div>

          {/* Greeting */}
          <div className="card cream" style={{ padding: 22, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, overflow: "hidden", border: "2.5px solid var(--ink)", boxShadow: "2px 2px 0 0 var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0 }}>
              <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div className="display" style={{ fontSize: 24, lineHeight: 1 }}>Welcome back, <span style={{ color: "var(--magenta)" }}>{user.username}</span></div>
              <div style={{ fontSize: 13, color: "var(--mute)", marginTop: 4 }}>
                {totalAvailable > 0
                  ? <>Today's available rewards: <b className="display" style={{ fontSize: 15 }}>{totalAvailable.toLocaleString()} WOLF</b></>
                  : "Nothing to claim right now — come back tomorrow."}
              </div>
            </div>
            {errMsg && <span className="pill" style={{ background: "var(--tomato)", color: "white", fontSize: 11 }}>{errMsg}</span>}
          </div>

          {/* Streak calendar */}
          <div className="card" style={{ padding: 22 }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div className="eyebrow">Daily streak</div>
                <div className="display" style={{ fontSize: 24, lineHeight: 1, marginTop: 4 }}>Day {streak} of 30</div>
              </div>
              <div className="row" style={{ gap: 10 }}>
                <span className="pill yellow" style={{ fontSize: 11 }}>🔥 {streak}-day streak</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }} className="streak-grid">
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                const done = day < streak;
                const isToday = day === streak;
                const isMilestone = MILESTONE_DAYS.includes(day);
                return (
                  <div key={i} style={{
                    aspectRatio: "1/1", border: "2px solid var(--ink)", borderRadius: 8,
                    background: done ? "var(--lime)" : isToday ? "var(--magenta)" : "var(--cream)",
                    color: isToday ? "white" : "var(--ink)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative",
                    boxShadow: isToday ? "0 0 12px var(--magenta)" : "none",
                    opacity: !done && !isToday && day > streak + 7 ? 0.5 : 1,
                  }}>
                    {done ? <span>✓</span> : <div className="display tabular" style={{ fontSize: 13, lineHeight: 1 }}>{day}</div>}
                    {isMilestone && <div style={{ position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: 99, background: "var(--yellow)", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>🏆</div>}
                  </div>
                );
              })}
            </div>
            <div className="row" style={{ marginTop: 12, gap: 14, fontSize: 11, color: "var(--mute)" }}>
              <span className="row" style={{ gap: 4 }}><div style={{ width: 10, height: 10, background: "var(--lime)", border: "1.5px solid var(--ink)", borderRadius: 2 }} />Claimed</span>
              <span className="row" style={{ gap: 4 }}><div style={{ width: 10, height: 10, background: "var(--magenta)", border: "1.5px solid var(--ink)", borderRadius: 2 }} />Today</span>
              <span>🏆 Milestone day</span>
              <div className="grow" />
              <span className="mono">Miss a day, streak resets to 1.</span>
            </div>
          </div>

          {/* Milestone rewards */}
          {milestoneList.length > 0 && (
            <div>
              <div className="section-title"><div><div className="eyebrow">Milestone rewards</div><h2 style={{ fontSize: 24 }}>Streak payouts</h2></div></div>
              <div className="grid-3">
                {milestoneList.map(m => (
                  <div key={m.day} className="card" style={{ padding: 18, background: m.claimed ? "var(--cream-soft)" : m.available ? "var(--paper)" : "var(--paper)", opacity: m.claimed ? 0.65 : 1 }}>
                    <div className="row" style={{ justifyContent: "space-between" }}>
                      <div className="display" style={{ fontSize: 18 }}>Day {m.day}</div>
                      <div className="display" style={{ fontSize: 18, color: "var(--magenta)" }}>+{m.reward}</div>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 4 }}>
                      {m.claimed ? "✓ Already claimed" : m.available ? "Ready to claim" : `Need ${m.day - streak} more days`}
                    </div>
                    <button
                      className="btn primary"
                      style={{ marginTop: 12, width: "100%", justifyContent: "center" }}
                      disabled={!m.available || busy === `ms_${m.day}`}
                      onClick={() => handleMilestone(m.day)}
                    >
                      {m.claimed ? "Claimed" : busy === `ms_${m.day}` ? "Claiming…" : m.available ? `💰 Claim ${m.reward} WOLF` : "🔒 Locked"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spin wheel */}
          <div className="card" style={{ padding: 22, textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ textAlign: "left" }}>
              <div className="eyebrow">Daily spin</div>
              <div className="display" style={{ fontSize: 22, lineHeight: 1.1, marginTop: 4 }}>One free spin per UTC day.</div>
              <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 4 }}>Random WOLF reward, weighted from 25 up to 5,000.</div>
            </div>
            <div style={{ position: "relative", width: 220, height: 220, margin: "16px auto 10px" }}>
              <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", zIndex: 3, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "16px solid var(--magenta)", filter: "drop-shadow(0 2px 0 var(--ink))" }} />
              <svg width="220" height="220" viewBox="-110 -110 220 220" style={{ transform: `rotate(${wheelAngle}deg)`, transition: spinning ? "transform 3s cubic-bezier(.2,.85,.25,1)" : "none" }}>
                {SPIN_REWARDS.map((rew, i) => {
                  const segSize = 360 / SPIN_REWARDS.length;
                  const start = i * segSize - 90, end = start + segSize;
                  const rad = (d: number) => (d * Math.PI) / 180;
                  const x1 = 100 * Math.cos(rad(start)), y1 = 100 * Math.sin(rad(start));
                  const x2 = 100 * Math.cos(rad(end)),   y2 = 100 * Math.sin(rad(end));
                  const ta = start + segSize / 2;
                  const tx = 66 * Math.cos(rad(ta)), ty = 66 * Math.sin(rad(ta));
                  return (
                    <g key={i}>
                      <path d={`M 0 0 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`} fill={SPIN_COLORS[i]} stroke="var(--ink)" strokeWidth="2" />
                      <text x={tx} y={ty} fill="var(--ink)" fontSize="13" fontFamily="Bagel Fat One" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${ta + 90} ${tx} ${ty})`}>{rew}</text>
                    </g>
                  );
                })}
                <circle cx="0" cy="0" r="22" fill="var(--ink)" stroke="var(--ink)" strokeWidth="2" />
              </svg>
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 40, height: 40, borderRadius: 99, background: "var(--ink)", border: "3px solid var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>✨</div>
            </div>
            <button className="btn lg magenta" style={{ width: "100%", maxWidth: 320, margin: "0 auto", justifyContent: "center" }} onClick={handleSpin} disabled={spinning || !status?.spin.availableToday}>
              {spinning ? "Spinning…" : !status ? "Loading…" : status.spin.availableToday ? "SPIN — FREE" : `Back tomorrow${status.spin.lastReward != null ? ` · last won ${status.spin.lastReward} WOLF` : ""}`}
            </button>
            {spinResult !== null && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(11,11,26,0.85)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", gap: 8 }}>
                <div className="mono" style={{ fontSize: 12, color: "var(--cyan)", letterSpacing: 2 }}>YOU WON</div>
                <div className="display tabular" style={{ fontSize: 56, color: SPIN_COLORS[pickSegmentFromReward(spinResult)], lineHeight: 1, textShadow: `0 0 24px ${SPIN_COLORS[pickSegmentFromReward(spinResult)]}` }}>+{spinResult}</div>
                <div className="mono" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>WOLF</div>
                <button className="btn lg primary" style={{ marginTop: 12 }} onClick={() => setSpinResult(null)}>Collect</button>
              </div>
            )}
          </div>

          {/* Treasure chests */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">Treasure chests</div><h2 style={{ fontSize: 24 }}>Three drops with cooldowns</h2></div>
              <div className="grow" />
              <span className="mono" style={{ fontSize: 12, color: "var(--mute)" }}>4h · 8h · 24h</span>
            </div>
            <div className="grid-3">
              {Object.keys(CHEST_META).map(tier => {
                const meta = CHEST_META[tier];
                const c = status?.chests?.[tier];
                const remaining = c ? Math.max(0, c.nextAtMs - (status?.now ?? Date.now())) : 0;
                return (
                  <div key={tier} className="card" style={{ padding: 22, background: meta.color, opacity: c && !c.ready && remaining > 0 ? 0.85 : 1 }}>
                    <div className="row" style={{ justifyContent: "space-between" }}>
                      <div className="display" style={{ fontSize: 20 }}>{meta.name}</div>
                      <div style={{ fontSize: 38 }}>{meta.icon}</div>
                    </div>
                    <div className="mono" style={{ fontSize: 11, marginTop: 4 }}>{meta.range}</div>
                    <div style={{ marginTop: 14 }}>
                      {c?.ready ? (
                        <button
                          className="btn lg ink"
                          style={{ width: "100%", justifyContent: "center" }}
                          onClick={() => handleChest(tier)}
                          disabled={busy === `chest_${tier}`}
                        >
                          {busy === `chest_${tier}` ? "Opening…" : "Open chest"}
                        </button>
                      ) : (
                        <div className="card cream" style={{ padding: 10, textAlign: "center" }}>
                          <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>NEXT OPEN</div>
                          <div className="display tabular" style={{ fontSize: 20 }}>{fmtCountdown(remaining)}</div>
                          {c?.lastReward != null && <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 4 }}>Last drop: {c.lastReward} WOLF</div>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bounties */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">Bounty board</div><h2 style={{ fontSize: 24 }}>Help the pack, earn WOLF</h2></div>
            </div>
            <div className="grid-2">
              {Object.keys(BOUNTY_META).map(id => {
                const meta = BOUNTY_META[id];
                const b = status?.bounties?.[id];
                return (
                  <div key={id} className="card" style={{ padding: 16, display: "flex", gap: 14, alignItems: "center", opacity: b?.claimed ? 0.55 : 1 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: meta.color, border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>{meta.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{meta.t}</div>
                      <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 2 }}>{meta.d}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="display" style={{ fontSize: 18, color: "var(--magenta)" }}>+{b?.reward ?? ""}</div>
                      {b?.claimed ? (
                        <span className="pill" style={{ background: "var(--lime)", fontSize: 10 }}>Claimed</span>
                      ) : (
                        <div className="row" style={{ gap: 6, justifyContent: "flex-end", marginTop: 4 }}>
                          {meta.href && <a href={meta.href} target="_blank" rel="noreferrer" className="btn sm">Open</a>}
                          <button
                            className="btn sm primary"
                            onClick={() => handleBounty(id)}
                            disabled={!b?.available || busy === id}
                          >
                            {busy === id ? "…" : b?.available ? "Claim" : "🔒"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chest result modal */}
          {chestResult && (
            <div onClick={() => setChestResult(null)} style={{ position: "fixed", inset: 0, background: "rgba(11,11,26,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
              <div className="card" style={{ padding: 30, textAlign: "center", maxWidth: 380 }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 56, marginBottom: 8 }}>{CHEST_META[chestResult.tier].icon}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--mute)", letterSpacing: 2 }}>{CHEST_META[chestResult.tier].name.toUpperCase()}</div>
                <div className="display tabular" style={{ fontSize: 48, color: "var(--magenta)", marginTop: 8 }}>+{chestResult.reward}</div>
                <div className="mono" style={{ fontSize: 13, color: "var(--mute)" }}>WOLF</div>
                <button className="btn lg primary" style={{ marginTop: 18, width: "100%", justifyContent: "center" }} onClick={() => setChestResult(null)}>Collect</button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function sumAvailable(s: DailyStatus): number {
  let total = 0;
  if (s.spin.availableToday) total += Math.min(...s.spin.rewards);
  for (const tier of Object.keys(s.chests)) {
    if (s.chests[tier].ready) total += 50;
  }
  for (const k of Object.keys(s.milestones)) {
    if (s.milestones[k].available) total += s.milestones[k].reward;
  }
  for (const k of Object.keys(s.bounties)) {
    if (s.bounties[k].available) total += s.bounties[k].reward;
  }
  return total;
}
