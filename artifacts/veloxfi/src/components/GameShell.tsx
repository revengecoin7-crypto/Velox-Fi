import { type ReactNode } from "react";
import { Link } from "wouter";
import { Sidebar } from "./Sidebar";

interface GameShellProps {
  children: ReactNode;
  testId?: string;
  title?: string;
  tag?: string;
  description?: string;
  boost?: number;
  controls?: string[];
  rewards?: { label: string; value: string }[];
}

export default function GameShell({
  children,
  testId,
  title = "Game",
  tag = "ARCADE",
  description,
  boost,
  controls = [],
  rewards = [],
}: GameShellProps) {
  return (
    <div className="app-shell" data-testid={testId}>
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ padding: "22px 28px 60px" }}>

          {/* Top bar */}
          <div className="topbar" style={{ marginBottom: 18 }}>
            <div className="crumb">
              <Link href="/games" style={{ color: "var(--mute)", textDecoration: "none" }}>Game Den</Link>
              {" / "}<b>{title}</b>
            </div>
            {boost && (
              <span className="pill yellow" style={{ marginLeft: "auto" }}>
                Hash boost ×{boost} after win
              </span>
            )}
          </div>

          {/* Content: game + sidebar */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, alignItems: "flex-start" }}>

            {/* Game area */}
            <div>
              {children}
            </div>

            {/* Right sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Game info */}
              <div className="card" style={{ padding: 18 }}>
                <div className="display" style={{ fontSize: 24, lineHeight: 1 }}>{title}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 4 }}>{tag}</div>
                {description && (
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 10, lineHeight: 1.5 }}>{description}</p>
                )}
                {boost && (
                  <div className="card cyan" style={{ marginTop: 14, padding: "10px 14px" }}>
                    <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Hash Boost on win</div>
                    <div className="display tabular" style={{ fontSize: 28 }}>×{boost}</div>
                  </div>
                )}
              </div>

              {/* Controls */}
              {controls.length > 0 && (
                <div className="card" style={{ padding: 18 }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Controls</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {controls.map((c, i) => (
                      <div key={i} style={{ fontSize: 13, color: "var(--ink-soft)" }}>· {c}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rewards */}
              {rewards.length > 0 && (
                <div className="card" style={{ padding: 18 }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Rewards</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {rewards.map((r, i) => (
                      <div key={i} className="row" style={{ justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, color: "var(--mute)" }}>{r.label}</span>
                        <span className="display tabular" style={{ fontSize: 14, color: "var(--magenta)" }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back button */}
              <Link href="/games" className="btn" style={{ justifyContent: "center" }}>
                ← Back to Game Den
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
