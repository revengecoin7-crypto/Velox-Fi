import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { TrendingUp, TrendingDown, Clock, Trophy, RotateCcw, Zap } from "lucide-react";
import confetti from "canvas-confetti";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Sidebar } from "@/components/Sidebar";

const OPPONENTS = [
  { ticker: "PEPE",   icon: "🐸" },
  { ticker: "DOGE",   icon: "🐕" },
  { ticker: "BONK",   icon: "🔨" },
  { ticker: "WIF",    icon: "🎩" },
  { ticker: "BOME",   icon: "💣" },
  { ticker: "POPCAT", icon: "😺" },
];

const BATTLE_SECS = 5 * 60;

function pct(n: number) { return (n >= 0 ? "+" : "") + n.toFixed(2) + "%"; }

export default function Demo() {
  usePageMeta({
    title: "Demo — Try a Mock Battle | VeloxFi",
    description: "Try the VeloxFi memecoin battle arena with a free demo. No wallet needed. See how price surge battles work on Solana.",
    canonical: "https://veloxfi.io/#/demo",
  });
  const [, navigate] = useLocation();

  const [phase, setPhase]     = useState<"form" | "battle" | "result">("form");
  const [coinName, setCoinName] = useState("");
  const [ticker, setTicker]   = useState("");
  const [opp, setOpp]         = useState(OPPONENTS[0]);
  const [timeLeft, setTimeLeft] = useState(BATTLE_SECS);
  const [userPct, setUserPct] = useState(0);
  const [oppPct, setOppPct]   = useState(0);
  const [winner, setWinner]   = useState<"user" | "opp" | null>(null);

  const tickRef    = useRef(0);
  const userPctRef = useRef(0);
  const oppPctRef  = useRef(0);

  useEffect(() => { userPctRef.current = userPct; }, [userPct]);
  useEffect(() => { oppPctRef.current  = oppPct;  }, [oppPct]);

  function startBattle() {
    if (!coinName.trim() || !ticker.trim()) return;
    const chosen = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
    setOpp(chosen); setTimeLeft(BATTLE_SECS); setUserPct(0); setOppPct(0);
    userPctRef.current = 0; oppPctRef.current = 0; tickRef.current = 0;
    setWinner(null); setPhase("battle");
    fetch("/api/stats/demo-coin", { method: "POST" }).catch(() => {});
  }

  useEffect(() => {
    if (phase !== "battle") return;
    const interval = setInterval(() => {
      setUserPct(prev => parseFloat((prev + (Math.random() - 0.47) * 2).toFixed(2)));
      setOppPct(prev  => parseFloat((prev + (Math.random() - 0.53) * 2).toFixed(2)));
    }, 1500);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "battle") return;
    if (timeLeft <= 0) {
      const w = userPctRef.current >= oppPctRef.current ? "user" : "opp";
      setWinner(w); setPhase("result");
      fetch("/api/stats/demo-battle", { method: "POST" }).catch(() => {});
      if (w === "user") {
        setTimeout(() => {
          confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
          setTimeout(() => confetti({ particleCount: 100, spread: 80, angle:  60, origin: { x: 0 } }), 300);
          setTimeout(() => confetti({ particleCount: 100, spread: 80, angle: 120, origin: { x: 1 } }), 500);
        }, 100);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  const userTicker  = ticker.toUpperCase() || "COIN";
  const mins        = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs        = (timeLeft % 60).toString().padStart(2, "0");
  const urgentTime  = timeLeft < 60;
  const timerColor  = urgentTime ? "#f87171" : "#60a5fa";
  const progressPct = Math.round((BATTLE_SECS - timeLeft) / BATTLE_SECS * 100);
  const battlepct   = Math.min(Math.max(50 + (userPct - oppPct) * 2, 5), 95);

  return (
    <div className="app-shell"><Sidebar /><main style={{ minWidth: 0, background: "#FFFBF0" }}>
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-20">

        {/* ── HEADER ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-orbitron tracking-widest"
            style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.4)", color: "#4ade80" }}>
            <Zap className="w-3.5 h-3.5" /> NO WALLET NEEDED — 100% FREE
          </div>
          <h1 className="font-orbitron font-black text-5xl md:text-6xl text-white mb-3 leading-tight meme-title">
            ⚔️ TRY{" "}
            <span style={{ background: "linear-gradient(135deg,#60a5fa,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              FOR FREE
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Experience a memecoin battle with zero risk 🐺</p>
        </div>

        {/* ═══ PHASE 1: FORM ═══ */}
        {phase === "form" && (
          <div className="rounded-3xl p-8"
            style={{ background: "rgba(37,99,235,0.05)", border: "2px solid rgba(37,99,235,0.25)", boxShadow: "0 0 30px rgba(37,99,235,0.08)" }}>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🪙</div>
              <h2 className="font-orbitron font-black text-2xl text-white mb-1">CREATE YOUR COIN</h2>
              <p className="text-gray-500 text-sm">Name it, ticker it, throw it in the arena!</p>
            </div>

            <div className="space-y-5 mb-7">
              <div>
                <label className="block text-xs font-orbitron tracking-widest mb-2" style={{ color: "#60a5fa" }}>
                  💡 COIN NAME
                </label>
                <input type="text" value={coinName} onChange={e => setCoinName(e.target.value)}
                  placeholder="e.g. BATTLE WOLF" maxLength={32}
                  className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "2px solid rgba(37,99,235,0.25)", fontFamily: "Inter, sans-serif", transition: "border-color 0.2s" }}
                  onFocus={e => (e.target.style.borderColor = "#2563eb")}
                  onBlur={e  => (e.target.style.borderColor = "rgba(37,99,235,0.25)")} />
              </div>
              <div>
                <label className="block text-xs font-orbitron tracking-widest mb-2" style={{ color: "#a78bfa" }}>
                  ⚡ TICKER <span className="text-gray-600">(MAX 6 CHARS)</span>
                </label>
                <input type="text" value={ticker}
                  onChange={e => setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                  placeholder="BWOLF" maxLength={6}
                  className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none font-orbitron tracking-widest"
                  style={{ background: "rgba(255,255,255,0.05)", border: "2px solid rgba(124,58,237,0.25)", transition: "border-color 0.2s" }}
                  onFocus={e => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={e  => (e.target.style.borderColor = "rgba(124,58,237,0.25)")} />
                <p className="text-gray-700 text-xs font-orbitron mt-1.5 tracking-widest">{ticker.length}/6</p>
              </div>
            </div>

            <button onClick={startBattle} disabled={!coinName.trim() || !ticker.trim()}
              className="w-full btn-meme py-5 rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
              ⚔️ START THE BATTLE!
            </button>

            <div className="mt-6 pt-5 flex justify-around text-center"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              {[["⏱️ 5 MINS", "DURATION"], ["💸 FREE", "DEMO TOKENS"], ["🚫 NONE", "WALLET NEEDED"]].map(([v, l]) => (
                <div key={l}>
                  <div className="font-orbitron font-bold text-sm text-white">{v}</div>
                  <div className="text-gray-600 text-xs font-orbitron tracking-widest mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ PHASE 2: BATTLE ═══ */}
        {phase === "battle" && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "2px solid rgba(37,99,235,0.25)", boxShadow: urgentTime ? "0 0 20px rgba(248,113,113,0.2)" : "none" }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-4 h-4" style={{ color: timerColor }} />
                <span className="font-orbitron text-4xl font-black tabular-nums"
                  style={{ color: timerColor, fontFamily: "Inter, sans-serif" }}>
                  {mins}:{secs}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mx-auto max-w-xs" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPct}%`, background: urgentTime ? "linear-gradient(90deg,#ef4444,#f87171)" : "linear-gradient(90deg,#2563eb,#7c3aed)" }} />
              </div>
              <p className="text-xs font-orbitron text-gray-600 tracking-widest mt-2">
                {urgentTime ? "🔥 FINAL COUNTDOWN 🔥" : "⏱️ TIME REMAINING"}
              </p>
            </div>

            <div className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "2px solid rgba(124,58,237,0.25)" }}>
              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
                    style={{ background: "rgba(37,99,235,0.15)", border: "2px solid rgba(37,99,235,0.4)" }}>⚔️</div>
                  <div className="font-orbitron font-black text-base text-white tracking-widest mb-0.5">{userTicker}</div>
                  <div className="text-gray-600 text-xs mb-2" style={{ fontFamily: "Inter, sans-serif" }}>{coinName}</div>
                  <div className="text-xl font-bold flex items-center justify-center gap-1"
                    style={{ color: userPct >= 0 ? "#34d399" : "#f87171", fontFamily: "Inter, sans-serif", transition: "color 0.3s" }}>
                    {userPct >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {pct(userPct)}
                  </div>
                </div>

                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-orbitron text-white text-xs font-black"
                    style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 0 15px rgba(124,58,237,0.5)" }}>VS</div>
                  <span className="text-xs font-orbitron tracking-widest"
                    style={{ color: userPct > oppPct ? "#34d399" : "#f87171" }}>
                    {userPct > oppPct ? "🏆 WINNING" : "💀 LOSING"}
                  </span>
                </div>

                <div className="flex-1 text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
                    style={{ background: "rgba(124,58,237,0.15)", border: "2px solid rgba(124,58,237,0.4)" }}>{opp.icon}</div>
                  <div className="font-orbitron font-black text-base text-white tracking-widest mb-0.5">{opp.ticker}</div>
                  <div className="text-gray-600 text-xs mb-2" style={{ fontFamily: "Inter, sans-serif" }}>{opp.ticker}</div>
                  <div className="text-xl font-bold flex items-center justify-center gap-1"
                    style={{ color: oppPct >= 0 ? "#34d399" : "#f87171", fontFamily: "Inter, sans-serif", transition: "color 0.3s" }}>
                    {oppPct >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {pct(oppPct)}
                  </div>
                </div>
              </div>

              <div>
                <div className="h-4 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full flex transition-all duration-700">
                    <div className="rounded-l-full" style={{ width: `${battlepct}%`, background: "linear-gradient(90deg,#2563eb,#3b82f6)" }} />
                    <div className="rounded-r-full" style={{ width: `${100-battlepct}%`, background: "linear-gradient(90deg,#6d28d9,#7c3aed)" }} />
                  </div>
                </div>
                <div className="flex justify-between text-xs font-orbitron">
                  <span style={{ color: "#60a5fa" }}>{userTicker} {battlepct.toFixed(0)}%</span>
                  <span style={{ color: "#a78bfa" }}>{100 - battlepct}% {opp.ticker}</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs font-orbitron text-gray-700 tracking-widest">
              🔥 PRICES UPDATING LIVE — HIGHEST % GAIN WINS 🔥
            </p>
          </div>
        )}

        {/* ═══ PHASE 3: RESULT ═══ */}
        {phase === "result" && winner && (
          <div className="space-y-5">
            <div className="rounded-3xl p-10 text-center relative overflow-hidden"
              style={{
                background: winner === "user" ? "linear-gradient(135deg,rgba(52,211,153,0.1),rgba(16,185,129,0.05))" : "linear-gradient(135deg,rgba(248,113,113,0.1),rgba(239,68,68,0.05))",
                border: winner === "user" ? "2px solid rgba(52,211,153,0.4)" : "2px solid rgba(248,113,113,0.4)",
                boxShadow: winner === "user" ? "0 0 40px rgba(52,211,153,0.15)" : "0 0 40px rgba(248,113,113,0.15)",
              }}>
              <div className="text-7xl mb-4" style={{ animation: "bounce 1s infinite" }}>
                {winner === "user" ? "🏆" : "💀"}
              </div>
              <div className="font-orbitron font-black text-5xl mb-3"
                style={{ color: winner === "user" ? "#34d399" : "#f87171" }}>
                {winner === "user" ? "VICTORY! 🎉" : "DEFEATED 💀"}
              </div>
              <p className="text-gray-400 text-sm mb-6">
                {winner === "user"
                  ? `${userTicker} CRUSHED ${opp.ticker} with ${pct(userPct)} vs ${pct(oppPct)} 🔥`
                  : `${opp.ticker} dominated with ${pct(oppPct)} vs your ${pct(userPct)} 💀`}
              </p>
              <div className="flex items-center justify-center gap-10 mb-6">
                <div className="text-center">
                  <div className="font-orbitron font-black text-2xl mb-1"
                    style={{ color: winner === "user" ? "#34d399" : "#f87171", fontFamily: "Inter, sans-serif" }}>
                    {pct(userPct)}
                  </div>
                  <div className="text-xs font-orbitron text-gray-600 tracking-widest">{userTicker}</div>
                </div>
                <div className="font-orbitron text-gray-700 font-black text-xl">VS</div>
                <div className="text-center">
                  <div className="font-orbitron font-black text-2xl mb-1"
                    style={{ color: winner === "opp" ? "#34d399" : "#f87171", fontFamily: "Inter, sans-serif" }}>
                    {pct(oppPct)}
                  </div>
                  <div className="text-xs font-orbitron text-gray-600 tracking-widest">{opp.ticker}</div>
                </div>
              </div>
              {winner === "user" && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-orbitron tracking-widest"
                  style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399" }}>
                  <Trophy className="w-3.5 h-3.5" />
                  IN REAL BATTLES YOU'D EARN 30% OF LOSER TOKENS 💰
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setCoinName(""); setTicker(""); setPhase("form"); }}
                className="py-4 rounded-2xl flex items-center justify-center gap-2 font-orbitron font-bold text-sm tracking-wider transition-all hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#9ca3af", cursor: "pointer" }}>
                <RotateCcw className="w-4 h-4" /> TRY AGAIN
              </button>
              <button onClick={() => navigate("/presale")} className="btn-meme py-4 rounded-2xl flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#4ade80,#16a34a)" }}>
                🔥 JOIN THE REAL BATTLE →
              </button>
            </div>

            <div className="rounded-2xl p-6 text-center"
              style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.08),rgba(124,58,237,0.08))", border: "2px solid rgba(124,58,237,0.2)" }}>
              <div className="text-3xl mb-2">🐺</div>
              <p className="text-gray-400 text-sm mb-3">Be one of the first 100 warriors. Join the presale and claim your OG badge.</p>
              <button onClick={() => navigate("/presale")} className="btn-meme px-8 py-3 rounded-xl text-sm"
                style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
                🚀 BUY $BATTLE NOW
              </button>
            </div>
          </div>
        )}
      </div>
    </main></div>
  );
}
