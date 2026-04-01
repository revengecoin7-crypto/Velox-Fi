import { useState, useEffect, useRef } from "react";
import { Twitter, MessageCircle, Send, Zap, Shield, Trophy, Clock, TrendingUp, TrendingDown, Swords } from "lucide-react";

const BATTLES = [
  {
    id: 1,
    coinA: { name: "PEPE", ticker: "PEPE", change: +18.4, color: "#2563eb", icon: "🐸" },
    coinB: { name: "DOGE", ticker: "DOGE", change: -6.2, color: "#7c3aed", icon: "🐕" },
    volume: "$1.24M",
    endsIn: 3 * 60 + 42,
  },
  {
    id: 2,
    coinA: { name: "BONK", ticker: "BONK", change: +31.7, color: "#2563eb", icon: "🔨" },
    coinB: { name: "WIF", ticker: "WIF", change: -14.5, color: "#7c3aed", icon: "🎩" },
    volume: "$876K",
    endsIn: 8 * 60 + 15,
  },
  {
    id: 3,
    coinA: { name: "BOME", ticker: "BOME", change: -3.1, color: "#2563eb", icon: "💣" },
    coinB: { name: "POPCAT", ticker: "POPCAT", change: +22.9, color: "#7c3aed", icon: "😺" },
    volume: "$2.1M",
    endsIn: 14 * 60 + 58,
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: <Zap className="w-6 h-6" />,
    title: "CREATE OR PICK YOUR COIN",
    desc: "Launch a fresh memecoin on Solana or select an existing one from our battle registry.",
  },
  {
    step: "02",
    icon: <Swords className="w-6 h-6" />,
    title: "CHALLENGE AN OPPONENT",
    desc: "Issue a battle challenge. Set the duration, stake SOL as the wager, and wait for acceptance.",
  },
  {
    step: "03",
    icon: <TrendingUp className="w-6 h-6" />,
    title: "MARKET DECIDES THE WINNER",
    desc: "Over the battle window, price performance on-chain determines which coin reigns supreme.",
  },
  {
    step: "04",
    icon: <Trophy className="w-6 h-6" />,
    title: "CLAIM YOUR SPOILS",
    desc: "Winners auto-receive the staked SOL plus a share of trading fees generated during the battle.",
  },
];

function CountdownTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const m = Math.floor(remaining / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 font-orbitron text-sm">
      <Clock className="w-3.5 h-3.5 text-gray-400" />
      <span className="text-gray-300">{m}:{s}</span>
    </div>
  );
}

function BattleCard({ battle }: { battle: typeof BATTLES[0] }) {
  const [pctA, setPctA] = useState(55);

  useEffect(() => {
    const changeA = battle.coinA.change;
    const changeB = battle.coinB.change;
    const spread = changeA - changeB;
    const base = 50 + Math.min(Math.max(spread * 1.2, -40), 40);
    setPctA(base);
  }, [battle]);

  const pctB = 100 - pctA;
  const aWinning = battle.coinA.change > battle.coinB.change;

  return (
    <div
      data-testid={`battle-card-${battle.id}`}
      className="card-dark rounded-xl p-5 relative overflow-hidden hover:border-blue-800/40 transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* volume badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-orbitron text-gray-500 tracking-widest">LIVE BATTLE</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">VOL {battle.volume}</span>
          <CountdownTimer seconds={battle.endsIn} />
        </div>
      </div>

      {/* VS row */}
      <div className="flex items-center gap-3 mb-5">
        {/* Coin A */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{battle.coinA.icon}</span>
            <div>
              <div className="font-orbitron font-bold text-white text-sm">{battle.coinA.ticker}</div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${battle.coinA.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {battle.coinA.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {battle.coinA.change >= 0 ? "+" : ""}{battle.coinA.change}%
              </div>
            </div>
          </div>
        </div>

        {/* VS badge */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 shadow-lg">
          <span className="font-orbitron text-white text-xs font-black">VS</span>
        </div>

        {/* Coin B */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 justify-end">
            <div className="text-right">
              <div className="font-orbitron font-bold text-white text-sm">{battle.coinB.ticker}</div>
              <div className={`flex items-center gap-1 text-xs font-semibold justify-end ${battle.coinB.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {battle.coinB.change >= 0 ? "+" : ""}{battle.coinB.change}%
                {battle.coinB.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              </div>
            </div>
            <span className="text-2xl">{battle.coinB.icon}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden bg-gray-800 mb-3">
        <div className="h-full flex">
          <div
            className="transition-all duration-1000 rounded-l-full"
            style={{ width: `${pctA}%`, background: "linear-gradient(90deg, #2563eb, #3b82f6)" }}
          />
          <div
            className="transition-all duration-1000 rounded-r-full"
            style={{ width: `${pctB}%`, background: "linear-gradient(90deg, #6d28d9, #7c3aed)" }}
          />
        </div>
      </div>

      {/* pct labels */}
      <div className="flex justify-between text-xs text-gray-500 font-orbitron mb-4">
        <span style={{ color: "#60a5fa" }}>{pctA.toFixed(0)}%</span>
        <span style={{ color: "#a78bfa" }}>{pctB.toFixed(0)}%</span>
      </div>

      {/* action */}
      <button
        data-testid={`btn-battle-vote-${battle.id}`}
        className="w-full btn-primary py-2.5 rounded-lg text-xs"
      >
        <span className="font-orbitron tracking-widest">PLACE BET</span>
      </button>
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div data-testid={`stat-card-${label.replace(/\s+/g, "-").toLowerCase()}`} className="card-dark rounded-xl p-6 text-center flex flex-col items-center gap-3 gradient-border">
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))", border: "1px solid rgba(37,99,235,0.3)" }}>
        <div className="text-blue-400">{icon}</div>
      </div>
      <div>
        <div className="font-orbitron text-3xl font-bold gradient-text">{value}</div>
        <div className="text-gray-500 text-xs font-orbitron tracking-widest mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ backgroundColor: "#05080f", minHeight: "100vh", color: "white" }}>

      {/* Scanline overlay */}
      <div className="fixed inset-0 scanline pointer-events-none z-0" />

      {/* ── NAV ── */}
      <nav
        data-testid="nav"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navScrolled ? "backdrop-blur-lg border-b border-white/5" : ""}`}
        style={{ backgroundColor: navScrolled ? "rgba(5,8,15,0.9)" : "transparent" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="/" data-testid="nav-logo" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
              <Swords className="w-5 h-5 text-white" />
            </div>
            <span className="font-orbitron font-black text-lg tracking-wider gradient-text">VELOXFI</span>
          </a>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {["Battles", "Leaderboard", "Create Coin", "Docs"].map((item) => (
              <a
                key={item}
                href="#"
                data-testid={`nav-link-${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-gray-400 hover:text-white transition-colors font-medium tracking-wide"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Connect Wallet */}
          <button
            data-testid="btn-connect-wallet"
            className="btn-primary px-5 py-2.5 rounded-lg text-sm"
          >
            <span className="font-orbitron tracking-wider text-xs">CONNECT WALLET</span>
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        data-testid="hero-section"
        className="relative flex flex-col items-center justify-center text-center pt-40 pb-28 px-6 overflow-hidden"
      >
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: "#2563eb" }} />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: "#7c3aed" }} />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-orbitron tracking-widest"
          style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.3)", color: "#60a5fa" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE ON SOLANA
        </div>

        {/* Headline */}
        <h1 className="font-orbitron font-black text-5xl md:text-7xl leading-tight mb-6 max-w-4xl" data-testid="hero-title">
          LET YOUR{" "}
          <span className="gradient-text">MEMECOIN</span>
          <br />
          GO TO WAR
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          The first on-chain memecoin battle arena on Solana. Pit your coin against rivals, back the winner, and claim the spoils.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button data-testid="btn-hero-start-battle" className="btn-primary px-8 py-4 rounded-xl text-base">
            <span className="font-orbitron tracking-wider">START A BATTLE</span>
          </button>
          <button data-testid="btn-hero-view-battles" className="btn-outline px-8 py-4 rounded-xl text-base text-sm">
            VIEW LIVE BATTLES
          </button>
        </div>

        {/* Trust line */}
        <p className="text-xs text-gray-600 font-orbitron tracking-widest">
          POWERED BY SOLANA &middot; NON-CUSTODIAL &middot; PERMISSIONLESS
        </p>
      </section>

      {/* ── STATS ── */}
      <section data-testid="stats-section" className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard value="14,209" label="BATTLES FOUGHT" icon={<Swords className="w-6 h-6" />} />
          <StatCard value="$48.3M" label="TOTAL VOLUME" icon={<TrendingUp className="w-6 h-6" />} />
          <StatCard value="3,847" label="COINS CREATED" icon={<Zap className="w-6 h-6" />} />
        </div>
      </section>

      {/* ── LIVE BATTLES ── */}
      <section data-testid="live-battles-section" className="max-w-5xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-orbitron font-bold text-2xl md:text-3xl text-white">
              LIVE <span className="gradient-text">BATTLES</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Real-time memecoin combat</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-orbitron text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            3 LIVE
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {BATTLES.map((battle) => (
            <BattleCard key={battle.id} battle={battle} />
          ))}
        </div>

        <div className="text-center mt-8">
          <button data-testid="btn-view-all-battles" className="btn-outline px-8 py-3 rounded-xl text-sm">
            VIEW ALL BATTLES
          </button>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section data-testid="how-it-works-section" className="max-w-5xl mx-auto px-6 pb-24">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-orbitron font-bold text-2xl md:text-3xl text-white mb-3">
            HOW IT <span className="gradient-text">WORKS</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">Four steps from zero to glory</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.step}
              data-testid={`step-card-${step.step}`}
              className="card-dark rounded-xl p-6 relative group hover:border-blue-800/30 transition-all duration-300"
            >
              {/* Step connector line (not on last) */}
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-5 h-px z-10" style={{ background: "linear-gradient(90deg, rgba(37,99,235,0.4), transparent)" }} />
              )}

              <div className="font-orbitron text-xs font-black mb-4" style={{ color: i % 2 === 0 ? "#2563eb" : "#7c3aed" }}>
                {step.step}
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: i % 2 === 0 ? "rgba(37,99,235,0.15)" : "rgba(124,58,237,0.15)", border: `1px solid ${i % 2 === 0 ? "rgba(37,99,235,0.3)" : "rgba(124,58,237,0.3)"}` }}>
                <div style={{ color: i % 2 === 0 ? "#60a5fa" : "#a78bfa" }}>{step.icon}</div>
              </div>
              <h3 className="font-orbitron font-bold text-xs text-white mb-2 leading-snug">{step.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section data-testid="cta-section" className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-2xl p-10 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))", border: "1px solid rgba(124,58,237,0.2)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(37,99,235,0.08) 0%, transparent 70%)" }} />
          <h2 className="font-orbitron font-black text-3xl md:text-4xl text-white mb-4 relative z-10">
            YOUR COIN <span className="gradient-text">DESERVES</span> TO WIN
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto relative z-10">
            Don't let your bags sit idle. Send them into battle and let the market crown the victor.
          </p>
          <button data-testid="btn-cta-launch" className="btn-primary px-10 py-4 rounded-xl text-base relative z-10">
            <span className="font-orbitron tracking-wider">LAUNCH YOUR COIN</span>
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer data-testid="footer" className="border-t px-6 py-10" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
              <Swords className="w-4 h-4 text-white" />
            </div>
            <span className="font-orbitron font-black text-sm tracking-wider gradient-text">VELOXFI</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-gray-500 font-orbitron tracking-widest">
            {["Terms", "Privacy", "Docs", "Audit"].map((link) => (
              <a key={link} href="#" data-testid={`footer-link-${link.toLowerCase()}`} className="hover:text-gray-300 transition-colors">
                {link}
              </a>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="social-twitter"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4 text-blue-400" />
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="social-discord"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
              aria-label="Discord"
            >
              <MessageCircle className="w-4 h-4 text-purple-400" />
            </a>
            <a
              href="https://telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="social-telegram"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}
              aria-label="Telegram"
            >
              <Send className="w-4 h-4 text-blue-400" />
            </a>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-8 pt-6 text-center text-xs text-gray-700 font-orbitron tracking-widest"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          © 2025 VELOXFI. ALL RIGHTS RESERVED. NOT FINANCIAL ADVICE.
        </div>
      </footer>
    </div>
  );
}
