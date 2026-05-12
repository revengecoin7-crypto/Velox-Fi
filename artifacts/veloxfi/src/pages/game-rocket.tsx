import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import GameShell from "@/components/GameShell";
import TokenFly from "@/components/TokenFly";
import { useAuth } from "@/context/AuthContext";

const W = 360, H = 520;
const SESSION_SECS = 120;
const ROCKET_W = 36, ROCKET_H = 52;
const BULLET_W = 6, BULLET_H = 14;
const AST_MIN = 28, AST_MAX = 52;

interface Bullet { x: number; y: number; active: boolean }
interface Asteroid { x: number; y: number; r: number; vy: number; color: string; hp: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string }

const AST_COLORS = ["#A29BFE", "#4CC9F0", "#6BCB77", "#FF9F43"];

function initState() {
  return {
    rocketX: W / 2 - ROCKET_W / 2,
    bullets: [] as Bullet[],
    asteroids: [] as Asteroid[],
    particles: [] as Particle[],
    score: 0, lives: 3, timeLeft: SESSION_SECS,
    lastSec: 0, lastShot: 0, lastSpawn: 0,
    keys: { left: false, right: false, space: false },
    running: false, raf: 0, invincible: 0,
  };
}

export default function GameRocket() {
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

    function onKey(e: KeyboardEvent) {
      const down = e.type === "keydown";
      if (e.key === "ArrowLeft" || e.key === "a") g.keys.left = down;
      if (e.key === "ArrowRight" || e.key === "d") g.keys.right = down;
      if (e.key === " ") { g.keys.space = down; e.preventDefault(); }
      if (e.key.startsWith("Arrow")) e.preventDefault();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("keyup", onKey);

    function spawnAst() {
      const r = AST_MIN / 2 + Math.random() * (AST_MAX - AST_MIN) / 2;
      g.asteroids.push({
        x: r + Math.random() * (W - r * 2),
        y: -r,
        r,
        vy: 1 + Math.random() * 2,
        color: AST_COLORS[Math.floor(Math.random() * AST_COLORS.length)],
        hp: 1,
      });
    }

    function explode(x: number, y: number, color: string) {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        g.particles.push({ x, y, vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3, life: 20, color });
      }
    }

    function draw() {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      // Background
      ctx.fillStyle = "#070b1a"; ctx.fillRect(0, 0, W, H);
      // Stars
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      for (let i = 0; i < 40; i++) { ctx.fillRect((i * 97) % W, (i * 67) % H, 1.5, 1.5); }

      // Particles
      g.particles.forEach(p => {
        ctx.globalAlpha = p.life / 20;
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Asteroids
      g.asteroids.forEach(a => {
        ctx.fillStyle = a.color; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.arc(a.x - a.r * 0.25, a.y - a.r * 0.2, a.r * 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `bold ${Math.floor(a.r * 0.8)}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("⚙️", a.x, a.y);
      });

      // Bullets
      ctx.fillStyle = "#FFD93D";
      g.bullets.forEach(b => { if (b.active) { ctx.beginPath(); ctx.roundRect(b.x - BULLET_W / 2, b.y, BULLET_W, BULLET_H, 3); ctx.fill(); } });

      // Rocket
      const rx = g.rocketX;
      const flash = g.invincible > 0 && Math.floor(g.invincible / 4) % 2 === 0;
      if (!flash) {
        // Engine flame
        ctx.fillStyle = "#FF6B6B";
        ctx.beginPath(); ctx.moveTo(rx + ROCKET_W / 2 - 8, H - 80 + ROCKET_H); ctx.lineTo(rx + ROCKET_W / 2 + 8, H - 80 + ROCKET_H); ctx.lineTo(rx + ROCKET_W / 2, H - 80 + ROCKET_H + 18); ctx.closePath(); ctx.fill();

        // Body
        ctx.fillStyle = "#4CC9F0"; ctx.beginPath(); ctx.roundRect(rx, H - 80, ROCKET_W, ROCKET_H, 6); ctx.fill();
        ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2.5; ctx.stroke();
        // Nose
        ctx.fillStyle = "#FF6B9D"; ctx.beginPath(); ctx.moveTo(rx + ROCKET_W / 2, H - 80 - 20); ctx.lineTo(rx, H - 80); ctx.lineTo(rx + ROCKET_W, H - 80); ctx.closePath(); ctx.fill(); ctx.stroke();
        // Window
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(rx + ROCKET_W / 2, H - 80 + 18, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#1a1a2e"; ctx.beginPath(); ctx.arc(rx + ROCKET_W / 2, H - 80 + 18, 6, 0, Math.PI * 2); ctx.fill();
      }
    }

    function tick(now: number) {
      if (!g.running) return;

      // Timer
      if (!g.lastSec) g.lastSec = now;
      if (now - g.lastSec >= 1000) { g.timeLeft--; g.lastSec = now; setTime(g.timeLeft); if (g.timeLeft <= 0) { end(); return; } }

      // Move rocket
      const speed = 5;
      if (g.keys.left) g.rocketX = Math.max(0, g.rocketX - speed);
      if (g.keys.right) g.rocketX = Math.min(W - ROCKET_W, g.rocketX + speed);

      // Shoot
      if (g.keys.space && now - g.lastShot > 250) {
        g.lastShot = now;
        g.bullets.push({ x: g.rocketX + ROCKET_W / 2, y: H - 80, active: true });
      }

      // Spawn asteroids
      if (now - g.lastSpawn > Math.max(400, 1400 - g.score * 30)) { g.lastSpawn = now; spawnAst(); }

      // Move bullets
      g.bullets.forEach(b => { b.y -= 10; if (b.y < -BULLET_H) b.active = false; });
      g.bullets = g.bullets.filter(b => b.active);

      // Move asteroids
      g.asteroids.forEach(a => { a.y += a.vy; });

      // Move particles
      g.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; });
      g.particles = g.particles.filter(p => p.life > 0);

      // Bullet-asteroid collision
      for (const b of g.bullets) {
        for (const a of g.asteroids) {
          if (Math.hypot(b.x - a.x, b.y - a.y) < a.r + BULLET_W / 2) {
            b.active = false; a.hp--;
            if (a.hp <= 0) { explode(a.x, a.y, a.color); a.y = H + 100; g.score++; setScore(g.score); }
          }
        }
      }
      g.asteroids = g.asteroids.filter(a => a.y < H + a.r * 2);

      // Rocket-asteroid collision
      if (g.invincible > 0) g.invincible--;
      else {
        const ry = H - 80;
        for (const a of g.asteroids) {
          if (Math.hypot(g.rocketX + ROCKET_W / 2 - a.x, ry + ROCKET_H / 2 - a.y) < a.r + Math.min(ROCKET_W, ROCKET_H) / 2 - 6) {
            g.lives--; setLives(g.lives); g.invincible = 90; explode(g.rocketX + ROCKET_W / 2, ry + ROCKET_H / 2, "#FF6B6B");
            if (g.lives <= 0) { end(); return; }
            break;
          }
        }
      }

      // Asteroid fell past bottom
      g.asteroids = g.asteroids.filter(a => {
        if (a.y > H + a.r && a.hp > 0) {
          if (g.invincible <= 0) { g.lives--; setLives(g.lives); g.invincible = 60; if (g.lives <= 0) { end(); } }
          return false;
        }
        return true;
      });

      draw();
      g.raf = requestAnimationFrame(tick);
    }

    function end() { g.running = false; setPendingWolf(g.score); setPhase("done"); }
    g.raf = requestAnimationFrame(tick);

    return () => {
      g.running = false; cancelAnimationFrame(g.raf);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKey);
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
    void addGameSession("rocket", pendingWolf);
    setClaimed(true);
    setFlyShow(true);
  }

  return (
    <GameShell
      testId="page-game-rocket"
      title="Rocket Miner"
      tag="CRASH GAME"
      description="Watch the multiplier climb and cash out before the rocket crashes. Wait longer for bigger rewards — but don't get greedy."
      boost={3.2}
      sessionReward={`+${pendingWolf} BATTLE`}
      powerUps={[
        { icon: "🚀", name: "Auto-launch", desc: "Starts next round faster" },
        { icon: "📡", name: "Signal boost", desc: "+0.5 to final multiplier" },
        { icon: "🔮", name: "Oracle", desc: "See crash point once" },
      ]}
      controls={[
        { key: "Space", action: "Cash out" },
        { key: "Click", action: "Cash out" },
        { key: "Enter", action: "New round" },
      ]}
    >
      <TokenFly
        count={Math.min(pendingWolf, 10)}
        show={flyShow}
        fromX={flyFrom.x}
        fromY={flyFrom.y}
        onComplete={() => setFlyShow(false)}
      />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "20px 16px" }}>

        {phase === "start" && (
          <div style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>
            <div className="display" style={{ fontSize: 36, color: "white", marginBottom: 6 }}>ROCKET MINER</div>
            <div className="mono" style={{ fontSize: 12, color: "var(--magenta)", marginBottom: 18 }}>CRASH · RISK · 3 LIVES</div>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,43,214,0.4)", borderRadius: 14, padding: 18, marginBottom: 16, textAlign: "left" }}>
              {[["← →","Move rocket"],["Space","Shoot"],["1 hit","= 1 WOLF"],["3 lives","= 3 chances"],["2 min","session limit"]].map(([k,v]) => (
                <div key={String(k)} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ padding: "1px 8px", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 5, fontSize: 12, fontFamily: "JetBrains Mono,monospace" }}>{k}</span>
                  <span className="mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{v}</span>
                </div>
              ))}
            </div>
            {!user && <div className="mono" style={{ fontSize: 11, color: "var(--tomato)", marginBottom: 10 }}>⚠ Login to save earnings</div>}
            <button className="btn lg magenta" style={{ width: "100%", justifyContent: "center", fontSize: 18 }} onClick={() => setPhase("playing")}>LAUNCH 🚀</button>
          </div>
        )}

        {phase === "playing" && (
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, width: W }}>
              <div className="display tabular" style={{ fontSize: 20, color: "var(--magenta)" }}>{score} WOLF</div>
              <div className="mono" style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{"❤️".repeat(lives)}{"🖤".repeat(3 - lives)}</div>
              <div className="mono" style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>⏱ {fmt(time)}</div>
            </div>
            <canvas ref={canvasRef} width={W} height={H} style={{ border: "2px solid rgba(255,43,214,0.4)", borderRadius: 10, display: "block" }} />
            <div className="mono" style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>← → to move · Space to shoot</div>
          </div>
        )}

        {phase === "done" && (
          <div style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
            <div className="display" style={{ fontSize: 28, color: "white" }}>SESSION COMPLETE!</div>
            <div className="display tabular" style={{ fontSize: 56, color: "var(--magenta)", marginTop: 8 }}>+{pendingWolf}</div>
            <div className="mono" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>WOLF TOKENS</div>
            {!claimed && user && (
              <button ref={claimBtnRef} onClick={handleClaim} className="btn lg magenta" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}>
                CLAIM {pendingWolf} WOLF ↑
              </button>
            )}
            {claimed && <div className="mono" style={{ fontSize: 12, color: "var(--lime)", marginBottom: 12 }}>✓ Added to your balance!</div>}
            {!user && <div className="mono" style={{ fontSize: 11, color: "var(--tomato)", marginBottom: 12 }}>⚠ Login to save earnings</div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn lg primary" onClick={() => setPhase("start")}>Play again</button>
              <button className="btn lg" onClick={() => nav("/games")}>All games</button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
