import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Clock, Menu, X, Zap, Trophy, Shield, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePageMeta } from "@/hooks/usePageMeta";

const BATTLES = [
  {
    id: 1,
    coinA: { name: "PEPE",   ticker: "PEPE",   change: +18.4, icon: "🐸" },
    coinB: { name: "DOGE",   ticker: "DOGE",   change: -6.2,  icon: "🐕" },
    volume: "$1.24M",
    endsIn: 3 * 60 + 42,
    color: "#FFD93D",
  },
  {
    id: 2,
    coinA: { name: "BONK",   ticker: "BONK",   change: +31.7, icon: "🔨" },
    coinB: { name: "WIF",    ticker: "WIF",    change: -14.5, icon: "🎩" },
    volume: "$876K",
    endsIn: 8 * 60 + 15,
    color: "#FF6B9D",
  },
  {
    id: 3,
    coinA: { name: "BOME",   ticker: "BOME",   change: -3.1,  icon: "💣" },
    coinB: { name: "POPCAT", ticker: "POPCAT", change: +22.9, icon: "😺" },
    volume: "$2.1M",
    endsIn: 14 * 60 + 58,
    color: "#4CC9F0",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Get your wallet",    desc: "Buy $BATTLE tokens and connect Phantom to the VeloxFi arena.", color: "#FFD93D",  icon: "👛" },
  { step: "02", title: "Create your coin",   desc: "Launch your memecoin directly on VeloxFi — no external tools needed.", color: "#FF6B9D", icon: "🪙" },
  { step: "03", title: "Challenge a rival",  desc: "Challenge another coin to a battle — pick 1h to 7 days duration.", color: "#6BCB77", icon: "⚔️" },
  { step: "04", title: "Win the spoils",     desc: "Highest % price surge wins. Victor earns 30% of the loser's tokens.", color: "#4CC9F0", icon: "🏆" },
];

const TICKER_ITEMS = [
  "🎮 $BATTLE PRESALE LIVE",
  "⚔️ JOIN THE BATTLEFIELD",
  "🎯 MINE WOLF TOKENS EVERY 8 HOURS",
  "🐍 CRYPTO SNAKE — EARN WOLF",
  "🚀 ROCKET MINER — BLAST ASTEROIDS",
  "🏆 5000 WOLF = 1 $BATTLE",
  "🔥 LIMITED SPOTS REMAINING",
  "💎 BUILT ON SOLANA",
];

const NAV_LINKS = [
  { label: "Games",       path: "/games",       color: "#4CC9F0" },
  { label: "Mine",        path: "/mine",        color: "#6BCB77" },
  { label: "Convert",     path: "/convert",     color: "#FF9F43" },
  { label: "Battles",     path: "/battles",     color: "#FF6B9D" },
  { label: "Leaderboard", path: "/leaderboard", color: "#FFD93D" },
  { label: "Presale",     path: "/presale",     color: "#A29BFE" },
  { label: "Whitepaper",  path: "/whitepaper",  color: "#6BCB77" },
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
          position: "absolute",
          left: p.x, top: "-20px",
          width: p.size, height: p.size,
          background: p.color,
          borderRadius: p.shape,
          border: "1.5px solid rgba(26,26,26,0.4)",
          animation: `confettiFall ${p.dur} ease-in forwards`,
          animationDelay: p.delay,
          opacity: 0.95,
        }} />
      ))}
    </div>
  );
}

function CountdownTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setRemaining((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(remaining / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");
  return (
    <div className="flex items-center gap-1.5 font-mono-data text-sm font-semibold" style={{ color: "#1a1a1a" }}>
      <Clock className="w-3.5 h-3.5" />
      <span>{m}:{s}</span>
    </div>
  );
}

function BattleCard({ battle }: { battle: typeof BATTLES[0] }) {
  const [pctA, setPctA] = useState(55);
  useEffect(() => {
    const spread = battle.coinA.change - battle.coinB.change;
    setPctA(50 + Math.min(Math.max(spread * 1.2, -40), 40));
  }, [battle]);
  const pctB = 100 - pctA;
  const aWins = battle.coinA.change > battle.coinB.change;

  return (
    <div
      data-testid={`battle-card-${battle.id}`}
      className="cartoon-card p-5 relative transition-all duration-200 hover:-translate-y-1"
      style={{ boxShadow: "6px 6px 0px #1a1a1a" }}
    >
      {/* Live badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-bungee text-xs px-3 py-1 rounded-full text-[#1a1a1a]"
          style={{ background: battle.color, border: "2px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a" }}>
          LIVE
        </span>
        <CountdownTimer seconds={battle.endsIn} />
      </div>

      {/* Coins */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`flex-1 text-center rounded-xl p-3 transition-colors ${aWins ? "ring-2 ring-[#1a1a1a]" : ""}`}
          style={{ background: aWins ? battle.color + "33" : "#f5f5f5" }}>
          <div className="text-4xl mb-1">{battle.coinA.icon}</div>
          <div className="font-bungee text-sm text-[#1a1a1a]">{battle.coinA.ticker}</div>
          <div className="font-mono-data text-xs font-semibold mt-0.5"
            style={{ color: battle.coinA.change >= 0 ? "#16a34a" : "#dc2626" }}>
            {battle.coinA.change >= 0 ? "+" : ""}{battle.coinA.change}%
          </div>
          {aWins && <div className="font-bungee text-xs mt-1" style={{ color: "#1a1a1a" }}>WINNING!</div>}
        </div>

        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bungee text-white text-sm"
          style={{ background: "#FF6B6B", border: "2.5px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a" }}>
          VS
        </div>

        <div className={`flex-1 text-center rounded-xl p-3 transition-colors ${!aWins ? "ring-2 ring-[#1a1a1a]" : ""}`}
          style={{ background: !aWins ? battle.color + "33" : "#f5f5f5" }}>
          <div className="text-4xl mb-1">{battle.coinB.icon}</div>
          <div className="font-bungee text-sm text-[#1a1a1a]">{battle.coinB.ticker}</div>
          <div className="font-mono-data text-xs font-semibold mt-0.5"
            style={{ color: battle.coinB.change >= 0 ? "#16a34a" : "#dc2626" }}>
            {battle.coinB.change >= 0 ? "+" : ""}{battle.coinB.change}%
          </div>
          {!aWins && <div className="font-bungee text-xs mt-1" style={{ color: "#1a1a1a" }}>WINNING!</div>}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: "#e5e5e5", border: "1.5px solid #1a1a1a" }}>
        <div className="h-full flex">
          <div className="transition-all duration-1000 rounded-l-full"
            style={{ width: `${pctA}%`, background: "#6BCB77" }} />
          <div className="transition-all duration-1000 rounded-r-full"
            style={{ width: `${pctB}%`, background: "#FF6B9D" }} />
        </div>
      </div>

      <div className="flex justify-between text-xs mb-4">
        <span className="font-mono-data font-semibold" style={{ color: "#16a34a" }}>{pctA.toFixed(0)}%</span>
        <span className="font-fredoka text-gray-500">VOL {battle.volume}</span>
        <span className="font-mono-data font-semibold" style={{ color: "#FF6B9D" }}>{pctB.toFixed(0)}%</span>
      </div>

      <button
        data-testid={`btn-battle-vote-${battle.id}`}
        className="cartoon-btn cartoon-btn-dark w-full py-3 text-sm"
        style={{ borderRadius: "12px" }}>
        JOIN BATTLE
      </button>
    </div>
  );
}

function CoinFightScene() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 4), 600);
    return () => clearInterval(id);
  }, []);
  const flashes = ["💥", "⚡", "💢", "✨"];

  return (
    <div className="relative flex items-center justify-center gap-4 md:gap-12 py-8">
      <div className="flex flex-col items-center gap-3" style={{ animation: "coinBobA 1.2s ease-in-out infinite" }}>
        <div className="text-7xl md:text-9xl">🐸</div>
        <div className="font-bungee text-[#1a1a1a] text-base">PEPE</div>
        <div className="font-mono-data text-sm font-bold" style={{ color: "#16a34a" }}>+24.7%</div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="text-4xl md:text-6xl" style={{ animation: "battleFlash 0.6s steps(1) infinite" }}>
          {flashes[frame]}
        </div>
        <div className="font-bungee text-white text-xl md:text-2xl px-5 py-2.5 rounded-2xl"
          style={{ background: "#FF6B6B", border: "2.5px solid #1a1a1a", boxShadow: "4px 4px 0 #1a1a1a" }}>
          VS
        </div>
        <div className="font-bungee text-xs" style={{ color: "#FF9F43", animation: "wiggle 1s ease-in-out infinite" }}>BATTLE LIVE!</div>
      </div>

      <div className="flex flex-col items-center gap-3" style={{ animation: "coinBobB 1.2s ease-in-out infinite" }}>
        <div className="text-7xl md:text-9xl">🐕</div>
        <div className="font-bungee text-[#1a1a1a] text-base">DOGE</div>
        <div className="font-mono-data text-sm font-bold" style={{ color: "#dc2626" }}>-8.3%</div>
      </div>
    </div>
  );
}

export default function Home() {
  usePageMeta({
    title: "VeloxFi — Memecoin Battle Platform on Solana",
    description: "The first memecoin battle arena on Solana. Create your coin, challenge rivals, and win. Highest % price surge wins. $BATTLE token presale live now.",
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
        @keyframes coinBobA {
          0%, 100% { transform: translateY(0px) rotate(-4deg); }
          50%       { transform: translateY(-18px) rotate(4deg); }
        }
        @keyframes coinBobB {
          0%, 100% { transform: translateY(-10px) rotate(4deg); }
          50%       { transform: translateY(10px) rotate(-4deg); }
        }
        @keyframes battleFlash {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50%       { transform: scale(1.3) rotate(8deg); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-4deg); }
          50%       { transform: rotate(4deg); }
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
      <nav data-testid="nav"
        className="sticky top-0 z-40"
        style={{ backgroundColor: "#FFFBF0", borderBottom: "2.5px solid #1a1a1a", boxShadow: "0 4px 0 #1a1a1a" }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" data-testid="nav-logo" className="flex items-center gap-2.5">
            <img src="/favicon.jpg" alt="VeloxFi" className="w-9 h-9 rounded-xl object-cover"
              style={{ border: "2.5px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a" }} />
            <span className="font-bungee text-xl text-[#1a1a1a] tracking-wide">VELOXFI</span>
          </a>

          <div className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map(({ label, path, color }) => {
              const isActive = location === path;
              return (
                <button key={path}
                  data-testid={`nav-link-${path.replace("/", "")}`}
                  onClick={() => navGo(path)}
                  className="text-sm font-fredoka font-semibold transition-all duration-100"
                  style={{
                    background: isActive ? color : "transparent",
                    color: "#1a1a1a",
                    border: isActive ? "2px solid #1a1a1a" : "2px solid transparent",
                    boxShadow: isActive ? "2px 2px 0 #1a1a1a" : "none",
                    borderRadius: "10px",
                    padding: "4px 12px",
                    cursor: "pointer",
                    fontWeight: isActive ? 700 : 500,
                    opacity: isActive ? 1 : 0.65,
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
            <button data-testid="btn-mobile-menu"
              onClick={() => setMobileOpen((o) => !o)}
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
              {NAV_LINKS.map(({ label, path, color }) => {
                const isActive = location === path;
                return (
                  <button key={path} onClick={() => navGo(path)}
                    className="w-full text-left py-3 px-4 text-sm font-fredoka font-semibold rounded-xl"
                    style={{
                      background: isActive ? color : "transparent",
                      border: isActive ? "2px solid #1a1a1a" : "2px solid transparent",
                      cursor: "pointer", color: "#1a1a1a", fontWeight: isActive ? 700 : 500,
                    }}>
                    {label}
                  </button>
                );
              })}
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
      <section ref={heroRef} data-testid="hero-section"
        className="relative z-10 overflow-hidden"
        style={{ minHeight: "calc(100dvh - 110px)" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 pt-12 pb-16 md:pt-16 md:pb-20">

          {/* LEFT: Text */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left max-w-2xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 font-bungee text-xs text-[#1a1a1a]"
              style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", animation: "badgePulse 1.8s ease-in-out infinite", boxShadow: "3px 3px 0 #1a1a1a" }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#1a1a1a" }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "#1a1a1a" }} />
              </span>
              PRESALE LIVE — LIMITED SPOTS!
            </div>

            {/* Title */}
            <h1 className="font-bungee leading-none mb-4" data-testid="hero-title"
              style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}>
              <span className="block text-[#1a1a1a]">LET YOUR</span>
              <span className="block rainbow-text-anim">MEMECOIN</span>
              <span className="block text-[#1a1a1a]">GO TO WAR</span>
            </h1>

            <p className="font-fredoka text-lg md:text-xl max-w-lg mb-8 leading-relaxed" style={{ color: "#555" }}>
              The first on-chain memecoin battle arena on Solana. Pit your coin against rivals, back the winner, and claim the spoils.{" "}
              <span className="font-semibold" style={{ color: "#FF6B9D" }}>Highest % price surge wins.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                data-testid="btn-hero-start-battle"
                onClick={() => navigate("/presale")}
                className="cartoon-btn cartoon-btn-yellow px-10 py-4 text-base"
                style={{ borderRadius: "16px" }}>
                BUY $BATTLE NOW
              </button>
              <button
                data-testid="btn-hero-view-battles"
                onClick={() => navigate("/demo")}
                className="cartoon-btn cartoon-btn-white px-10 py-4 text-base"
                style={{ borderRadius: "16px" }}>
                VIEW BATTLES
              </button>
            </div>

            {/* Mini stats */}
            <div className="flex gap-6">
              {[
                { label: "PRICE",   value: "1 SOL = 100K" },
                { label: "MIN BUY", value: "0.1 SOL" },
                { label: "GOAL",    value: "500 SOL" },
              ].map((s) => (
                <div key={s.label} className="cartoon-card text-center px-4 py-3"
                  style={{ boxShadow: "3px 3px 0 #1a1a1a" }}>
                  <div className="font-mono-data font-semibold text-sm" style={{ color: "#FF6B9D" }}>{s.value}</div>
                  <div className="font-bungee text-xs mt-0.5" style={{ color: "#1a1a1a", fontSize: "0.6rem" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Wolf mascot */}
          <div className="flex-shrink-0 flex items-center justify-center w-full md:w-auto"
            style={{ maxWidth: "560px" }}>
            <div style={{ animation: "float 4s ease-in-out infinite", position: "relative" }}>
              <img
                src="/favicon.jpg"
                alt="VeloxFi Wolf Warrior"
                className="w-full rounded-3xl object-cover"
                style={{
                  maxHeight: "600px",
                  border: "3px solid #1a1a1a",
                  boxShadow: "10px 10px 0px #1a1a1a",
                }}
              />
              {/* floating emoji decorations */}
              <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "2.5rem", animation: "wiggle 1.5s ease-in-out infinite" }}>⚔️</div>
              <div style={{ position: "absolute", bottom: "-20px", left: "-20px", fontSize: "2rem", animation: "wiggle 2s ease-in-out infinite reverse" }}>🏆</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section data-testid="stats-section" className="py-8 px-6 relative z-10"
        style={{ borderTop: "2.5px solid #1a1a1a", borderBottom: "2.5px solid #1a1a1a", background: "#1a1a1a" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-5">
          {[
            { value: "0",  label: "Battles Fought", color: "#FFD93D" },
            { value: "$0", label: "Total Volume",   color: "#FF6B9D" },
            { value: "0",  label: "Coins Created",  color: "#4CC9F0" },
          ].map((s) => (
            <div key={s.label} data-testid={`stat-card-${s.label.replace(/\s+/g, "-").toLowerCase()}`}
              className="text-center px-4 py-5 rounded-2xl"
              style={{ background: s.color, border: "2.5px solid #FFD93D", boxShadow: "4px 4px 0 #FFD93D22" }}>
              <div className="font-bungee text-2xl md:text-3xl text-[#1a1a1a]">{s.value}</div>
              <div className="font-fredoka text-sm font-semibold mt-1 text-[#1a1a1a]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BATTLE ARENA DEMO ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-6">
          <h2 className="font-bungee text-3xl md:text-4xl text-[#1a1a1a] mb-2">
            THE{" "}
            <span style={{ color: "#FF6B9D" }}>BATTLE ARENA</span>
          </h2>
          <p className="font-fredoka text-gray-500 text-lg">Watch coins fight it out in real-time!</p>
        </div>

        <div className="cartoon-card p-6 md:p-10"
          style={{ boxShadow: "8px 8px 0 #1a1a1a" }}>
          <CoinFightScene />
        </div>
      </section>

      {/* ── LIVE BATTLES ── */}
      <section data-testid="live-battles-section" className="max-w-5xl mx-auto px-6 pb-16 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-bungee text-2xl md:text-3xl text-[#1a1a1a]">
              LIVE <span style={{ color: "#6BCB77" }}>BATTLES</span>
            </h2>
            <p className="font-fredoka text-gray-500 mt-1">Real-time memecoin combat</p>
          </div>
          <div className="font-bungee text-xs px-3 py-1.5 rounded-full text-[#1a1a1a] flex items-center gap-2"
            style={{ background: "#6BCB77", border: "2px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a" }}>
            <span className="w-2 h-2 rounded-full bg-[#1a1a1a] animate-pulse" />
            3 LIVE
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BATTLES.map((battle) => (
            <BattleCard key={battle.id} battle={battle} />
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            data-testid="btn-view-all-battles"
            onClick={() => navigate("/demo")}
            className="cartoon-btn cartoon-btn-purple px-10 py-4 text-sm"
            style={{ borderRadius: "14px" }}>
            VIEW ALL BATTLES
          </button>
          <p className="font-fredoka text-gray-400 text-sm mt-4">Demo battles — real battles launching soon</p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section data-testid="how-it-works-section" className="max-w-5xl mx-auto px-6 pb-16 relative z-10">
        <div className="text-center mb-10">
          <h2 className="font-bungee text-2xl md:text-3xl text-[#1a1a1a] mb-2">
            HOW IT <span style={{ color: "#4CC9F0" }}>WORKS</span>
          </h2>
          <p className="font-fredoka text-gray-500 text-lg">Four steps from zero to glory</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.step}
              data-testid={`step-card-${step.step}`}
              className="p-6 relative transition-all duration-200 hover:-translate-y-1"
              style={{
                background: step.color,
                border: "2.5px solid #1a1a1a",
                boxShadow: "6px 6px 0 #1a1a1a",
                borderRadius: "16px",
              }}>
              <div className="text-4xl mb-3">{step.icon}</div>
              <div className="font-bungee text-xs text-[#1a1a1a] mb-1 opacity-60">STEP {step.step}</div>
              <h3 className="font-bungee text-lg text-[#1a1a1a] mb-2">{step.title}</h3>
              <p className="font-fredoka text-[#333] text-base leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LEADERBOARD PREVIEW ── */}
      <section data-testid="leaderboard-section" className="max-w-5xl mx-auto px-6 pb-16 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-bungee text-2xl md:text-3xl text-[#1a1a1a]">
              TOP <span style={{ color: "#FFD93D" }}>WARRIORS</span>
            </h2>
            <p className="font-fredoka text-gray-500 mt-1">Season 1 — be the first to claim a spot!</p>
          </div>
          <button
            data-testid="btn-view-leaderboard"
            onClick={() => navigate("/leaderboard")}
            className="cartoon-btn cartoon-btn-yellow px-5 py-2.5 text-xs"
            style={{ borderRadius: "10px" }}>
            FULL LEADERBOARD
          </button>
        </div>

        <div className="cartoon-card overflow-hidden" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
          <div className="grid grid-cols-12 gap-4 px-6 py-3 font-bungee text-xs text-gray-400"
            style={{ background: "#f5f0e0", borderBottom: "2px solid #1a1a1a", fontSize: "0.6rem" }}>
            <div className="col-span-1">RANK</div>
            <div className="col-span-5">PLAYER</div>
            <div className="col-span-2 text-right">BATTLES</div>
            <div className="col-span-2 text-right">WIN RATE</div>
            <div className="col-span-2 text-right">PNL</div>
          </div>

          {[
            { rank: 1, medal: "🥇", bg: "#FFD93D" },
            { rank: 2, medal: "🥈", bg: "#f5f5f5" },
            { rank: 3, medal: "🥉", bg: "#f5f5f5" },
          ].map((row) => (
            <div key={row.rank} data-testid={`leaderboard-row-${row.rank}`}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center"
              style={{ background: row.rank === 1 ? "#FFD93D22" : "white", borderBottom: "1.5px solid #eee" }}>
              <div className="col-span-1 text-2xl">{row.medal}</div>
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bungee text-gray-400 text-xs"
                  style={{ background: "#f5f0e0", border: "2px solid #ddd" }}>?</div>
                <div>
                  <div className="font-bungee text-sm text-gray-400">— UNCLAIMED —</div>
                  <div className="font-fredoka text-xs text-gray-400 mt-0.5">Rank #{row.rank} Open</div>
                </div>
              </div>
              <div className="col-span-2 text-right font-bungee text-sm text-gray-300">—</div>
              <div className="col-span-2 text-right font-bungee text-sm text-gray-300">—</div>
              <div className="col-span-2 text-right font-bungee text-sm text-gray-300">—</div>
            </div>
          ))}

          <div className="px-6 py-6 text-center" style={{ background: "#f5f0e0" }}>
            <p className="font-fredoka text-gray-500 text-base mb-3">Season 1 just launched — your name could be here!</p>
            <button
              data-testid="btn-leaderboard-join"
              onClick={() => navigate("/presale")}
              className="cartoon-btn cartoon-btn-dark px-8 py-3 text-sm"
              style={{ borderRadius: "12px" }}>
              ENTER THE ARENA
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
          {/* Presale card */}
          <div className="cartoon-card-orange p-8 relative transition-all duration-200 hover:-translate-y-1"
            style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: "rgba(255,255,255,0.4)", border: "2px solid #1a1a1a" }}>
                <Trophy className="w-6 h-6 text-[#1a1a1a]" />
              </div>
              <div className="font-bungee text-xs px-3 py-1 rounded-full text-[#1a1a1a]"
                style={{ background: "#6BCB77", border: "2px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a" }}>
                LIVE NOW
              </div>
            </div>
            <div className="font-bungee text-3xl text-[#1a1a1a] mb-1">PRESALE</div>
            <p className="font-mono-data text-sm mt-2 text-[#333]">1 SOL = 100,000 $BATTLE · Goal: 500 SOL</p>
            <div className="mt-6 h-3 rounded-full overflow-hidden" style={{ background: "rgba(26,26,26,0.15)", border: "1.5px solid #1a1a1a" }}>
              <div className="h-full rounded-full w-[12%]" style={{ background: "#1a1a1a" }} />
            </div>
            <p className="font-mono-data text-xs mt-2 text-[#333]">60 / 500 SOL raised</p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="cartoon-card-sky p-7 relative transition-all duration-200 hover:-translate-y-1 flex-1"
              style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-2xl"
                style={{ background: "rgba(255,255,255,0.4)", border: "2px solid #1a1a1a" }}>
                <Zap className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <div className="font-bungee text-2xl text-[#1a1a1a] tabular-nums">1,000,000,000</div>
              <div className="font-fredoka text-sm font-semibold mt-1 text-[#333]">Total Supply</div>
            </div>

            <div className="cartoon-card-lime p-7 relative transition-all duration-200 hover:-translate-y-1 flex-1"
              style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-2xl"
                style={{ background: "rgba(255,255,255,0.4)", border: "2px solid #1a1a1a" }}>
                <Shield className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <div className="font-bungee text-2xl text-[#1a1a1a]">SOLANA</div>
              <div className="font-fredoka text-sm font-semibold mt-1 text-[#333]">Built on SOL</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section data-testid="cta-section" className="max-w-5xl mx-auto px-6 pb-20 relative z-10">
        <div className="cartoon-card-yellow p-12 text-center relative"
          style={{ boxShadow: "8px 8px 0 #1a1a1a" }}>
          <h2 className="font-bungee text-3xl md:text-5xl text-[#1a1a1a] mb-4 leading-tight">
            THE PRESALE IS{" "}
            <span style={{ color: "#6BCB77" }}>LIVE!</span>
          </h2>
          <p className="font-fredoka text-[#333] mb-8 max-w-lg mx-auto text-xl leading-relaxed">
            Be one of the first 100 warriors. Join the presale now and claim your OG badge.{" "}
            <span className="font-semibold" style={{ color: "#FF6B9D" }}>Only early holders get OG status.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              data-testid="btn-cta-launch"
              onClick={() => navigate("/presale")}
              className="cartoon-btn cartoon-btn-dark px-12 py-5 text-lg"
              style={{ borderRadius: "16px" }}>
              BUY $BATTLE NOW
            </button>
            <button
              onClick={() => navigate("/whitepaper")}
              className="cartoon-btn cartoon-btn-white px-10 py-5 text-base"
              style={{ borderRadius: "16px" }}>
              READ WHITEPAPER
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: "PRICE", value: "1 SOL = 100K" },
              { label: "MIN",   value: "0.1 SOL" },
              { label: "MAX",   value: "10 SOL/wallet" },
              { label: "GOAL",  value: "500 SOL" },
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
              <img src="/favicon.jpg" alt="VeloxFi" className="w-8 h-8 rounded-xl object-cover"
                style={{ border: "2px solid #FFD93D" }} />
              <span className="font-bungee text-lg tracking-wide" style={{ color: "#FFD93D" }}>VELOXFI</span>
              <span className="font-fredoka text-sm ml-1" style={{ color: "#555" }}>Battle Arena</span>
            </div>

            <div className="flex items-center flex-wrap justify-center gap-6 font-fredoka font-semibold text-sm">
              {[
                { label: "Roadmap",    path: "/roadmap",    testId: "footer-link-roadmap" },
                { label: "FAQ",        path: "/faq",        testId: "footer-link-faq" },
                { label: "Terms",      path: "/terms",      testId: "footer-link-terms" },
                { label: "Privacy",    path: "/privacy",    testId: "footer-link-privacy" },
                { label: "Whitepaper", path: "/whitepaper", testId: "footer-link-whitepaper" },
              ].map(({ label, path, testId }) => (
                <button key={path} data-testid={testId} onClick={() => navigate(path)}
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
                    transition: "transform 0.08s ease, box-shadow 0.08s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.transform = "translate(-1px,-1px)"; el.style.boxShadow = "3px 3px 0 #444";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.transform = "translate(0,0)"; el.style.boxShadow = "2px 2px 0 #444";
                  }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t pt-6 text-center" style={{ borderColor: "#333" }}>
            <p className="text-sm font-fredoka" style={{ color: "#555" }}>
              © 2026 VeloxFi · Built on Solana · Not financial advice
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
