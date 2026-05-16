import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import MemeShell from "@/components/MemeShell";

const FAQS = [
  {
    q: "What is VeloxFi?",
    a: "VeloxFi is a mining-only meme coin platform on Solana. You mine WOLF tokens for free in 4-hour sessions, then convert them to $BATTLE — a real Solana token live on pump.fun. No presale, no team allocation, no gimmicks.",
    color: "#4CC9F0", emoji: "🐺",
  },
  {
    q: "How does mining work?",
    a: "Once you register, start a free mining session from the Mine page. The session runs passively for 4 hours and pays 1 WOLF per minute (240 WOLF max per session). Come back, click Claim, and start the next session.",
    color: "#FF9F43", emoji: "⛏️",
  },
  {
    q: "What is WOLF and what is $BATTLE?",
    a: "WOLF is the in-platform credit you earn by mining. It has no monetary value on its own. $BATTLE is the real Solana SPL token on pump.fun. You convert WOLF to $BATTLE at a fixed 5,000:1 rate — no minimum, fractional amounts allowed.",
    color: "#FFD93D", emoji: "🔄",
  },
  {
    q: "How do I convert WOLF to $BATTLE?",
    a: "Go to the Convert page, enter how many WOLF you want to convert and your Solana wallet address. We'll send the $BATTLE to your wallet within 24 hours. If our distribution pool is depleted at that moment, your request joins a waitlist — your WOLF stays untouched.",
    color: "#FF6B9D", emoji: "💱",
  },
  {
    q: "Why is the distribution pool capped?",
    a: "Every $BATTLE we hand out has been bought back on the open market at pump.fun (capped at 95M $BATTLE). We don't mint new supply — we just redistribute what we've already purchased. When the pool runs low, new conversion requests go to a waitlist until we refill it.",
    color: "#08D1F2", emoji: "🛡️",
  },
  {
    q: "What is the $BATTLE token contract?",
    a: "HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump — standard SPL on Solana. Mint authority is revoked, LP is burned. You can buy it directly on pump.fun.",
    color: "#FF9F43", emoji: "⚔️",
  },
  {
    q: "How do I buy $BATTLE directly?",
    a: "Open pump.fun, paste the contract address (HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump), and swap SOL for $BATTLE from your Phantom wallet.",
    color: "#A29BFE", emoji: "🛒",
  },
  {
    q: "Which wallet do I need?",
    a: (<>You need Phantom wallet on Solana to receive $BATTLE tokens. Download it at <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: "#4CC9F0" }}>phantom.app</a>. Mining WOLF does not require a wallet — only converting to $BATTLE does.</>),
    color: "#6BCB77", emoji: "👛",
  },
  {
    q: "Is VeloxFi free to use?",
    a: "Yes. Registering and mining WOLF is completely free. You only need a wallet when you convert WOLF to $BATTLE tokens, which get sent to your Solana address.",
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
    title: "FAQ — VeloxFi | Mine WOLF, Convert to $BATTLE on Solana",
    description: "Frequently asked questions about VeloxFi. Learn how to mine WOLF tokens for free, convert to $BATTLE on Solana, the capped buyback pool, and how the platform works.",
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
            <a href="/mine"
              className="cartoon-btn cartoon-btn-dark px-8 py-3 text-sm"
              style={{ textDecoration: "none" }}>
              ⛏ START MINING
            </a>
          </div>
        </div>

      </div>
    </MemeShell>
  );
}
