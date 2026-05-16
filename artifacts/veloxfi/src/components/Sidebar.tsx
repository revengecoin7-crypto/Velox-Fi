import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useTokenStats, fmtPrice, fmtPctDelta } from "@/lib/tokenStats";

const NAV = [
  {
    group: "EXPLORE",
    items: [{ href: "/", label: "Home", icon: HomeIcon }],
  },
  {
    group: "YOUR PACK",
    items: [
      { href: "/mine",      label: "Mining Hub",  icon: PickaxeIcon, badge: "LIVE" },
      { href: "/daily",     label: "Daily Den",   icon: StarIcon,    badge: "NEW" },
      { href: "/pet",       label: "Pet Wolf",    icon: PawIcon },
      { href: "/factions",  label: "Pack Wars",   icon: ShieldIcon, badge: "SOON" },
      { href: "/leaderboard", label: "Leaderboard", icon: TrophyIcon },
      { href: "/profile",   label: "Profile",     icon: UserIcon },
      { href: "/convert",   label: "Wallet",      icon: WalletIcon },
    ],
  },
  {
    group: "ACCOUNT",
    items: [
      { href: "/login",  label: "Sign in / Register", icon: UserIcon },
      { href: "/admin",  label: "Admin",               icon: LockIcon },
    ],
  },
];

// Global mobile sidebar state (shared between Sidebar + MobileTopBar)
let _setOpen: ((v: boolean) => void) | null = null;
export function openSidebar() { _setOpen?.(true); }
export function closeSidebar() { _setOpen?.(false); }

export function MobileTopBar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    _setOpen = setOpen;
    return () => { _setOpen = null; };
  }, []);

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
        <div className="display" style={{ fontSize: 18 }}>VELOXFI</div>
        <div style={{ width: 40 }} /> {/* spacer */}
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay${open ? " overlay-open" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Inject open state into sidebar via CSS class */}
      <style>{`
        .sidebar { ${open ? "left: 0 !important; box-shadow: 6px 0 24px rgba(11,11,26,0.18) !important;" : ""} }
      `}</style>
    </>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const tokenStats = useTokenStats();

  useEffect(() => {
    _setOpen = setOpen;
    return () => { _setOpen = null; };
  }, []);

  // Close on navigation
  useEffect(() => { setOpen(false); }, [location]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
        <div className="display" style={{ fontSize: 18 }}>VELOXFI</div>
        <div style={{ width: 40 }} />
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="sidebar-overlay overlay-open"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${open ? " sidebar-open" : ""}`}>
        {/* Close button on mobile */}
        <button
          onClick={() => setOpen(false)}
          style={{ display: "none", position: "absolute", top: 14, right: 14, width: 32, height: 32, border: "2px solid var(--ink)", borderRadius: 8, background: "var(--cream)", cursor: "pointer", fontSize: 16, alignItems: "center", justifyContent: "center" }}
          className="mobile-close-btn"
          aria-label="Close menu"
        >✕</button>

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
          <div className="price tabular">{tokenStats ? fmtPrice(tokenStats.price) : "—"}</div>
          <div className="delta" style={{ color: tokenStats && tokenStats.priceChange24h < 0 ? "var(--tomato)" : undefined }}>
            {tokenStats ? `${fmtPctDelta(tokenStats.priceChange24h)} · 24h` : "live · 24h"}
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── Inject close button visibility on mobile ── */
const mobileCloseStyle = `
@media (max-width: 768px) {
  .mobile-close-btn { display: flex !important; }
}
`;
if (typeof document !== "undefined") {
  const s = document.createElement("style");
  s.textContent = mobileCloseStyle;
  document.head.appendChild(s);
}

// ── Icons ──
function HomeIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12 12 3l9 9" /><path d="M5 10v10h14V10" /></svg>;
}
function PickaxeIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 3l7 7-4 4" /><path d="M11 6l7 7" /><path d="M3 21l8-8" /></svg>;
}
function StarIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}
function PawIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="9" r="2" /><circle cx="12" cy="6" r="2" /><circle cx="17" cy="9" r="2" /><path d="M7 17c0-3 2-5 5-5s5 2 5 5a3 3 0 0 1-5 2 3 3 0 0 1-5-2z" /></svg>;
}
function ShieldIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" /></svg>;
}
function TrophyIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0V4z" /><path d="M5 6H3v2a3 3 0 0 0 3 3M19 6h2v2a3 3 0 0 1-3 3" /><path d="M10 14h4l-1 4h-2l-1-4zM8 21h8" /></svg>;
}
function UserIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>;
}
function WalletIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h15a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7z" /><path d="M3 7c0-1.7 1.3-3 3-3h11" /><circle cx="17" cy="14" r="1.5" /></svg>;
}
function LockIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
}
