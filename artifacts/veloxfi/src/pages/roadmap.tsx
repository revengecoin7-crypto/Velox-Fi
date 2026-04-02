import { useLocation } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";

const PHASES = [
  {
    number: 1,
    label: "BUILD",
    emoji: "🔥",
    status: "active" as const,
    statusLabel: "IN PROGRESS",
    color: "#2563eb",
    glow: "rgba(37,99,235,0.35)",
    items: [
      "Platform development",
      "Demo mode launch",
      "Website live at veloxfi.io",
      "Community building (Twitter, Telegram, Discord)",
    ],
  },
  {
    number: 2,
    label: "PRESALE",
    emoji: "⏳",
    status: "soon" as const,
    statusLabel: "COMING SOON",
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.25)",
    items: [
      "$BATTLE presale opens",
      "Early supporter rewards",
      "OG badge distribution",
      "DexScreener listing",
    ],
  },
  {
    number: 3,
    label: "LAUNCH",
    emoji: "🚀",
    status: "upcoming" as const,
    statusLabel: "UPCOMING",
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.15)",
    items: [
      "$BATTLE token on pump.fun",
      "First real battles live",
      "Leaderboard Season 1 starts",
      "Battle rewards activated",
    ],
  },
  {
    number: 4,
    label: "SCALE",
    emoji: "⚔️",
    status: "upcoming" as const,
    statusLabel: "UPCOMING",
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.15)",
    items: [
      "Tournament mode",
      "Mobile PWA app",
      "Referral system",
      "Influencer partnerships",
    ],
  },
  {
    number: 5,
    label: "GLOBAL EXPANSION",
    emoji: "🌍",
    status: "upcoming" as const,
    statusLabel: "UPCOMING",
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.15)",
    items: [
      "#1 memecoin battle platform on Solana",
      "DAO governance",
      "VeloxFi grants program",
      "Global community events",
    ],
  },
];

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  active: {
    bg: "rgba(37,99,235,0.18)",
    border: "rgba(37,99,235,0.6)",
    text: "#60a5fa",
  },
  soon: {
    bg: "rgba(124,58,237,0.14)",
    border: "rgba(124,58,237,0.45)",
    text: "#a78bfa",
  },
  upcoming: {
    bg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.1)",
    text: "#6b7280",
  },
};

export default function Roadmap() {
  usePageMeta({
    title: "Roadmap — VeloxFi | Platform Development Phases",
    description: "Follow the VeloxFi roadmap from platform build to global expansion. Presale, $BATTLE launch on pump.fun, tournament mode, DAO governance, and more.",
    canonical: "https://veloxfi.io/#/roadmap",
  });
  const [, navigate] = useLocation();

  return (
    <div
      style={{ background: "#05080f", color: "white", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b"
        style={{
          background: "rgba(5,8,15,0.95)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs text-gray-400 font-orbitron tracking-widest hover:text-white transition-colors"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <span style={{ fontSize: 16 }}>←</span> BACK TO HOME
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}
          >
            <span style={{ fontSize: 14 }}>🐺</span>
          </div>
          <span className="font-orbitron font-black text-sm tracking-wider gradient-text">VELOXFI</span>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-orbitron tracking-widest mb-6"
          style={{
            background: "rgba(37,99,235,0.12)",
            border: "1px solid rgba(37,99,235,0.3)",
            color: "#60a5fa",
          }}
        >
          <span>◎</span> ROADMAP
        </div>

        <h1 className="font-orbitron font-black text-4xl md:text-5xl tracking-wider mb-4 leading-tight">
          VELOXFI{" "}
          <span
            style={{
              background: "linear-gradient(90deg,#2563eb,#7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ROADMAP
          </span>
        </h1>

        <p className="text-gray-400 text-base md:text-lg">
          Our journey to becoming the #1 memecoin battle platform on Solana
        </p>
      </div>

      {/* Timeline */}
      <div className="max-w-2xl mx-auto px-6 pb-24 relative">
        {/* Vertical spine */}
        <div
          className="absolute left-[2.35rem] md:left-1/2 top-0 bottom-0 w-px"
          style={{
            background: "linear-gradient(to bottom, rgba(37,99,235,0.6) 0%, rgba(124,58,237,0.4) 40%, rgba(255,255,255,0.07) 100%)",
            transform: "translateX(-50%)",
          }}
        />

        <div className="flex flex-col gap-10">
          {PHASES.map((phase, i) => {
            const s = STATUS_STYLES[phase.status];
            const isActive = phase.status === "active";

            return (
              <div key={i} className="relative flex items-start gap-6 md:gap-8">
                {/* Node */}
                <div className="relative flex-shrink-0 z-10" style={{ width: 48 }}>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-orbitron font-black text-base"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, #2563eb, #7c3aed)`
                        : phase.status === "soon"
                        ? "rgba(124,58,237,0.2)"
                        : "rgba(255,255,255,0.04)",
                      border: `2px solid ${isActive ? "#2563eb" : phase.status === "soon" ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.1)"}`,
                      color: isActive ? "white" : phase.status === "soon" ? "#a78bfa" : "#4b5563",
                      boxShadow: isActive ? `0 0 24px ${phase.glow}` : "none",
                    }}
                  >
                    {phase.number}
                  </div>
                  {/* Pulse ring for active */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        border: "2px solid rgba(37,99,235,0.4)",
                        animationDuration: "2.5s",
                      }}
                    />
                  )}
                </div>

                {/* Card */}
                <div
                  className="flex-1 rounded-xl p-5 transition-all duration-200"
                  style={{
                    background: isActive
                      ? "rgba(37,99,235,0.06)"
                      : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isActive ? "rgba(37,99,235,0.35)" : phase.status === "soon" ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.06)"}`,
                    boxShadow: isActive ? `0 0 40px rgba(37,99,235,0.1)` : "none",
                  }}
                >
                  {/* Phase header */}
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 20 }}>{phase.emoji}</span>
                      <h2 className="font-orbitron font-black text-lg tracking-wider" style={{ color: isActive ? "white" : phase.status === "soon" ? "#d1d5db" : "#6b7280" }}>
                        PHASE {phase.number} — {phase.label}
                      </h2>
                    </div>
                    <span
                      className="text-xs font-orbitron font-bold tracking-widest px-2.5 py-1 rounded-full"
                      style={{
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        color: s.text,
                      }}
                    >
                      {phase.statusLabel}
                    </span>
                  </div>

                  {/* Items */}
                  <ul className="flex flex-col gap-2">
                    {phase.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: isActive ? "#d1d5db" : phase.status === "soon" ? "#9ca3af" : "#4b5563" }}>
                        <span
                          className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{
                            background: isActive ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${isActive ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.08)"}`,
                          }}
                        >
                          {isActive ? (
                            <span style={{ color: "#60a5fa", fontSize: 8 }}>●</span>
                          ) : (
                            <span style={{ color: "#374151", fontSize: 8 }}>●</span>
                          )}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        className="border-t text-center py-6"
        style={{ borderColor: "rgba(255,255,255,0.04)" }}
      >
        <p className="text-xs text-gray-600 font-orbitron tracking-widest">
          © 2026 VELOXFI · ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
}
