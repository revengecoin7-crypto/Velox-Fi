import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import MemeShell from "@/components/MemeShell";
import { useLocation } from "wouter";

const FAQ_EMOJIS = ["🐺","⚔️","💰","🛒","💸","🔒","👛","🚫","🌐","✈️"];

const faqs = [
  { q: "What is VeloxFi?", a: "VeloxFi is the first memecoin battle platform on Solana. Users create memecoins and compete in real-time price surge battles. The coin with the highest percentage price increase wins.", color: "#2563eb" },
  { q: "How do battles work?", a: "Two coins enter a battle for 1h, 3h, 12h, 24h or 7 days. The coin with the highest % price surge wins. Winner gets a badge + 30% of loser tokens. Loser gets 50% back. 20% is permanently burned.", color: "#7c3aed" },
  { q: "What is $BATTLE token?", a: "$BATTLE is the platform token. You need it to create coins and open battles. Total supply: 1 billion. Launching on pump.fun.", color: "#2563eb" },
  { q: "How do I get $BATTLE tokens?", a: "Join our presale at veloxfi.io/presale for the lowest price. After launch they will be available on pump.fun.", color: "#7c3aed" },
  { q: "What is the max buy per transaction?", a: "Maximum $5 per transaction with a 1 minute cooldown between purchases.", color: "#2563eb" },
  { q: "Is VeloxFi safe?", a: "All battles run on Solana smart contracts. Funds are locked until battle ends. We never have access to your private keys.", color: "#7c3aed" },
  { q: "Which wallet do I need?", a: (<>Phantom wallet on Solana. Download at{" "}<a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors">phantom.app</a></>), color: "#2563eb" },
  { q: "Is VeloxFi available in the US?", a: "No. VeloxFi is not available to US residents.", color: "#ef4444" },
  { q: "How can I join the community?", a: (<>Join our Telegram at{" "}<a href="https://t.me/VeloxFiOfficial" target="_blank" rel="noopener noreferrer" className="text-green-400 underline underline-offset-2">t.me/VeloxFiOfficial</a>{" "}and Discord at{" "}<a href="https://discord.gg/u2UhxuTd" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline underline-offset-2">discord.gg/u2UhxuTd</a></>), color: "#7c3aed" },
];

export default function FAQ() {
  usePageMeta({
    title: "FAQ — Frequently Asked Questions | VeloxFi",
    description: "Answers to common questions about VeloxFi, the $BATTLE token, how memecoin battles work, wallet requirements, and presale details.",
    canonical: "https://veloxfi.io/#/faq",
  });
  const [, navigate] = useLocation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <MemeShell>
      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-14 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-orbitron tracking-widest mb-6"
          style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.4)", color: "#60a5fa" }}>
          ❓ SUPPORT CENTER
        </div>
        <h1 className="font-orbitron font-black text-4xl md:text-5xl tracking-wider mb-4 leading-tight meme-title">
          ❓ FREQUENTLY ASKED{" "}
          <span style={{ background: "linear-gradient(90deg,#60a5fa,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            QUESTIONS
          </span>
        </h1>
        <p className="text-gray-400 text-lg">Everything you need to know about VeloxFi 🐺</p>
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto px-6 pb-12 flex flex-col gap-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                border: isOpen ? `2px solid ${faq.color}88` : "1px solid rgba(255,255,255,0.08)",
                background: isOpen ? `${faq.color}08` : "rgba(255,255,255,0.02)",
                boxShadow: isOpen ? `0 0 20px ${faq.color}22` : "none",
              }}>
              <button onClick={() => toggle(i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                style={{ background: "none", border: "none", cursor: "pointer" }}>
                <div className="flex items-center gap-4">
                  <span className="text-xl flex-shrink-0">{FAQ_EMOJIS[i]}</span>
                  <span className="font-orbitron font-bold text-sm md:text-base leading-snug"
                    style={{ color: isOpen ? "white" : "#d1d5db" }}>
                    {faq.q}
                  </span>
                </div>
                <ChevronDown className="flex-shrink-0 w-5 h-5 transition-transform duration-300"
                  style={{ color: isOpen ? faq.color : "#6b7280", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>
              <div style={{ maxHeight: isOpen ? 400 : 0, overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
                <div className="px-6 pb-6 text-sm md:text-base leading-relaxed pl-[4.5rem]"
                  style={{ color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>
                  {faq.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="rounded-3xl p-10 text-center"
          style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.12),rgba(124,58,237,0.12))", border: "2px solid rgba(124,58,237,0.3)" }}>
          <div className="text-4xl mb-3">🐺</div>
          <h2 className="font-orbitron font-black text-2xl text-white mb-3">STILL HAVE QUESTIONS?</h2>
          <p className="text-gray-400 text-sm mb-6">We're active in our community 24/7</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: "✈️ Telegram", href: "https://t.me/VeloxFiOfficial", color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)" },
              { label: "⊹ Discord",  href: "https://discord.gg/u2UhxuTd",  color: "#a78bfa", bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.3)" },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-orbitron font-black text-sm tracking-wider transition-all hover:scale-105"
                style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
                {s.label}
              </a>
            ))}
            <button onClick={() => navigate("/presale")} className="btn-meme px-8 py-3 rounded-xl text-sm"
              style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
              🔥 BUY $BATTLE NOW
            </button>
          </div>
        </div>
      </div>
    </MemeShell>
  );
}
