import { usePageMeta } from "@/hooks/usePageMeta";
import MemeShell from "@/components/MemeShell";
import { useLocation } from "wouter";

const PHASES = [
  { number: 1, label: "BUILD",            emoji: "🔥", status: "active"   as const, statusLabel: "IN PROGRESS",  color: "#2563eb", glow: "rgba(37,99,235,0.4)",  items: ["Platform development","Demo mode launch","Website live at veloxfi.io","Community building (Twitter, Telegram, Discord)"] },
  { number: 2, label: "PRESALE",          emoji: "💰", status: "soon"     as const, statusLabel: "LIVE NOW",     color: "#4ade80", glow: "rgba(74,222,128,0.35)", items: ["$BATTLE presale opens","Early supporter rewards","OG badge distribution"] },
  { number: 3, label: "LAUNCH",           emoji: "🚀", status: "upcoming" as const, statusLabel: "UPCOMING",     color: "#7c3aed", glow: "rgba(124,58,237,0.15)", items: ["$BATTLE token on pump.fun","First real battles live","Leaderboard Season 1 starts","Battle rewards activated","DexScreener listing"] },
  { number: 4, label: "SCALE",            emoji: "⚔️", status: "upcoming" as const, statusLabel: "UPCOMING",     color: "#7c3aed", glow: "rgba(124,58,237,0.15)", items: ["Tournament mode","Mobile PWA app","Referral system","Influencer partnerships"] },
  { number: 5, label: "GLOBAL EXPANSION", emoji: "🌍", status: "upcoming" as const, statusLabel: "UPCOMING",     color: "#7c3aed", glow: "rgba(124,58,237,0.15)", items: ["#1 memecoin battle platform on Solana","DAO governance","VeloxFi grants program","Global community events"] },
];

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  active:   { bg: "rgba(37,99,235,0.2)",   border: "rgba(37,99,235,0.7)",   text: "#60a5fa" },
  soon:     { bg: "rgba(74,222,128,0.15)",  border: "rgba(74,222,128,0.6)",  text: "#4ade80" },
  upcoming: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", text: "#6b7280" },
};

export default function Roadmap() {
  usePageMeta({
    title: "Roadmap — VeloxFi | Platform Development Phases",
    description: "Follow the VeloxFi roadmap from platform build to global expansion. Presale, $BATTLE launch on pump.fun, tournament mode, DAO governance, and more.",
    canonical: "https://veloxfi.io/#/roadmap",
  });
  const [, navigate] = useLocation();

  return (
    <MemeShell>
      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-orbitron tracking-widest mb-6"
          style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.4)", color: "#60a5fa" }}>
          🗺️ VELOXFI JOURNEY
        </div>
        <h1 className="font-orbitron font-black text-4xl md:text-6xl tracking-wider mb-4 leading-tight meme-title">
          🗺️ THE{" "}
          <span style={{ background: "linear-gradient(90deg,#60a5fa,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            ROADMAP
          </span>
        </h1>
        <p className="text-gray-400 text-lg">Our journey to #1 memecoin battle platform on Solana 🐺</p>
      </div>

      {/* Timeline */}
      <div className="max-w-2xl mx-auto px-6 pb-16 relative">
        {/* Spine */}
        <div className="absolute left-[2.75rem] top-0 bottom-0 w-0.5"
          style={{ background: "linear-gradient(to bottom,rgba(37,99,235,0.8) 0%,rgba(74,222,128,0.6) 20%,rgba(124,58,237,0.4) 50%,rgba(255,255,255,0.07) 100%)" }} />

        <div className="flex flex-col gap-10">
          {PHASES.map((phase, i) => {
            const s = STATUS_STYLES[phase.status];
            const isActive = phase.status === "active";
            const isSoon   = phase.status === "soon";

            return (
              <div key={i} className="relative flex items-start gap-6">
                {/* Node */}
                <div className="relative flex-shrink-0 z-10" style={{ width: 56 }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-orbitron font-black text-xl transition-all duration-300"
                    style={{
                      background: isActive ? "linear-gradient(135deg,#2563eb,#7c3aed)" : isSoon ? "linear-gradient(135deg,#4ade80,#22c55e)" : "rgba(255,255,255,0.04)",
                      border: `2px solid ${isActive ? "#2563eb" : isSoon ? "#4ade80" : "rgba(255,255,255,0.1)"}`,
                      color: isActive || isSoon ? "white" : "#4b5563",
                      boxShadow: isActive ? `0 0 30px rgba(37,99,235,0.6)` : isSoon ? `0 0 30px rgba(74,222,128,0.5)` : "none",
                    }}>
                    {phase.emoji}
                  </div>
                  {(isActive || isSoon) && (
                    <div className="absolute inset-0 rounded-2xl animate-ping"
                      style={{ border: `2px solid ${isActive ? "rgba(37,99,235,0.5)" : "rgba(74,222,128,0.4)"}`, animationDuration: "2.5s" }} />
                  )}
                </div>

                {/* Card */}
                <div className="flex-1 rounded-2xl p-5 transition-all duration-200"
                  style={{
                    background: isActive ? "rgba(37,99,235,0.07)" : isSoon ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isActive ? "rgba(37,99,235,0.4)" : isSoon ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.06)"}`,
                    boxShadow: isActive ? "0 0 40px rgba(37,99,235,0.12)" : isSoon ? "0 0 40px rgba(74,222,128,0.1)" : "none",
                  }}>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                    <h2 className="font-orbitron font-black text-lg tracking-wider"
                      style={{ color: isActive ? "white" : isSoon ? "#d1fae5" : "#6b7280" }}>
                      PHASE {phase.number} — {phase.label}
                    </h2>
                    <span className="text-xs font-orbitron font-black tracking-widest px-3 py-1 rounded-full"
                      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                      {phase.statusLabel}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {phase.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm"
                        style={{ color: isActive ? "#d1d5db" : isSoon ? "#a7f3d0" : "#4b5563" }}>
                        <span className="flex-shrink-0 mt-0.5 text-base">
                          {isActive ? "🔵" : isSoon ? "🟢" : "⚫"}
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

      {/* CTA */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <div className="rounded-3xl p-10 text-center"
          style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.12),rgba(124,58,237,0.12))", border: "2px solid rgba(124,58,237,0.3)" }}>
          <div className="text-5xl mb-3">🚀</div>
          <h2 className="font-orbitron font-black text-2xl text-white mb-3">JOIN THE JOURNEY NOW</h2>
          <p className="text-gray-400 text-sm mb-6">Presale is LIVE — get in at the lowest price before launch</p>
          <button onClick={() => navigate("/presale")} className="btn-meme px-10 py-4 rounded-2xl text-base"
            style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
            🔥 BUY $BATTLE NOW
          </button>
        </div>
      </div>
    </MemeShell>
  );
}
