import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Sidebar } from "@/components/Sidebar";

interface Faq { q: string; a: ReactNode; emoji: string; color: string }

const FAQS: Faq[] = [
  { q: "What is VeloxFi?",                       emoji: "🐺", color: "var(--cyan)",
    a: "VeloxFi is a mining-only meme coin platform on Solana. You mine WOLF tokens for free in 4-hour sessions, then convert them to $BATTLE — a real Solana token live on pump.fun. No presale, no team allocation, no gimmicks." },
  { q: "How does mining work?",                  emoji: "⛏", color: "var(--yellow)",
    a: "Once you register, start a free mining session from the Mine page. The session runs passively for 4 hours and pays 1 WOLF per minute (240 WOLF max per session). Come back, click Claim, and start the next session." },
  { q: "What is WOLF and what is $BATTLE?",       emoji: "🔄", color: "var(--lime)",
    a: "WOLF is the in-platform credit you earn by mining. It has no monetary value on its own. $BATTLE is the real Solana SPL token on pump.fun. You convert WOLF to $BATTLE at a fixed 5,000:1 rate — no minimum, fractional amounts allowed." },
  { q: "How do I convert WOLF to $BATTLE?",      emoji: "💱", color: "var(--magenta)",
    a: "Go to the Convert page, enter how many WOLF you want to convert and your Solana wallet address. We'll send the $BATTLE to your wallet within 24 hours. If our distribution pool is depleted at that moment, your request joins a waitlist — your WOLF stays untouched." },
  { q: "Why is the distribution pool capped?",   emoji: "🛡", color: "var(--cyan)",
    a: "Every $BATTLE we hand out has been bought back on the open market at pump.fun (capped at 95M $BATTLE). We don't mint new supply — we just redistribute what we've already purchased. When the pool runs low, new conversion requests go to a waitlist until we refill it." },
  { q: "What is the $BATTLE token contract?",    emoji: "⚔", color: "var(--yellow)",
    a: "HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump — standard SPL on Solana. Mint authority is revoked, LP is burned. You can buy it directly on pump.fun." },
  { q: "How do I buy $BATTLE directly?",         emoji: "🛒", color: "var(--lavender)",
    a: "Open pump.fun, paste the contract address (HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump), and swap SOL for $BATTLE from your Phantom wallet." },
  { q: "Which wallet do I need?",                 emoji: "👛", color: "var(--lime)",
    a: <>You need Phantom wallet on Solana to receive $BATTLE tokens. Download it at <a href="https://phantom.app" target="_blank" rel="noreferrer" style={{ color: "var(--magenta)", fontWeight: 700 }}>phantom.app</a>. Mining WOLF does not require a wallet — only converting to $BATTLE does.</> },
  { q: "Is VeloxFi free to use?",                 emoji: "✅", color: "var(--lime)",
    a: "Yes. Registering and mining WOLF is completely free. You only need a wallet when you convert WOLF to $BATTLE tokens, which get sent to your Solana address." },
  { q: "How can I join the community?",          emoji: "🌐", color: "var(--lavender)",
    a: <>Join our Telegram at <a href="https://t.me/VeloxFiOfficial" target="_blank" rel="noreferrer" style={{ color: "var(--magenta)", fontWeight: 700 }}>t.me/VeloxFiOfficial</a> or follow us on X at <a href="https://x.com/Battle767629" target="_blank" rel="noreferrer" style={{ color: "var(--magenta)", fontWeight: 700 }}>x.com/Battle767629</a>. We're active 24/7.</> },
  { q: "Is VeloxFi available in the US?",        emoji: "🚫", color: "var(--tomato)",
    a: "No. VeloxFi is not available to US residents due to regulatory restrictions." },
];

export default function FAQ() {
  usePageMeta({
    title: "FAQ — VeloxFi | Mine WOLF, Convert to $BATTLE on Solana",
    description: "Frequently asked questions about VeloxFi. Learn how to mine WOLF tokens for free, convert to $BATTLE on Solana, the capped buyback pool, and how the platform works.",
    canonical: "https://veloxfi.io/faq",
  });

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i));

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          <div className="topbar">
            <div className="crumb">Home / <b>FAQ</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Frequently asked questions.</div>
            <span className="pill cyan">❓ Support</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="card" style={{ padding: 0, overflow: "hidden", borderColor: isOpen ? "var(--ink)" : undefined }}>
                  <button onClick={() => toggle(i)} className="row" style={{
                    width: "100%", padding: "16px 22px", background: isOpen ? "var(--cream)" : "var(--paper)",
                    border: "none", cursor: "pointer", justifyContent: "space-between", gap: 14, textAlign: "left",
                  }}>
                    <div className="row" style={{ gap: 12, minWidth: 0 }}>
                      <span style={{ width: 36, height: 36, borderRadius: 9, background: faq.color, border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{faq.emoji}</span>
                      <span className="display" style={{ fontSize: 15, lineHeight: 1.2 }}>{faq.q}</span>
                    </div>
                    <span style={{ fontSize: 18, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms", color: "var(--mute)" }}>▾</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: "12px 22px 20px 70px", fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, borderTop: "1px dashed rgba(11,11,26,0.12)" }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="card magenta" style={{ padding: 30, textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(var(--ink) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px", opacity: 0.12 }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🐺</div>
              <h2 className="display" style={{ fontSize: 28, color: "white", margin: "0 0 6px" }}>Still got questions?</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", marginBottom: 18 }}>The pack is active 24/7 — come say hi.</p>
              <div className="row" style={{ gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <a className="btn lg" href="https://t.me/VeloxFiOfficial" target="_blank" rel="noreferrer">✈ Telegram</a>
                <a className="btn lg" href="https://x.com/Battle767629" target="_blank" rel="noreferrer">𝕏 Follow on X</a>
                <Link href="/mine" className="btn lg primary">⛏ Start mining</Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
