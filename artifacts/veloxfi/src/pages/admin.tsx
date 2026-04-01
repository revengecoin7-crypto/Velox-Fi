import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  LogOut,
  Users,
  Coins,
  Swords,
  TrendingUp,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
  Wallet,
} from "lucide-react";

const ADMIN_PASSWORD = "veloxfi2025";
const SESSION_KEY = "vfx_admin_auth";

/* ── stats helpers ── */
function getNum(key: string): number {
  return parseInt(localStorage.getItem(key) ?? "0", 10) || 0;
}

export interface WalletEntry {
  address: string;
  amount: number;
  timestamp: string;
}

function getWallets(): WalletEntry[] {
  try {
    return JSON.parse(localStorage.getItem("vfx_wallets") ?? "[]");
  } catch {
    return [];
  }
}

function fmt(n: number) {
  return n.toLocaleString();
}

function shortAddr(a: string) {
  if (a.length <= 12) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

/* ── stat card ── */
function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-3"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <div
          className="text-3xl font-black tabular-nums mb-0.5"
          style={{ fontFamily: "Inter, sans-serif", color: "#f1f5f9" }}
        >
          {value}
        </div>
        <div className="text-xs font-orbitron tracking-widest text-gray-500">
          {label}
        </div>
        {sub && (
          <div
            className="text-xs mt-1"
            style={{ color: "#6b7280", fontFamily: "Inter, sans-serif" }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── main component ── */
export default function Admin() {
  const [, navigate] = useLocation();

  /* auth state — persist in sessionStorage so refresh keeps you in */
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1",
  );
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  /* dashboard stats */
  const [visitors, setVisitors] = useState(0);
  const [solRaised, setSolRaised] = useState(0);
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [demoCoins, setDemoCoins] = useState(0);
  const [demoBattles, setDemoBattles] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadStats = useCallback(() => {
    setVisitors(getNum("vfx_visitors"));
    setSolRaised(getNum("vfx_sol_raised"));
    setWallets(getWallets());
    setDemoCoins(getNum("vfx_demo_coins"));
    setDemoBattles(getNum("vfx_demo_battles"));
    setLastRefresh(new Date());
  }, []);

  /* auto-refresh every 10s while on dashboard */
  useEffect(() => {
    if (!authed) return;
    loadStats();
    const t = setInterval(loadStats, 10_000);
    return () => clearInterval(t);
  }, [authed, loadStats]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    /* tiny artificial delay so it feels like a real auth call */
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setAuthed(true);
        setError("");
      } else {
        setError("Invalid password");
      }
      setLoginLoading(false);
    }, 600);
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setPassword("");
  }

  /* ══════════════════════════════════════
     LOGIN PAGE
  ══════════════════════════════════════ */
  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "#05080f" }}
      >
        {/* bg glow */}
        <div
          className="fixed pointer-events-none"
          style={{
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "400px",
            background:
              "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative z-10 w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              }}
            >
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-orbitron font-black text-2xl tracking-wider text-white mb-1">
              VELOXFI
            </h1>
            <p className="text-gray-600 text-xs font-orbitron tracking-widest">
              ADMIN ACCESS
            </p>
          </div>

          {/* Login card */}
          <form
            onSubmit={handleLogin}
            className="rounded-2xl p-8 space-y-5"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div>
              <label className="block text-xs font-orbitron tracking-widest text-gray-500 mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none pr-12"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: error
                      ? "1px solid rgba(248,113,113,0.5)"
                      : "1px solid rgba(255,255,255,0.1)",
                    fontFamily: "Inter, sans-serif",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    if (!error)
                      e.target.style.borderColor = "rgba(37,99,235,0.6)";
                  }}
                  onBlur={(e) => {
                    if (!error)
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {error && (
                <p
                  className="text-xs mt-2 font-orbitron tracking-wider"
                  style={{ color: "#f87171" }}
                >
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!password || loginLoading}
              className="w-full py-3.5 rounded-xl font-orbitron font-black tracking-wider text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                border: "none",
                cursor: password && !loginLoading ? "pointer" : "not-allowed",
                color: "white",
              }}
            >
              {loginLoading ? "VERIFYING…" : "LOGIN"}
            </button>
          </form>

          <button
            onClick={() => navigate("/")}
            className="w-full mt-4 text-center text-xs font-orbitron tracking-widest text-gray-700 hover:text-gray-500 transition-colors"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            ← Back to VeloxFi
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════
     DASHBOARD
  ══════════════════════════════════════ */
  const totalSolStr =
    solRaised > 0 ? `${solRaised.toFixed(2)} SOL` : "0 SOL";

  return (
    <div style={{ backgroundColor: "#05080f", minHeight: "100vh", color: "white" }}>
      {/* scanline */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(37,99,235,0.012) 2px,rgba(37,99,235,0.012) 4px)",
        }}
      />

      {/* TOP BAR */}
      <header
        className="sticky top-0 z-50 backdrop-blur-lg"
        style={{
          backgroundColor: "rgba(5,8,15,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            >
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-orbitron font-black text-sm tracking-wider text-white">
                VELOXFI ADMIN
              </div>
              <div className="text-gray-700 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                Dashboard
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadStats}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-orbitron tracking-wider transition-all hover:opacity-80"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#9ca3af",
                cursor: "pointer",
              }}
              title="Refresh stats"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">REFRESH</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-orbitron tracking-wider transition-all hover:opacity-80"
              style={{
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                color: "#f87171",
                cursor: "pointer",
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-orbitron font-black text-2xl text-white tracking-wide">
              OVERVIEW
            </h1>
            <p
              className="text-gray-600 text-xs mt-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Last refreshed{" "}
              {lastRefresh.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
              {" · "}auto-refreshes every 10s
            </p>
          </div>

          <div
            className="px-3 py-1.5 rounded-full text-xs font-orbitron tracking-widest flex items-center gap-1.5"
            style={{
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.2)",
              color: "#34d399",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="TOTAL VISITORS"
            value={fmt(visitors)}
            sub="Since launch"
            accent="#2563eb"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="SOL RAISED"
            value={totalSolStr}
            sub="Presale goal: 500 SOL"
            accent="#7c3aed"
          />
          <StatCard
            icon={<Coins className="w-5 h-5" />}
            label="DEMO COINS"
            value={fmt(demoCoins)}
            sub="Created in demo"
            accent="#0ea5e9"
          />
          <StatCard
            icon={<Swords className="w-5 h-5" />}
            label="DEMO BATTLES"
            value={fmt(demoBattles)}
            sub="Battles completed"
            accent="#a78bfa"
          />
        </div>

        {/* Presale progress */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron font-bold text-sm tracking-widest text-white">
              PRESALE PROGRESS
            </h2>
            <span
              className="text-xs font-orbitron tracking-widest"
              style={{ color: "#6b7280" }}
            >
              {solRaised > 0
                ? `${((solRaised / 500) * 100).toFixed(1)}% of goal`
                : "Not started"}
            </span>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden mb-2"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min((solRaised / 500) * 100, 100)}%`,
                background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                minWidth: solRaised > 0 ? "4px" : "0",
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span
              className="font-orbitron text-gray-600 tracking-widest"
            >
              {solRaised.toFixed(2)} SOL raised
            </span>
            <span className="font-orbitron text-gray-700 tracking-widest">
              500 SOL goal
            </span>
          </div>
        </div>

        {/* Wallet table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="px-6 py-5 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <h2 className="font-orbitron font-bold text-sm tracking-widest text-white">
              PRESALE PURCHASES
            </h2>
            <span
              className="text-xs font-orbitron tracking-widest px-3 py-1 rounded-full"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#6b7280",
              }}
            >
              {wallets.length} {wallets.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {wallets.length === 0 ? (
            <div className="py-14 text-center">
              <Wallet
                className="w-8 h-8 mx-auto mb-3"
                style={{ color: "#374151" }}
              />
              <p className="font-orbitron text-gray-700 text-xs tracking-widest">
                NO PRESALE PURCHASES YET
              </p>
              <p
                className="text-gray-700 text-xs mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Wallet entries will appear here after the presale opens
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["WALLET ADDRESS", "AMOUNT (SOL)", "TIMESTAMP"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-orbitron tracking-widest"
                        style={{ color: "#4b5563" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((w, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                    >
                      <td className="px-6 py-4">
                        <span
                          className="font-mono text-sm"
                          style={{ color: "#a78bfa" }}
                          title={w.address}
                        >
                          {shortAddr(w.address)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="font-bold text-sm"
                          style={{
                            color: "#34d399",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {w.amount.toFixed(2)} SOL
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-xs"
                          style={{
                            color: "#4b5563",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {new Date(w.timestamp).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs font-orbitron tracking-widest"
          style={{ color: "#1f2937" }}
        >
          VELOXFI ADMIN · CONFIDENTIAL · DO NOT SHARE
        </p>
      </div>
    </div>
  );
}
