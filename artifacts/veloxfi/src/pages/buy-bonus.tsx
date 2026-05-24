import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";

interface BuyBonusClaim {
  id:           number;
  username:     string;
  txSignature:  string;
  solAmount:    number;
  battleAmount: number;
  claimedAt:    string;
}

interface BuyBonusStatus {
  tier:               number;
  totalSol:           number;
  battleHeldExpected: number;
  currentBalance:     number | null;
  lastSellCheckAt:    string | null;
  claims:             BuyBonusClaim[];
}

const TIERS = [
  { sol: 0.01, mult: 10,   color: "var(--cyan)",    label: "10×" },
  { sol: 0.1,  mult: 100,  color: "var(--magenta)", label: "100×" },
  { sol: 1,    mult: 1000, color: "var(--yellow)",  label: "1000×" },
];

function shortSig(sig: string): string {
  if (sig.length < 16) return sig;
  return `${sig.slice(0, 8)}…${sig.slice(-6)}`;
}

export default function BuyBonusPage() {
  const { user, token } = useAuth();
  const [status, setStatus] = useState<BuyBonusStatus | null>(null);
  const [txInput, setTxInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch("/api/veloxfi/buy-bonus/status", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setStatus(await r.json());
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !txInput.trim()) return;
    setSubmitting(true);
    setMsg(null);
    try {
      const r = await fetch("/api/veloxfi/buy-bonus/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ txSignature: txInput.trim() }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        const upgraded = (data.newTier ?? 1) > (data.previousTier ?? 1);
        setMsg({
          kind: "success",
          text: upgraded
            ? `🎉 Claim verified! You spent ${Number(data.solSpent).toFixed(4)} SOL — multiplier upgraded to ${data.newTier}×.`
            : `✓ Claim verified. ${Number(data.solSpent).toFixed(4)} SOL added — still on ${data.newTier}× tier.`,
        });
        setTxInput("");
        refresh();
      } else {
        setMsg({ kind: "error", text: data?.error ?? "Failed to verify transaction." });
      }
    } catch {
      setMsg({ kind: "error", text: "Network error — try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (!user || !token) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main style={{ minWidth: 0 }}>
          <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div className="card" style={{ padding: 30, textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>🚀</div>
              <h2 className="display" style={{ fontSize: 26 }}>Sign in to access Buy Bonus</h2>
              <Link href="/login" className="btn lg primary" style={{ marginTop: 14 }}>Sign in / Register</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const tier = status?.tier ?? 1;
  const totalSol = status?.totalSol ?? 0;
  const nextTier = TIERS.find(t => t.mult > tier);
  const currentTier = TIERS.find(t => t.mult === tier);
  const progress = nextTier ? Math.min(100, (totalSol / nextTier.sol) * 100) : 100;

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Buy Bonus</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Multiply your earnings.</div>
          </div>

          {/* Hero — current tier */}
          <div className="card ink" style={{ padding: 32, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
            <div style={{ position: "relative" }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--cyan)", letterSpacing: 1.5 }}>YOUR MULTIPLIER</div>
              <div className="display tabular" style={{ fontSize: 84, color: currentTier?.color ?? "white", lineHeight: 1, marginTop: 4 }}>
                {tier}×
              </div>
              <div className="mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
                Cumulative SOL spent: <b style={{ color: "white" }}>{totalSol.toFixed(4)} SOL</b>
              </div>

              {nextTier && (
                <div style={{ marginTop: 22, maxWidth: 520 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>NEXT: {nextTier.mult}× at {nextTier.sol} SOL</span>
                    <span className="mono" style={{ fontSize: 10, color: "white" }}>{totalSol.toFixed(4)} / {nextTier.sol}</span>
                  </div>
                  <div className="bar thick" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="bar-fill" style={{ width: `${progress}%`, background: nextTier.color }} />
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                    Buy {(nextTier.sol - totalSol).toFixed(4)} more SOL of $BATTLE to upgrade to {nextTier.mult}×
                  </div>
                </div>
              )}

              {!nextTier && tier === 1000 && (
                <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,200,40,0.12)", border: "2px solid var(--yellow)", borderRadius: 10, maxWidth: 520 }}>
                  <div className="display" style={{ fontSize: 16, color: "var(--yellow)" }}>👑 Max tier — 1000× active on every WOLF you earn</div>
                </div>
              )}
            </div>
          </div>

          {/* Sell-detection warning */}
          {status && status.battleHeldExpected > 0 && status.currentBalance !== null && status.currentBalance < status.battleHeldExpected * 0.95 && (
            <div className="card" style={{ padding: 16, background: "rgba(255,90,74,0.1)", border: "2px solid var(--tomato)" }}>
              <div className="row" style={{ gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 24 }}>⚠</div>
                <div style={{ flex: 1 }}>
                  <div className="display" style={{ fontSize: 14, color: "var(--tomato)" }}>Wallet balance dropped below your buy-bonus snapshot</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
                    Expected ~{status.battleHeldExpected.toFixed(2)} $BATTLE, current {status.currentBalance.toFixed(2)}. Your multiplier will be reset to 1× on the next background check.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tier ladder */}
          <div>
            <div className="section-title">
              <div><div className="eyebrow">Tiers</div><h2>How the multiplier scales</h2></div>
            </div>
            <div className="grid-3">
              {TIERS.map(t => {
                const active = tier >= t.mult;
                return (
                  <div key={t.mult} className="card" style={{ padding: 22, background: active ? t.color : "var(--paper)", opacity: active ? 1 : 0.85 }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{t.mult === 10 ? "⚡" : t.mult === 100 ? "🔥" : "👑"}</div>
                    <div className="display tabular" style={{ fontSize: 40, lineHeight: 1, color: active ? "var(--ink)" : t.color }}>{t.label}</div>
                    <div style={{ fontSize: 13, marginTop: 6, color: active ? "var(--ink)" : "var(--ink-soft)" }}>Buy {t.sol} SOL of $BATTLE (cumulative)</div>
                    {active && <div className="pill" style={{ background: "var(--lime)", fontSize: 10, marginTop: 10 }}>✓ ACTIVE</div>}
                  </div>
                );
              })}
            </div>
            <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 10 }}>
              Multiplier applies to everything: mining sessions, daily spin, chests, milestones, bounty rewards. Permanent — until you sell.
            </div>
          </div>

          {/* Submit a buy */}
          <div className="card" style={{ padding: 24, borderColor: "var(--magenta)" }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Claim a buy-bonus</div>

            <div style={{ background: "var(--cream)", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>
              <b>Steps:</b><br/>
              1. Buy $BATTLE on{" "}
              <a href="https://pump.fun/coin/HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump" target="_blank" rel="noreferrer" style={{ color: "var(--magenta)", fontWeight: 700 }}>
                pump.fun
              </a> using <b>your registered wallet</b> ({user.wallet ? `${user.wallet.slice(0,4)}…${user.wallet.slice(-4)}` : "set wallet first"})<br/>
              2. After the swap completes, copy the transaction signature from{" "}
              <a href="https://solscan.io/" target="_blank" rel="noreferrer" style={{ color: "var(--magenta)", fontWeight: 700 }}>Solscan</a>
              {" "}or your wallet history<br/>
              3. Paste it below and click Verify
            </div>

            <form onSubmit={handleSubmit}>
              <label className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>TRANSACTION SIGNATURE</label>
              <input
                type="text"
                value={txInput}
                onChange={(e) => { setTxInput(e.target.value); setMsg(null); }}
                placeholder="5tWyN8xJ…  (88-character Solana tx signature)"
                className="input mono"
                style={{ marginTop: 6, fontSize: 12 }}
                disabled={submitting}
              />

              {msg && (
                <div style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `2px solid ${msg.kind === "success" ? "var(--lime)" : "var(--tomato)"}`,
                  background: msg.kind === "success" ? "rgba(182,242,63,0.1)" : "rgba(255,90,74,0.1)",
                  fontSize: 13,
                  color: msg.kind === "success" ? "var(--lime)" : "var(--tomato)",
                }}>{msg.text}</div>
              )}

              <button
                type="submit"
                className={`btn lg ${txInput.trim() && !submitting ? "primary" : "ghost"}`}
                style={{ width: "100%", justifyContent: "center", marginTop: 14 }}
                disabled={submitting || !txInput.trim() || !user.wallet}
              >
                {submitting ? "Verifying on-chain…" : !user.wallet ? "Save your wallet on the Wallet page first" : "Verify & claim bonus"}
              </button>
            </form>
          </div>

          {/* Claim history */}
          {status && status.claims.length > 0 && (
            <div>
              <div className="section-title">
                <div><div className="eyebrow">History</div><h2>Your buy-bonus claims</h2></div>
                <div className="grow" />
                <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>{status.claims.length} claim{status.claims.length === 1 ? "" : "s"}</span>
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div className="row" style={{ padding: "12px 22px", borderBottom: "2.5px solid var(--ink)", background: "var(--cream)", fontSize: 11, color: "var(--mute)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, gap: 0 }}>
                  <div style={{ flex: 1 }}>Claimed</div>
                  <div style={{ flex: 1.6 }}>Transaction</div>
                  <div style={{ width: 110, textAlign: "right" }}>SOL spent</div>
                  <div style={{ width: 130, textAlign: "right" }}>$BATTLE received</div>
                </div>
                {status.claims.map((c, i) => (
                  <div key={c.id} className="row" style={{ padding: "10px 22px", borderBottom: i < status.claims.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", gap: 0 }}>
                    <div style={{ flex: 1, fontSize: 12 }}>{new Date(c.claimedAt).toLocaleDateString()}</div>
                    <div style={{ flex: 1.6 }} className="mono">
                      <a href={`https://solscan.io/tx/${c.txSignature}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "var(--magenta)" }}>{shortSig(c.txSignature)}</a>
                    </div>
                    <div style={{ width: 110, textAlign: "right" }} className="display tabular">{c.solAmount.toFixed(4)}</div>
                    <div style={{ width: 130, textAlign: "right" }} className="display tabular">{c.battleAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
