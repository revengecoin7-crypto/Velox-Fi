import { useState, useEffect } from "react";
import GameShell from "@/components/GameShell";

const WOLF_COLORS = ["var(--lime)", "var(--magenta)", "var(--cyan)", "var(--yellow)", "var(--tomato)", "var(--lavender)"];
const BOT_NAMES = ["skrrt.sol", "fenrir77", "nightbite", "howldog", "ghostfang", "darkpaw"];

// Build hex grid
function buildHexes() {
  const hexes: { id: number; r: number; c: number; dx: number; dy: number; dist: number }[] = [];
  let id = 0;
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 9; c++) {
      const offset = r % 2 === 0 ? 0 : 0.5;
      const dx = (c + offset - 4) * 1.7;
      const dy = (r - 3) * 1.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 6) hexes.push({ id: id++, r, c, dx, dy, dist });
    }
  }
  return hexes;
}

const HEXES = buildHexes();

function getNeighbors(hexId: number): number[] {
  const h = HEXES[hexId];
  if (!h) return [];
  return HEXES
    .filter((n) => {
      const dDx = Math.abs(n.dx - h.dx);
      const dDy = Math.abs(n.dy - h.dy);
      return (dDx < 2 && dDy < 2) && !(dDx < 0.1 && dDy < 0.1);
    })
    .map((n) => n.id);
}

interface Wolf { id: number; hexId: number; color: string; name: string; fangs: number; alive: boolean; isPlayer: boolean }

function initWolves(): Wolf[] {
  const positions = [12, 8, 22, 30, 17, 35].slice(0, 6);
  return [
    { id: 0, hexId: positions[0], color: WOLF_COLORS[0], name: "YOU", fangs: 3, alive: true, isPlayer: true },
    ...BOT_NAMES.slice(0, 5).map((name, i) => ({
      id: i + 1, hexId: positions[i + 1], color: WOLF_COLORS[i + 1], name, fangs: Math.floor(Math.random() * 3) + 1, alive: true, isPlayer: false,
    })),
  ];
}

export default function HowlHuntGame() {
  const [wolves, setWolves] = useState<Wolf[]>(initWolves);
  const [selectedHex, setSelectedHex] = useState<number | null>(null);
  const [phase, setPhase] = useState<"playing" | "gameover" | "won">("playing");
  const [ringSize, setRingSize] = useState(6);
  const [round, setRound] = useState(1);
  const [pool] = useState(2840);
  const [timeLeft, setTimeLeft] = useState(48);
  const [log, setLog] = useState<string[]>(["Match started! Move one hex per turn."]);

  const player = wolves.find((w) => w.isPlayer);
  const aliveWolves = wolves.filter((w) => w.alive);
  const neighbors = player?.alive ? getNeighbors(player.hexId) : [];

  // countdown
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 1) {
          // ring shrinks, bots move, time resets
          botsTakeTurn();
          setRingSize((r) => Math.max(r - 0.5, 2));
          setRound((r) => r + 1);
          return 48;
        }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, wolves]);

  function botsTakeTurn() {
    setWolves((prev) => {
      let updated = [...prev];
      updated = updated.map((w) => {
        if (w.isPlayer || !w.alive) return w;
        const neighbors = getNeighbors(w.hexId);
        if (neighbors.length === 0) return w;
        // bots move randomly
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        // check if another wolf is on that hex
        const occupied = updated.find((other) => other.id !== w.id && other.alive && other.hexId === randomNeighbor);
        if (occupied) {
          // fight - wolf with fewer fangs loses
          if (occupied.fangs <= w.fangs) {
            return { ...w, hexId: randomNeighbor, fangs: w.fangs + 1 };
          }
          return w;
        }
        return { ...w, hexId: randomNeighbor };
      });
      // eliminate wolves outside ring
      updated = updated.map((w) => {
        if (!w.alive) return w;
        const hex = HEXES[w.hexId];
        if (hex && hex.dist > ringSize - 0.4) return { ...w, alive: false };
        return w;
      });
      return updated;
    });
  }

  function movePlayer(targetHexId: number) {
    if (phase !== "playing" || !player?.alive) return;
    if (!neighbors.includes(targetHexId)) return;

    setWolves((prev) => {
      let updated = [...prev];
      const targetWolf = updated.find((w) => !w.isPlayer && w.alive && w.hexId === targetHexId);

      if (targetWolf) {
        // bite — player eats the bot if player has more/equal fangs
        if ((player.fangs ?? 0) >= targetWolf.fangs) {
          updated = updated.map((w) => {
            if (w.isPlayer) return { ...w, hexId: targetHexId, fangs: w.fangs + 1 };
            if (w.id === targetWolf.id) return { ...w, alive: false };
            return w;
          });
          setLog((l) => [`You bit ${targetWolf.name}! +1 fang 🦷`, ...l].slice(0, 5));
        } else {
          // player loses
          updated = updated.map((w) => w.isPlayer ? { ...w, alive: false } : w);
          setPhase("gameover");
          setLog((l) => [`${targetWolf.name} bit you! Game over 💀`, ...l].slice(0, 5));
          return updated;
        }
      } else {
        updated = updated.map((w) => w.isPlayer ? { ...w, hexId: targetHexId } : w);
        setLog((l) => [`You moved to hex ${targetHexId}`, ...l].slice(0, 5));
      }

      const stillAlive = updated.filter((w) => w.alive);
      if (stillAlive.length === 1 && stillAlive[0].isPlayer) {
        setPhase("won");
        setLog((l) => ["🏆 Last wolf standing! You won!", ...l].slice(0, 5));
      }
      return updated;
    });
    setSelectedHex(null);
  }

  function howl() {
    const adj = getNeighbors(player?.hexId ?? -1);
    setWolves((prev) => prev.map((w) => {
      if (!w.isPlayer && w.alive && adj.includes(w.hexId)) {
        const newHexId = HEXES.find((h) => !prev.some((w2) => w2.alive && w2.hexId === h.id) && h.dist < ringSize)?.id ?? w.hexId;
        setLog((l) => [`🐺 HOWL! Scared ${w.name} away!`, ...l].slice(0, 5));
        return { ...w, hexId: newHexId };
      }
      return w;
    }));
  }

  function restart() {
    setWolves(initWolves());
    setPhase("playing");
    setRingSize(6);
    setRound(1);
    setTimeLeft(48);
    setLog(["New match started!"]);
    setSelectedHex(null);
  }

  const side = (
    <>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>Howl & Hunt</div>
          <span className="pill magenta" style={{ fontSize: 9 }}>NEW</span>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 4 }}>SINGLE PLAYER · VS BOTS</div>
      </div>

      {/* coming soon notice */}
      <div style={{ background: "var(--cream)", border: "2px solid var(--ink)", borderRadius: 10, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: "var(--mute)" }}>
        🐺 <b style={{ color: "var(--ink)" }}>Multiplayer komt eraan!</b> Nu speel je tegen 5 bots. In de toekomst speel je tegen echte wolves wereldwijd.
      </div>

      <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14, lineHeight: 1.5 }}>
        Beweeg één hex per beurt. Bijt wolves met minder fangs. Laatste wolf wint de pool.
      </p>

      {/* alive wolves */}
      <div style={{ marginBottom: 14 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginBottom: 6 }}>WOLVES ({aliveWolves.length}/6)</div>
        {aliveWolves.map((w) => (
          <div key={w.id} className="row" style={{ padding: "5px 8px", borderRadius: 8, background: w.isPlayer ? "var(--lime)" : "transparent", marginBottom: 2 }}>
            <div style={{ width: 14, height: 14, borderRadius: 99, background: w.color, border: "2px solid var(--ink)", flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{w.name}</span>
            <span className="mono" style={{ fontSize: 11 }}>{"★".repeat(w.fangs)}</span>
          </div>
        ))}
      </div>

      {/* howl + bite buttons */}
      <div className="row" style={{ gap: 8, marginBottom: 14 }}>
        <button className="btn magenta" style={{ flex: 1, justifyContent: "center" }} onClick={howl} disabled={phase !== "playing" || !player?.alive}>
          HOWL <span style={{ padding: "1px 5px", background: "rgba(0,0,0,0.3)", borderRadius: 4, fontSize: 11, marginLeft: 4, fontFamily: "JetBrains Mono" }}>H</span>
        </button>
        <button className="btn yellow" style={{ flex: 1, justifyContent: "center" }} disabled>
          BITE <span style={{ padding: "1px 5px", background: "rgba(0,0,0,0.2)", borderRadius: 4, fontSize: 11, marginLeft: 4, fontFamily: "JetBrains Mono" }}>B</span>
        </button>
      </div>

      {/* log */}
      <div style={{ marginBottom: 14 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginBottom: 6 }}>MATCH LOG</div>
        {log.slice(0, 4).map((l, i) => (
          <div key={i} style={{ fontSize: 11, color: i === 0 ? "var(--ink)" : "var(--mute)", padding: "2px 0", borderBottom: "1px dashed rgba(11,11,26,0.08)" }}>{l}</div>
        ))}
      </div>

      {/* session reward */}
      <div style={{ background: "var(--ink)", border: "2.5px solid var(--ink)", borderRadius: 14, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--cyan)", letterSpacing: 1.5 }}>PRIZE POOL</div>
            <div className="display tabular" style={{ fontSize: 24, lineHeight: 1, color: "white", marginTop: 2 }}>{pool.toLocaleString()} BATTLE</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 9, color: "var(--magenta)", letterSpacing: 1.5 }}>HASH BOOST</div>
            <div className="display tabular" style={{ fontSize: 24, lineHeight: 1, color: "white", marginTop: 2 }}>×4.0</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <GameShell
      testId="page-game-howl"
      title="Howl & Hunt"
      tag="Single Player · vs Bots"
      meta={[
        { label: "Match", value: `#412` },
        { label: "Ring closes", value: `00:${String(timeLeft).padStart(2, "0")}` },
        { label: "Alive", value: `${aliveWolves.length}/6` },
        { label: "Pool", value: `${pool.toLocaleString()} BATTLE` },
      ]}
      side={side}
    >
      <div style={{ background: "radial-gradient(circle at center, #251a3d, #0B0B1A)", borderRadius: 14, position: "relative", minHeight: 540, overflow: "hidden", padding: 30 }}>

        {/* game over / won overlay */}
        {phase !== "playing" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, background: "rgba(11,11,26,0.85)", borderRadius: 14, gap: 16 }}>
            <div className="display" style={{ fontSize: 64, color: phase === "won" ? "var(--lime)" : "var(--tomato)" }}>
              {phase === "won" ? "🏆" : "💀"}
            </div>
            <div className="display" style={{ fontSize: 36, color: "white" }}>
              {phase === "won" ? "Last Wolf Standing!" : "Game Over"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
              {phase === "won" ? `You won ${pool.toLocaleString()} BATTLE!` : "Better luck next time."}
            </div>
            <button className="btn lg yellow" onClick={restart}>Play again →</button>
          </div>
        )}

        {/* shrinking ring */}
        <div style={{ position: "absolute", inset: 30, borderRadius: "50%", border: "3px dashed rgba(255,43,214,0.4)", pointerEvents: "none" }} />

        {/* hex grid */}
        <svg viewBox="-10 -10 20 20" style={{ width: "100%", height: "100%", maxHeight: 480 }}>
          {HEXES.map((h) => {
            const x = h.dx, y = h.dy;
            const r = 0.85;
            const points = Array.from({ length: 6 }).map((_, j) => {
              const a = (Math.PI / 3) * j + Math.PI / 6;
              return `${x + Math.cos(a) * r},${y + Math.sin(a) * r}`;
            }).join(" ");
            const wolf = wolves.find((w) => w.alive && w.hexId === h.id);
            const isSelected = selectedHex === h.id;
            const isNeighbor = player?.alive && neighbors.includes(h.id);
            const isPlayerHex = player?.alive && player.hexId === h.id;
            const outsideRing = h.dist >= ringSize;

            return (
              <g key={h.id} onClick={() => isNeighbor ? movePlayer(h.id) : setSelectedHex(h.id)} style={{ cursor: isNeighbor ? "pointer" : "default" }}>
                <polygon
                  points={points}
                  fill={outsideRing ? "rgba(255,43,214,0.12)" : isNeighbor ? "rgba(8,209,242,0.15)" : isPlayerHex ? "rgba(182,242,63,0.15)" : "rgba(8,209,242,0.05)"}
                  stroke={isNeighbor ? "rgba(8,209,242,0.8)" : outsideRing ? "rgba(255,43,214,0.3)" : "rgba(8,209,242,0.25)"}
                  strokeWidth={isNeighbor ? "0.08" : "0.04"}
                />
                {wolf && (
                  <g>
                    <circle cx={x} cy={y} r="0.55" fill={wolf.color} stroke="var(--ink)" strokeWidth="0.06" />
                    <circle cx={x - 0.18} cy={y - 0.08} r="0.06" fill="var(--ink)" />
                    <circle cx={x + 0.18} cy={y - 0.08} r="0.06" fill="var(--ink)" />
                    <path d={`M${x - 0.15} ${y + 0.18} Q ${x} ${y + 0.3} ${x + 0.15} ${y + 0.18}`} stroke="var(--ink)" strokeWidth="0.05" fill="none" />
                    {wolf.isPlayer && (
                      <circle cx={x} cy={y} r="0.85" fill="none" stroke="var(--lime)" strokeWidth="0.08" strokeDasharray="0.15 0.15" />
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* HUD top */}
        <div style={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between" }}>
          <div className="row" style={{ gap: 10 }}>
            <div className="card" style={{ padding: "6px 12px" }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>RING CLOSES</div>
              <div className="display tabular" style={{ fontSize: 18 }}>00:{String(timeLeft).padStart(2, "0")}</div>
            </div>
            <div className="card magenta" style={{ padding: "6px 12px", color: "white" }}>
              <div className="mono" style={{ fontSize: 10 }}>POOL</div>
              <div className="display tabular" style={{ fontSize: 18 }}>{pool.toLocaleString()}</div>
            </div>
          </div>
          <div className="card" style={{ padding: "6px 12px" }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>YOUR FANGS</div>
            <div className="display" style={{ fontSize: 18 }}>{"★".repeat(player?.fangs ?? 3)}</div>
          </div>
        </div>

        {/* instruction */}
        {player?.alive && phase === "playing" && (
          <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)" }}>
            <div className="pill" style={{ background: "rgba(11,11,26,0.7)", color: "white", border: "2px solid rgba(255,255,255,0.2)", fontSize: 12 }}>
              Click a highlighted hex to move
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
