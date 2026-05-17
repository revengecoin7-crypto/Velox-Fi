import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Sidebar } from "@/components/Sidebar";

const SECTIONS = [
  { id: "acceptance", icon: "📄", color: "var(--cyan)",    title: "1. Acceptance of terms",
    content: `By accessing or using the VeloxFi platform, website, or any associated services (collectively, the "Platform"), you confirm that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must immediately cease all use of the Platform.\n\nThese Terms constitute a legally binding agreement between you ("User") and VeloxFi ("we," "us," or "our"). Your continued use of the Platform following any modifications to these Terms constitutes your acceptance of the revised Terms.\n\nYou must be of legal age in your jurisdiction to enter into binding contracts in order to use the Platform. By using the Platform, you represent and warrant that you meet this requirement.` },
  { id: "use",        icon: "🌐", color: "var(--cyan)",    title: "2. Use of platform",
    content: `VeloxFi provides a decentralized mining-and-conversion platform on the Solana blockchain. The Platform is provided on an "as-is" and "as-available" basis.\n\nYou agree to use the Platform only for lawful purposes and in compliance with all applicable laws and regulations in your jurisdiction. You are solely responsible for ensuring that your use of the Platform is legal where you reside.\n\nYou must not:\n• Attempt to gain unauthorized access to any part of the Platform or its infrastructure\n• Use automated scripts, bots, or other tools to interact with the Platform without prior written consent\n• Engage in any activity that disrupts, interferes with, or places an undue burden on the Platform\n• Misrepresent your identity or affiliation with any person or entity\n• Upload or transmit malicious code, viruses, or any other harmful software` },
  { id: "token",      icon: "⚔",  color: "var(--magenta)", title: "3. $BATTLE token",
    content: `$BATTLE is a freely tradeable Solana SPL token. It is a utility/meme token and is not intended to constitute a security or investment product in any jurisdiction. The $BATTLE token does not represent ownership, equity, or any financial interest in VeloxFi or any affiliated entity.\n\nToken purchases on third-party venues (such as pump.fun) are final and non-refundable. Token values are volatile and subject to significant market fluctuation. Past performance is not indicative of future results. VeloxFi makes no representation or warranty regarding the future value of $BATTLE.\n\nThe distribution pool on VeloxFi is capped at the $BATTLE the team has bought back on the open market and is non-custodial — conversion requests are processed when the pool has available supply, or queued on a waitlist otherwise.` },
  { id: "mining",     icon: "⛏",  color: "var(--lime)",    title: "4. Mining & conversion",
    content: `Mining sessions on VeloxFi are free and tracked server-side. Sessions run 4 hours, pay 1 WOLF per minute (240 WOLF max per session), and can be claimed and restarted indefinitely.\n\nWOLF tokens have no monetary value and do not exist on-chain. Converting WOLF to $BATTLE is a request made to the VeloxFi distribution pool — fulfilment depends on pool availability. Where the pool is depleted, your request is queued on a waitlist and processed in order when the pool refills. Your WOLF balance stays untouched while you wait.\n\nVeloxFi reserves the right to modify mining rates, session lengths, conversion rate, and pool cap at any time. Changes will be announced on the Platform and through official community channels.` },
  { id: "risk",       icon: "⚠",  color: "var(--yellow)",  title: "5. Risk disclaimer",
    content: `CRYPTOCURRENCY AND DECENTRALIZED FINANCE ACTIVITIES INVOLVE SIGNIFICANT RISK. YOU MAY LOSE SOME OR ALL OF YOUR INVESTED CAPITAL. DO NOT INVEST MORE THAN YOU CAN AFFORD TO LOSE.\n\nSpecific risks include but are not limited to:\n• Market risk — token values can decline rapidly and without warning\n• Smart contract risk — despite audits, smart contracts may contain undiscovered vulnerabilities\n• Liquidity risk — you may be unable to exit positions at desired prices\n• Regulatory risk — applicable laws may change, restricting or prohibiting your use of the Platform\n• Technology risk — blockchain networks may experience outages, forks, or attacks\n• Oracle/price-data risk — price feed data may be delayed, inaccurate, or temporarily unavailable\n\nVeloxFi does not provide financial, investment, legal, or tax advice. Nothing on this Platform constitutes a recommendation to buy, sell, or hold any digital asset. Consult qualified professionals before making any financial decisions.` },
  { id: "liability",  icon: "⚖",  color: "var(--lavender)",title: "6. Limitation of liability",
    content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, VELOXFI AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, PARTNERS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES.\n\nThis limitation applies regardless of the theory of liability (contract, tort, negligence, strict liability, or otherwise) and even if VeloxFi has been advised of the possibility of such damages. This includes, without limitation, damages for:\n• Loss of profits, revenue, or data\n• Business interruption\n• Personal injury or property damage arising from your use of the Platform\n• Unauthorized access to or alteration of your data or transmissions\n• Conduct of any third party on or through the Platform\n\nYou agree to indemnify, defend, and hold harmless VeloxFi and its affiliates from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of your use of the Platform or violation of these Terms.` },
  { id: "changes",    icon: "🔄", color: "var(--cyan)",    title: "7. Changes to terms",
    content: `VeloxFi reserves the right to modify, amend, or replace these Terms at any time at our sole discretion. We will notify users of material changes by updating the "Last Updated" date at the top of this page and, where appropriate, through announcements on our official communication channels.\n\nIt is your responsibility to review these Terms periodically. Your continued use of the Platform after any changes constitutes your acceptance of the new Terms.\n\nIf you have any questions regarding these Terms, please contact us through our official Telegram channel at t.me/VeloxFiOfficial.\n\nThese Terms shall be governed by and construed in accordance with applicable law, without regard to conflict of law principles. Any disputes arising under these Terms shall be resolved through binding arbitration on an individual basis.` },
];

export default function Terms() {
  usePageMeta({
    title: "Terms of Service — VeloxFi",
    description: "Read the VeloxFi Terms of Service. Governs your use of the mining platform, $BATTLE token conversions, and all related features.",
    canonical: "https://veloxfi.io/terms",
  });

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

          <div className="topbar">
            <div className="crumb">Home / <b>Terms of service</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Terms of service.</div>
            <span className="pill cyan">⚖ Legal</span>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-soft)" }}>
              Please read these Terms of Service carefully before using the VeloxFi platform. These Terms govern your access to and use of VeloxFi's services — mining, WOLF→$BATTLE conversion, and all related features. By accessing the Platform you agree to be bound by these Terms.
            </p>
            <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 12 }}>Last updated: May 2026 · Effective immediately</div>
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
            <h3 className="display" style={{ fontSize: 22, margin: "0 0 6px" }}>🐺 Questions about these terms?</h3>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 16 }}>Reach out through our official channels.</p>
            <div className="row" style={{ gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <a className="btn lg" href="https://t.me/VeloxFiOfficial" target="_blank" rel="noreferrer">✈ Telegram</a>
              <Link href="/privacy" className="btn lg">Privacy policy →</Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
