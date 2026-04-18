import { useState, useRef, useEffect } from "react";
import { Wallet, LogOut, ExternalLink, Loader2, Copy, Check } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

/* ───────────────────────────────────────────
   Props
─────────────────────────────────────────── */
interface Props {
  /** compact = single-line address only, no dropdown arrow */
  variant?: "default" | "compact";
  className?: string;
}

/* ───────────────────────────────────────────
   Component
─────────────────────────────────────────── */
export default function ConnectWalletButton({ variant = "default", className = "" }: Props) {
  const { status, address, shortAddress, connect, disconnect } = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNotInstalled, setShowNotInstalled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleClick() {
    if (status === "connected") {
      setDropdownOpen((o) => !o);
      return;
    }
    const provider = window.phantom?.solana ?? window.solana;
    if (!provider?.isPhantom) {
      setShowNotInstalled(true);
      return;
    }
    setShowNotInstalled(false);
    await connect();
  }

  async function handleDisconnect() {
    setDropdownOpen(false);
    await disconnect();
  }

  function handleCopy() {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  /* ── Not installed banner ── */
  if (showNotInstalled && status !== "connected") {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-fredoka"
          style={{ background: "#FFE5E5", border: "2px solid #FF6B6B", boxShadow: "2px 2px 0 #FF6B6B" }}>
          <span style={{ color: "#dc2626" }}>Phantom not installed.</span>
          <a href="https://phantom.app" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 underline font-semibold" style={{ color: "#1a1a1a" }}>
            Get it <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  /* ── Connecting spinner ── */
  if (status === "connecting") {
    return (
      <button disabled className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bungee text-xs text-[#1a1a1a] ${className}`}
        style={{ background: "#FFD93D", border: "2px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a", opacity: 0.7 }}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        CONNECTING…
      </button>
    );
  }

  /* ── Connected: address + dropdown ── */
  if (status === "connected" && shortAddress) {
    return (
      <div className={`relative ${className}`} ref={dropRef}>
        <button onClick={handleClick}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-100 font-fredoka font-semibold text-sm"
          style={{
            background: "#6BCB77", border: "2px solid #1a1a1a",
            boxShadow: "2px 2px 0 #1a1a1a", cursor: "pointer", color: "#1a1a1a",
          }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#1a1a1a" }} />
          {shortAddress}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
            style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <path d="M1 1L5 5L9 1" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden z-50 min-w-[210px]"
            style={{ background: "#fff", border: "2.5px solid #1a1a1a", boxShadow: "5px 5px 0 #1a1a1a" }}>
            <div className="px-4 py-3" style={{ borderBottom: "1.5px solid #eee" }}>
              <div className="font-bungee text-xs text-gray-400 mb-1">CONNECTED</div>
              <div className="font-mono-data text-xs text-gray-500 break-all" style={{ fontSize: "11px" }}>
                {address?.slice(0, 20)}…{address?.slice(-8)}
              </div>
            </div>

            <button onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-fredoka font-semibold text-left transition-colors hover:bg-gray-50"
              style={{ background: "none", border: "none", borderBottom: "1px solid #eee", cursor: "pointer", color: "#333" }}>
              {copied ? <Check className="w-4 h-4" style={{ color: "#6BCB77" }} /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy address"}
            </button>

            <button onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-fredoka font-semibold text-left transition-colors hover:bg-red-50"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#FF6B6B" }}>
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── Default: connect button ── */
  return (
    <button onClick={handleClick} data-testid="btn-connect-wallet"
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bungee text-xs text-[#1a1a1a] transition-all duration-100 ${className}`}
      style={{
        background: "#FFD93D", border: "2.5px solid #1a1a1a",
        boxShadow: "3px 3px 0 #1a1a1a", cursor: "pointer",
      }}
      onMouseEnter={(e) => { const el = e.currentTarget; el.style.transform = "translate(-1px,-1px)"; el.style.boxShadow = "4px 4px 0 #1a1a1a"; }}
      onMouseLeave={(e) => { const el = e.currentTarget; el.style.transform = "translate(0,0)"; el.style.boxShadow = "3px 3px 0 #1a1a1a"; }}>
      <Wallet className="w-3.5 h-3.5" />
      CONNECT WALLET
    </button>
  );
}
