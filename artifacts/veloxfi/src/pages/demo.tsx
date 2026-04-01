import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Swords, TrendingUp, TrendingDown, Clock, Trophy, RotateCcw, Zap } from "lucide-react";
import confetti from "canvas-confetti";

const OPPONENTS = [
  { ticker: "PEPE", icon: "🐸" },
  { ticker: "DOGE", icon: "🐕" },
  { ticker: "BONK", icon: "🔨" },
  { ticker: "WIF", icon: "🎩" },
  { ticker: "BOME", icon: "💣" },
  { ticker: "POPCAT", icon: "😺" },
];

const BATTLE_SECS = 5 * 60;

function pct(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

export default function Demo() {
  const [, navigate] = useLocation();

  /* ── phases ── */
  const [phase, setPhase] = useState<"form" | "battle" | "result">("form");

  /* ── form state ── */
  const [coinName, setCoinName] = useState("");
  const [ticker, setTicker] = useState("");

  /* ── battle state ── */
  const [opp, setOpp] = useState(OPPONENTS[0]);
  const [timeLeft, setTimeLeft] = useState(BATTLE_SECS);
  const [userPct, setUserPct] = useState(0);
  const [oppPct, setOppPct] = useState(0);
  const [winner, setWinner] = useState<"user" | "opp" | null>(null);

  const tickRef = useRef(0);
  const userPctRef = useRef(0);
  const oppPctRef = useRef(0);

  /* keep refs in sync */
  useEffect(() => { userPctRef.current = userPct; }, [userPct]);
  useEffect(() => { oppPctRef.current = oppPct; }, [oppPct]);

  /* ── start battle ── */
  function startBattle() {
    if (!coinName.trim() || !ticker.trim()) return;
    const chosen = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
    setOpp(chosen);
    setTimeLeft(BATTLE_SECS);
    setUserPct(0);
    setOppPct(0);
    userPctRef.current = 0;
    oppPctRef.current = 0;
    tickRef.current = 0;
    setWinner(null);
    setPhase("battle");
    /* track demo coins created */
    const prev = parseInt(localStorage.getItem("vfx_demo_coins") ?? "0", 10) || 0;
    localStorage.setItem("vfx_demo_coins", String(prev + 1));
  }

  /* ── price simulation ── */
  useEffect(() => {
    if (phase !== "battle") return;
    const interval = setInterval(() => {
      setUserPct(prev => parseFloat((prev + (Math.random() - 0.47) * 2).toFixed(2)));
      setOppPct(prev => parseFloat((prev + (Math.random() - 0.53) * 2).toFixed(2)));
    }, 1500);
    return () => clearInterval(interval);
  }, [phase]);

  /* ── countdown ── */
  useEffect(() => {
    if (phase !== "battle") return;
    if (timeLeft <= 0) {
      const w = userPctRef.current >= oppPctRef.current ? "user" : "opp";
      setWinner(w);
      setPhase("result");
      /* track demo battles completed */
      const prevB = parseInt(localStorage.getItem("vfx_demo_battles") ?? "0", 10) || 0;
      localStorage.setItem("vfx_demo_battles", String(prevB + 1));
      if (w === "user") {
        setTimeout(() => {
          confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
          setTimeout(() => confetti({ particleCount: 100, spread: 80, angle: 60, origin: { x: 0 } }), 300);
          setTimeout(() => confetti({ particleCount: 100, spread: 80, angle: 120, origin: { x: 1 } }), 500);
        }, 100);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  /* ── derived ── */
  const userTicker = ticker.toUpperCase() || "COIN";
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");
  const urgentTime = timeLeft < 60;
  const timerColor = urgentTime ? "#f87171" : "#60a5fa";
  const progressPct = Math.round((BATTLE_SECS - timeLeft) / BATTLE_SECS * 100);

  const battlepct = (() => {
    const spread = userPct - oppPct;
    return Math.min(Math.max(50 + spread * 2, 5), 95);
  })();

  return (
    <div style={{ backgroundColor: "#05080f", minHeight: "100vh", color: "white" }}>
      {/* scanline */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(37,99,235,0.015) 2px,rgba(37,99,235,0.015) 4px)" }} />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg"
        style={{ backgroundColor: "rgba(5,8,15,0.92)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5"
            style={{ background: "none", border: "none", cursor: "pointer" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
              <Swords className="w-5 h-5 text-white" />
            </div>
            <span className="font-orbitron font-black text-lg tracking-wider"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              VELOXFI
            </span>
            <span className="text-lg">🐺</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-orbitron tracking-widest px-3 py-1 rounded-full hidden sm:inline-flex"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}>
              DEMO MODE
            </span>
            <button onClick={() => navigate("/")}
              className="btn-outline px-4 py-2 rounded-lg text-xs font-orbitron tracking-wider">
              ← HOME
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-28 pb-20">

        {/* HEADER — always visible */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-orbitron tracking-widest"
            style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)", color: "#60a5fa" }}>
            <Zap className="w-3 h-3" />
            NO WALLET NEEDED
          </div>
          <h1 className="font-orbitron font-black text-4xl md:text-5xl text-white mb-3 leading-tight">
            TRY VELOXFI{" "}
            <span style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              FOR FREE
            </span>
          </h1>
          <p className="text-gray-400 text-base">
            No wallet needed — experience a battle with demo tokens
          </p>
        </div>

        {/* ═══ PHASE 1: FORM ═══ */}
        {phase === "form" && (
          <div className="rounded-2xl p-8"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="font-orbitron font-bold text-xl text-white mb-1">
              STEP 1 — CREATE YOUR COIN
            </h2>
            <p className="text-gray-500 text-sm mb-7">
              Name your coin, pick a ticker, and throw it into battle
            </p>

            <div className="space-y-5 mb-7">
              {/* Coin name */}
              <div>
                <label className="block text-xs font-orbitron tracking-widest text-gray-400 mb-2">
                  COIN NAME
                </label>
                <input
                  type="text"
                  value={coinName}
                  onChange={e => setCoinName(e.target.value)}
                  placeholder="e.g. BATTLE WOLF"
                  maxLength={32}
                  className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontFamily: "Inter, sans-serif",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "rgba(37,99,235,0.6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              {/* Ticker */}
              <div>
                <label className="block text-xs font-orbitron tracking-widest text-gray-400 mb-2">
                  TICKER <span className="text-gray-600">(MAX 6 CHARS)</span>
                </label>
                <input
                  type="text"
                  value={ticker}
                  onChange={e => setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                  placeholder="BWOLF"
                  maxLength={6}
                  className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none font-orbitron tracking-widest"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "rgba(37,99,235,0.6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <p className="text-gray-700 text-xs font-orbitron mt-1.5 tracking-widest">
                  {ticker.length}/6
                </p>
              </div>
            </div>

            <button
              onClick={startBattle}
              disabled={!coinName.trim() || !ticker.trim()}
              className="w-full btn-primary py-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="font-orbitron tracking-wider flex items-center justify-center gap-2 text-sm">
                <Swords className="w-4 h-4" />
                CREATE MY COIN &amp; START BATTLE
              </span>
            </button>

            {/* Info strip */}
            <div className="mt-6 pt-5 flex justify-around text-center"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {[["5 MINS", "DURATION"], ["FREE", "DEMO TOKENS"], ["NONE", "WALLET"]].map(([v, l]) => (
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

            {/* Timer card */}
            <div className="rounded-2xl p-5 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-4 h-4" style={{ color: timerColor }} />
                <span className="font-orbitron text-4xl font-black tabular-nums"
                  style={{ color: timerColor, fontFamily: "Inter, sans-serif" }}>
                  {mins}:{secs}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden mx-auto max-w-xs"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${progressPct}%`,
                    background: urgentTime
                      ? "linear-gradient(90deg, #ef4444, #f87171)"
                      : "linear-gradient(90deg, #2563eb, #7c3aed)",
                  }} />
              </div>
              <p className="text-xs font-orbitron text-gray-600 tracking-widest mt-2">
                {urgentTime ? "FINAL COUNTDOWN" : "TIME REMAINING"}
              </p>
            </div>

            {/* VS card */}
            <div className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>

              {/* Coins row */}
              <div className="flex items-center gap-4 mb-5">
                {/* Your coin */}
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
                    style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.35)" }}>
                    ⚔️
                  </div>
                  <div className="font-orbitron font-black text-base text-white tracking-widest mb-0.5">
                    {userTicker}
                  </div>
                  <div className="text-gray-600 text-xs mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                    {coinName}
                  </div>
                  <div
                    className="text-xl font-bold flex items-center justify-center gap-1"
                    style={{ color: userPct >= 0 ? "#34d399" : "#f87171", fontFamily: "Inter, sans-serif", transition: "color 0.3s" }}
                  >
                    {userPct >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {pct(userPct)}
                  </div>
                </div>

                {/* VS bubble */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                    <span className="font-orbitron text-white text-xs font-black">VS</span>
                  </div>
                  <span className="text-xs font-orbitron tracking-widest"
                    style={{ color: userPct > oppPct ? "#34d399" : "#f87171" }}>
                    {userPct > oppPct ? "WINNING" : "LOSING"}
                  </span>
                </div>

                {/* Opponent */}
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
                    style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)" }}>
                    {opp.icon}
                  </div>
                  <div className="font-orbitron font-black text-base text-white tracking-widest mb-0.5">
                    {opp.ticker}
                  </div>
                  <div className="text-gray-600 text-xs mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                    {opp.ticker}
                  </div>
                  <div
                    className="text-xl font-bold flex items-center justify-center gap-1"
                    style={{ color: oppPct >= 0 ? "#34d399" : "#f87171", fontFamily: "Inter, sans-serif", transition: "color 0.3s" }}
                  >
                    {oppPct >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {pct(oppPct)}
                  </div>
                </div>
              </div>

              {/* Battle progress bar */}
              <div>
                <div className="h-3 rounded-full overflow-hidden mb-2"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full flex transition-all duration-700">
                    <div className="rounded-l-full"
                      style={{ width: `${battlepct}%`, background: "linear-gradient(90deg, #2563eb, #3b82f6)" }} />
                    <div className="rounded-r-full"
                      style={{ width: `${100 - battlepct}%`, background: "linear-gradient(90deg, #6d28d9, #7c3aed)" }} />
                  </div>
                </div>
                <div className="flex justify-between text-xs font-orbitron">
                  <span style={{ color: "#60a5fa" }}>{userTicker} {battlepct.toFixed(0)}%</span>
                  <span style={{ color: "#a78bfa" }}>{100 - battlepct}% {opp.ticker}</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs font-orbitron text-gray-700 tracking-widest">
              PRICES UPDATING LIVE — HIGHEST % GAIN WINS
            </p>
          </div>
        )}

        {/* ═══ PHASE 3: RESULT ═══ */}
        {phase === "result" && winner && (
          <div className="space-y-5">
            {/* Winner banner */}
            <div className="rounded-2xl p-10 text-center relative overflow-hidden"
              style={{
                background: winner === "user"
                  ? "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(16,185,129,0.04))"
                  : "linear-gradient(135deg, rgba(248,113,113,0.08), rgba(239,68,68,0.04))",
                border: winner === "user"
                  ? "1px solid rgba(52,211,153,0.3)"
                  : "1px solid rgba(248,113,113,0.3)",
              }}>

              <div className="text-6xl mb-4 animate-bounce">
                {winner === "user" ? "🏆" : "💀"}
              </div>

              <div className="font-orbitron font-black text-4xl mb-3"
                style={{ color: winner === "user" ? "#34d399" : "#f87171" }}>
                {winner === "user" ? "VICTORY!" : "DEFEATED"}
              </div>

              <p className="text-gray-400 text-sm mb-6">
                {winner === "user"
                  ? `${userTicker} crushed ${opp.ticker} with ${pct(userPct)} vs ${pct(oppPct)}`
                  : `${opp.ticker} dominated with ${pct(oppPct)} vs your ${pct(userPct)}`}
              </p>

              {/* Score comparison */}
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
                  style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" }}>
                  <Trophy className="w-3.5 h-3.5" />
                  IN REAL BATTLES YOU'D EARN 30% OF LOSER TOKENS
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setCoinName(""); setTicker(""); setPhase("form"); }}
                className="btn-outline py-4 rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="font-orbitron tracking-wider text-sm">TRY AGAIN</span>
              </button>

              <button
                onClick={() => navigate("/presale")}
                className="btn-primary py-4 rounded-xl flex items-center justify-center gap-2"
              >
                <span className="font-orbitron tracking-wider text-sm">JOIN THE REAL BATTLE →</span>
              </button>
            </div>

            {/* Presale info */}
            <div className="rounded-xl p-5 text-center"
              style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))", border: "1px solid rgba(124,58,237,0.1)" }}>
              <p className="text-gray-400 text-sm mb-2">
                Be one of the first 100 warriors. Join the presale and claim your OG badge.
              </p>
              <div className="flex items-center justify-center gap-4 text-xs font-orbitron text-gray-700 tracking-widest flex-wrap">
                <span>$BATTLE TOKEN</span>
                <span>·</span>
                <span>PRESALE COMING SOON</span>
                <span>·</span>
                <span>BUILT ON SOLANA</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
