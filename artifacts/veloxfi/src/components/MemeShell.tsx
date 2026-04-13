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
  { label: "⚔️ Game",         path: "/game",        color: "#f97316" },
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
      <footer className="border-t px-6 py-10 relative z-10" style={{ borderColor: "rgba(124,58,237,0.15)" }}>
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
              {[["Roadmap","/roadmap"],["FAQ","/faq"],["Terms","/terms"],["Privacy","/privacy"],["Whitepaper","/whitepaper"]].map(([label, path]) => (
                <button key={path} onClick={() => go(path)}
                  className="transition-colors hover:text-gray-300"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
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
                  className="footer-social-icon"
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
                    ["--hover-color" as string]: hoverColor,
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
