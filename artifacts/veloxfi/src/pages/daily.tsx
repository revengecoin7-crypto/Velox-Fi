import { useState } from "react";
import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { calcUserStats } from "@/lib/userStats";

const WHEEL_REWARDS = [
  { label: "50",    value: 50,   color: "var(--cream)" },
  { label: "100",   value: 100,  color: "var(--cyan)" },
  { label: "250",   value: 250,  color: "var(--magenta)" },
  { label: "500",   value: 500,  color: "var(--yellow)" },
  { label: "×2",    value: 0,    color: "var(--lime)", special: "×2 mining 24h" },
  { label: "1,000", value: 1000, color: "var(--tomato)" },
  { label: "25",    value: 25,   color: "var(--lavender)" },
  { label: "5,000", value: 5000, color: "#FFD700", special: "Jackpot" },
];

const CHESTS = [
  { id: "common", name: "Bronze chest", cooldown: "4h",  low: 50,   high: 200,  color: "var(--cream)", icon: "🥉", ready: true,  wait: null },
  { id: "rare",   name: "Silver chest", cooldown: "8h",  low: 200,  high: 800,  color: "var(--cyan)",  icon: "🥈", ready: false, wait: "2h 14m" },
  { id: "legend", name: "Gold chest",   cooldown: "24h", low: 1000, high: 5000, color: "var(--yellow)",icon: "🥇", ready: false, wait: "14h 22m" },
];

const BOUNTIES = [
  { t: "Follow @veloxfi on X",         d: "Verify with Twitter connect.",                            r: 100, icon: "𝕏",   color: "var(--cyan)",    done: true },
  { t: "Join our Telegram",            d: "5,400 wolves already inside.",                            r: 100, icon: "✈",   color: "var(--cyan)",    done: true },
  { t: "Tweet with #VeloxFi",          d: "Pool entry — 1 wolf per hour wins 500 $B.",               r: 500, icon: "📢",  color: "var(--magenta)", done: false, lottery: true },
  { t: "Refer a wolf",                  d: "They make their first claim → 250 $B each.",             r: 250, icon: "👤",  color: "var(--lime)",    done: false, repeats: true },
  { t: "Reach LVL 15",                 d: "You're at LVL 14 — almost there.",                        r: 1000,icon: "👑",  color: "var(--yellow)",  done: false, progress: 85 },
  { t: "Drop a meme in #shitposting",  d: "Voted top 5 in 24h → +250 $B.",                          r: 250, icon: "🔥",  color: "var(--tomato)",  done: false, lottery: true },
];

const DAY_MILESTONES: Record<number, number> = { 3: 100, 7: 250, 14: 500, 21: 1000, 30: 2500 };
function dayReward(d: number) { return DAY_MILESTONES[d] || (d % 5 === 0 ? 50 : 15); }

export default function DailyPage() {
  const { user } = useAuth();
  const stats = calcUserStats(user);
  const currentDay = stats.dailyStreak;
  const hour = new Date().getHours();
  const greeting = hour < 6 ? "Late night, wolf." : hour < 12 ? "Good morning, wolf." : hour < 18 ? "Afternoon, wolf." : "Evening, wolf.";

  // Spin wheel state
  const [wheelAngle, setWheelAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<typeof WHEEL_REWARDS[0] | null>(null);
  const [usedSpin, setUsedSpin] = useState(false);

  // Combo cipher
  const [code, setCode] = useState(["", "", ""]);
  const [solved, setSolved] = useState(false);

  // Prediction
  const [pick, setPick] = useState<"up" | "down" | null>(null);

  // Chests
  const [opened, setOpened] = useState<Record<string, number>>({});

  // Energy (base max 100, regenerates 5/hour)
  const [energy] = useState(() => {
    if (!user?.wolfMiningStart) return 72;
    const hoursSince = (Date.now() - user.wolfMiningStart) / 3600000;
    return Math.min(100, Math.floor(hoursSince * 5));
  });

  function spin() {
    if (spinning || usedSpin) return;
    setSpinning(true);
    setSpinResult(null);
    const idx = Math.floor(Math.random() * WHEEL_REWARDS.length);
    const segSize = 360 / WHEEL_REWARDS.length;
    const target = 360 * 5 + (360 - (idx * segSize + segSize / 2));
    setWheelAngle(target);
    setTimeout(() => { setSpinning(false); setSpinResult(WHEEL_REWARDS[idx]); setUsedSpin(true); }, 3000);
  }

  function setChar(i: number, v: string) {
    const next = [...code];
    next[i] = v.toUpperCase().slice(-1);
    setCode(next);
    if (next.join("") === "WLF") setSolved(true);
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Daily Den</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Today's hunt.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--ink)", color: "white", padding: "4px 12px", borderRadius: 99, border: "2.5px solid var(--ink)", boxShadow: "2px 2px 0 0 var(--ink)" }}>
                <span style={{ color: "var(--tomato)" }}>🔥</span>
                <span className="display tabular" style={{ fontSize: 14 }}>DAY {currentDay}</span>
              </div>
            </div>
          </div>

          {/* Greeting */}
          <div className="card" style={{ padding: 20, background: "linear-gradient(120deg, var(--cream) 0%, var(--cream-soft) 100%)", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, overflow: "hidden", border: "2.5px solid var(--ink)", boxShadow: "2px 2px 0 0 var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0 }}>
              <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="display" style={{ fontSize: 26, lineHeight: 1 }}>{greeting} <span style={{ color: "var(--magenta)" }}>{user?.username ?? "wolfkid"}</span></div>
              <div style={{ fontSize: 13, color: "var(--mute)", marginTop: 4 }}>5 daily tasks waiting. Finish them for <b className="display" style={{ fontSize: 16 }}>+1,850 $BATTLE</b>.</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="pill yellow" style={{ fontSize: 11 }}>🔥 {currentDay}-day streak</span>
              <span className="pill cyan" style={{ fontSize: 11 }}>Resets in 11h 24m</span>
            </div>
          </div>

          {/* Streak + Energy */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
            {/* Streak calendar */}
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div className="eyebrow">Daily streak</div>
                  <div className="display" style={{ fontSize: 28, lineHeight: 1, marginTop: 4 }}>Day {currentDay} of 30</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>NEXT MILESTONE</div>
                    <div className="display tabular" style={{ fontSize: 18 }}>Day 14 · +500</div>
                  </div>
                  <div className="card yellow" style={{ padding: "6px 12px" }}>🔥</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const done = day < currentDay;
                  const isToday = day === currentDay;
                  const reward = dayReward(day);
                  const isMilestone = DAY_MILESTONES[day];
                  return (
                    <div key={i} style={{ aspectRatio: "1/1", border: "2px solid var(--ink)", borderRadius: 8, background: done ? "var(--lime)" : isToday ? "var(--magenta)" : "var(--cream)", color: isToday ? "white" : "var(--ink)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: isToday ? "0 0 14px var(--magenta)" : "none", opacity: !done && !isToday && day > currentDay + 7 ? 0.5 : 1 }}>
                      {done ? (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--lime)", borderRadius: 6 }}>✓</div>
                      ) : (
                        <>
                          <div className="display tabular" style={{ fontSize: 13, lineHeight: 1 }}>{day}</div>
                          <div className="mono" style={{ fontSize: 8, marginTop: 2, opacity: 0.7 }}>+{reward}</div>
                        </>
                      )}
                      {isMilestone && <div style={{ position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: 99, background: "var(--yellow)", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>🏆</div>}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 11, color: "var(--mute)" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}><div style={{ width: 10, height: 10, background: "var(--lime)", border: "1.5px solid var(--ink)", borderRadius: 2 }} />Claimed</div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}><div style={{ width: 10, height: 10, background: "var(--magenta)", border: "1.5px solid var(--ink)", borderRadius: 2 }} />Today</div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>🏆 Milestone</div>
                <div style={{ flex: 1 }} />
                <div className="mono">Miss a day, streak resets to 1.</div>
              </div>
            </div>

            {/* Energy + claim */}
            <div className="card cyan" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div className="eyebrow">Mining energy</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                  <div className="display tabular" style={{ fontSize: 40, lineHeight: 1 }}>{energy}</div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>/ 100</div>
                </div>
                <div className="bar thick" style={{ marginTop: 8 }}>
                  <div className="bar-fill" style={{ width: `${energy}%`, background: "var(--ink)" }} />
                </div>
                <div className="mono" style={{ fontSize: 11, marginTop: 6, color: "var(--ink-soft)" }}>+5 / hour · full in 5h 36m</div>
              </div>
              <div style={{ border: "2px dashed var(--ink)", borderRadius: 12, padding: 12 }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-soft)" }}>NEXT CLAIM</div>
                <div className="display tabular" style={{ fontSize: 22, marginTop: 4, lineHeight: 1 }}>{stats.claimable.toLocaleString()} $BATTLE</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>Ready · costs 20 energy</div>
                <Link href="/mine" className="btn lg magenta" style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>
                  💰 Claim
                </Link>
              </div>
            </div>
          </div>

          {/* Daily 3-pack */}
          <div className="grid-3">
            {/* Combo cipher */}
            <div className="card" style={{ padding: 20, background: solved ? "var(--lime)" : "var(--paper)", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div className="eyebrow">Daily combo</div>
                  <div className="display" style={{ fontSize: 20, lineHeight: 1.1, marginTop: 4 }}>The 3-letter cipher.</div>
                </div>
                <div className="card yellow" style={{ padding: 8 }}>🔒</div>
              </div>
              <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: 0 }}>Drop in our X & Telegram daily. New code every 24h. Solve = +200 $BATTLE.</p>
              <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "center" }}>
                {[0, 1, 2].map((i) => (
                  <input key={i} maxLength={1} disabled={solved} className="input mono" value={code[i]} onChange={(e) => setChar(i, e.target.value)}
                    style={{ width: 56, height: 64, textAlign: "center", fontSize: 32, fontFamily: "Bagel Fat One", padding: 0 }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn sm" style={{ flex: 1, justifyContent: "center" }}>𝕏 Find on X</button>
                <button className="btn sm" style={{ flex: 1, justifyContent: "center" }}>✈ Telegram</button>
              </div>
              {solved && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(11,11,26,0.8)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", gap: 8 }}>
                  <div className="display" style={{ fontSize: 32, color: "var(--lime)" }}>+200 $BATTLE</div>
                  <div className="mono" style={{ fontSize: 12 }}>CIPHER CRACKED · come back tomorrow</div>
                </div>
              )}
            </div>

            {/* Spin wheel */}
            <div className="card" style={{ padding: 20, textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ textAlign: "left" }}>
                <div className="eyebrow">Daily spin</div>
                <div className="display" style={{ fontSize: 20, lineHeight: 1.1, marginTop: 4 }}>1 free spin per day.</div>
              </div>
              <div style={{ position: "relative", width: 200, height: 200, margin: "14px auto 10px" }}>
                <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", zIndex: 3, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "16px solid var(--magenta)", filter: "drop-shadow(0 2px 0 var(--ink))" }} />
                <svg width="200" height="200" viewBox="-100 -100 200 200" style={{ transform: `rotate(${wheelAngle}deg)`, transition: spinning ? "transform 3s cubic-bezier(.2,.85,.25,1)" : "none" }}>
                  {WHEEL_REWARDS.map((seg, i) => {
                    const segSize = 360 / WHEEL_REWARDS.length;
                    const start = i * segSize - 90, end = start + segSize;
                    const rad = (d: number) => (d * Math.PI) / 180;
                    const x1 = 90 * Math.cos(rad(start)), y1 = 90 * Math.sin(rad(start));
                    const x2 = 90 * Math.cos(rad(end)), y2 = 90 * Math.sin(rad(end));
                    const ta = start + segSize / 2;
                    const tx = 60 * Math.cos(rad(ta)), ty = 60 * Math.sin(rad(ta));
                    return (
                      <g key={i}>
                        <path d={`M 0 0 L ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2} Z`} fill={seg.color} stroke="var(--ink)" strokeWidth="2" />
                        <text x={tx} y={ty} fill="var(--ink)" fontSize="13" fontFamily="Bagel Fat One" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${ta + 90} ${tx} ${ty})`}>{seg.label}</text>
                      </g>
                    );
                  })}
                  <circle cx="0" cy="0" r="20" fill="var(--ink)" stroke="var(--ink)" strokeWidth="2" />
                </svg>
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 36, height: 36, borderRadius: 99, background: "var(--ink)", border: "3px solid var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>✨</div>
              </div>
              <button className="btn lg magenta" style={{ width: "100%", justifyContent: "center" }} onClick={spin} disabled={spinning || usedSpin}>
                {spinning ? "Spinning…" : usedSpin ? "Back tomorrow" : "SPIN — FREE"}
              </button>
              <button className="btn sm ghost" style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>Premium spin · 0.01 SOL</button>
              {spinResult && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(11,11,26,0.85)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", gap: 6 }}>
                  <div className="mono" style={{ fontSize: 12, color: "var(--cyan)", letterSpacing: 2 }}>YOU WON</div>
                  <div className="display tabular" style={{ fontSize: 56, color: spinResult.color, lineHeight: 1, textShadow: `0 0 24px ${spinResult.color}` }}>{spinResult.special ?? `+${spinResult.value}`}</div>
                  {!spinResult.special && <div className="mono" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>$BATTLE</div>}
                  <button className="btn lg primary" style={{ marginTop: 12 }} onClick={() => setSpinResult(null)}>Collect</button>
                </div>
              )}
            </div>

            {/* Daily prediction */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div>
                  <div className="eyebrow">Daily prediction</div>
                  <div className="display" style={{ fontSize: 20, lineHeight: 1.1, marginTop: 4 }}>Will SOL close higher today?</div>
                </div>
                <div className="card cream" style={{ padding: "4px 10px" }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--mute)" }}>RESET</div>
                  <div className="display tabular" style={{ fontSize: 14 }}>14h 22m</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--mute)", marginTop: 4 }}>
                <span>SOL · $184.21</span>
                <span style={{ color: "var(--lime)" }}>↑ +0.8% today</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button className={`btn lg${pick === "up" ? " lime" : ""}`} style={{ flex: 1, justifyContent: "center", fontSize: 18, opacity: pick && pick !== "up" ? 0.45 : 1 }} onClick={() => setPick("up")}>↑ HIGHER</button>
                <button className={`btn lg${pick === "down" ? " magenta" : ""}`} style={{ flex: 1, justifyContent: "center", fontSize: 18, opacity: pick && pick !== "down" ? 0.45 : 1 }} onClick={() => setPick("down")}>↓ LOWER</button>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--lime)" }}>UP · 64%</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--magenta)" }}>DOWN · 36%</span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: "var(--magenta)", border: "2px solid var(--ink)", overflow: "hidden" }}>
                  <div style={{ width: "64%", height: "100%", background: "var(--lime)" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, padding: "8px 10px", background: "var(--cream)", borderRadius: 10 }}>
                <span style={{ color: "var(--lime)" }}>✓</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Yesterday: SOL closed UP. You won +100 $BATTLE.</span>
              </div>
            </div>
          </div>

          {/* Treasure chests */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">Treasure chests</div><h2 style={{ fontSize: 26 }}>Three drops every day</h2></div>
              <div className="grow" />
              <span className="mono" style={{ fontSize: 12, color: "var(--mute)" }}>4h · 8h · 24h cooldowns</span>
            </div>
            <div className="grid-3">
              {CHESTS.map((c) => (
                <div key={c.id} className="card" style={{ padding: 22, background: c.color, opacity: opened[c.id] ? 0.55 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div className="display" style={{ fontSize: 20 }}>{c.name}</div>
                    <div style={{ fontSize: 38 }}>{c.icon}</div>
                  </div>
                  <div className="mono" style={{ fontSize: 11, marginTop: 4 }}>{c.low.toLocaleString()} — {c.high.toLocaleString()} $BATTLE</div>
                  <div style={{ marginTop: 14 }}>
                    {opened[c.id] ? (
                      <div className="card cream" style={{ padding: 10, textAlign: "center" }}>
                        <div className="mono" style={{ fontSize: 10 }}>OPENED</div>
                        <div className="display tabular" style={{ fontSize: 22, color: "var(--lime)" }}>+{opened[c.id]} $BATTLE</div>
                      </div>
                    ) : c.ready ? (
                      <button className="btn lg ink" style={{ width: "100%", justifyContent: "center" }} onClick={() => setOpened((o) => ({ ...o, [c.id]: Math.floor(c.low + Math.random() * (c.high - c.low)) }))}>
                        Open chest
                      </button>
                    ) : (
                      <div className="card flat" style={{ padding: 8, textAlign: "center", border: "2px solid var(--ink)" }}>
                        <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>NEXT OPEN</div>
                        <div className="display tabular" style={{ fontSize: 20 }}>{c.wait}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bounty board */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">Bounty board</div><h2 style={{ fontSize: 26 }}>Help the pack, earn $BATTLE</h2></div>
            </div>
            <div className="grid-2">
              {BOUNTIES.map((b, i) => (
                <div key={i} className="card" style={{ padding: 16, display: "flex", gap: 14, alignItems: "center", opacity: b.done ? 0.55 : 1 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: b.color, border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>{b.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{b.t}</div>
                      {b.lottery && <span className="pill" style={{ fontSize: 9, padding: "1px 6px" }}>LOTTERY</span>}
                      {b.repeats && <span className="pill cyan" style={{ fontSize: 9, padding: "1px 6px" }}>REPEATS</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 2 }}>{b.d}</div>
                    {b.progress !== undefined && (
                      <div className="bar" style={{ marginTop: 6 }}><div className="bar-fill" style={{ width: `${b.progress}%`, background: b.color }} /></div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="display" style={{ fontSize: 18, color: "var(--magenta)" }}>+{b.r}</div>
                    {b.done ? <span className="pill" style={{ background: "var(--lime)", fontSize: 10 }}>Claimed</span> : <button className="btn sm" style={{ marginTop: 4 }}>Go →</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
