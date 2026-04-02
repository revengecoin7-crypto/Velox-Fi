import { useLocation } from "wouter";
import { ArrowLeft, Swords, Eye, Database, Wallet, Cookie, Link2, Mail, ChevronRight, Lock } from "lucide-react";

const SECTIONS = [
  {
    id: "collect",
    icon: <Database className="w-5 h-5" />,
    title: "1. Information We Collect",
    color: "#2563eb",
    content: `VeloxFi is committed to minimizing the collection of personal data. As a decentralized platform, we are designed to operate with the least amount of personally identifiable information possible.

We may collect the following categories of information:

On-chain data: All blockchain transactions, wallet addresses, battle participation records, and token transfers are publicly recorded on the Solana blockchain. This data is inherently public and cannot be made private.

Technical data: We automatically collect certain technical information when you visit our website, including your IP address, browser type and version, operating system, referral source, pages visited, and time spent on those pages. This information is used solely for security, analytics, and service improvement purposes.

Voluntarily provided data: If you contact us directly (e.g., via Telegram or email), we may retain the content of your message and any information you voluntarily provide in order to respond to your inquiry.`,
  },
  {
    id: "use",
    icon: <Eye className="w-5 h-5" />,
    title: "2. How We Use Information",
    color: "#3b82f6",
    content: `We use the information we collect for the following purposes:

Service delivery: To operate, maintain, and improve the VeloxFi platform, including battle mechanics, token distribution, and user experience enhancements.

Security: To detect, investigate, and prevent fraudulent activity, unauthorized access attempts, and other malicious conduct that could harm the Platform or its users.

Analytics: To understand how users interact with the Platform in aggregate, enabling us to identify areas for improvement and measure the effectiveness of new features.

Legal compliance: To comply with applicable laws, regulations, and lawful requests from government authorities, including compliance with sanctions screening obligations.

Communication: To respond to user inquiries and, where you have opted in, to send you updates about Platform developments, new features, and the $BATTLE presale.

We do not sell, rent, or trade your personal information to third parties for their marketing purposes.`,
  },
  {
    id: "wallet",
    icon: <Wallet className="w-5 h-5" />,
    title: "3. Wallet Addresses",
    color: "#7c3aed",
    content: `When you connect a cryptocurrency wallet (such as Phantom) to VeloxFi, your wallet's public address becomes visible to the Platform and is recorded on the Solana blockchain as part of any transaction you execute.

Wallet address handling:
• Your public wallet address is visible to other users in the context of battles and leaderboards
• Your wallet address is stored locally in your browser (localStorage) solely to enable automatic reconnection on your next visit — this data never leaves your device to our servers
• We do not collect or store your private keys, seed phrases, or any other sensitive wallet credentials under any circumstances
• Connecting your wallet does not grant VeloxFi any ability to initiate transactions on your behalf

You should never share your private keys, seed phrases, or recovery phrases with anyone, including VeloxFi. We will never ask for this information.`,
  },
  {
    id: "cookies",
    icon: <Cookie className="w-5 h-5" />,
    title: "4. Cookies & Local Storage",
    color: "#2563eb",
    content: `VeloxFi uses browser localStorage (not traditional cookies) to enhance your experience on the Platform. The following keys are stored locally in your browser:

• vfx_visitor_id — A randomly generated UUID used to count unique visitors. This identifier is stored permanently in your browser and is used only to ensure each browser is counted once. It is not linked to your identity.

• vfx_visitors — The visitor count, maintained locally.

• vfx_wallet_auto_connect — A flag (value: "1") that, when present, causes your wallet to automatically attempt reconnection when you return to the Platform. This is stored only if you have previously connected your wallet.

• vfx_sol_raised, vfx_wallets — Local demonstration data used for the presale progress display.

All localStorage data remains on your device and is not transmitted to VeloxFi servers. You may clear this data at any time through your browser's developer tools or settings.

We do not use tracking cookies, advertising cookies, or any third-party tracking technologies.`,
  },
  {
    id: "third-party",
    icon: <Link2 className="w-5 h-5" />,
    title: "5. Third Party Services",
    color: "#7c3aed",
    content: `VeloxFi integrates with certain third-party services to deliver its functionality. Your use of these services is subject to their respective privacy policies:

Solana Blockchain: All on-chain transactions are processed by the Solana network. Solana's public ledger is immutable and permanently records all transaction data.

Phantom Wallet: If you use Phantom to connect to VeloxFi, Phantom's collection and handling of your information is governed by Phantom's privacy policy at phantom.app.

Analytics providers: We may use privacy-respecting analytics tools to understand aggregate usage patterns. We do not use Google Analytics or other tools that track individual users across the web.

Content Delivery Networks (CDNs): We may use CDN services to serve static assets. CDN providers may log request metadata including IP addresses per their standard operating procedures.

VeloxFi is not responsible for the privacy practices of any third-party service. We encourage you to review the privacy policies of any third-party services you use in connection with our Platform.`,
  },
  {
    id: "contact",
    icon: <Mail className="w-5 h-5" />,
    title: "6. Contact & Data Requests",
    color: "#2563eb",
    content: `If you have questions about this Privacy Policy, wish to exercise any applicable data rights, or have concerns about how your information is handled, please contact us through our official channels:

Telegram: t.me/VeloxFiOfficial
X (Twitter): x.com/VeloxFi

Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data. To the extent VeloxFi holds any personal data about you (beyond on-chain data which is outside our control), we will respond to verified data subject requests within 30 days.

Please note that blockchain transaction data is public and immutable. We have no ability to alter, delete, or restrict access to data that has been recorded on the Solana blockchain.

This Privacy Policy was last updated in April 2026. We may update it from time to time. We will notify users of significant changes through our official communication channels.`,
  },
];

export default function Privacy() {
  const [, navigate] = useLocation();

  return (
    <div style={{ backgroundColor: "#05080f", minHeight: "100vh", color: "white" }}>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(5,8,15,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 transition-all duration-200 hover:opacity-80"
          style={{ color: "#6b7280" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-orbitron text-xs tracking-wider">BACK TO HOME</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
            <Swords className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-orbitron font-black text-sm tracking-wider gradient-text">VELOXFI</span>
        </div>
      </nav>

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-8"
            style={{ background: "#7c3aed" }}/>
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-5"
            style={{ background: "#2563eb" }}/>
        </div>
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-orbitron tracking-widest"
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
              <Lock className="w-3 h-3" />
              LEGAL
            </div>
          </div>
          <h1 className="font-orbitron font-black text-4xl md:text-5xl mb-4">
            PRIVACY <span className="gradient-text">POLICY</span>
          </h1>
          <p className="text-gray-500 font-orbitron text-xs tracking-widest">
            LAST UPDATED: APRIL 2026 &nbsp;·&nbsp; EFFECTIVE IMMEDIATELY
          </p>
        </div>
      </div>

      {/* ── INTRO BOX ── */}
      <div className="max-w-4xl mx-auto px-6 mb-10">
        <div className="rounded-2xl p-6"
          style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)" }}>
          <p className="text-gray-400 leading-relaxed text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            VeloxFi is a decentralized platform and is designed with privacy by default. We collect the minimum amount of information necessary to operate the Platform and never sell your data. This Privacy Policy explains what information we collect, how we use it, and your rights.
          </p>
        </div>
      </div>

      {/* ── DATA MINIMIZATION BADGE ── */}
      <div className="max-w-4xl mx-auto px-6 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Lock className="w-4 h-4" />, label: "No Data Sales", desc: "We never sell your data to third parties", color: "#2563eb" },
            { icon: <Wallet className="w-4 h-4" />, label: "Keys Stay Yours", desc: "We never collect private keys or seed phrases", color: "#7c3aed" },
            { icon: <Eye className="w-4 h-4" />, label: "Minimal Tracking", desc: "No cross-site trackers or ad networks", color: "#2563eb" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: `${item.color}0a`, border: `1px solid ${item.color}20` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${item.color}18`, color: item.color }}>
                {item.icon}
              </div>
              <div>
                <p className="font-orbitron text-xs font-bold tracking-wider text-white mb-1">{item.label}</p>
                <p className="text-xs text-gray-500" style={{ fontFamily: "Inter, sans-serif" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTIONS ── */}
      <div className="max-w-4xl mx-auto px-6 pb-24 space-y-6">
        {SECTIONS.map((s) => (
          <div
            key={s.id}
            id={s.id}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Section header */}
            <div className="flex items-center gap-4 px-6 py-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}30`, color: s.color }}>
                {s.icon}
              </div>
              <h2 className="font-orbitron font-bold text-base tracking-wide text-white">
                {s.title}
              </h2>
            </div>
            {/* Section body */}
            <div className="px-6 py-6">
              {s.content.split("\n\n").map((para, i) => (
                <p key={i} className="text-gray-400 leading-relaxed text-sm mb-4 last:mb-0 whitespace-pre-line"
                  style={{ fontFamily: "Inter, sans-serif" }}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* ── CONTACT CTA ── */}
        <div className="rounded-2xl p-8 text-center"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(37,99,235,0.08))", border: "1px solid rgba(37,99,235,0.2)" }}>
          <h3 className="font-orbitron font-bold text-lg mb-3 text-white">PRIVACY QUESTIONS?</h3>
          <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
            Contact us through our official channels and we'll respond within 30 days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://t.me/VeloxFiOfficial" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-orbitron tracking-wider transition-all duration-200 hover:opacity-80"
              style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.3)", color: "#60a5fa" }}>
              <ChevronRight className="w-4 h-4" /> TELEGRAM
            </a>
            <a href="https://x.com/VeloxFi" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-orbitron tracking-wider transition-all duration-200 hover:opacity-80"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}>
              <ChevronRight className="w-4 h-4" /> X (TWITTER)
            </a>
          </div>
        </div>

        {/* ── TERMS LINK ── */}
        <div className="text-center">
          <span className="text-gray-600 text-xs font-orbitron tracking-widest">ALSO SEE: </span>
          <button onClick={() => navigate("/terms")}
            className="text-xs font-orbitron tracking-widest transition-colors hover:text-purple-400"
            style={{ color: "#a78bfa" }}>
            TERMS OF SERVICE →
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t px-6 py-8 text-center"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <p className="text-xs text-gray-700 font-orbitron tracking-widest">
          © 2026 VELOXFI. ALL RIGHTS RESERVED. NOT FINANCIAL ADVICE.
        </p>
      </footer>
    </div>
  );
}
