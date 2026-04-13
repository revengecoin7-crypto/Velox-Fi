import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Zap, Shield, Trophy, Clock, TrendingUp, TrendingDown, Swords, Menu, X } from "lucide-react";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import { usePageMeta } from "@/hooks/usePageMeta";

/* ── Battle data ── */
const BATTLES = [
  {
    id: 1,
    coinA: { name: "PEPE", ticker: "PEPE", change: +18.4, icon: "🐸" },
    coinB: { name: "DOGE", ticker: "DOGE", change: -6.2, icon: "🐕" },
    volume: "$1.24M",
    endsIn: 3 * 60 + 42,
  },
  {
    id: 2,
    coinA: { name: "BONK", ticker: "BONK", change: +31.7, icon: "🔨" },
    coinB: { name: "WIF",  ticker: "WIF",  change: -14.5, icon: "🎩" },
    volume: "$876K",
    endsIn: 8 * 60 + 15,
  },
  {
    id: 3,
    coinA: { name: "BOME",   ticker: "BOME",   change: -3.1,  icon: "💣" },
    coinB: { name: "POPCAT", ticker: "POPCAT", change: +22.9, icon: "😺" },
    volume: "$2.1M",
    endsIn: 14 * 60 + 58,
  },
];

const HOW_IT_WORKS = [
  { step: "01", emoji: "👛", title: "GET YOUR WALLET", desc: "Buy $BATTLE tokens and connect Phantom to the VeloxFi arena." },
  { step: "02", emoji: "🚀", title: "CREATE YOUR COIN", desc: "Launch your memecoin directly on VeloxFi — no external tools needed." },
  { step: "03", emoji: "⚔️",  title: "CHALLENGE A RIVAL", desc: "Challenge another coin to a battle — pick your duration: 1h to 7 days." },
  { step: "04", emoji: "🏆", title: "WIN THE SPOILS", desc: "Highest % price surge wins. Victor earns 30% of the loser's tokens." },
];

const TICKER_ITEMS = [
  "🔥 $BATTLE PRESALE LIVE 🔥",
  "⚔️ JOIN THE BATTLEFIELD ⚔️",
  "🐺 1 SOL = 100,000 $BATTLE 🐺",
  "💰 PRESALE GOAL: 500 SOL 💰",
  "🚀 BUILT ON SOLANA 🚀",
  "🎯 MIN BUY: 0.1 SOL 🎯",
  "🏆 OG BADGE FOR EARLY WARRIORS 🏆",
];

const FLOATING_COINS = [
  { emoji: "🪙", x: "8%",  y: "18%", delay: "0s",   dur: "4s",   size: "2.4rem" },
  { emoji: "💎", x: "14%", y: "68%", delay: "0.7s",  dur: "5s",   size: "2rem"   },
  { emoji: "🔥", x: "84%", y: "14%", delay: "1.2s",  dur: "3.5s", size: "2.2rem" },
  { emoji: "⚡", x: "91%", y: "58%", delay: "2s",    dur: "4.5s", size: "2rem"   },
  { emoji: "🚀", x: "4%",  y: "48%", delay: "1.5s",  dur: "6s",   size: "1.8rem" },
  { emoji: "💰", x: "77%", y: "78%", delay: "0.3s",  dur: "5.5s", size: "2.5rem" },
  { emoji: "🎯", x: "48%", y: "88%", delay: "2.5s",  dur: "4s",   size: "1.8rem" },
  { emoji: "🪙", x: "64%", y: "8%",  delay: "1s",    dur: "5s",   size: "2.2rem" },
  { emoji: "💥", x: "34%", y: "82%", delay: "3s",    dur: "3.5s", size: "2rem"   },
  { emoji: "⚔️", x: "24%", y: "10%", delay: "0.5s",  dur: "4.5s", size: "2rem"   },
  { emoji: "🌙", x: "55%", y: "22%", delay: "1.8s",  dur: "5.5s", size: "1.7rem" },
  { emoji: "💫", x: "72%", y: "42%", delay: "0.9s",  dur: "4.2s", size: "1.9rem" },
  { emoji: "🎆", x: "18%", y: "35%", delay: "2.2s",  dur: "5s",   size: "2.1rem" },
  { emoji: "🏆", x: "88%", y: "35%", delay: "3.5s",  dur: "4.8s", size: "1.8rem" },
  { emoji: "💸", x: "42%", y: "5%",  delay: "1.3s",  dur: "3.8s", size: "2rem"   },
  { emoji: "🎰", x: "3%",  y: "80%", delay: "2.8s",  dur: "5.2s", size: "1.7rem" },
  { emoji: "⭐", x: "60%", y: "72%", delay: "0.4s",  dur: "4.3s", size: "1.9rem" },
  { emoji: "🔫", x: "30%", y: "55%", delay: "1.6s",  dur: "5.8s", size: "1.6rem" },
  { emoji: "💣", x: "96%", y: "82%", delay: "2.1s",  dur: "4.7s", size: "2rem"   },
  { emoji: "🩸", x: "44%", y: "40%", delay: "3.2s",  dur: "3.9s", size: "1.5rem" },
];

/* ── Countdown ── */
function CountdownTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setRemaining((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(remaining / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");
  return (
    <div className="flex items-center gap-1.5 font-orbitron text-sm">
      <Clock className="w-3.5 h-3.5 text-yellow-400" />
      <span className="text-yellow-300 font-bold">{m}:{s}</span>
    </div>
  );
}

/* ── Battle Card ── */
function BattleCard({ battle }: { battle: typeof BATTLES[0] }) {
  const [pctA, setPctA] = useState(55);
  useEffect(() => {
    const spread = battle.coinA.change - battle.coinB.change;
    setPctA(50 + Math.min(Math.max(spread * 1.2, -40), 40));
  }, [battle]);
  const pctB = 100 - pctA;

  return (
    <div
      data-testid={`battle-card-${battle.id}`}
      className="rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        background: "linear-gradient(135deg, rgba(15,20,40,0.95), rgba(20,10,40,0.95))",
        border: "1px solid rgba(139,92,246,0.4)",
        boxShadow: "0 0 20px rgba(124,58,237,0.15)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-orbitron tracking-widest px-2 py-1 rounded-full"
          style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}>
          ⚡ LIVE
        </span>
        <CountdownTimer seconds={battle.endsIn} />
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 text-center">
          <div className="text-3xl mb-1">{battle.coinA.icon}</div>
          <div className="font-orbitron font-black text-white text-sm">{battle.coinA.ticker}</div>
          <div className={`text-xs font-bold mt-0.5 ${battle.coinA.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {battle.coinA.change >= 0 ? "+" : ""}{battle.coinA.change}%
          </div>
        </div>

        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-orbitron text-white text-xs font-black"
          style={{ background: "linear-gradient(135deg, #ef4444, #7c3aed)", boxShadow: "0 0 12px rgba(239,68,68,0.5)" }}>
          VS
        </div>

        <div className="flex-1 text-center">
          <div className="text-3xl mb-1">{battle.coinB.icon}</div>
          <div className="font-orbitron font-black text-white text-sm">{battle.coinB.ticker}</div>
          <div className={`text-xs font-bold mt-0.5 ${battle.coinB.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {battle.coinB.change >= 0 ? "+" : ""}{battle.coinB.change}%
          </div>
        </div>
      </div>

      <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full flex">
          <div className="transition-all duration-1000 rounded-l-full"
            style={{ width: `${pctA}%`, background: "linear-gradient(90deg, #2563eb, #60a5fa)" }} />
          <div className="transition-all duration-1000 rounded-r-full"
            style={{ width: `${pctB}%`, background: "linear-gradient(90deg, #7c3aed, #a78bfa)" }} />
        </div>
      </div>

      <div className="flex justify-between text-xs font-orbitron mb-4">
        <span className="text-blue-400 font-bold">{pctA.toFixed(0)}%</span>
        <span className="text-gray-500 text-xs">VOL {battle.volume}</span>
        <span className="text-purple-400 font-bold">{pctB.toFixed(0)}%</span>
      </div>

      <button
        data-testid={`btn-battle-vote-${battle.id}`}
        className="w-full py-3 rounded-xl text-xs font-orbitron font-black tracking-widest transition-all duration-200 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          boxShadow: "0 0 15px rgba(124,58,237,0.4)",
        }}
      >
        ⚔️ JOIN BATTLE ⚔️
      </button>
    </div>
  );
}

/* ── Coin Fight Scene ── */
function CoinFightScene() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 4), 600);
    return () => clearInterval(id);
  }, []);
  const flashes = ["💥", "⚡", "💢", "✨"];

  return (
    <div className="relative flex items-center justify-center gap-4 md:gap-8 py-8">
      {/* Coin A */}
      <div className="flex flex-col items-center gap-2" style={{ animation: "coinBobA 1.2s ease-in-out infinite" }}>
        <div className="text-6xl md:text-8xl" style={{ filter: "drop-shadow(0 0 20px #3b82f6)" }}>🐸</div>
        <div className="font-orbitron font-black text-blue-400 text-sm md:text-base">PEPE</div>
        <div className="text-green-400 font-bold text-xs">+24.7%</div>
      </div>

      {/* Battle flash */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-4xl md:text-6xl" style={{ animation: "battleFlash 0.6s steps(1) infinite" }}>
          {flashes[frame]}
        </div>
        <div className="font-orbitron font-black text-white text-lg md:text-2xl px-4 py-2 rounded-xl"
          style={{ background: "linear-gradient(135deg, #ef4444, #7c3aed)", boxShadow: "0 0 20px rgba(239,68,68,0.6)" }}>
          VS
        </div>
        <div className="text-yellow-400 text-xs font-orbitron animate-pulse">BATTLE LIVE</div>
      </div>

      {/* Coin B */}
      <div className="flex flex-col items-center gap-2" style={{ animation: "coinBobB 1.2s ease-in-out infinite" }}>
        <div className="text-6xl md:text-8xl" style={{ filter: "drop-shadow(0 0 20px #a855f7)" }}>🐕</div>
        <div className="font-orbitron font-black text-purple-400 text-sm md:text-base">DOGE</div>
        <div className="text-red-400 font-bold text-xs">-8.3%</div>
      </div>

      {/* Explosion sparks */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute text-sm pointer-events-none"
          style={{
            animation: `spark${i % 3} ${1 + (i * 0.3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
            top: `${20 + (i * 10)}%`,
            left: `${30 + (i * 7)}%`,
            opacity: 0.7,
          }}
        >
          ✦
        </div>
      ))}
    </div>
  );
}

/* ── Confetti burst on page load ── */
const CONFETTI_COLORS = ["#4ade80","#60a5fa","#a855f7","#f59e0b","#ec4899","#34d399","#fff"];
const CONFETTI_PIECES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  x: `${Math.random() * 100}%`,
  size: `${6 + Math.random() * 8}px`,
  delay: `${Math.random() * 1.8}s`,
  dur:   `${2.5 + Math.random() * 2}s`,
  shape: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0%",
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
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: "-20px",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape,
            animation: `confettiFall ${p.dur} ease-in forwards`,
            animationDelay: p.delay,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}

/* ── Main Component ── */
export default function Home() {
  usePageMeta({
    title: "VeloxFi — Memecoin Battle Platform on Solana",
    description: "The first memecoin battle arena on Solana. Create your coin, challenge rivals, and win. Highest % price surge wins. $BATTLE token presale live now.",
    canonical: "https://veloxfi.io",
  });

  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);

  function navGo(path: string) {
    setMobileOpen(false);
    navigate(path);
  }

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ backgroundColor: "#05080f", minHeight: "100vh", color: "white", overflow: "hidden" }}>

      <Confetti />

      {/* ── KEYFRAME ANIMATIONS ── */}
      <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-18px) rotate(8deg); }
        }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 10px #3b82f6, 0 0 30px #3b82f6, 0 0 60px #3b82f6; }
          50%       { text-shadow: 0 0 20px #a855f7, 0 0 50px #a855f7, 0 0 90px #a855f7; }
        }
        @keyframes wolfGlow {
          0%, 100% { filter: drop-shadow(0 0 30px rgba(59,130,246,0.6)) drop-shadow(0 0 60px rgba(124,58,237,0.3)); }
          50%       { filter: drop-shadow(0 0 50px rgba(168,85,247,0.8)) drop-shadow(0 0 100px rgba(59,130,246,0.4)); }
        }
        @keyframes coinBobA {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50%       { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes coinBobB {
          0%, 100% { transform: translateY(-8px) rotate(3deg); }
          50%       { transform: translateY(8px) rotate(-3deg); }
        }
        @keyframes battleFlash {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.3); }
        }
        @keyframes spark0 { 0%,100%{transform:translate(0,0) scale(1);opacity:.7} 50%{transform:translate(-15px,-20px) scale(1.5);opacity:1} }
        @keyframes spark1 { 0%,100%{transform:translate(0,0) scale(1);opacity:.5} 50%{transform:translate(15px,-15px) scale(1.3);opacity:0.9} }
        @keyframes spark2 { 0%,100%{transform:translate(0,0) scale(0.8);opacity:.6} 50%{transform:translate(-10px,15px) scale(1.4);opacity:1} }
        @keyframes btnPulse {
          0%   { box-shadow: 0 0 25px rgba(59,130,246,0.8), 0 0 50px rgba(124,58,237,0.4); transform: scale(1); }
          50%  { box-shadow: 0 0 50px rgba(168,85,247,1),   0 0 90px rgba(59,130,246,0.6); transform: scale(1.04); }
          100% { box-shadow: 0 0 25px rgba(59,130,246,0.8), 0 0 50px rgba(124,58,237,0.4); transform: scale(1); }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes badgePing {
          0%, 100% { box-shadow: 0 0 8px rgba(74,222,128,0.5),  0 0 20px rgba(74,222,128,0.2); }
          50%       { box-shadow: 0 0 20px rgba(74,222,128,1),   0 0 40px rgba(74,222,128,0.6), 0 0 60px rgba(74,222,128,0.3); }
        }
        .presale-badge { animation: badgePing 1.5s ease-in-out infinite; }
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(30px, -40px) scale(1.1); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-25px, 35px) scale(0.9); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(59,130,246,0.4); box-shadow: 0 0 10px rgba(59,130,246,0.2); }
          50%       { border-color: rgba(168,85,247,0.6); box-shadow: 0 0 25px rgba(168,85,247,0.3); }
        }
        .btn-mega {
          animation: btnPulse 2s ease-in-out infinite;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .btn-mega:hover {
          transform: scale(1.06) translateY(-2px);
        }
        .hero-title-glow {
          animation: glowPulse 3s ease-in-out infinite;
        }
        .wolf-image {
          animation: wolfGlow 3s ease-in-out infinite;
        }
      `}</style>

      {/* ── TICKER STRIP ── */}
      <div
        className="w-full overflow-hidden py-2 relative z-50"
        style={{ background: "linear-gradient(90deg, #1d4ed8, #7c3aed, #1d4ed8)", borderBottom: "1px solid rgba(168,85,247,0.4)" }}
      >
        <div
          className="flex gap-12 whitespace-nowrap font-orbitron text-xs font-bold text-white tracking-widest"
          style={{ animation: "tickerScroll 20s linear infinite", width: "max-content" }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex-shrink-0">{item}</span>
          ))}
        </div>
      </div>

      {/* ── NAV ── */}
      <nav
        data-testid="nav"
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${navScrolled ? "backdrop-blur-xl" : ""}`}
        style={{
          backgroundColor: navScrolled ? "rgba(5,8,15,0.95)" : "rgba(5,8,15,0.6)",
          borderBottom: navScrolled ? "1px solid rgba(124,58,237,0.2)" : "1px solid transparent",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" data-testid="nav-logo" className="flex items-center gap-2.5 group">
            <img src="/favicon.jpg" alt="VeloxFi Wolf" className="w-9 h-9 rounded-lg object-cover" style={{ border: "1px solid rgba(124,58,237,0.5)" }} />
            <span className="font-orbitron font-black text-lg tracking-wider"
              style={{ background: "linear-gradient(135deg, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              VELOXFI
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "⚔️ Battles",    path: "/battles",     color: "#34d399" },
              { label: "🏆 Leaderboard", path: "/leaderboard", color: "#f59e0b" },
              { label: "🚀 Create Coin", path: "/create",      color: "#a78bfa" },
              { label: "🎮 Demo",        path: "/demo",        color: "#a78bfa" },
              { label: "⚔️ Game",        path: "/game",        color: "#f97316" },
              { label: "🔥 Presale",     path: "/presale",     color: "#4ade80" },
              { label: "Whitepaper",     path: "/whitepaper",  color: "#6b7280" },
              { label: "FAQ",            path: "/faq",         color: "#60a5fa" },
              { label: "Roadmap",        path: "/roadmap",     color: "#34d399" },
            ].map(({ label, path, color }) => (
              <button
                key={path}
                data-testid={`nav-link-${path.replace("/", "")}`}
                onClick={() => navGo(path)}
                className="text-sm font-medium tracking-wide transition-all duration-150 hover:scale-105"
                style={{ color, background: "none", border: "none", cursor: "pointer" }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ConnectWalletButton />
            <button
              data-testid="btn-mobile-menu"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ background: mobileOpen ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", color: "white" }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t" style={{ borderColor: "rgba(124,58,237,0.15)", background: "rgba(5,8,15,0.98)" }}>
            <div className="flex flex-col py-2">
              {[
                { label: "⚔️ Battles",    path: "/battles",     color: "#34d399" },
                { label: "🏆 Leaderboard", path: "/leaderboard", color: "#f59e0b" },
                { label: "🚀 Create Coin", path: "/create",      color: "#a78bfa" },
                { label: "🎮 Demo",        path: "/demo",        color: "#a78bfa" },
                { label: "⚔️ Game",        path: "/game",        color: "#f97316" },
                { label: "🔥 Presale",     path: "/presale",     color: "#4ade80" },
                { label: "Whitepaper",     path: "/whitepaper",  color: "#6b7280" },
                { label: "FAQ",            path: "/faq",         color: "#60a5fa" },
                { label: "Roadmap",        path: "/roadmap",     color: "#34d399" },
              ].map(({ label, path, color }) => (
                <button key={path} onClick={() => navGo(path)}
                  className="w-full text-left px-6 py-3.5 text-sm font-medium"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = color; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        data-testid="hero-section"
        className="relative overflow-hidden"
        style={{ minHeight: "calc(100vh - 110px)" }}
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
            style={{ background: "#2563eb", top: "10%", left: "-10%", animation: "orbFloat1 8s ease-in-out infinite" }} />
          <div className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
            style={{ background: "#7c3aed", top: "30%", right: "-5%", animation: "orbFloat2 10s ease-in-out infinite" }} />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
            style={{ background: "#a855f7", bottom: "10%", left: "40%", animation: "orbFloat1 12s ease-in-out infinite reverse" }} />
        </div>

        {/* Floating coin emojis */}
        {FLOATING_COINS.map((coin, i) => (
          <div
            key={i}
            className="absolute pointer-events-none select-none"
            style={{
              left: coin.x,
              top: coin.y,
              fontSize: coin.size,
              animation: `floatUpDown ${coin.dur} ease-in-out infinite`,
              animationDelay: coin.delay,
              zIndex: 1,
              opacity: 0.5,
            }}
          >
            {coin.emoji}
          </div>
        ))}

        {/* Two-column hero */}
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 pt-12 pb-16 md:pt-16 md:pb-20 relative z-10">

          {/* LEFT: Text */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left max-w-2xl">

            {/* Live badge */}
            <div className="presale-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 font-orbitron text-sm font-black tracking-widest"
              style={{ background: "rgba(74,222,128,0.2)", border: "2px solid #4ade80", color: "#4ade80" }}>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
              </span>
              🔥 PRESALE LIVE — LIMITED SPOTS 🔥
            </div>

            {/* Main title */}
            <h1
              className="font-orbitron font-black leading-none mb-2"
              data-testid="hero-title"
              style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
            >
              <span className="block text-white">⚔️ LET YOUR</span>
              <span
                className="block hero-title-glow"
                style={{
                  background: "linear-gradient(135deg, #60a5fa 0%, #a855f7 50%, #ec4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  backgroundSize: "200% auto",
                }}
              >
                MEMECOIN
              </span>
              <span className="block text-white">GO TO WAR ⚔️</span>
            </h1>

            <p className="text-gray-300 text-lg md:text-xl max-w-lg mb-8 mt-6 leading-relaxed">
              The first on-chain memecoin battle arena on Solana. 🐺 Pit your coin against rivals, back the winner, and claim the spoils. <span className="text-yellow-400 font-bold">Highest % price surge wins.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                data-testid="btn-hero-start-battle"
                className="btn-mega px-10 py-5 rounded-2xl text-base font-orbitron font-black tracking-wider"
                onClick={() => navigate("/presale")}
                style={{
                  background: "linear-gradient(135deg, #2563eb, #7c3aed, #a855f7)",
                  backgroundSize: "200% auto",
                  animation: "btnPulse 2s ease-in-out infinite, shimmer 3s linear infinite",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                  fontSize: "1rem",
                }}
              >
                🔥 BUY $BATTLE NOW 🔥
              </button>
              <button
                data-testid="btn-hero-view-battles"
                onClick={() => navigate("/demo")}
                className="px-10 py-5 rounded-2xl text-base font-orbitron font-black tracking-wider transition-all duration-200 hover:scale-105"
                style={{
                  background: "transparent",
                  border: "2px solid rgba(139,92,246,0.6)",
                  cursor: "pointer",
                  color: "#a78bfa",
                  boxShadow: "0 0 15px rgba(124,58,237,0.2)",
                  fontSize: "1rem",
                }}
              >
                ⚔️ VIEW BATTLES
              </button>
            </div>

            {/* Trust line */}
            <p className="text-xs font-orbitron tracking-widest" style={{ color: "#4ade80" }}>
              ✅ BUILT ON SOLANA &middot; ✅ $BATTLE TOKEN &middot; ✅ PRESALE NOW LIVE
            </p>

            {/* Presale stats mini */}
            <div className="flex gap-6 mt-6">
              {[
                { label: "PRICE", value: "1 SOL = 100K" },
                { label: "MIN BUY", value: "0.1 SOL" },
                { label: "GOAL", value: "500 SOL" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-orbitron font-black text-white text-sm md:text-base">{s.value}</div>
                  <div className="text-gray-500 text-xs font-orbitron tracking-widest mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Wolf mascot — HUGE */}
          <div
            className="flex-shrink-0 w-full md:w-auto flex items-center justify-center"
            style={{ maxWidth: "660px" }}
          >
            <img
              src="/favicon.jpg"
              alt="VeloxFi Wolf Warrior"
              className="wolf-image w-full rounded-3xl object-cover"
              style={{
                maxHeight: "700px",
                border: "2px solid rgba(124,58,237,0.5)",
                boxShadow: "0 0 80px rgba(59,130,246,0.5), 0 0 160px rgba(124,58,237,0.3), 0 0 240px rgba(168,85,247,0.15)",
              }}
            />
          </div>

        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section data-testid="stats-section" className="py-6 px-6 relative"
        style={{ background: "linear-gradient(90deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08), rgba(37,99,235,0.08))", borderTop: "1px solid rgba(124,58,237,0.15)", borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 md:gap-8">
          {[
            { icon: "⚔️", value: "0",  label: "BATTLES FOUGHT" },
            { icon: "💰", value: "$0", label: "TOTAL VOLUME" },
            { icon: "🚀", value: "0",  label: "COINS CREATED" },
          ].map((s) => (
            <div key={s.label} data-testid={`stat-card-${s.label.replace(/\s+/g, "-").toLowerCase()}`} className="text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-orbitron font-black text-2xl md:text-3xl text-white">{s.value}</div>
              <div className="font-orbitron text-xs text-gray-500 tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COIN BATTLE ARENA ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-4">
          <h2 className="font-orbitron font-black text-3xl md:text-4xl text-white mb-2">
            🏟️ THE <span style={{ color: "#f59e0b" }}>BATTLE ARENA</span>
          </h2>
          <p className="text-gray-400 text-sm">Watch coins fight it out in real-time price wars</p>
        </div>

        <div className="rounded-3xl p-6 md:p-10 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(15,20,40,0.9), rgba(20,10,40,0.9))",
            border: "2px solid rgba(124,58,237,0.3)",
            boxShadow: "0 0 40px rgba(124,58,237,0.15), inset 0 0 60px rgba(37,99,235,0.05)",
            animation: "borderGlow 3s ease-in-out infinite",
          }}>
          <CoinFightScene />
        </div>
      </section>

      {/* ── LIVE BATTLES ── */}
      <section data-testid="live-battles-section" className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-orbitron font-black text-2xl md:text-3xl text-white">
              ⚡ LIVE <span style={{ color: "#4ade80" }}>BATTLES</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Real-time memecoin combat</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-orbitron text-emerald-400 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            3 LIVE
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {BATTLES.map((battle) => (
            <BattleCard key={battle.id} battle={battle} />
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            data-testid="btn-view-all-battles"
            onClick={() => navigate("/demo")}
            className="px-10 py-4 rounded-2xl text-sm font-orbitron font-black tracking-widest transition-all duration-200 hover:scale-105"
            style={{ border: "2px solid rgba(139,92,246,0.5)", color: "#a78bfa", background: "rgba(124,58,237,0.08)", cursor: "pointer" }}
          >
            🎮 VIEW ALL BATTLES
          </button>
          <p className="text-gray-600 text-xs font-orbitron tracking-widest mt-4">DEMO BATTLES — REAL BATTLES LAUNCHING SOON</p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section data-testid="how-it-works-section" className="max-w-5xl mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <h2 className="font-orbitron font-black text-2xl md:text-3xl text-white mb-2">
            🎯 HOW IT <span style={{ background: "linear-gradient(135deg, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>WORKS</span>
          </h2>
          <p className="text-gray-500 text-sm">Four steps from zero to glory 🏆</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.step}
              data-testid={`step-card-${step.step}`}
              className="rounded-2xl p-6 text-center relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, rgba(15,20,40,0.9), rgba(20,10,40,0.9))",
                border: `1px solid ${i % 2 === 0 ? "rgba(59,130,246,0.3)" : "rgba(168,85,247,0.3)"}`,
                boxShadow: `0 0 15px ${i % 2 === 0 ? "rgba(59,130,246,0.1)" : "rgba(168,85,247,0.1)"}`,
              }}
            >
              <div className="font-orbitron text-xs font-black mb-3 opacity-50" style={{ color: i % 2 === 0 ? "#60a5fa" : "#a855f7" }}>STEP {step.step}</div>
              <div className="text-4xl mb-3">{step.emoji}</div>
              <h3 className="font-orbitron font-black text-xs text-white mb-2 leading-snug">{step.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LEADERBOARD PREVIEW ── */}
      <section data-testid="leaderboard-section" className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-orbitron font-black text-2xl md:text-3xl text-white">
              🏆 TOP <span style={{ color: "#f59e0b" }}>WARRIORS</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Season 1 — be the first to claim a spot</p>
          </div>
          <button
            data-testid="btn-view-leaderboard"
            onClick={() => navigate("/leaderboard")}
            className="px-5 py-2.5 rounded-xl text-xs font-orbitron font-black transition-all hover:scale-105"
            style={{ border: "1px solid rgba(245,158,11,0.4)", color: "#f59e0b", background: "rgba(245,158,11,0.08)", cursor: "pointer" }}
          >
            FULL LEADERBOARD
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(124,58,237,0.2)", background: "rgba(10,12,25,0.8)" }}>
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-orbitron text-gray-600 tracking-widest"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="col-span-1">RANK</div>
            <div className="col-span-5">PLAYER</div>
            <div className="col-span-2 text-right">BATTLES</div>
            <div className="col-span-2 text-right">WIN RATE</div>
            <div className="col-span-2 text-right">PNL</div>
          </div>

          {[
            { rank: 1, medal: "🥇", color: "#FFD700" },
            { rank: 2, medal: "🥈", color: "#C0C0C0" },
            { rank: 3, medal: "🥉", color: "#CD7F32" },
          ].map((row) => (
            <div key={row.rank} data-testid={`leaderboard-row-${row.rank}`}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <div className="col-span-1 text-xl">{row.medal}</div>
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 text-xs font-orbitron"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>?</div>
                <div>
                  <div className="font-orbitron text-sm font-bold text-gray-700">— UNCLAIMED —</div>
                  <div className="text-xs text-gray-700 font-orbitron tracking-widest">RANK #{row.rank} OPEN</div>
                </div>
              </div>
              <div className="col-span-2 text-right font-orbitron text-sm text-gray-700">—</div>
              <div className="col-span-2 text-right font-orbitron text-sm text-gray-700">—</div>
              <div className="col-span-2 text-right font-orbitron text-sm text-gray-700">—</div>
            </div>
          ))}

          <div className="px-6 py-5 text-center" style={{ background: "rgba(124,58,237,0.05)" }}>
            <p className="text-gray-500 text-xs font-orbitron tracking-widest mb-3">🚀 SEASON 1 JUST LAUNCHED — YOUR NAME COULD BE HERE</p>
            <button
              data-testid="btn-leaderboard-join"
              onClick={() => navigate("/presale")}
              className="btn-mega px-8 py-3 rounded-xl text-xs font-orbitron font-black tracking-wider text-white"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", border: "none", cursor: "pointer" }}
            >
              ⚔️ ENTER THE ARENA
            </button>
          </div>
        </div>
      </section>

      {/* ── $BATTLE TOKEN ── */}
      <section data-testid="token-section" className="max-w-5xl mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <h2 className="font-orbitron font-black text-2xl md:text-3xl text-white mb-2">
            💰 THE{" "}
            <span style={{ background: "linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              $BATTLE
            </span>{" "}
            TOKEN
          </h2>
          <p className="text-gray-500 text-sm">The fuel of the VeloxFi arena — stake, earn, and govern 🐺</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: <Zap className="w-6 h-6" />, color: "#60a5fa", bg: "rgba(37,99,235,0.15)", border: "rgba(37,99,235,0.3)",
              title: "1,000,000,000", sub: "TOTAL SUPPLY", badge: null,
            },
            {
              icon: <Trophy className="w-6 h-6" />, color: "#a78bfa", bg: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.3)",
              title: "PRESALE", sub: null,
              badge: { text: "🔥 LIVE NOW", bg: "rgba(74,222,128,0.15)", border: "rgba(74,222,128,0.4)", color: "#4ade80" },
            },
            {
              icon: <Shield className="w-6 h-6" />, color: "#60a5fa", bg: "rgba(37,99,235,0.15)", border: "rgba(37,99,235,0.3)",
              title: "SOLANA", sub: "BUILT ON SOL", badge: null,
            },
          ].map((card, i) => (
            <div key={i}
              className="rounded-2xl p-7 text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(10,12,25,0.9)", border: `1px solid ${card.border}`, boxShadow: `0 0 20px ${card.bg}` }}>
              <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                <div style={{ color: card.color }}>{card.icon}</div>
              </div>
              <div className="font-orbitron font-black text-xl mb-1" style={{ color: card.color }}>{card.title}</div>
              {card.sub && <div className="text-gray-500 text-xs font-orbitron tracking-widest mt-1">{card.sub}</div>}
              {card.badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-orbitron font-black mt-2"
                  style={{ background: card.badge.bg, border: `1px solid ${card.badge.border}`, color: card.badge.color }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {card.badge.text}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section data-testid="cta-section" className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2), rgba(168,85,247,0.15))",
            border: "2px solid rgba(124,58,237,0.4)",
            boxShadow: "0 0 60px rgba(124,58,237,0.2), 0 0 120px rgba(37,99,235,0.1)",
          }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(37,99,235,0.12) 0%, transparent 70%)" }} />

          <div className="text-5xl md:text-6xl mb-4">🐺</div>
          <h2 className="font-orbitron font-black text-3xl md:text-5xl text-white mb-4 relative z-10 leading-tight">
            THE PRESALE IS{" "}
            <span style={{
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              LIVE
            </span>
          </h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto relative z-10 text-lg">
            🔥 Be one of the first 100 warriors. Join the presale now and claim your OG badge. <span className="text-yellow-400 font-bold">Only early holders get OG status.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button
              data-testid="btn-cta-launch"
              onClick={() => navigate("/presale")}
              className="btn-mega px-12 py-5 rounded-2xl text-lg font-orbitron font-black tracking-wider text-white"
              style={{
                background: "linear-gradient(135deg, #2563eb, #7c3aed, #a855f7)",
                border: "none",
                cursor: "pointer",
              }}
            >
              🔥 BUY $BATTLE NOW 🔥
            </button>
            <button
              onClick={() => navigate("/whitepaper")}
              className="px-10 py-5 rounded-2xl text-base font-orbitron font-black tracking-wider transition-all hover:scale-105"
              style={{ border: "2px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", background: "transparent", cursor: "pointer" }}
            >
              📄 READ WHITEPAPER
            </button>
          </div>

          {/* Mini presale info */}
          <div className="flex flex-wrap justify-center gap-8 mt-8 relative z-10">
            {[
              { label: "PRICE",     value: "1 SOL = 100K $BATTLE" },
              { label: "MIN",       value: "0.1 SOL" },
              { label: "MAX",       value: "10 SOL/wallet" },
              { label: "GOAL",      value: "500 SOL" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-orbitron font-black text-white text-sm">{s.value}</div>
                <div className="text-gray-500 text-xs font-orbitron tracking-widest mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer data-testid="footer" className="border-t px-6 py-10" style={{ borderColor: "rgba(124,58,237,0.15)" }}>
        <div className="max-w-5xl mx-auto">

          {/* Top row: logo | nav links | social icons */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">

            {/* Logo + tagline */}
            <div className="flex items-center gap-2">
              <img src="/favicon.jpg" alt="VeloxFi" className="w-7 h-7 rounded-md object-cover" />
              <span className="font-orbitron font-black text-sm tracking-wider"
                style={{ background: "linear-gradient(135deg,#60a5fa,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                VELOXFI
              </span>
              <span className="text-gray-700 font-orbitron text-xs tracking-widest hidden sm:block ml-1">🐺 BATTLE ARENA</span>
            </div>

            {/* Nav links */}
            <div className="flex items-center flex-wrap justify-center gap-5 text-xs text-gray-600 font-orbitron tracking-widest">
              {[
                { label: "Roadmap",    path: "/roadmap",    testId: "footer-link-roadmap" },
                { label: "FAQ",        path: "/faq",        testId: "footer-link-faq" },
                { label: "Terms",      path: "/terms",      testId: "footer-link-terms" },
                { label: "Privacy",    path: "/privacy",    testId: "footer-link-privacy" },
                { label: "Whitepaper", path: "/whitepaper", testId: "footer-link-whitepaper" },
              ].map(({ label, path, testId }) => (
                <button key={path} data-testid={testId} onClick={() => navigate(path)}
                  className="hover:text-gray-300 transition-colors cursor-pointer"
                  style={{ background: "none", border: "none", padding: 0 }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                {
                  href: "https://t.me/VeloxFiOfficial",
                  label: "Telegram",
                  hoverColor: "#34d399",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  ),
                },
                {
                  href: "https://discord.gg/u2UhxuTd",
                  label: "Discord",
                  hoverColor: "#a78bfa",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  ),
                },
              ].map(({ href, label, hoverColor, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    color: "#4b5563",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    textDecoration: "none",
                    transition: "color 0.2s, background 0.2s, box-shadow 0.2s, border-color 0.2s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = hoverColor;
                    el.style.background = `${hoverColor}14`;
                    el.style.borderColor = `${hoverColor}50`;
                    el.style.boxShadow = `0 0 16px ${hoverColor}55, 0 0 30px ${hoverColor}25`;
                    el.style.transform = "translateY(-2px) scale(1.08)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = "#4b5563";
                    el.style.background = "rgba(255,255,255,0.04)";
                    el.style.borderColor = "rgba(255,255,255,0.08)";
                    el.style.boxShadow = "none";
                    el.style.transform = "translateY(0) scale(1)";
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Bottom row: copyright */}
          <div className="border-t pt-5 text-center" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <p className="text-xs text-gray-700 font-orbitron tracking-widest">
              © 2026 VELOXFI 🐺 · BUILT ON SOLANA · NOT FINANCIAL ADVICE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
