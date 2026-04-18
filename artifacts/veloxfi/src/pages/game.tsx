import MemeShell from "@/components/MemeShell";
import { useLocation } from "wouter";

const FEATURES = [
  { emoji: "🏰", label: "Build Your Kingdom", color: "#FFD93D" },
  { emoji: "⚔️", label: "Battle Rivals",       color: "#FF6B9D" },
  { emoji: "🐺", label: "Train Warriors",       color: "#6BCB77" },
  { emoji: "💰", label: "Earn $BATTLE",         color: "#4CC9F0" },
  { emoji: "🏆", label: "Climb the Leaderboard", color: "#FF9F43" },
  { emoji: "🚀", label: "Solana-Powered",       color: "#A29BFE" },
];

export default function Game() {
  const [, navigate] = useLocation();

  return (
    <MemeShell testId="game-page">
      {/* Hero */}
      <section className="pt-14 pb-10 px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bungee text-xs text-[#1a1a1a] mb-6"
          style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>
          <span className="w-2 h-2 rounded-full bg-[#1a1a1a] animate-pulse" />
          FREE TO PLAY
        </div>

        <h1 className="font-bungee text-[#1a1a1a] mb-4"
          style={{ fontSize: "clamp(2rem, 6vw, 4rem)", lineHeight: 1.1 }}>
          VELOXFI{" "}
          <span style={{ color: "#FF6B9D" }}>BATTLE</span>{" "}
          KINGDOM
        </h1>
        <p className="font-fredoka text-gray-500 text-xl max-w-2xl mx-auto mb-10">
          Build your empire. Train your army. Dominate the battlefield and earn $BATTLE tokens!
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {FEATURES.map(({ emoji, label, color }) => (
            <div key={label}
              className="flex items-center gap-2 px-4 py-2.5 font-fredoka font-semibold text-sm text-[#1a1a1a]"
              style={{
                background: color,
                border: "2px solid #1a1a1a",
                boxShadow: "3px 3px 0 #1a1a1a",
                borderRadius: "12px",
              }}>
              <span>{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Play button */}
        <button
          onClick={() => document.getElementById("game-iframe")?.scrollIntoView({ behavior: "smooth" })}
          className="cartoon-btn cartoon-btn-dark px-12 py-5 text-lg mb-4"
          style={{ borderRadius: "16px" }}>
          PLAY NOW — ENTER THE KINGDOM
        </button>

        <p className="font-fredoka text-gray-400 text-base">
          Free to play · Powered by Solana · $BATTLE rewards coming soon
        </p>
      </section>

      {/* iframe */}
      <section className="px-4 pb-4 relative z-10" id="game-iframe">
        <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden"
          style={{ border: "2.5px solid #1a1a1a", boxShadow: "8px 8px 0 #1a1a1a" }}>
          {/* Browser bar */}
          <div className="flex items-center gap-2 px-5 py-3"
            style={{ background: "#FFD93D", borderBottom: "2px solid #1a1a1a" }}>
            <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#FF6B6B", border: "1.5px solid #1a1a1a" }} />
            <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#FF9F43", border: "1.5px solid #1a1a1a" }} />
            <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#6BCB77", border: "1.5px solid #1a1a1a" }} />
            <span className="ml-3 font-fredoka text-sm font-semibold text-[#1a1a1a]">
              veloxfi-battl.replit.app
            </span>
          </div>

          <iframe
            src="https://veloxfi-battl.replit.app"
            title="VeloxFi Battle Kingdom"
            width="100%"
            height="800"
            style={{ display: "block", border: "none", background: "#FFFBF0" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            loading="lazy"
          />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 px-6 text-center relative z-10">
        <div className="max-w-3xl mx-auto cartoon-card-yellow p-10"
          style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
          <h2 className="font-bungee text-2xl md:text-3xl text-[#1a1a1a] mb-3">
            LOVE THE GAME? JOIN THE BATTLE!
          </h2>
          <p className="font-fredoka text-[#333] text-lg mb-6">
            Buy $BATTLE tokens and get early access to exclusive features & rewards.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate("/presale")}
              className="cartoon-btn cartoon-btn-dark px-8 py-4 text-base"
              style={{ borderRadius: "14px" }}>
              BUY $BATTLE TOKENS
            </button>
            <button onClick={() => navigate("/battles")}
              className="cartoon-btn cartoon-btn-white px-8 py-4 text-base"
              style={{ borderRadius: "14px" }}>
              VIEW BATTLE ARENA
            </button>
          </div>
        </div>
      </section>
    </MemeShell>
  );
}
