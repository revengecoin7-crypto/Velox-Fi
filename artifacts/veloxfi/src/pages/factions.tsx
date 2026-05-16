import { Sidebar } from "@/components/Sidebar";
import { Link } from "wouter";

export default function FactionsPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          <div className="topbar">
            <div className="crumb">Home / <b>Pack Wars</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Pack Wars.</div>
            <span className="pill yellow">🚧 Coming soon</span>
          </div>

          <div className="card ink" style={{ padding: 48, textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 64, marginBottom: 14 }}>🛡️</div>
              <div className="eyebrow" style={{ color: "var(--cyan)" }}>Future drop</div>
              <h2 className="display" style={{ fontSize: 56, lineHeight: 1, color: "white", margin: "10px 0 18px" }}>
                Pick your pack.<br />Win the week.
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", maxWidth: 560, margin: "0 auto 26px", lineHeight: 1.5 }}>
                Four factions, weekly wars, real $BATTLE rewards for the winning pack.
                We're polishing the matchmaking and on-chain settlement before this goes live.
              </p>
              <div className="row" style={{ gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/mine" className="btn lg primary">⛏ Start mining instead</Link>
                <Link href="/leaderboard" className="btn lg">🏆 See the leaderboard</Link>
              </div>
            </div>
          </div>

          <div className="grid-3">
            {[
              { icon: "⚡", title: "Cyber Pack",  desc: "Circuits and chrome. Hack-fast mining bonuses for tech-leaning wolves." },
              { icon: "🌲", title: "Forest Pack", desc: "Patient and strategic. Bonus rewards for long mining streaks." },
              { icon: "🔥", title: "Fire Pack",   desc: "Aggressive raiders. Higher game payouts, higher risk." },
            ].map((f) => (
              <div className="card" key={f.title}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{f.icon}</div>
                <div className="display" style={{ fontSize: 22 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "var(--mute)", marginTop: 4 }}>{f.desc}</div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
