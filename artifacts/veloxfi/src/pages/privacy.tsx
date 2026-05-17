import { useLocation } from "wouter";
import { Eye, Database, Wallet, Cookie, Link2, Mail, ChevronRight, Lock } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Sidebar } from "@/components/Sidebar";

const SECTIONS = [
  { id: "collect",     icon: <Database className="w-5 h-5" />, title: "1. Information We Collect",   color: "#2563eb", content: `VeloxFi is committed to minimizing the collection of personal data. As a decentralized platform, we are designed to operate with the least amount of personally identifiable information possible.\n\nWe may collect the following categories of information:\n\nOn-chain data: All blockchain transactions, wallet addresses, battle participation records, and token transfers are publicly recorded on the Solana blockchain. This data is inherently public and cannot be made private.\n\nTechnical data: We automatically collect certain technical information when you visit our website, including your IP address, browser type and version, operating system, referral source, pages visited, and time spent on those pages. This information is used solely for security, analytics, and service improvement purposes.\n\nVoluntarily provided data: If you contact us directly (e.g., via Telegram or email), we may retain the content of your message and any information you voluntarily provide in order to respond to your inquiry.` },
  { id: "use",         icon: <Eye className="w-5 h-5" />,      title: "2. How We Use Information",  color: "#3b82f6", content: `We use the information we collect for the following purposes:\n\nService delivery: To operate, maintain, and improve the VeloxFi platform, including battle mechanics, token distribution, and user experience enhancements.\n\nSecurity: To detect, investigate, and prevent fraudulent activity, unauthorized access attempts, and other malicious conduct that could harm the Platform or its users.\n\nAnalytics: To understand how users interact with the Platform in aggregate, enabling us to identify areas for improvement and measure the effectiveness of new features.\n\nLegal compliance: To comply with applicable laws, regulations, and lawful requests from government authorities, including compliance with sanctions screening obligations.\n\nCommunication: To respond to user inquiries and, where you have opted in, to send you updates about Platform developments, new features, and the $BATTLE presale.\n\nWe do not sell, rent, or trade your personal information to third parties for their marketing purposes.` },
  { id: "wallet",      icon: <Wallet className="w-5 h-5" />,   title: "3. Wallet Addresses",         color: "#7c3aed", content: `When you connect a cryptocurrency wallet (such as Phantom) to VeloxFi, your wallet's public address becomes visible to the Platform and is recorded on the Solana blockchain as part of any transaction you execute.\n\nWallet address handling:\n• Your public wallet address is visible to other users in the context of battles and leaderboards\n• Your wallet address is stored locally in your browser (localStorage) solely to enable automatic reconnection on your next visit — this data never leaves your device to our servers\n• We do not collect or store your private keys, seed phrases, or any other sensitive wallet credentials under any circumstances\n• Connecting your wallet does not grant VeloxFi any ability to initiate transactions on your behalf\n\nYou should never share your private keys, seed phrases, or recovery phrases with anyone, including VeloxFi. We will never ask for this information.` },
  { id: "cookies",     icon: <Cookie className="w-5 h-5" />,   title: "4. Cookies & Local Storage",  color: "#2563eb", content: `VeloxFi uses browser localStorage (not traditional cookies) to enhance your experience on the Platform. The following keys are stored locally in your browser:\n\n• vfx_visitor_id — A randomly generated UUID used to count unique visitors. This identifier is stored permanently in your browser and is used only to ensure each browser is counted once. It is not linked to your identity.\n\n• vfx_visitors — The visitor count, maintained locally.\n\n• vfx_wallet_auto_connect — A flag (value: "1") that, when present, causes your wallet to automatically attempt reconnection when you return to the Platform. This is stored only if you have previously connected your wallet.\n\n• vfx_sol_raised, vfx_wallets — Local demonstration data used for the presale progress display.\n\nAll localStorage data remains on your device and is not transmitted to VeloxFi servers. You may clear this data at any time through your browser's developer tools or settings.\n\nWe do not use tracking cookies, advertising cookies, or any third-party tracking technologies.` },
  { id: "third-party", icon: <Link2 className="w-5 h-5" />,    title: "5. Third Party Services",     color: "#7c3aed", content: `VeloxFi integrates with certain third-party services to deliver its functionality. Your use of these services is subject to their respective privacy policies:\n\nSolana Blockchain: All on-chain transactions are processed by the Solana network. Solana's public ledger is immutable and permanently records all transaction data.\n\nPhantom Wallet: If you use Phantom to connect to VeloxFi, Phantom's collection and handling of your information is governed by Phantom's privacy policy at phantom.app.\n\nAnalytics providers: We may use privacy-respecting analytics tools to understand aggregate usage patterns. We do not use Google Analytics or other tools that track individual users across the web.\n\nContent Delivery Networks (CDNs): We may use CDN services to serve static assets. CDN providers may log request metadata including IP addresses per their standard operating procedures.\n\nVeloxFi is not responsible for the privacy practices of any third-party service. We encourage you to review the privacy policies of any third-party services you use in connection with our Platform.` },
  { id: "contact",     icon: <Mail className="w-5 h-5" />,     title: "6. Contact & Data Requests",  color: "#2563eb", content: `If you have questions about this Privacy Policy, wish to exercise any applicable data rights, or have concerns about how your information is handled, please contact us through our official channels:\n\nTelegram: t.me/VeloxFiOfficial\nDiscord: discord.gg/u2UhxuTd\n\nDepending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data. To the extent VeloxFi holds any personal data about you (beyond on-chain data which is outside our control), we will respond to verified data subject requests within 30 days.\n\nPlease note that blockchain transaction data is public and immutable. We have no ability to alter, delete, or restrict access to data that has been recorded on the Solana blockchain.\n\nThis Privacy Policy was last updated in April 2026. We may update it from time to time. We will notify users of significant changes through our official communication channels.` },
];

export default function Privacy() {
  usePageMeta({
    title: "Privacy Policy — VeloxFi",
    description: "Read the VeloxFi Privacy Policy. We collect minimal data, never sell it, and never access your private keys. Privacy by default.",
    canonical: "https://veloxfi.io/#/privacy",
  });
  const [, navigate] = useLocation();

  return (
    <div className="app-shell"><Sidebar /><main style={{ minWidth: 0, background: "#FFFBF0" }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-orbitron tracking-widest"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.35)", color: "#a78bfa" }}>
            <Lock className="w-3.5 h-3.5" /> LEGAL
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <img src="/favicon.jpg" alt="VeloxFi Wolf" className="w-14 h-14 rounded-xl object-cover hidden md:block"
            style={{ border: "2px solid rgba(124,58,237,0.4)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }} />
          <h1 className="font-orbitron font-black text-4xl md:text-5xl">
            PRIVACY{" "}
            <span style={{ background: "linear-gradient(90deg,#a855f7,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>POLICY</span>
          </h1>
        </div>
        <p className="text-gray-500 font-orbitron text-xs tracking-widest">LAST UPDATED: APRIL 2026 · EFFECTIVE IMMEDIATELY</p>
      </div>

      {/* Intro */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="rounded-2xl p-6" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <p className="text-gray-400 leading-relaxed text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            VeloxFi is a decentralized platform and is designed with privacy by default. We collect the minimum amount of information necessary to operate the Platform and never sell your data. This Privacy Policy explains what information we collect, how we use it, and your rights.
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Lock className="w-4 h-4" />,   label: "🔒 No Data Sales",   desc: "We never sell your data to third parties",            color: "#2563eb" },
            { icon: <Wallet className="w-4 h-4" />, label: "🔑 Keys Stay Yours",  desc: "We never collect private keys or seed phrases",       color: "#7c3aed" },
            { icon: <Eye className="w-4 h-4" />,    label: "👁️ Minimal Tracking", desc: "No cross-site trackers or ad networks",              color: "#2563eb" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: `${item.color}0a`, border: `1px solid ${item.color}22` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${item.color}18`, color: item.color }}>{item.icon}</div>
              <div>
                <p className="font-orbitron text-xs font-bold tracking-wider text-white mb-1">{item.label}</p>
                <p className="text-xs text-gray-500" style={{ fontFamily: "Inter, sans-serif" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-5">
        {SECTIONS.map((s) => (
          <div key={s.id} id={s.id} className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}33`, color: s.color }}>{s.icon}</div>
              <h2 className="font-orbitron font-bold text-base tracking-wide text-white">{s.title}</h2>
            </div>
            <div className="px-6 py-5">
              {s.content.split("\n\n").map((para, i) => (
                <p key={i} className="text-gray-400 leading-relaxed text-sm mb-4 last:mb-0 whitespace-pre-line"
                  style={{ fontFamily: "Inter, sans-serif" }}>{para}</p>
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center"
          style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.08),rgba(37,99,235,0.08))", border: "1px solid rgba(37,99,235,0.22)" }}>
          <h3 className="font-orbitron font-bold text-lg mb-3 text-white">🐺 PRIVACY QUESTIONS?</h3>
          <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: "Inter, sans-serif" }}>Contact us through our official channels and we'll respond within 30 days.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://t.me/VeloxFiOfficial" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-orbitron tracking-wider transition-all hover:opacity-80"
              style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.3)", color: "#60a5fa" }}>
              <ChevronRight className="w-4 h-4" /> TELEGRAM
            </a>
          </div>
        </div>

        <div className="text-center">
          <span className="text-gray-600 text-xs font-orbitron tracking-widest">ALSO SEE: </span>
          <button onClick={() => navigate("/terms")}
            className="text-xs font-orbitron tracking-widest transition-colors hover:text-purple-400"
            style={{ color: "#a78bfa", background: "none", border: "none", cursor: "pointer" }}>
            TERMS OF SERVICE →
          </button>
        </div>
      </div>
    </main></div>
  );
}
