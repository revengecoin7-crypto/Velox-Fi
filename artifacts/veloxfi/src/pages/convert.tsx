import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Link } from "wouter";

const HOLD_TIERS = [
  { days: 7,  bonus: 25, label: "7-day hold",  color: "var(--cyan)",    icon: "🔒" },
  { days: 30, bonus: 50, label: "30-day hold", color: "var(--magenta)", icon: "💎" },
];

export default function Convert() {
  const { user, requestConversion, setWallet } = useAuth();
  const [, nav] = useLocation();
  const [wolfAmount, setWolfAmount] = useState("");
  const [walletInput, setWalletInput] = useState(user?.wallet ?? "");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [holdDays] = useState(12); // mock: user has held for 12 days

  if (!user) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main style={{ minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ maxWidth: 400, width: "100%", padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🔄</div>
            <div className="display" style={{ fontSize: 28 }}>Convert WOLF</div>
            <p style={{ fontSize: 13, color: "var(--mute)", marginTop: 8, marginBottom: 20 }}>Login to convert your WOLF to $BATTLE tokens.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href="/login" className="btn lg primary" style={{ justifyContent: "center" }}>Login</Link>
              <Link href="/register" className="btn lg" style={{ justifyContent: "center" }}>Register</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const wolf = parseInt(wolfAmount) || 0;
  const battleOut = wolf > 0 ? wolf / 5000 : 0;
  const canConvert = wolf > 0 && wolf <= user!.wolf;

  // Hold-to-earn current tier
  const holdTier = holdDays >= 30 ? HOLD_TIERS[1] : holdDays >= 7 ? HOLD_TIERS[0] : null;
  const nextHoldTier = holdDays >= 30 ? null : holdDays >= 7 ? HOLD_TIERS[1] : HOLD_TIERS[0];

  async function handleConvert() {
    if (!walletInput.trim()) { setStatus("error"); setMsg("Enter your Solana wallet address first."); return; }
    if (!canConvert) { setStatus("error"); setMsg(wolf > user!.wolf ? "Insufficient WOLF balance." : "Enter a valid WOLF amount."); return; }
    await setWallet(walletInput.trim());
    const result = await requestConversion(wolf);
    if (result?.ok) {
      setStatus("success");
      setMsg(`Conversion requested! You'll receive ${battleOut.toFixed(4)} $BATTLE within 24 hours.`);
      setWolfAmount("");
    } else {
      setStatus("error");
      setMsg(result?.error || "Something went wrong.");
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Wallet</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Your wallet.</div>
          </div>

          {/* Balance + rate */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div className="card" style={{ padding: 22 }}>
              <div className="stat-label">WOLF Balance</div>
              <div className="stat-num tabular">{user!.wolf.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 4 }}>= {(user!.wolf / 5000).toFixed(4)} $BATTLE max</div>
            </div>
            <div className="card yellow" style={{ padding: 22, textAlign: "center" }}>
              <div className="display" style={{ fontSize: 22 }}>5,000 WOLF = 1 $BATTLE</div>
              <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 4 }}>Processing within 24 hours weekdays</div>
            </div>
          </div>

          {/* Hold-to-earn */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">Hold-to-earn</div><h2>Hold $BATTLE, boost mining</h2></div>
              {holdTier && <span className="pill" style={{ background: holdTier.color, fontSize: 11 }}>{holdTier.icon} {holdTier.label} active</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 18 }}>
              {/* Current hold status */}
              <div className="card ink" style={{ padding: 22 }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--cyan)", letterSpacing: 1.5 }}>YOUR HOLD STREAK</div>
                <div className="display tabular" style={{ fontSize: 64, color: "white", lineHeight: 1, marginTop: 6 }}>{holdDays}</div>
                <div className="mono" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>days without selling</div>

                {holdTier && (
                  <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 10, border: `1.5px solid ${holdTier.color}` }}>
                    <div className="mono" style={{ fontSize: 10, color: holdTier.color }}>ACTIVE BONUS</div>
                    <div className="display tabular" style={{ fontSize: 28, color: "white" }}>+{holdTier.bonus}%</div>
                    <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>mining rate boost</div>
                  </div>
                )}

                {nextHoldTier && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>NEXT: {nextHoldTier.label.toUpperCase()}</span>
                      <span className="mono" style={{ fontSize: 10, color: "white" }}>{holdDays}/{nextHoldTier.days}d</span>
                    </div>
                    <div className="bar"><div className="bar-fill" style={{ width: `${Math.min(100, (holdDays / nextHoldTier.days) * 100)}%`, background: nextHoldTier.color }} /></div>
                    <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{nextHoldTier.days - holdDays} days to +{nextHoldTier.bonus}% boost</div>
                  </div>
                )}
              </div>

              {/* 7-day tier */}
              <div className="card" style={{ padding: 22, background: holdDays >= 7 ? "var(--cyan)" : "var(--paper)" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🔒</div>
                <div className="display" style={{ fontSize: 20 }}>7-Day Hold</div>
                <div className="display tabular" style={{ fontSize: 36, color: "var(--lime)", marginTop: 6 }}>+25%</div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>mining rate bonus</div>
                <div style={{ marginTop: 14, fontSize: 12, color: "var(--mute)" }}>Don't sell $BATTLE for 7 consecutive days</div>
                {holdDays >= 7 && <div className="pill" style={{ background: "var(--lime)", fontSize: 10, marginTop: 10 }}>✓ ACTIVE</div>}
                {holdDays < 7 && <div className="mono" style={{ fontSize: 12, color: "var(--mute)", marginTop: 10 }}>{holdDays}/7 days</div>}
              </div>

              {/* 30-day tier */}
              <div className="card" style={{ padding: 22, background: holdDays >= 30 ? "var(--magenta)" : "var(--paper)" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>💎</div>
                <div className="display" style={{ fontSize: 20 }}>30-Day Hold</div>
                <div className="display tabular" style={{ fontSize: 36, color: holdDays >= 30 ? "white" : "var(--magenta)", marginTop: 6 }}>+50%</div>
                <div style={{ fontSize: 13, color: holdDays >= 30 ? "rgba(255,255,255,0.8)" : "var(--ink-soft)", marginTop: 4 }}>mining rate bonus</div>
                <div style={{ marginTop: 14, fontSize: 12, color: holdDays >= 30 ? "rgba(255,255,255,0.6)" : "var(--mute)" }}>Don't sell $BATTLE for 30 consecutive days</div>
                {holdDays >= 30 && <div className="pill" style={{ background: "var(--lime)", fontSize: 10, marginTop: 10 }}>✓ ACTIVE</div>}
                {holdDays < 30 && <div className="mono" style={{ fontSize: 12, color: "var(--mute)", marginTop: 10 }}>{holdDays}/30 days</div>}
              </div>
            </div>

            <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 10 }}>
              ⚠ Converting WOLF to $BATTLE does not break your hold streak. Selling $BATTLE from your Solana wallet resets it to 0.
            </div>
          </div>

          {/* Conversion form */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div className="card" style={{ padding: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Convert WOLF → $BATTLE</div>

              <div style={{ marginBottom: 16 }}>
                <label className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>WOLF AMOUNT</label>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <input type="number" value={wolfAmount} onChange={(e) => { setWolfAmount(e.target.value); setStatus("idle"); }} min={1} max={user!.wolf} placeholder="Enter amount…" className="input" style={{ flex: 1 }} />
                  <button className="btn sm primary" onClick={() => setWolfAmount(String(user!.wolf))}>MAX</button>
                </div>
              </div>

              <div className="card cream" style={{ padding: "12px 16px", textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "var(--mute)" }}>You will receive</div>
                <div className="display tabular" style={{ fontSize: 32, color: canConvert ? "var(--lime)" : "var(--mute)" }}>
                  {battleOut > 0 ? battleOut.toFixed(4) : "0"} $BATTLE
                </div>
                {wolf > user!.wolf && <div style={{ fontSize: 12, color: "var(--tomato)", marginTop: 4 }}>Insufficient balance</div>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>SOLANA WALLET ADDRESS</label>
                <input type="text" value={walletInput} onChange={(e) => setWalletInput(e.target.value)} placeholder="Your Solana wallet…" className="input" style={{ marginTop: 6 }} />
              </div>

              {status !== "idle" && (
                <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 14, background: status === "success" ? "rgba(182,242,63,0.1)" : "rgba(255,90,74,0.1)", border: `2px solid ${status === "success" ? "var(--lime)" : "var(--tomato)"}` }}>
                  <div style={{ fontSize: 13, color: status === "success" ? "var(--lime)" : "var(--tomato)" }}>{msg}</div>
                </div>
              )}

              <button className={`btn lg ${canConvert ? "primary" : "ghost"}`} style={{ width: "100%", justifyContent: "center" }} onClick={handleConvert} disabled={!canConvert}>
                {canConvert ? `Convert ${wolf.toLocaleString()} WOLF → ${battleOut.toFixed(4)} $BATTLE` : "Enter WOLF amount"}
              </button>
            </div>

            {/* Info card */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="card" style={{ padding: 18 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>How it works</div>
                {[
                  ["1.", "Enter WOLF amount and your Solana wallet"],
                  ["2.", "Submit request — processed within 24h weekdays"],
                  ["3.", "$BATTLE arrives directly in your Solana wallet"],
                  ["4.", "Hold $BATTLE to activate mining rate boosts"],
                ].map(([n, t]) => (
                  <div key={n} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px dashed rgba(11,11,26,0.08)" }}>
                    <span className="display" style={{ fontSize: 14, color: "var(--magenta)", flexShrink: 0 }}>{n}</span>
                    <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{t}</span>
                  </div>
                ))}
              </div>
              <div className="card cyan" style={{ padding: 18 }}>
                <div className="display" style={{ fontSize: 20 }}>5,000 WOLF = 1 $BATTLE</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>Partial amounts accepted. Rate is fixed.</div>
                <div style={{ marginTop: 14 }}>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-soft)" }}>CONTRACT ADDRESS</div>
                  <div className="mono" style={{ fontSize: 11, marginTop: 4, wordBreak: "break-all" }}>HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
