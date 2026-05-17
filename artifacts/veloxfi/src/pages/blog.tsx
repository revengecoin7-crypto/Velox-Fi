import { useLocation } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Sidebar } from "@/components/Sidebar";

export const BLOG_POSTS = [
  {
    slug: "free-crypto-mining-2026",
    title: "How to Mine Free Crypto in 2026 (No Hardware, No Cost)",
    description: "Step-by-step guide to mining free cryptocurrency on VeloxFi. Mine WOLF tokens in 4-hour passive sessions, then convert to real $BATTLE on Solana. No GPU, no electricity bill.",
    date: "2026-04-10",
    readTime: "6 min",
    emoji: "⛏️",
    color: "#4CC9F0",
    tags: ["Free Mining", "Solana", "WOLF Token", "Beginner"],
    intro: "Traditional crypto mining needs expensive hardware and burns electricity. VeloxFi flips that: free, browser-based, passive — and the rewards convert to a real Solana token.",
  },
  {
    slug: "wolf-token-mining-guide",
    title: "What is WOLF Token? VeloxFi Mining Guide 2026",
    description: "Complete guide to WOLF tokens on VeloxFi. Learn how passive 4-hour mining sessions work, how much you earn, and how to convert WOLF to $BATTLE on Solana at a fixed 5,000:1 rate.",
    date: "2026-04-08",
    readTime: "5 min",
    emoji: "🐺",
    color: "#6BCB77",
    tags: ["WOLF Token", "Mining", "Free Crypto", "Guide"],
    intro: "WOLF is the in-platform credit you earn by mining on VeloxFi — a passive 4-hour timer pays 1 WOLF per minute, capped at 240 per session. WOLF on its own has no monetary value; the magic is that it converts to a real Solana token.",
  },
  {
    slug: "how-to-buy-battle-token-pump-fun",
    title: "How to Buy $BATTLE Token on pump.fun — Step-by-Step 2026",
    description: "Learn how to buy $BATTLE token on pump.fun. Step-by-step guide: set up Phantom wallet, buy SOL, and purchase $BATTLE (CA: HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump) on Solana.",
    date: "2026-04-05",
    readTime: "4 min",
    emoji: "💰",
    color: "#FF9F43",
    tags: ["$BATTLE", "pump.fun", "Solana", "How to Buy"],
    intro: "$BATTLE is VeloxFi's native token on Solana, currently trading on pump.fun. Here's exactly how to buy it in under 5 minutes.",
  },
  {
    slug: "capped-buyback-explained",
    title: "Capped Buyback Distribution — Why VeloxFi Doesn't Mint Reward Tokens",
    description: "How VeloxFi handles WOLF→$BATTLE conversions: a 95M $BATTLE pool bought back on pump.fun, with a waitlist when it depletes. Transparent, scarcity-aware tokenomics.",
    date: "2026-04-02",
    readTime: "5 min",
    emoji: "🛡️",
    color: "#FFD93D",
    tags: ["Tokenomics", "Buyback", "Transparency", "Solana"],
    intro: "Most reward platforms mint endless supply to pay users. VeloxFi caps its distribution at the $BATTLE we've actually bought on pump.fun — when the pool depletes, conversions queue instead of inflating supply.",
  },
  {
    slug: "veloxfi-beginner-guide",
    title: "VeloxFi Beginner's Guide: Everything You Need to Know",
    description: "Complete beginner's guide to VeloxFi. Learn how to register, mine free WOLF, and convert to $BATTLE on Solana. Start earning crypto in minutes — no wallet needed to begin.",
    date: "2026-03-28",
    readTime: "8 min",
    emoji: "🐺",
    color: "#FF6B9D",
    tags: ["VeloxFi", "Beginner", "Getting Started", "Mining"],
    intro: "New to VeloxFi? This guide covers everything you need to go from zero to earning $BATTLE tokens — in plain language, no crypto experience needed.",
  },
];

export default function Blog() {
  usePageMeta({
    title: "Blog — VeloxFi | WOLF Mining, Capped Buybacks & $BATTLE Token Guides",
    description: "VeloxFi blog — guides on free WOLF mining, how to buy $BATTLE on pump.fun, capped buyback distribution, and getting started on Solana in 2026.",
    canonical: "https://veloxfi.io/blog",
  });

  const [, navigate] = useLocation();

  return (
    <div className="app-shell"><Sidebar /><main style={{ minWidth: 0, background: "#FFFBF0" }}>
      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5 font-bungee text-xs text-[#1a1a1a]"
            style={{ background: "#FF6B9D", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>
            📝 VELOXFI BLOG
          </div>
          <h1 className="font-bungee text-4xl md:text-5xl text-[#1a1a1a] mb-4">
            MINING <span style={{ color: "#FF6B9D" }}>GUIDES</span>
          </h1>
          <p className="font-fredoka text-lg text-gray-600 max-w-lg mx-auto">
            Learn how to mine free WOLF, buy $BATTLE on pump.fun, and understand our capped buyback model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="cartoon-card cursor-pointer transition-all duration-200 hover:-translate-y-2 overflow-hidden"
              style={{ boxShadow: "5px 5px 0 #1a1a1a" }}>
              <div className="p-2"
                style={{ background: post.color, borderBottom: "2.5px solid #1a1a1a" }}>
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="font-bungee text-xs text-[#1a1a1a]">{post.readTime} read</span>
                  <span className="text-2xl">{post.emoji}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex gap-2 flex-wrap mb-3">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="font-bungee text-xs px-2 py-0.5 rounded-lg"
                      style={{ background: post.color + "33", color: "#1a1a1a", border: `1px solid ${post.color}` }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="font-bungee text-base text-[#1a1a1a] mb-2 leading-snug">{post.title}</h2>
                <p className="font-fredoka text-sm text-gray-500 leading-relaxed mb-4">{post.intro}</p>
                <div className="flex items-center justify-between">
                  <span className="font-fredoka text-xs text-gray-400">{new Date(post.date).toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" })}</span>
                  <span className="font-bungee text-xs" style={{ color: post.color }}>READ MORE →</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="cartoon-card-yellow p-10 text-center mt-12" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
          <h3 className="font-bungee text-2xl text-[#1a1a1a] mb-3">READY TO START MINING?</h3>
          <p className="font-fredoka text-gray-600 mb-6">Register for free and start your first 4-hour mining session. No wallet needed to begin.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/register" className="cartoon-btn cartoon-btn-dark px-8 py-3 text-sm" style={{ textDecoration: "none" }}>CREATE ACCOUNT</a>
            <a href="/mine" className="cartoon-btn cartoon-btn-white px-8 py-3 text-sm" style={{ textDecoration: "none" }}>START MINING ⛏️</a>
          </div>
        </div>

      </div>
    </main></div>
  );
}
