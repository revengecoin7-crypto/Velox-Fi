import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import MemeShell from "@/components/MemeShell";

const FAQS = [
  {
    q: "What is VeloxFi?",
    a: "VeloxFi is a play-to-earn game arena on Solana. You play arcade games and mine WOLF tokens for free. Collect 5,000 WOLF and convert them to $BATTLE — a real Solana token live on pump.fun.",
    color: "#4CC9F0", emoji: "🐺",
  },
  {
    q: "How do I earn WOLF tokens?",
    a: "Two ways: (1) Play any of the 4 arcade games — you earn 1 WOLF per coin/point collected in-game. (2) Start a mining session every 8 hours and claim free WOLF when it completes.",
    color: "#6BCB77", emoji: "💰",
  },
  {
    q: "What is WOLF token?",
    a: "WOLF is the in-game currency of VeloxFi. It has no direct monetary value but can be converted to $BATTLE tokens (5,000 WOLF = 1 $BATTLE). You earn it by playing games or mining.",
    color: "#FFD93D", emoji: "🐺",
  },
  {
    q: "How does mining work?",
    a: "Once you register, you can start a free mining session from the Mine page. The session runs passively for 8 hours. Come back, click Claim, and your WOLF tokens are added to your balance. Then start again.",
    color: "#FF9F43", emoji: "⛏️",
  },
  {
    q: "What games are available?",
    a: "There are 4 games: Crypto Snake (eat coins to grow), Battle Tetris (clear lines), Wolf Run (runner — collect coins), and Rocket Miner (shoot asteroids). All earn WOLF tokens during 120-second sessions.",
    color: "#4CC9F0", emoji: "🎮",
  },
  {
    q: "How do I convert WOLF to $BATTLE?",
    a: "Go to the Convert page, enter how many WOLF you want to convert (minimum 5,000), enter your Solana wallet address, and submit. We send the $BATTLE tokens to your wallet.",
    color: "#FF6B9D", emoji: "💱",
  },
  {
    q: "What is $BATTLE token?",
    a: "$BATTLE is a real Solana token launched on pump.fun. Contract address: HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump. Total supply: 1 billion. You can buy it directly on pump.fun or earn it through WOLF.",
    color: "#FF9F43", emoji: "⚔️",
  },
  {
    q: "How do I buy $BATTLE directly?",
    a: "Go to pump.fun and search for the contract address: HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump. You need a Phantom wallet with SOL to buy it. Or use the Buy $BATTLE link in our navigation.",
    color: "#A29BFE", emoji: "🛒",
  },
  {
    q: "Which wallet do I need?",
    a: (<>You need Phantom wallet on Solana to receive $BATTLE tokens. Download it at <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: "#4CC9F0" }}>phantom.app</a>. Playing games and mining WOLF does not require a wallet — only converting to $BATTLE does.</>),
    color: "#6BCB77", emoji: "👛",
  },
  {
    q: "Is VeloxFi free to use?",
    a: "Yes! Playing games and mining WOLF is completely free. You only need a wallet when you convert WOLF to $BATTLE tokens, which get sent to your Solana address.",
    color: "#6BCB77", emoji: "✅",
  },
  {
    q: "How can I join the community?",
    a: (<>Join our Telegram at <a href="https://t.me/VeloxFiOfficial" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: "#6BCB77" }}>t.me/VeloxFiOfficial</a> or follow us on X at <a href="https://x.com/Battle767629" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: "#08D1F2" }}>x.com/Battle767629</a>. We're active 24/7.</>),
    color: "#A29BFE", emoji: "🌐",
  },
  {
    q: "Is VeloxFi available in the US?",
    a: "No. VeloxFi is not available to US residents due to regulatory restrictions.",
    color: "#FF6B6B", emoji: "🚫",
  },
];

export default function FAQ() {
  usePageMeta({
    title: "FAQ — VeloxFi Game Arena | Earn WOLF, Mine Crypto, $BATTLE Token",
    description: "Frequently asked questions about VeloxFi. Learn how to earn WOLF tokens, mine crypto for free, convert to $BATTLE, play games on Solana, and how the platform works.",
    canonical: "https://veloxfi.io/faq",
  });

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <MemeShell>
      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5 font-bungee text-xs text-[#1a1a1a]"
            style={{ background: "#4CC9F0", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>
            ❓ SUPPORT CENTER
          </div>
          <h1 className="font-bungee text-4xl md:text-5xl text-[#1a1a1a] mb-4">
            FREQUENTLY <span style={{ color: "#4CC9F0" }}>ASKED</span> QUESTIONS
          </h1>
          <p className="font-fredoka text-lg text-gray-600">Everything you need to know about VeloxFi 🐺</p>
        </div>

        <div className="flex flex-col gap-3 mb-12">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i}
                className="cartoon-card overflow-hidden transition-all duration-200"
                style={{
                  boxShadow: isOpen ? `5px 5px 0 ${faq.color}` : "4px 4px 0 #1a1a1a",
                  borderColor: isOpen ? faq.color : "#1a1a1a",
                }}>
                <button onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  style={{ background: isOpen ? faq.color + "15" : "white", border: "none", cursor: "pointer" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">{faq.emoji}</span>
                    <span className="font-bungee text-sm md:text-base text-[#1a1a1a] leading-snug">{faq.q}</span>
                  </div>
                  <ChevronDown className="flex-shrink-0 w-5 h-5 transition-transform duration-300 text-[#1a1a1a]"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                </button>
                <div style={{ maxHeight: isOpen ? 300 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
                  <div className="px-6 pb-5 pt-1 pl-[4.5rem] font-fredoka text-sm md:text-base text-gray-600 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cartoon-card-yellow p-10 text-center" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
          <div className="text-4xl mb-3">🐺</div>
          <h2 className="font-bungee text-2xl text-[#1a1a1a] mb-3">STILL HAVE QUESTIONS?</h2>
          <p className="font-fredoka text-gray-600 text-base mb-6">We're active in our community 24/7 — come say hi!</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://t.me/VeloxFiOfficial" target="_blank" rel="noopener noreferrer"
              className="cartoon-btn px-6 py-3 text-sm font-bungee"
              style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a", textDecoration: "none", color: "#1a1a1a", borderRadius: "12px" }}>
              ✈️ Telegram
            </a>
            <a href="https://x.com/Battle767629" target="_blank" rel="noopener noreferrer"
              className="cartoon-btn px-6 py-3 text-sm font-bungee"
              style={{ background: "#1a1a1a", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #666", textDecoration: "none", color: "white", borderRadius: "12px" }}>
              𝕏 Follow on X
            </a>
            <a href="/games"
              className="cartoon-btn cartoon-btn-dark px-8 py-3 text-sm"
              style={{ textDecoration: "none" }}>
              🎮 PLAY NOW
            </a>
          </div>
        </div>

      </div>
    </MemeShell>
  );
}
