import { Download, Pickaxe, Zap, Shield, Users, ChevronRight } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import MemeShell from "@/components/MemeShell";

const DIST = [
  { label: "Public Market (pump.fun)", pct: 70, color: "#FF9F43" },
  { label: "Buyback Distribution Pool", pct: 20, color: "#4CC9F0" },
  { label: "Community & Marketing",     pct: 10, color: "#6BCB77" },
];

const PHASES = [
  { num: "01", name: "BUILD & LAUNCH",   done: true,  color: "#6BCB77", items: ["$BATTLE live on pump.fun","Free 4-hour mining sessions","Wallet linking + Solana payouts","Website live at veloxfi.io"] },
  { num: "02", name: "GROW",             done: false, color: "#4CC9F0", items: ["Live leaderboard","Mobile-friendly experience","Daily streak rewards","Referral system"] },
  { num: "03", name: "DISTRIBUTE",       done: false, color: "#FFD93D", items: ["Capped buyback pool (95M $BATTLE)","Waitlist when pool depletes","Live emission tracker","Transparent buyback receipts"] },
  { num: "04", name: "SCALE",            done: false, color: "#FF9F43", items: ["Raydium liquidity migration","DexScreener listing","CEX listing pursuit","Ambassador program"] },
  { num: "05", name: "GLOBAL EXPANSION", done: false, color: "#A29BFE", items: ["Community treasury and DAO","Wolf NFT mint","Multi-language platform","Merch drop and IRL meetups"] },
];

export default function Whitepaper() {
  usePageMeta({
    title: "Whitepaper — VeloxFi | Mining-only meme coin on Solana | $BATTLE Token",
    description: "Read the VeloxFi whitepaper. Free WOLF mining, fixed 5,000:1 conversion to $BATTLE, capped buyback distribution pool, and a 5-phase roadmap on Solana.",
    canonical: "https://veloxfi.io/whitepaper",
  });

  return (
    <MemeShell>
      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5 font-bungee text-xs text-[#1a1a1a]"
            style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>
            📄 WHITEPAPER · v3.0 · 2026
          </div>
          <h1 className="font-bungee text-4xl md:text-5xl text-[#1a1a1a] mb-4">
            VELOXFI <span style={{ color: "#FF9F43" }}>WHITEPAPER</span>
          </h1>
          <p className="font-fredoka text-lg text-gray-600 max-w-xl mx-auto mb-8">
            The complete guide to VeloxFi — a mining-only meme coin on Solana with free WOLF mining and a capped $BATTLE buyback pool.
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
            <strong className="text-[#1a1a1a]">DISCLAIMER:</strong> This whitepaper is for informational purposes only and does not constitute financial advice. WOLF has no monetary value on its own. $BATTLE is a freely tradeable Solana token — always do your own research.
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
              VeloxFi is a <strong className="text-[#1a1a1a]">mining-only meme coin platform on Solana</strong>. Users mine free WOLF tokens in passive 4-hour sessions, then convert them to <strong className="text-[#1a1a1a]">$BATTLE</strong> — a real Solana token live on pump.fun — at a fixed 5,000:1 rate.
            </p>
            <p className="font-fredoka text-gray-600 leading-relaxed">
              Unlike most reward platforms that mint endless supply, VeloxFi caps distribution at the $BATTLE we've already bought back on the open market. No emission-driven dilution — when the pool depletes, conversions queue.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {[
                { icon: <Zap     className="w-5 h-5" />, label: "SPEED",  value: "Solana — 65K TPS",     color: "#4CC9F0" },
                { icon: <Users   className="w-5 h-5" />, label: "ACCESS", value: "No wallet to mine",    color: "#6BCB77" },
                { icon: <Pickaxe className="w-5 h-5" />, label: "MINING", value: "Free 4-hour sessions", color: "#FF9F43" },
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

          {/* 02 — Mining */}
          <div className="cartoon-card-lime p-8" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>⛏️</div>
              <div>
                <div className="font-bungee text-xs text-gray-400">02 — MINING</div>
                <h2 className="font-bungee text-xl text-[#1a1a1a]">WOLF Mining System</h2>
              </div>
            </div>
            <p className="font-fredoka text-gray-600 leading-relaxed mb-4">
              Every registered user can run a free WOLF mining session. The session lasts <strong className="text-[#1a1a1a]">4 hours</strong> and pays <strong className="text-[#1a1a1a]">1 WOLF per minute</strong>, capped at 240 WOLF per session. Sessions track server-side, so closing the tab doesn't stop progress. Claim when the timer hits zero and start the next session — up to six per day.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "SESSION",  value: "4 hours" },
                { label: "RATE",     value: "1 WOLF/min" },
                { label: "MAX/SESSION", value: "240 WOLF" },
                { label: "COST",     value: "Free" },
              ].map((r) => (
                <div key={r.label} className="rounded-xl p-4 text-center"
                  style={{ background: "rgba(255,255,255,0.7)", border: "2px solid #1a1a1a" }}>
                  <div className="font-bungee text-xs text-gray-400 mb-1">{r.label}</div>
                  <div className="font-bungee text-base text-[#1a1a1a]">{r.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 03 — Capped Buyback Distribution */}
          <div className="cartoon-card-sky p-8" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "#4CC9F0", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>🛡️</div>
              <div>
                <div className="font-bungee text-xs text-gray-400">03 — DISTRIBUTION</div>
                <h2 className="font-bungee text-xl text-[#1a1a1a]">Capped Buyback Pool</h2>
              </div>
            </div>
            <p className="font-fredoka text-gray-600 leading-relaxed mb-4">
              Every $BATTLE we distribute has already been bought back on pump.fun. The pool is currently capped at <strong className="text-[#1a1a1a]">95,000,000 $BATTLE</strong> (≈9.5% of total supply). When users convert WOLF, $BATTLE leaves the pool and lands in their Solana wallet. When the pool depletes, new conversions join a <strong className="text-[#1a1a1a]">waitlist</strong> — your WOLF stays untouched until we refill the pool.
            </p>
            <ul className="flex flex-col gap-2 mb-5">
              {[
                "No emission-driven dilution — we never mint reward tokens",
                "Live emission pool widget on the homepage shows remaining $BATTLE",
                "Buybacks create continuous open-market buy pressure on pump.fun",
                "Waitlist is FIFO — first-come, first-served when the pool refills",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#4CC9F0" }} />
                  <span className="font-fredoka text-sm text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
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
                { label: "Mint Auth",    value: "Revoked" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl px-4 py-3 flex justify-between items-center"
                  style={{ background: "rgba(255,255,255,0.6)", border: "1.5px solid #1a1a1a" }}>
                  <span className="font-bungee text-xs text-gray-500">{label}</span>
                  <span className="font-fredoka font-semibold text-sm text-[#1a1a1a]">{value}</span>
                </div>
              ))}
            </div>
            <div className="font-bungee text-xs text-gray-500 mb-2">SUPPLY HELD BY</div>
            <div className="flex h-5 rounded-full overflow-hidden mb-3" style={{ border: "2px solid #1a1a1a" }}>
              {DIST.map(({ pct, color, label }) => (
                <div key={label} title={`${label}: ${pct}%`} style={{ width: `${pct}%`, background: color }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
              {DIST.map(({ label, pct, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: color, border: "1.5px solid #1a1a1a" }} />
                  <span className="font-fredoka text-xs text-gray-600">{label} — <strong>~{pct}%</strong></span>
                </div>
              ))}
            </div>
            <p className="font-fredoka text-xs text-gray-500 leading-relaxed mb-4 italic">
              Percentages are approximations — the buyback pool grows as the team buys more $BATTLE on pump.fun. Track the live state on the homepage.
            </p>
            <ul className="flex flex-col gap-2">
              {[
                "Convert WOLF to $BATTLE at a fixed 5,000:1 rate — no minimum",
                "Trade freely on pump.fun (Solana mainnet)",
                "Leaderboard rewards for top $BATTLE holders",
                "Mint authority revoked, LP burned — no rug possible",
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
            <h3 className="font-bungee text-2xl text-[#1a1a1a] mb-3">START MINING NOW</h3>
            <p className="font-fredoka text-gray-600 mb-6 max-w-md mx-auto">Register for free, run 4-hour mining sessions, and convert WOLF to $BATTLE on Solana.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/mine" className="cartoon-btn cartoon-btn-dark px-8 py-3 text-sm" style={{ textDecoration: "none" }}>START MINING</a>
              <a href="/convert" className="cartoon-btn cartoon-btn-white px-8 py-3 text-sm" style={{ textDecoration: "none" }}>CONVERT WOLF</a>
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
