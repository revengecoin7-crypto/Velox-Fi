import { useLocation } from "wouter";
import { Trophy, Swords, Medal, Wallet, Crown, Star, RotateCcw, Calendar } from "lucide-react";

/* ───────────────────────────────────────────
   Types & data
─────────────────────────────────────────── */
interface Player {
  rank: number;
  address: string;
  battles: number;
  wins: number;
  bestCoin: string;
  pnl: string;
}

const PLACEHOLDER_ROWS: Player[] = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  address: "— UNCLAIMED —",
  battles: 0,
  wins: 0,
  bestCoin: "—",
  pnl: "—",
}));

const PODIUM = [
  { rank: 1, label: "CHAMPION",     color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)", icon: <Crown className="w-5 h-5" />, size: "text-6xl" },
  { rank: 2, label: "RUNNER UP",    color: "#9ca3af", bg: "rgba(156,163,175,0.06)", border: "rgba(156,163,175,0.18)", icon: <Medal className="w-5 h-5" />, size: "text-5xl" },
  { rank: 3, label: "3RD PLACE",    color: "#b45309", bg: "rgba(180,83,9,0.06)",    border: "rgba(180,83,9,0.2)",    icon: <Star  className="w-4 h-4" />, size: "text-4xl" },
];

/* ───────────────────────────────────────────
   Helpers
─────────────────────────────────────────── */
function rankColor(rank: number) {
  if (rank === 1) return "#f59e0b";
  if (rank === 2) return "#9ca3af";
  if (rank === 3) return "#b45309";
  return "#374151";
}

/* ───────────────────────────────────────────
   Podium Card
─────────────────────────────────────────── */
function PodiumCard({ entry, order }: { entry: (typeof PODIUM)[number]; order: number }) {
  return (
    <div
      className="flex-1 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all duration-200"
      style={{
        background: entry.bg,
        border: `1px solid ${entry.border}`,
        order,
        minWidth: 0,
      }}
    >
      {/* Rank badge */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: `${entry.color}18`,
          border: `2px solid ${entry.color}40`,
        }}
      >
        <span
          className="font-orbitron font-black"
          style={{ color: entry.color, fontSize: entry.rank === 1 ? "28px" : entry.rank === 2 ? "24px" : "20px" }}
        >
          #{entry.rank}
        </span>
      </div>

      {/* Avatar placeholder */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl relative"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: `2px dashed ${entry.color}35`,
        }}
      >
        <span style={{ color: `${entry.color}40`, fontSize: "36px" }}>?</span>
        <div
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: entry.color, color: "#05080f" }}
        >
          {entry.icon}
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <div
          className="font-orbitron font-black text-xs tracking-widest mb-1"
          style={{ color: entry.color }}
        >
          {entry.label}
        </div>
        <div
          className="font-orbitron text-xs tracking-widest"
          style={{ color: "#374151" }}
        >
          — UNCLAIMED —
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 text-center mt-1">
        {[
          { label: "BATTLES", value: "—" },
          { label: "WINS",    value: "—" },
          { label: "PNL",     value: "—" },
        ].map(({ label, value }) => (
          <div key={label}>
            <div
              className="font-black text-base"
              style={{ fontFamily: "Inter, sans-serif", color: "#4b5563" }}
            >
              {value}
            </div>
            <div className="font-orbitron text-gray-700" style={{ fontSize: "9px", letterSpacing: "0.12em" }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   Main Page
─────────────────────────────────────────── */
export default function Leaderboard() {
  const [, navigate] = useLocation();

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

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg"
        style={{
          backgroundColor: "rgba(5,8,15,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            >
              <Swords className="w-5 h-5 text-white" />
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
            <button
              onClick={() => navigate("/battles")}
              className="btn-outline px-4 py-2 rounded-lg text-xs font-orbitron tracking-wider hidden sm:block"
            >
              BATTLE ARENA
            </button>
            <button
              onClick={() => navigate("/")}
              className="btn-outline px-4 py-2 rounded-lg text-xs font-orbitron tracking-wider"
            >
              ← HOME
            </button>
          </div>
        </div>
      </nav>

      {/* PAGE */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20">

        {/* Header */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-orbitron tracking-widest"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "#f59e0b",
            }}
          >
            <Trophy className="w-3 h-3" />
            LEADERBOARD
          </div>
          <h1 className="font-orbitron font-black text-4xl md:text-5xl text-white leading-tight mb-2">
            TOP{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              WARRIORS
            </span>
          </h1>
          <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            Season 1 — The greatest memecoin battle champions
          </p>
        </div>

        {/* Season info bar */}
        <div
          className="flex items-center flex-wrap gap-6 p-4 rounded-xl mb-10"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {[
            { icon: <Trophy className="w-3.5 h-3.5" />,       label: "SEASON",      value: "Season 1",   color: "#f59e0b" },
            { icon: <RotateCcw className="w-3.5 h-3.5" />,    label: "RESETS",      value: "Monthly",    color: "#60a5fa" },
            { icon: <Calendar className="w-3.5 h-3.5" />,     label: "STARTS",      value: "Jun 1 2026", color: "#a78bfa" },
            { icon: <Star className="w-3.5 h-3.5" />,         label: "PRIZE POOL",  value: "TBA",        color: "#34d399" },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span style={{ color }}>{icon}</span>
              <span className="font-orbitron text-gray-700" style={{ fontSize: "10px", letterSpacing: "0.12em" }}>
                {label}:
              </span>
              <span
                className="font-black text-sm"
                style={{ fontFamily: "Inter, sans-serif", color }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Podium — centre=gold(1), left=silver(2), right=bronze(3) */}
        <div className="flex gap-4 mb-10">
          {/* silver — order 1 */}
          <PodiumCard entry={PODIUM[1]} order={1} />
          {/* gold — order 2, bigger */}
          <div
            className="flex-[1.3] rounded-2xl p-6 flex flex-col items-center gap-3 transition-all duration-200 relative overflow-hidden"
            style={{
              background: PODIUM[0].bg,
              border: `1px solid ${PODIUM[0].border}`,
              order: 2,
              minWidth: 0,
            }}
          >
            {/* glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 70%)",
              }}
            />

            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center relative z-10"
              style={{
                background: "rgba(245,158,11,0.15)",
                border: "2px solid rgba(245,158,11,0.5)",
              }}
            >
              <span className="font-orbitron font-black text-4xl" style={{ color: "#f59e0b" }}>
                #1
              </span>
            </div>

            <div
              className="w-24 h-24 rounded-full flex items-center justify-center relative z-10"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "2px dashed rgba(245,158,11,0.4)",
              }}
            >
              <span style={{ color: "rgba(245,158,11,0.3)", fontSize: "44px" }}>?</span>
              <div
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "#f59e0b", color: "#05080f" }}
              >
                <Crown className="w-4 h-4" />
              </div>
            </div>

            <div className="text-center relative z-10">
              <div
                className="font-orbitron font-black text-sm tracking-widest mb-1"
                style={{ color: "#f59e0b" }}
              >
                CHAMPION
              </div>
              <div
                className="font-orbitron text-xs tracking-widest"
                style={{ color: "#374151" }}
              >
                — UNCLAIMED —
              </div>
            </div>

            <div className="flex gap-6 text-center relative z-10 mt-1">
              {[{ label: "BATTLES", v: "—" }, { label: "WINS", v: "—" }, { label: "PNL", v: "—" }].map(({ label, v }) => (
                <div key={label}>
                  <div className="font-black text-lg" style={{ fontFamily: "Inter, sans-serif", color: "#4b5563" }}>{v}</div>
                  <div className="font-orbitron text-gray-700" style={{ fontSize: "9px", letterSpacing: "0.12em" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* bronze — order 3 */}
          <PodiumCard entry={PODIUM[2]} order={3} />
        </div>

        {/* Full leaderboard table */}
        <div
          className="rounded-2xl overflow-hidden mb-10"
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.015)",
          }}
        >
          {/* Table header */}
          <div
            className="grid gap-0 text-xs font-orbitron tracking-widest py-3 px-6"
            style={{
              gridTemplateColumns: "56px 1fr 80px 80px 90px 100px 90px",
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              color: "#374151",
            }}
          >
            <span>RANK</span>
            <span>PLAYER</span>
            <span className="text-right">BATTLES</span>
            <span className="text-right">WINS</span>
            <span className="text-right">WIN RATE</span>
            <span className="text-right hidden sm:block">BEST COIN</span>
            <span className="text-right">PNL</span>
          </div>

          {/* Rows */}
          {PLACEHOLDER_ROWS.map((row, i) => (
            <div
              key={row.rank}
              className="grid gap-0 py-4 px-6 transition-colors"
              style={{
                gridTemplateColumns: "56px 1fr 80px 80px 90px 100px 90px",
                borderBottom: i < 9 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.025)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background = "transparent")
              }
            >
              {/* Rank */}
              <span
                className="font-orbitron font-black text-sm flex items-center"
                style={{ color: rankColor(row.rank) }}
              >
                {row.rank <= 3 ? (
                  <span className="flex items-center gap-1">
                    {row.rank === 1 && <Crown className="w-3.5 h-3.5" />}
                    {row.rank === 2 && <Medal className="w-3.5 h-3.5" />}
                    {row.rank === 3 && <Star  className="w-3.5 h-3.5" />}
                    #{row.rank}
                  </span>
                ) : (
                  `#${row.rank}`
                )}
              </span>

              {/* Player */}
              <span
                className="flex items-center text-xs tracking-widest font-orbitron"
                style={{ color: "#374151" }}
              >
                {row.address}
              </span>

              {/* Battles */}
              <span
                className="text-right text-sm flex items-center justify-end"
                style={{ fontFamily: "Inter, sans-serif", color: "#374151" }}
              >
                —
              </span>

              {/* Wins */}
              <span
                className="text-right text-sm flex items-center justify-end"
                style={{ fontFamily: "Inter, sans-serif", color: "#374151" }}
              >
                —
              </span>

              {/* Win rate */}
              <span
                className="text-right text-sm flex items-center justify-end"
                style={{ fontFamily: "Inter, sans-serif", color: "#374151" }}
              >
                —
              </span>

              {/* Best coin */}
              <span
                className="text-right text-sm flex items-center justify-end font-orbitron tracking-wider hidden sm:flex"
                style={{ color: "#374151" }}
              >
                —
              </span>

              {/* PNL */}
              <span
                className="text-right text-sm flex items-center justify-end"
                style={{ fontFamily: "Inter, sans-serif", color: "#374151" }}
              >
                —
              </span>
            </div>
          ))}
        </div>

        {/* YOUR RANK section */}
        <div
          className="rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6"
          style={{
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))",
            border: "1px solid rgba(124,58,237,0.15)",
          }}
        >
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(37,99,235,0.1)",
              border: "1px solid rgba(37,99,235,0.2)",
            }}
          >
            <Wallet className="w-7 h-7" style={{ color: "#60a5fa" }} />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="font-orbitron font-black text-lg text-white mb-1 tracking-wide">
              YOUR RANK
            </div>
            <p
              className="text-gray-500 text-sm"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Connect your wallet to see your rank, battle history, and win rate.
              <br className="hidden sm:block" />
              Real battles and rankings unlock at presale launch — June 1, 2026.
            </p>
          </div>

          <button
            onClick={() => navigate("/presale")}
            className="btn-primary px-6 py-3 rounded-xl flex-shrink-0"
          >
            <span className="font-orbitron tracking-wider text-sm">JOIN PRESALE</span>
          </button>
        </div>

      </div>
    </div>
  );
}
