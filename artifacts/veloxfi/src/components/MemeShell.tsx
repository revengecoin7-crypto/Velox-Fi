import { useState, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import ConnectWalletButton from "@/components/ConnectWalletButton";

const TICKER_ITEMS = [
  "🔥 $BATTLE PRESALE LIVE 🔥",
  "⚔️ JOIN THE BATTLEFIELD ⚔️",
  "🐺 1 SOL = 100,000 $BATTLE 🐺",
  "💰 PRESALE GOAL: 500 SOL 💰",
  "🚀 BUILT ON SOLANA 🚀",
  "🎯 MIN BUY: 0.1 SOL 🎯",
  "🏆 OG BADGE FOR EARLY WARRIORS 🏆",
  "💎 LIMITED SPOTS REMAINING 💎",
];

const NAV_LINKS = [
  { label: "⚔️ Battles",     path: "/battles",     color: "#34d399" },
  { label: "🏆 Leaderboard",  path: "/leaderboard", color: "#f59e0b" },
  { label: "🚀 Create Coin",  path: "/create",      color: "#a78bfa" },
  { label: "🎮 Demo",         path: "/demo",        color: "#a78bfa" },
  { label: "🔥 Presale",      path: "/presale",     color: "#4ade80" },
  { label: "Whitepaper",      path: "/whitepaper",  color: "#6b7280" },
  { label: "FAQ",             path: "/faq",         color: "#60a5fa" },
  { label: "Roadmap",         path: "/roadmap",     color: "#34d399" },
];

const BG_PARTICLES = [
  { emoji: "🪙", x: "6%",  y: "15%", delay: "0s",   dur: "4.5s", size: "1.8rem", opacity: 0.35 },
  { emoji: "💎", x: "92%", y: "20%", delay: "1.1s",  dur: "5s",   size: "1.6rem", opacity: 0.3  },
  { emoji: "🔥", x: "4%",  y: "60%", delay: "2s",    dur: "3.8s", size: "1.7rem", opacity: 0.35 },
  { emoji: "⚡", x: "94%", y: "65%", delay: "0.5s",  dur: "4.2s", size: "1.5rem", opacity: 0.3  },
  { emoji: "💰", x: "50%", y: "5%",  delay: "1.7s",  dur: "5.5s", size: "1.9rem", opacity: 0.25 },
  { emoji: "⚔️", x: "78%", y: "85%", delay: "3s",    dur: "4s",   size: "1.6rem", opacity: 0.3  },
  { emoji: "🚀", x: "20%", y: "90%", delay: "0.8s",  dur: "6s",   size: "1.4rem", opacity: 0.25 },
  { emoji: "💫", x: "65%", y: "12%", delay: "2.4s",  dur: "4.7s", size: "1.6rem", opacity: 0.3  },
];

export const MEME_STYLES = `
  @keyframes tickerScroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes floatUpDown {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-14px) rotate(6deg); }
  }
  @keyframes btnGlow {
    0%,100% { box-shadow: 0 0 20px rgba(59,130,246,0.7), 0 0 45px rgba(124,58,237,0.35); transform: scale(1); }
    50%      { box-shadow: 0 0 40px rgba(168,85,247,1),   0 0 80px rgba(59,130,246,0.5);  transform: scale(1.03); }
  }
  @keyframes orbDrift1 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(20px,-30px) scale(1.08); }
  }
  @keyframes orbDrift2 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(-18px,25px) scale(0.92); }
  }
  @keyframes glowTitle {
    0%,100% { text-shadow: 0 0 8px rgba(96,165,250,0.6),  0 0 20px rgba(96,165,250,0.3); }
    50%      { text-shadow: 0 0 16px rgba(168,85,247,0.9), 0 0 40px rgba(168,85,247,0.4); }
  }
  @keyframes phasePulse {
    0%,100% { box-shadow: 0 0 8px rgba(37,99,235,0.5); }
    50%      { box-shadow: 0 0 25px rgba(37,99,235,0.9), 0 0 50px rgba(37,99,235,0.4); }
  }
  .btn-meme {
    animation: btnGlow 2s ease-in-out infinite;
    transition: transform 0.15s ease;
    cursor: pointer;
    color: white;
    border: none;
    font-family: 'Orbitron', sans-serif;
    font-weight: 900;
    letter-spacing: 0.05em;
  }
  .btn-meme:hover { transform: scale(1.06) translateY(-2px); }
  .meme-title { animation: glowTitle 3s ease-in-out infinite; }
  .phase-active { animation: phasePulse 2s ease-in-out infinite; }
`;

export default function MemeShell({
  children,
  testId,
}: {
  children: ReactNode;
  testId?: string;
}) {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function go(path: string) {
    setMobileOpen(false);
    navigate(path);
  }

  return (
    <div style={{ backgroundColor: "#05080f", minHeight: "100vh", color: "white" }} data-testid={testId}>
      <style>{MEME_STYLES}</style>

      {/* ── TICKER ── */}
      <div className="w-full overflow-hidden py-2 relative z-50"
        style={{ background: "linear-gradient(90deg,#1d4ed8,#7c3aed,#1d4ed8)", borderBottom: "1px solid rgba(168,85,247,0.4)" }}>
        <div className="flex gap-12 whitespace-nowrap font-orbitron text-xs font-bold text-white tracking-widest"
          style={{ animation: "tickerScroll 20s linear infinite", width: "max-content" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex-shrink-0">{item}</span>
          ))}
        </div>
      </div>

      {/* ── NAV ── */}
      <nav data-testid="nav"
        className="sticky top-0 z-40 transition-all duration-300"
        style={{
          backgroundColor: navScrolled ? "rgba(5,8,15,0.95)" : "rgba(5,8,15,0.7)",
          borderBottom: navScrolled ? "1px solid rgba(124,58,237,0.2)" : "1px solid transparent",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" data-testid="nav-logo" className="flex items-center gap-2.5">
            <img src="/favicon.jpg" alt="VeloxFi" className="w-9 h-9 rounded-lg object-cover"
              style={{ border: "1px solid rgba(124,58,237,0.5)" }} />
            <span className="font-orbitron font-black text-lg tracking-wider"
              style={{ background: "linear-gradient(135deg,#60a5fa,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              VELOXFI
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ label, path, color }) => (
              <button key={path}
                data-testid={`nav-link-${path.replace("/","")}`}
                onClick={() => go(path)}
                className="text-sm font-medium tracking-wide transition-all hover:scale-105"
                style={{ color, background: "none", border: "none", cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ConnectWalletButton />
            <button data-testid="btn-mobile-menu"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: mobileOpen ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", color: "white" }}
              aria-label="Toggle menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t" style={{ borderColor: "rgba(124,58,237,0.15)", background: "rgba(5,8,15,0.98)" }}>
            <div className="flex flex-col py-2">
              {NAV_LINKS.map(({ label, path, color }) => (
                <button key={path} onClick={() => go(path)}
                  className="w-full text-left px-6 py-3.5 text-sm font-medium"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = color; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── BACKGROUND ORBS ── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
          style={{ background: "#2563eb", top: "10%", left: "-8%", animation: "orbDrift1 10s ease-in-out infinite" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-8"
          style={{ background: "#7c3aed", top: "50%", right: "-6%", animation: "orbDrift2 13s ease-in-out infinite" }} />
        <div className="absolute w-[300px] h-[300px] rounded-full blur-3xl opacity-6"
          style={{ background: "#a855f7", bottom: "5%", left: "35%", animation: "orbDrift1 16s ease-in-out infinite reverse" }} />
      </div>

      {/* ── FLOATING PARTICLES ── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        {BG_PARTICLES.map((p, i) => (
          <div key={i} className="absolute select-none"
            style={{ left: p.x, top: p.y, fontSize: p.size, opacity: p.opacity, animation: `floatUpDown ${p.dur} ease-in-out infinite`, animationDelay: p.delay }}>
            {p.emoji}
          </div>
        ))}
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="relative z-10">
        {children}
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t px-6 py-8 relative z-10" style={{ borderColor: "rgba(124,58,237,0.15)" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/favicon.jpg" alt="VeloxFi" className="w-7 h-7 rounded-md object-cover" />
            <span className="font-orbitron font-black text-sm tracking-wider"
              style={{ background: "linear-gradient(135deg,#60a5fa,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              VELOXFI
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-600 font-orbitron tracking-widest">
            {[["Roadmap","/roadmap"],["FAQ","/faq"],["Terms","/terms"],["Privacy","/privacy"],["Whitepaper","/whitepaper"]].map(([label,path]) => (
              <button key={path} onClick={() => go(path)}
                className="hover:text-gray-300 transition-colors"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-700 font-orbitron">© 2026 VELOXFI 🐺</div>
        </div>
      </footer>
    </div>
  );
}
