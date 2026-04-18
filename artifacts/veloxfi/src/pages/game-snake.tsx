import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import MemeShell from "@/components/MemeShell";
import { useAuth } from "@/context/AuthContext";

const COLS = 20, ROWS = 20, CELL = 20;
const W = COLS * CELL, H = ROWS * CELL;
const TICK_MS = 150;
const SESSION_SECS = 120;

type Pt = { x: number; y: number };

function rndFood(snake: Pt[]): Pt {
  let pt: Pt;
  do { pt = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
  while (snake.some(s => s.x === pt.x && s.y === pt.y));
  return pt;
}

function initState() {
  const snake: Pt[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  return { snake, dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 }, food: rndFood(snake), score: 0, lives: 3, timeLeft: SESSION_SECS, lastTick: 0, lastSec: 0, running: false, raf: 0 };
}

export default function GameSnake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = useRef(initState());
  const [phase, setPhase] = useState<"start" | "playing" | "done">("start");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(SESSION_SECS);
  const { addWolf, user } = useAuth();
  const [, nav] = useLocation();

  useEffect(() => {
    if (phase !== "playing") return;
    const g = s.current;
    Object.assign(g, initState());
    g.running = true;
    setScore(0); setLives(3); setTime(SESSION_SECS);

    function onKey(e: KeyboardEvent) {
      if (["ArrowUp", "w"].includes(e.key) && g.dir.y !== 1) g.nextDir = { x: 0, y: -1 };
      if (["ArrowDown", "s"].includes(e.key) && g.dir.y !== -1) g.nextDir = { x: 0, y: 1 };
      if (["ArrowLeft", "a"].includes(e.key) && g.dir.x !== 1) g.nextDir = { x: -1, y: 0 };
      if (["ArrowRight", "d"].includes(e.key) && g.dir.x !== -1) g.nextDir = { x: 1, y: 0 };
      if (e.key.startsWith("Arrow")) e.preventDefault();
    }
    document.addEventListener("keydown", onKey);

    function draw() {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#1a1a2e"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 0.5;
      for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
      for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }
      ctx.fillStyle = "#FFD93D";
      ctx.beginPath(); ctx.arc(g.food.x * CELL + CELL / 2, g.food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1a1a1a"; ctx.font = `bold ${CELL - 7}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("$", g.food.x * CELL + CELL / 2, g.food.y * CELL + CELL / 2);
      g.snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? "#6BCB77" : i % 2 === 0 ? "#4ade80" : "#22c55e";
        ctx.beginPath(); ctx.roundRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2, 4); ctx.fill();
        if (i === 0) {
          ctx.fillStyle = "#fff";
          const ex = g.dir.x !== 0 ? (g.dir.x > 0 ? CELL - 7 : 3) : CELL / 2 - 4;
          const ey1 = g.dir.y !== 0 ? (g.dir.y > 0 ? CELL - 7 : 3) : 4;
          const ey2 = g.dir.y !== 0 ? ey1 : CELL - 8;
          [ey1, ey2].forEach(ey => { ctx.beginPath(); ctx.arc(p.x * CELL + ex, p.y * CELL + ey, 2, 0, Math.PI * 2); ctx.fill(); });
        }
      });
    }

    function resetSnake() {
      g.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      g.dir = { x: 1, y: 0 }; g.nextDir = { x: 1, y: 0 };
    }

    function tick(now: number) {
      if (!g.running) return;
      if (!g.lastSec) g.lastSec = now;
      if (now - g.lastSec >= 1000) { g.timeLeft--; g.lastSec = now; setTime(g.timeLeft); if (g.timeLeft <= 0) { end(); return; } }
      if (!g.lastTick) g.lastTick = now;
      if (now - g.lastTick >= TICK_MS) {
        g.lastTick = now; g.dir = g.nextDir;
        const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || g.snake.some(p => p.x === head.x && p.y === head.y)) {
          g.lives--; setLives(g.lives); if (g.lives <= 0) { end(); return; } resetSnake();
        } else {
          g.snake.unshift(head);
          if (head.x === g.food.x && head.y === g.food.y) { g.score++; setScore(g.score); g.food = rndFood(g.snake); }
          else g.snake.pop();
        }
      }
      draw();
      g.raf = requestAnimationFrame(tick);
    }

    function end() { g.running = false; addWolf(g.score); setPhase("done"); }
    g.raf = requestAnimationFrame(tick);

    return () => { g.running = false; cancelAnimationFrame(g.raf); document.removeEventListener("keydown", onKey); };
  }, [phase]);

  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  const btn = (label: string, color: string, onClick: () => void) => (
    <button onClick={onClick} style={{ background: color, border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "11px 26px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a" }}>{label}</button>
  );

  return (
    <MemeShell testId="page-game-snake">
      <div className="flex flex-col items-center py-8 px-4">
        <h1 className="font-bungee text-3xl mb-1" style={{ color: "#1a1a1a" }}>🐍 CRYPTO SNAKE</h1>
        <p className="font-fredoka text-base mb-6" style={{ color: "#666" }}>Eat $BATTLE coins to grow · 1 WOLF per coin</p>

        {phase === "start" && (
          <div style={{ border: "2.5px solid #1a1a1a", borderRadius: 20, padding: 36, boxShadow: "5px 5px 0 #1a1a1a", background: "#fff", maxWidth: 380, textAlign: "center" }}>
            <div style={{ fontSize: 72 }}>🐍</div>
            <h2 className="font-bungee text-xl mt-4 mb-3">HOW TO PLAY</h2>
            <p className="font-fredoka text-sm mb-1" style={{ color: "#555" }}>🎮 Arrow keys or WASD to steer the snake</p>
            <p className="font-fredoka text-sm mb-1" style={{ color: "#555" }}>💰 Eat yellow $BATTLE coins to earn WOLF</p>
            <p className="font-fredoka text-sm mb-4" style={{ color: "#555" }}>❤️ 3 lives · ⏱️ 2 minute session</p>
            {!user && <p className="font-fredoka text-sm mb-4" style={{ color: "#FF6B6B" }}>⚠️ Login to save your WOLF earnings</p>}
            {btn("PLAY NOW", "#6BCB77", () => setPhase("playing"))}
          </div>
        )}

        {phase === "playing" && (
          <div>
            <div className="flex justify-between items-center mb-3 gap-6" style={{ width: W }}>
              <span className="font-fredoka font-bold text-lg">🏆 {score} WOLF</span>
              <span className="font-fredoka font-bold text-lg">{"❤️".repeat(lives)}{"🖤".repeat(3 - lives)}</span>
              <span className="font-fredoka font-bold text-lg">⏱️ {fmt(time)}</span>
            </div>
            <canvas ref={canvasRef} width={W} height={H} style={{ border: "2.5px solid #1a1a1a", borderRadius: 10, boxShadow: "5px 5px 0 #1a1a1a", display: "block" }} />
            <p className="font-fredoka text-center text-sm mt-3" style={{ color: "#888" }}>Arrow keys or WASD to move</p>
          </div>
        )}

        {phase === "done" && (
          <div style={{ border: "2.5px solid #1a1a1a", borderRadius: 20, padding: 36, boxShadow: "5px 5px 0 #1a1a1a", background: "#fff", maxWidth: 380, textAlign: "center" }}>
            <div style={{ fontSize: 72 }}>🎉</div>
            <h2 className="font-bungee text-2xl mt-4">SESSION COMPLETE!</h2>
            <p className="font-fredoka text-4xl font-bold mt-2" style={{ color: "#6BCB77" }}>+{score} WOLF</p>
            <p className="font-fredoka text-sm mt-1 mb-6" style={{ color: "#777" }}>Added to your balance{!user ? " (login to save!)" : ""}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              {btn("PLAY AGAIN", "#FFD93D", () => setPhase("start"))}
              {btn("ALL GAMES", "#A29BFE", () => nav("/games"))}
            </div>
          </div>
        )}
      </div>
    </MemeShell>
  );
}
