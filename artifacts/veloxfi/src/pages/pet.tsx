import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

const PET_STAGES = [
  { name: "Pup",     min: 0,    max: 100,   icon: "🐶", bonus: 5,  desc: "Just hatched. Wide eyes." },
  { name: "Cub",     min: 100,  max: 300,   icon: "🦊", bonus: 10, desc: "Growing fangs. Sharp ears." },
  { name: "Hunter",  min: 300,  max: 700,   icon: "🐺", bonus: 20, desc: "Quick on its feet. Hunts at dusk." },
  { name: "Stalker", min: 700,  max: 1500,  icon: "🐺", bonus: 35, desc: "Silent. Lethal. Carries scars." },
  { name: "Alpha",   min: 1500, max: 99999, icon: "👑", bonus: 50, desc: "The pack bows. Apex predator." },
];

const INIT_ACCESSORIES = [
  { id: "collar",  name: "Cyber collar",   bonus: 5,  cost: 500,   rarity: "common",  owned: true,  equipped: true,  color: "var(--cyan)",     icon: "⚙" },
  { id: "goggles", name: "Hunter goggles", bonus: 8,  cost: 1200,  rarity: "rare",    owned: true,  equipped: false, color: "var(--magenta)",  icon: "🥽" },
  { id: "cape",    name: "Alpha cape",     bonus: 12, cost: 4000,  rarity: "epic",    owned: false, equipped: false, color: "var(--tomato)",   icon: "🧣" },
  { id: "crown",   name: "Pack crown",     bonus: 20, cost: 9000,  rarity: "legend",  owned: false, equipped: false, color: "var(--yellow)",   icon: "👑" },
  { id: "aura",    name: "Plasma aura",    bonus: 25, cost: 14000, rarity: "legend",  owned: false, equipped: false, color: "var(--lavender)", icon: "✨" },
  { id: "cosmic",  name: "Cosmic helmet",  bonus: 30, cost: 24000, rarity: "mythic",  owned: false, equipped: false, color: "#FFD700",         icon: "🌌" },
];

const RARITY_COLORS: Record<string, string> = {
  mythic: "#FFD700", legend: "var(--magenta)", epic: "var(--tomato)", rare: "var(--cyan)", common: "var(--cream)"
};

function PetMeter({ label, value, icon, color, hint }: { label: string; value: number; icon: string; color: string; hint: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ fontSize: 14 }}>{icon}</span><span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span></div>
        <span className="mono tabular" style={{ fontSize: 11 }}>{value}%</span>
      </div>
      <div className="bar thick"><div className="bar-fill" style={{ width: `${value}%`, background: color }} /></div>
      <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 4 }}>{hint}</div>
    </div>
  );
}

export default function PetPage() {
  const [xp, setXP] = useState(420);
  const [hunger, setHunger] = useState(72);
  const [happiness, setHappiness] = useState(88);
  const [petName, setPetName] = useState("AGENT_07");
  const [editingName, setEditingName] = useState(false);
  const [fedToday, setFedToday] = useState(false);
  const [playedToday, setPlayedToday] = useState(false);
  const [accessories, setAccessories] = useState(INIT_ACCESSORIES);

  const stageIdx = PET_STAGES.findIndex((s) => xp >= s.min && xp < s.max);
  const stage = PET_STAGES[stageIdx];
  const nextStage = PET_STAGES[stageIdx + 1];
  const stagePct = ((xp - stage.min) / (stage.max - stage.min)) * 100;
  const equippedBonus = accessories.filter((a) => a.equipped && a.owned).reduce((s, a) => s + a.bonus, 0);
  const totalBonus = stage.bonus + equippedBonus;

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Pet Wolf</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Meet {petName}.</div>
            <span className="pill yellow">⚡ +{totalBonus}% mining bonus</span>
          </div>

          {/* Hero */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", minHeight: 420 }}>
              {/* Wolf portrait */}
              <div style={{ background: "linear-gradient(140deg, #1a1d3a, #2b1a4d)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", inset: -22, borderRadius: "50%", border: "2.5px dashed rgba(255,43,214,0.5)", animation: "spin-slow 24s linear infinite" }} />
                    <div style={{ position: "absolute", inset: -44, borderRadius: "50%", border: "1.5px dashed rgba(8,209,242,0.3)", animation: "spin-slow 36s linear infinite reverse" }} />
                    <div className="float-y" style={{ width: 240, height: 240, borderRadius: "50%", overflow: "hidden", border: "5px solid var(--ink)", boxShadow: "0 0 50px var(--magenta), 0 0 20px var(--cyan)", background: "var(--ink)" }}>
                      <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)" }}>
                      <div className="card yellow" style={{ padding: "6px 14px", boxShadow: "0 4px 0 var(--ink)", whiteSpace: "nowrap" }}>
                        <span className="display" style={{ fontSize: 18 }}>{stage.icon} {stage.name.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ position: "absolute", top: 16, left: 16 }} className="mono">
                  <div style={{ fontSize: 10, color: "var(--cyan)" }}>BORN</div>
                  <div className="display" style={{ fontSize: 16, color: "white" }}>DAY 047</div>
                </div>
                <div style={{ position: "absolute", top: 16, right: 16, textAlign: "right" }} className="mono">
                  <div style={{ fontSize: 10, color: "var(--magenta)" }}>XP</div>
                  <div className="display" style={{ fontSize: 16, color: "white" }}>{xp} / {stage.max}</div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {editingName ? (
                    <input className="input mono" value={petName} onChange={(e) => setPetName(e.target.value)} onBlur={() => setEditingName(false)} onKeyDown={(e) => e.key === "Enter" && setEditingName(false)} autoFocus style={{ fontSize: 24, fontFamily: "Bagel Fat One", maxWidth: 220 }} />
                  ) : (
                    <div className="display" style={{ fontSize: 36, lineHeight: 1, cursor: "pointer" }} onClick={() => setEditingName(true)}>{petName}</div>
                  )}
                  <button className="btn sm ghost" onClick={() => setEditingName(true)}>Rename</button>
                </div>
                <div style={{ fontSize: 13, color: "var(--mute)", marginTop: -8 }}>{stage.desc}</div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>{stage.name.toUpperCase()} → {nextStage?.name.toUpperCase() ?? "MAX"}</span>
                    <span className="mono tabular" style={{ fontSize: 11 }}>{nextStage ? `${nextStage.min - xp} XP to go` : "MAX STAGE"}</span>
                  </div>
                  <div className="bar thick"><div className="bar-fill" style={{ width: `${stagePct}%`, background: "var(--magenta)" }} /></div>
                </div>

                <PetMeter label="Hunger" value={hunger} icon="🍖" color={hunger < 30 ? "var(--tomato)" : "var(--lime)"} hint={hunger < 30 ? "Feed me! Bonus halved when starving." : "Well fed."} />
                <PetMeter label="Happiness" value={happiness} icon="🎾" color={happiness < 30 ? "var(--tomato)" : "var(--cyan)"} hint={happiness < 30 ? "Lonely. Play with me!" : "Happy and bouncy."} />

                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button className="btn lg yellow" style={{ flex: 1, justifyContent: "center" }} onClick={() => { if (!fedToday) { setHunger((h) => Math.min(100, h + 25)); setHappiness((h) => Math.min(100, h + 5)); setXP((x) => x + 30); setFedToday(true); } }} disabled={fedToday}>
                    🍖 Feed {fedToday ? "· tomorrow" : "· +30 XP"}
                  </button>
                  <button className="btn lg primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => { if (!playedToday) { setHappiness((h) => Math.min(100, h + 30)); setHunger((h) => Math.max(0, h - 8)); setXP((x) => x + 20); setPlayedToday(true); } }} disabled={playedToday}>
                    🎾 Play {playedToday ? "· tomorrow" : "· +20 XP"}
                  </button>
                </div>

                <div className="card cream" style={{ padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>MINING BONUS</div>
                      <div className="display tabular" style={{ fontSize: 22 }}>+{totalBonus}%</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>STAGE {stage.bonus}% · GEAR {equippedBonus}%</div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>applies while pet is healthy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Growth stages */}
          <div>
            <div className="section-title"><div><div className="eyebrow">Growth stages</div><h2 style={{ fontSize: 22 }}>From pup to alpha</h2></div></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }}>
              {PET_STAGES.map((s, i) => (
                <div key={i} className="card" style={{ padding: 14, textAlign: "center", background: i === stageIdx ? "var(--cyan)" : "var(--paper)", opacity: i <= stageIdx ? 1 : 0.55 }}>
                  <div style={{ fontSize: 36, marginBottom: 4 }}>{s.icon}</div>
                  <div className="display" style={{ fontSize: 14 }}>{s.name.toUpperCase()}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 2 }}>{s.min} XP</div>
                  <div className="display tabular" style={{ fontSize: 14, color: "var(--magenta)", marginTop: 4 }}>+{s.bonus}% mining</div>
                  {i === stageIdx && <div className="pill" style={{ fontSize: 9, marginTop: 6, padding: "2px 6px", background: "var(--ink)", color: "var(--cyan)" }}>CURRENT</div>}
                  {i > stageIdx && <div style={{ fontSize: 12, marginTop: 4 }}>🔒</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">Wolf gear · stacks with stage bonus</div><h2 style={{ fontSize: 22 }}>Equip & flex</h2></div>
              <div className="grow" />
              <span className="pill yellow" style={{ fontSize: 11 }}>+{equippedBonus}% from equipped</span>
            </div>
            <div className="grid-3">
              {accessories.map((a) => (
                <div key={a.id} className="card" style={{ padding: 16, background: a.equipped ? a.color : "var(--paper)", position: "relative" }}>
                  {a.equipped && <div className="sticker" style={{ position: "absolute", top: -10, right: 12, background: "var(--lime)", fontSize: 11, padding: "3px 10px" }}>EQUIPPED</div>}
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--paper)", border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{a.icon}</div>
                    <div style={{ flex: 1, marginLeft: 12 }}>
                      <div className="display" style={{ fontSize: 17 }}>{a.name}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                        <span className="pill" style={{ fontSize: 9, background: RARITY_COLORS[a.rarity], color: a.rarity === "legend" ? "white" : "var(--ink)", padding: "1px 7px" }}>{a.rarity.toUpperCase()}</span>
                        <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>+{a.bonus}% mining</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    {a.owned ? (
                      <button className={`btn sm ${a.equipped ? "ink" : "primary"}`} onClick={() => setAccessories((prev) => prev.map((x) => x.id === a.id ? { ...x, equipped: !x.equipped } : x))}>
                        {a.equipped ? "Unequip" : "Equip"}
                      </button>
                    ) : (
                      <button className="btn sm magenta" onClick={() => setAccessories((prev) => prev.map((x) => x.id === a.id ? { ...x, owned: true } : x))}>Buy</button>
                    )}
                    <div className="display tabular" style={{ fontSize: 16 }}>{a.owned ? "✓ owned" : `${a.cost.toLocaleString()} $B`}</div>
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
