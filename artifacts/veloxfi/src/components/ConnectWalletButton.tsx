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
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <span style={{ color: "#f87171", fontFamily: "Inter, sans-serif" }}>
            Phantom not installed.
          </span>
          <a
            href="https://phantom.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 underline"
            style={{ color: "#60a5fa" }}
          >
            Get Phantom
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  /* ── Connecting spinner ── */
  if (status === "connecting") {
    return (
      <button
        disabled
        className={`btn-primary px-4 py-2.5 rounded-lg flex items-center gap-2 ${className}`}
        style={{ opacity: 0.7 }}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="font-orbitron tracking-wider text-xs">CONNECTING…</span>
      </button>
    );
  }

  /* ── Connected: address + dropdown ── */
  if (status === "connected" && shortAddress) {
    return (
      <div className={`relative ${className}`} ref={dropRef}>
        <button
          onClick={handleClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
          style={{
            background: "rgba(37,99,235,0.1)",
            border: "1px solid rgba(37,99,235,0.25)",
            cursor: "pointer",
          }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#34d399" }}
          />
          <span
            className="font-orbitron text-xs tracking-wider"
            style={{ color: "#60a5fa" }}
          >
            {shortAddress}
          </span>
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            style={{
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              color: "#4b5563",
            }}
          >
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-50 min-w-[200px]"
            style={{
              background: "rgba(5,8,15,0.98)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            }}
          >
            {/* Full address */}
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="font-orbitron text-xs tracking-widest mb-1"
                style={{ color: "#374151" }}
              >
                CONNECTED
              </div>
              <div
                className="text-xs font-mono break-all"
                style={{ fontFamily: "monospace", color: "#6b7280", fontSize: "11px" }}
              >
                {address?.slice(0, 20)}…{address?.slice(-8)}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors text-left"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
            >
              {copied
                ? <Check className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
                : <Copy className="w-3.5 h-3.5" />}
              <span style={{ fontFamily: "Inter, sans-serif" }}>
                {copied ? "Copied!" : "Copy address"}
              </span>
            </button>

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors text-left"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#f87171",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.06)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span style={{ fontFamily: "Inter, sans-serif" }}>Disconnect</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── Default: connect button ── */
  return (
    <button
      onClick={handleClick}
      data-testid="btn-connect-wallet"
      className={`btn-primary px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 ${className}`}
    >
      <Wallet className="w-3.5 h-3.5 text-white" />
      <span className="font-orbitron tracking-wider text-xs">CONNECT WALLET</span>
    </button>
  );
}
