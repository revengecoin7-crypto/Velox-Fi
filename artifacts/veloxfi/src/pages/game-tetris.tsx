import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import MemeShell from "@/components/MemeShell";
import TokenFly from "@/components/TokenFly";
import { useAuth } from "@/context/AuthContext";

const COLS = 10, ROWS = 20, CELL = 24;
const W = COLS * CELL, H = ROWS * CELL;
const SESSION_SECS = 120;

const PIECES = [
  { shape: [[1,1,1,1]], color: "#4CC9F0" },           // I
  { shape: [[1,1],[1,1]], color: "#FFD93D" },          // O
  { shape: [[0,1,0],[1,1,1]], color: "#A29BFE" },      // T
  { shape: [[0,1,1],[1,1,0]], color: "#6BCB77" },      // S
  { shape: [[1,1,0],[0,1,1]], color: "#FF6B6B" },      // Z
  { shape: [[1,0,0],[1,1,1]], color: "#FF9F43" },      // J
  { shape: [[0,0,1],[1,1,1]], color: "#FF6B9D" },      // L
];

function rotate(m: number[][]): number[][] {
  return m[0].map((_, i) => m.map(row => row[i]).reverse());
}

function rndPiece() { return PIECES[Math.floor(Math.random() * PIECES.length)]; }

function initBoard(): (string | null)[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

type Piece = { shape: number[][]; color: string; x: number; y: number };

function canPlace(board: (string | null)[][], shape: number[][], x: number, y: number) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nr = y + r, nc = x + c;
      if (nr >= ROWS || nc < 0 || nc >= COLS || (nr >= 0 && board[nr][nc])) return false;
    }
  }
  return true;
}

function place(board: (string | null)[][], piece: Piece): (string | null)[][] {
  const b = board.map(r => [...r]);
  piece.shape.forEach((row, r) => row.forEach((v, c) => { if (v && piece.y + r >= 0) b[piece.y + r][piece.x + c] = piece.color; }));
  return b;
}

function clearLines(board: (string | null)[][]): { board: (string | null)[][]; lines: number } {
  const kept = board.filter(r => r.some(c => !c));
  const cleared = ROWS - kept.length;
  const empty = Array.from({ length: cleared }, () => Array<string | null>(COLS).fill(null));
  return { board: [...empty, ...kept], lines: cleared };
}

function newPiece(): Piece {
  const p = rndPiece();
  return { ...p, x: Math.floor((COLS - p.shape[0].length) / 2), y: -p.shape.length };
}

function initState() {
  return { board: initBoard(), piece: newPiece(), score: 0, timeLeft: SESSION_SECS, dropTimer: 0, lastSec: 0, running: false, raf: 0 };
}

const DROP_INTERVAL = 600;

export default function GameTetris() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = useRef(initState());
  const [phase, setPhase] = useState<"start" | "playing" | "done">("start");
  const [score, setScore] = useState(0);
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
    setScore(0); setTime(SESSION_SECS); setClaimed(false); setPendingWolf(0);

    function onKey(e: KeyboardEvent) {
      const { piece, board } = g;
      if (e.key === "ArrowLeft" && canPlace(board, piece.shape, piece.x - 1, piece.y)) piece.x--;
      if (e.key === "ArrowRight" && canPlace(board, piece.shape, piece.x + 1, piece.y)) piece.x++;
      if (e.key === "ArrowDown") { if (canPlace(board, piece.shape, piece.x, piece.y + 1)) piece.y++; else lock(); }
      if (e.key === "ArrowUp" || e.key === " ") {
        const rot = rotate(piece.shape);
        if (canPlace(board, rot, piece.x, piece.y)) piece.shape = rot;
      }
      if (e.key.startsWith("Arrow") || e.key === " ") e.preventDefault();
    }
    document.addEventListener("keydown", onKey);

    function lock() {
      const g2 = s.current;
      if (g2.piece.y <= 0) { end(); return; }
      const placed = place(g2.board, g2.piece);
      const { board: cleared, lines } = clearLines(placed);
      const pts = [0, 1, 3, 5, 8][Math.min(lines, 4)];
      g2.board = cleared; g2.score += pts; setScore(g2.score);
      g2.piece = newPiece();
      if (!canPlace(g2.board, g2.piece.shape, g2.piece.x, g2.piece.y)) end();
    }

    function draw() {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#1a1a2e"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 0.5;
      for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
      for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }

      const g2 = s.current;
      g2.board.forEach((row, r) => row.forEach((col, c) => {
        if (!col) return;
        ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2, 3); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fillRect(c * CELL + 2, r * CELL + 2, CELL - 4, 4);
      }));

      const p = g2.piece;
      p.shape.forEach((row, r) => row.forEach((v, c) => {
        if (!v) return;
        const pr = p.y + r, pc = p.x + c;
        if (pr < 0) return;
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.roundRect(pc * CELL + 1, pr * CELL + 1, CELL - 2, CELL - 2, 3); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.fillRect(pc * CELL + 2, pr * CELL + 2, CELL - 4, 4);
      }));

      // Ghost piece
      let ghostY = p.y;
      while (canPlace(g2.board, p.shape, p.x, ghostY + 1)) ghostY++;
      if (ghostY !== p.y) {
        ctx.globalAlpha = 0.25;
        p.shape.forEach((row, r) => row.forEach((v, c) => {
          if (!v) return;
          const pr = ghostY + r, pc = p.x + c;
          if (pr < 0) return;
          ctx.fillStyle = p.color; ctx.beginPath(); ctx.roundRect(pc * CELL + 1, pr * CELL + 1, CELL - 2, CELL - 2, 3); ctx.fill();
        }));
        ctx.globalAlpha = 1;
      }
    }

    function tick(now: number) {
      if (!g.running) return;
      if (!g.lastSec) g.lastSec = now;
      if (now - g.lastSec >= 1000) { g.timeLeft--; g.lastSec = now; setTime(g.timeLeft); if (g.timeLeft <= 0) { end(); return; } }
      if (!g.dropTimer) g.dropTimer = now;
      if (now - g.dropTimer >= DROP_INTERVAL) {
        g.dropTimer = now;
        if (canPlace(g.board, g.piece.shape, g.piece.x, g.piece.y + 1)) g.piece.y++;
        else lock();
      }
      draw();
      g.raf = requestAnimationFrame(tick);
    }

    function end() { g.running = false; setPendingWolf(g.score); setPhase("done"); }
    g.raf = requestAnimationFrame(tick);

    return () => { g.running = false; cancelAnimationFrame(g.raf); document.removeEventListener("keydown", onKey); };
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
    void addGameSession("tetris", pendingWolf);
    setClaimed(true);
    setFlyShow(true);
  }

  return (
    <MemeShell testId="page-game-tetris">
      <TokenFly
        count={Math.min(pendingWolf, 10)}
        show={flyShow}
        fromX={flyFrom.x}
        fromY={flyFrom.y}
        onComplete={() => setFlyShow(false)}
      />
      <div className="flex flex-col items-center py-8 px-4">
        <h1 className="font-bungee text-3xl mb-1" style={{ color: "#1a1a1a" }}>🧱 BATTLE TETRIS</h1>
        <p className="font-fredoka text-base mb-6" style={{ color: "#666" }}>Clear lines to earn WOLF · Tetris = 8 WOLF!</p>

        {phase === "start" && (
          <div style={{ border: "2.5px solid #1a1a1a", borderRadius: 20, padding: 36, boxShadow: "5px 5px 0 #1a1a1a", background: "#fff", maxWidth: 380, textAlign: "center" }}>
            <div style={{ fontSize: 72 }}>🧱</div>
            <h2 className="font-bungee text-xl mt-4 mb-3">HOW TO PLAY</h2>
            <p className="font-fredoka text-sm mb-1" style={{ color: "#555" }}>⬅️➡️ Arrow keys to move</p>
            <p className="font-fredoka text-sm mb-1" style={{ color: "#555" }}>⬆️ or Space to rotate</p>
            <p className="font-fredoka text-sm mb-1" style={{ color: "#555" }}>⬇️ Arrow down to drop faster</p>
            <p className="font-fredoka text-sm mb-4" style={{ color: "#555" }}>🏆 1 WOLF/line · 8 WOLF for Tetris! · 2 min</p>
            {!user && <p className="font-fredoka text-sm mb-4" style={{ color: "#FF6B6B" }}>⚠️ Login to save your WOLF earnings</p>}
            {btn("PLAY NOW", "#4CC9F0", () => setPhase("playing"))}
          </div>
        )}

        {phase === "playing" && (
          <div>
            <div className="flex justify-between items-center mb-3 gap-6" style={{ width: W }}>
              <span className="font-fredoka font-bold text-lg">🏆 {score} WOLF</span>
              <span className="font-fredoka font-bold text-lg">⏱️ {fmt(time)}</span>
            </div>
            <canvas ref={canvasRef} width={W} height={H} style={{ border: "2.5px solid #1a1a1a", borderRadius: 10, boxShadow: "5px 5px 0 #1a1a1a", display: "block" }} />
            <p className="font-fredoka text-center text-sm mt-3" style={{ color: "#888" }}>↑ Rotate · ← → Move · ↓ Drop</p>
          </div>
        )}

        {phase === "done" && (
          <div style={{ border: "2.5px solid #1a1a1a", borderRadius: 20, padding: 36, boxShadow: "5px 5px 0 #1a1a1a", background: "#fff", maxWidth: 380, textAlign: "center" }}>
            <div style={{ fontSize: 72 }}>🎉</div>
            <h2 className="font-bungee text-2xl mt-4">SESSION COMPLETE!</h2>
            <p className="font-fredoka text-4xl font-bold mt-2" style={{ color: "#4CC9F0" }}>+{pendingWolf} WOLF</p>
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
