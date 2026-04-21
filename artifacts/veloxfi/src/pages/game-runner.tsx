import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import MemeShell from "@/components/MemeShell";
import TokenFly from "@/components/TokenFly";
import { useAuth } from "@/context/AuthContext";

const W = 520, H = 220;
const GROUND = H - 50;
const SESSION_SECS = 120;
const WOLF_W = 40, WOLF_H = 40;
const OBS_W = 28, OBS_H = 44;
const COIN_R = 12;

interface Obstacle { x: number; h: number; color: string }
interface Coin { x: number; y: number; collected: boolean }

function initState() {
  return {
    wolfY: GROUND - WOLF_H, wolfVY: 0, onGround: true,
    obstacles: [] as Obstacle[], coins: [] as Coin[],
    score: 0, lives: 3, timeLeft: SESSION_SECS,
    speed: 4, frame: 0, lastSec: 0, lastSpawn: 0, lastCoin: 0,
    running: false, raf: 0, invincible: 0,
  };
}

export default function GameRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = useRef(initState());
  const [phase, setPhase] = useState<"start" | "playing" | "done">("start");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(SESSION_SECS);
  const [pendingWolf, setPendingWolf] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [flyShow, setFlyShow] = useState(false);
  const [flyFrom, setFlyFrom] = useState({ x: 0, y: 0 });
  const claimBtnRef = useRef<HTMLButtonElement>(null);
  const { addGameSession, user } = useAuth();
  const [, nav] = useLocation();

  useEffect(() => {
    if (phase !== "playing") return;
    const g = s.current;
    Object.assign(g, initState());
    g.running = true;
    setScore(0); setLives(3); setTime(SESSION_SECS); setClaimed(false); setPendingWolf(0);

    function jump() {
      if (g.onGround) { g.wolfVY = -14; g.onGround = false; }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w") { e.preventDefault(); jump(); }
    }
    document.addEventListener("keydown", onKey);

    // Touch support
    function onTouch() { jump(); }
    canvasRef.current?.addEventListener("touchstart", onTouch);

    function draw() {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      // Sky
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0f0c29"); grad.addColorStop(1, "#302b63");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 137 + g.frame * 0.5) % W);
        ctx.fillRect(sx, (i * 43) % (GROUND - 20), 2, 2);
      }

      // Ground
      ctx.fillStyle = "#FFD93D";
      ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.fillStyle = "#1a1a1a"; ctx.fillRect(0, GROUND, W, 3);
      // Ground pattern
      for (let x = -(g.frame * g.speed % 40); x < W; x += 40) {
        ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(x, GROUND, 20, H - GROUND);
      }

      // Coins
      g.coins.forEach(c => {
        if (c.collected) return;
        ctx.fillStyle = "#FFD93D";
        ctx.beginPath(); ctx.arc(c.x, c.y, COIN_R, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "#1a1a1a"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("W", c.x, c.y);
      });

      // Obstacles
      g.obstacles.forEach(o => {
        ctx.fillStyle = o.color;
        ctx.beginPath(); ctx.roundRect(o.x, GROUND - o.h, OBS_W, o.h, 4); ctx.fill();
        ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("⚡", o.x + OBS_W / 2, GROUND - o.h / 2);
      });

      // Wolf
      const wx = 80, wy = g.wolfY;
      const flash = g.invincible > 0 && Math.floor(g.invincible / 4) % 2 === 0;
      if (!flash) {
        ctx.fillStyle = "#FF9F43";
        ctx.beginPath(); ctx.roundRect(wx, wy, WOLF_W, WOLF_H, 8); ctx.fill();
        ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2.5; ctx.stroke();
        // Ears
        ctx.fillStyle = "#FF9F43";
        ctx.beginPath(); ctx.moveTo(wx + 5, wy); ctx.lineTo(wx - 2, wy - 12); ctx.lineTo(wx + 14, wy - 4); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(wx + WOLF_W - 5, wy); ctx.lineTo(wx + WOLF_W + 2, wy - 12); ctx.lineTo(wx + WOLF_W - 14, wy - 4); ctx.closePath(); ctx.fill();
        // Eyes
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath(); ctx.arc(wx + 12, wy + 14, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(wx + WOLF_W - 12, wy + 14, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(wx + 13, wy + 13, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(wx + WOLF_W - 11, wy + 13, 1.5, 0, Math.PI * 2); ctx.fill();
        // Legs animation
        const legOff = Math.sin(g.frame * 0.4) * 6;
        ctx.fillStyle = "#e8890c"; ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(wx + 6, wy + WOLF_H - 6, 10, 14 + legOff, 3); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.roundRect(wx + WOLF_W - 16, wy + WOLF_H - 6, 10, 14 - legOff, 3); ctx.fill(); ctx.stroke();
      }

      // Score overlay
      ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.beginPath(); ctx.roundRect(10, 10, 130, 36, 8); ctx.fill();
      ctx.fillStyle = "#FFD93D"; ctx.font = "bold 14px Fredoka, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(`🏆 ${g.score} WOLF`, 20, 28);
    }

    function tick(now: number) {
      if (!g.running) return;
      g.frame++;

      // Timer
      if (!g.lastSec) g.lastSec = now;
      if (now - g.lastSec >= 1000) { g.timeLeft--; g.lastSec = now; setTime(g.timeLeft); if (g.timeLeft <= 0) { end(); return; } }

      // Speed ramp
      g.speed = 4 + Math.floor((SESSION_SECS - g.timeLeft) / 20) * 0.5;

      // Gravity
      g.wolfVY += 0.7;
      g.wolfY = Math.min(g.wolfY + g.wolfVY, GROUND - WOLF_H);
      if (g.wolfY >= GROUND - WOLF_H) { g.wolfY = GROUND - WOLF_H; g.onGround = true; g.wolfVY = 0; }

      // Spawn obstacles
      if (now - g.lastSpawn > 1800 - Math.min(g.score * 20, 800)) {
        g.lastSpawn = now;
        const colors = ["#FF6B6B", "#FF6B9D", "#A29BFE"];
        g.obstacles.push({ x: W + 20, h: OBS_H + Math.random() * 20, color: colors[Math.floor(Math.random() * colors.length)] });
      }

      // Spawn coins
      if (now - g.lastCoin > 1200) {
        g.lastCoin = now;
        const coinY = GROUND - COIN_R - 20 - Math.random() * 60;
        g.coins.push({ x: W + 20, y: coinY, collected: false });
      }

      // Move obstacles
      g.obstacles.forEach(o => { o.x -= g.speed; });
      g.obstacles = g.obstacles.filter(o => o.x > -OBS_W - 10);

      // Move coins
      g.coins.forEach(c => { c.x -= g.speed; });
      g.coins = g.coins.filter(c => c.x > -COIN_R - 10 && !c.collected);

      // Collision (obstacle)
      if (g.invincible > 0) g.invincible--;
      else {
        for (const o of g.obstacles) {
          if (80 + WOLF_W > o.x && 80 < o.x + OBS_W && g.wolfY + WOLF_H > GROUND - o.h) {
            g.lives--; setLives(g.lives); g.invincible = 80;
            if (g.lives <= 0) { end(); return; }
            break;
          }
        }
      }

      // Coin collection
      g.coins.forEach(c => {
        if (!c.collected && Math.hypot(80 + WOLF_W / 2 - c.x, g.wolfY + WOLF_H / 2 - c.y) < WOLF_W / 2 + COIN_R) {
          c.collected = true; g.score++; setScore(g.score);
        }
      });

      draw();
      g.raf = requestAnimationFrame(tick);
    }

    function end() { g.running = false; setPendingWolf(g.score); setPhase("done"); }
    g.raf = requestAnimationFrame(tick);

    return () => {
      g.running = false; cancelAnimationFrame(g.raf);
      document.removeEventListener("keydown", onKey);
      canvasRef.current?.removeEventListener("touchstart", onTouch);
    };
  }, [phase]);

  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  const btn = (label: string, color: string, onClick: () => void) => (
    <button onClick={onClick} style={{ background: color, border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "11px 26px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a" }}>{label}</button>
  );

  function handleClaim() {
    if (claimed || pendingWolf <= 0) return;
    if (claimBtnRef.current) {
      const rect = claimBtnRef.current.getBoundingClientRect();
      setFlyFrom({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    void addGameSession("runner", pendingWolf);
    setClaimed(true);
    setFlyShow(true);
  }

  return (
    <MemeShell testId="page-game-runner">
      <TokenFly
        count={Math.min(pendingWolf, 10)}
        show={flyShow}
        fromX={flyFrom.x}
        fromY={flyFrom.y}
        onComplete={() => setFlyShow(false)}
      />
      <div className="flex flex-col items-center py-8 px-4">
        <h1 className="font-bungee text-3xl mb-1" style={{ color: "#1a1a1a" }}>🐺 WOLF RUN</h1>
        <p className="font-fredoka text-base mb-6" style={{ color: "#666" }}>Jump over obstacles, collect WOLF tokens!</p>

        {phase === "start" && (
          <div style={{ border: "2.5px solid #1a1a1a", borderRadius: 20, padding: 36, boxShadow: "5px 5px 0 #1a1a1a", background: "#fff", maxWidth: 380, textAlign: "center" }}>
            <div style={{ fontSize: 72 }}>🐺</div>
            <h2 className="font-bungee text-xl mt-4 mb-3">HOW TO PLAY</h2>
            <p className="font-fredoka text-sm mb-1" style={{ color: "#555" }}>⬆️ Space or Arrow Up to jump</p>
            <p className="font-fredoka text-sm mb-1" style={{ color: "#555" }}>📱 Tap the screen on mobile</p>
            <p className="font-fredoka text-sm mb-4" style={{ color: "#555" }}>🏆 Collect WOLF coins · ❤️ 3 lives · ⏱️ 2 min</p>
            {!user && <p className="font-fredoka text-sm mb-4" style={{ color: "#FF6B6B" }}>⚠️ Login to save your WOLF earnings</p>}
            {btn("PLAY NOW", "#FF9F43", () => setPhase("playing"))}
          </div>
        )}

        {phase === "playing" && (
          <div>
            <div className="flex justify-between items-center mb-3 gap-6" style={{ maxWidth: W }}>
              <span className="font-fredoka font-bold text-lg">🏆 {score} WOLF</span>
              <span className="font-fredoka font-bold text-lg">{"❤️".repeat(lives)}{"🖤".repeat(3 - lives)}</span>
              <span className="font-fredoka font-bold text-lg">⏱️ {fmt(time)}</span>
            </div>
            <canvas ref={canvasRef} width={W} height={H} style={{ border: "2.5px solid #1a1a1a", borderRadius: 10, boxShadow: "5px 5px 0 #1a1a1a", display: "block", maxWidth: "100%" }} />
            <p className="font-fredoka text-center text-sm mt-3" style={{ color: "#888" }}>Space / Up to jump · Tap canvas on mobile</p>
          </div>
        )}

        {phase === "done" && (
          <div style={{ border: "2.5px solid #1a1a1a", borderRadius: 20, padding: 36, boxShadow: "5px 5px 0 #1a1a1a", background: "#fff", maxWidth: 380, textAlign: "center" }}>
            <div style={{ fontSize: 72 }}>🎉</div>
            <h2 className="font-bungee text-2xl mt-4">SESSION COMPLETE!</h2>
            <p className="font-fredoka text-4xl font-bold mt-2" style={{ color: "#FF9F43" }}>+{pendingWolf} WOLF</p>
            {!claimed && user && (
              <>
                <p className="font-fredoka text-sm mt-2 mb-5" style={{ color: "#666" }}>Claim your WOLF to add them to your balance!</p>
                <button
                  ref={claimBtnRef}
                  onClick={handleClaim}
                  style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 16, padding: "16px 40px", fontFamily: "Bungee,sans-serif", fontSize: 18, cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a", color: "#1a1a1a", marginBottom: 16, display: "block", width: "100%" }}
                >CLAIM {pendingWolf} WOLF ⬆️</button>
              </>
            )}
            {claimed && <p className="font-fredoka text-sm mt-2 mb-4" style={{ color: "#6BCB77" }}>✓ Added to your balance!</p>}
            {!user && <p className="font-fredoka text-sm mt-1 mb-4" style={{ color: "#FF6B6B" }}>⚠️ Login to save your WOLF earnings</p>}
            <div className="flex gap-3 justify-center flex-wrap mt-2">
              {btn("PLAY AGAIN", "#FFD93D", () => setPhase("start"))}
              {btn("ALL GAMES", "#A29BFE", () => nav("/games"))}
            </div>
          </div>
        )}
      </div>
    </MemeShell>
  );
}
