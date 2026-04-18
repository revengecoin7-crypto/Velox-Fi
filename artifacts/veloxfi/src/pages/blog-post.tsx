import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import MemeShell from "@/components/MemeShell";
import { BLOG_POSTS } from "./blog";

/* ── Full article content per slug ── */
const CONTENT: Record<string, () => JSX.Element> = {

  "earn-crypto-playing-games-2026": () => (
    <div className="prose-velox">
      <h2>Why Play-to-Earn Matters in 2026</h2>
      <p>In 2026, crypto gaming has matured. Gone are the days of paying thousands for NFT characters. The new wave of play-to-earn is accessible — you play browser games, earn tokens, and convert to real crypto. VeloxFi is at the forefront of this shift on Solana.</p>

      <h2>What is VeloxFi?</h2>
      <p>VeloxFi is a free-to-play game arena on Solana. You earn <strong>WOLF tokens</strong> by playing arcade games and running mining sessions. When you collect 5,000 WOLF, you can convert them to <strong>$BATTLE</strong> — a real Solana token trading on pump.fun.</p>
      <p>The key difference from most P2E games: <strong>no wallet required to start</strong>. Just register with an email and start playing.</p>

      <h2>The 4 Games Available</h2>
      <ul>
        <li><strong>🐍 Crypto Snake</strong> — Classic snake game. Eat WOLF coins to grow. Each coin = 1 WOLF token. Sessions last 120 seconds.</li>
        <li><strong>🟦 Battle Tetris</strong> — Classic Tetris. Clear lines to earn WOLF. Harder clears give more points.</li>
        <li><strong>🐺 Wolf Run</strong> — Infinite side-scroller. Jump over obstacles, collect WOLF coins mid-air.</li>
        <li><strong>🚀 Rocket Miner</strong> — Shoot falling asteroids with your rocket. 1 WOLF per hit. Watch out for waves of asteroids!</li>
      </ul>
      <p>Every game session gives you 3 lives and 120 seconds to earn as many WOLF as possible.</p>

      <h2>Step-by-Step: Start Earning Today</h2>
      <ol>
        <li><strong>Register</strong> — Go to <a href="/register">veloxfi.io/register</a>. Enter your username and email. You start with a 100 WOLF bonus.</li>
        <li><strong>Play games</strong> — Visit the Games page and pick any game. Play, collect coins, earn WOLF.</li>
        <li><strong>Mine WOLF</strong> — Go to the Mine page and start a free 8-hour mining session. Claim your WOLF when it finishes.</li>
        <li><strong>Convert to $BATTLE</strong> — Once you have 5,000 WOLF, go to Convert, enter your Phantom wallet address, and claim your $BATTLE tokens.</li>
      </ol>

      <h2>How Much Can You Earn?</h2>
      <p>A skilled player can earn 20–50 WOLF per 120-second game session. With mining sessions adding more every 8 hours, consistent players stack WOLF fast. The conversion rate: <strong>5,000 WOLF = 1 $BATTLE token</strong>.</p>

      <h2>Why Solana?</h2>
      <p>Solana processes 65,000 transactions per second at near-zero fees (typically $0.001). For a gaming platform where token rewards need to flow quickly and cheaply, Solana is the ideal blockchain. $BATTLE tokens arrive in your wallet within seconds of conversion.</p>

      <h2>Getting Started Tips</h2>
      <ul>
        <li>Start your mining session first — it runs in the background for 8 hours</li>
        <li>Play Rocket Miner for fast WOLF — asteroids appear frequently</li>
        <li>Come back every 8 hours to claim and restart your mine</li>
        <li>Set up your Phantom wallet early at <a href="https://phantom.app" target="_blank" rel="noopener noreferrer">phantom.app</a> so you're ready to convert when you hit 5,000 WOLF</li>
      </ul>
    </div>
  ),

  "wolf-token-mining-guide": () => (
    <div className="prose-velox">
      <h2>What is WOLF Token?</h2>
      <p>WOLF is the in-game currency of the VeloxFi game arena on Solana. You earn WOLF by playing arcade games or running free passive mining sessions. While WOLF itself has no direct monetary value, it's the gateway to <strong>$BATTLE</strong> — a real Solana token on pump.fun.</p>
      <p>Rate: <strong>5,000 WOLF = 1 $BATTLE token</strong>.</p>

      <h2>How Does Free Crypto Mining Work on VeloxFi?</h2>
      <p>Unlike traditional crypto mining that requires expensive hardware and electricity, VeloxFi's mining system is browser-based and passive. Here's how it works:</p>
      <ol>
        <li>Register a free account at veloxfi.io</li>
        <li>Go to the <strong>Mine</strong> page</li>
        <li>Click "Start Mining Session"</li>
        <li>Wait 8 hours (you can close the tab — it runs in the background)</li>
        <li>Come back and click "Claim" to collect your WOLF</li>
        <li>Start again immediately</li>
      </ol>

      <h2>How Much WOLF Do You Mine Per Session?</h2>
      <p>Mining rewards are based on the session duration and your activity level on the platform. Active players who also play games earn mining bonuses. The 8-hour cycle encourages consistent daily engagement.</p>

      <h2>WOLF Mining vs. Playing Games</h2>
      <p>There are two ways to earn WOLF on VeloxFi:</p>
      <ul>
        <li><strong>Mining</strong> — Passive, every 8 hours. Set it and forget it. Great for consistent background earnings.</li>
        <li><strong>Games</strong> — Active, immediate. Play Snake, Tetris, Wolf Run, or Rocket Miner. Each coin/hit earns 1 WOLF. Skilled players earn faster.</li>
      </ul>
      <p>The best strategy: always have a mining session running AND play games in your free time.</p>

      <h2>Converting WOLF to $BATTLE</h2>
      <p>Once you've accumulated 5,000 WOLF, go to the <strong>Convert</strong> page:</p>
      <ol>
        <li>Enter the amount of WOLF to convert (multiples of 5,000)</li>
        <li>Enter your Phantom wallet address</li>
        <li>Submit the conversion request</li>
        <li>Receive $BATTLE tokens in your Solana wallet</li>
      </ol>

      <h2>Why Mine WOLF Instead of Just Buying $BATTLE?</h2>
      <p>Mining and gaming lets you earn $BATTLE effectively for free — you're investing time, not money. For players who enjoy games, the WOLF earnings can stack up significantly over weeks of consistent play and mining. It's a legitimate way to accumulate a Solana token without spending SOL.</p>
    </div>
  ),

  "how-to-buy-battle-token-pump-fun": () => (
    <div className="prose-velox">
      <h2>What is $BATTLE Token?</h2>
      <p>$BATTLE is the native token of the VeloxFi game arena, built on the Solana blockchain. It launched on pump.fun and is freely tradeable. Total supply: 1,000,000,000 tokens.</p>
      <p><strong>Contract Address (CA):</strong> <code>3EtQQDUrNyVzNyfrPap8RHTstJiM7J5a4fNbJqsjpump</code></p>

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
        <li>Go to <a href="https://pump.fun/coin/3EtQQDUrNyVzNyfrPap8RHTstJiM7J5a4fNbJqsjpump" target="_blank" rel="noopener noreferrer">pump.fun</a></li>
        <li>Connect your Phantom wallet (click "Connect Wallet" in the top right)</li>
        <li>Enter the amount of SOL you want to spend</li>
        <li>Click "Buy" and confirm in Phantom</li>
        <li>$BATTLE tokens appear in your wallet within seconds</li>
      </ol>

      <h2>Alternative: Earn $BATTLE for Free</h2>
      <p>You don't have to buy $BATTLE — you can earn it! Play games on VeloxFi to earn WOLF tokens. Collect 5,000 WOLF and convert to 1 $BATTLE. It's free, just takes time and skill.</p>
      <ul>
        <li>Register at <a href="/register">veloxfi.io/register</a></li>
        <li>Play Snake, Tetris, Wolf Run or Rocket Miner</li>
        <li>Mine WOLF every 8 hours passively</li>
        <li>Convert 5,000 WOLF to $BATTLE on the Convert page</li>
      </ul>

      <h2>Is $BATTLE a Good Investment?</h2>
      <p>This is not financial advice. $BATTLE is a speculative crypto token. Only invest what you can afford to lose. The VeloxFi platform creates organic demand for $BATTLE through the WOLF conversion system — players who earn WOLF convert to $BATTLE, creating continuous buy pressure. Always do your own research (DYOR).</p>
    </div>
  ),

  "best-play-to-earn-games-solana-2026": () => (
    <div className="prose-velox">
      <h2>Why Solana for Play-to-Earn in 2026?</h2>
      <p>Solana has become the dominant blockchain for gaming in 2026. With 65,000 transactions per second, near-zero fees (under $0.001), and a massive developer ecosystem, it's the ideal platform for games that need fast, cheap token transfers.</p>
      <p>Compare to Ethereum: a single token transfer on Ethereum can cost $5–50 in gas fees. On Solana, it's fractions of a cent. For play-to-earn games where you earn small amounts frequently, Solana wins easily.</p>

      <h2>VeloxFi — The Free Game Arena</h2>
      <p><strong>What it is:</strong> A browser-based arcade game arena where you earn WOLF tokens that convert to $BATTLE on Solana.</p>
      <p><strong>Games:</strong> Crypto Snake, Battle Tetris, Wolf Run, Rocket Miner.</p>
      <p><strong>Cost to start:</strong> Completely free — no NFTs, no upfront investment.</p>
      <p><strong>Earning potential:</strong> 20–50 WOLF per session + passive mining every 8 hours. 5,000 WOLF = 1 $BATTLE.</p>
      <p><strong>Best for:</strong> Casual players, beginners to crypto, people who want to earn without investing money.</p>

      <h2>What Makes a Good Play-to-Earn Game?</h2>
      <p>After the NFT gaming bubble of 2021–2022, the market has matured. The best P2E games in 2026 share these traits:</p>
      <ul>
        <li><strong>Free to start</strong> — No barrier to entry. The best games don't require you to buy an NFT first.</li>
        <li><strong>Fun gameplay</strong> — If you'd play it without the crypto rewards, it's a good game.</li>
        <li><strong>Sustainable tokenomics</strong> — Token supply must be managed to avoid inflation that kills earnings.</li>
        <li><strong>Low fees</strong> — Earning 1 cent but paying 50 cents in gas defeats the purpose.</li>
        <li><strong>Real token value</strong> — The earned token should be tradeable on a real DEX or CEX.</li>
      </ul>

      <h2>Tips for Maximising P2E Earnings</h2>
      <ul>
        <li>Always check the earn rate before investing time — how many tokens per hour?</li>
        <li>Diversify across multiple games to reduce dependence on one token</li>
        <li>Set up your Solana wallet before you start playing so you're ready to withdraw</li>
        <li>On VeloxFi: run mining sessions 24/7 (3 sessions per day) alongside gameplay</li>
        <li>Join the community — VeloxFi's Telegram often announces bonus WOLF events</li>
      </ul>

      <h2>Start Playing on VeloxFi Today</h2>
      <p>VeloxFi is live now. Register for free, earn WOLF by playing 4 arcade games, mine passively every 8 hours, and convert to $BATTLE. The contract address is <code>3EtQQDUrNyVzNyfrPap8RHTstJiM7J5a4fNbJqsjpump</code> and $BATTLE trades on pump.fun.</p>
    </div>
  ),

  "veloxfi-beginner-guide": () => (
    <div className="prose-velox">
      <h2>What is VeloxFi?</h2>
      <p>VeloxFi is a free-to-play game arena on Solana. You play arcade games and mine WOLF tokens. Convert 5,000 WOLF to 1 $BATTLE — a real Solana token you can trade on pump.fun. No crypto knowledge required to start.</p>

      <h2>Step 1 — Create Your Account</h2>
      <p>Go to <a href="/register">veloxfi.io/register</a> and sign up with a username and email. No wallet required. When you register you receive a <strong>100 WOLF welcome bonus</strong> instantly.</p>

      <h2>Step 2 — Start Your First Mining Session</h2>
      <p>Before anything else, go to the <strong>Mine</strong> page and click "Start Mining Session". This takes 8 hours and earns you free WOLF in the background. Do this first so it's running while you play.</p>

      <h2>Step 3 — Play Your First Game</h2>
      <p>Go to <strong>Games</strong> and pick any game. We recommend starting with Crypto Snake — it's the simplest:</p>
      <ul>
        <li>Use arrow keys or WASD to control the snake</li>
        <li>Eat the glowing coins to grow and earn WOLF</li>
        <li>Avoid hitting the walls or your own tail</li>
        <li>You have 3 lives and 120 seconds per session</li>
      </ul>

      <h2>Step 4 — Check Your Balance</h2>
      <p>After playing, go to your <strong>Profile</strong> page to see your WOLF balance. Each coin you ate added 1 WOLF to your balance. Keep playing and mining to stack up to 5,000.</p>

      <h2>Step 5 — Convert WOLF to $BATTLE</h2>
      <p>Once you have 5,000 WOLF you're ready to convert. But first you need a Solana wallet:</p>
      <ol>
        <li>Download Phantom at <a href="https://phantom.app" target="_blank" rel="noopener noreferrer">phantom.app</a></li>
        <li>Create a wallet and save your seed phrase safely</li>
        <li>Copy your wallet address</li>
        <li>Go to VeloxFi's <strong>Convert</strong> page</li>
        <li>Enter 5000 WOLF and your wallet address</li>
        <li>Submit — you receive 1 $BATTLE in your wallet</li>
      </ol>

      <h2>Frequently Asked Beginner Questions</h2>
      <p><strong>Is it really free?</strong> Yes. Playing and mining are 100% free. You only need a wallet when you convert WOLF to $BATTLE.</p>
      <p><strong>How long until I have 5,000 WOLF?</strong> With consistent gaming (say, 5 sessions per day at ~30 WOLF each) plus 3 mining sessions per day, you can reach 5,000 WOLF in about 2–3 weeks.</p>
      <p><strong>Can I lose money?</strong> No. You're not spending anything to play or mine.</p>
      <p><strong>Is $BATTLE worth money?</strong> $BATTLE is a real Solana token that trades on pump.fun. Its value fluctuates like any crypto token. Always do your own research.</p>

      <h2>Join the Community</h2>
      <p>Join the VeloxFi Telegram at <a href="https://t.me/VeloxFiOfficial" target="_blank" rel="noopener noreferrer">t.me/VeloxFiOfficial</a> for tips, bonus WOLF events, and to connect with other players. We're active 24/7.</p>
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
    description: post?.description ?? "Read the VeloxFi blog for guides on earning crypto, WOLF mining, $BATTLE token, and play-to-earn games on Solana.",
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
          <h3 className="font-bungee text-xl text-[#1a1a1a] mb-2">START EARNING NOW</h3>
          <p className="font-fredoka text-gray-600 mb-5">Play games, mine WOLF every 8 hours, convert to $BATTLE. Free to start.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/register" className="cartoon-btn cartoon-btn-dark px-8 py-3 text-sm" style={{ textDecoration: "none" }}>CREATE FREE ACCOUNT</a>
            <a href="/games" className="cartoon-btn cartoon-btn-white px-8 py-3 text-sm" style={{ textDecoration: "none" }}>PLAY GAMES 🎮</a>
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
