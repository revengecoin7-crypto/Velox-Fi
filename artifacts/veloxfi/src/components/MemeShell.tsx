import { useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const TICKER_ITEMS = [
  "🎮 MINE FREE WOLF TOKENS",
  "⚔️ PLAY GAMES · EARN WOLF",
  "💰 5,000 WOLF = 1 $BATTLE",
  "🎯 CONTRACT: 3EtQ...pump",
  "🚀 BUILT ON SOLANA",
  "💎 FREE TO PLAY · NO WALLET NEEDED",
  "🏆 BATTLE PREDICTION ARENA",
  "🔥 PLAY · EARN · CONVERT",
];

const NAV_LINKS = [
  { label: "Games",       path: "/games",       color: "#FF9F43" },
  { label: "Mine",        path: "/mine",        color: "#6BCB77" },
  { label: "Convert",     path: "/convert",     color: "#4CC9F0" },
  { label: "Leaderboard", path: "/leaderboard", color: "#FFD93D" },
  { label: "Battles",     path: "/battles",     color: "#FF6B9D" },
  { label: "Buy $BATTLE", path: "/presale",     color: "#FF9F43" },
  { label: "Whitepaper",  path: "/whitepaper",  color: "#6BCB77" },
  { label: "Blog",        path: "/blog",        color: "#FF6B9D" },
  { label: "FAQ",         path: "/faq",         color: "#FF6B6B" },
  { label: "Roadmap",     path: "/roadmap",     color: "#A29BFE" },
];

const BG_SHAPES = [
  { x: "4%",  y: "18%", size: "36px", color: "#FFD93D", circle: true,  delay: "0s",   dur: "4s"   },
  { x: "91%", y: "22%", size: "28px", color: "#FF6B9D", circle: false, delay: "1s",   dur: "5s"   },
  { x: "2%",  y: "62%", size: "22px", color: "#4CC9F0", circle: true,  delay: "2s",   dur: "3.5s" },
  { x: "94%", y: "68%", size: "32px", color: "#6BCB77", circle: false, delay: "0.5s", dur: "4.5s" },
  { x: "47%", y: "6%",  size: "18px", color: "#A29BFE", circle: true,  delay: "1.5s", dur: "5.5s" },
  { x: "77%", y: "88%", size: "26px", color: "#FF9F43", circle: true,  delay: "3s",   dur: "4s"   },
  { x: "21%", y: "92%", size: "20px", color: "#FF6B6B", circle: false, delay: "0.8s", dur: "6s"   },
  { x: "62%", y: "9%",  size: "30px", color: "#FFD93D", circle: true,  delay: "2.2s", dur: "4.7s" },
];

export const MEME_STYLES = `
  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-14px); }
  }
`;

export default function MemeShell({ children, testId }: { children: ReactNode; testId?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  function go(path: string) {
    setMobileOpen(false);
    navigate(path);
  }

  return (
    <div style={{ backgroundColor: "#FFFBF0", minHeight: "100dvh", color: "#1a1a1a" }} data-testid={testId}>
      <style>{MEME_STYLES}</style>

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
        style={{
          backgroundColor: "#FFFBF0",
          borderBottom: "2.5px solid #1a1a1a",
          boxShadow: "0 4px 0 #1a1a1a",
        }}>
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
                <button key={path}
                  data-testid={`nav-link-${path.replace("/", "")}`}
                  onClick={() => go(path)}
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
                    transform: isActive ? "translate(-1px,-1px)" : "none",
                  }}>
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button onClick={() => go("/profile")} style={{ background: "#6BCB77", border: "2px solid #1a1a1a", borderRadius: 10, padding: "6px 14px", fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a", display: "flex", alignItems: "center", gap: 6 }}>
                  👤 {user.username}
                </button>
                <button onClick={() => logout()} style={{ background: "#FF6B6B", border: "2px solid #1a1a1a", borderRadius: 10, padding: "6px 12px", fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a" }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => go("/login")} style={{ background: "#FFD93D", border: "2px solid #1a1a1a", borderRadius: 10, padding: "6px 14px", fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a" }}>
                  ⚡ Login
                </button>
                <button onClick={() => go("/register")} className="hidden md:block" style={{ background: "#6BCB77", border: "2px solid #1a1a1a", borderRadius: 10, padding: "6px 14px", fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a" }}>
                  🚀 Register
                </button>
              </>
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
                  <button key={path} onClick={() => go(path)}
                    className="w-full text-left py-3 px-4 text-sm font-fredoka font-semibold rounded-xl transition-all"
                    style={{
                      background: isActive ? color : "transparent",
                      border: isActive ? "2px solid #1a1a1a" : "2px solid transparent",
                      cursor: "pointer",
                      color: "#1a1a1a",
                      fontWeight: isActive ? 700 : 500,
                    }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* ── FLOATING BACKGROUND SHAPES ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {BG_SHAPES.map((s, i) => (
          <div key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              background: s.color,
              borderRadius: s.circle ? "50%" : "6px",
              border: "2px solid rgba(26,26,26,0.3)",
              opacity: 0.22,
              animation: `float ${s.dur} ease-in-out infinite`,
              animationDelay: s.delay,
            }} />
        ))}
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="relative z-10">
        {children}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#1a1a1a", borderTop: "2.5px solid #1a1a1a" }}>
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
              {[["Games","/games"],["Mine","/mine"],["Convert","/convert"],["Roadmap","/roadmap"],["FAQ","/faq"],["Whitepaper","/whitepaper"]].map(([label, path]) => (
                <button key={path} onClick={() => go(path)}
                  className="transition-colors hover:text-white"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#666" }}>
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {[
                {
                  href: "https://t.me/VeloxFiOfficial",
                  label: "Telegram",
                  bg: "#6BCB77",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  ),
                },
                {
                  href: "https://discord.gg/u2UhxuTd",
                  label: "Discord",
                  bg: "#A29BFE",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  ),
                },
              ].map(({ href, label, bg, icon }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background: bg,
                    border: "2px solid #444",
                    boxShadow: "2px 2px 0 #444",
                    textDecoration: "none",
                    color: "#1a1a1a",
                    transition: "transform 0.08s ease, box-shadow 0.08s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.transform = "translate(-1px,-1px)";
                    el.style.boxShadow = "3px 3px 0 #444";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.transform = "translate(0,0)";
                    el.style.boxShadow = "2px 2px 0 #444";
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
