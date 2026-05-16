import type { ReactElement } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import MemeShell from "@/components/MemeShell";
import { BLOG_POSTS } from "./blog";

/* ── Full article content per slug ── */
const CONTENT: Record<string, () => ReactElement> = {

  "free-crypto-mining-2026": () => (
    <div className="prose-velox">
      <h2>Why Free Mining Beats Traditional Crypto Mining in 2026</h2>
      <p>Traditional crypto mining is dead for most people. ASICs cost thousands of dollars, electricity bills wipe out the rewards, and the noise plus heat make it impractical for home setups. In 2026, the smarter way to earn crypto is platforms that offload all the infrastructure and just pay you for showing up.</p>

      <h2>What is VeloxFi?</h2>
      <p>VeloxFi is a free, browser-based mining platform on Solana. You earn <strong>WOLF tokens</strong> by running passive 4-hour mining sessions. When you're ready, you convert WOLF to <strong>$BATTLE</strong> — a real Solana token trading on pump.fun — at a fixed 5,000:1 rate.</p>
      <p>The key difference from most "free crypto" platforms: <strong>no wallet required to start mining</strong>. Just register with an email and click Start.</p>

      <h2>How a Mining Session Works</h2>
      <ul>
        <li><strong>Length:</strong> Every session runs exactly 4 hours.</li>
        <li><strong>Rate:</strong> 1 WOLF per minute → up to 240 WOLF per session.</li>
        <li><strong>Passive:</strong> Close the tab, lock the laptop, go for a walk. The session keeps running.</li>
        <li><strong>Claim:</strong> When the timer hits zero, click Claim and the WOLF lands in your balance.</li>
        <li><strong>Restart:</strong> Start the next session immediately. Up to 6 sessions a day if you're actively claiming.</li>
      </ul>

      <h2>Step-by-Step: Start Mining Today</h2>
      <ol>
        <li><strong>Register</strong> — Go to <a href="/register">veloxfi.io/register</a>. Username + email, that's it.</li>
        <li><strong>Start session</strong> — On the Mine page, click "Start Mining Session". The 4-hour timer begins.</li>
        <li><strong>Wait or do other things</strong> — Sessions run in the background server-side. You don't need to keep the tab open.</li>
        <li><strong>Claim WOLF</strong> — Come back when the timer hits zero, click Claim.</li>
        <li><strong>Convert to $BATTLE</strong> — On the Convert page, enter how much WOLF and your Phantom wallet address. We send $BATTLE within 24 hours.</li>
      </ol>

      <h2>Why Solana?</h2>
      <p>Solana processes 65,000 transactions per second at near-zero fees (typically $0.001). For payouts where each token transfer needs to be cheap and fast, Solana is the ideal blockchain. $BATTLE distributions arrive in your wallet seconds after we send them.</p>

      <h2>Getting Started Tips</h2>
      <ul>
        <li>Set up your Phantom wallet early at <a href="https://phantom.app" target="_blank" rel="noopener noreferrer">phantom.app</a> so you're ready to convert</li>
        <li>Run mining sessions back-to-back — 6 sessions in 24h × 240 WOLF = 1,440 WOLF/day max</li>
        <li>Check the Live Emission Pool on the homepage — when the buyback pool depletes, conversions queue on a waitlist</li>
        <li>Climb the leaderboard for visibility (and possible future top-100 rewards)</li>
      </ul>
    </div>
  ),

  "wolf-token-mining-guide": () => (
    <div className="prose-velox">
      <h2>What is WOLF Token?</h2>
      <p>WOLF is the in-platform credit you earn by mining on VeloxFi. While WOLF itself has no monetary value, it's the gateway to <strong>$BATTLE</strong> — a real Solana token on pump.fun. The conversion rate is fixed and never changes: <strong>5,000 WOLF = 1 $BATTLE</strong>, with fractional amounts allowed (no minimum).</p>

      <h2>How Does Free Mining Work on VeloxFi?</h2>
      <p>Unlike traditional crypto mining that requires expensive hardware and electricity, VeloxFi's mining is browser-based and passive. Here's the loop:</p>
      <ol>
        <li>Register a free account at veloxfi.io</li>
        <li>Go to the <strong>Mine</strong> page</li>
        <li>Click "Start Mining Session"</li>
        <li>Wait 4 hours — you can close the tab; sessions track server-side</li>
        <li>Come back, click "Claim" to collect your WOLF</li>
        <li>Start the next session immediately</li>
      </ol>

      <h2>How Much WOLF Do You Mine Per Session?</h2>
      <p>The rate is fixed: <strong>1 WOLF per minute</strong>, capped at <strong>240 WOLF per 4-hour session</strong>. If you run six sessions a day (one every four hours, claiming promptly), that's a theoretical maximum of <strong>1,440 WOLF/day</strong>. At 5,000:1, that translates to about 0.288 $BATTLE per day if you're maximally active.</p>

      <h2>Converting WOLF to $BATTLE</h2>
      <p>Once you have any amount of WOLF you're ready to convert:</p>
      <ol>
        <li>Set up a Phantom wallet at <a href="https://phantom.app" target="_blank" rel="noopener noreferrer">phantom.app</a></li>
        <li>Go to the <strong>Convert</strong> page</li>
        <li>Enter the amount of WOLF (no minimum, fractional $BATTLE is fine)</li>
        <li>Enter your Phantom wallet address</li>
        <li>Submit — we send $BATTLE to your wallet within 24 hours</li>
      </ol>

      <h2>What Happens When the Distribution Pool Is Empty?</h2>
      <p>VeloxFi caps distribution at the $BATTLE we've actually bought back on pump.fun (95M $BATTLE total). When the pool depletes, new conversion requests join a waitlist — your WOLF stays in your balance, untouched. As soon as we refill the pool, the queue processes in order.</p>
      <p>This is the opposite of most platforms that mint endless rewards: scarcity is baked in, no inflation, every $BATTLE you receive was bought on the open market.</p>

      <h2>Why Mine WOLF Instead of Just Buying $BATTLE?</h2>
      <p>Mining lets you earn $BATTLE without spending money — you're investing time, not capital. For people who want to accumulate a Solana token over weeks without taking on price risk, free mining is a legitimate way in. Of course, you can also buy $BATTLE directly on pump.fun if you want to be faster.</p>
    </div>
  ),

  "how-to-buy-battle-token-pump-fun": () => (
    <div className="prose-velox">
      <h2>What is $BATTLE Token?</h2>
      <p>$BATTLE is the native token of VeloxFi, built on the Solana blockchain. It launched on pump.fun and is freely tradeable. Total supply: 1,000,000,000 tokens, mint authority revoked.</p>
      <p><strong>Contract Address (CA):</strong> <code>HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump</code></p>

      <h2>Step 1 — Get a Phantom Wallet</h2>
      <p>To buy $BATTLE on Solana you need a Solana-compatible wallet. <strong>Phantom</strong> is the most popular choice:</p>
      <ol>
        <li>Go to <a href="https://phantom.app" target="_blank" rel="noopener noreferrer">phantom.app</a></li>
        <li>Download the browser extension or mobile app</li>
        <li>Create a new wallet and write down your 12-word seed phrase somewhere safe</li>
        <li>Copy your wallet address (it starts with a letter/number and is 44 characters long)</li>
      </ol>
      <p>⚠️ Never share your seed phrase with anyone. VeloxFi will never ask for it.</p>

      <h2>Step 2 — Buy SOL</h2>
      <p>You need SOL (Solana's native token) to buy $BATTLE. Buy SOL on any major exchange:</p>
      <ul>
        <li>Coinbase, Binance, Kraken, or Bybit</li>
        <li>After buying, withdraw SOL to your Phantom wallet address</li>
        <li>Keep a small extra amount for transaction fees (0.01 SOL is more than enough)</li>
      </ul>

      <h2>Step 3 — Buy on pump.fun</h2>
      <ol>
        <li>Go to <a href="https://pump.fun/coin/HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump" target="_blank" rel="noopener noreferrer">pump.fun</a></li>
        <li>Connect your Phantom wallet (click "Connect Wallet" in the top right)</li>
        <li>Enter the amount of SOL you want to spend</li>
        <li>Click "Buy" and confirm in Phantom</li>
        <li>$BATTLE tokens appear in your wallet within seconds</li>
      </ol>

      <h2>Alternative: Mine $BATTLE for Free</h2>
      <p>You don't have to buy $BATTLE — you can mine it. Register on VeloxFi, run 4-hour mining sessions, and convert WOLF to $BATTLE at 5,000:1. It's free, just takes time.</p>
      <ul>
        <li>Register at <a href="/register">veloxfi.io/register</a></li>
        <li>Start a 4-hour mining session on the Mine page (1 WOLF/minute, 240 WOLF max per session)</li>
        <li>Claim and restart — up to 6 sessions per 24h</li>
        <li>Convert WOLF to $BATTLE on the Convert page — no minimum, fractional amounts welcome</li>
      </ul>

      <h2>Is $BATTLE a Good Investment?</h2>
      <p>This is not financial advice. $BATTLE is a speculative meme coin. Only put in what you can afford to lose. VeloxFi creates organic demand for $BATTLE through buybacks: every conversion is backed by $BATTLE bought on the open market, capped at 95M tokens. Always do your own research (DYOR).</p>
    </div>
  ),

  "capped-buyback-explained": () => (
    <div className="prose-velox">
      <h2>Why Most Reward Tokens Die</h2>
      <p>Most "earn while you sleep" platforms have one fatal flaw: they mint endless supply to pay users. Every reward dilutes existing holders. Within months the token chart drifts inexorably toward zero, and the platform either pivots or quietly shuts down.</p>
      <p>VeloxFi is built around the opposite design: <strong>we cannot pay out more $BATTLE than we've already bought on the open market.</strong></p>

      <h2>How the Capped Buyback Pool Works</h2>
      <ol>
        <li>The project team buys $BATTLE on pump.fun using its own funds — this is the distribution pool.</li>
        <li>Right now the pool is capped at <strong>95,000,000 $BATTLE</strong> (9.5% of total supply).</li>
        <li>When you convert WOLF, $BATTLE leaves the pool and lands in your Phantom wallet.</li>
        <li>When the pool runs low, new conversion requests join a waitlist. Your WOLF stays untouched in your balance.</li>
        <li>Once we refill the pool via additional pump.fun buybacks, the waitlist processes in order.</li>
      </ol>

      <h2>What This Means for You</h2>
      <ul>
        <li><strong>No emission-driven price collapse.</strong> Every $BATTLE distributed already exists — no new mint events.</li>
        <li><strong>Transparent supply.</strong> The Live Emission Pool widget on the homepage shows exactly how much is left and how many requests are waiting.</li>
        <li><strong>Buybacks create price support.</strong> When we refill the pool, we're buying $BATTLE on the open market — that's continuous buy pressure.</li>
        <li><strong>Honest waitlists.</strong> If demand outpaces our buybacks, you queue. Painful in the moment, but the alternative is dilution and we refuse to do that.</li>
      </ul>

      <h2>Why Cap at 95M?</h2>
      <p>That number is what the team has been able to accumulate on pump.fun to date. It's not a magic figure — it'll grow as the project grows. Every time we hit the cap, we'll buy more $BATTLE on pump.fun and raise the cap publicly. No silent re-mints, no off-chain promises.</p>

      <h2>The Trade-Off, Honestly</h2>
      <p>The downside: if you mine a lot of WOLF in a short window and the pool runs dry, you wait. We think that's a better trade-off than the "endless mint" model where you get paid instantly but the token chart bleeds out over time. We want $BATTLE to still be worth something in two years — capping distribution is how we get there.</p>

      <h2>Check the Pool Yourself</h2>
      <p>Don't take our word — check the live data:</p>
      <ul>
        <li>Homepage → Tokenomics section → Live Emission Pool widget</li>
        <li>Convert page → Distribution Pool card</li>
        <li>Admin endpoint (if you're auditing): <code>/api/veloxfi/supply-status</code></li>
      </ul>
    </div>
  ),

  "veloxfi-beginner-guide": () => (
    <div className="prose-velox">
      <h2>What is VeloxFi?</h2>
      <p>VeloxFi is a free mining platform on Solana. You run passive 4-hour mining sessions to earn WOLF tokens, then convert WOLF to $BATTLE — a real Solana token on pump.fun — at a fixed 5,000:1 rate. No crypto knowledge required to start.</p>

      <h2>Step 1 — Create Your Account</h2>
      <p>Go to <a href="/register">veloxfi.io/register</a> and sign up with a username and email. No wallet required to begin.</p>

      <h2>Step 2 — Start Your First Mining Session</h2>
      <p>Go to the <strong>Mine</strong> page and click "Start Mining Session". The 4-hour timer begins immediately. You can close the tab — the session tracks server-side. Come back any time after the timer hits zero to claim 240 WOLF.</p>

      <h2>Step 3 — Stack Up WOLF</h2>
      <p>Each 4-hour session pays a fixed 240 WOLF. If you claim and restart promptly, you can do six sessions in a day for a theoretical maximum of 1,440 WOLF/day. Keep an eye on the Live Emission Pool widget on the homepage to see how much $BATTLE is still available for conversion.</p>

      <h2>Step 4 — Check Your Balance</h2>
      <p>Go to your <strong>Profile</strong> page to see your WOLF balance, level, daily streak, and the achievements you've unlocked so far.</p>

      <h2>Step 5 — Convert WOLF to $BATTLE</h2>
      <p>You're ready to convert once you have any amount of WOLF — there's no minimum. But first you need a Solana wallet:</p>
      <ol>
        <li>Download Phantom at <a href="https://phantom.app" target="_blank" rel="noopener noreferrer">phantom.app</a></li>
        <li>Create a wallet and save your seed phrase safely</li>
        <li>Copy your wallet address</li>
        <li>Go to VeloxFi's <strong>Convert</strong> page</li>
        <li>Enter how much WOLF you want to convert and your wallet address</li>
        <li>Submit — we send $BATTLE within 24 hours (or queue you on the waitlist if the pool is depleted)</li>
      </ol>

      <h2>Frequently Asked Beginner Questions</h2>
      <p><strong>Is it really free?</strong> Yes. Registering and mining are 100% free. You only need a wallet when you convert WOLF to $BATTLE.</p>
      <p><strong>What's the maximum I can mine per day?</strong> Six 4-hour sessions × 240 WOLF = 1,440 WOLF/day = ~0.29 $BATTLE/day at the fixed rate.</p>
      <p><strong>Can I lose money?</strong> No — you're not spending anything to mine.</p>
      <p><strong>What if the distribution pool is empty?</strong> Your conversion request goes on a waitlist; your WOLF stays untouched. We process the queue as soon as we refill the pool.</p>
      <p><strong>Is $BATTLE worth money?</strong> $BATTLE is a real Solana token that trades on pump.fun. Its value fluctuates like any crypto. Always do your own research.</p>

      <h2>Join the Community</h2>
      <p>Join VeloxFi Telegram at <a href="https://t.me/VeloxFiOfficial" target="_blank" rel="noopener noreferrer">t.me/VeloxFiOfficial</a> for updates, bonus events, and to connect with other miners. We're active 24/7.</p>
    </div>
  ),
};

/* ── Prose styles injected inline ── */
const PROSE_STYLES = `
  .prose-velox h2 { font-family: 'Bungee', cursive; font-size: 1.25rem; color: #1a1a1a; margin-top: 2rem; margin-bottom: 0.75rem; }
  .prose-velox h3 { font-family: 'Bungee', cursive; font-size: 1rem; color: #1a1a1a; margin-top: 1.5rem; margin-bottom: 0.5rem; }
  .prose-velox p  { font-family: 'Fredoka One', cursive; font-size: 1rem; color: #444; line-height: 1.7; margin-bottom: 1rem; }
  .prose-velox ul, .prose-velox ol { margin-bottom: 1rem; padding-left: 1.5rem; }
  .prose-velox li { font-family: 'Fredoka One', cursive; font-size: 1rem; color: #444; line-height: 1.7; margin-bottom: 0.4rem; }
  .prose-velox a  { color: #FF9F43; font-weight: 600; text-decoration: underline; }
  .prose-velox strong { color: #1a1a1a; font-weight: 700; }
  .prose-velox code { font-family: monospace; font-size: 0.8rem; background: #f5f0e0; border: 1.5px solid #ddd; border-radius: 6px; padding: 2px 6px; word-break: break-all; }
`;

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const [, navigate] = useLocation();
  const slug = params?.slug ?? "";
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const ContentComponent = CONTENT[slug];

  usePageMeta({
    title: post ? `${post.title} | VeloxFi Blog` : "Blog Post | VeloxFi",
    description: post?.description ?? "Read the VeloxFi blog for guides on free WOLF mining, $BATTLE on pump.fun, and capped buyback distribution on Solana.",
    canonical: `https://veloxfi.io/blog/${slug}`,
  });

  if (!post || !ContentComponent) {
    return (
      <MemeShell>
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="font-bungee text-3xl text-[#1a1a1a] mb-4">POST NOT FOUND</h1>
          <button onClick={() => navigate("/blog")} className="cartoon-btn cartoon-btn-dark px-8 py-3 text-sm">
            BACK TO BLOG
          </button>
        </div>
      </MemeShell>
    );
  }

  return (
    <MemeShell>
      <style>{PROSE_STYLES}</style>
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Back */}
        <button onClick={() => navigate("/blog")}
          className="flex items-center gap-2 font-bungee text-sm mb-8 hover:opacity-70 transition-opacity"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#1a1a1a" }}>
          <ArrowLeft className="w-4 h-4" /> ALL POSTS
        </button>

        {/* Header */}
        <div className="cartoon-card overflow-hidden mb-8" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
          <div className="p-4 flex items-center justify-between"
            style={{ background: post.color, borderBottom: "2.5px solid #1a1a1a" }}>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#1a1a1a]" />
              <span className="font-bungee text-xs text-[#1a1a1a]">{post.readTime} read</span>
            </div>
            <span className="text-3xl">{post.emoji}</span>
          </div>
          <div className="p-8">
            <div className="flex gap-2 flex-wrap mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 font-bungee text-xs px-3 py-1 rounded-lg"
                  style={{ background: post.color + "22", border: `1.5px solid ${post.color}`, color: "#1a1a1a" }}>
                  <Tag className="w-3 h-3" />{tag}
                </span>
              ))}
            </div>
            <h1 className="font-bungee text-2xl md:text-3xl text-[#1a1a1a] mb-3 leading-snug">{post.title}</h1>
            <p className="font-fredoka text-gray-600 text-lg leading-relaxed">{post.intro}</p>
            <p className="font-fredoka text-xs text-gray-400 mt-3">
              {new Date(post.date).toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Article body */}
        <div className="cartoon-card p-8 mb-10" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
          <ContentComponent />
        </div>

        {/* CTA */}
        <div className="cartoon-card-yellow p-8 text-center" style={{ boxShadow: "6px 6px 0 #1a1a1a" }}>
          <h3 className="font-bungee text-xl text-[#1a1a1a] mb-2">START MINING NOW</h3>
          <p className="font-fredoka text-gray-600 mb-5">Free 4-hour sessions. Convert WOLF to $BATTLE on Solana at 5,000:1.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/register" className="cartoon-btn cartoon-btn-dark px-8 py-3 text-sm" style={{ textDecoration: "none" }}>CREATE FREE ACCOUNT</a>
            <a href="/mine" className="cartoon-btn cartoon-btn-white px-8 py-3 text-sm" style={{ textDecoration: "none" }}>START MINING ⛏️</a>
          </div>
        </div>

        {/* More posts */}
        <div className="mt-10">
          <h3 className="font-bungee text-lg text-[#1a1a1a] mb-5">MORE ARTICLES</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 4).map((p) => (
              <button key={p.slug} onClick={() => navigate(`/blog/${p.slug}`)}
                className="cartoon-card p-4 text-left hover:-translate-y-1 transition-all duration-200 cursor-pointer w-full"
                style={{ boxShadow: "3px 3px 0 #1a1a1a" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{p.emoji}</span>
                  <span className="font-bungee text-xs" style={{ color: p.color }}>{p.readTime}</span>
                </div>
                <p className="font-bungee text-xs text-[#1a1a1a] leading-snug">{p.title}</p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </MemeShell>
  );
}
