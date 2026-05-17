import { Link, useLocation } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Sidebar } from "@/components/Sidebar";

export const BLOG_POSTS = [
  {
    slug: "free-crypto-mining-2026",
    title: "How to Mine Free Crypto in 2026 (No Hardware, No Cost)",
    description: "Step-by-step guide to mining free cryptocurrency on VeloxFi. Mine WOLF tokens in 4-hour passive sessions, then convert to real $BATTLE on Solana. No GPU, no electricity bill.",
    date: "2026-04-10",
    readTime: "6 min",
    emoji: "⛏",
    color: "var(--cyan)",
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
    color: "var(--lime)",
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
    color: "var(--magenta)",
    tags: ["$BATTLE", "pump.fun", "Solana", "How to Buy"],
    intro: "$BATTLE is VeloxFi's native token on Solana, currently trading on pump.fun. Here's exactly how to buy it in under 5 minutes.",
  },
  {
    slug: "capped-buyback-explained",
    title: "Capped Buyback Distribution — Why VeloxFi Doesn't Mint Reward Tokens",
    description: "How VeloxFi handles WOLF→$BATTLE conversions: a 95M $BATTLE pool bought back on pump.fun, with a waitlist when it depletes. Transparent, scarcity-aware tokenomics.",
    date: "2026-04-02",
    readTime: "5 min",
    emoji: "🛡",
    color: "var(--yellow)",
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
    color: "var(--lavender)",
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
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          <div className="topbar">
            <div className="crumb">Home / <b>Blog</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Mining guides.</div>
            <span className="pill magenta">📝 {BLOG_POSTS.length} posts</span>
          </div>

          <div className="grid-2">
            {BLOG_POSTS.map(post => (
              <article key={post.slug} className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer" }} onClick={() => navigate(`/blog/${post.slug}`)}>
                <div className="row" style={{ padding: "10px 16px", background: post.color, borderBottom: "2.5px solid var(--ink)" }}>
                  <span className="mono" style={{ fontSize: 11 }}>{post.readTime} read</span>
                  <div className="grow" />
                  <span style={{ fontSize: 22 }}>{post.emoji}</span>
                </div>
                <div style={{ padding: 18 }}>
                  <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="pill" style={{ background: post.color, fontSize: 10 }}>{tag}</span>
                    ))}
                  </div>
                  <h2 className="display" style={{ fontSize: 17, lineHeight: 1.2, marginBottom: 6 }}>{post.title}</h2>
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5, marginBottom: 12 }}>{post.intro}</p>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>
                      {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    <span className="display" style={{ fontSize: 12, color: post.color }}>READ MORE →</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="card yellow" style={{ padding: 28, textAlign: "center" }}>
            <h3 className="display" style={{ fontSize: 24, margin: "0 0 6px" }}>Ready to start mining?</h3>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 16 }}>Register for free and start your first 4-hour mining session. No wallet needed to begin.</p>
            <div className="row" style={{ gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" className="btn lg primary">🚀 Create account</Link>
              <Link href="/mine" className="btn lg">⛏ Start mining</Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
