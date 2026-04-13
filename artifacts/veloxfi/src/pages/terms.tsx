import { useLocation } from "wouter";
import { FileText, AlertTriangle, Scale, Globe, Ban, RefreshCw, Shield, ChevronRight } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import MemeShell from "@/components/MemeShell";
import { Swords } from "lucide-react";

const SECTIONS = [
  { id: "acceptance", icon: <FileText className="w-5 h-5" />, title: "1. Acceptance of Terms", color: "#2563eb", content: `By accessing or using the VeloxFi platform, website, or any associated services (collectively, the "Platform"), you confirm that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must immediately cease all use of the Platform.\n\nThese Terms constitute a legally binding agreement between you ("User") and VeloxFi ("we," "us," or "our"). Your continued use of the Platform following any modifications to these Terms constitutes your acceptance of the revised Terms.\n\nYou must be of legal age in your jurisdiction to enter into binding contracts in order to use the Platform. By using the Platform, you represent and warrant that you meet this requirement.` },
  { id: "use", icon: <Globe className="w-5 h-5" />, title: "2. Use of Platform", color: "#3b82f6", content: `VeloxFi provides a decentralized battle arena on the Solana blockchain where users may pit memecoins against each other in on-chain price competitions. The Platform is provided on an "as-is" and "as-available" basis.\n\nYou agree to use the Platform only for lawful purposes and in compliance with all applicable laws and regulations in your jurisdiction. You are solely responsible for ensuring that your use of the Platform is legal where you reside.\n\nYou must not:\n• Attempt to gain unauthorized access to any part of the Platform or its infrastructure\n• Use automated scripts, bots, or other tools to interact with the Platform without prior written consent\n• Engage in any activity that disrupts, interferes with, or places an undue burden on the Platform\n• Misrepresent your identity or affiliation with any person or entity\n• Upload or transmit malicious code, viruses, or any other harmful software` },
  { id: "token", icon: <Swords className="w-5 h-5" />, title: "3. $BATTLE Token", color: "#7c3aed", content: `The $BATTLE token is the native utility token of the VeloxFi ecosystem. $BATTLE tokens are used to participate in battles, pay platform fees, and access premium features within the Platform.\n\n$BATTLE tokens are utility tokens and are not intended to constitute securities or investment products in any jurisdiction. The $BATTLE token does not represent ownership, equity, or any financial interest in VeloxFi or any affiliated entity.\n\nToken purchases are final and non-refundable. Token values are volatile and subject to significant market fluctuation. Past performance of any token is not indicative of future results. VeloxFi makes no representation or warranty regarding the future value of $BATTLE tokens.\n\nThe $BATTLE presale is conducted on a first-come, first-served basis subject to applicable caps and allocation limits. VeloxFi reserves the right to modify presale terms, allocation amounts, and pricing at any time prior to the commencement of the presale.` },
  { id: "battles", icon: <Shield className="w-5 h-5" />, title: "4. Battle Rules", color: "#2563eb", content: `Battles on VeloxFi are governed by smart contracts deployed on the Solana blockchain. Once a battle is initiated, the outcome is determined entirely by on-chain price data from verified oracle feeds.\n\nBy participating in a battle, you acknowledge and agree that:\n• Battle results are final and determined by autonomous smart contract logic\n• VeloxFi has no ability to reverse, modify, or cancel battle outcomes once initiated\n• Network congestion, oracle delays, or blockchain forks may affect battle execution\n• You are solely responsible for any losses incurred as a result of battle participation\n\nCoin creation on the Platform is subject to VeloxFi's content policies. VeloxFi reserves the right to delist or remove any coin from the Platform that violates these policies, is associated with fraudulent activity, or is determined to pose a risk to users.\n\nBattle fees are charged in $BATTLE tokens and are non-refundable. A portion of all battle fees is directed to the platform treasury and the $BATTLE token burn mechanism as described in the Whitepaper.` },
  { id: "risk", icon: <AlertTriangle className="w-5 h-5" />, title: "5. Risk Disclaimer", color: "#f59e0b", content: `CRYPTOCURRENCY AND DECENTRALIZED FINANCE ACTIVITIES INVOLVE SIGNIFICANT RISK. YOU MAY LOSE SOME OR ALL OF YOUR INVESTED CAPITAL. DO NOT INVEST MORE THAN YOU CAN AFFORD TO LOSE.\n\nSpecific risks include but are not limited to:\n• Market risk: Token values can decline rapidly and without warning\n• Smart contract risk: Despite audits, smart contracts may contain undiscovered vulnerabilities\n• Liquidity risk: You may be unable to exit positions at desired prices\n• Regulatory risk: Applicable laws may change, restricting or prohibiting your use of the Platform\n• Technology risk: Blockchain networks may experience outages, forks, or attacks\n• Oracle risk: Price feed data may be delayed, manipulated, or temporarily unavailable\n\nVeloxFi does not provide financial, investment, legal, or tax advice. Nothing on this Platform constitutes a recommendation to buy, sell, or hold any digital asset. You should consult qualified professionals before making any financial decisions.` },
  { id: "prohibited", icon: <Ban className="w-5 h-5" />, title: "6. Prohibited Users", color: "#ef4444", content: `THE PLATFORM IS NOT AVAILABLE TO RESIDENTS OF THE UNITED STATES OF AMERICA OR ANY U.S. TERRITORIES. BY USING THE PLATFORM, YOU CONFIRM THAT YOU ARE NOT LOCATED IN, INCORPORATED IN, OR A CITIZEN OR RESIDENT OF THE UNITED STATES.\n\nAdditionally, the Platform is not available to residents or citizens of any jurisdiction where cryptocurrency trading, DeFi activities, or digital asset transactions are prohibited or restricted by law, including but not limited to:\n• Sanctioned countries as designated by OFAC or equivalent authorities\n• Jurisdictions where the Platform's services would constitute unlicensed financial activity\n\nVeloxFi reserves the right to implement geoblocking, KYC procedures, or other access restrictions at any time to ensure compliance with applicable laws. Attempting to circumvent geographic restrictions through VPNs or other means is a violation of these Terms.` },
  { id: "liability", icon: <Scale className="w-5 h-5" />, title: "7. Limitation of Liability", color: "#7c3aed", content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, VELOXFI AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, PARTNERS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES.\n\nThis limitation applies regardless of the theory of liability (contract, tort, negligence, strict liability, or otherwise) and even if VeloxFi has been advised of the possibility of such damages. This includes, without limitation, damages for:\n• Loss of profits, revenue, or data\n• Business interruption\n• Personal injury or property damage arising from your use of the Platform\n• Unauthorized access to or alteration of your data or transmissions\n• Conduct of any third party on or through the Platform\n\nYou agree to indemnify, defend, and hold harmless VeloxFi and its affiliates from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of your use of the Platform or violation of these Terms.` },
  { id: "changes", icon: <RefreshCw className="w-5 h-5" />, title: "8. Changes to Terms", color: "#2563eb", content: `VeloxFi reserves the right to modify, amend, or replace these Terms at any time at our sole discretion. We will notify users of material changes by updating the "Last Updated" date at the top of this page and, where appropriate, through announcements on our official communication channels.\n\nIt is your responsibility to review these Terms periodically. Your continued use of the Platform after any changes constitutes your acceptance of the new Terms.\n\nIf you have any questions regarding these Terms, please contact us through our official Telegram channel at t.me/VeloxFiOfficial or via our official Discord at discord.gg/u2UhxuTd.\n\nThese Terms shall be governed by and construed in accordance with applicable law, without regard to conflict of law principles. Any disputes arising under these Terms shall be resolved through binding arbitration on an individual basis.` },
];

export default function Terms() {
  usePageMeta({
    title: "Terms of Service — VeloxFi",
    description: "Read the VeloxFi Terms of Service. Governs your use of the memecoin battle arena, $BATTLE token, presale, and all related platform features.",
    canonical: "https://veloxfi.io/#/terms",
  });
  const [, navigate] = useLocation();

  return (
    <MemeShell>
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-orbitron tracking-widest"
            style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.35)", color: "#60a5fa" }}>
            <FileText className="w-3.5 h-3.5" /> LEGAL
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <img src="/favicon.jpg" alt="VeloxFi Wolf" className="w-14 h-14 rounded-xl object-cover hidden md:block"
            style={{ border: "2px solid rgba(124,58,237,0.4)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }} />
          <h1 className="font-orbitron font-black text-4xl md:text-5xl">
            TERMS OF{" "}
            <span style={{ background: "linear-gradient(90deg,#60a5fa,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>SERVICE</span>
          </h1>
        </div>
        <p className="text-gray-500 font-orbitron text-xs tracking-widest">LAST UPDATED: APRIL 2026 · EFFECTIVE IMMEDIATELY</p>
      </div>

      {/* Intro */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="rounded-2xl p-6" style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)" }}>
          <p className="text-gray-400 leading-relaxed text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            Please read these Terms of Service carefully before using the VeloxFi platform. These Terms govern your access to and use of VeloxFi's services, including the battle arena, token presale, and all related features. By accessing the Platform you agree to be bound by these Terms.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-5">
        {SECTIONS.map((s) => (
          <div key={s.id} id={s.id} className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}33`, color: s.color }}>
                {s.icon}
              </div>
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
          style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.08),rgba(124,58,237,0.08))", border: "1px solid rgba(124,58,237,0.25)" }}>
          <h3 className="font-orbitron font-bold text-lg mb-3 text-white">🐺 QUESTIONS ABOUT THESE TERMS?</h3>
          <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: "Inter, sans-serif" }}>Reach out through our official channels.</p>
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
          <button onClick={() => navigate("/privacy")}
            className="text-xs font-orbitron tracking-widest transition-colors hover:text-blue-400"
            style={{ color: "#60a5fa", background: "none", border: "none", cursor: "pointer" }}>
            PRIVACY POLICY →
          </button>
        </div>
      </div>
    </MemeShell>
  );
}
