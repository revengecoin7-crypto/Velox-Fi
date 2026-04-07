import { useLocation } from "wouter";
import {
  Swords, Download, BookOpen, Shield, Trophy, Coins, Map,
  ChevronRight, Zap, Users, TrendingUp,
} from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import MemeShell from "@/components/MemeShell";

function Section({ icon, label, title, color, children }: { icon: React.ReactNode; label: string; title: string; color: string; children: React.ReactNode; }) {
  return (
    <div className="rounded-2xl p-7 flex flex-col gap-5"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}14`, border: `1px solid ${color}30` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <div>
          <div className="font-orbitron text-xs tracking-widest mb-0.5" style={{ color: `${color}99` }}>{label}</div>
          <h2 className="font-orbitron font-black text-lg text-white tracking-wide">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-4 rounded-xl"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center gap-2.5">
        {icon && <span style={{ color: "#4b5563" }}>{icon}</span>}
        <span className="font-orbitron text-xs tracking-wider" style={{ color: "#6b7280" }}>{label}</span>
      </div>
      <span className="font-black text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#d1d5db" }}>{value}</span>
    </div>
  );
}

function Bullet({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ background: color }} />
      <span className="text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6b7280" }}>{children}</span>
    </li>
  );
}

const PHASES = [
  { num: "01", name: "BUILD",            items: ["Core platform development", "Smart contract audit", "Demo mode launch", "$BATTLE token deployment on pump.fun"],           color: "#2563eb", done: true  },
  { num: "02", name: "PRESALE",          items: ["$BATTLE presale — June 1, 2026", "Early community building", "Whitelist & OG badge distribution", "DexScreener listing"], color: "#7c3aed", done: false },
  { num: "03", name: "LAUNCH",           items: ["VeloxFi mainnet goes live", "First official battles", "Leaderboard Season 1 opens", "DexScreener boosts"],                color: "#f59e0b", done: false },
  { num: "04", name: "SCALE",            items: ["Tournament mode", "Mobile-optimised interface", "Referral system launch", "Influencer campaign"],                         color: "#34d399", done: false },
  { num: "05", name: "GLOBAL EXPANSION", items: ["Multi-chain bridge exploration", "DAO governance", "VeloxFi grants program", "CEX listing pursuit"],                      color: "#f87171", done: false },
];

const DIST = [
  { label: "Public Market",         pct: 60, color: "#2563eb" },
  { label: "Platform Reserves",     pct: 20, color: "#7c3aed" },
  { label: "Community & Marketing", pct: 10, color: "#f59e0b" },
  { label: "Developer (Locked)",    pct: 10, color: "#374151" },
];

export default function Whitepaper() {
  usePageMeta({
    title: "Whitepaper — VeloxFi Platform Documentation",
    description: "Read the VeloxFi whitepaper. Learn about the memecoin battle mechanism, $BATTLE tokenomics, smart contract architecture, and roadmap.",
    canonical: "https://veloxfi.io/#/whitepaper",
  });
  const [, navigate] = useLocation();

  return (
    <MemeShell>
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-24">

        {/* ── HEADER ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-orbitron tracking-widest"
            style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.25)", color: "#60a5fa" }}>
            <BookOpen className="w-3 h-3" /> WHITEPAPER · v1.0 · 2026
          </div>
          <h1 className="font-orbitron font-black text-5xl md:text-6xl text-white leading-tight mb-3 meme-title">
            📜 VELOXFI{" "}
            <span style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              WHITEPAPER
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            The complete guide to the memecoin battle platform on Solana 🐺
          </p>
          <a href="/VeloxFi-Whitepaper.pdf" download
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl no-underline btn-meme transition-all duration-200"
            style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
            <Download className="w-5 h-5" />
            <span className="font-orbitron font-black tracking-wider">⬇️ DOWNLOAD WHITEPAPER PDF</span>
            <ChevronRight className="w-4 h-4" />
          </a>
          <div className="mt-3 text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#374151" }}>PDF · English · v1.0 — 2026</div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl p-4 mb-10 flex gap-3 items-start"
          style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.14)" }}>
          <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
          <p className="text-xs leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6b7280" }}>
            <strong style={{ color: "#f59e0b" }}>DISCLAIMER:</strong> This whitepaper is for informational purposes only and does not constitute financial advice.
            Cryptocurrency investments carry significant risk. Never invest more than you can afford to lose. $BATTLE token is a freely
            tradeable token — VeloxFi has no control over who purchases it. Not available to residents of the United States or other restricted jurisdictions.
          </p>
        </div>

        {/* ── SECTIONS ── */}
        <div className="flex flex-col gap-6">

          {/* 1. Abstract */}
          <Section icon={<BookOpen className="w-5 h-5" />} label="01 — ABSTRACT" title="What is VeloxFi?" color="#2563eb">
            <p className="text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6b7280" }}>
              VeloxFi is the <strong style={{ color: "#9ca3af" }}>first decentralised memecoin battle platform on Solana</strong>.
              Users create their own memecoins and pit them against each other in real-time price-surge competitions.
              The coin with the highest percentage price increase within a set time period wins the battle.
            </p>
            <p className="text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6b7280" }}>
              Unlike traditional memecoin platforms where users passively hold tokens hoping for price appreciation,
              VeloxFi transforms memecoin trading into an <strong style={{ color: "#9ca3af" }}>active, competitive experience</strong>.
              Users become creators, strategists, and competitors — not just holders.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
              {[
                { icon: <Zap className="w-4 h-4" />,   label: "SPEED",  value: "65,000 TPS on Solana"  },
                { icon: <Coins className="w-4 h-4" />, label: "FEE",    value: "$0.001 per transaction" },
                { icon: <Users className="w-4 h-4" />, label: "ACCESS", value: "Open to all — no KYC"   },
              ].map(({ icon, label, value }) => (
                <div key={label} className="rounded-xl p-3 flex flex-col gap-1 items-center text-center"
                  style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.12)" }}>
                  <span style={{ color: "#60a5fa" }}>{icon}</span>
                  <div className="font-orbitron text-xs tracking-widest" style={{ color: "#374151" }}>{label}</div>
                  <div className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9ca3af" }}>{value}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* 2. Battle Rules */}
          <Section icon={<Shield className="w-5 h-5" />} label="02 — PLATFORM" title="⚔️ Battle Rules" color="#7c3aed">
            <div className="flex flex-col gap-2">
              <InfoRow icon={<Swords className="w-3.5 h-3.5" />}    label="BATTLE DURATION"          value="1h / 3h / 12h / 24h / 7 days" />
              <InfoRow icon={<TrendingUp className="w-3.5 h-3.5" />} label="WINNER DETERMINATION"    value="Highest % price surge"         />
              <InfoRow icon={<Shield className="w-3.5 h-3.5" />}    label="MAX BUY PER TRANSACTION"  value="$5"                            />
              <InfoRow icon={<Zap className="w-3.5 h-3.5" />}       label="COOLDOWN BETWEEN BUYS"    value="1 minute"                      />
              <InfoRow icon={<Coins className="w-3.5 h-3.5" />}     label="MULTIPLE BUYS"            value="Yes — every 1 minute"          />
              <InfoRow icon={<Shield className="w-3.5 h-3.5" />}    label="FUND LOCKING"             value="Locked until battle ends"      />
              <InfoRow icon={<TrendingUp className="w-3.5 h-3.5" />} label="PRICE MECHANISM"         value="Internal bonding curve"        />
            </div>
          </Section>

          {/* 3. Battle Results */}
          <Section icon={<Trophy className="w-5 h-5" />} label="03 — OUTCOMES" title="🏆 Battle Results" color="#f59e0b">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { who: "WINNER", emoji: "🏆", color: "#34d399", bg: "rgba(52,211,153,0.06)",  border: "rgba(52,211,153,0.15)",  lines: ["Battle winner badge", "30% of loser's tokens"] },
                { who: "LOSER",  emoji: "💔", color: "#f87171", bg: "rgba(248,113,113,0.06)", border: "rgba(248,113,113,0.15)", lines: ["50% of tokens returned", "30% to winner", "20% permanently burned"] },
                { who: "BURNED", emoji: "🔥", color: "#f97316", bg: "rgba(249,115,22,0.06)",  border: "rgba(249,115,22,0.15)",  lines: ["20% of loser tokens", "Deflationary pressure", "More battles = less supply"] },
              ].map(({ who, emoji, color, bg, border, lines }) => (
                <div key={who} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: bg, border: `1px solid ${border}` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{emoji}</span>
                    <span className="font-orbitron font-black text-xs tracking-widest" style={{ color }}>{who}</span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {lines.map((l) => (
                      <li key={l} className="flex items-start gap-2 text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6b7280" }}>
                        <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color }} /> {l}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          {/* 4. $BATTLE Token */}
          <Section icon={<Coins className="w-5 h-5" />} label="04 — TOKENOMICS" title="💰 $BATTLE Token" color="#34d399">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
              <InfoRow label="TOKEN NAME"     value="$BATTLE"                       />
              <InfoRow label="BLOCKCHAIN"     value="Solana (SPL)"                  />
              <InfoRow label="TOTAL SUPPLY"   value="1,000,000,000"                 />
              <InfoRow label="LAUNCH"         value="pump.fun"                      />
              <InfoRow label="BURN MECHANIC"  value="20% of loser tokens / battle"  />
              <InfoRow label="DEV LOCK"       value="100M — 1 year via Streamflow"  />
            </div>
            <div className="mt-2">
              <div className="font-orbitron text-xs tracking-widest mb-3" style={{ color: "#374151" }}>TOKEN DISTRIBUTION</div>
              <div className="flex h-4 rounded-full overflow-hidden mb-4">
                {DIST.map(({ pct, color, label }) => (
                  <div key={label} title={`${label}: ${pct}%`} style={{ width: `${pct}%`, background: color }} />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-5">
                {DIST.map(({ label, pct, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6b7280" }}>
                      {label}<strong className="ml-1.5" style={{ color: "#9ca3af" }}>{pct}%</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-orbitron text-xs tracking-widest mb-3" style={{ color: "#374151" }}>TOKEN UTILITY</div>
              <ul className="flex flex-col gap-2">
                <Bullet color="#34d399">Coin creation fee — 1 $BATTLE per new coin</Bullet>
                <Bullet color="#34d399">Battle opening fee — 1 $BATTLE per battle</Bullet>
                <Bullet color="#34d399">Presale fee — 5% on every presale purchase</Bullet>
                <Bullet color="#34d399">Future premium features — paid in $BATTLE</Bullet>
              </ul>
            </div>
          </Section>

          {/* 5. Roadmap */}
          <Section icon={<Map className="w-5 h-5" />} label="05 — ROADMAP" title="🗺️ 5-Phase Expansion Plan" color="#60a5fa">
            <div className="flex flex-col gap-3">
              {PHASES.map((phase, i) => (
                <div key={phase.num} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-orbitron font-black text-xs flex-shrink-0"
                      style={{ background: phase.done ? `${phase.color}20` : "rgba(255,255,255,0.03)", border: `1px solid ${phase.done ? phase.color + "50" : "rgba(255,255,255,0.06)"}`, color: phase.done ? phase.color : "#374151" }}>
                      {phase.num}
                    </div>
                    {i < PHASES.length - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ background: phase.done ? `${phase.color}30` : "rgba(255,255,255,0.04)", minHeight: "24px" }} />
                    )}
                  </div>
                  <div className="flex-1 rounded-xl p-4 mb-3"
                    style={{ background: phase.done ? `${phase.color}08` : "rgba(255,255,255,0.02)", border: `1px solid ${phase.done ? phase.color + "20" : "rgba(255,255,255,0.05)"}` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-orbitron font-black text-sm tracking-wider" style={{ color: phase.done ? phase.color : "#4b5563" }}>
                        PHASE {phase.num} — {phase.name}
                      </span>
                      {phase.done && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-orbitron tracking-widest"
                          style={{ background: `${phase.color}15`, border: `1px solid ${phase.color}30`, color: phase.color }}>
                          IN PROGRESS
                        </span>
                      )}
                    </div>
                    <ul className="flex flex-col gap-1">
                      {phase.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#4b5563" }}>
                          <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: phase.done ? phase.color : "#374151" }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Bottom CTA */}
          <div className="rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6"
            style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.1),rgba(124,58,237,0.1))", border: "2px solid rgba(124,58,237,0.25)" }}>
            <div className="flex-1 text-center sm:text-left">
              <div className="font-orbitron font-black text-xl text-white mb-1">📄 READ THE FULL WHITEPAPER</div>
              <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#6b7280" }}>
                Download the complete PDF for token economics, revenue model, marketing strategy, legal section, and full technical specification.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 flex-wrap justify-center">
              <a href="/VeloxFi-Whitepaper.pdf" download
                className="btn-meme px-6 py-3 rounded-xl flex items-center gap-2 no-underline"
                style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
                <Download className="w-4 h-4" />
                <span className="font-orbitron tracking-wider text-sm">DOWNLOAD PDF</span>
              </a>
              <button onClick={() => navigate("/presale")} className="btn-meme px-6 py-3 rounded-xl"
                style={{ background: "linear-gradient(135deg,#4ade80,#16a34a)", boxShadow: "0 0 20px rgba(74,222,128,0.3)" }}>
                <span className="font-orbitron tracking-wider text-sm">🔥 JOIN PRESALE</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </MemeShell>
  );
}
