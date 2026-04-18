import { Download, Gamepad2, Zap, Shield, Users, ChevronRight } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import MemeShell from "@/components/MemeShell";

const DIST = [
  { label: "Public Market (pump.fun)", pct: 60, color: "#FF9F43" },
  { label: "Platform Reserves",        pct: 20, color: "#4CC9F0" },
  { label: "Community & Marketing",    pct: 10, color: "#6BCB77" },
  { label: "Developer (Locked 1yr)",   pct: 10, color: "#ccc"    },
];

const PHASES = [
  { num: "01", name: "BUILD & LAUNCH",   done: true,  color: "#6BCB77", items: ["Platform & 4 games built","$BATTLE live on pump.fun","Mining system live","Website live at veloxfi.io"] },
  { num: "02", name: "GROW",             done: false, color: "#4CC9F0", items: ["More games added","Mobile-optimised experience","Referral system","Leaderboard Season 1 prizes"] },
  { num: "03", name: "COMPETE",          done: false, color: "#FFD93D", items: ["Tournament mode","Weekly WOLF prize pools","Live season rewards","Community events"] },
  { num: "04", name: "SCALE",            done: false, color: "#FF9F43", items: ["DexScreener listing","Cross-platform app","CEX listing pursuit","Bigger community"] },
  { num: "05", name: "GLOBAL EXPANSION", done: false, color: "#A29BFE", items: ["DAO governance","VeloxFi grants program","Multi-language support","Global ambassador program"] },
];

export default function Whitepaper() {
  usePageMeta({
    title: "Whitepaper — VeloxFi Game Arena on Solana | $BATTLE Token",
    description: "Read the VeloxFi whitepaper. Learn about the game arena, WOLF token mining, $BATTLE tokenomics, how to earn crypto playing games on Solana, and the roadmap.",
    canonical: "https://veloxfi.io/whitepaper",
  });

  return (
    <MemeShell>
      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5 font-bungee text-xs text-[#1a1a1a]"
            style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>
            📄 WHITEPAPER · v2.0 · 2026
          </div>
          <h1 className="font-bungee text-4xl md:text-5xl text-[#1a1a1a] mb-4">
            VELOXFI <span style={{ color: "#FF9F43" }}>WHITEPAPER</span>
          </h1>
          <p className="font-fredoka text-lg text-gray-600 max-w-xl mx-auto mb-8">
            The complete guide to the VeloxFi game arena on Solana — earn WOLF tokens, convert to $BATTLE, and dominate the leaderboard.
          </p>
          <a href="/VeloxFi-Whitepaper.pdf" download
            className="inline-flex items-center gap-3 font-bungee text-sm px-8 py-4 rounded-2xl"
            style={{ background: "#1a1a1a", color: "white", border: "2.5px solid #1a1a1a", boxShadow: "4px 4px 0 #555", textDecoration: "none" }}>
            <Download className="w-5 h-5" /> DOWNLOAD PDF
          </a>
        </div>

        <div className="rounded-2xl p-5 mb-10 flex gap-3"
          style={{ background: "#FFF9E6", border: "2px solid #FFD93D" }}>
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#1a1a1a]" />
          <p className="font-fredoka text-sm text-gray-600 leading-relaxed">
            <strong className="text-[#1a1a1a]">DISCLAIMER:</strong> This whitepaper is for informational purposes only and does not constitute financial advice. WOLF tokens have no monetary value. $BATTLE is a freely tradeable Solana token — always do your own research.
          </p>
        </div>

        <div className="flex flex-col gap-8">

          {/* 01 — Abstract */}
          <div className="cartoon-card p-8" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>🐺</div>
              <div>
                <div className="font-bungee text-xs text-gray-400">01 — ABSTRACT</div>
                <h2 className="font-bungee text-xl text-[#1a1a1a]">What is VeloxFi?</h2>
              </div>
            </div>
            <p className="font-fredoka text-gray-600 leading-relaxed mb-4">
              VeloxFi is a <strong className="text-[#1a1a1a]">play-to-earn game arena on Solana</strong>. Players earn WOLF tokens by playing arcade games and running free mining sessions every 8 hours. WOLF tokens convert to <strong className="text-[#1a1a1a]">$BATTLE</strong> — a real Solana token live on pump.fun.
            </p>
            <p className="font-fredoka text-gray-600 leading-relaxed">
              Unlike passive crypto holding, VeloxFi rewards <strong className="text-[#1a1a1a]">active players</strong>. The more you play and mine, the more WOLF you earn — and the more $BATTLE you can claim.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {[
                { icon: <Zap className="w-5 h-5" />, label: "SPEED", value: "Solana — 65K TPS", color: "#4CC9F0" },
                { icon: <Users className="w-5 h-5" />, label: "ACCESS", value: "No wallet to play", color: "#6BCB77" },
                { icon: <Gamepad2 className="w-5 h-5" />, label: "GAMES", value: "4 arcade games", color: "#FF9F43" },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="rounded-2xl p-4 text-center"
                  style={{ background: color + "22", border: `2px solid ${color}`, boxShadow: "2px 2px 0 #1a1a1a" }}>
                  <div className="flex justify-center mb-2" style={{ color: "#1a1a1a" }}>{icon}</div>
                  <div className="font-bungee text-xs text-gray-500 mb-1">{label}</div>
                  <div className="font-fredoka text-sm font-semibold text-[#1a1a1a]">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 02 — Games */}
          <div className="cartoon-card-sky p-8" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "#4CC9F0", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>🎮</div>
              <div>
                <div className="font-bungee text-xs text-gray-400">02 — GAMES</div>
                <h2 className="font-bungee text-xl text-[#1a1a1a]">The Game Arena</h2>
              </div>
            </div>
            <p className="font-fredoka text-gray-600 leading-relaxed mb-5">
              Every game session lasts <strong className="text-[#1a1a1a]">120 seconds</strong>. You earn 1 WOLF per coin/point collected in-game. Players have 3 lives per session.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { emoji: "🐍", name: "Crypto Snake",  desc: "Classic snake — eat WOLF coins to grow. 1 WOLF per coin." },
                { emoji: "🟦", name: "Battle Tetris", desc: "Clear lines, earn WOLF. Harder clears = more points." },
                { emoji: "🐺", name: "Wolf Run",      desc: "Side-scroller runner — collect WOLF coins mid-air." },
                { emoji: "🚀", name: "Rocket Miner",  desc: "Shoot falling asteroids. 1 WOLF per hit." },
              ].map((g) => (
                <div key={g.name} className="rounded-xl p-4 flex gap-3 items-start"
                  style={{ background: "rgba(255,255,255,0.7)", border: "2px solid #1a1a1a" }}>
                  <span className="text-3xl">{g.emoji}</span>
                  <div>
                    <div className="font-bungee text-sm text-[#1a1a1a]">{g.name}</div>
                    <div className="font-fredoka text-sm text-gray-500 mt-0.5">{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 03 — Mining */}
          <div className="cartoon-card-lime p-8" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>⛏️</div>
              <div>
                <div className="font-bungee text-xs text-gray-400">03 — MINING</div>
                <h2 className="font-bungee text-xl text-[#1a1a1a]">WOLF Mining System</h2>
              </div>
            </div>
            <p className="font-fredoka text-gray-600 leading-relaxed mb-4">
              Every registered user can start a free WOLF mining session once every <strong className="text-[#1a1a1a]">8 hours</strong>. No hardware or wallet needed — just register, start, and claim.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "INTERVAL", value: "8 hours" },
                { label: "SESSION",  value: "Passive"  },
                { label: "REWARD",   value: "WOLF"     },
                { label: "COST",     value: "Free"     },
              ].map((r) => (
                <div key={r.label} className="rounded-xl p-4 text-center"
                  style={{ background: "rgba(255,255,255,0.7)", border: "2px solid #1a1a1a" }}>
                  <div className="font-bungee text-xs text-gray-400 mb-1">{r.label}</div>
                  <div className="font-bungee text-base text-[#1a1a1a]">{r.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 04 — Tokenomics */}
          <div className="cartoon-card-orange p-8" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "#FF9F43", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>💰</div>
              <div>
                <div className="font-bungee text-xs text-gray-400">04 — TOKENOMICS</div>
                <h2 className="font-bungee text-xl text-[#1a1a1a]">$BATTLE Token</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Token Name",   value: "$BATTLE" },
                { label: "Blockchain",   value: "Solana (SPL)" },
                { label: "Total Supply", value: "1,000,000,000" },
                { label: "Listed on",    value: "pump.fun" },
                { label: "WOLF Rate",    value: "5,000 WOLF = 1 $BATTLE" },
                { label: "Dev Lock",     value: "100M — 1 year" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl px-4 py-3 flex justify-between items-center"
                  style={{ background: "rgba(255,255,255,0.6)", border: "1.5px solid #1a1a1a" }}>
                  <span className="font-bungee text-xs text-gray-500">{label}</span>
                  <span className="font-fredoka font-semibold text-sm text-[#1a1a1a]">{value}</span>
                </div>
              ))}
            </div>
            <div className="font-bungee text-xs text-gray-500 mb-2">TOKEN DISTRIBUTION</div>
            <div className="flex h-5 rounded-full overflow-hidden mb-3" style={{ border: "2px solid #1a1a1a" }}>
              {DIST.map(({ pct, color, label }) => (
                <div key={label} title={`${label}: ${pct}%`} style={{ width: `${pct}%`, background: color }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
              {DIST.map(({ label, pct, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: color, border: "1.5px solid #1a1a1a" }} />
                  <span className="font-fredoka text-xs text-gray-600">{label} — <strong>{pct}%</strong></span>
                </div>
              ))}
            </div>
            <ul className="flex flex-col gap-2">
              {[
                "Earn $BATTLE by converting WOLF tokens (5000 WOLF = 1 $BATTLE)",
                "Trade freely on pump.fun (Solana)",
                "Leaderboard rewards for top WOLF earners",
                "Future: premium platform features paid in $BATTLE",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#FF9F43" }} />
                  <span className="font-fredoka text-sm text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 05 — Roadmap */}
          <div className="cartoon-card p-8" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "#A29BFE", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>🗺️</div>
              <div>
                <div className="font-bungee text-xs text-gray-400">05 — ROADMAP</div>
                <h2 className="font-bungee text-xl text-[#1a1a1a]">5-Phase Plan</h2>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {PHASES.map((phase) => (
                <div key={phase.num} className="rounded-2xl p-5"
                  style={{ background: phase.done ? phase.color + "22" : "#f9f9f9", border: `2.5px solid ${phase.done ? phase.color : "#ddd"}`, boxShadow: phase.done ? `3px 3px 0 ${phase.color}` : "2px 2px 0 #ddd" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bungee text-sm text-[#1a1a1a]">PHASE {phase.num} — {phase.name}</span>
                    {phase.done && (
                      <span className="font-bungee text-xs px-3 py-1 rounded-full text-white"
                        style={{ background: phase.color, border: "1.5px solid #1a1a1a" }}>✓ LIVE</span>
                    )}
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span style={{ color: phase.done ? phase.color : "#ccc" }}>▸</span>
                        <span className="font-fredoka text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="cartoon-card-yellow p-10 text-center" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
            <h3 className="font-bungee text-2xl text-[#1a1a1a] mb-3">START EARNING NOW</h3>
            <p className="font-fredoka text-gray-600 mb-6 max-w-md mx-auto">Register for free, play games, mine WOLF every 8 hours, and convert to $BATTLE.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/games" className="cartoon-btn cartoon-btn-dark px-8 py-3 text-sm" style={{ textDecoration: "none" }}>PLAY GAMES</a>
              <a href="/mine" className="cartoon-btn cartoon-btn-white px-8 py-3 text-sm" style={{ textDecoration: "none" }}>START MINING</a>
              <a href="/VeloxFi-Whitepaper.pdf" download
                className="cartoon-btn px-8 py-3 text-sm font-bungee inline-flex items-center gap-2"
                style={{ background: "#A29BFE", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a", textDecoration: "none", color: "#1a1a1a", borderRadius: "12px" }}>
                <Download className="w-4 h-4" />PDF
              </a>
            </div>
          </div>

        </div>
      </div>
    </MemeShell>
  );
}
