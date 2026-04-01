import { useState, useEffect, useRef, useCallback } from "react";
import { Trophy, Zap, Swords, TrendingUp, TrendingDown, Clock, ArrowRight, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const OPPONENTS = [
  { name: "PEPE", ticker: "PEPE", icon: "🐸" },
  { name: "DOGE", ticker: "DOGE", icon: "🐕" },
  { name: "BONK", ticker: "BONK", icon: "🔨" },
  { name: "WIF", ticker: "WIF", icon: "🎩" },
  { name: "BOME", ticker: "BOME", icon: "💣" },
  { name: "POPCAT", ticker: "POPCAT", icon: "😺" },
];

const BATTLE_DURATION = 5 * 60;

type ChartPoint = { t: number; user: number; opp: number };

function fmt(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

function CountdownDisplay({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  const pct = (seconds / BATTLE_DURATION) * 100;
  const urgent = seconds < 60;
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock className="w-4 h-4" style={{ color: urgent ? "#f87171" : "#60a5fa" }} />
        <span
          className="font-orbitron text-3xl font-black tabular-nums"
          style={{ color: urgent ? "#f87171" : "white" }}
        >
          {m}:{s}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mx-auto max-w-xs" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: urgent
              ? "linear-gradient(90deg, #ef4444, #f87171)"
              : "linear-gradient(90deg, #2563eb, #7c3aed)",
          }}
        />
      </div>
      <p className="text-gray-600 text-xs font-orbitron tracking-widest mt-2">TIME REMAINING</p>
    </div>
  );
}

function PriceChart({ data, userTicker, oppTicker }: { data: ChartPoint[]; userTicker: string; oppTicker: string }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <XAxis dataKey="t" hide />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fill: "#4b5563", fontSize: 10, fontFamily: "Inter" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => v.toFixed(1) + "%"}
        />
        <Tooltip
          contentStyle={{
            background: "#0d1117",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            fontSize: 11,
            fontFamily: "Inter",
          }}
          labelFormatter={() => ""}
          formatter={(val: number, name: string) => [fmt(val), name === "user" ? userTicker : oppTicker]}
        />
        <Line
          type="monotone"
          dataKey="user"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="opp"
          stroke="#a78bfa"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function Demo() {
  const [phase, setPhase] = useState<"form" | "battle" | "result">("form");
  const [coinName, setCoinName] = useState("");
  const [ticker, setTicker] = useState("");
  const [opponent, setOpponent] = useState(OPPONENTS[0]);
  const [timeLeft, setTimeLeft] = useState(BATTLE_DURATION);
  const [userPct, setUserPct] = useState(0);
  const [oppPct, setOppPct] = useState(0);
  const [chartData, setChartData] = useState<ChartPoint[]>([{ t: 0, user: 0, opp: 0 }]);
  const [winner, setWinner] = useState<"user" | "opp" | null>(null);
  const tickRef = useRef(0);

  const startBattle = () => {
    if (!coinName.trim() || !ticker.trim()) return;
    const opp = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
    setOpponent(opp);
    setTimeLeft(BATTLE_DURATION);
    setUserPct(0);
    setOppPct(0);
    setChartData([{ t: 0, user: 0, opp: 0 }]);
    tickRef.current = 0;
    setWinner(null);
    setPhase("battle");
  };

  const reset = () => {
    setCoinName("");
    setTicker("");
    setPhase("form");
  };

  useEffect(() => {
    if (phase !== "battle") return;

    const priceInterval = setInterval(() => {
      setUserPct((prev) => {
        const delta = (Math.random() - 0.46) * 2.5;
        return parseFloat((prev + delta).toFixed(3));
      });
      setOppPct((prev) => {
        const delta = (Math.random() - 0.54) * 2.5;
        return parseFloat((prev + delta).toFixed(3));
      });
      tickRef.current += 1;
    }, 1500);

    return () => clearInterval(priceInterval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "battle") return;
    setChartData((prev) => {
      const next = [...prev, { t: tickRef.current, user: userPct, opp: oppPct }];
      return next.length > 80 ? next.slice(-80) : next;
    });
  }, [userPct, oppPct, phase]);

  useEffect(() => {
    if (phase !== "battle") return;
    if (timeLeft <= 0) {
      setWinner(userPct >= oppPct ? "user" : "opp");
      setPhase("result");
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, userPct, oppPct]);

  const userTicker = ticker.toUpperCase() || "COIN";
  const userWon = winner === "user";

  return (
    <div style={{ backgroundColor: "#05080f", minHeight: "100vh", color: "white" }}>
      <div className="fixed inset-0 scanline pointer-events-none z-0" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-white/5"
        style={{ backgroundColor: "rgba(5,8,15,0.9)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
              <Swords className="w-5 h-5 text-white" />
            </div>
            <span className="font-orbitron font-black text-lg tracking-wider gradient-text">VELOXFI</span>
            <span className="text-lg">🐺</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-xs font-orbitron tracking-widest px-3 py-1 rounded-full"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}>
              DEMO MODE
            </span>
            <a href="/" className="btn-outline px-4 py-2 rounded-lg text-xs">
              BACK HOME
            </a>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-24">

        {/* ── HEADER ── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-orbitron tracking-widest"
            style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.3)", color: "#60a5fa" }}>
            <Zap className="w-3 h-3" />
            FREE DEMO — NO WALLET NEEDED
          </div>
          <h1 className="font-orbitron font-black text-4xl md:text-5xl text-white mb-4 leading-tight">
            TRY <span className="gradient-text">VELOXFI</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Experience a real battle for free with demo tokens
          </p>
        </div>

        {/* ── PHASE 1: FORM ── */}
        {phase === "form" && (
          <div className="card-dark rounded-2xl p-8 gradient-border">
            <h2 className="font-orbitron font-bold text-xl text-white mb-2">CREATE YOUR DEMO COIN</h2>
            <p className="text-gray-500 text-sm mb-8">Give your coin a name and ticker, then send it to war</p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-orbitron tracking-widest text-gray-400 mb-2">COIN NAME</label>
                <input
                  type="text"
                  value={coinName}
                  onChange={(e) => setCoinName(e.target.value)}
                  placeholder="e.g. BATTLE WOLF"
                  maxLength={32}
                  className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(37,99,235,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>

              <div>
                <label className="block text-xs font-orbitron tracking-widest text-gray-400 mb-2">
                  TICKER SYMBOL <span className="text-gray-600">(MAX 6 CHARS)</span>
                </label>
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                  placeholder="e.g. BWOLF"
                  maxLength={6}
                  className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-all duration-200 font-orbitron tracking-widest"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(37,99,235,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
                <p className="text-gray-700 text-xs font-orbitron mt-1.5 tracking-widest">{ticker.length}/6</p>
              </div>

              <button
                onClick={startBattle}
                disabled={!coinName.trim() || !ticker.trim()}
                className="w-full btn-primary py-4 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="font-orbitron tracking-wider flex items-center justify-center gap-2">
                  <Swords className="w-4 h-4" />
                  CREATE DEMO COIN &amp; START BATTLE
                </span>
              </button>
            </div>

            <div className="mt-8 pt-6 grid grid-cols-3 gap-4 text-center"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {[
                { label: "BATTLE DURATION", value: "5 MINS" },
                { label: "DEMO TOKENS", value: "FREE" },
                { label: "WALLET NEEDED", value: "NONE" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="font-orbitron font-bold text-sm text-white">{item.value}</div>
                  <div className="text-gray-600 text-xs font-orbitron tracking-widest mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PHASE 2: BATTLE ── */}
        {phase === "battle" && (
          <div className="space-y-5">

            {/* Timer */}
            <div className="card-dark rounded-2xl p-6">
              <CountdownDisplay seconds={timeLeft} />
            </div>

            {/* VS Row */}
            <div className="card-dark rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                {/* User coin */}
                <div className="flex-1 text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl"
                    style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(37,99,235,0.1))", border: "1px solid rgba(37,99,235,0.4)" }}>
                    ⚔️
                  </div>
                  <div className="font-orbitron font-black text-white text-base tracking-wider">{userTicker}</div>
                  <div className="text-gray-500 text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>{coinName}</div>
                  <div className={`flex items-center justify-center gap-1 text-xl font-bold mt-2 transition-all duration-500 ${userPct >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    style={{ fontFamily: "Inter, sans-serif" }}>
                    {userPct >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {fmt(userPct)}
                  </div>
                </div>

                {/* VS */}
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                    <span className="font-orbitron text-white text-xs font-black">VS</span>
                  </div>
                  {userPct !== oppPct && (
                    <div className="text-xs font-orbitron tracking-widest mt-1"
                      style={{ color: userPct > oppPct ? "#34d399" : "#f87171" }}>
                      {userPct > oppPct ? "WINNING" : "LOSING"}
                    </div>
                  )}
                </div>

                {/* Opponent */}
                <div className="flex-1 text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl"
                    style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(124,58,237,0.1))", border: "1px solid rgba(124,58,237,0.4)" }}>
                    {opponent.icon}
                  </div>
                  <div className="font-orbitron font-black text-white text-base tracking-wider">{opponent.ticker}</div>
                  <div className="text-gray-500 text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>{opponent.name}</div>
                  <div className={`flex items-center justify-center gap-1 text-xl font-bold mt-2 transition-all duration-500 ${oppPct >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    style={{ fontFamily: "Inter, sans-serif" }}>
                    {oppPct >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {fmt(oppPct)}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {(() => {
                const total = Math.abs(userPct) + Math.abs(oppPct) || 1;
                const uShare = userPct > oppPct
                  ? 50 + Math.min((userPct - oppPct) * 3, 40)
                  : 50 - Math.min((oppPct - userPct) * 3, 40);
                return (
                  <div>
                    <div className="h-2 rounded-full overflow-hidden bg-gray-800 mb-2">
                      <div className="h-full flex transition-all duration-1000">
                        <div className="rounded-l-full" style={{ width: `${uShare}%`, background: "linear-gradient(90deg, #2563eb, #3b82f6)" }} />
                        <div className="rounded-r-full" style={{ width: `${100 - uShare}%`, background: "linear-gradient(90deg, #6d28d9, #7c3aed)" }} />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs font-orbitron">
                      <span style={{ color: "#60a5fa" }}>{uShare.toFixed(0)}%</span>
                      <span style={{ color: "#a78bfa" }}>{(100 - uShare).toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Chart */}
            <div className="card-dark rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-orbitron text-gray-500 tracking-widest">LIVE PRICE CHART</span>
                <div className="flex items-center gap-4 text-xs font-orbitron">
                  <span className="flex items-center gap-1.5" style={{ color: "#60a5fa" }}>
                    <span className="w-3 h-0.5 inline-block rounded" style={{ background: "#3b82f6" }} />
                    {userTicker}
                  </span>
                  <span className="flex items-center gap-1.5" style={{ color: "#a78bfa" }}>
                    <span className="w-3 h-0.5 inline-block rounded" style={{ background: "#a78bfa" }} />
                    {opponent.ticker}
                  </span>
                </div>
              </div>
              <PriceChart data={chartData} userTicker={userTicker} oppTicker={opponent.ticker} />
            </div>
          </div>
        )}

        {/* ── PHASE 3: RESULT ── */}
        {phase === "result" && (
          <div className="space-y-5">
            {/* Winner banner */}
            <div className="card-dark rounded-2xl p-10 text-center relative overflow-hidden"
              style={{ border: userWon ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(248,113,113,0.3)" }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: userWon ? "radial-gradient(ellipse at center, rgba(52,211,153,0.05), transparent 70%)" : "radial-gradient(ellipse at center, rgba(248,113,113,0.05), transparent 70%)" }} />

              <div className="text-5xl mb-4">{userWon ? "🏆" : "💀"}</div>
              <div className="font-orbitron font-black text-3xl mb-2"
                style={{ color: userWon ? "#34d399" : "#f87171" }}>
                {userWon ? "VICTORY!" : "DEFEATED"}
              </div>
              <p className="text-gray-400 text-sm mb-6">
                {userWon
                  ? `${userTicker} crushed ${opponent.ticker} with ${fmt(userPct)} vs ${fmt(oppPct)}`
                  : `${opponent.ticker} dominated ${userTicker} with ${fmt(oppPct)} vs ${fmt(userPct)}`}
              </p>

              {/* Final scores */}
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="text-center">
                  <div className="font-orbitron font-black text-2xl" style={{ color: userWon ? "#34d399" : "#f87171", fontFamily: "Inter, sans-serif" }}>
                    {fmt(userPct)}
                  </div>
                  <div className="text-gray-600 text-xs font-orbitron tracking-widest mt-1">{userTicker}</div>
                </div>
                <div className="font-orbitron text-gray-600 font-black">VS</div>
                <div className="text-center">
                  <div className="font-orbitron font-black text-2xl" style={{ color: !userWon ? "#34d399" : "#f87171", fontFamily: "Inter, sans-serif" }}>
                    {fmt(oppPct)}
                  </div>
                  <div className="text-gray-600 text-xs font-orbitron tracking-widest mt-1">{opponent.ticker}</div>
                </div>
              </div>

              {/* Chart replay */}
              <div className="rounded-xl overflow-hidden mb-6" style={{ background: "rgba(0,0,0,0.3)" }}>
                <PriceChart data={chartData} userTicker={userTicker} oppTicker={opponent.ticker} />
              </div>

              {userWon && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-orbitron tracking-widest mb-6"
                  style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399" }}>
                  <Trophy className="w-3.5 h-3.5" />
                  IN REAL BATTLES YOU'D EARN 30% OF LOSER TOKENS
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={reset} className="btn-outline py-4 rounded-xl text-sm flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span className="font-orbitron tracking-wider">TRY AGAIN</span>
              </button>
              <a href="/" className="btn-primary py-4 rounded-xl text-sm flex items-center justify-center gap-2">
                <span className="font-orbitron tracking-wider">START REAL BATTLE</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="card-dark rounded-xl p-5 text-center"
              style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))" }}>
              <p className="text-gray-400 text-sm mb-3">
                Ready for real stakes? Join the presale and claim your OG warrior badge.
              </p>
              <div className="flex items-center justify-center gap-6 text-xs font-orbitron text-gray-600 tracking-widest">
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
