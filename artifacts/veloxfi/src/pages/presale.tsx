import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Zap, Shield, TrendingUp, Clock, AlertTriangle,
  Copy, Check, CheckCircle, Loader2, ExternalLink,
} from "lucide-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import { useWallet } from "@/context/WalletContext";
import { usePageMeta } from "@/hooks/usePageMeta";

/* ── Constants ── */
const PRESALE_LAUNCH    = new Date("2026-06-01T00:00:00Z").getTime();
const TOTAL_SUPPLY      = 1_000_000_000;
const SOL_GOAL          = 500;
const MIN_SOL           = 0.1;
const MAX_SOL           = 10;
const TOKENS_PER_SOL    = 100_000;
const RECEIVING_WALLET  = "9LQw7JXNZb97qtYcbXkcV3xUjc3ewmZdmBejQd2HiwNU";
const HELIUS_API_KEY    = import.meta.env.VITE_HELIUS_API_KEY as string;
const RPC_ENDPOINT      = HELIUS_API_KEY
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : (import.meta.env.VITE_HELIUS_RPC_URL as string) || "https://api.mainnet-beta.solana.com";
const API_BASE          = "/api";

/* ── Types ── */
interface PresaleStats {
  totalSol: number;
  totalPurchases: number;
  solGoal: number;
  progressPct: number;
}

type BuyPhase = "idle" | "sending" | "saving" | "success" | "error";

/* ── Helpers ── */
function pad(n: number) { return String(n).padStart(2, "0"); }

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function useCountdown(target: number) {
  const [diff, setDiff] = useState(() => Math.max(0, target - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setDiff(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(t);
  }, [target]);
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs, over: diff === 0 };
}

/* ── Main component ── */
export default function Presale() {
  usePageMeta({
    title: "Presale — Buy $BATTLE Token | VeloxFi",
    description:
      "Join the $BATTLE token presale at the lowest price. $BATTLE powers the VeloxFi memecoin battle arena on Solana. 1 billion total supply launching on pump.fun.",
    canonical: "https://veloxfi.io/#/presale",
  });

  const [, navigate]    = useLocation();
  const { status, address, shortAddress } = useWallet();
  const countdown       = useCountdown(PRESALE_LAUNCH);

  /* progress */
  const [stats, setStats]         = useState<PresaleStats | null>(null);
  const [walletUsed, setWalletUsed] = useState(0);

  /* buy form */
  const [solInput, setSolInput]   = useState("");
  const [buyPhase, setBuyPhase]   = useState<BuyPhase>("idle");
  const [buyError, setBuyError]   = useState("");
  const [txSig, setTxSig]         = useState("");
  const [copied, setCopied]       = useState(false);

  /* derived */
  const solValue  = parseFloat(solInput) || 0;
  const tokens    = Math.floor(solValue * TOKENS_PER_SOL);
  const remaining = Math.max(0, MAX_SOL - walletUsed);

  /* Fetch stats */
  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/presale/stats`);
      if (r.ok) setStats(await r.json());
    } catch { /* silent */ }
  }, []);

  /* Fetch wallet totals */
  const fetchWalletUsed = useCallback(async (addr: string) => {
    try {
      const r = await fetch(`${API_BASE}/presale/wallet-total/${addr}`);
      if (r.ok) {
        const d = await r.json();
        setWalletUsed(d.totalSol ?? 0);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => {
    if (address) fetchWalletUsed(address);
    else setWalletUsed(0);
  }, [address, fetchWalletUsed]);

  /* Input validation message */
  function inputError(): string | null {
    if (!solInput) return null;
    if (solValue < MIN_SOL) return `Minimum purchase is ${MIN_SOL} SOL`;
    if (solValue > remaining) return `Your wallet limit allows ${remaining.toFixed(4)} more SOL`;
    if (solValue > MAX_SOL) return `Maximum is ${MAX_SOL} SOL per wallet`;
    return null;
  }

  /* ── BUY handler ── */
  async function handleBuy() {
    if (!address) return;
    const err = inputError();
    if (err) { setBuyError(err); return; }
    if (solValue <= 0) { setBuyError("Enter a SOL amount"); return; }

    setBuyPhase("sending");
    setBuyError("");
    setTxSig("");

    try {
      const provider = window.phantom?.solana ?? window.solana;
      if (!provider) throw new Error("Phantom wallet not found");

      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const fromPubkey = new PublicKey(address);
      const toPubkey   = new PublicKey(RECEIVING_WALLET);
      const lamports   = Math.round(solValue * LAMPORTS_PER_SOL);

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");

      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: fromPubkey,
      }).add(
        SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
      );

      /* Sign + send via Phantom */
      const { signature } = await provider.signAndSendTransaction(tx);

      /* Wait for confirmation */
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      /* Save to database */
      setBuyPhase("saving");
      const res = await fetch(`${API_BASE}/presale/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          solAmount: solValue,
          txSignature: signature,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed to record purchase");
      }

      setTxSig(signature);
      setBuyPhase("success");
      setSolInput("");
      await fetchStats();
      await fetchWalletUsed(address);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      /* User rejected in Phantom */
      if (msg.includes("User rejected") || msg.includes("4001")) {
        setBuyError("Transaction cancelled.");
      } else {
        setBuyError(msg || "Transaction failed. Please try again.");
      }
      setBuyPhase("error");
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const progressPct = stats ? stats.progressPct : 0;
  const solRaised   = stats ? stats.totalSol : 0;

  return (
    <div style={{ backgroundColor: "#05080f", minHeight: "100vh", color: "white" }}>
      {/* Scanline */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(37,99,235,0.015) 2px,rgba(37,99,235,0.015) 4px)",
        }}
      />
      {/* Glow */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: "-10%", left: "50%", transform: "translateX(-50%)",
          width: "700px", height: "400px",
          background: "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg"
        style={{
          backgroundColor: "rgba(5,8,15,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            >
              <span className="text-white font-black text-sm" style={{ fontFamily: "sans-serif" }}>⚔</span>
            </div>
            <span
              className="font-orbitron font-black text-lg tracking-wider"
              style={{
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              VELOXFI
            </span>
            <span className="text-lg">🐺</span>
          </button>
          <div className="flex items-center gap-3">
            <ConnectWalletButton />
            <button
              onClick={() => navigate("/")}
              className="btn-outline px-4 py-2 rounded-lg text-xs font-orbitron tracking-wider"
            >
              ← HOME
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-28 pb-24">

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-orbitron tracking-widest"
            style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "#a78bfa",
            }}
          >
            <Zap className="w-3 h-3" />
            EARLY ACCESS
          </div>
          <h1 className="font-orbitron font-black text-4xl md:text-5xl text-white mb-4 leading-tight">
            $BATTLE TOKEN{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              PRESALE
            </span>
          </h1>
          <p className="text-gray-400 text-base max-w-sm mx-auto">
            Get in early — lowest price before pump.fun launch
          </p>
        </div>

        {/* Countdown */}
        <div
          className="rounded-2xl p-6 mb-5 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))",
            border: "1px solid rgba(124,58,237,0.18)",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="font-orbitron text-xs tracking-widest text-gray-500">
              PRESALE OPENS IN
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 md:gap-6">
            {[
              { val: pad(countdown.days),  label: "DAYS"  },
              { val: pad(countdown.hours), label: "HOURS" },
              { val: pad(countdown.mins),  label: "MINS"  },
              { val: pad(countdown.secs),  label: "SECS"  },
            ].map(({ val, label }, i) => (
              <div key={label} className="flex items-center gap-3 md:gap-6">
                {i > 0 && (
                  <span className="font-orbitron font-black text-3xl" style={{ color: "rgba(124,58,237,0.4)" }}>:</span>
                )}
                <div className="text-center">
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center font-black text-2xl md:text-3xl tabular-nums"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      fontFamily: "Inter, sans-serif",
                      color: "#e2e8f0",
                    }}
                  >
                    {val}
                  </div>
                  <div className="text-gray-700 text-xs font-orbitron tracking-widest mt-1.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-700 text-xs font-orbitron tracking-widest mt-4">
            JUN 1, 2026 · 00:00 UTC
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-orbitron text-xs tracking-widest text-gray-500">PRESALE PROGRESS</span>
            <span className="font-orbitron text-xs tracking-widest" style={{ color: "#60a5fa" }}>
              {solRaised.toFixed(4)} / {SOL_GOAL} SOL
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
              style={{
                width: progressPct > 0 ? `${progressPct}%` : "2px",
                background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                minWidth: "2px",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                  animation: "shimmer 2s infinite",
                }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-orbitron text-gray-700 tracking-widest">{progressPct.toFixed(2)}% FILLED</span>
            <span className="font-orbitron text-gray-700 tracking-widest">GOAL: {SOL_GOAL} SOL</span>
          </div>
        </div>

        {/* ── PURCHASE BOX ── */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{
            background: "rgba(37,99,235,0.05)",
            border: "1px solid rgba(37,99,235,0.25)",
          }}
        >
          <h2 className="font-orbitron font-bold text-sm tracking-widest text-white mb-5">
            BUY $BATTLE TOKENS
          </h2>

          {/* Success state */}
          {buyPhase === "success" ? (
            <div className="text-center py-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.4)" }}
              >
                <CheckCircle className="w-8 h-8" style={{ color: "#34d399" }} />
              </div>
              <h3 className="font-orbitron font-black text-xl text-white mb-2">PURCHASE CONFIRMED!</h3>
              <p className="text-gray-400 text-sm mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
                Your $BATTLE tokens have been reserved. They will be delivered after the pump.fun launch.
              </p>
              {txSig && (
                <a
                  href={`https://solscan.io/tx/${txSig}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-orbitron tracking-widest transition-opacity hover:opacity-80"
                  style={{ color: "#60a5fa" }}
                >
                  VIEW ON SOLSCAN <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                onClick={() => setBuyPhase("idle")}
                className="mt-5 w-full py-3 rounded-xl font-orbitron text-xs tracking-widest transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#9ca3af",
                  cursor: "pointer",
                }}
              >
                BUY MORE
              </button>
            </div>
          ) : status !== "connected" ? (
            /* Not connected */
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
                Connect your Phantom wallet to participate in the presale.
              </p>
              <ConnectWalletButton className="w-full justify-center py-4" />
            </div>
          ) : (
            /* Buy form */
            <div>
              {/* Rate info row */}
              <div className="flex items-center justify-between mb-4 text-xs font-orbitron tracking-widest">
                <span className="text-gray-500">RATE</span>
                <span style={{ color: "#a78bfa" }}>1 SOL = {fmt(TOKENS_PER_SOL)} $BATTLE</span>
              </div>

              {/* Limits row */}
              <div className="flex items-center justify-between mb-5 text-xs font-orbitron tracking-widest">
                <span className="text-gray-500">LIMITS</span>
                <span style={{ color: "#6b7280" }}>
                  Min {MIN_SOL} SOL · Max {MAX_SOL} SOL / wallet
                </span>
              </div>

              {/* Wallet remaining */}
              {walletUsed > 0 && (
                <div
                  className="flex items-center justify-between mb-4 px-3 py-2 rounded-lg text-xs font-orbitron tracking-widest"
                  style={{
                    background: "rgba(124,58,237,0.08)",
                    border: "1px solid rgba(124,58,237,0.2)",
                  }}
                >
                  <span style={{ color: "#9ca3af" }}>YOUR WALLET USED</span>
                  <span style={{ color: "#a78bfa" }}>
                    {walletUsed.toFixed(4)} SOL · {remaining.toFixed(4)} remaining
                  </span>
                </div>
              )}

              {/* SOL input */}
              <div className="mb-4">
                <label className="block text-xs font-orbitron tracking-widest text-gray-500 mb-2">
                  YOU PAY (SOL)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={MIN_SOL}
                    max={remaining}
                    step="0.01"
                    value={solInput}
                    onChange={(e) => { setSolInput(e.target.value); setBuyError(""); setBuyPhase("idle"); }}
                    placeholder="0.10"
                    className="w-full px-4 py-4 rounded-xl text-white text-lg font-bold outline-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${inputError() ? "rgba(239,68,68,0.5)" : "rgba(37,99,235,0.3)"}`,
                      fontFamily: "Inter, sans-serif",
                      appearance: "none",
                    }}
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-orbitron tracking-wider"
                    style={{ color: "#60a5fa" }}
                  >
                    SOL
                  </span>
                </div>
                {inputError() && (
                  <p className="mt-1.5 text-xs" style={{ color: "#f87171", fontFamily: "Inter, sans-serif" }}>
                    {inputError()}
                  </p>
                )}
              </div>

              {/* YOU RECEIVE */}
              <div
                className="flex items-center justify-between px-4 py-4 rounded-xl mb-5"
                style={{
                  background: "rgba(124,58,237,0.07)",
                  border: "1px solid rgba(124,58,237,0.2)",
                }}
              >
                <div>
                  <div className="text-xs font-orbitron tracking-widest text-gray-500 mb-1">YOU RECEIVE</div>
                  <div
                    className="text-2xl font-black"
                    style={{
                      color: tokens > 0 ? "#a78bfa" : "#374151",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {tokens > 0 ? fmt(tokens) : "0"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-orbitron tracking-widest text-gray-600 mb-1">TOKEN</div>
                  <div className="font-orbitron font-black text-lg text-white">$BATTLE</div>
                </div>
              </div>

              {/* Quick fill buttons */}
              <div className="flex gap-2 mb-5">
                {[0.1, 0.5, 1, Math.min(5, remaining), Math.min(remaining, MAX_SOL)].filter((v, i, arr) => v > 0 && arr.indexOf(v) === i).map((v) => (
                  <button
                    key={v}
                    onClick={() => { setSolInput(String(v)); setBuyError(""); }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-orbitron tracking-widest transition-all duration-150 hover:opacity-80"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "#6b7280",
                      cursor: "pointer",
                    }}
                  >
                    {v} SOL
                  </button>
                ))}
              </div>

              {/* Error */}
              {buyPhase === "error" && buyError && (
                <div
                  className="flex items-start gap-2 px-4 py-3 rounded-lg mb-4 text-sm"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#f87171",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {buyError}
                </div>
              )}

              {/* BUY button */}
              <button
                onClick={handleBuy}
                disabled={buyPhase === "sending" || buyPhase === "saving" || !!inputError() || solValue <= 0 || remaining <= 0}
                className="w-full py-4 rounded-xl font-orbitron font-black tracking-wider text-sm flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background:
                    remaining <= 0
                      ? "rgba(255,255,255,0.05)"
                      : "linear-gradient(135deg, #2563eb, #7c3aed)",
                  border: "none",
                  color: remaining <= 0 ? "#4b5563" : "white",
                  cursor:
                    buyPhase === "sending" || buyPhase === "saving" || !!inputError() || solValue <= 0 || remaining <= 0
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    buyPhase === "sending" || buyPhase === "saving" || !!inputError() || solValue <= 0
                      ? 0.75
                      : 1,
                }}
              >
                {buyPhase === "sending" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> SENDING TRANSACTION...</>
                ) : buyPhase === "saving" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> CONFIRMING...</>
                ) : remaining <= 0 ? (
                  "WALLET LIMIT REACHED"
                ) : (
                  <>⚔ BUY $BATTLE NOW</>
                )}
              </button>

              <p className="text-center text-xs font-orbitron tracking-widest mt-3" style={{ color: "#374151" }}>
                Tokens delivered after pump.fun launch · {shortAddress}
              </p>
            </div>
          )}
        </div>

        {/* Token info */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h2 className="font-orbitron font-bold text-sm tracking-widest text-white mb-5">TOKEN INFO</h2>
          <div className="space-y-3">
            {[
              { label: "Token",           value: "$BATTLE",                       highlight: true  },
              { label: "Total Supply",    value: TOTAL_SUPPLY.toLocaleString(),   highlight: false },
              { label: "Presale Price",   value: `1 SOL = ${fmt(TOKENS_PER_SOL)} $BATTLE`, highlight: false },
              { label: "Min Purchase",    value: `${MIN_SOL} SOL`,                highlight: false },
              { label: "Max Per Wallet",  value: `${MAX_SOL} SOL`,                highlight: false },
              { label: "Presale Goal",    value: `${SOL_GOAL} SOL`,               highlight: false },
              { label: "Network",         value: "Solana",                        highlight: false },
            ].map(({ label, value, highlight }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <span className="text-gray-500 text-sm font-orbitron tracking-wider text-xs">{label}</span>
                <span
                  className="text-sm font-bold"
                  style={{ fontFamily: "Inter, sans-serif", color: highlight ? "#a78bfa" : "#e2e8f0" }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Token allocation */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h2 className="font-orbitron font-bold text-sm tracking-widest text-white mb-5">TOKEN ALLOCATION</h2>
          <div className="space-y-3">
            {[
              { label: "Public market",               pct: 60, color: "#2563eb" },
              { label: "Platform reserves",           pct: 20, color: "#7c3aed" },
              { label: "Community & marketing",       pct: 10, color: "#0ea5e9" },
              { label: "Developer (locked 1 year)",   pct: 10, color: "#6366f1" },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-orbitron text-gray-500 tracking-widest">{label}</span>
                  <span style={{ color, fontFamily: "Inter, sans-serif", fontWeight: 700 }}>{pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why get in early */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h2 className="font-orbitron font-bold text-sm tracking-widest text-white mb-5">WHY GET IN EARLY</h2>
          <div className="space-y-3">
            {[
              {
                icon: <TrendingUp className="w-4 h-4" style={{ color: "#34d399" }} />,
                title: "Lowest Entry Price",
                desc: "Presale price is the cheapest you'll ever get $BATTLE",
              },
              {
                icon: <Shield className="w-4 h-4" style={{ color: "#60a5fa" }} />,
                title: "OG Warrior Badge",
                desc: "First 100 buyers get an exclusive on-chain OG badge",
              },
              {
                icon: <Zap className="w-4 h-4" style={{ color: "#a78bfa" }} />,
                title: "Battle Arena Priority",
                desc: "Early holders get first access to create battles at launch",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div
                  className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  {icon}
                </div>
                <div>
                  <div className="text-white text-sm font-medium mb-0.5" style={{ fontFamily: "Inter, sans-serif" }}>{title}</div>
                  <div className="text-gray-500 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share + socials */}
        <div className="mb-5 space-y-3">
          <button
            onClick={handleCopyLink}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: copied ? "#34d399" : "#9ca3af",
              cursor: "pointer",
            }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="font-orbitron tracking-widest text-xs">
              {copied ? "LINK COPIED!" : "SHARE PRESALE LINK"}
            </span>
          </button>
        </div>

        {/* Socials */}
        <div
          className="rounded-xl p-4 mb-5 flex items-center justify-center gap-6 flex-wrap"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span className="text-gray-600 text-xs font-orbitron tracking-widest">FOLLOW FOR UPDATES</span>
          {[
            { label: "𝕏  @VeloxFi",  href: "https://x.com/VeloxFi",               color: "#60a5fa" },
            { label: "Discord",       href: "https://discord.gg/u2UhxuTd",          color: "#a78bfa" },
            { label: "Telegram",      href: "https://t.me/VeloxFiOfficial",         color: "#34d399" },
          ].map(({ label, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-orbitron tracking-widest transition-opacity hover:opacity-80"
              style={{ color }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Disclaimer */}
        <div
          className="rounded-xl p-4 flex gap-3"
          style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.12)" }}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
          <p className="text-xs leading-relaxed" style={{ color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>
            <span style={{ color: "#fbbf24", fontWeight: 600 }}>Not financial advice.</span>{" "}
            Cryptocurrency investments involve significant risk. Participate at your own risk.
            VeloxFi and its contributors are not responsible for any financial losses.
            Always do your own research before investing.
          </p>
        </div>
      </div>
    </div>
  );
}
