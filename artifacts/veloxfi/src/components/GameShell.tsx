import { type ReactNode } from "react";
import { Link } from "wouter";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

interface PowerUp {
  icon: string;
  name: string;
  desc: string;
}

interface Control {
  key: string;
  action: string;
}

interface GameShellProps {
  children: ReactNode;
  testId?: string;
  title?: string;
  tag?: string;
  description?: string;
  boost?: number;
  powerUps?: PowerUp[];
  controls?: Control[];
  sessionReward?: string;
}

export default function GameShell({
  children,
  testId,
  title = "Game",
  tag = "ARCADE · SOLO",
  description,
  boost = 1.0,
  powerUps = [],
  controls = [],
  sessionReward = "+WOLF",
}: GameShellProps) {
  const { user } = useAuth();

  return (
    <div className="app-shell" data-testid={testId}>
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div style={{ padding: "22px 28px 60px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ── Top bar ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 12, color: "var(--mute)" }}>
              <Link href="/games" style={{ color: "var(--mute)", textDecoration: "none" }}>Game Den</Link>
              <span style={{ margin: "0 6px" }}>/</span>
              <b style={{ color: "var(--ink)" }}>{title}</b>
            </div>
            <div style={{ flex: 1 }} />
            <Link href="/games" className="btn sm">← Back</Link>
            {user && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", border: "2.5px solid var(--ink)", borderRadius: 99, boxShadow: "var(--shadow-hard-sm)", background: "var(--paper)" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, overflow: "hidden", border: "2px solid var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0 }}>
                  <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1 }}>{user.username}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>LVL 14 · {(user.totalMined ?? 0).toLocaleString()} XP</div>
                </div>
              </div>
            )}
          </div>

          {/* ── Main layout: game + sidebar ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "flex-start" }}>

            {/* Game area */}
            <div style={{ background: "var(--ink)", border: "3px solid var(--ink)", borderRadius: 22, overflow: "hidden", boxShadow: "var(--shadow-hard-lg)" }}>
              {children}
            </div>

            {/* Right sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Game info */}
              <div className="card" style={{ padding: 20 }}>
                <div className="display" style={{ fontSize: 26, lineHeight: 1 }}>{title}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 4, letterSpacing: 1 }}>{tag}</div>
                {description && (
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 10, lineHeight: 1.6, margin: "10px 0 0" }}>{description}</p>
                )}
              </div>

              {/* Power-ups */}
              {powerUps.length > 0 && (
                <div className="card" style={{ padding: 18 }}>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>Power-ups</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {powerUps.map((p, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", border: "2px solid var(--ink)", borderRadius: 10, background: "var(--cream)" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--paper)", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{p.icon}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--mute)" }}>{p.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Controls */}
              {controls.length > 0 && (
                <div className="card" style={{ padding: 18 }}>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>Controls</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {controls.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ padding: "3px 8px", background: "var(--cream)", border: "1.5px solid var(--ink)", borderRadius: 6, fontSize: 12, fontFamily: "JetBrains Mono, monospace", boxShadow: "1px 1px 0 0 var(--ink)" }}>{c.key}</div>
                        <div style={{ fontSize: 13, color: "var(--mute)" }}>{c.action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session reward */}
              <div style={{ background: "var(--ink)", border: "2.5px solid var(--ink)", borderRadius: 22, padding: 18, boxShadow: "var(--shadow-hard)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--cyan)", letterSpacing: 1.5 }}>SESSION REWARD</div>
                    <div className="display tabular" style={{ fontSize: 28, lineHeight: 1, color: "white", marginTop: 4 }}>{sessionReward}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontSize: 10, color: "var(--magenta)", letterSpacing: 1.5 }}>HASH BOOST</div>
                    <div className="display tabular" style={{ fontSize: 28, lineHeight: 1, color: "white", marginTop: 4 }}>×{boost}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
