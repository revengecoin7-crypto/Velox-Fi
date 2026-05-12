import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  {
    group: "EXPLORE",
    items: [{ href: "/", label: "Home", icon: HomeIcon }],
  },
  {
    group: "YOUR PACK",
    items: [
      { href: "/mine", label: "Mining Hub", icon: PickaxeIcon, badge: "LIVE" },
      { href: "/games", label: "Game Den", icon: GamepadIcon, badge: "6" },
      { href: "/leaderboard", label: "Leaderboard", icon: TrophyIcon },
      { href: "/profile", label: "Profile", icon: UserIcon },
      { href: "/convert", label: "Wallet", icon: WalletIcon },
    ],
  },
  {
    group: "ACCOUNT",
    items: [
      { href: "/login", label: "Sign in / Register", icon: UserIcon },
      { href: "/admin", label: "Admin", icon: ShieldIcon },
    ],
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sb-brand">
        <div className="sb-brand-mark">
          <img src="/mascot.jpg" alt="Velox" />
        </div>
        <div>
          <div className="sb-brand-name">VELOXFI</div>
          <div className="sb-brand-sub">Mine · Play · Howl</div>
        </div>
      </div>

      {/* Nav groups */}
      {NAV.map((group) => (
        <div key={group.group} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div className="sb-section">{group.group}</div>
          {group.items.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            if (item.href === "/login" && user) return null;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-item${isActive ? " active" : ""}`}
              >
                <span className="ico"><Icon size={16} /></span>
                {item.label}
                {item.badge && <span className="badge">{item.badge}</span>}
              </Link>
            );
          })}
        </div>
      ))}

      {/* $BATTLE price footer */}
      <div className="sb-foot">
        <div style={{ color: "var(--mute)", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>$BATTLE</div>
        <div className="price tabular">$0.00428</div>
        <div className="delta">+12.6% · 24h</div>
      </div>
    </aside>
  );
}

// ── Inline SVG Icons ──
function HomeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12 12 3l9 9" /><path d="M5 10v10h14V10" />
    </svg>
  );
}
function PickaxeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3l7 7-4 4" /><path d="M11 6l7 7" /><path d="M3 21l8-8" />
    </svg>
  );
}
function GamepadIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="12" rx="4" /><path d="M7 13h3M8.5 11.5v3" /><circle cx="15" cy="11.5" r="1" /><circle cx="17.5" cy="14" r="1" />
    </svg>
  );
}
function TrophyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" /><path d="M5 6H3v2a3 3 0 0 0 3 3M19 6h2v2a3 3 0 0 1-3 3" /><path d="M10 14h4l-1 4h-2l-1-4zM8 21h8" />
    </svg>
  );
}
function UserIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}
function ShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" />
    </svg>
  );
}
function WalletIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h15a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7z" /><path d="M3 7c0-1.7 1.3-3 3-3h11" /><circle cx="17" cy="14" r="1.5" />
    </svg>
  );
}
