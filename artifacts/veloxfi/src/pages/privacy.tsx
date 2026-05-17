import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Sidebar } from "@/components/Sidebar";

const SECTIONS = [
  {
    id: "collect", title: "1. Information we collect", icon: "🗄", color: "var(--cyan)",
    content: `VeloxFi is committed to minimizing the collection of personal data. As a decentralized platform, we are designed to operate with the least amount of personally identifiable information possible.

We may collect the following categories of information:

On-chain data: All blockchain transactions, wallet addresses, conversion records, and token transfers are publicly recorded on the Solana blockchain. This data is inherently public and cannot be made private.

Technical data: We automatically collect certain technical information when you visit our website, including your IP address, browser type and version, operating system, referral source, pages visited, and time spent on those pages. This is used solely for security, analytics, and service improvement.

Voluntarily provided data: If you contact us directly (e.g., via Telegram or email), we may retain the content of your message and any information you voluntarily provide in order to respond to your inquiry.`,
  },
  {
    id: "use", title: "2. How we use information", icon: "👁", color: "var(--lime)",
    content: `We use the information we collect for the following purposes:

Service delivery: To operate, maintain, and improve the VeloxFi platform, including mining mechanics, conversion processing, and user experience enhancements.

Security: To detect, investigate, and prevent fraudulent activity, unauthorized access attempts, and other malicious conduct that could harm the Platform or its users.

Analytics: To understand how users interact with the Platform in aggregate, enabling us to identify areas for improvement and measure the effectiveness of new features.

Legal compliance: To comply with applicable laws, regulations, and lawful requests from government authorities, including compliance with sanctions screening obligations.

Communication: To respond to user inquiries and, where you have opted in, to send you updates about Platform developments and new features.

We do not sell, rent, or trade your personal information to third parties for their marketing purposes.`,
  },
  {
    id: "wallet", title: "3. Wallet addresses", icon: "👛", color: "var(--magenta)",
    content: `When you connect a cryptocurrency wallet (such as Phantom) to VeloxFi, your wallet's public address becomes visible to the Platform and is recorded on the Solana blockchain as part of any transaction you execute.

Wallet address handling:
• Your public wallet address is visible to other users in the context of the leaderboard
• Your wallet address is stored locally in your browser (localStorage) solely to enable automatic reconnection on your next visit — this data never leaves your device to our servers
• We do not collect or store your private keys, seed phrases, or any other sensitive wallet credentials under any circumstances
• Connecting your wallet does not grant VeloxFi any ability to initiate transactions on your behalf

You should never share your private keys, seed phrases, or recovery phrases with anyone, including VeloxFi. We will never ask for this information.`,
  },
  {
    id: "cookies", title: "4. Cookies & local storage", icon: "🍪", color: "var(--yellow)",
    content: `VeloxFi uses browser localStorage (not traditional cookies) to enhance your experience on the Platform. Locally stored keys include:

• vfx_visitor_id — A randomly generated UUID used to count unique visitors. Not linked to your identity.
• vfx_session_v2 — Your authentication token so you stay signed in.
• vfx_users_v2 — Local user-state cache.
• vfx_analytics_v2 / vfx_live_v2 — Aggregate page events and live heartbeat.

All localStorage data remains on your device. You may clear it at any time through your browser's developer tools or settings.

We do not use tracking cookies, advertising cookies, or any third-party tracking technologies.`,
  },
  {
    id: "third-party", title: "5. Third-party services", icon: "🔗", color: "var(--cyan)",
    content: `VeloxFi integrates with certain third-party services to deliver its functionality. Your use of these services is subject to their respective privacy policies:

Solana Blockchain: All on-chain transactions are processed by the Solana network. Solana's public ledger is immutable and permanently records all transaction data.

Phantom Wallet: If you use Phantom to connect to VeloxFi, Phantom's collection and handling of your information is governed by Phantom's privacy policy at phantom.app.

DexScreener / pump.fun: Live price data is fetched from public DEX-aggregator APIs. We pass through only the contract address.

VeloxFi is not responsible for the privacy practices of any third-party service.`,
  },
  {
    id: "contact", title: "6. Contact & data requests", icon: "✉", color: "var(--magenta)",
    content: `If you have questions about this Privacy Policy, wish to exercise any applicable data rights, or have concerns about how your information is handled, please contact us through our official channels:

Telegram: t.me/VeloxFiOfficial
X (Twitter): x.com/Battle767629

Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data. To the extent VeloxFi holds any personal data about you (beyond on-chain data which is outside our control), we will respond to verified data subject requests within 30 days.

Please note that blockchain transaction data is public and immutable. We have no ability to alter, delete, or restrict access to data that has been recorded on the Solana blockchain.

This Privacy Policy was last updated in May 2026. We may update it from time to time. We will notify users of significant changes through our official communication channels.`,
  },
];

export default function Privacy() {
  usePageMeta({
    title: "Privacy Policy — VeloxFi",
    description: "Read the VeloxFi Privacy Policy. We collect minimal data, never sell it, and never access your private keys. Privacy by default.",
    canonical: "https://veloxfi.io/privacy",
  });

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          <div className="topbar">
            <div className="crumb">Home / <b>Privacy policy</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Privacy by default.</div>
            <span className="pill lavender">🔒 Legal</span>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-soft)" }}>
              VeloxFi is a decentralized platform designed with privacy by default. We collect the minimum amount of information necessary to operate, and never sell your data. This Privacy Policy explains what we collect, how we use it, and your rights.
            </p>
            <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 12 }}>Last updated: May 2026 · Effective immediately</div>
          </div>

          <div className="grid-3">
            {[
              { label: "🔒 No data sales",    desc: "We never sell your data to third parties",       color: "var(--cyan)" },
              { label: "🔑 Keys stay yours",  desc: "We never collect private keys or seed phrases",   color: "var(--magenta)" },
              { label: "👁 Minimal tracking", desc: "No cross-site trackers or ad networks",          color: "var(--lime)" },
            ].map(item => (
              <div key={item.label} className="card" style={{ padding: 16, background: item.color }}>
                <div className="display" style={{ fontSize: 14, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {SECTIONS.map(s => (
            <div key={s.id} id={s.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="row" style={{ padding: "14px 22px", background: s.color, borderBottom: "2.5px solid var(--ink)", gap: 12 }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--paper)", border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{s.icon}</span>
                <div className="display" style={{ fontSize: 18 }}>{s.title}</div>
              </div>
              <div style={{ padding: "16px 22px 20px" }}>
                {s.content.split("\n\n").map((para, i) => (
                  <p key={i} style={{ fontSize: 14, lineHeight: 1.7, color: "var(--ink-soft)", marginBottom: 12, whiteSpace: "pre-line" }}>{para}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="card cream" style={{ padding: 26, textAlign: "center" }}>
            <h3 className="display" style={{ fontSize: 22, margin: "0 0 6px" }}>🐺 Privacy questions?</h3>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 16 }}>Contact us through our official channels and we'll respond within 30 days.</p>
            <div className="row" style={{ gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <a className="btn lg" href="https://t.me/VeloxFiOfficial" target="_blank" rel="noreferrer">✈ Telegram</a>
              <Link href="/terms" className="btn lg">Terms of service →</Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
