import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronDown, HelpCircle } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

const faqs = [
  {
    q: "What is VeloxFi?",
    a: "VeloxFi is the first memecoin battle platform on Solana. Users create memecoins and compete in real-time price surge battles. The coin with the highest percentage price increase wins.",
    color: "#2563eb",
  },
  {
    q: "How do battles work?",
    a: "Two coins enter a battle for 1h, 3h, 12h, 24h or 7 days. The coin with the highest % price surge wins. Winner gets a badge + 30% of loser tokens. Loser gets 50% back. 20% is permanently burned.",
    color: "#7c3aed",
  },
  {
    q: "What is $BATTLE token?",
    a: "$BATTLE is the platform token. You need it to create coins and open battles. Total supply: 1 billion. Launching on pump.fun.",
    color: "#2563eb",
  },
  {
    q: "How do I get $BATTLE tokens?",
    a: "Join our presale at veloxfi.io/presale for the lowest price. After launch they will be available on pump.fun.",
    color: "#7c3aed",
  },
  {
    q: "What is the max buy per transaction?",
    a: "Maximum $5 per transaction with a 1 minute cooldown between purchases.",
    color: "#2563eb",
  },
  {
    q: "Is VeloxFi safe?",
    a: "All battles run on Solana smart contracts. Funds are locked until battle ends. We never have access to your private keys.",
    color: "#7c3aed",
  },
  {
    q: "Which wallet do I need?",
    a: (
      <>
        Phantom wallet on Solana. Download at{" "}
        <a
          href="https://phantom.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors"
        >
          phantom.app
        </a>
      </>
    ),
    color: "#2563eb",
  },
  {
    q: "Is VeloxFi available in the US?",
    a: "No. VeloxFi is not available to US residents.",
    color: "#ef4444",
  },
  {
    q: "How can I join the community?",
    a: (
      <>
        Join our Telegram at{" "}
        <a
          href="https://t.me/VeloxFiOfficial"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 underline underline-offset-2 hover:text-green-300 transition-colors"
        >
          t.me/VeloxFiOfficial
        </a>{" "}
        and Discord at{" "}
        <a
          href="https://discord.gg/u2UhxuTd"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 underline underline-offset-2 hover:text-violet-300 transition-colors"
        >
          discord.gg/u2UhxuTd
        </a>
      </>
    ),
    color: "#7c3aed",
  },
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
    <div
      className="min-h-screen"
      style={{ background: "#05080f", color: "white", fontFamily: "Inter, sans-serif" }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b"
        style={{
          background: "rgba(5,8,15,0.95)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs text-gray-400 font-orbitron tracking-widest hover:text-white transition-colors"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <span style={{ fontSize: 16 }}>←</span> BACK TO HOME
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}
          >
            <span style={{ fontSize: 14 }}>🐺</span>
          </div>
          <span className="font-orbitron font-black text-sm tracking-wider gradient-text">VELOXFI</span>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-orbitron tracking-widest mb-6"
          style={{
            background: "rgba(37,99,235,0.12)",
            border: "1px solid rgba(37,99,235,0.3)",
            color: "#60a5fa",
          }}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          SUPPORT
        </div>

        <h1 className="font-orbitron font-black text-4xl md:text-5xl tracking-wider mb-4 leading-tight">
          FREQUENTLY ASKED{" "}
          <span
            style={{
              background: "linear-gradient(90deg,#2563eb,#7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            QUESTIONS
          </span>
        </h1>

        <p className="text-gray-400 text-base md:text-lg" style={{ fontFamily: "Inter, sans-serif" }}>
          Everything you need to know about VeloxFi
        </p>
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto px-6 pb-20 flex flex-col gap-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="rounded-xl overflow-hidden transition-all duration-200"
              style={{
                border: isOpen
                  ? `1px solid ${faq.color}55`
                  : "1px solid rgba(255,255,255,0.07)",
                background: isOpen
                  ? `rgba(5,8,15,1)`
                  : "rgba(255,255,255,0.02)",
              }}
            >
              {/* Question row */}
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-orbitron font-black"
                    style={{
                      background: `${faq.color}22`,
                      color: faq.color,
                      border: `1px solid ${faq.color}44`,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="font-semibold text-sm md:text-base leading-snug"
                    style={{
                      color: isOpen ? "white" : "#d1d5db",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {faq.q}
                  </span>
                </div>
                <ChevronDown
                  className="flex-shrink-0 w-5 h-5 transition-transform duration-300"
                  style={{
                    color: isOpen ? faq.color : "#6b7280",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Answer */}
              <div
                style={{
                  maxHeight: isOpen ? 400 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                <div
                  className="px-6 pb-6 text-sm md:text-base leading-relaxed"
                  style={{
                    color: "#9ca3af",
                    fontFamily: "Inter, sans-serif",
                    paddingLeft: "calc(1.5rem + 2.5rem)",
                  }}
                >
                  {faq.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA strip */}
      <div
        className="border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}
      >
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <p className="text-gray-400 text-sm mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
            Still have questions? We&rsquo;re active in our community.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://t.me/VeloxFiOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: "rgba(52,211,153,0.12)",
                border: "1px solid rgba(52,211,153,0.3)",
                color: "#34d399",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <span>✈</span> Telegram
            </a>
            <a
              href="https://discord.gg/u2UhxuTd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#a78bfa",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <span style={{ fontSize: 15 }}>⊹</span> Discord
            </a>
            <a
              href="https://x.com/VeloxFi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: "rgba(37,99,235,0.12)",
                border: "1px solid rgba(37,99,235,0.3)",
                color: "#60a5fa",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <span style={{ fontFamily: "sans-serif" }}>𝕏</span> @VeloxFi
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="border-t text-center py-6"
        style={{ borderColor: "rgba(255,255,255,0.04)" }}
      >
        <p className="text-xs text-gray-600 font-orbitron tracking-widest">
          © 2026 VELOXFI · ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
}
