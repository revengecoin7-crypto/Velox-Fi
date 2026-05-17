import { useState } from "react";
import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { usePageMeta } from "@/hooks/usePageMeta";

const CA = "HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump";
const PUMP_URL = "https://pump.fun/coin/HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump";

const HOW_TO_BUY = [
  { step: "01", title: "Get a Solana wallet", desc: "Download Phantom or Solflare and create a new wallet. Keep your seed phrase safe.", color: "var(--yellow)",   icon: "👛" },
  { step: "02", title: "Buy SOL",             desc: "Buy SOL on Coinbase, Binance, or any exchange and send it to your wallet.",       color: "var(--cyan)",     icon: "💳" },
  { step: "03", title: "Go to pump.fun",      desc: "Open the link below, paste the contract address, and swap SOL for $BATTLE.",     color: "var(--magenta)",  icon: "🚀" },
  { step: "04", title: "Hold & mine WOLF",    desc: "Run free 4-hour mining sessions and convert WOLF to $BATTLE (5000:1).",          color: "var(--lime)",     icon: "🏆" },
];

export default function Presale() {
  usePageMeta({
    title: "Buy $BATTLE — Live on pump.fun | VeloxFi",
    description: "$BATTLE is live on pump.fun. Buy on Solana with contract address HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump",
    canonical: "https://veloxfi.io/buy",
  });

  const [copied, setCopied] = useState(false);

  function copyCA() {
    navigator.clipboard.writeText(CA).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          <div className="topbar">
            <div className="crumb">Home / <b>Buy $BATTLE</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Buy $BATTLE on pump.fun.</div>
            <span className="pill dot">LIVE</span>
          </div>

          {/* Contract address card */}
          <div className="card ink" style={{ padding: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
            <div style={{ position: "relative", textAlign: "center" }}>
              <div className="eyebrow" style={{ color: "var(--cyan)", marginBottom: 8 }}>Contract address (CA)</div>
              <div className="row" style={{ gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 18 }}>
                <code className="mono" style={{ fontSize: 13, color: "white", background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 14px", wordBreak: "break-all" }}>{CA}</code>
                <button onClick={copyCA} className="btn lg" style={{ background: copied ? "var(--lime)" : "var(--yellow)" }}>
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
              </div>
              <a href={PUMP_URL} target="_blank" rel="noreferrer" className="btn lg" style={{ background: "var(--magenta)", color: "white", fontSize: 16, padding: "16px 32px" }}>
                🚀 Buy on pump.fun →
              </a>
            </div>
          </div>

          {/* Token info cards */}
          <div className="grid-3">
            {[
              { label: "Total supply", value: "1,000,000,000", color: "var(--cyan)" },
              { label: "Blockchain",   value: "Solana",         color: "var(--lime)" },
              { label: "Listed on",    value: "pump.fun",       color: "var(--magenta)" },
            ].map(c => (
              <div key={c.label} className="card" style={{ background: c.color, textAlign: "center", padding: 20 }}>
                <div className="eyebrow">{c.label}</div>
                <div className="display tabular" style={{ fontSize: 22, marginTop: 4 }}>{c.value}</div>
              </div>
            ))}
          </div>

          {/* How to buy */}
          <div>
            <div className="section-title"><div><div className="eyebrow">In 4 steps</div><h2>How to buy</h2></div></div>
            <div className="grid-2">
              {HOW_TO_BUY.map(s => (
                <div key={s.step} className="card" style={{ padding: 20 }}>
                  <div className="row" style={{ gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: s.color, border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "2px 2px 0 var(--ink)", flexShrink: 0 }}>{s.icon}</div>
                    <div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>STEP {s.step}</div>
                      <div className="display" style={{ fontSize: 16 }}>{s.title}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.55 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mine option */}
          <div className="card yellow" style={{ padding: 28, textAlign: "center" }}>
            <h3 className="display" style={{ fontSize: 24, margin: "0 0 6px" }}>Or mine $BATTLE for free</h3>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 16 }}>
              Mine WOLF tokens for free. Convert <b>5,000 WOLF = 1 $BATTLE</b> whenever you're ready.
            </p>
            <div className="row" style={{ gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/mine" className="btn lg primary">⛏ Start mining</Link>
              <Link href="/convert" className="btn lg">💱 Convert WOLF</Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
