import { useState } from "react";
import { Copy, Check, ExternalLink, Zap, Shield, TrendingUp } from "lucide-react";
import MemeShell from "@/components/MemeShell";
import { usePageMeta } from "@/hooks/usePageMeta";

const CA = "3EtQQDUrNyVzNyfrPap8RHTstJiM7J5a4fNbJqsjpump";
const PUMP_URL = "https://pump.fun/coin/3EtQQDUrNyVzNyfrPap8RHTstJiM7J5a4fNbJqsjpump";

const HOW_TO_BUY = [
  { step: "01", title: "Get a Solana wallet", desc: "Download Phantom or Solflare and create a new wallet. Keep your seed phrase safe!", color: "#FFD93D", icon: "👛" },
  { step: "02", title: "Buy SOL",             desc: "Buy SOL on Coinbase, Binance, or any exchange and send it to your wallet.", color: "#4CC9F0", icon: "💳" },
  { step: "03", title: "Go to pump.fun",      desc: "Open the link below, paste the contract address, and swap SOL for $BATTLE.", color: "#FF6B9D", icon: "🚀" },
  { step: "04", title: "Hold & earn WOLF",    desc: "Play games and mine WOLF tokens. 5000 WOLF = 1 $BATTLE. Stack up!", color: "#6BCB77", icon: "🏆" },
];

export default function Presale() {
  usePageMeta({
    title: "Buy $BATTLE — Live on pump.fun | VeloxFi",
    description: "$BATTLE is now live on pump.fun. Buy on Solana with contract address 3EtQQDUrNyVzNyfrPap8RHTstJiM7J5a4fNbJqsjpump",
    canonical: "https://veloxfi.io/buy",
  });

  const [copied, setCopied] = useState(false);

  function copyCA() {
    navigator.clipboard.writeText(CA).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <MemeShell>
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 font-bungee text-xs text-[#1a1a1a]"
            style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#1a1a1a" }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "#1a1a1a" }} />
            </span>
            LIVE ON PUMP.FUN
          </div>
          <h1 className="font-bungee text-4xl md:text-5xl text-[#1a1a1a] mb-4">
            BUY <span style={{ color: "#FF9F43" }}>$BATTLE</span>
          </h1>
          <p className="font-fredoka text-lg text-gray-600 max-w-xl mx-auto">
            $BATTLE is live on Solana via pump.fun. Copy the contract address below or click the button to buy directly.
          </p>
        </div>

        {/* Contract address card */}
        <div className="cartoon-card p-8 mb-8 text-center" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
          <div className="font-bungee text-sm text-gray-500 mb-3">CONTRACT ADDRESS (CA)</div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <code className="font-mono-data text-sm md:text-base text-[#1a1a1a] break-all"
              style={{ background: "#f5f0e0", border: "2px solid #1a1a1a", borderRadius: "10px", padding: "10px 16px" }}>
              {CA}
            </code>
            <button onClick={copyCA}
              className="flex items-center gap-2 font-bungee text-sm px-4 py-3 rounded-xl flex-shrink-0"
              style={{ background: copied ? "#6BCB77" : "#FFD93D", border: "2px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a", cursor: "pointer", color: "#1a1a1a" }}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "COPIED!" : "COPY"}
            </button>
          </div>
        </div>

        {/* Buy button */}
        <div className="text-center mb-12">
          <a href={PUMP_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 font-bungee text-lg px-12 py-5 rounded-2xl"
            style={{ background: "#FF9F43", border: "2.5px solid #1a1a1a", boxShadow: "5px 5px 0 #1a1a1a", color: "#1a1a1a", textDecoration: "none" }}>
            <span>BUY ON PUMP.FUN</span>
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        {/* Token info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
          {[
            { icon: <Zap className="w-6 h-6 text-[#1a1a1a]" />, label: "Total Supply", value: "1,000,000,000", color: "#4CC9F0" },
            { icon: <Shield className="w-6 h-6 text-[#1a1a1a]" />, label: "Blockchain", value: "Solana", color: "#6BCB77" },
            { icon: <TrendingUp className="w-6 h-6 text-[#1a1a1a]" />, label: "Listed on", value: "pump.fun", color: "#FF6B9D" },
          ].map((card) => (
            <div key={card.label} className="cartoon-card p-6 text-center transition-all duration-200 hover:-translate-y-1"
              style={{ boxShadow: "4px 4px 0 #1a1a1a" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: card.color, border: "2px solid #1a1a1a" }}>
                {card.icon}
              </div>
              <div className="font-bungee text-lg text-[#1a1a1a]">{card.value}</div>
              <div className="font-fredoka text-sm text-gray-500 mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {/* How to buy */}
        <h2 className="font-bungee text-2xl text-[#1a1a1a] mb-6 text-center">HOW TO BUY</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {HOW_TO_BUY.map(({ step, title, desc, color, icon }) => (
            <div key={step} className="cartoon-card p-6 transition-all duration-200 hover:-translate-y-1"
              style={{ boxShadow: "4px 4px 0 #1a1a1a" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: color, border: "2px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a" }}>
                  {icon}
                </div>
                <div>
                  <div className="font-bungee text-xs text-gray-400">STEP {step}</div>
                  <div className="font-bungee text-sm text-[#1a1a1a]">{title}</div>
                </div>
              </div>
              <p className="font-fredoka text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Also earn WOLF */}
        <div className="cartoon-card-yellow p-8 text-center" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
          <h3 className="font-bungee text-2xl text-[#1a1a1a] mb-3">EARN MORE $BATTLE</h3>
          <p className="font-fredoka text-[#333] text-lg mb-6 max-w-md mx-auto">
            Play games and mine WOLF tokens for free. Convert <strong>5000 WOLF = 1 $BATTLE</strong> whenever you're ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/games" className="cartoon-btn cartoon-btn-dark px-8 py-3 text-sm" style={{ textDecoration: "none" }}>
              PLAY GAMES
            </a>
            <a href="/mine" className="cartoon-btn cartoon-btn-white px-8 py-3 text-sm" style={{ textDecoration: "none" }}>
              START MINING
            </a>
          </div>
        </div>

      </div>
    </MemeShell>
  );
}
