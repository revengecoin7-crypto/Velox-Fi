import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

const FACTIONS = [
  { id: "cyber",  name: "CYBER PACK",  tag: "CIRCUITS · CHROME",  color: "var(--cyan)",    bg: "#0A1B26", members: 4218, weekly: 482000, rank: 1, motto: "We hack the moon.",              emoji: "⚡" },
  { id: "forest", name: "FOREST PACK", tag: "ROOTS · INSTINCT",   color: "var(--lime)",    bg: "#0E2418", members: 3940, weekly: 421000, rank: 2, motto: "Silent. Patient. Hungry.",       emoji: "🌲" },
  { id: "fire",   name: "FIRE PACK",   tag: "BURN · BLOOD",       color: "var(--tomato)",  bg: "#2A1408", members: 3812, weekly: 398000, rank: 3, motto: "Scorched earth or nothing.",    emoji: "🔥" },
  { id: "ice",    name: "ICE PACK",    tag: "WHITE · FANG",       color: "#A8D5FF",        bg: "#0F1F3D", members: 2932, weekly: 312000, rank: 4, motto: "The cold bites back.",           emoji: "❄️" },
];

const WAR_HISTORY = [
  { week: 13, winner: "FOREST PACK", emoji: "🌲", total: "472k", diff: "+18k over Cyber" },
  { week: 12, winner: "CYBER PACK",  emoji: "⚡", total: "498k", diff: "+8k over Forest", current: true },
  { week: 11, winner: "FIRE PACK",   emoji: "🔥", total: "412k", diff: "+22k over Forest" },
  { week: 10, winner: "CYBER PACK",  emoji: "⚡", total: "388k", diff: "+12k over Ice" },
  { week: 9,  winner: "FOREST PACK", emoji: "🌲", total: "402k", diff: "+5k over Cyber" },
];

const CHAT = [
  ["alphawolf.sol", "lfg cyber!! 18hrs left", "2m", "var(--lime)"],
  ["moonwolf42", "top contributors: drop your wallets in the spreadsheet", "4m", "var(--cyan)"],
  ["SYSTEM", "pumpqueen.sol just mined 1,200 $BATTLE 🔥", "6m", "var(--magenta)"],
  ["fenrir77", "we need 60k more to widen the lead. grind harder", "14m", "var(--yellow)"],
  ["shibakid", "just flipped a forest spy", "22m", "var(--cyan)"],
  ["SYSTEM", "Daily combo posted on X — go solve it", "1h", "var(--magenta)"],
];

export default function FactionsPage() {
  const [myFaction, setMyFaction] = useState("cyber");
  const myF = FACTIONS.find((f) => f.id === myFaction)!;

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Pack Wars</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Pick your pack.</div>
            <span className="pill yellow">🏆 Winning pack: ×2 mining</span>
          </div>

          {/* Weekly war hero */}
          <div className="card ink" style={{ padding: 26, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 18 }}>
              <div>
                <div className="eyebrow" style={{ color: "var(--cyan)" }}>This week's war</div>
                <h2 className="display" style={{ fontSize: 42, lineHeight: 1, color: "white", margin: "6px 0" }}>WEEK 14 · BATTLE FOR THE MOON</h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", maxWidth: 540 }}>
                  The pack that mines the most $BATTLE this week gets a permanent ×2 mining multiplier next week. Top 100 within the winning pack split a 50,000 $BATTLE bonus pool.
                </p>
              </div>
              <div className="card cream" style={{ padding: "12px 18px" }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>WAR ENDS</div>
                <div className="display tabular" style={{ fontSize: 32, lineHeight: 1 }}>3d 14h</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 4 }}>Sunday 23:59 UTC</div>
              </div>
            </div>

            {/* Live rankings */}
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
              {FACTIONS.map((f) => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", padding: "14px 18px", background: f.id === myFaction ? f.color : "rgba(255,255,255,0.05)", border: f.id === myFaction ? "2.5px solid var(--ink)" : "1.5px solid rgba(255,255,255,0.1)", borderRadius: 14, gap: 16, color: f.id === myFaction ? "var(--ink)" : "white" }}>
                  <div className="display tabular" style={{ fontSize: 28, width: 50 }}>
                    {f.rank <= 3 ? ["🥇", "🥈", "🥉"][f.rank - 1] : `#${f.rank}`}
                  </div>
                  <div style={{ width: 50, height: 50, borderRadius: 12, background: f.color, border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{f.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div className="display" style={{ fontSize: 20, lineHeight: 1 }}>{f.name}</div>
                    <div className="mono" style={{ fontSize: 10, opacity: 0.65, marginTop: 4 }}>{f.members.toLocaleString()} wolves · {f.tag}</div>
                  </div>
                  <div style={{ flex: 1.4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span className="mono" style={{ fontSize: 10, opacity: 0.7 }}>MINED THIS WEEK</span>
                      <span className="display tabular" style={{ fontSize: 16 }}>{(f.weekly / 1000).toFixed(0)}k</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 5, background: "rgba(0,0,0,0.2)", overflow: "hidden", border: "1.5px solid var(--ink)" }}>
                      <div style={{ width: `${(f.weekly / 482000) * 100}%`, height: "100%", background: f.color }} />
                    </div>
                  </div>
                  {f.id === myFaction && <span className="pill" style={{ background: "var(--ink)", color: f.color, fontSize: 10, padding: "2px 8px" }}>YOU</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Your faction */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">Your pack</div><h2 style={{ fontSize: 26 }}>{myF.name}</h2></div>
              <div className="grow" />
              <button className="btn sm ghost">Switch pack (costs 5,000 $B)</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
              <div className="card" style={{ background: myF.color, padding: 24, position: "relative", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 18, background: "var(--paper)", border: "3px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, boxShadow: "4px 4px 0 var(--ink)", flexShrink: 0 }}>{myF.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div className="display" style={{ fontSize: 32, lineHeight: 1 }}>{myF.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>"{myF.motto}"</div>
                    <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
                      {[["RANK", `#${myF.rank}`], ["MEMBERS", myF.members.toLocaleString()], ["WEEKLY MINED", `${(myF.weekly / 1000).toFixed(0)}k`], ["YOU MINED", "3,120"]].map(([l, v]) => (
                        <div key={l}>
                          <div className="mono" style={{ fontSize: 9, color: "var(--ink-soft)" }}>{l}</div>
                          <div className="display tabular" style={{ fontSize: 22 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card flat" style={{ marginTop: 16, padding: 14, background: "var(--paper)", border: "2.5px solid var(--ink)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>YOUR CONTRIBUTION RANK</div>
                      <div className="display tabular" style={{ fontSize: 20 }}>#142 of {myF.members.toLocaleString()}</div>
                    </div>
                    <div className="display tabular" style={{ fontSize: 20, color: "var(--magenta)" }}>0.65%</div>
                  </div>
                  <div className="bar" style={{ marginTop: 8 }}><div className="bar-fill" style={{ width: "8%", background: "var(--magenta)" }} /></div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 6 }}>Top 100 contributors split the bonus pool if your pack wins.</div>
                </div>
              </div>

              {/* Pack chat */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div><div className="eyebrow">Pack channel</div><h2 className="display" style={{ fontSize: 22, marginTop: 4, lineHeight: 1 }}>Live chat</h2></div>
                  <span className="pill dot" style={{ fontSize: 10 }}>LIVE · 142</span>
                </div>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflow: "auto" }}>
                  {CHAT.map((m, i) => (
                    <div key={i} style={{ padding: "8px 10px", background: "var(--cream)", borderRadius: 8, fontSize: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, color: m[3] }}>{m[0]}</span>
                        <span className="mono" style={{ fontSize: 9, color: "var(--mute)" }}>{m[2]}</span>
                      </div>
                      <div>{m[1]}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <input className="input" placeholder="Type to the pack…" style={{ fontSize: 13 }} />
                  <button className="btn primary">Send</button>
                </div>
              </div>
            </div>
          </div>

          {/* All packs */}
          <div>
            <div className="section-title"><div><div className="eyebrow">All packs</div><h2 style={{ fontSize: 26 }}>Pick your fur</h2></div></div>
            <div className="grid-4">
              {FACTIONS.map((f) => (
                <div key={f.id} className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer", border: f.id === myFaction ? "3px solid var(--ink)" : "2.5px solid var(--ink)" }} onClick={() => setMyFaction(f.id)}>
                  <div style={{ background: f.bg, color: "white", padding: 18, position: "relative", minHeight: 160 }}>
                    <div style={{ position: "absolute", right: 14, top: 14, fontSize: 36 }}>{f.emoji}</div>
                    <div className="mono" style={{ fontSize: 9, color: f.color, letterSpacing: 1.5 }}>{f.tag}</div>
                    <div className="display" style={{ fontSize: 22, marginTop: 4, lineHeight: 1.1 }}>{f.name}</div>
                    <div className="mono" style={{ fontSize: 10, opacity: 0.65, marginTop: 8 }}>"{f.motto}"</div>
                  </div>
                  <div style={{ padding: 14, background: "var(--paper)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div><div className="mono" style={{ fontSize: 9, color: "var(--mute)" }}>MEMBERS</div><div className="display tabular" style={{ fontSize: 18 }}>{f.members.toLocaleString()}</div></div>
                      <div style={{ textAlign: "right" }}><div className="mono" style={{ fontSize: 9, color: "var(--mute)" }}>RANK</div><div className="display tabular" style={{ fontSize: 18, color: f.color }}>#{f.rank}</div></div>
                    </div>
                    {f.id === myFaction ? <div style={{ marginTop: 8 }}><span className="pill cyan" style={{ fontSize: 10 }}>YOUR PACK</span></div> : <button className="btn sm" style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>Defect (5,000 $B)</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* War history */}
          <div>
            <div className="section-title"><div><div className="eyebrow">Past wars</div><h2 style={{ fontSize: 22 }}>Pack history</h2></div></div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {WAR_HISTORY.map((w, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "14px 22px", borderBottom: i < WAR_HISTORY.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", gap: 16, background: w.current ? "var(--cream-soft)" : "transparent" }}>
                  <div className="mono" style={{ width: 70, color: "var(--mute)" }}>WEEK {w.week}</div>
                  <div style={{ fontSize: 26 }}>{w.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div className="display" style={{ fontSize: 16 }}>{w.winner}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>{w.diff}</div>
                  </div>
                  <div className="display tabular" style={{ fontSize: 18 }}>{w.total}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>$BATTLE mined</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
