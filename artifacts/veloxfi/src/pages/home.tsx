import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Menu, X, User, LogOut, Gamepad2, Pickaxe, ArrowRightLeft, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePageMeta } from "@/hooks/usePageMeta";

const HOW_IT_WORKS = [
  {
    step: "01", icon: "🎮",
    title: "Play games",
    desc: "Jump into Crypto Snake, Battle Tetris, Wolf Run or Rocket Miner. Every game session earns you WOLF tokens — the more you play, the more you earn.",
    color: "#4CC9F0",
  },
  {
    step: "02", icon: "⛏️",
    title: "Mine WOLF",
    desc: "Start a mining session once every 4 hours and collect free WOLF tokens. Earn up to 240 WOLF per session. No wallet needed.",
    color: "#6BCB77",
  },
  {
    step: "03", icon: "💱",
    title: "Convert to $BATTLE",
    desc: "Convert any amount of WOLF to $BATTLE tokens — the real Solana coin. 5,000 WOLF = 1 $BATTLE. Enter your wallet address and we'll send them to you.",
    color: "#FFD93D",
  },
  {
    step: "04", icon: "🏆",
    title: "Dominate the arena",
    desc: "Climb the leaderboard, flex your balance, and become the top wolf in the VeloxFi arena. Season rewards go to the biggest earners.",
    color: "#FF6B9D",
  },
];

const GAMES = [
  { name: "Crypto Snake",   path: "/games/snake",   emoji: "🐍", color: "#6BCB77", desc: "Eat coins, grow bigger, earn WOLF" },
  { name: "Battle Tetris",  path: "/games/tetris",  emoji: "🟦", color: "#4CC9F0", desc: "Clear lines, earn WOLF per level"  },
  { name: "Wolf Run",       path: "/games/runner",  emoji: "🐺", color: "#FFD93D", desc: "Run, jump, collect WOLF coins"      },
  { name: "Rocket Miner",   path: "/games/rocket",  emoji: "🚀", color: "#FF9F43", desc: "Shoot asteroids, earn WOLF"        },
];

const TICKER_ITEMS = [
  "🎮 $BATTLE NOW LIVE ON PUMP.FUN",
  "⚔️ JOIN THE GAME ARENA",
  "🎯 MINE WOLF TOKENS EVERY 4 HOURS",
  "🐍 CRYPTO SNAKE — EARN WOLF",
  "🚀 ROCKET MINER — BLAST ASTEROIDS",
  "🏆 5000 WOLF = 1 $BATTLE",
  "💎 BUILT ON SOLANA",
  "🔥 CA: 3EtQQDUrNyVzNyfrPap8RHTstJiM7J5a4fNbJqsjpump",
];

const NAV_LINKS = [
  { label: "Games",       path: "/games",       color: "#4CC9F0" },
  { label: "Mine",        path: "/mine",        color: "#6BCB77" },
  { label: "Convert",     path: "/convert",     color: "#FF9F43" },
  { label: "Leaderboard", path: "/leaderboard", color: "#FFD93D" },
  { label: "Buy $BATTLE", path: "/presale",     color: "#FF9F43" },
  { label: "Whitepaper",  path: "/whitepaper",  color: "#6BCB77" },
  { label: "Blog",        path: "/blog",        color: "#FF6B9D" },
  { label: "FAQ",         path: "/faq",         color: "#FF6B6B" },
  { label: "Roadmap",     path: "/roadmap",     color: "#A29BFE" },
];

const CONFETTI_COLORS = ["#FFD93D", "#FF6B9D", "#6BCB77", "#4CC9F0", "#FF9F43", "#A29BFE", "#FF6B6B"];
const CONFETTI_PIECES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  x: `${Math.random() * 100}%`,
  size: `${7 + Math.random() * 8}px`,
  delay: `${Math.random() * 1.5}s`,
  dur: `${2.2 + Math.random() * 2}s`,
  shape: i % 3 === 0 ? "50%" : i % 3 === 1 ? "3px" : "0%",
}));

function Confetti() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[999]" aria-hidden="true">
      {CONFETTI_PIECES.map((p) => (
        <div key={p.id} style={{
          position: "absolute", left: p.x, top: "-20px",
          width: p.size, height: p.size, background: p.color,
          borderRadius: p.shape, border: "1.5px solid rgba(26,26,26,0.4)",
          animation: `confettiFall ${p.dur} ease-in forwards`,
          animationDelay: p.delay, opacity: 0.95,
        }} />
      ))}
    </div>
  );
}

export default function Home() {
  usePageMeta({
    title: "VeloxFi — Play Games, Earn WOLF, Win $BATTLE on Solana",
    description: "The VeloxFi game arena on Solana. Play Crypto Snake, Battle Tetris, Wolf Run and Rocket Miner. Mine WOLF tokens and convert to $BATTLE.",
    canonical: "https://veloxfi.io",
  });

  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);

  function navGo(path: string) {
    setMobileOpen(false);
    navigate(path);
  }

  const location = "/";

  return (
    <div style={{ backgroundColor: "#FFFBF0", minHeight: "100dvh", color: "#1a1a1a", overflowX: "hidden" }}>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes rainbowShift {
          0%   { background-position: 0% center; }
          100% { background-position: 300% center; }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 3px 3px 0 #1a1a1a; transform: translate(0,0); }
          50%       { box-shadow: 5px 5px 0 #1a1a1a; transform: translate(-2px,-2px); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-4deg); }
          50%       { transform: rotate(4deg); }
        }
        .rainbow-text-anim {
          background: linear-gradient(90deg, #FF6B6B, #FF9F43, #FFD93D, #6BCB77, #4CC9F0, #A29BFE, #FF6B9D, #FF6B6B);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rainbowShift 3s linear infinite;
        }
      `}</style>

      <Confetti />

      {/* ── TICKER ── */}
      <div className="w-full overflow-hidden py-2.5 relative z-50"
        style={{ background: "#FFD93D", borderBottom: "2.5px solid #1a1a1a" }}>
        <div className="flex gap-16 whitespace-nowrap font-bungee text-xs text-[#1a1a1a]"
          style={{ animation: "marquee 24s linear infinite", width: "max-content" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex-shrink-0">{item}</span>
          ))}
        </div>
      </div>

      {/* ── NAV ── */}
      <nav data-testid="nav" className="sticky top-0 z-40"
        style={{ backgroundColor: "#FFFBF0", borderBottom: "2.5px solid #1a1a1a", boxShadow: "0 4px 0 #1a1a1a" }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" data-testid="nav-logo" className="flex items-center gap-2.5">
            <img src="/wolf-cyber.jpg" alt="VeloxFi" className="w-9 h-9 rounded-xl object-cover"
              style={{ border: "2.5px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a" }}
              onError={(e) => { (e.target as HTMLImageElement).src = "/wolf.jpg"; }} />
            <span className="font-bungee text-xl text-[#1a1a1a] tracking-wide">VELOXFI</span>
          </a>

          <div className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map(({ label, path, color }) => {
              const isActive = location === path;
              return (
                <button key={path} onClick={() => navGo(path)}
                  className="text-sm font-fredoka font-semibold transition-all duration-100"
                  style={{
                    background: isActive ? color : "transparent", color: "#1a1a1a",
                    border: isActive ? "2px solid #1a1a1a" : "2px solid transparent",
                    boxShadow: isActive ? "2px 2px 0 #1a1a1a" : "none",
                    borderRadius: "10px", padding: "4px 12px", cursor: "pointer",
                    fontWeight: isActive ? 700 : 500, opacity: isActive ? 1 : 0.65,
                  }}>
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button onClick={() => navGo("/profile")}
                  className="flex items-center gap-1.5 text-sm font-fredoka font-semibold px-4 py-2 rounded-xl"
                  style={{ background: "#6BCB77", border: "2px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a", cursor: "pointer", color: "#1a1a1a" }}>
                  <User className="w-4 h-4" />{user.username}
                </button>
                <button onClick={logout}
                  className="flex items-center gap-1 text-sm font-fredoka font-semibold px-3 py-2 rounded-xl"
                  style={{ background: "#FF6B6B", border: "2px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a", cursor: "pointer", color: "white" }}>
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button onClick={() => navGo("/login")}
                className="text-sm font-fredoka font-semibold px-4 py-2 rounded-xl"
                style={{ background: "#FFD93D", border: "2px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a", cursor: "pointer", color: "#1a1a1a" }}>
                Login / Register
              </button>
            )}
            <button onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a", cursor: "pointer", color: "#1a1a1a" }}
              aria-label="Toggle menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden" style={{ borderTop: "2.5px solid #1a1a1a", background: "#FFFBF0" }}>
            <div className="flex flex-col py-3 px-4 gap-1">
              {NAV_LINKS.map(({ label, path, color }) => (
                <button key={path} onClick={() => navGo(path)}
                  className="w-full text-left py-3 px-4 text-sm font-fredoka font-semibold rounded-xl"
                  style={{ background: "transparent", border: "2px solid transparent", cursor: "pointer", color: "#1a1a1a" }}>
                  {label}
                </button>
              ))}
              <div style={{ borderTop: "1.5px solid #e5e5e5", marginTop: "4px", paddingTop: "8px" }}>
                {user ? (
                  <>
                    <button onClick={() => navGo("/profile")}
                      className="w-full text-left py-3 px-4 text-sm font-fredoka font-semibold rounded-xl"
                      style={{ background: "#6BCB77", border: "2px solid #1a1a1a", cursor: "pointer", color: "#1a1a1a" }}>
                      Profile ({user.username})
                    </button>
                    <button onClick={() => { logout(); setMobileOpen(false); }}
                      className="w-full text-left py-3 px-4 text-sm font-fredoka font-semibold rounded-xl mt-1"
                      style={{ background: "#FF6B6B", border: "2px solid #1a1a1a", cursor: "pointer", color: "white" }}>
                      Logout
                    </button>
                  </>
                ) : (
                  <button onClick={() => navGo("/login")}
                    className="w-full text-left py-3 px-4 text-sm font-fredoka font-semibold rounded-xl"
                    style={{ background: "#FFD93D", border: "2px solid #1a1a1a", cursor: "pointer", color: "#1a1a1a" }}>
                    Login / Register
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── FLOATING BG SHAPES ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {[
          { x: "4%",  y: "20%", s: "38px", c: "#FFD93D", circle: true,  d: "0s",   dur: "4s"   },
          { x: "91%", y: "25%", s: "26px", c: "#FF6B9D", circle: false, d: "1s",   dur: "5s"   },
          { x: "2%",  y: "65%", s: "22px", c: "#4CC9F0", circle: true,  d: "2s",   dur: "3.5s" },
          { x: "94%", y: "70%", s: "34px", c: "#6BCB77", circle: false, d: "0.5s", dur: "4.5s" },
          { x: "48%", y: "7%",  s: "18px", c: "#A29BFE", circle: true,  d: "1.5s", dur: "5.5s" },
          { x: "77%", y: "89%", s: "28px", c: "#FF9F43", circle: true,  d: "3s",   dur: "4s"   },
        ].map((s, i) => (
          <div key={i} style={{
            position: "absolute", left: s.x, top: s.y, width: s.s, height: s.s,
            background: s.c, borderRadius: s.circle ? "50%" : "6px",
            border: "2px solid rgba(26,26,26,0.25)", opacity: 0.2,
            animation: `float ${s.dur} ease-in-out infinite`, animationDelay: s.d,
          }} />
        ))}
      </div>

      {/* ── HERO ── */}
      <section ref={heroRef} data-testid="hero-section" className="relative z-10 overflow-hidden"
        style={{ minHeight: "calc(100dvh - 110px)" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 pt-12 pb-16 md:pt-16 md:pb-20">

          {/* LEFT */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 font-bungee text-xs text-[#1a1a1a]"
              style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", animation: "badgePulse 1.8s ease-in-out infinite", boxShadow: "3px 3px 0 #1a1a1a" }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#1a1a1a" }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "#1a1a1a" }} />
              </span>
              NOW LIVE ON PUMP.FUN!
            </div>

            <h1 className="font-bungee leading-none mb-4" data-testid="hero-title"
              style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}>
              <span className="block text-[#1a1a1a]">PLAY GAMES.</span>
              <span className="block rainbow-text-anim">EARN WOLF.</span>
              <span className="block text-[#1a1a1a]">WIN $BATTLE.</span>
            </h1>

            <p className="font-fredoka text-lg md:text-xl max-w-lg mb-8 leading-relaxed" style={{ color: "#555" }}>
              The VeloxFi game arena on Solana. Play 4 arcade games, mine WOLF tokens every 8 hours, and convert{" "}
              <span className="font-semibold" style={{ color: "#FF6B9D" }}>5000 WOLF = 1 $BATTLE.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button onClick={() => navGo("/games")}
                className="cartoon-btn cartoon-btn-yellow px-10 py-4 text-base"
                style={{ borderRadius: "16px" }}>
                PLAY NOW 🎮
              </button>
              <a href="https://pump.fun/coin/3EtQQDUrNyVzNyfrPap8RHTstJiM7J5a4fNbJqsjpump"
                target="_blank" rel="noopener noreferrer"
                className="cartoon-btn cartoon-btn-white px-10 py-4 text-base"
                style={{ borderRadius: "16px", textDecoration: "none" }}>
                BUY $BATTLE
              </a>
            </div>

            <div className="flex gap-4 flex-wrap">
              {[
                { label: "CHAIN",  value: "Solana"   },
                { label: "DEX",    value: "pump.fun" },
                { label: "EARN",   value: "Mine WOLF" },
              ].map((s) => (
                <div key={s.label} className="cartoon-card text-center px-4 py-3" style={{ boxShadow: "3px 3px 0 #1a1a1a" }}>
                  <div className="font-mono-data font-semibold text-sm" style={{ color: "#FF6B9D" }}>{s.value}</div>
                  <div className="font-bungee text-xs mt-0.5" style={{ color: "#1a1a1a", fontSize: "0.6rem" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Wolf mascot */}
          <div className="flex-shrink-0 flex items-center justify-center w-full md:w-auto" style={{ maxWidth: "520px" }}>
            <div style={{ animation: "float 4s ease-in-out infinite", position: "relative" }}>
              <img
                src="/wolf-cyber.jpg"
                alt="VeloxFi Wolf Warrior"
                className="w-full rounded-3xl object-cover"
                style={{ maxHeight: "580px", border: "3px solid #1a1a1a", boxShadow: "10px 10px 0px #1a1a1a" }}
                onError={(e) => { (e.target as HTMLImageElement).src = "/wolf.jpg"; }}
              />
              <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "2.5rem", animation: "wiggle 1.5s ease-in-out infinite" }}>⚡</div>
              <div style={{ position: "absolute", bottom: "-20px", left: "-20px", fontSize: "2rem", animation: "wiggle 2s ease-in-out infinite reverse" }}>🏆</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-8 px-6 relative z-10"
        style={{ borderTop: "2.5px solid #1a1a1a", borderBottom: "2.5px solid #1a1a1a", background: "#1a1a1a" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-5">
          {[
            { value: "4",    label: "Games Available", color: "#4CC9F0" },
            { value: "8h",   label: "Mine Interval",   color: "#6BCB77" },
            { value: "5K",   label: "WOLF per $BATTLE", color: "#FFD93D" },
          ].map((s) => (
            <div key={s.label} className="text-center px-4 py-5 rounded-2xl"
              style={{ background: s.color, border: "2.5px solid rgba(255,255,255,0.2)", boxShadow: "4px 4px 0 rgba(255,255,255,0.1)" }}>
              <div className="font-bungee text-2xl md:text-3xl text-[#1a1a1a]">{s.value}</div>
              <div className="font-fredoka text-sm font-semibold mt-1 text-[#1a1a1a]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── GAMES SHOWCASE ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-10">
          <h2 className="font-bungee text-3xl md:text-4xl text-[#1a1a1a] mb-2">
            THE <span style={{ color: "#4CC9F0" }}>GAME ARENA</span>
          </h2>
          <p className="font-fredoka text-gray-500 text-lg">4 games, all earning WOLF — pick your weapon</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {GAMES.map((game) => (
            <button key={game.path} onClick={() => navGo(game.path)}
              className="cartoon-card p-6 text-left transition-all duration-200 hover:-translate-y-2 cursor-pointer w-full"
              style={{ boxShadow: "6px 6px 0 #1a1a1a", background: "white" }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                  style={{ background: game.color, border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>
                  {game.emoji}
                </div>
                <div>
                  <div className="font-bungee text-lg text-[#1a1a1a]">{game.name}</div>
                  <div className="font-fredoka text-sm text-gray-500 mt-0.5">{game.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 font-bungee text-sm"
                style={{ color: game.color }}>
                <Gamepad2 className="w-4 h-4" style={{ color: "#1a1a1a" }} />
                <span style={{ color: "#1a1a1a" }}>PLAY & EARN WOLF →</span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <button onClick={() => navGo("/games")}
            className="cartoon-btn cartoon-btn-dark px-10 py-4 text-sm"
            style={{ borderRadius: "14px" }}>
            VIEW ALL GAMES
          </button>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section data-testid="how-it-works-section" className="max-w-5xl mx-auto px-6 pb-16 relative z-10">
        <div className="text-center mb-10">
          <h2 className="font-bungee text-2xl md:text-3xl text-[#1a1a1a] mb-2">
            HOW IT <span style={{ color: "#4CC9F0" }}>WORKS</span>
          </h2>
          <p className="font-fredoka text-gray-500 text-lg">From zero to $BATTLE in four steps</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="p-6 relative transition-all duration-200 hover:-translate-y-1"
              style={{ background: step.color, border: "2.5px solid #1a1a1a", boxShadow: "6px 6px 0 #1a1a1a", borderRadius: "16px" }}>
              <div className="text-4xl mb-3">{step.icon}</div>
              <div className="font-bungee text-xs text-[#1a1a1a] mb-1 opacity-60">STEP {step.step}</div>
              <h3 className="font-bungee text-lg text-[#1a1a1a] mb-2">{step.title}</h3>
              <p className="font-fredoka text-[#333] text-base leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOP WARRIORS ── */}
      <section data-testid="leaderboard-section" className="max-w-5xl mx-auto px-6 pb-16 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-bungee text-2xl md:text-3xl text-[#1a1a1a]">
              TOP <span style={{ color: "#FFD93D" }}>WARRIORS</span>
            </h2>
            <p className="font-fredoka text-gray-500 mt-1">Players with the most WOLF tokens earned</p>
          </div>
          <button onClick={() => navigate("/leaderboard")}
            className="cartoon-btn cartoon-btn-yellow px-5 py-2.5 text-xs"
            style={{ borderRadius: "10px" }}>
            FULL LEADERBOARD
          </button>
        </div>

        <div className="cartoon-card overflow-hidden" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
          <div className="grid grid-cols-12 gap-4 px-6 py-3 font-bungee text-gray-400"
            style={{ background: "#f5f0e0", borderBottom: "2px solid #1a1a1a", fontSize: "0.6rem" }}>
            <div className="col-span-1">RANK</div>
            <div className="col-span-5">PLAYER</div>
            <div className="col-span-3 text-right">WOLF EARNED</div>
            <div className="col-span-3 text-right">$BATTLE WON</div>
          </div>

          {[
            { rank: 1, medal: "🥇" },
            { rank: 2, medal: "🥈" },
            { rank: 3, medal: "🥉" },
          ].map((row) => (
            <div key={row.rank} className="grid grid-cols-12 gap-4 px-6 py-4 items-center"
              style={{ background: row.rank === 1 ? "#FFD93D22" : "white", borderBottom: "1.5px solid #eee" }}>
              <div className="col-span-1 text-2xl">{row.medal}</div>
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bungee text-gray-400 text-xs"
                  style={{ background: "#f5f0e0", border: "2px solid #ddd" }}>
                  <img src="/wolf-cyber.jpg" alt="" className="w-full h-full rounded-full object-cover opacity-30"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div>
                  <div className="font-bungee text-sm text-gray-400">— UNCLAIMED —</div>
                  <div className="font-fredoka text-xs text-gray-400 mt-0.5">Rank #{row.rank} Open</div>
                </div>
              </div>
              <div className="col-span-3 text-right font-bungee text-sm text-gray-300">—</div>
              <div className="col-span-3 text-right font-bungee text-sm text-gray-300">—</div>
            </div>
          ))}

          <div className="px-6 py-6 text-center" style={{ background: "#f5f0e0" }}>
            <p className="font-fredoka text-gray-500 text-base mb-3">Season 1 just started — play games and claim the #1 spot!</p>
            <button onClick={() => navigate("/games")}
              className="cartoon-btn cartoon-btn-dark px-8 py-3 text-sm"
              style={{ borderRadius: "12px" }}>
              START PLAYING
            </button>
          </div>
        </div>
      </section>

      {/* ── $BATTLE TOKEN ── */}
      <section data-testid="token-section" className="max-w-5xl mx-auto px-6 pb-16 relative z-10">
        <div className="text-center mb-10">
          <h2 className="font-bungee text-2xl md:text-3xl text-[#1a1a1a] mb-2">
            THE{" "}
            <span className="rainbow-text-anim">$BATTLE</span>{" "}
            TOKEN
          </h2>
          <p className="font-fredoka text-gray-500 text-lg">The fuel of the VeloxFi arena</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="cartoon-card-orange p-8 relative transition-all duration-200 hover:-translate-y-1"
            style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.4)", border: "2px solid #1a1a1a" }}>
                <Trophy className="w-6 h-6 text-[#1a1a1a]" />
              </div>
              <div className="font-bungee text-xs px-3 py-1 rounded-full text-[#1a1a1a]"
                style={{ background: "#6BCB77", border: "2px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a" }}>
                LIVE NOW
              </div>
            </div>
            <div className="font-bungee text-3xl text-[#1a1a1a] mb-1">BUY $BATTLE</div>
            <p className="font-mono-data text-sm mt-2 text-[#333]">Live on pump.fun — trade on Solana</p>
            <p className="font-mono-data text-xs mt-3 text-[#555] break-all">CA: 3EtQQDUrNyVzNyfrPap8RHTstJiM7J5a4fNbJqsjpump</p>
            <a href="https://pump.fun/coin/3EtQQDUrNyVzNyfrPap8RHTstJiM7J5a4fNbJqsjpump"
              target="_blank" rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 font-bungee text-sm px-6 py-3 rounded-xl"
              style={{ background: "#1a1a1a", color: "white", border: "2px solid #1a1a1a", textDecoration: "none" }}>
              BUY ON PUMP.FUN →
            </a>
          </div>

          <div className="flex flex-col gap-5">
            <div className="cartoon-card-sky p-7 relative transition-all duration-200 hover:-translate-y-1 flex-1"
              style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.4)", border: "2px solid #1a1a1a" }}>
                <Pickaxe className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <div className="font-bungee text-2xl text-[#1a1a1a]">MINE WOLF</div>
              <div className="font-fredoka text-sm font-semibold mt-1 text-[#333]">Free tokens every 8 hours</div>
            </div>

            <div className="cartoon-card-lime p-7 relative transition-all duration-200 hover:-translate-y-1 flex-1"
              style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.4)", border: "2px solid #1a1a1a" }}>
                <ArrowRightLeft className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <div className="font-bungee text-2xl text-[#1a1a1a]">5K WOLF</div>
              <div className="font-fredoka text-sm font-semibold mt-1 text-[#333]">= 1 $BATTLE token</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section data-testid="cta-section" className="max-w-5xl mx-auto px-6 pb-20 relative z-10">
        <div className="cartoon-card-yellow p-12 text-center relative overflow-hidden"
          style={{ boxShadow: "8px 8px 0 #1a1a1a" }}>

          {/* Wolf image decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-48 hidden md:block overflow-hidden rounded-r-2xl opacity-20">
            <img src="/wolf-cyber.jpg" alt="" className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/wolf.jpg"; }} />
          </div>

          <h2 className="font-bungee text-3xl md:text-5xl text-[#1a1a1a] mb-4 leading-tight relative z-10">
            $BATTLE IS{" "}
            <span style={{ color: "#6BCB77" }}>LIVE!</span>
          </h2>
          <p className="font-fredoka text-[#333] mb-8 max-w-lg mx-auto text-xl leading-relaxed relative z-10">
            Now trading on pump.fun. Play games, mine WOLF, and dominate the arena.{" "}
            <span className="font-semibold" style={{ color: "#FF6B9D" }}>5000 WOLF = 1 $BATTLE.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 relative z-10">
            <a href="https://pump.fun/coin/3EtQQDUrNyVzNyfrPap8RHTstJiM7J5a4fNbJqsjpump"
              target="_blank" rel="noopener noreferrer"
              className="cartoon-btn cartoon-btn-dark px-12 py-5 text-lg"
              style={{ borderRadius: "16px", textDecoration: "none" }}>
              BUY ON PUMP.FUN
            </a>
            <button onClick={() => navigate("/games")}
              className="cartoon-btn cartoon-btn-white px-10 py-5 text-base"
              style={{ borderRadius: "16px" }}>
              PLAY GAMES
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 relative z-10">
            {[
              { label: "CHAIN",  value: "Solana"    },
              { label: "DEX",    value: "pump.fun"  },
              { label: "EARN",   value: "Mine WOLF" },
              { label: "RATE",   value: "5000 WOLF = 1 $BATTLE" },
            ].map((s) => (
              <div key={s.label} className="cartoon-card text-center px-4 py-3" style={{ boxShadow: "3px 3px 0 #1a1a1a" }}>
                <div className="font-mono-data font-semibold text-sm" style={{ color: "#FF6B9D" }}>{s.value}</div>
                <div className="font-bungee text-[#1a1a1a]" style={{ fontSize: "0.6rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer data-testid="footer" style={{ background: "#1a1a1a", borderTop: "2.5px solid #1a1a1a" }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <img src="/wolf-cyber.jpg" alt="VeloxFi" className="w-8 h-8 rounded-xl object-cover"
                style={{ border: "2px solid #FFD93D" }}
                onError={(e) => { (e.target as HTMLImageElement).src = "/wolf.jpg"; }} />
              <span className="font-bungee text-lg tracking-wide" style={{ color: "#FFD93D" }}>VELOXFI</span>
              <span className="font-fredoka text-sm ml-1" style={{ color: "#555" }}>Game Arena</span>
            </div>

            <div className="flex items-center flex-wrap justify-center gap-6 font-fredoka font-semibold text-sm">
              {[
                { label: "Games",      path: "/games"      },
                { label: "Roadmap",    path: "/roadmap"    },
                { label: "FAQ",        path: "/faq"        },
                { label: "Terms",      path: "/terms"      },
                { label: "Privacy",    path: "/privacy"    },
                { label: "Whitepaper", path: "/whitepaper" },
              ].map(({ label, path }) => (
                <button key={path} onClick={() => navigate(path)}
                  className="hover:text-white transition-colors"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#666" }}>
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {[
                {
                  href: "https://t.me/VeloxFiOfficial", label: "Telegram", bg: "#6BCB77",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  ),
                },
                {
                  href: "https://discord.gg/u2UhxuTd", label: "Discord", bg: "#A29BFE",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  ),
                },
              ].map(({ href, label, bg, icon }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: bg, border: "2px solid #444", boxShadow: "2px 2px 0 #444",
                    textDecoration: "none", color: "#1a1a1a",
                  }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t pt-6 text-center" style={{ borderColor: "#333" }}>
            <p className="text-sm font-fredoka" style={{ color: "#555" }}>
              © 2026 VeloxFi · Game Arena on Solana · Not financial advice
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
