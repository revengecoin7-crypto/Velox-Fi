import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Zap, Shield, TrendingUp, Clock, AlertTriangle, Copy, Check } from "lucide-react";

const PRESALE_LAUNCH = new Date("2026-06-01T00:00:00Z").getTime();
const TOTAL_SUPPLY = 1_000_000_000;
const SOL_GOAL = 500;
const SOL_RAISED = 0;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function useCountdown(target: number) {
  const [diff, setDiff] = useState(() => Math.max(0, target - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setDiff(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(t);
  }, [target]);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs, over: diff === 0 };
}

export default function Presale() {
  const [, navigate] = useLocation();
  const countdown = useCountdown(PRESALE_LAUNCH);
  const [copied, setCopied] = useState(false);

  const progressPct = Math.min((SOL_RAISED / SOL_GOAL) * 100, 100);

  function handleCopy() {
    navigator.clipboard.writeText("$BATTLE presale — VeloxFi").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ backgroundColor: "#05080f", minHeight: "100vh", color: "white" }}>
      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(37,99,235,0.015) 2px,rgba(37,99,235,0.015) 4px)",
        }}
      />

      {/* Glow blobs */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "400px",
          background:
            "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)",
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
              style={{
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              }}
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
            <span
              className="text-xs font-orbitron tracking-widest px-3 py-1 rounded-full hidden sm:inline-flex items-center gap-1.5"
              style={{
                background: "rgba(37,99,235,0.12)",
                border: "1px solid rgba(37,99,235,0.3)",
                color: "#60a5fa",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#60a5fa" }}
              />
              COMING SOON
            </span>
            <button
              onClick={() => navigate("/")}
              className="btn-outline px-4 py-2 rounded-lg text-xs font-orbitron tracking-wider"
            >
              ← HOME
            </button>
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
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
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))",
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
              { val: pad(countdown.days), label: "DAYS" },
              { val: pad(countdown.hours), label: "HOURS" },
              { val: pad(countdown.mins), label: "MINS" },
              { val: pad(countdown.secs), label: "SECS" },
            ].map(({ val, label }, i) => (
              <div key={label} className="flex items-center gap-3 md:gap-6">
                {i > 0 && (
                  <span
                    className="font-orbitron font-black text-3xl"
                    style={{ color: "rgba(124,58,237,0.4)" }}
                  >
                    :
                  </span>
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
                  <div className="text-gray-700 text-xs font-orbitron tracking-widest mt-1.5">
                    {label}
                  </div>
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
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-orbitron text-xs tracking-widest text-gray-500">
              PRESALE PROGRESS
            </span>
            <span
              className="font-orbitron text-xs tracking-widest"
              style={{ color: "#60a5fa" }}
            >
              {SOL_RAISED} / {SOL_GOAL} SOL
            </span>
          </div>

          {/* Bar track */}
          <div
            className="h-3 rounded-full overflow-hidden mb-3"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
              style={{
                width: progressPct > 0 ? `${progressPct}%` : "2px",
                background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                minWidth: "2px",
              }}
            >
              {/* Shimmer */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                  animation: "shimmer 2s infinite",
                }}
              />
            </div>
          </div>

          <div className="flex justify-between text-xs">
            <span className="font-orbitron text-gray-700 tracking-widest">
              {progressPct.toFixed(1)}% FILLED
            </span>
            <span className="font-orbitron text-gray-700 tracking-widest">
              GOAL: {SOL_GOAL} SOL
            </span>
          </div>
        </div>

        {/* Token info */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h2 className="font-orbitron font-bold text-sm tracking-widest text-white mb-5">
            TOKEN INFO
          </h2>

          <div className="space-y-3">
            {[
              { label: "Token", value: "$BATTLE", highlight: true },
              {
                label: "Total Supply",
                value: TOTAL_SUPPLY.toLocaleString(),
                highlight: false,
              },
              { label: "Presale Price", value: "TBA", highlight: false },
              {
                label: "Listing Price",
                value: "Higher than presale",
                highlight: false,
              },
              { label: "Network", value: "Solana", highlight: false },
            ].map(({ label, value, highlight }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <span className="text-gray-500 text-sm font-orbitron tracking-wider text-xs">
                  {label}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: highlight ? "#a78bfa" : "#e2e8f0",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation breakdown */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h2 className="font-orbitron font-bold text-sm tracking-widest text-white mb-5">
            TOKEN ALLOCATION
          </h2>

          <div className="space-y-3">
            {[
              { label: "Public market", pct: 60, color: "#2563eb" },
              { label: "Platform reserves", pct: 20, color: "#7c3aed" },
              { label: "Community & marketing", pct: 10, color: "#0ea5e9" },
              { label: "Developer (locked 1 year)", pct: 10, color: "#6366f1" },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-orbitron text-gray-500 tracking-widest">
                    {label}
                  </span>
                  <span style={{ color, fontFamily: "Inter, sans-serif", fontWeight: 700 }}>
                    {pct}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why get in early */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h2 className="font-orbitron font-bold text-sm tracking-widest text-white mb-5">
            WHY GET IN EARLY
          </h2>

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
                  <div className="text-white text-sm font-medium mb-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                    {title}
                  </div>
                  <div className="text-gray-500 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mb-5 space-y-3">
          <button
            className="w-full py-4 rounded-xl font-orbitron font-black tracking-wider text-sm relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              border: "none",
              cursor: "not-allowed",
              opacity: 0.7,
            }}
          >
            CONNECT WALLET TO BUY
            <span
              className="absolute top-1.5 right-3 text-xs font-orbitron tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.3)", fontSize: "9px" }}
            >
              COMING SOON
            </span>
          </button>

          {/* Fee notice */}
          <p
            className="text-center text-xs font-orbitron tracking-widest"
            style={{ color: "#6b7280" }}
          >
            ⚠ 5% fee applies to all presale purchases
          </p>

          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: copied ? "#34d399" : "#9ca3af",
              cursor: "pointer",
            }}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="font-orbitron tracking-widest text-xs">
              {copied ? "LINK COPIED!" : "SHARE PRESALE LINK"}
            </span>
          </button>
        </div>

        {/* Socials strip */}
        <div
          className="rounded-xl p-4 mb-5 flex items-center justify-center gap-6 flex-wrap"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span className="text-gray-600 text-xs font-orbitron tracking-widest">
            FOLLOW FOR UPDATES
          </span>
          {[
            {
              label: "𝕏  @VeloxFi",
              href: "https://twitter.com/VeloxFi",
              color: "#60a5fa",
            },
            { label: "Discord", href: "#", color: "#a78bfa" },
            { label: "Telegram", href: "#", color: "#34d399" },
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
          style={{
            background: "rgba(251,191,36,0.04)",
            border: "1px solid rgba(251,191,36,0.12)",
          }}
        >
          <AlertTriangle
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: "#fbbf24" }}
          />
          <p
            className="text-xs leading-relaxed"
            style={{ color: "#9ca3af", fontFamily: "Inter, sans-serif" }}
          >
            <span style={{ color: "#fbbf24", fontWeight: 600 }}>
              Not financial advice.
            </span>{" "}
            Cryptocurrency investments involve significant risk. Participate at
            your own risk. VeloxFi and its contributors are not responsible for
            any financial losses. Always do your own research before investing.
          </p>
        </div>
      </div>
    </div>
  );
}
