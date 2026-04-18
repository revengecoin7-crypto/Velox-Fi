import { usePageMeta } from "@/hooks/usePageMeta";
import MemeShell from "@/components/MemeShell";

const PHASES = [
  {
    num: 1, label: "BUILD & LAUNCH", emoji: "🔥", status: "done" as const,
    color: "#6BCB77",
    items: ["Platform development complete","4 arcade games live (Snake, Tetris, Runner, Rocket)","$BATTLE token launched on pump.fun","Mining system live","Website live at veloxfi.io","Community started on Telegram & Discord"],
  },
  {
    num: 2, label: "GROW", emoji: "📈", status: "active" as const,
    color: "#4CC9F0",
    items: ["Leaderboard Season 1 — top WOLF earners","More games added to the arena","Mobile-friendly experience","Referral system: earn bonus WOLF","Influencer partnerships","Community milestones & giveaways"],
  },
  {
    num: 3, label: "COMPETE", emoji: "⚔️", status: "upcoming" as const,
    color: "#FFD93D",
    items: ["Tournament mode — weekly competitions","Live season rewards in $BATTLE","Prize pools for top players","Featured player spotlights","Community voting on new games"],
  },
  {
    num: 4, label: "SCALE", emoji: "🚀", status: "upcoming" as const,
    color: "#FF9F43",
    items: ["DexScreener & DEX aggregator listings","Native mobile app (iOS & Android)","CEX listing pursuit","Expanded marketing campaign","Ambassador program launch"],
  },
  {
    num: 5, label: "GLOBAL EXPANSION", emoji: "🌍", status: "upcoming" as const,
    color: "#A29BFE",
    items: ["DAO governance — community votes on features","VeloxFi grants for game developers","Multi-language platform support","Global community events","#1 crypto game arena on Solana"],
  },
];

export default function Roadmap() {
  usePageMeta({
    title: "Roadmap — VeloxFi Game Arena | From Launch to Global Crypto Gaming",
    description: "Follow the VeloxFi roadmap. From our live game arena launch, to tournaments, mobile app, CEX listings, DAO governance, and becoming the #1 crypto game arena on Solana.",
    canonical: "https://veloxfi.io/roadmap",
  });

  return (
    <MemeShell>
      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5 font-bungee text-xs text-[#1a1a1a]"
            style={{ background: "#A29BFE", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>
            🗺️ VELOXFI JOURNEY
          </div>
          <h1 className="font-bungee text-4xl md:text-5xl text-[#1a1a1a] mb-4">
            THE <span style={{ color: "#A29BFE" }}>ROADMAP</span>
          </h1>
          <p className="font-fredoka text-lg text-gray-600">Our journey to #1 crypto game arena on Solana 🐺</p>
        </div>

        <div className="relative">
          {/* Vertical spine */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 z-0"
            style={{ background: "linear-gradient(to bottom, #6BCB77, #4CC9F0, #FFD93D, #FF9F43, #A29BFE)" }} />

          <div className="flex flex-col gap-8 relative z-10">
            {PHASES.map((phase) => {
              const isDone    = phase.status === "done";
              const isActive  = phase.status === "active";
              const isUpcoming = phase.status === "upcoming";
              return (
                <div key={phase.num} className="flex gap-5 items-start">
                  {/* Node */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative"
                    style={{
                      background: isDone ? phase.color : isActive ? phase.color + "44" : "#f0f0f0",
                      border: `2.5px solid ${isDone || isActive ? phase.color : "#ddd"}`,
                      boxShadow: isDone ? `3px 3px 0 ${phase.color}99` : isActive ? `0 0 0 4px ${phase.color}33` : "2px 2px 0 #ddd",
                    }}>
                    {phase.emoji}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl animate-ping"
                        style={{ border: `2px solid ${phase.color}66`, animationDuration: "2s" }} />
                    )}
                  </div>

                  {/* Card */}
                  <div className="flex-1 rounded-2xl p-5 mb-2"
                    style={{
                      background: isDone ? phase.color + "18" : isActive ? phase.color + "10" : "#f9f9f9",
                      border: `2.5px solid ${isDone ? phase.color : isActive ? phase.color + "88" : "#ddd"}`,
                      boxShadow: isDone ? `4px 4px 0 ${phase.color}` : isActive ? `3px 3px 0 ${phase.color}66` : "2px 2px 0 #ddd",
                    }}>
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                      <h2 className="font-bungee text-lg text-[#1a1a1a]">
                        PHASE {phase.num} — {phase.label}
                      </h2>
                      <span className="font-bungee text-xs px-3 py-1 rounded-full"
                        style={{
                          background: isDone ? phase.color : isActive ? phase.color + "33" : "#f0f0f0",
                          color: isDone ? "#fff" : isActive ? phase.color : "#aaa",
                          border: `1.5px solid ${isDone ? phase.color : isActive ? phase.color : "#ddd"}`,
                        }}>
                        {isDone ? "✓ LIVE" : isActive ? "IN PROGRESS" : "UPCOMING"}
                      </span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {phase.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span style={{ color: isDone ? phase.color : isActive ? phase.color : "#ccc" }}>▸</span>
                          <span className="font-fredoka text-sm" style={{ color: isDone ? "#333" : isActive ? "#444" : "#999" }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cartoon-card-yellow p-10 text-center mt-10" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
          <div className="text-5xl mb-3">🚀</div>
          <h2 className="font-bungee text-2xl text-[#1a1a1a] mb-3">JOIN THE JOURNEY</h2>
          <p className="font-fredoka text-gray-600 text-base mb-6">
            We're in Phase 2 — play games, climb the leaderboard, and be part of the early community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/games" className="cartoon-btn cartoon-btn-dark px-10 py-4 text-sm" style={{ textDecoration: "none" }}>
              PLAY NOW 🎮
            </a>
            <a href="/mine" className="cartoon-btn cartoon-btn-white px-10 py-4 text-sm" style={{ textDecoration: "none" }}>
              START MINING ⛏️
            </a>
          </div>
        </div>

      </div>
    </MemeShell>
  );
}
