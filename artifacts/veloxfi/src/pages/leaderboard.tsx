import { useLocation } from "wouter";
import { Trophy, Medal, Wallet, Crown, Star, RotateCcw, Calendar } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import MemeShell from "@/components/MemeShell";

interface Player { rank: number; address: string; battles: number; wins: number; bestCoin: string; pnl: string; }

const PLACEHOLDER_ROWS: Player[] = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1, address: "— UNCLAIMED —", battles: 0, wins: 0, bestCoin: "—", pnl: "—",
}));

const PODIUM = [
  { rank: 1, label: "CHAMPION",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.4)",   icon: <Crown className="w-5 h-5" />,  size: "text-5xl", glow: "rgba(245,158,11,0.4)"  },
  { rank: 2, label: "RUNNER UP", color: "#9ca3af", bg: "rgba(156,163,175,0.07)", border: "rgba(156,163,175,0.25)", icon: <Medal className="w-5 h-5" />,  size: "text-4xl", glow: "rgba(156,163,175,0.2)" },
  { rank: 3, label: "3RD PLACE", color: "#b45309", bg: "rgba(180,83,9,0.07)",    border: "rgba(180,83,9,0.28)",    icon: <Star  className="w-4 h-4" />,  size: "text-3xl", glow: "rgba(180,83,9,0.3)"   },
];

function rankColor(rank: number) {
  if (rank === 1) return "#f59e0b";
  if (rank === 2) return "#9ca3af";
  if (rank === 3) return "#b45309";
  return "#374151";
}

function PodiumCard({ entry, order }: { entry: typeof PODIUM[number]; order: number }) {
  const isGold = entry.rank === 1;
  return (
    <div className="flex-1 rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-200"
      style={{
        background: entry.bg,
        border: `2px solid ${entry.border}`,
        order,
        minWidth: 0,
        boxShadow: isGold ? `0 0 30px ${entry.glow}` : "none",
      }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: `${entry.color}20`, border: `2px solid ${entry.color}55`, color: entry.color }}>
        <span className="font-orbitron font-black text-2xl">#{entry.rank}</span>
      </div>
      <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
        style={{ background: "rgba(255,255,255,0.03)", border: `2px dashed ${entry.color}40` }}>
        <span style={{ color: `${entry.color}40`, fontSize: "36px" }}>?</span>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: entry.color, color: "#05080f" }}>
          {entry.icon}
        </div>
      </div>
      <div className="text-center">
        <div className="font-orbitron font-black text-sm tracking-widest mb-1" style={{ color: entry.color }}>{entry.label}</div>
        <div className="font-orbitron text-xs tracking-widest" style={{ color: "#374151" }}>— UNCLAIMED —</div>
      </div>
      <div className="flex gap-4 text-center mt-1">
        {[{ label: "BATTLES", v: "—" }, { label: "WINS", v: "—" }, { label: "PNL", v: "—" }].map(({ label, v }) => (
          <div key={label}>
            <div className="font-black text-base" style={{ fontFamily: "Inter, sans-serif", color: "#4b5563" }}>{v}</div>
            <div className="font-orbitron text-gray-700" style={{ fontSize: "9px", letterSpacing: "0.12em" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  usePageMeta({
    title: "Leaderboard — Top Battle Champions | VeloxFi",
    description: "See the top-performing memecoins and battle champions on VeloxFi. Rankings updated in real time on Solana.",
    canonical: "https://veloxfi.io/#/leaderboard",
  });
  const [, navigate] = useLocation();

  return (
    <MemeShell>
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-20">

        {/* ── HEADER ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-orbitron tracking-widest"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.35)", color: "#f59e0b" }}>
            <Trophy className="w-3.5 h-3.5" /> SEASON 1 RANKINGS
          </div>
          <h1 className="font-orbitron font-black text-5xl md:text-6xl text-white leading-tight mb-3 meme-title">
            🏆 TOP{" "}
            <span style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              WARRIORS
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Season 1 — The greatest memecoin battle champions 👑</p>
        </div>

        {/* ── SEASON INFO ── */}
        <div className="flex items-center flex-wrap gap-6 p-5 rounded-2xl mb-10"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { icon: <Trophy className="w-3.5 h-3.5" />,    label: "SEASON",     value: "Season 1",   color: "#f59e0b" },
            { icon: <RotateCcw className="w-3.5 h-3.5" />, label: "RESETS",     value: "Monthly",    color: "#60a5fa" },
            { icon: <Calendar className="w-3.5 h-3.5" />,  label: "STARTS",     value: "Jun 1 2026", color: "#a78bfa" },
            { icon: <Star className="w-3.5 h-3.5" />,      label: "PRIZE POOL", value: "TBA 💰",      color: "#34d399" },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span style={{ color }}>{icon}</span>
              <span className="font-orbitron text-gray-700" style={{ fontSize: "10px", letterSpacing: "0.12em" }}>{label}:</span>
              <span className="font-black text-sm" style={{ fontFamily: "Inter, sans-serif", color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ── PODIUM ── */}
        <div className="mb-4 text-center">
          <h2 className="font-orbitron font-black text-xl text-white tracking-wider">
            🥇 👑 PODIUM 👑 🥇
          </h2>
        </div>
        <div className="flex gap-4 mb-10">
          <PodiumCard entry={PODIUM[1]} order={1} />
          {/* Gold — bigger */}
          <div className="flex-[1.4] rounded-2xl p-6 flex flex-col items-center gap-3 relative overflow-hidden"
            style={{
              background: PODIUM[0].bg,
              border: `2px solid ${PODIUM[0].border}`,
              order: 2,
              minWidth: 0,
              boxShadow: `0 0 50px ${PODIUM[0].glow}`,
            }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(245,158,11,0.15) 0%,transparent 70%)" }} />
            <div className="relative z-10 text-3xl animate-bounce">👑</div>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative z-10"
              style={{ background: "rgba(245,158,11,0.18)", border: "2px solid rgba(245,158,11,0.6)" }}>
              <span className="font-orbitron font-black text-3xl" style={{ color: "#f59e0b" }}>#1</span>
            </div>
            <div className="w-24 h-24 rounded-full flex items-center justify-center relative z-10"
              style={{ background: "rgba(255,255,255,0.03)", border: "2px dashed rgba(245,158,11,0.45)" }}>
              <span style={{ color: "rgba(245,158,11,0.3)", fontSize: "44px" }}>?</span>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "#f59e0b", color: "#05080f" }}>
                <Crown className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center relative z-10">
              <div className="font-orbitron font-black text-base tracking-widest mb-1" style={{ color: "#f59e0b" }}>
                👑 CHAMPION
              </div>
              <div className="font-orbitron text-xs tracking-widest" style={{ color: "#374151" }}>— UNCLAIMED —</div>
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
          <PodiumCard entry={PODIUM[2]} order={3} />
        </div>

        {/* ── TABLE ── */}
        <div className="rounded-2xl overflow-hidden mb-10"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}>
          <div className="grid gap-0 text-xs font-orbitron tracking-widest py-3.5 px-6"
            style={{ gridTemplateColumns: "56px 1fr 80px 80px 90px 100px 90px", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#374151" }}>
            <span>🏆 RANK</span>
            <span>PLAYER</span>
            <span className="text-right">BATTLES</span>
            <span className="text-right">WINS</span>
            <span className="text-right">WIN RATE</span>
            <span className="text-right hidden sm:block">BEST COIN</span>
            <span className="text-right">PNL</span>
          </div>
          {PLACEHOLDER_ROWS.map((row, i) => (
            <div key={row.rank} className="grid gap-0 py-4 px-6 transition-all cursor-default"
              style={{
                gridTemplateColumns: "56px 1fr 80px 80px 90px 100px 90px",
                borderBottom: i < 9 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: row.rank <= 3 ? `${rankColor(row.rank)}05` : "transparent",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = row.rank <= 3 ? `${rankColor(row.rank)}05` : "transparent"; }}>
              <span className="font-orbitron font-black text-sm flex items-center" style={{ color: rankColor(row.rank) }}>
                {row.rank <= 3 ? (
                  <span className="flex items-center gap-1">
                    {row.rank === 1 && <Crown className="w-3.5 h-3.5" />}
                    {row.rank === 2 && <Medal className="w-3.5 h-3.5" />}
                    {row.rank === 3 && <Star  className="w-3.5 h-3.5" />}
                    #{row.rank}
                  </span>
                ) : `#${row.rank}`}
              </span>
              <span className="flex items-center text-xs tracking-widest font-orbitron" style={{ color: "#374151" }}>{row.address}</span>
              {["—","—","—","—","—"].map((v, vi) => (
                <span key={vi} className={`text-right text-sm flex items-center justify-end ${vi === 3 ? "hidden sm:flex" : ""}`}
                  style={{ fontFamily: "Inter, sans-serif", color: "#374151" }}>{v}</span>
              ))}
            </div>
          ))}
        </div>

        {/* ── YOUR RANK ── */}
        <div className="rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6"
          style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.08),rgba(124,58,237,0.08))", border: "2px solid rgba(124,58,237,0.25)" }}>
          <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.25)" }}>
            <Wallet className="w-7 h-7" style={{ color: "#60a5fa" }} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="font-orbitron font-black text-xl text-white mb-1 tracking-wide">🎯 YOUR RANK</div>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Connect your wallet to see your rank, battle history, and win rate.
              <br className="hidden sm:block" />
              Real battles and rankings unlock at presale launch — June 1, 2026.
            </p>
          </div>
          <button onClick={() => navigate("/presale")} className="btn-meme px-8 py-4 rounded-2xl text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#4ade80,#16a34a)", boxShadow: "0 0 20px rgba(74,222,128,0.3)" }}>
            🔥 JOIN PRESALE NOW
          </button>
        </div>
      </div>
    </MemeShell>
  );
}
