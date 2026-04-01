import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Swords,
  TrendingUp,
  TrendingDown,
  Clock,
  Flame,
  Plus,
  Filter,
} from "lucide-react";

/* ───────────────────────────────────────────
   Types
─────────────────────────────────────────── */
type BattleState = "live" | "ended";
type FilterTab = "ALL" | "LIVE" | "ENDED" | "HOT";
type Duration = "1H" | "3H" | "12H" | "24H" | "7D";

interface Coin {
  ticker: string;
  name: string;
  icon: string;
}

interface Battle {
  id: number;
  coinA: Coin;
  coinB: Coin;
  state: BattleState;
  duration: Duration;
  totalSecs: number;   // total battle length in seconds
  endedSecsAgo: number; // seconds in the past (0 if live)
  startPctA: number;   // starting % change
  startPctB: number;
  hot: boolean;
  winnerSide?: "A" | "B"; // for ended battles
}

interface LiveData {
  pctA: number;
  pctB: number;
  timeLeft: number; // seconds remaining
}

/* ───────────────────────────────────────────
   Seed data
─────────────────────────────────────────── */
const SEED_BATTLES: Battle[] = [
  {
    id: 1,
    coinA: { ticker: "PEPE", name: "Pepe Classic", icon: "🐸" },
    coinB: { ticker: "DOGE", name: "Dogecoin",     icon: "🐕" },
    state: "live", duration: "24H", totalSecs: 86400,
    endedSecsAgo: 0, startPctA: 8.4, startPctB: -2.1,
    hot: true,
  },
  {
    id: 2,
    coinA: { ticker: "WIF",  name: "dogwifhat",    icon: "🎩" },
    coinB: { ticker: "BONK", name: "Bonk",          icon: "🔨" },
    state: "live", duration: "1H", totalSecs: 3600,
    endedSecsAgo: 0, startPctA: 6.7, startPctB: 2.1,
    hot: false,
  },
  {
    id: 3,
    coinA: { ticker: "BOME",   name: "Book of Meme", icon: "💣" },
    coinB: { ticker: "POPCAT", name: "Popcat",        icon: "😺" },
    state: "live", duration: "12H", totalSecs: 43200,
    endedSecsAgo: 0, startPctA: -3.8, startPctB: 11.2,
    hot: true,
  },
  {
    id: 4,
    coinA: { ticker: "MOG",  name: "Mog Coin",  icon: "😸" },
    coinB: { ticker: "MYRO", name: "Myro",       icon: "🐶" },
    state: "live", duration: "3H", totalSecs: 10800,
    endedSecsAgo: 0, startPctA: 14.5, startPctB: 4.3,
    hot: true,
  },
  {
    id: 5,
    coinA: { ticker: "SAMO",  name: "Samoyed", icon: "🐕‍🦺" },
    coinB: { ticker: "FLOKI", name: "Floki",    icon: "⚡" },
    state: "ended", duration: "7D", totalSecs: 604800,
    endedSecsAgo: 3600 * 4, startPctA: 22.1, startPctB: 8.4,
    hot: false, winnerSide: "A",
  },
  {
    id: 6,
    coinA: { ticker: "COPE", name: "Cope Token", icon: "🧠" },
    coinB: { ticker: "MEME", name: "Memecoin",    icon: "🎭" },
    state: "ended", duration: "24H", totalSecs: 86400,
    endedSecsAgo: 3600 * 12, startPctA: -15.7, startPctB: 31.2,
    hot: false, winnerSide: "B",
  },
  {
    id: 7,
    coinA: { ticker: "NYAN", name: "Nyan Cat",  icon: "🌈" },
    coinB: { ticker: "SHIB", name: "Shiba Inu", icon: "🦊" },
    state: "live", duration: "3H", totalSecs: 10800,
    endedSecsAgo: 0, startPctA: 1.2, startPctB: -5.6,
    hot: false,
  },
  {
    id: 8,
    coinA: { ticker: "TURBO", name: "Turbo",   icon: "🚀" },
    coinB: { ticker: "CHAT",  name: "ChatCoin", icon: "💬" },
    state: "ended", duration: "1H", totalSecs: 3600,
    endedSecsAgo: 1800, startPctA: 44.0, startPctB: 9.1,
    hot: false, winnerSide: "A",
  },
];

/* ───────────────────────────────────────────
   Helpers
─────────────────────────────────────────── */
function fmtPct(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

function fmtTime(secs: number) {
  if (secs <= 0) return "00:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function barPct(pA: number, pB: number) {
  const spread = pA - pB;
  return Math.min(Math.max(50 + spread * 1.5, 5), 95);
}

function initTimeLeft(b: Battle) {
  if (b.state === "ended") return 0;
  // simulate a partially-elapsed battle so each live battle has a different time left
  const elapsed = Math.floor(b.totalSecs * (0.1 + Math.random() * 0.6));
  return Math.max(b.totalSecs - elapsed, 120);
}

const DURATION_COLORS: Record<Duration, string> = {
  "1H": "#34d399",
  "3H": "#60a5fa",
  "12H": "#a78bfa",
  "24H": "#f59e0b",
  "7D": "#f87171",
};

/* ───────────────────────────────────────────
   Battle Card
─────────────────────────────────────────── */
function BattleCard({
  battle,
  live,
}: {
  battle: Battle;
  live: LiveData;
}) {
  const isLive = battle.state === "live";
  const bpct = barPct(live.pctA, live.pctB);
  const aWins = live.pctA >= live.pctB;
  const dColor = DURATION_COLORS[battle.duration];

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: isLive
          ? "1px solid rgba(37,99,235,0.2)"
          : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Top row: duration badge + state badge */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-orbitron tracking-widest px-2.5 py-1 rounded-full font-bold"
          style={{
            background: `${dColor}15`,
            border: `1px solid ${dColor}35`,
            color: dColor,
          }}
        >
          {battle.duration}
        </span>

        {isLive ? (
          <span
            className="flex items-center gap-1.5 text-xs font-orbitron tracking-widest px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.2)",
              color: "#34d399",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </span>
        ) : (
          <span
            className="text-xs font-orbitron tracking-widest px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#4b5563",
            }}
          >
            ENDED
          </span>
        )}
      </div>

      {/* Coins VS */}
      <div className="flex items-center gap-3">
        {/* Coin A */}
        <div className="flex-1 text-center">
          <div
            className="w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl"
            style={{
              background: "rgba(37,99,235,0.12)",
              border: aWins && !isLive
                ? "2px solid rgba(52,211,153,0.5)"
                : "1px solid rgba(37,99,235,0.25)",
            }}
          >
            {battle.coinA.icon}
          </div>
          <div className="font-orbitron font-black text-xs text-white tracking-widest truncate">
            {battle.coinA.ticker}
          </div>
          <div
            className="text-gray-600 text-xs truncate mt-0.5"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "10px" }}
          >
            {battle.coinA.name}
          </div>
          <div
            className="text-sm font-bold flex items-center justify-center gap-0.5 mt-1.5"
            style={{
              color: live.pctA >= 0 ? "#34d399" : "#f87171",
              fontFamily: "Inter, sans-serif",
              transition: "color 0.3s",
            }}
          >
            {live.pctA >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {fmtPct(live.pctA)}
          </div>
        </div>

        {/* VS bubble */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
          >
            <span className="font-orbitron text-white text-xs font-black">VS</span>
          </div>
          {isLive && (
            <span
              className="text-xs font-orbitron"
              style={{ color: aWins ? "#34d399" : "#f87171", fontSize: "9px" }}
            >
              {aWins ? "↑" : "↓"}
            </span>
          )}
        </div>

        {/* Coin B */}
        <div className="flex-1 text-center">
          <div
            className="w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl"
            style={{
              background: "rgba(124,58,237,0.12)",
              border: !aWins && !isLive
                ? "2px solid rgba(52,211,153,0.5)"
                : "1px solid rgba(124,58,237,0.25)",
            }}
          >
            {battle.coinB.icon}
          </div>
          <div className="font-orbitron font-black text-xs text-white tracking-widest truncate">
            {battle.coinB.ticker}
          </div>
          <div
            className="text-gray-600 text-xs truncate mt-0.5"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "10px" }}
          >
            {battle.coinB.name}
          </div>
          <div
            className="text-sm font-bold flex items-center justify-center gap-0.5 mt-1.5"
            style={{
              color: live.pctB >= 0 ? "#34d399" : "#f87171",
              fontFamily: "Inter, sans-serif",
              transition: "color 0.3s",
            }}
          >
            {live.pctB >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {fmtPct(live.pctB)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full flex transition-all duration-700"
          >
            <div
              className="rounded-l-full"
              style={{
                width: `${bpct}%`,
                background: "linear-gradient(90deg, #2563eb, #3b82f6)",
              }}
            />
            <div
              className="rounded-r-full"
              style={{
                width: `${100 - bpct}%`,
                background: "linear-gradient(90deg, #6d28d9, #7c3aed)",
              }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs font-orbitron mt-1">
          <span style={{ color: "#60a5fa" }}>{bpct.toFixed(0)}%</span>
          <span style={{ color: "#a78bfa" }}>{(100 - bpct).toFixed(0)}%</span>
        </div>
      </div>

      {/* Timer / Footer */}
      {isLive ? (
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "#6b7280", fontFamily: "Inter, sans-serif" }}
          >
            <Clock className="w-3.5 h-3.5" />
            <span
              className="font-orbitron tracking-widest tabular-nums"
              style={{ color: live.timeLeft < 300 ? "#f87171" : "#9ca3af" }}
            >
              {fmtTime(live.timeLeft)}
            </span>
          </div>
          <button
            className="px-4 py-2 rounded-lg text-xs font-orbitron tracking-wider font-bold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
          >
            JOIN BATTLE
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div
            className="text-xs"
            style={{ color: "#374151", fontFamily: "Inter, sans-serif" }}
          >
            Ended {Math.round(battle.endedSecsAgo / 3600)}h ago
          </div>
          <div
            className="flex items-center gap-1.5 text-xs font-orbitron tracking-widest px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#374151",
            }}
          >
            <span style={{ color: battle.winnerSide === "A" ? "#60a5fa" : "#a78bfa" }}>
              {battle.winnerSide === "A" ? battle.coinA.ticker : battle.coinB.ticker}
            </span>
            <span style={{ color: "#4b5563" }}>WON</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────
   Main Page
─────────────────────────────────────────── */
export default function Battles() {
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<FilterTab>("ALL");

  /* Initialise live data map */
  const [liveData, setLiveData] = useState<Record<number, LiveData>>(() => {
    const map: Record<number, LiveData> = {};
    SEED_BATTLES.forEach((b) => {
      map[b.id] = {
        pctA: b.startPctA,
        pctB: b.startPctB,
        timeLeft: initTimeLeft(b),
      };
    });
    return map;
  });

  /* Tick: update live prices and timers every 1.5s */
  const tickRef = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      setLiveData((prev) => {
        const next = { ...prev };
        SEED_BATTLES.forEach((b) => {
          if (b.state !== "live") return;
          const cur = next[b.id];
          const newTime = Math.max(0, cur.timeLeft - 1);
          next[b.id] = {
            pctA: parseFloat(
              (cur.pctA + (Math.random() - 0.47) * 1.4).toFixed(2),
            ),
            pctB: parseFloat(
              (cur.pctB + (Math.random() - 0.53) * 1.4).toFixed(2),
            ),
            timeLeft: newTime,
          };
        });
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  /* Filter battles */
  const visible = SEED_BATTLES.filter((b) => {
    if (filter === "LIVE") return b.state === "live";
    if (filter === "ENDED") return b.state === "ended";
    if (filter === "HOT") return b.hot;
    return true;
  });

  const liveCt = SEED_BATTLES.filter((b) => b.state === "live").length;

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
            <span
              className="flex items-center gap-1.5 text-xs font-orbitron tracking-widest px-3 py-1 rounded-full hidden sm:flex"
              style={{
                background: "rgba(52,211,153,0.08)",
                border: "1px solid rgba(52,211,153,0.2)",
                color: "#34d399",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {liveCt} LIVE
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

      {/* PAGE */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-orbitron tracking-widest"
              style={{
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.25)",
                color: "#60a5fa",
              }}
            >
              <Swords className="w-3 h-3" />
              BATTLE ARENA
            </div>
            <h1 className="font-orbitron font-black text-4xl md:text-5xl text-white leading-tight mb-2">
              BATTLE{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ARENA
              </span>
            </h1>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Real-time memecoin combat on Solana
            </p>
          </div>

          <button
            onClick={() => navigate("/demo")}
            className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 flex-shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span className="font-orbitron tracking-wider text-sm">START YOUR OWN BATTLE</span>
          </button>
        </div>

        {/* Stats strip */}
        <div
          className="flex items-center gap-6 p-4 rounded-xl mb-6 flex-wrap"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {[
            { label: "LIVE BATTLES", value: String(liveCt), color: "#34d399" },
            { label: "TOTAL BATTLES", value: String(SEED_BATTLES.length), color: "#60a5fa" },
            { label: "BATTLE VOLUME", value: "—", color: "#a78bfa" },
            { label: "PRIZE POOL", value: "—", color: "#f59e0b" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div
                className="text-lg font-black tabular-nums"
                style={{ fontFamily: "Inter, sans-serif", color }}
              >
                {value}
              </div>
              <div className="text-xs font-orbitron tracking-widest text-gray-700">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-gray-700" />
          {(["ALL", "LIVE", "ENDED", "HOT"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-4 py-2 rounded-lg text-xs font-orbitron tracking-wider transition-all duration-200"
              style={{
                background:
                  filter === tab
                    ? "linear-gradient(135deg, #2563eb, #7c3aed)"
                    : "rgba(255,255,255,0.04)",
                border:
                  filter === tab
                    ? "1px solid transparent"
                    : "1px solid rgba(255,255,255,0.08)",
                color: filter === tab ? "white" : "#6b7280",
                cursor: "pointer",
              }}
            >
              {tab === "HOT" ? (
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3" style={{ color: filter === "HOT" ? "white" : "#f97316" }} />
                  HOT
                </span>
              ) : (
                tab
              )}
              {tab === "LIVE" && (
                <span
                  className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs tabular-nums"
                  style={{
                    background: filter === "LIVE" ? "rgba(255,255,255,0.2)" : "rgba(52,211,153,0.15)",
                    color: filter === "LIVE" ? "white" : "#34d399",
                    fontSize: "10px",
                  }}
                >
                  {liveCt}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Battle grid */}
        {visible.length === 0 ? (
          <div className="py-20 text-center">
            <Swords className="w-10 h-10 mx-auto mb-4" style={{ color: "#1f2937" }} />
            <p className="font-orbitron text-gray-700 tracking-widest text-sm">
              NO BATTLES IN THIS FILTER
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visible.map((b) => (
              <BattleCard key={b.id} battle={b} live={liveData[b.id]} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div
          className="mt-12 rounded-2xl p-8 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))",
            border: "1px solid rgba(124,58,237,0.12)",
          }}
        >
          <h3 className="font-orbitron font-black text-xl text-white mb-2">
            WANT TO START YOUR OWN BATTLE?
          </h3>
          <p
            className="text-gray-500 text-sm mb-5"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Try the demo — no wallet needed. Real battles launch at presale.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/demo")}
              className="btn-primary px-6 py-3 rounded-xl"
            >
              <span className="font-orbitron tracking-wider text-sm">TRY DEMO BATTLE</span>
            </button>
            <button
              onClick={() => navigate("/presale")}
              className="btn-outline px-6 py-3 rounded-xl"
            >
              <span className="font-orbitron tracking-wider text-sm">JOIN PRESALE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
