import { useLocation } from "wouter";
import { ArrowLeft, Shield, Swords, FileText, AlertTriangle, Scale, Globe, Ban, RefreshCw, ChevronRight } from "lucide-react";

const SECTIONS = [
  {
    id: "acceptance",
    icon: <FileText className="w-5 h-5" />,
    title: "1. Acceptance of Terms",
    color: "#2563eb",
    content: `By accessing or using the VeloxFi platform, website, or any associated services (collectively, the "Platform"), you confirm that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must immediately cease all use of the Platform.

These Terms constitute a legally binding agreement between you ("User") and VeloxFi ("we," "us," or "our"). Your continued use of the Platform following any modifications to these Terms constitutes your acceptance of the revised Terms.

You must be of legal age in your jurisdiction to enter into binding contracts in order to use the Platform. By using the Platform, you represent and warrant that you meet this requirement.`,
  },
  {
    id: "use",
    icon: <Globe className="w-5 h-5" />,
    title: "2. Use of Platform",
    color: "#3b82f6",
    content: `VeloxFi provides a decentralized battle arena on the Solana blockchain where users may pit memecoins against each other in on-chain price competitions. The Platform is provided on an "as-is" and "as-available" basis.

You agree to use the Platform only for lawful purposes and in compliance with all applicable laws and regulations in your jurisdiction. You are solely responsible for ensuring that your use of the Platform is legal where you reside.

You must not:
• Attempt to gain unauthorized access to any part of the Platform or its infrastructure
• Use automated scripts, bots, or other tools to interact with the Platform without prior written consent
• Engage in any activity that disrupts, interferes with, or places an undue burden on the Platform
• Misrepresent your identity or affiliation with any person or entity
• Upload or transmit malicious code, viruses, or any other harmful software`,
  },
  {
    id: "token",
    icon: <Swords className="w-5 h-5" />,
    title: "3. $BATTLE Token",
    color: "#7c3aed",
    content: `The $BATTLE token is the native utility token of the VeloxFi ecosystem. $BATTLE tokens are used to participate in battles, pay platform fees, and access premium features within the Platform.

$BATTLE tokens are utility tokens and are not intended to constitute securities or investment products in any jurisdiction. The $BATTLE token does not represent ownership, equity, or any financial interest in VeloxFi or any affiliated entity.

Token purchases are final and non-refundable. Token values are volatile and subject to significant market fluctuation. Past performance of any token is not indicative of future results. VeloxFi makes no representation or warranty regarding the future value of $BATTLE tokens.

The $BATTLE presale is conducted on a first-come, first-served basis subject to applicable caps and allocation limits. VeloxFi reserves the right to modify presale terms, allocation amounts, and pricing at any time prior to the commencement of the presale.`,
  },
  {
    id: "battles",
    icon: <Shield className="w-5 h-5" />,
    title: "4. Battle Rules",
    color: "#2563eb",
    content: `Battles on VeloxFi are governed by smart contracts deployed on the Solana blockchain. Once a battle is initiated, the outcome is determined entirely by on-chain price data from verified oracle feeds.

By participating in a battle, you acknowledge and agree that:
• Battle results are final and determined by autonomous smart contract logic
• VeloxFi has no ability to reverse, modify, or cancel battle outcomes once initiated
• Network congestion, oracle delays, or blockchain forks may affect battle execution
• You are solely responsible for any losses incurred as a result of battle participation

Coin creation on the Platform is subject to VeloxFi's content policies. VeloxFi reserves the right to delist or remove any coin from the Platform that violates these policies, is associated with fraudulent activity, or is determined to pose a risk to users.

Battle fees are charged in $BATTLE tokens and are non-refundable. A portion of all battle fees is directed to the platform treasury and the $BATTLE token burn mechanism as described in the Whitepaper.`,
  },
  {
    id: "risk",
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "5. Risk Disclaimer",
    color: "#f59e0b",
    content: `CRYPTOCURRENCY AND DECENTRALIZED FINANCE ACTIVITIES INVOLVE SIGNIFICANT RISK. YOU MAY LOSE SOME OR ALL OF YOUR INVESTED CAPITAL. DO NOT INVEST MORE THAN YOU CAN AFFORD TO LOSE.

Specific risks include but are not limited to:
• Market risk: Token values can decline rapidly and without warning
• Smart contract risk: Despite audits, smart contracts may contain undiscovered vulnerabilities
• Liquidity risk: You may be unable to exit positions at desired prices
• Regulatory risk: Applicable laws may change, restricting or prohibiting your use of the Platform
• Technology risk: Blockchain networks may experience outages, forks, or attacks
• Oracle risk: Price feed data may be delayed, manipulated, or temporarily unavailable

VeloxFi does not provide financial, investment, legal, or tax advice. Nothing on this Platform constitutes a recommendation to buy, sell, or hold any digital asset. You should consult qualified professionals before making any financial decisions.`,
  },
  {
    id: "prohibited",
    icon: <Ban className="w-5 h-5" />,
    title: "6. Prohibited Users",
    color: "#ef4444",
    content: `THE PLATFORM IS NOT AVAILABLE TO RESIDENTS OF THE UNITED STATES OF AMERICA OR ANY U.S. TERRITORIES. BY USING THE PLATFORM, YOU CONFIRM THAT YOU ARE NOT LOCATED IN, INCORPORATED IN, OR A CITIZEN OR RESIDENT OF THE UNITED STATES.

Additionally, the Platform is not available to residents or citizens of any jurisdiction where cryptocurrency trading, DeFi activities, or digital asset transactions are prohibited or restricted by law, including but not limited to:
• Sanctioned countries as designated by OFAC or equivalent authorities
• Jurisdictions where the Platform's services would constitute unlicensed financial activity

VeloxFi reserves the right to implement geoblocking, KYC procedures, or other access restrictions at any time to ensure compliance with applicable laws. Attempting to circumvent geographic restrictions through VPNs or other means is a violation of these Terms.`,
  },
  {
    id: "liability",
    icon: <Scale className="w-5 h-5" />,
    title: "7. Limitation of Liability",
    color: "#7c3aed",
    content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, VELOXFI AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, PARTNERS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES.

This limitation applies regardless of the theory of liability (contract, tort, negligence, strict liability, or otherwise) and even if VeloxFi has been advised of the possibility of such damages. This includes, without limitation, damages for:
• Loss of profits, revenue, or data
• Business interruption
• Personal injury or property damage arising from your use of the Platform
• Unauthorized access to or alteration of your data or transmissions
• Conduct of any third party on or through the Platform

In jurisdictions that do not allow the exclusion or limitation of liability for consequential or incidental damages, our liability is limited to the maximum extent permitted by law.

You agree to indemnify, defend, and hold harmless VeloxFi and its affiliates from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of your use of the Platform or violation of these Terms.`,
  },
  {
    id: "changes",
    icon: <RefreshCw className="w-5 h-5" />,
    title: "8. Changes to Terms",
    color: "#2563eb",
    content: `VeloxFi reserves the right to modify, amend, or replace these Terms at any time at our sole discretion. We will notify users of material changes by updating the "Last Updated" date at the top of this page and, where appropriate, through announcements on our official communication channels.

It is your responsibility to review these Terms periodically. Your continued use of the Platform after any changes constitutes your acceptance of the new Terms.

If you have any questions regarding these Terms, please contact us through our official Telegram channel at t.me/VeloxFiOfficial or via our official X account at x.com/VeloxFi.

These Terms shall be governed by and construed in accordance with applicable law, without regard to conflict of law principles. Any disputes arising under these Terms shall be resolved through binding arbitration on an individual basis.`,
  },
];

export default function Terms() {
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
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-8"
            style={{ background: "#2563eb" }}/>
          <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-5"
            style={{ background: "#7c3aed" }}/>
        </div>
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-orbitron tracking-widest"
              style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", color: "#60a5fa" }}>
              <FileText className="w-3 h-3" />
              LEGAL
            </div>
          </div>
          <h1 className="font-orbitron font-black text-4xl md:text-5xl mb-4">
            TERMS OF <span className="gradient-text">SERVICE</span>
          </h1>
          <p className="text-gray-500 font-orbitron text-xs tracking-widest">
            LAST UPDATED: APRIL 2026 &nbsp;·&nbsp; EFFECTIVE IMMEDIATELY
          </p>
        </div>
      </div>

      {/* ── INTRO BOX ── */}
      <div className="max-w-4xl mx-auto px-6 mb-10">
        <div className="rounded-2xl p-6"
          style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)" }}>
          <p className="text-gray-400 leading-relaxed text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            Please read these Terms of Service carefully before using the VeloxFi platform. These Terms govern your access to and use of VeloxFi's services, including the battle arena, token presale, and all related features. By accessing the Platform you agree to be bound by these Terms.
          </p>
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
          style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))", border: "1px solid rgba(124,58,237,0.2)" }}>
          <h3 className="font-orbitron font-bold text-lg mb-3 text-white">QUESTIONS ABOUT THESE TERMS?</h3>
          <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
            Reach out through our official channels.
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

        {/* ── PRIVACY LINK ── */}
        <div className="text-center">
          <span className="text-gray-600 text-xs font-orbitron tracking-widest">ALSO SEE: </span>
          <button onClick={() => navigate("/privacy")}
            className="text-xs font-orbitron tracking-widest transition-colors hover:text-blue-400"
            style={{ color: "#60a5fa" }}>
            PRIVACY POLICY →
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
