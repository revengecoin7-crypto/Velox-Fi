import MemeShell from "@/components/MemeShell";
import { useLocation } from "wouter";

export default function Game() {
  const [, navigate] = useLocation();

  return (
    <MemeShell testId="game-page">
      {/* Hero */}
      <section className="pt-16 pb-10 px-6 text-center">
        <h1 className="meme-title font-orbitron font-black tracking-wider mb-4"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
          ⚔️ VELOXFI BATTLE KINGDOM
        </h1>
        <p className="text-gray-400 font-orbitron text-sm tracking-widest max-w-2xl mx-auto mb-8">
          Build your empire. Train your army. Dominate the battlefield.
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { emoji: "🏰", label: "Build Your Kingdom" },
            { emoji: "⚔️", label: "Battle Rivals" },
            { emoji: "🐺", label: "Train Warriors" },
            { emoji: "💰", label: "Earn $BATTLE" },
            { emoji: "🏆", label: "Climb the Leaderboard" },
            { emoji: "🔥", label: "Solana-Powered" },
          ].map(({ emoji, label }) => (
            <div key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-orbitron text-xs tracking-wider"
              style={{
                background: "rgba(37,99,235,0.12)",
                border: "1px solid rgba(37,99,235,0.3)",
                color: "#93c5fd",
              }}>
              <span>{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* PLAY NOW — top */}
        <button
          onClick={() => document.getElementById("game-iframe")?.scrollIntoView({ behavior: "smooth" })}
          className="btn-meme px-10 py-4 rounded-2xl text-base font-orbitron font-black tracking-widest mb-4"
        >
          ⚔️ PLAY NOW — ENTER THE KINGDOM
        </button>

        <p className="text-gray-600 font-orbitron text-xs tracking-widest mb-4">
          Free to play · Powered by Solana · $BATTLE rewards coming
        </p>
      </section>

      {/* iframe */}
      <section className="px-4 pb-4" id="game-iframe">
        <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(124,58,237,0.35)",
            boxShadow: "0 0 60px rgba(124,58,237,0.2), 0 0 120px rgba(37,99,235,0.1)",
          }}>
          {/* iframe label bar */}
          <div className="flex items-center gap-3 px-5 py-3"
            style={{ background: "rgba(124,58,237,0.12)", borderBottom: "1px solid rgba(124,58,237,0.25)" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#22c55e" }} />
            <span className="ml-2 font-orbitron text-xs tracking-widest text-gray-500">
              veloxfi-battl.replit.app
            </span>
          </div>

          <iframe
            src="https://veloxfi-battl.replit.app"
            title="VeloxFi Battle Kingdom"
            width="100%"
            height="800"
            style={{ display: "block", border: "none", background: "#05080f" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            loading="lazy"
          />
        </div>
      </section>

      {/* PLAY NOW — bottom + CTA */}
      <section className="py-14 px-6 text-center">
        <p className="text-gray-500 font-orbitron text-xs tracking-widest mb-6">
          ⚔️ LIVE BATTLES · 🏆 LEADERBOARD REWARDS · 🐺 VELOXFI WARRIORS
        </p>
        <button
          onClick={() => document.getElementById("game-iframe")?.scrollIntoView({ behavior: "smooth" })}
          className="btn-meme px-10 py-4 rounded-2xl text-base font-orbitron font-black tracking-widest mb-10"
        >
          ⚔️ PLAY NOW — ENTER THE KINGDOM
        </button>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
          <button onClick={() => navigate("/presale")}
            className="btn-meme px-8 py-3 rounded-xl text-sm font-orbitron font-black tracking-widest">
            🔥 BUY $BATTLE TOKENS
          </button>
          <button onClick={() => navigate("/battles")}
            className="px-8 py-3 rounded-xl text-sm font-orbitron font-black tracking-widest transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af" }}>
            ⚔️ VIEW BATTLE ARENA
          </button>
        </div>
      </section>
    </MemeShell>
  );
}
