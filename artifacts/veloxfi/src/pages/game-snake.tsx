import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import GameShell from "@/components/GameShell";
import TokenFly from "@/components/TokenFly";
import { useAuth } from "@/context/AuthContext";

// ─── constants ───────────────────────────────────────────────
const COLS = 26, ROWS = 22, CELL = 28;
const W = COLS * CELL, H = ROWS * CELL;        // 728 × 616
const CLAIM_THRESHOLD = 15;
const BASE_SPEED = 155;
const MIN_SPEED   = 65;
const SPEED_STEP  = 12;   // ms faster per level
const COMBO_WINDOW = 90;  // frames to keep combo alive
const URGENCY_SECS = 8;   // seconds without food → warning
const HS_KEY = "vfx_snake_hs_v2";

type Pt = { x: number; y: number };
type PUType = "shield" | "diamond" | "shrink" | "slow" | "star";

interface Particle { x:number;y:number;vx:number;vy:number;life:number;maxLife:number;color:string;size:number }
interface FloatText { x:number;y:number;text:string;color:string;life:number;vy:number }
interface PowerUp   { x:number;y:number;type:PUType;frames:number }

const PU_COLOR: Record<PUType, string> = {
  shield: "#4CC9F0", diamond: "#A29BFE",
  shrink: "#FF9F43", slow: "#6BCB77", star: "#FFD93D",
};
const PU_EMOJI: Record<PUType, string> = {
  shield: "🛡️", diamond: "💎", shrink: "🌀", slow: "⏳", star: "⭐",
};
const PU_LABEL: Record<PUType, string> = {
  shield: "SHIELD!", diamond: "+5 WOLF 💎", shrink: "SHRINK!", slow: "TIME SLOW!", star: "STAR MODE! ⭐",
};

function rnd(excl: Pt[]): Pt {
  let p: Pt;
  do { p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
  while (excl.some(e => e.x === p.x && e.y === p.y));
  return p;
}

function initState() {
  const snake: Pt[] = [{ x: 13, y: 11 }, { x: 12, y: 11 }, { x: 11, y: 11 }];
  return {
    snake, dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
    food: rnd(snake), food2: null as Pt | null,
    foodPulse: 0,
    pu: null as PowerUp | null, puSpawn: 500,
    score: 0, level: 1, lives: 3,
    timeLeft: 0, lastSec: 0,
    lastTick: 0, tickSpeed: BASE_SPEED,
    running: false, raf: 0,
    combo: 0, comboTimer: 0,
    hungerTimer: 0,          // frames since last food
    shieldOn: false, shieldTimer: 0,
    starOn: false,   starTimer: 0,
    slowTimer: 0,
    invincible: 0,
    levelFlash: 0, deathFlash: 0, starFlash: 0,
    particles: [] as Particle[],
    floats: [] as FloatText[],
  };
}

// ─── component ───────────────────────────────────────────────
export default function GameSnake() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const gs         = useRef(initState());
  const [phase,    setPhase]    = useState<"start"|"playing"|"done">("start");
  const [score,    setScore]    = useState(0);
  const [lives,    setLives]    = useState(3);
  const [time,     setTime]     = useState(0);
  const [level,    setLevel]    = useState(1);
  const [combo,    setCombo]    = useState(0);
  const [shield,   setShield]   = useState(false);
  const [star,     setStar]     = useState(false);
  const [urgent,   setUrgent]   = useState(false);
  const [pendingWolf, setPendingWolf] = useState(0);
  const [claimed,  setClaimed]  = useState(false);
  const [flyShow,  setFlyShow]  = useState(false);
  const [flyFrom,  setFlyFrom]  = useState({ x: 0, y: 0 });
  const [newRecord,setNewRecord]= useState(false);
  const [highScore,setHighScore]= useState(() => parseInt(localStorage.getItem(HS_KEY)||"0"));
  const claimRef   = useRef<HTMLButtonElement>(null);
  const { addGameSession, user } = useAuth();
  const [, nav] = useLocation();

  // ── game loop ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    const g = gs.current;
    Object.assign(g, initState());
    g.running = true;
    setScore(0); setLives(3); setTime(0); setLevel(1);
    setCombo(0); setShield(false); setStar(false); setUrgent(false);
    setClaimed(false); setPendingWolf(0); setNewRecord(false);

    // ── input ──────────────────────────────────────────────
    function onKey(e: KeyboardEvent) {
      if (["ArrowUp","w","W"].includes(e.key)    && g.dir.y !== 1)  g.nextDir = { x: 0, y:-1 };
      if (["ArrowDown","s","S"].includes(e.key)  && g.dir.y !== -1) g.nextDir = { x: 0, y: 1 };
      if (["ArrowLeft","a","A"].includes(e.key)  && g.dir.x !== 1)  g.nextDir = { x:-1, y: 0 };
      if (["ArrowRight","d","D"].includes(e.key) && g.dir.x !== -1) g.nextDir = { x: 1, y: 0 };
      if (e.key.startsWith("Arrow")) e.preventDefault();
    }
    let tx = 0, ty = 0;
    function onTouchStart(e: TouchEvent) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }
    function onTouchEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && g.dir.x !== -1) g.nextDir = { x: 1, y: 0 };
        else if (dx < 0 && g.dir.x !== 1) g.nextDir = { x:-1, y: 0 };
      } else {
        if (dy > 0 && g.dir.y !== -1) g.nextDir = { x: 0, y: 1 };
        else if (dy < 0 && g.dir.y !== 1) g.nextDir = { x: 0, y:-1 };
      }
      e.preventDefault();
    }
    document.addEventListener("keydown", onKey);
    const cv = canvasRef.current!;
    cv.addEventListener("touchstart", onTouchStart, { passive: true });
    cv.addEventListener("touchend", onTouchEnd);

    // ── helpers ───────────────────────────────────────────
    function burst(cx: number, cy: number, color: string, n = 10) {
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.6;
        const sp = 1.2 + Math.random() * 2.8;
        g.particles.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
          life: 35+Math.random()*20, maxLife: 55, color, size: 2.5+Math.random()*2.5 });
      }
    }
    function floatText(x: number, y: number, txt: string, color: string) {
      g.floats.push({ x, y, text: txt, color, life: 55, vy: -1.4 });
    }

    // ── draw ──────────────────────────────────────────────
    function draw(now: number) {
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      const t = now * 0.001;

      // ── background ──
      ctx.fillStyle = "#090914";
      ctx.fillRect(0, 0, W, H);

      // animated scanline grid
      for (let x = 0; x <= COLS; x++) {
        const a = 0.04 + 0.02 * Math.sin(t * 0.7 + x * 0.3);
        ctx.strokeStyle = `rgba(80,80,255,${a})`; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x*CELL, 0); ctx.lineTo(x*CELL, H); ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        const a = 0.04 + 0.02 * Math.sin(t * 0.7 + y * 0.3);
        ctx.strokeStyle = `rgba(80,80,255,${a})`; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, y*CELL); ctx.lineTo(W, y*CELL); ctx.stroke();
      }

      // ── level flash ──
      if (g.levelFlash > 0) {
        ctx.fillStyle = `rgba(255,150,0,${g.levelFlash/30*0.45})`;
        ctx.fillRect(0, 0, W, H); g.levelFlash--;
      }
      // ── death flash ──
      if (g.deathFlash > 0) {
        ctx.fillStyle = `rgba(255,40,40,${g.deathFlash/20*0.55})`;
        ctx.fillRect(0, 0, W, H); g.deathFlash--;
      }
      // ── star flash ──
      if (g.starFlash > 0) {
        ctx.fillStyle = `rgba(255,217,61,${g.starFlash/20*0.4})`;
        ctx.fillRect(0, 0, W, H); g.starFlash--;
      }
      // ── urgency vignette ──
      if (g.hungerTimer > 60 * URGENCY_SECS * 0.6) {
        const pulse = 0.15 + 0.12 * Math.sin(t * 8);
        const grad = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.75);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, `rgba(255,40,0,${pulse})`);
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      }

      // ── food 1 ──
      g.foodPulse = (g.foodPulse + 0.1) % (Math.PI * 2);
      const sc1 = 0.82 + Math.sin(g.foodPulse) * 0.18;
      drawCoin(ctx, g.food.x, g.food.y, sc1, "#FFD93D");

      // ── food 2 ──
      if (g.food2) {
        const sc2 = 0.82 + Math.sin(g.foodPulse + 1.5) * 0.18;
        drawCoin(ctx, g.food2.x, g.food2.y, sc2, "#FF9F43");
      }

      // ── power-up ──
      if (g.pu) {
        const rot = t * 2;
        const px = g.pu.x * CELL + CELL/2, py = g.pu.y * CELL + CELL/2;
        const col = PU_COLOR[g.pu.type];
        ctx.save(); ctx.translate(px, py); ctx.rotate(rot);
        ctx.shadowColor = col; ctx.shadowBlur = 18;
        ctx.strokeStyle = col; ctx.lineWidth = 2.5;
        // hexagon glow ring
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          i === 0 ? ctx.moveTo(Math.cos(a)*(CELL/2-1), Math.sin(a)*(CELL/2-1))
                  : ctx.lineTo(Math.cos(a)*(CELL/2-1), Math.sin(a)*(CELL/2-1));
        }
        ctx.closePath(); ctx.stroke(); ctx.shadowBlur = 0; ctx.restore();
        ctx.font = `${CELL - 5}px serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(PU_EMOJI[g.pu.type], px, py + 1);
        // despawn warning: blink when < 100 frames left
        if (g.pu.frames < 100 && Math.floor(t * 8) % 2 === 0) {
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = "#fff";
          ctx.beginPath(); ctx.arc(px, py, CELL/2, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // ── snake ──
      const len = g.snake.length;
      g.snake.forEach((p, i) => {
        const isHead = i === 0;
        const ratio = i / Math.max(len - 1, 1);
        const cx = p.x * CELL + 1, cy = p.y * CELL + 1;
        const cw = CELL - 2, ch = CELL - 2;

        if (isHead) {
          const hue = g.starOn ? 50 : g.shieldOn ? 195 : 145;
          const glow = g.starOn ? "#FFD93D" : g.shieldOn ? "#4CC9F0" : "#00ff88";
          ctx.shadowColor = glow; ctx.shadowBlur = 22;
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 6); ctx.fill();
          ctx.shadowBlur = 0;
          // wolf emoji head
          ctx.font = `${CELL - 3}px serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("🐺", p.x * CELL + CELL/2, p.y * CELL + CELL/2 + 1);
        } else {
          // gradient body: bright green → dark teal
          const r = Math.round(0 + ratio * 10);
          const g2 = Math.round(220 - ratio * 160);
          const b = Math.round(100 - ratio * 80);
          if (g.starOn) {
            ctx.fillStyle = `hsl(${(i * 20 + t * 200) % 360}, 100%, 55%)`;
          } else if (g.shieldOn) {
            ctx.fillStyle = i % 2 === 0 ? "#4CC9F0" : "#0099cc";
          } else {
            ctx.fillStyle = `rgb(${r},${g2},${b})`;
          }
          // pulsing glow on first few segments
          if (i < 4) {
            const glow = g.starOn ? "#FFD93D" : g.shieldOn ? "#4CC9F0" : "#00ff88";
            ctx.shadowColor = glow;
            ctx.shadowBlur = Math.max(0, 12 - i * 3);
          }
          ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 4); ctx.fill();
          ctx.shadowBlur = 0;
          // scale pattern
          if (!g.starOn && !g.shieldOn && i > 0 && i % 2 === 0) {
            ctx.strokeStyle = "rgba(255,255,255,0.10)";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(cx+2, cy+2, cw-4, ch-4, 3); ctx.stroke();
          }
        }
      });

      // ── particles ──
      g.particles = g.particles.filter(p => p.life > 0);
      for (const p of g.particles) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha * alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color; ctx.shadowBlur = 7;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2); ctx.fill();
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life--;
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      // ── floating texts ──
      g.floats = g.floats.filter(f => f.life > 0);
      for (const f of g.floats) {
        ctx.globalAlpha = Math.min(1, f.life / 20);
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color; ctx.shadowBlur = 10;
        ctx.font = "bold 13px 'Bungee', sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(f.text, f.x, f.y);
        f.y += f.vy; f.life--;
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }

    function drawCoin(ctx: CanvasRenderingContext2D, gx: number, gy: number, scale: number, color: string) {
      const cx = gx * CELL + CELL/2, cy = gy * CELL + CELL/2;
      const r = (CELL/2 - 2) * scale;
      ctx.shadowColor = color; ctx.shadowBlur = 16;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // inner shine
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath(); ctx.arc(cx - r*0.25, cy - r*0.3, r*0.35, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1a1a1a";
      ctx.font = `bold ${Math.max(8, Math.floor(r * 1.3))}px monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("$", cx, cy + 1);
    }

    // ── tick / game logic ─────────────────────────────────
    function resetSnake() {
      g.snake = [{ x: 13, y: 11 }, { x: 12, y: 11 }, { x: 11, y: 11 }];
      g.dir = { x: 1, y: 0 }; g.nextDir = { x: 1, y: 0 };
      g.invincible = 80;
      g.deathFlash = 22;
      g.combo = 0; g.comboTimer = 0;
      setCombo(0);
    }

    function applyPU(type: PUType) {
      const hx = g.snake[0].x * CELL + CELL/2, hy = g.snake[0].y * CELL + CELL/2;
      burst(hx, hy, PU_COLOR[type], 16);
      floatText(W/2, H/2 - 30, PU_LABEL[type], PU_COLOR[type]);
      if (type === "shield") { g.shieldOn = true; g.shieldTimer = 480; setShield(true); }
      else if (type === "diamond") {
        const gain = 5;
        g.score += gain; setScore(g.score);
        floatText(hx, hy - 14, `+${gain} WOLF`, "#A29BFE");
      }
      else if (type === "shrink") {
        if (g.snake.length > 4) g.snake = g.snake.slice(0, Math.max(4, Math.floor(g.snake.length * 0.6)));
      }
      else if (type === "slow") { g.slowTimer = 360; }
      else if (type === "star") { g.starOn = true; g.starTimer = 300; g.starFlash = 20; setStar(true); }
      g.pu = null;
    }

    function tick(now: number) {
      if (!g.running) return;

      // ── 1s timer ──
      if (!g.lastSec) g.lastSec = now;
      if (now - g.lastSec >= 1000) {
        g.timeLeft++; g.lastSec = now; setTime(g.timeLeft);
      }

      // ── per-frame timers ──
      if (g.invincible > 0) g.invincible--;
      if (g.shieldTimer > 0) { g.shieldTimer--; if (!g.shieldTimer) { g.shieldOn = false; setShield(false); } }
      if (g.starTimer   > 0) { g.starTimer--;   if (!g.starTimer)   { g.starOn   = false; setStar(false);   } }
      if (g.comboTimer  > 0) { g.comboTimer--;  if (!g.comboTimer && g.combo > 0) { g.combo = 0; setCombo(0); } }
      if (g.slowTimer   > 0) g.slowTimer--;

      g.hungerTimer++;
      setUrgent(g.hungerTimer > 60 * URGENCY_SECS * 0.7);

      // ── power-up spawn ──
      if (!g.pu) {
        g.puSpawn--;
        if (g.puSpawn <= 0) {
          if (Math.random() < 0.45) {
            const types: PUType[] = ["shield","diamond","shrink","slow","star"];
            const type = types[Math.floor(Math.random() * types.length)];
            const pos = rnd([...g.snake, g.food, ...(g.food2 ? [g.food2] : [])]);
            g.pu = { ...pos, type, frames: 360 };
          }
          g.puSpawn = 400 + Math.random() * 400;
        }
      }
      if (g.pu) { g.pu.frames--; if (g.pu.frames <= 0) g.pu = null; }

      // ── snake tick ──
      const effectiveSpeed = g.slowTimer > 0
        ? Math.min(BASE_SPEED, g.tickSpeed + 55)
        : g.starOn ? Math.max(MIN_SPEED - 10, g.tickSpeed - 30)
        : g.tickSpeed;

      if (!g.lastTick) g.lastTick = now;
      if (now - g.lastTick >= effectiveSpeed) {
        g.lastTick = now;
        g.dir = g.nextDir;
        const head = {
          x: (g.snake[0].x + g.dir.x + COLS) % COLS, // wrap walls
          y: (g.snake[0].y + g.dir.y + ROWS) % ROWS,
        };
        const hitSelf = g.snake.slice(1).some(p => p.x === head.x && p.y === head.y);

        if (hitSelf && g.invincible <= 0 && !g.starOn) {
          if (g.shieldOn) {
            burst(head.x*CELL+CELL/2, head.y*CELL+CELL/2, "#4CC9F0", 12);
            floatText(W/2, H/2, "🛡️ BLOCKED!", "#4CC9F0");
            g.shieldOn = false; g.shieldTimer = 0; setShield(false);
            resetSnake();
          } else {
            burst(g.snake[0].x*CELL+CELL/2, g.snake[0].y*CELL+CELL/2, "#FF4444", 20);
            g.lives--; setLives(g.lives);
            if (g.lives <= 0) { end(); return; }
            resetSnake();
          }
        } else {
          g.snake.unshift(head);

          const eatFood1 = head.x === g.food.x && head.y === g.food.y;
          const eatFood2 = g.food2 && head.x === g.food2.x && head.y === g.food2.y;

          if (eatFood1 || eatFood2) {
            g.combo++; g.comboTimer = COMBO_WINDOW; setCombo(g.combo);
            g.hungerTimer = 0; setUrgent(false);

            const mult = g.starOn ? 3 : Math.min(g.combo, 4);
            const gain = mult;
            g.score += gain; setScore(g.score);

            const cx2 = head.x*CELL+CELL/2, cy2 = head.y*CELL+CELL/2;
            const fcol = g.starOn ? "#FFD93D" : mult > 1 ? "#FF9F43" : "#6BCB77";
            burst(cx2, cy2, fcol, 10);
            floatText(cx2, cy2 - 10,
              `+${gain} WOLF${mult > 1 ? ` ×${mult}!` : ""}`,
              fcol
            );

            if (eatFood1) g.food = rnd([...g.snake, ...(g.food2 ? [g.food2] : [])]);
            else          g.food2 = null;

            // level up every 10 score
            const newLv = Math.floor(g.score / 10) + 1;
            if (newLv > g.level) {
              g.level = newLv; setLevel(newLv);
              g.tickSpeed = Math.max(MIN_SPEED, BASE_SPEED - (newLv-1)*SPEED_STEP);
              g.levelFlash = 32;
              burst(W/2, H/2, "#FF9F43", 22);
              floatText(W/2, H/2 - 40, `LEVEL ${newLv} 🔥 FASTER!`, "#FF9F43");
              // spawn second food at higher levels
              if (newLv >= 3 && !g.food2) {
                g.food2 = rnd([...g.snake, g.food]);
              }
            }
          } else {
            g.snake.pop();
          }

          // power-up pickup
          if (g.pu && head.x === g.pu.x && head.y === g.pu.y) applyPU(g.pu.type);
        }
      }

      draw(now);
      g.raf = requestAnimationFrame(tick);
    }

    function end() {
      g.running = false;
      const prev = parseInt(localStorage.getItem(HS_KEY)||"0");
      if (g.score > prev) { localStorage.setItem(HS_KEY, String(g.score)); setHighScore(g.score); setNewRecord(true); }
      setPendingWolf(g.score); setPhase("done");
    }

    g.raf = requestAnimationFrame(tick);
    return () => {
      g.running = false; cancelAnimationFrame(g.raf);
      document.removeEventListener("keydown", onKey);
      cv.removeEventListener("touchstart", onTouchStart);
      cv.removeEventListener("touchend", onTouchEnd);
    };
  }, [phase]);

  // ── claim handler ─────────────────────────────────────────
  function handleClaim() {
    if (claimed || pendingWolf <= 0) return;
    if (claimRef.current) {
      const r = claimRef.current.getBoundingClientRect();
      setFlyFrom({ x: r.left + r.width/2, y: r.top + r.height/2 });
    }
    void addGameSession("snake", pendingWolf);
    setClaimed(true); setFlyShow(true);
  }

  // ── D-pad press ───────────────────────────────────────────
  function dpad(dx: number, dy: number) {
    const g = gs.current;
    if (dx ===  1 && g.dir.x !== -1) g.nextDir = { x: 1, y: 0 };
    if (dx === -1 && g.dir.x !==  1) g.nextDir = { x:-1, y: 0 };
    if (dy ===  1 && g.dir.y !== -1) g.nextDir = { x: 0, y: 1 };
    if (dy === -1 && g.dir.y !==  1) g.nextDir = { x: 0, y:-1 };
  }

  const fmt = (t: number) => `${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`;
  const comboMult = Math.min(combo, 4);

  // ── render ────────────────────────────────────────────────
  return (
    <GameShell
      testId="page-game-snake"
      title="Crypto Snake"
      tag="SOLO · CLASSIC"
      description="Eat $BATTLE coins to grow. Hit a wall or yourself — your rig overheats and the round ends."
      boost={1.5}
      sessionReward={`+${pendingWolf} BATTLE`}
      powerUps={[
        { icon: "🪙", name: "Coin", desc: "+1 BATTLE" },
        { icon: "⚡", name: "Lightning", desc: "+2 speed for 3s · +5 BATTLE" },
        { icon: "🛡", name: "Shield", desc: "1 free wall hit" },
      ]}
      controls={[
        { key: "←/→", action: "Move" },
        { key: "↑/↓", action: "Move" },
        { key: "Space", action: "Action" },
      ]}
    >
      <TokenFly count={Math.min(pendingWolf, 12)} show={flyShow}
        fromX={flyFrom.x} fromY={flyFrom.y} onComplete={() => setFlyShow(false)} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "20px 16px" }}>

        {/* ── START ── */}
        {phase === "start" && (
          <div style={{ maxWidth: 440, width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div className="display" style={{ fontSize: 40, color: "white", lineHeight: 1 }}>CRYPTO SNAKE</div>
              <div className="mono" style={{ fontSize: 12, color: "var(--cyan)", marginTop: 6 }}>
                SOLO · CLASSIC {highScore > 0 && `· BEST: ${highScore} WOLF`}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "2px solid rgba(8,209,242,0.3)", borderRadius: 14, padding: 18, marginBottom: 16 }}>
              {[
                ["🪙","Eat $ coins to earn WOLF tokens"],
                ["🔥","Combo streak → ×2 ×3 ×4 bonus"],
                ["🛡","Shield — blocks one death"],
                ["⭐","Star mode — ×3 WOLF, pass through self"],
                ["❤️","3 lives · No time limit"],
              ].map(([ic, tx]) => (
                <div key={String(tx)} style={{ display: "flex", gap: 10, alignItems: "center", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: 16, width: 24 }}>{ic}</span>
                  <span className="mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{tx}</span>
                </div>
              ))}
            </div>
            {!user && <div className="mono" style={{ fontSize: 11, color: "var(--tomato)", textAlign: "center", marginBottom: 10 }}>⚠ Login to save earnings</div>}
            <button onClick={() => setPhase("playing")} className="btn lg magenta" style={{ width: "100%", justifyContent: "center", fontSize: 18 }}>
              PLAY NOW 🐺
            </button>
          </div>
        )}

        {/* ── PLAYING ── */}
        {phase === "playing" && (
          <div style={{ width: "100%", position: "relative" }}>
            {/* Claim bar at top of canvas */}
            <div style={{ padding: "8px 12px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {combo > 1 && <span className="mono" style={{ fontSize: 10, color: "var(--yellow)", background: "rgba(255,204,43,0.15)", padding: "2px 6px", borderRadius: 4 }}>🔥 COMBO ×{comboMult}</span>}
                {shield && <span className="mono" style={{ fontSize: 10, color: "var(--cyan)", background: "rgba(8,209,242,0.15)", padding: "2px 6px", borderRadius: 4 }}>🛡 SHIELD</span>}
                {star && <span className="mono" style={{ fontSize: 10, color: "var(--yellow)", background: "rgba(255,204,43,0.15)", padding: "2px 6px", borderRadius: 4 }}>⭐ STAR ×3</span>}
                {urgent && !star && <span className="mono" style={{ fontSize: 10, color: "var(--tomato)", background: "rgba(255,90,74,0.15)", padding: "2px 6px", borderRadius: 4 }}>⚠ EAT</span>}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{"❤️".repeat(lives)}{"🖤".repeat(Math.max(0, 3 - lives))}</span>
                <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>⏱ {fmt(time)}</span>
              </div>
            </div>
            {/* Claim bar */}
            <div style={{ height: 3, background: "rgba(255,255,255,0.05)", marginBottom: 2 }}>
              <div style={{ height: "100%", width: `${Math.min(100, (score / CLAIM_THRESHOLD) * 100)}%`, background: score >= CLAIM_THRESHOLD ? "var(--lime)" : "var(--cyan)", transition: "width 0.3s" }} />
            </div>

            <canvas ref={canvasRef} width={W} height={H}
              style={{ display: "block", width: "100%", touchAction: "none" }} />

            {/* D-pad mobile */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, maxWidth: 160, margin: "12px auto", padding: "0 16px 12px" }}>
              {[[null, { dx:0,dy:-1,icon:"↑" }, null],[{ dx:-1,dy:0,icon:"←" }, null, { dx:1,dy:0,icon:"→" }],[null, { dx:0,dy:1,icon:"↓" }, null]].map((row, ri) =>
                row.map((cell, ci) => cell ? (
                  <button key={`${ri}-${ci}`} onPointerDown={(e) => { e.preventDefault(); dpad(cell.dx, cell.dy); }}
                    style={{ aspectRatio: "1", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "white", cursor: "pointer" }}>
                    {cell.icon}
                  </button>
                ) : <div key={`${ri}-${ci}`} />)
              )}
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {phase === "done" && (
          <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>{newRecord ? "🏆" : "🎉"}</div>
            <div className="display" style={{ fontSize: 28, color: "white" }}>{newRecord ? "NEW RECORD!" : "SESSION COMPLETE!"}</div>
            <div className="display tabular" style={{ fontSize: 56, color: "var(--lime)", marginTop: 8 }}>+{pendingWolf}</div>
            <div className="mono" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>WOLF TOKENS</div>

            {!claimed && user && pendingWolf >= CLAIM_THRESHOLD && (
              <button ref={claimRef} onClick={handleClaim} className="btn lg magenta" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}>
                CLAIM {pendingWolf} WOLF ↑
              </button>
            )}
            {!claimed && user && pendingWolf < CLAIM_THRESHOLD && (
              <div style={{ background: "rgba(255,90,74,0.15)", border: "2px solid var(--tomato)", borderRadius: 12, padding: "12px", marginBottom: 12 }}>
                <div className="mono" style={{ fontSize: 12, color: "var(--tomato)" }}>Score too low to claim · need {CLAIM_THRESHOLD} WOLF</div>
              </div>
            )}
            {claimed && <div className="mono" style={{ fontSize: 12, color: "var(--lime)", marginBottom: 12 }}>✓ Added to your balance!</div>}
            {!user && <div className="mono" style={{ fontSize: 11, color: "var(--tomato)", marginBottom: 12 }}>⚠ Login to save earnings</div>}

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setPhase("start")} className="btn lg primary">Play again</button>
              <button onClick={() => nav("/games")} className="btn lg">All games</button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
