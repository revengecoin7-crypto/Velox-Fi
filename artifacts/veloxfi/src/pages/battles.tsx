import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { TrendingUp, TrendingDown, Clock, Flame, Plus, Filter } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Sidebar } from "@/components/Sidebar";

type BattleState = "live" | "ended";
type FilterTab = "ALL" | "LIVE" | "ENDED" | "HOT";
type Duration = "1H" | "3H" | "12H" | "24H" | "7D";

interface Coin   { ticker: string; name: string; icon: string; }
interface Battle { id: number; coinA: Coin; coinB: Coin; state: BattleState; duration: Duration; totalSecs: number; endedSecsAgo: number; startPctA: number; startPctB: number; hot: boolean; winnerSide?: "A" | "B"; }
interface LiveData { pctA: number; pctB: number; timeLeft: number; }

const SEED_BATTLES: Battle[] = [
  { id: 1, coinA: { ticker: "PEPE",   name: "Pepe Classic", icon: "🐸" }, coinB: { ticker: "DOGE",   name: "Dogecoin",     icon: "🐕" }, state: "live",  duration: "24H", totalSecs: 86400,  endedSecsAgo: 0,      startPctA: 8.4,  startPctB: -2.1, hot: true  },
  { id: 2, coinA: { ticker: "WIF",    name: "dogwifhat",    icon: "🎩" }, coinB: { ticker: "BONK",   name: "Bonk",         icon: "🔨" }, state: "live",  duration: "1H",  totalSecs: 3600,   endedSecsAgo: 0,      startPctA: 6.7,  startPctB: 2.1,  hot: false },
  { id: 3, coinA: { ticker: "BOME",   name: "Book of Meme", icon: "💣" }, coinB: { ticker: "POPCAT", name: "Popcat",        icon: "😺" }, state: "live",  duration: "12H", totalSecs: 43200,  endedSecsAgo: 0,      startPctA: -3.8, startPctB: 11.2, hot: true  },
  { id: 4, coinA: { ticker: "MOG",    name: "Mog Coin",     icon: "😸" }, coinB: { ticker: "MYRO",   name: "Myro",          icon: "🐶" }, state: "live",  duration: "3H",  totalSecs: 10800,  endedSecsAgo: 0,      startPctA: 14.5, startPctB: 4.3,  hot: true  },
  { id: 5, coinA: { ticker: "SAMO",   name: "Samoyed",      icon: "🐕‍🦺" }, coinB: { ticker: "FLOKI", name: "Floki",         icon: "⚡" }, state: "ended", duration: "7D",  totalSecs: 604800, endedSecsAgo: 14400,  startPctA: 22.1, startPctB: 8.4,  hot: false, winnerSide: "A" },
  { id: 6, coinA: { ticker: "COPE",   name: "Cope Token",   icon: "🧠" }, coinB: { ticker: "MEME",   name: "Memecoin",      icon: "🎭" }, state: "ended", duration: "24H", totalSecs: 86400,  endedSecsAgo: 43200,  startPctA: -15.7,startPctB: 31.2, hot: false, winnerSide: "B" },
  { id: 7, coinA: { ticker: "NYAN",   name: "Nyan Cat",     icon: "🌈" }, coinB: { ticker: "SHIB",   name: "Shiba Inu",     icon: "🦊" }, state: "live",  duration: "3H",  totalSecs: 10800,  endedSecsAgo: 0,      startPctA: 1.2,  startPctB: -5.6, hot: false },
  { id: 8, coinA: { ticker: "TURBO",  name: "Turbo",        icon: "🚀" }, coinB: { ticker: "CHAT",   name: "ChatCoin",      icon: "💬" }, state: "ended", duration: "1H",  totalSecs: 3600,   endedSecsAgo: 1800,   startPctA: 44.0, startPctB: 9.1,  hot: false, winnerSide: "A" },
];

function fmtPct(n: number) { return (n >= 0 ? "+" : "") + n.toFixed(2) + "%"; }
function fmtTime(secs: number) {
  if (secs <= 0) return "00:00";
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function barPct(pA: number, pB: number) { return Math.min(Math.max(50 + (pA - pB) * 1.5, 5), 95); }
function initTimeLeft(b: Battle) {
  if (b.state === "ended") return 0;
  return Math.max(b.totalSecs - Math.floor(b.totalSecs * (0.1 + Math.random() * 0.6)), 120);
}

const DURATION_COLORS: Record<Duration, string> = { "1H": "#34d399", "3H": "#60a5fa", "12H": "#a78bfa", "24H": "#f59e0b", "7D": "#f87171" };

function BattleCard({ battle, live }: { battle: Battle; live: LiveData }) {
  const isLive = battle.state === "live";
  const bpct   = barPct(live.pctA, live.pctB);
  const aWins  = live.pctA >= live.pctB;
  const dColor = DURATION_COLORS[battle.duration];

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:translate-y-[-3px] hover:scale-[1.01]"
      style={{
        background: isLive ? "rgba(37,99,235,0.05)" : "rgba(255,255,255,0.025)",
        border: isLive ? "2px solid rgba(37,99,235,0.3)" : "1px solid rgba(255,255,255,0.07)",
        boxShadow: isLive ? "0 0 20px rgba(37,99,235,0.08)" : "none",
      }}>
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-orbitron tracking-widest px-2.5 py-1 rounded-full font-bold"
          style={{ background: `${dColor}15`, border: `1px solid ${dColor}35`, color: dColor }}>
          {battle.duration}
        </span>
        {isLive ? (
          <span className="flex items-center gap-1.5 text-xs font-orbitron tracking-widest px-3 py-1 rounded-full font-bold"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}>
            <span className="text-sm animate-pulse">🔥</span> LIVE
          </span>
        ) : (
          <span className="text-xs font-orbitron tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#4b5563" }}>
            ENDED
          </span>
        )}
      </div>

      {/* Coins VS */}
      <div className="flex items-center gap-3">
        <div className="flex-1 text-center">
          <div className="w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl"
            style={{ background: "rgba(37,99,235,0.12)", border: aWins && !isLive ? "2px solid rgba(52,211,153,0.5)" : "1px solid rgba(37,99,235,0.25)" }}>
            {battle.coinA.icon}
          </div>
          <div className="font-orbitron font-black text-xs text-white tracking-widest truncate">{battle.coinA.ticker}</div>
          <div className="text-gray-600 text-xs truncate mt-0.5" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px" }}>{battle.coinA.name}</div>
          <div className="text-sm font-bold flex items-center justify-center gap-0.5 mt-1.5"
            style={{ color: live.pctA >= 0 ? "#34d399" : "#f87171", fontFamily: "Inter, sans-serif", transition: "color 0.3s" }}>
            {live.pctA >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {fmtPct(live.pctA)}
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-orbitron text-white text-xs font-black"
            style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 0 12px rgba(124,58,237,0.5)" }}>
            VS
          </div>
          {isLive && (
            <span className="text-xs font-orbitron" style={{ color: aWins ? "#34d399" : "#f87171", fontSize: "9px" }}>
              {aWins ? "↑" : "↓"}
            </span>
          )}
        </div>

        <div className="flex-1 text-center">
          <div className="w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl"
            style={{ background: "rgba(124,58,237,0.12)", border: !aWins && !isLive ? "2px solid rgba(52,211,153,0.5)" : "1px solid rgba(124,58,237,0.25)" }}>
            {battle.coinB.icon}
          </div>
          <div className="font-orbitron font-black text-xs text-white tracking-widest truncate">{battle.coinB.ticker}</div>
          <div className="text-gray-600 text-xs truncate mt-0.5" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px" }}>{battle.coinB.name}</div>
          <div className="text-sm font-bold flex items-center justify-center gap-0.5 mt-1.5"
            style={{ color: live.pctB >= 0 ? "#34d399" : "#f87171", fontFamily: "Inter, sans-serif", transition: "color 0.3s" }}>
            {live.pctB >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {fmtPct(live.pctB)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full flex transition-all duration-700">
            <div className="rounded-l-full" style={{ width: `${bpct}%`, background: "linear-gradient(90deg,#2563eb,#3b82f6)" }} />
            <div className="rounded-r-full" style={{ width: `${100-bpct}%`, background: "linear-gradient(90deg,#6d28d9,#7c3aed)" }} />
          </div>
        </div>
        <div className="flex justify-between text-xs font-orbitron mt-1">
          <span style={{ color: "#60a5fa" }}>{bpct.toFixed(0)}%</span>
          <span style={{ color: "#a78bfa" }}>{(100 - bpct).toFixed(0)}%</span>
        </div>
      </div>

      {/* Footer */}
      {isLive ? (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6b7280", fontFamily: "Inter, sans-serif" }}>
            <Clock className="w-3.5 h-3.5" />
            <span className="font-orbitron tracking-widest tabular-nums"
              style={{ color: live.timeLeft < 300 ? "#f87171" : "#9ca3af" }}>
              {fmtTime(live.timeLeft)}
            </span>
          </div>
          <button className="btn-meme px-4 py-2 rounded-lg text-xs flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", fontSize: "11px" }}>
            ⚔️ JOIN BATTLE
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="text-xs" style={{ color: "#374151", fontFamily: "Inter, sans-serif" }}>
            Ended {Math.round(battle.endedSecsAgo / 3600)}h ago
          </div>
          <div className="flex items-center gap-1.5 text-xs font-orbitron tracking-widest px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#374151" }}>
            <span style={{ color: battle.winnerSide === "A" ? "#60a5fa" : "#a78bfa" }}>
              {battle.winnerSide === "A" ? battle.coinA.ticker : battle.coinB.ticker}
            </span>
            <span style={{ color: "#4b5563" }}>WON 🏆</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Battles() {
  usePageMeta({
    title: "Battle Arena — Live Memecoin Battles | VeloxFi",
    description: "Watch and join real-time memecoin price battles on Solana. The coin with the highest % price surge wins. Powered by $BATTLE token.",
    canonical: "https://veloxfi.io/#/battles",
  });
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<FilterTab>("ALL");

  const [liveData, setLiveData] = useState<Record<number, LiveData>>(() => {
    const map: Record<number, LiveData> = {};
    SEED_BATTLES.forEach((b) => { map[b.id] = { pctA: b.startPctA, pctB: b.startPctB, timeLeft: initTimeLeft(b) }; });
    return map;
  });

  const tickRef = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      setLiveData((prev) => {
        const next = { ...prev };
        SEED_BATTLES.forEach((b) => {
          if (b.state !== "live") return;
          const cur = next[b.id];
          next[b.id] = {
            pctA: parseFloat((cur.pctA + (Math.random() - 0.47) * 1.4).toFixed(2)),
            pctB: parseFloat((cur.pctB + (Math.random() - 0.53) * 1.4).toFixed(2)),
            timeLeft: Math.max(0, cur.timeLeft - 1),
          };
        });
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const visible = SEED_BATTLES.filter((b) => {
    if (filter === "LIVE")  return b.state === "live";
    if (filter === "ENDED") return b.state === "ended";
    if (filter === "HOT")   return b.hot;
    return true;
  });

  const liveCt     = SEED_BATTLES.filter((b) => b.state === "live").length;
  const featuredId = SEED_BATTLES.find((b) => b.hot && b.state === "live")?.id ?? null;

  return (
    <div className="app-shell"><Sidebar /><main style={{ minWidth: 0, background: "#FFFBF0" }}>
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-20">

        {/* ── HEADER ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-orbitron tracking-widest"
            style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.35)", color: "#60a5fa" }}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {liveCt} BATTLES LIVE NOW
          </div>
          <h1 className="font-orbitron font-black text-5xl md:text-6xl text-white leading-tight mb-3 meme-title">
            ⚔️ BATTLE{" "}
            <span style={{ background: "linear-gradient(135deg,#60a5fa,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              ARENA
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Real-time memecoin combat on Solana 🔥</p>
        </div>

        {/* ── FEATURED BATTLE ── */}
        {featuredId && liveData[featuredId] && (() => {
          const b = SEED_BATTLES.find(x => x.id === featuredId)!;
          const live = liveData[featuredId];
          const bpct = barPct(live.pctA, live.pctB);
          return (
            <div className="rounded-3xl p-6 mb-10 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.12),rgba(124,58,237,0.12))", border: "2px solid rgba(124,58,237,0.35)", boxShadow: "0 0 40px rgba(37,99,235,0.15)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(37,99,235,0.08) 0%,transparent 70%)" }} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🔥</span>
                  <span className="font-orbitron font-black text-lg tracking-wider"
                    style={{ background: "linear-gradient(90deg,#f59e0b,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    FEATURED BATTLE — HOT RIGHT NOW
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-orbitron tracking-widest px-3 py-1 rounded-full animate-pulse"
                    style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.5)", color: "#f87171" }}>
                    🔥 LIVE
                  </span>
                </div>
                <div className="flex items-center justify-center gap-6 mb-5">
                  <div className="text-center">
                    <div className="text-5xl mb-2">{b.coinA.icon}</div>
                    <div className="font-orbitron font-black text-lg text-white">{b.coinA.ticker}</div>
                    <div className="text-xl font-bold mt-1" style={{ color: live.pctA >= 0 ? "#34d399" : "#f87171", fontFamily: "Inter, sans-serif" }}>
                      {fmtPct(live.pctA)}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-orbitron text-white text-sm font-black"
                      style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 0 20px rgba(124,58,237,0.6)" }}>
                      ⚔️
                    </div>
                    <span className="font-orbitron text-gray-500 text-xs tracking-widest">VS</span>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl mb-2">{b.coinB.icon}</div>
                    <div className="font-orbitron font-black text-lg text-white">{b.coinB.ticker}</div>
                    <div className="text-xl font-bold mt-1" style={{ color: live.pctB >= 0 ? "#34d399" : "#f87171", fontFamily: "Inter, sans-serif" }}>
                      {fmtPct(live.pctB)}
                    </div>
                  </div>
                </div>
                <div className="h-3 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full flex transition-all duration-700">
                    <div style={{ width: `${bpct}%`, background: "linear-gradient(90deg,#2563eb,#3b82f6)" }} className="rounded-l-full" />
                    <div style={{ width: `${100-bpct}%`, background: "linear-gradient(90deg,#6d28d9,#7c3aed)" }} className="rounded-r-full" />
                  </div>
                </div>
                <div className="flex justify-center">
                  <button className="btn-meme px-10 py-4 rounded-2xl text-base"
                    style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
                    ⚔️ JOIN THIS BATTLE NOW
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── STATS STRIP ── */}
        <div className="flex items-center flex-wrap gap-6 p-4 rounded-2xl mb-6"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            { label: "🔥 LIVE BATTLES",  value: String(liveCt),             color: "#f87171" },
            { label: "⚔️ TOTAL BATTLES", value: String(SEED_BATTLES.length), color: "#60a5fa" },
            { label: "💰 BATTLE VOLUME",  value: "—",                        color: "#a78bfa" },
            { label: "🏆 PRIZE POOL",     value: "—",                        color: "#f59e0b" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-black tabular-nums" style={{ fontFamily: "Inter, sans-serif", color }}>{value}</div>
              <div className="text-xs font-orbitron tracking-widest text-gray-700 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* ── FILTER TABS ── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-gray-600" />
          {(["ALL", "LIVE", "ENDED", "HOT"] as FilterTab[]).map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className="px-4 py-2 rounded-xl text-xs font-orbitron tracking-wider transition-all duration-200"
              style={{
                background: filter === tab ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "rgba(255,255,255,0.04)",
                border: filter === tab ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
                color: filter === tab ? "white" : "#6b7280",
                cursor: "pointer",
              }}>
              {tab === "HOT" ? <span className="flex items-center gap-1"><Flame className="w-3 h-3" style={{ color: filter === "HOT" ? "white" : "#f97316" }} />HOT 🔥</span> : tab}
              {tab === "LIVE" && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs tabular-nums"
                  style={{ background: filter === "LIVE" ? "rgba(255,255,255,0.2)" : "rgba(248,113,113,0.15)", color: filter === "LIVE" ? "white" : "#f87171", fontSize: "10px" }}>
                  {liveCt}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── BATTLE GRID ── */}
        {visible.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-4">⚔️</div>
            <p className="font-orbitron text-gray-700 tracking-widest text-sm">NO BATTLES IN THIS FILTER</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visible.map((b) => <BattleCard key={b.id} battle={b} live={liveData[b.id]} />)}
          </div>
        )}

        {/* ── BOTTOM CTA ── */}
        <div className="mt-12 rounded-3xl p-10 text-center"
          style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.1),rgba(124,58,237,0.1))", border: "2px solid rgba(124,58,237,0.25)" }}>
          <div className="text-4xl mb-3">🐺</div>
          <h3 className="font-orbitron font-black text-2xl text-white mb-2">WANT YOUR OWN BATTLE?</h3>
          <p className="text-gray-500 text-sm mb-6">Try the demo — no wallet needed. Real battles launch at presale.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => navigate("/demo")} className="btn-meme px-8 py-4 rounded-2xl text-sm"
              style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
              🎮 TRY DEMO BATTLE
            </button>
            <button onClick={() => navigate("/presale")} className="btn-meme px-8 py-4 rounded-2xl text-sm"
              style={{ background: "linear-gradient(135deg,#4ade80,#16a34a)", boxShadow: "0 0 20px rgba(74,222,128,0.3)" }}>
              🔥 JOIN PRESALE NOW
            </button>
          </div>
        </div>
      </div>
    </main></div>
  );
}
