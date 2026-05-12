import { useState, useEffect, useRef } from "react";
import GameShell from "@/components/GameShell";
import { useAuth } from "@/context/AuthContext";

const TICK_DURATION = 8; // seconds per round
const BASE_BET = 50;

type Direction = "up" | "down" | null;
type Candle = { up: boolean; high: number; low: number; open: number; close: number };

function generateCandle(prev: number): Candle {
  const change = (Math.random() - 0.48) * 0.008;
  const open = prev;
  const close = Math.max(0.001, prev + change);
  const high = Math.max(open, close) + Math.random() * 0.002;
  const low = Math.min(open, close) - Math.random() * 0.002;
  return { up: close >= open, high, low, open, close };
}

export default function PumpPulseGame() {
  const { user } = useAuth();
  const [candles, setCandles] = useState<Candle[]>(() => {
    const start = 0.0428;
    const cs: Candle[] = [];
    let price = start;
    for (let i = 0; i < 22; i++) {
      const c = generateCandle(price);
      cs.push(c);
      price = c.close;
    }
    return cs;
  });
  const [timeLeft, setTimeLeft] = useState(TICK_DURATION);
  const [prediction, setPrediction] = useState<Direction>(null);
  const [multiplier, setMultiplier] = useState(1.0);
  const [streak, setStreak] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [history, setHistory] = useState<Direction[]>([]);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [pulse, setPulse] = useState(3127);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPrice = candles[candles.length - 1]?.close ?? 0.0428;
  const prevPrice = candles[candles.length - 2]?.close ?? currentPrice;
  const priceChange = ((currentPrice - prevPrice) / prevPrice) * 100;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          resolveTick();
          return TICK_DURATION;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [prediction, multiplier, streak]);

  function resolveTick() {
    const newCandle = generateCandle(candles[candles.length - 1]?.close ?? 0.0428);
    setCandles((prev) => [...prev.slice(-29), newCandle]);
    setPulse((p) => p + 1);

    if (prediction) {
      const priceWentUp = newCandle.close >= newCandle.open;
      const won = (prediction === "up" && priceWentUp) || (prediction === "down" && !priceWentUp);
      setResult(won ? "win" : "lose");
      setHistory((h) => [prediction, ...h].slice(0, 5));

      if (won) {
        const newMultiplier = Math.round((multiplier + 0.4) * 10) / 10;
        setMultiplier(newMultiplier);
        setStreak((s) => s + 1);
        const reward = Math.round(BASE_BET * newMultiplier * 0.4);
        setEarnings((e) => e + reward);
      } else {
        setMultiplier(1.0);
        setStreak(0);
        setResult("lose");
      }
      setTimeout(() => setResult(null), 1500);
    }
    setPrediction(null);
  }

  function handleCashOut() {
    const reward = Math.round(BASE_BET * multiplier);
    setEarnings((e) => e + reward);
    setMultiplier(1.0);
    setStreak(0);
    setHistory([]);
    setResult("win");
    setTimeout(() => setResult(null), 1500);
  }

  // build SVG candles
  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const range = maxP - minP || 0.001;
  const toY = (p: number) => 5 + ((maxP - p) / range) * 50;
  const candleW = 100 / candles.length;

  const side = (
    <>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>Pump Pulse</div>
          <span className="pill magenta" style={{ fontSize: 9 }}>NEW</span>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 4 }}>PREDICT · 60S ROUNDS</div>
      </div>

      <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14, lineHeight: 1.5 }}>
        Place UP or DOWN before each tick. Right = stack multiplier. Wrong = lose streak. Cash out anytime.
      </p>

      {/* bet + multiplier */}
      <div className="card cream" style={{ padding: 12, marginBottom: 12 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>YOUR BET</div>
        <div className="row" style={{ marginTop: 4, justifyContent: "space-between" }}>
          <div className="display tabular" style={{ fontSize: 22 }}>{BASE_BET} BATTLE</div>
          <div className="display tabular" style={{ fontSize: 22, color: "var(--lime)" }}>×{multiplier.toFixed(1)}</div>
        </div>
        <div className="bar" style={{ marginTop: 8 }}>
          <div className="bar-fill" style={{ width: `${Math.min(multiplier * 15, 100)}%`, background: "var(--lime)" }} />
        </div>
      </div>

      {/* UP / DOWN buttons */}
      <div className="row" style={{ gap: 8, marginBottom: 12 }}>
        <button
          className="btn"
          onClick={() => setPrediction("up")}
          style={{ flex: 1, justifyContent: "center", fontSize: 18, padding: "14px", background: prediction === "up" ? "var(--lime)" : "var(--paper)", border: "2.5px solid var(--ink)" }}
        >↑ UP</button>
        <button
          className="btn"
          onClick={() => setPrediction("down")}
          style={{ flex: 1, justifyContent: "center", fontSize: 18, padding: "14px", background: prediction === "down" ? "var(--tomato)" : "var(--paper)", border: "2.5px solid var(--ink)", color: prediction === "down" ? "white" : "var(--ink)" }}
        >↓ DOWN</button>
      </div>

      {multiplier > 1.4 && (
        <button className="btn lg yellow" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }} onClick={handleCashOut}>
          CASH OUT · +{Math.round(BASE_BET * multiplier)} BATTLE
        </button>
      )}

      {/* history */}
      {history.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginBottom: 6 }}>YOUR LAST {history.length} TICKS</div>
          <div className="row" style={{ gap: 4 }}>
            {history.map((d, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: 6, border: "2px solid var(--ink)", background: d === "up" ? "var(--lime)" : "var(--tomato)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Bagel Fat One", fontSize: 16, color: d === "down" ? "white" : "var(--ink)" }}>
                {d === "up" ? "↑" : "↓"}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* session reward */}
      <div style={{ background: "var(--ink)", border: "2.5px solid var(--ink)", borderRadius: 14, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--cyan)", letterSpacing: 1.5 }}>SESSION REWARD</div>
            <div className="display tabular" style={{ fontSize: 24, lineHeight: 1, color: "white", marginTop: 2 }}>+{earnings} BATTLE</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 9, color: "var(--magenta)", letterSpacing: 1.5 }}>HASH BOOST</div>
            <div className="display tabular" style={{ fontSize: 24, lineHeight: 1, color: "white", marginTop: 2 }}>×2.8</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <GameShell
      testId="page-game-pump"
      title="Pump Pulse"
      tag="Predict · 60s rounds"
      meta={[
        { label: "Pulse", value: `#${pulse.toLocaleString()}` },
        { label: "Time left", value: `00:${String(timeLeft).padStart(2, "0")}` },
        { label: "Multiplier", value: `×${multiplier.toFixed(1)}` },
        { label: "Streak", value: `${streak}W` },
      ]}
      side={side}
    >
      <div style={{ background: "#0B0B1A", borderRadius: 14, position: "relative", minHeight: 540, overflow: "hidden", padding: 24 }}>

        {/* result flash */}
        {result && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, background: result === "win" ? "rgba(182,242,63,0.15)" : "rgba(255,90,74,0.15)", borderRadius: 14 }}>
            <div className="display" style={{ fontSize: 80, color: result === "win" ? "var(--lime)" : "var(--tomato)" }}>
              {result === "win" ? "✓" : "✗"}
            </div>
          </div>
        )}

        {/* candlestick chart */}
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
          {[0, 15, 30, 45, 60].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.15" />)}
          {candles.map((c, i) => {
            const x = i * candleW + candleW * 0.25;
            const w = candleW * 0.5;
            const openY = toY(c.open);
            const closeY = toY(c.close);
            const highY = toY(c.high);
            const lowY = toY(c.low);
            const color = c.up ? "var(--lime)" : "var(--tomato)";
            return (
              <g key={i}>
                <line x1={x + w / 2} y1={highY} x2={x + w / 2} y2={lowY} stroke={color} strokeWidth="0.3" />
                <rect x={x} y={Math.min(openY, closeY)} width={w} height={Math.max(Math.abs(closeY - openY), 0.5)} fill={color} />
              </g>
            );
          })}
          {/* trend line */}
          <path d={`M 5 ${toY(candles[0]?.close ?? 0.04)} ${candles.map((c, i) => `L ${i * candleW + candleW / 2} ${toY(c.close)}`).join(" ")}`}
            stroke="var(--cyan)" strokeWidth="0.4" fill="none" strokeLinecap="round" />
          {/* current price marker */}
          <circle cx={candles.length * candleW - candleW / 2} cy={toY(currentPrice)} r="1.2" fill="var(--magenta)" stroke="var(--ink)" strokeWidth="0.15" />
          <line x1="0" y1={toY(currentPrice)} x2="100" y2={toY(currentPrice)} stroke="var(--magenta)" strokeWidth="0.15" strokeDasharray="0.5 0.5" />
        </svg>

        {/* HUD top-left: countdown */}
        <div style={{ position: "absolute", top: 24, left: 24 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--cyan)", letterSpacing: 2 }}>NEXT TICK IN</div>
          <div className="display tabular" style={{ fontSize: 64, color: "white", lineHeight: 0.9 }}>
            00:{String(timeLeft).padStart(2, "0")}
          </div>
          <div className="mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>PULSE #{pulse.toLocaleString()}</div>
        </div>

        {/* HUD top-right: price */}
        <div style={{ position: "absolute", top: 24, right: 24, textAlign: "right" }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--magenta)", letterSpacing: 2 }}>$BATTLE / USD</div>
          <div className="display tabular" style={{ fontSize: 48, color: "white", lineHeight: 1 }}>
            ${currentPrice.toFixed(4)}
          </div>
          <div className="display tabular" style={{ fontSize: 18, color: priceChange >= 0 ? "var(--lime)" : "var(--tomato)" }}>
            {priceChange >= 0 ? "↑" : "↓"} {Math.abs(priceChange).toFixed(1)}%
          </div>
        </div>

        {/* prediction preview on canvas */}
        {prediction && (
          <div style={{ position: "absolute", bottom: 90, left: "50%", transform: "translateX(-50%)" }}>
            <div className="display" style={{ fontSize: 48, color: prediction === "up" ? "var(--lime)" : "var(--tomato)" }}>
              {prediction === "up" ? "↑ UP" : "↓ DOWN"}
            </div>
          </div>
        )}

        {/* HUD bottom: community split */}
        <div style={{ position: "absolute", bottom: 24, left: 24, right: 24, background: "rgba(11,11,26,0.7)", backdropFilter: "blur(10px)", border: "2px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 14, display: "flex", gap: 18, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--lime)" }}>UP · 142 wolves</div>
            <div className="display tabular" style={{ fontSize: 18, color: "var(--lime)" }}>3,840 BATTLE</div>
          </div>
          <div style={{ flex: 2, height: 12, borderRadius: 6, background: "var(--tomato)", position: "relative", border: "2px solid var(--ink)", overflow: "hidden" }}>
            <div style={{ width: "68%", height: "100%", background: "var(--lime)" }} />
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--tomato)" }}>DOWN · 67 wolves</div>
            <div className="display tabular" style={{ fontSize: 18, color: "var(--tomato)" }}>1,820 BATTLE</div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
