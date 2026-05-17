import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

const RARITY_COLORS: Record<string, string> = {
  mythic: "#FFD700",
  legend: "var(--magenta)",
  epic:   "var(--tomato)",
  rare:   "var(--cyan)",
  common: "var(--cream)",
};

interface PetStage { name: string; min: number; max: number; bonus: number; icon: string; desc: string; index?: number }
interface PetAccessory { id: string; name: string; bonus: number; cost: number; rarity: string; icon: string; owned: boolean; equipped: boolean }
interface PetStatus {
  name: string;
  xp: number;
  stage: PetStage;
  nextStage: { name: string; min: number; icon: string } | null;
  stages: PetStage[];
  hunger: number;
  happiness: number;
  healthy: boolean;
  bonus: { stage: number; gear: number; total: number; healthyMultiplier: number };
  canFeed: boolean;
  canPlay: boolean;
  feedNextAt: number;
  playNextAt: number;
  accessories: PetAccessory[];
  now: number;
  createdAt: string;
}

function fmtCountdown(ms: number): string {
  if (ms <= 0) return "ready";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(1, Math.floor(ms / 86400000));
}

function PetMeter({ label, value, icon, color, hint }: { label: string; value: number; icon: string; color: string; hint: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span>
        </div>
        <span className="mono tabular" style={{ fontSize: 11 }}>{value}%</span>
      </div>
      <div className="bar thick"><div className="bar-fill" style={{ width: `${value}%`, background: color }} /></div>
      <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 4 }}>{hint}</div>
    </div>
  );
}

export default function PetPage() {
  const { user, token, refreshUser } = useAuth();
  const [status, setStatus] = useState<PetStatus | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [busy, setBusy] = useState<string>("");
  const [err, setErr] = useState("");

  const refresh = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/veloxfi/pet/status", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
    } catch {}
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [token]);

  // Refresh every 30s so hunger/happiness decay shows up live.
  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [token]);

  async function call(path: string, body?: any): Promise<any> {
    if (!token) return null;
    const res = await fetch(`/api/veloxfi/pet${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(data?.error ?? "Request failed"); return null; }
    setErr("");
    return data;
  }

  async function handleFeed() {
    setBusy("feed");
    const r = await call("/feed");
    setBusy("");
    if (r) await refresh();
  }
  async function handlePlay() {
    setBusy("play");
    const r = await call("/play");
    setBusy("");
    if (r) await refresh();
  }
  async function handleRename() {
    if (!nameDraft.trim()) { setEditingName(false); return; }
    setBusy("rename");
    const r = await call("/rename", { name: nameDraft.trim() });
    setBusy("");
    setEditingName(false);
    if (r) await refresh();
  }
  async function handleBuy(id: string) {
    setBusy(`buy_${id}`);
    const r = await call("/accessory/buy", { accessoryId: id });
    setBusy("");
    if (r) { await refresh(); await refreshUser(); }
  }
  async function handleEquip(id: string) {
    setBusy(`eq_${id}`);
    const r = await call("/accessory/equip", { accessoryId: id });
    setBusy("");
    if (r) await refresh();
  }

  if (!user || !token) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main style={{ minWidth: 0 }}>
          <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div className="topbar">
              <div className="crumb">Home / <b>Pet Wolf</b></div>
              <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Adopt your wolf.</div>
            </div>
            <div className="card" style={{ padding: 30, textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>🐺</div>
              <h2 className="display" style={{ fontSize: 28, marginBottom: 8 }}>Sign in to meet your wolf</h2>
              <p style={{ fontSize: 14, color: "var(--mute)", marginBottom: 18 }}>
                Feed it, play with it, dress it up — every stage and accessory adds to your mining bonus.
              </p>
              <Link href="/login" className="btn lg primary">Sign in / Register</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main style={{ minWidth: 0 }}>
          <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div className="topbar">
              <div className="crumb">Home / <b>Pet Wolf</b></div>
              <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Loading your wolf…</div>
            </div>
            <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--mute)" }}>Fetching pet data…</div>
          </div>
        </main>
      </div>
    );
  }

  const stage = status.stage;
  const nextStage = status.nextStage;
  const stagePct = ((status.xp - stage.min) / (stage.max - stage.min)) * 100;
  const ageDays = daysSince(status.createdAt);
  const effectiveBonus = Math.floor(status.bonus.total * status.bonus.healthyMultiplier);

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Pet Wolf</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Meet {status.name}.</div>
            <span className="pill yellow">⚡ +{effectiveBonus}% mining bonus</span>
          </div>

          {err && <div className="card" style={{ padding: 12, background: "var(--tomato)", color: "white", fontSize: 13 }}>{err}</div>}

          {/* Hero */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", minHeight: 420 }} className="pet-hero-grid">

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
                  <div style={{ fontSize: 10, color: "var(--cyan)" }}>AGE</div>
                  <div className="display" style={{ fontSize: 16, color: "white" }}>DAY {String(ageDays).padStart(3, "0")}</div>
                </div>
                <div style={{ position: "absolute", top: 16, right: 16, textAlign: "right" }} className="mono">
                  <div style={{ fontSize: 10, color: "var(--magenta)" }}>XP</div>
                  <div className="display" style={{ fontSize: 16, color: "white" }}>{status.xp} / {stage.max}</div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {editingName ? (
                    <>
                      <input className="input mono"
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value.slice(0, 32))}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        autoFocus
                        style={{ fontSize: 24, fontFamily: "Bagel Fat One", maxWidth: 240 }} />
                      <button className="btn sm primary" onClick={handleRename} disabled={busy === "rename"}>{busy === "rename" ? "…" : "Save"}</button>
                    </>
                  ) : (
                    <>
                      <div className="display" style={{ fontSize: 36, lineHeight: 1, cursor: "pointer" }} onClick={() => { setNameDraft(status.name); setEditingName(true); }}>{status.name}</div>
                      <button className="btn sm ghost" onClick={() => { setNameDraft(status.name); setEditingName(true); }}>Rename</button>
                    </>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "var(--mute)", marginTop: -8 }}>{stage.desc}</div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>{stage.name.toUpperCase()} → {nextStage?.name.toUpperCase() ?? "MAX"}</span>
                    <span className="mono tabular" style={{ fontSize: 11 }}>{nextStage ? `${nextStage.min - status.xp} XP to go` : "MAX STAGE"}</span>
                  </div>
                  <div className="bar thick"><div className="bar-fill" style={{ width: `${Math.min(100, Math.max(0, stagePct))}%`, background: "var(--magenta)" }} /></div>
                </div>

                <PetMeter
                  label="Hunger"
                  value={status.hunger}
                  icon="🍖"
                  color={status.hunger < 30 ? "var(--tomato)" : "var(--lime)"}
                  hint={status.hunger < 30 ? "Feed me! Bonus halved when hungry." : "Well fed."}
                />
                <PetMeter
                  label="Happiness"
                  value={status.happiness}
                  icon="🎾"
                  color={status.happiness < 30 ? "var(--tomato)" : "var(--cyan)"}
                  hint={status.happiness < 30 ? "Lonely. Play with me!" : "Happy and bouncy."}
                />

                <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                  <button className="btn lg yellow" style={{ flex: 1, justifyContent: "center", minWidth: 140 }} onClick={handleFeed} disabled={!status.canFeed || busy === "feed"}>
                    {busy === "feed" ? "Feeding…" : status.canFeed ? "🍖 Feed · +30 XP" : `🍖 Feed · ${fmtCountdown(status.feedNextAt - status.now)}`}
                  </button>
                  <button className="btn lg primary" style={{ flex: 1, justifyContent: "center", minWidth: 140 }} onClick={handlePlay} disabled={!status.canPlay || busy === "play"}>
                    {busy === "play" ? "Playing…" : status.canPlay ? "🎾 Play · +20 XP" : `🎾 Play · ${fmtCountdown(status.playNextAt - status.now)}`}
                  </button>
                </div>

                <div className="card cream" style={{ padding: 12 }}>
                  <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                    <div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>MINING BONUS</div>
                      <div className="display tabular" style={{ fontSize: 22 }}>+{effectiveBonus}%</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>STAGE +{status.bonus.stage}% · GEAR +{status.bonus.gear}%</div>
                      <div className="mono" style={{ fontSize: 10, color: status.healthy ? "var(--mute)" : "var(--tomato)" }}>
                        {status.healthy ? "applies on every claim" : "⚠ pet unhealthy — bonus halved"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Growth stages */}
          <div>
            <div className="section-title"><div><div className="eyebrow">Growth stages</div><h2 style={{ fontSize: 22 }}>From pup to alpha</h2></div></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }} className="stage-grid">
              {status.stages.map((s, i) => {
                const current = i === (stage.index ?? 0);
                const unlocked = status.xp >= s.min;
                return (
                  <div key={s.name} className="card" style={{ padding: 14, textAlign: "center", background: current ? "var(--cyan)" : "var(--paper)", opacity: unlocked ? 1 : 0.55 }}>
                    <div style={{ fontSize: 36, marginBottom: 4 }}>{s.icon}</div>
                    <div className="display" style={{ fontSize: 14 }}>{s.name.toUpperCase()}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 2 }}>{s.min} XP</div>
                    <div className="display tabular" style={{ fontSize: 14, color: "var(--magenta)", marginTop: 4 }}>+{s.bonus}%</div>
                    {current && <div className="pill" style={{ fontSize: 9, marginTop: 6, padding: "2px 6px", background: "var(--ink)", color: "var(--cyan)" }}>CURRENT</div>}
                    {!unlocked && <div style={{ fontSize: 12, marginTop: 4 }}>🔒</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Accessories */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">Wolf gear · stacks with stage bonus</div><h2 style={{ fontSize: 22 }}>Equip & flex</h2></div>
              <div className="grow" />
              <span className="pill yellow" style={{ fontSize: 11 }}>+{status.bonus.gear}% equipped</span>
            </div>
            <div className="grid-3">
              {status.accessories.map((a) => {
                const cantAfford = !a.owned && (user.wolf ?? 0) < a.cost;
                return (
                  <div key={a.id} className="card" style={{ padding: 16, background: a.equipped ? "var(--lime)" : "var(--paper)", position: "relative" }}>
                    {a.equipped && <div className="sticker" style={{ position: "absolute", top: -10, right: 12, background: "var(--ink)", color: "var(--lime)", fontSize: 11, padding: "3px 10px" }}>EQUIPPED</div>}
                    <div style={{ display: "flex", alignItems: "flex-start" }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--paper)", border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{a.icon}</div>
                      <div style={{ flex: 1, marginLeft: 12 }}>
                        <div className="display" style={{ fontSize: 17 }}>{a.name}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                          <span className="pill" style={{ fontSize: 9, background: RARITY_COLORS[a.rarity], color: a.rarity === "legend" || a.rarity === "mythic" ? "white" : "var(--ink)", padding: "1px 7px" }}>{a.rarity.toUpperCase()}</span>
                          <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>+{a.bonus}% mining</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 8 }}>
                      {a.owned ? (
                        <button className={`btn sm ${a.equipped ? "ink" : "primary"}`} onClick={() => handleEquip(a.id)} disabled={busy === `eq_${a.id}`}>
                          {busy === `eq_${a.id}` ? "…" : a.equipped ? "Unequip" : "Equip"}
                        </button>
                      ) : (
                        <button className="btn sm magenta" onClick={() => handleBuy(a.id)} disabled={cantAfford || busy === `buy_${a.id}`}>
                          {busy === `buy_${a.id}` ? "Buying…" : cantAfford ? "🔒 Need WOLF" : "Buy"}
                        </button>
                      )}
                      <div className="display tabular" style={{ fontSize: 15, textAlign: "right" }}>{a.owned ? "✓ owned" : `${a.cost.toLocaleString()} WOLF`}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 10, textAlign: "center" }}>
              Accessories cost WOLF (not $BATTLE). Once owned, equip to stack their bonus with your stage bonus on every mining claim.
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
