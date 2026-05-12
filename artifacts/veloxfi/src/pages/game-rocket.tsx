import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import GameShell from "@/components/GameShell";
import { useAuth } from "@/context/AuthContext";

const BASE_BET = 100;
const TICK_MS = 100;

type Phase = "waiting" | "flying" | "crashed" | "cashed";

function getRandomCrash(): number {
  // house edge ~8% — crash point follows roughly exponential distribution
  const r = Math.random();
  if (r < 0.08) return 1.0;
  return Math.max(1.0, 1 / (1 - r * 0.92));
}

const RECENT_HISTORY = [1.2, 2.4, 1.05, 8.7, 1.78, 12.3, 1.0, 4.5, 2.1, 1.32, 18.4, 1.0];

export default function RocketGame() {
  const { user } = useAuth();
  const [, nav] = useLocation();

  const [phase, setPhase] = useState<Phase>("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashAt, setCrashAt] = useState(3.5);
  const [cashedAt, setCashedAt] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>(RECENT_HISTORY);
  const [round, setRound] = useState(1284);
  const [players] = useState([
    { name: "moonwolf", bet: 200, status: "in" },
    { name: "pumpqueen", bet: 50, status: "in" },
    { name: "fangmaster", bet: 1000, status: "in" },
    { name: "shibakid", bet: 25, status: "in" },
    { name: "cryptobaby", bet: 500, status: "in" },
  ]);
  const [earnings, setEarnings] = useState(0);
  const [pendingWolf, setPendingWolf] = useState(0);
  const [flyShow, setFlyShow] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const crashAtRef = useRef(3.5);

  const stopInterval = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const startRound = useCallback(() => {
    const crash = getRandomCrash();
    crashAtRef.current = crash;
    setCrashAt(crash);
    setMultiplier(1.0);
    setCashedAt(null);
    setPhase("flying");
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const m = Math.pow(Math.E, elapsed * 0.15);
      const rounded = Math.floor(m * 100) / 100;
      setMultiplier(rounded);
      if (rounded >= crashAtRef.current) {
        stopInterval();
        setPhase("crashed");
        setHistory((h) => [crashAtRef.current, ...h].slice(0, 16));
        setRound((r) => r + 1);
      }
    }, TICK_MS);
  }, []);

  useEffect(() => { return () => stopInterval(); }, []);

  function cashOut() {
    if (phase !== "flying") return;
    stopInterval();
    const reward = Math.round(BASE_BET * multiplier);
    const wolf = Math.round(reward * 0.4);
    setCashedAt(multiplier);
    setPhase("cashed");
    setEarnings((e) => e + wolf);
    setPendingWolf((p) => p + wolf);
    setFlyShow(true);
    setTimeout(() => setFlyShow(false), 1500);
    setHistory((h) => [multiplier, ...h].slice(0, 16));
    setRound((r) => r + 1);
  }

  const potential = Math.round(BASE_BET * multiplier);
  const multiplierColor = phase === "crashed" ? "var(--tomato)" : phase === "cashed" ? "var(--lime)" : "white";

  // SVG curve path
  const curveProgress = Math.min((multiplier - 1) / (crashAt - 1 || 1), 1);
  const rocketX = 10 + curveProgress * 75;
  const rocketY = 80 - curveProgress * 65;

  const side = (
    <>
      <div style={{ marginBottom: 10 }}>
        <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>Rocket Miner</div>
        <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 4 }}>CRASH · RISK</div>
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14, lineHeight: 1.5 }}>
        Bet, watch the multiplier climb, cash out before the rocket crashes. Don't get greedy.
      </p>

      {/* Bet + potential */}
      <div className="card cream" style={{ padding: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>YOUR BET</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>POTENTIAL</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <div className="display tabular" style={{ fontSize: 22 }}>{BASE_BET}</div>
          <div className="display tabular" style={{ fontSize: 22, color: "var(--lime)" }}>+{potential - BASE_BET}</div>
        </div>
        <div style={{ fontSize: 11, color: "var(--mute)", display: "flex", justifyContent: "space-between" }}>
          <span>BATTLE</span><span>BATTLE</span>
        </div>
      </div>

      {/* Cash out button */}
      <button
        className="btn lg magenta"
        style={{ width: "100%", justifyContent: "center", marginBottom: 14, fontSize: 16 }}
        onClick={phase === "flying" ? cashOut : startRound}
        disabled={phase === "crashed" || phase === "cashed"}
      >
        {phase === "waiting" && "START ROUND →"}
        {phase === "flying" && `CASH OUT ×${multiplier.toFixed(2)}`}
        {phase === "crashed" && `CRASHED AT ×${crashAt.toFixed(2)}`}
        {phase === "cashed" && `CASHED ×${cashedAt?.toFixed(2)}`}
      </button>

      {(phase === "crashed" || phase === "cashed") && (
        <button className="btn primary" style={{ width: "100%", justifyContent: "center", marginBottom: 14 }} onClick={startRound}>
          Next round →
        </button>
      )}

      {/* Recent */}
      <div>
        <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginBottom: 6 }}>RECENT</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {history.slice(0, 12).map((v, i) => (
            <span key={i} className="pill" style={{
              background: v >= 2 ? "var(--lime)" : v < 1.2 ? "var(--tomato)" : "var(--cream)",
              color: v < 1.2 ? "white" : "var(--ink)",
              fontSize: 10, padding: "2px 6px"
            }}>×{v.toFixed(1)}</span>
          ))}
        </div>
      </div>

      {/* Session reward */}
      <div style={{ background: "var(--ink)", border: "2.5px solid var(--ink)", borderRadius: 14, padding: 14, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--cyan)", letterSpacing: 1.5 }}>SESSION REWARD</div>
            <div className="display tabular" style={{ fontSize: 24, lineHeight: 1, color: "white", marginTop: 2 }}>+{earnings} BATTLE</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 9, color: "var(--magenta)", letterSpacing: 1.5 }}>HASH BOOST</div>
            <div className="display tabular" style={{ fontSize: 24, lineHeight: 1, color: "white", marginTop: 2 }}>×3.2</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <GameShell
      testId="page-game-rocket"
      title="Rocket Miner"
      tag="Crash · Risk"
      meta={[
        { label: "Round", value: `#${round.toLocaleString()}` },
        { label: "Players", value: "38" },
        { label: "Live", value: `×${multiplier.toFixed(2)}` },
        { label: "Best", value: "×97.8" },
      ]}
      side={side}
    >
      <div style={{ background: "#0B0B1A", position: "relative", minHeight: 540, overflow: "hidden" }}>

        {/* Stars */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", width: i % 5 === 0 ? 3 : 2, height: i % 5 === 0 ? 3 : 2, background: "white", borderRadius: "50%", top: `${(i * 37) % 100}%`, left: `${(i * 53) % 100}%`, opacity: 0.3 + (i % 3) * 0.2 }} />
        ))}

        {/* Curve + rocket SVG */}
        <svg viewBox="0 0 100 90" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="rocketGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--magenta)" stopOpacity={phase === "crashed" ? "0.6" : "0.5"} />
              <stop offset="100%" stopColor="var(--magenta)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Filled area under curve */}
          <path
            d={`M 10 80 Q ${10 + curveProgress * 40} ${80 - curveProgress * 30}, ${rocketX} ${rocketY} L ${rocketX} 80 Z`}
            fill="url(#rocketGrad)"
          />
          {/* Curve line */}
          <path
            d={`M 10 80 Q ${10 + curveProgress * 40} ${80 - curveProgress * 30}, ${rocketX} ${rocketY}`}
            stroke={phase === "crashed" ? "var(--tomato)" : "var(--magenta)"}
            strokeWidth="0.8" fill="none" strokeLinecap="round"
          />
          {/* Rocket icon */}
          {phase !== "crashed" && (
            <g transform={`translate(${rocketX - 3}, ${rocketY - 6}) rotate(-25 3 6)`}>
              <ellipse cx="3" cy="5" rx="2.5" ry="5" fill="var(--magenta)" stroke="var(--ink)" strokeWidth="0.3" />
              <polygon points="3,0 1,3 5,3" fill="white" />
              <polygon points="0.5,8 3,6.5 5.5,8 4,10 2,10" fill="var(--tomato)" />
            </g>
          )}
          {/* Crash X */}
          {phase === "crashed" && (
            <g transform={`translate(${rocketX - 3}, ${rocketY - 3})`}>
              <line x1="0" y1="0" x2="6" y2="6" stroke="var(--tomato)" strokeWidth="1" />
              <line x1="6" y1="0" x2="0" y2="6" stroke="var(--tomato)" strokeWidth="1" />
            </g>
          )}
        </svg>

        {/* Live players panel */}
        <div style={{ position: "absolute", left: 16, top: 60, bottom: 80, width: 190, background: "rgba(11,11,26,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 12 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--cyan)", marginBottom: 8 }}>LIVE THIS ROUND · 38</div>
          {players.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 11, color: "white", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span className="mono">{p.name}</span>
              <span className="mono" style={{ color: "rgba(255,255,255,0.4)" }}>{p.bet}V</span>
              <span className="mono" style={{ color: phase === "flying" ? "var(--lime)" : "var(--mute)" }}>
                {phase === "flying" ? `×${multiplier.toFixed(2)}` : "in"}
              </span>
            </div>
          ))}
        </div>

        {/* Big multiplier */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", pointerEvents: "none" }}>
          {phase === "waiting" && (
            <div className="mono" style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", letterSpacing: 3 }}>WAITING FOR PLAYERS...</div>
          )}
          {(phase === "flying" || phase === "crashed" || phase === "cashed") && (
            <>
              <div className="mono" style={{ fontSize: 12, color: "var(--cyan)", letterSpacing: 2 }}>MULTIPLIER</div>
              <div className="display tabular" style={{
                fontSize: 120, color: multiplierColor, lineHeight: 1, marginTop: 4,
                textShadow: phase === "flying" ? "0 0 40px rgba(255,43,214,0.6)" : "none",
                transition: "color 0.2s"
              }}>
                ×{multiplier.toFixed(2)}
              </div>
              {phase === "flying" && (
                <div className="mono" style={{ fontSize: 14, color: "var(--magenta)", marginTop: 4 }}>
                  ↑ +0.04 / 100ms
                </div>
              )}
              {phase === "crashed" && (
                <div className="display" style={{ fontSize: 24, color: "var(--tomato)", marginTop: 8 }}>CRASHED 💥</div>
              )}
              {phase === "cashed" && (
                <div className="display" style={{ fontSize: 24, color: "var(--lime)", marginTop: 8 }}>
                  CASHED OUT +{Math.round(BASE_BET * (cashedAt ?? 1))} BATTLE 🎉
                </div>
              )}
            </>
          )}
        </div>

        {/* Start button overlay when waiting */}
        {phase === "waiting" && (
          <div style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)" }}>
            <button className="btn lg yellow" onClick={startRound}>START ROUND 🚀</button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
