import { type ReactNode } from "react";
import { Link } from "wouter";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

interface MetaItem { label: string; value: string }
interface PowerUp { icon: string; name: string; desc: string }
interface ControlItem { key: string; action: string }

interface GameShellProps {
  children: ReactNode;
  testId?: string;
  title: string;
  tag: string;
  description?: string;
  boost?: number;
  badge?: string;
  meta?: MetaItem[];
  powerUps?: PowerUp[];
  controls?: ControlItem[];
  side?: ReactNode;          // fully custom right panel
  sessionReward?: string;
}

export default function GameShell({
  children,
  testId,
  title,
  tag,
  description,
  boost = 1.0,
  badge,
  meta = [],
  powerUps = [],
  controls = [],
  side,
  sessionReward,
}: GameShellProps) {
  const { user } = useAuth();

  return (
    <div className="app-shell" data-testid={testId}>
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div style={{ padding: "22px 28px 60px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── breadcrumb + user chip ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, color: "var(--mute)" }}>
              <Link href="/games" style={{ color: "var(--mute)", textDecoration: "none" }}>Game Den</Link>
              <span style={{ margin: "0 6px" }}>/</span>
              <b style={{ color: "var(--ink)" }}>{title}</b>
            </div>
            <div style={{ flex: 1 }} />
            <Link href="/games" className="btn sm">← Back</Link>
            {user && (
              <div className="pill" style={{ gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, overflow: "hidden", border: "1.5px solid var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0 }}>
                  <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{user.username}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>LVL 14 · {(user.totalMined ?? 0)} XP</span>
              </div>
            )}
          </div>

          {/* ── meta strip ── */}
          {meta.length > 0 && (
            <div className="card cream" style={{ padding: "8px 16px", display: "flex", gap: 24 }}>
              {meta.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>{m.label.toUpperCase()}</span>
                  <span className="display tabular" style={{ fontSize: 14 }}>{m.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── main: game + sidebar ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, alignItems: "flex-start" }}>

            {/* game area */}
            <div>{children}</div>

            {/* right sidebar */}
            {side ? (
              <div className="card" style={{ padding: 16 }}>{side}</div>
            ) : (
              <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 0 }}>

                {/* header */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>{title}</div>
                    {badge && <span className="pill magenta" style={{ fontSize: 9 }}>{badge}</span>}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 4 }}>{tag.toUpperCase()}</div>
                </div>

                {description && (
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 14 }}>{description}</p>
                )}

                {/* power-ups */}
                {powerUps.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginBottom: 6 }}>POWER-UPS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {powerUps.map((p, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", border: "1.5px solid rgba(11,11,26,0.12)", borderRadius: 8, background: "var(--cream-soft)" }}>
                          <span style={{ fontSize: 16 }}>{p.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</div>
                            <div style={{ fontSize: 10, color: "var(--mute)" }}>{p.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* controls */}
                {controls.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginBottom: 8 }}>CONTROLS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {controls.map((c, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ padding: "2px 8px", background: "var(--cream)", border: "1.5px solid var(--ink)", borderRadius: 6, fontSize: 12, fontFamily: "JetBrains Mono, monospace", boxShadow: "1px 1px 0 0 var(--ink)" }}>{c.key}</span>
                          <span style={{ fontSize: 12, color: "var(--mute)" }}>{c.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* session reward */}
                <div style={{ background: "var(--ink)", border: "2.5px solid var(--ink)", borderRadius: 14, padding: 14, marginTop: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div className="mono" style={{ fontSize: 9, color: "var(--cyan)", letterSpacing: 1.5 }}>SESSION REWARD</div>
                      <div className="display tabular" style={{ fontSize: 24, lineHeight: 1, color: "white", marginTop: 2 }}>{sessionReward ?? "+WOLF"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontSize: 9, color: "var(--magenta)", letterSpacing: 1.5 }}>HASH BOOST</div>
                      <div className="display tabular" style={{ fontSize: 24, lineHeight: 1, color: "white", marginTop: 2 }}>×{boost}</div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
