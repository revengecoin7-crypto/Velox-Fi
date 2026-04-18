import { useLocation } from "wouter";
import MemeShell from "@/components/MemeShell";

const GAMES = [
  {
    id: "snake",
    path: "/games/snake",
    title: "Crypto Snake",
    emoji: "🐍",
    color: "#6BCB77",
    desc: "Eat $BATTLE coins to grow longer! Classic snake with a crypto twist.",
    rewards: "1 WOLF per coin · 2 min session · 3 lives",
    controls: "Arrow keys / WASD",
  },
  {
    id: "tetris",
    path: "/games/tetris",
    title: "Battle Tetris",
    emoji: "🧱",
    color: "#4CC9F0",
    desc: "Stack crypto-symbol blocks and clear lines to earn WOLF tokens!",
    rewards: "1 WOLF per line · 4 WOLF for Tetris · 2 min session",
    controls: "Arrow keys · Up to rotate",
  },
  {
    id: "runner",
    path: "/games/runner",
    title: "Wolf Run",
    emoji: "🐺",
    color: "#FF9F43",
    desc: "Run through the neon cyberpunk city, collect WOLF tokens, dodge obstacles!",
    rewards: "1 WOLF per token · 2 min session · 3 lives",
    controls: "Space / Up to jump",
  },
  {
    id: "rocket",
    path: "/games/rocket",
    title: "Rocket Miner",
    emoji: "🚀",
    color: "#FF6B9D",
    desc: "Pilot your rocket through an asteroid field and collect precious ore!",
    rewards: "1 WOLF per hit · 2 min session · 3 lives",
    controls: "Arrow keys to move · Space to shoot",
  },
];

export default function Games() {
  const [, navigate] = useLocation();

  return (
    <MemeShell testId="page-games">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-bungee text-4xl md:text-5xl mb-3" style={{ color: "#1a1a1a" }}>
            🎮 ARCADE GAMES
          </h1>
          <p className="font-fredoka text-lg" style={{ color: "#555" }}>
            Play skill games and earn WOLF tokens! Up to 120 WOLF per 2-minute session.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GAMES.map(g => (
            <div key={g.id}
              style={{
                background: "#fff",
                border: "2.5px solid #1a1a1a",
                borderRadius: 20,
                boxShadow: "5px 5px 0 #1a1a1a",
                overflow: "hidden",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translate(-2px,-2px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "7px 7px 0 #1a1a1a";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "5px 5px 0 #1a1a1a";
              }}
            >
              <div style={{ background: g.color, borderBottom: "2.5px solid #1a1a1a", padding: "24px 24px 20px" }}>
                <div style={{ fontSize: 56 }}>{g.emoji}</div>
                <h2 className="font-bungee text-2xl mt-2" style={{ color: "#1a1a1a" }}>{g.title}</h2>
              </div>
              <div style={{ padding: 24 }}>
                <p className="font-fredoka text-base mb-3" style={{ color: "#444" }}>{g.desc}</p>
                <div style={{ background: "#FFFBF0", border: "2px solid #1a1a1a", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
                  <p className="font-fredoka text-sm font-bold" style={{ color: "#1a1a1a" }}>🏆 {g.rewards}</p>
                  <p className="font-fredoka text-sm" style={{ color: "#777" }}>🎮 {g.controls}</p>
                </div>
                <button
                  onClick={() => navigate(g.path)}
                  style={{
                    background: g.color,
                    border: "2.5px solid #1a1a1a",
                    borderRadius: 12,
                    padding: "12px 28px",
                    fontFamily: "Bungee, sans-serif",
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: "3px 3px 0 #1a1a1a",
                    width: "100%",
                    color: "#1a1a1a",
                  }}
                >
                  PLAY NOW
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, background: "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 16, padding: "20px 24px", boxShadow: "4px 4px 0 #1a1a1a", textAlign: "center" }}>
          <p className="font-bungee text-lg mb-1">📊 DAILY EARNING POTENTIAL</p>
          <p className="font-fredoka text-base" style={{ color: "#444" }}>
            Mining (240 WOLF) + Games (480 WOLF) + Battles (150 WOLF) = <strong>870+ WOLF/day</strong>
          </p>
          <p className="font-fredoka text-sm mt-1" style={{ color: "#666" }}>
            5,000 WOLF = 1 $BATTLE token
          </p>
        </div>
      </div>
    </MemeShell>
  );
}
