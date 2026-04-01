'use client'
import { useState } from 'react'

const RAISED = 1247
const HARD_CAP = 2000
const SOFT_CAP = 500
const PRICE_PER_SOL = 10000
const TOTAL_SUPPLY = 1_000_000_000

const TOKENOMICS = [
  { label: 'Community & Rewards', pct: 40, color: '#2563eb' },
  { label: 'Presale', pct: 20, color: '#7c3aed' },
  { label: 'Liquidity Pool', pct: 15, color: '#06b6d4' },
  { label: 'Team (12m vest)', pct: 15, color: '#8b5cf6' },
  { label: 'Marketing', pct: 10, color: '#3b82f6' },
]

const ROADMAP = [
  {
    phase: 'Phase 1', title: 'Foundation', status: 'done', items: [
      'Smart contract development', 'Security audit by OtterSec', 'Website & brand launch', 'Community building (Discord/Twitter)',
    ],
  },
  {
    phase: 'Phase 2', title: 'Presale', status: 'active', items: [
      'Public presale launch', 'KOL partnerships', 'Exchange negotiations', 'Battle platform beta',
    ],
  },
  {
    phase: 'Phase 3', title: 'Launch', status: 'upcoming', items: [
      'DEX listing (Raydium, Orca)', 'Full battle platform launch', 'Battle tournaments', 'Mobile app (iOS/Android)',
    ],
  },
  {
    phase: 'Phase 4', title: 'Expansion', status: 'upcoming', items: [
      'Cross-chain battles', 'DAO governance', 'API for developers', 'CEX listings',
    ],
  },
]

const FAQ = [
  { q: 'What is VFI token used for?', a: 'VFI is the native utility token of VeloxFi. It\'s used to pay reduced battle fees, access exclusive tournaments, participate in governance votes, and earn staking rewards.' },
  { q: 'When does the presale end?', a: 'The presale runs until the hard cap of 2,000 SOL is reached or April 30, 2025, whichever comes first. Once the hard cap is reached, no more tokens will be sold at presale price.' },
  { q: 'How are presale tokens distributed?', a: 'Tokens are distributed immediately after the listing on Raydium. There is no vesting period for presale participants.' },
  { q: 'Is the smart contract audited?', a: 'Yes, the VeloxFi smart contracts have been audited by OtterSec. The audit report is publicly available on our GitHub.' },
  { q: 'What is the listing price?', a: 'The listing price will be 1 SOL = 7,500 VFI, a 25% premium over the presale price of 1 SOL = 10,000 VFI.' },
]

export default function PresalePage() {
  const [amount, setAmount] = useState('1')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [buying, setBuying] = useState(false)
  const [bought, setBought] = useState(false)

  const solAmount = parseFloat(amount) || 0
  const vfiAmount = solAmount * PRICE_PER_SOL
  const progress = (RAISED / HARD_CAP) * 100
  const remaining = HARD_CAP - RAISED

  const handleBuy = () => {
    if (solAmount <= 0) return
    setBuying(true)
    setTimeout(() => {
      setBuying(false)
      setBought(true)
    }, 2000)
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-purple-600/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              PRESALE LIVE · PHASE 2 OF 4
            </div>
            <h1 className="font-orbitron font-black text-4xl sm:text-6xl text-white mb-4">
              VFI TOKEN<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">PRESALE</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Get VFI tokens at the lowest possible price before public listing. Early holders receive exclusive battle bonuses and governance rights.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* Left col: buy form */}
          <div className="lg:col-span-2 space-y-4">

            {/* Progress card */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <div className="flex justify-between items-baseline mb-3">
                <span className="font-orbitron font-black text-white text-lg">{RAISED.toLocaleString()} SOL</span>
                <span className="text-gray-500 text-sm">/ {HARD_CAP.toLocaleString()} SOL</span>
              </div>

              <div className="h-3 rounded-full bg-gray-800 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full shimmer transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-xs mb-4">
                <span className="text-blue-400 font-mono">{progress.toFixed(1)}% filled</span>
                <span className="text-gray-500">{remaining} SOL remaining</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="text-[10px] text-gray-600 uppercase tracking-wider font-orbitron">Soft Cap</div>
                  <div className="font-mono font-bold text-green-400 mt-0.5">{SOFT_CAP} SOL ✓</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="text-[10px] text-gray-600 uppercase tracking-wider font-orbitron">Hard Cap</div>
                  <div className="font-mono font-bold text-white mt-0.5">{HARD_CAP} SOL</div>
                </div>
              </div>
            </div>

            {/* Token info */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-3">
              {[
                { label: 'Presale Price', value: '1 SOL = 10,000 VFI' },
                { label: 'Listing Price', value: '1 SOL = 7,500 VFI (+33%)' },
                { label: 'Total Supply', value: '1,000,000,000 VFI' },
                { label: 'Presale Allocation', value: '200,000,000 VFI (20%)' },
                { label: 'Min Purchase', value: '0.1 SOL' },
                { label: 'Max Purchase', value: '100 SOL' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-white/[0.04] last:border-0">
                  <span className="text-gray-500 text-sm">{r.label}</span>
                  <span className="font-mono text-white text-sm font-medium">{r.value}</span>
                </div>
              ))}
            </div>

            {/* Buy form */}
            {!bought ? (
              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
                <h3 className="font-orbitron font-bold text-white mb-4">BUY VFI TOKENS</h3>

                <label className="text-xs text-gray-500 font-orbitron uppercase tracking-wider mb-2 block">You Pay (SOL)</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-[#05080f] mb-2">
                  <span className="text-gray-400">◎</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-transparent text-white font-mono focus:outline-none text-lg"
                    placeholder="0.0"
                    min="0.1"
                    step="0.1"
                  />
                  <span className="text-gray-500 text-sm font-mono">SOL</span>
                </div>

                <div className="flex gap-2 mb-4">
                  {['0.5', '1', '5', '10'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(v)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                        amount === v ? 'border-purple-500/50 bg-purple-500/15 text-purple-300' : 'border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between py-3 border-t border-b border-white/[0.05] mb-4">
                  <span className="text-gray-400 text-sm">You Receive</span>
                  <span className="font-orbitron font-bold text-purple-400 text-lg">
                    {vfiAmount.toLocaleString()} VFI
                  </span>
                </div>

                {solAmount >= 5 && (
                  <div className="flex items-center gap-2 text-xs text-green-400 mb-3">
                    <span>🎁</span>
                    <span>Bonus: +{Math.floor(vfiAmount * 0.05).toLocaleString()} VFI (5% bonus for 5+ SOL)</span>
                  </div>
                )}

                <button
                  onClick={handleBuy}
                  disabled={buying || solAmount < 0.1}
                  className="btn-neon w-full py-4 rounded-xl font-orbitron font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  {buying ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      PROCESSING...
                    </span>
                  ) : 'BUY VFI TOKENS'}
                </button>

                <p className="text-center text-xs text-gray-600 mt-3">
                  Connect Phantom or Solflare wallet to participate
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <div className="font-orbitron font-bold text-green-400 text-lg mb-2">PURCHASE CONFIRMED!</div>
                <div className="text-gray-400 text-sm mb-1">You bought <span className="text-white font-bold">{vfiAmount.toLocaleString()} VFI</span></div>
                <div className="text-gray-500 text-xs">Tokens will be airdropped at TGE</div>
                <button onClick={() => setBought(false)} className="mt-4 text-xs text-gray-500 hover:text-white underline transition-colors">Buy more</button>
              </div>
            )}
          </div>

          {/* Right col */}
          <div className="lg:col-span-3 space-y-6">

            {/* Tokenomics */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <h3 className="font-orbitron font-black text-white text-xl mb-6">TOKENOMICS</h3>
              <div className="grid sm:grid-cols-2 gap-6 items-center">
                {/* Visual bar */}
                <div className="space-y-3">
                  {TOKENOMICS.map((t) => (
                    <div key={t.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{t.label}</span>
                        <span className="font-mono text-white">{t.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${t.pct}%`, backgroundColor: t.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="space-y-2.5">
                  {TOKENOMICS.map((t) => (
                    <div key={t.label} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: t.color }} />
                      <span className="text-gray-400 text-sm">{t.label}</span>
                      <span className="ml-auto font-mono text-white text-sm">{(TOTAL_SUPPLY * t.pct / 100 / 1_000_000).toFixed(0)}M</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Roadmap */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <h3 className="font-orbitron font-black text-white text-xl mb-6">ROADMAP</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {ROADMAP.map((r) => (
                  <div
                    key={r.phase}
                    className={`p-4 rounded-xl border ${
                      r.status === 'done' ? 'border-green-500/20 bg-green-500/5' :
                      r.status === 'active' ? 'border-blue-500/30 bg-blue-500/8' :
                      'border-white/[0.06] bg-white/[0.01]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-orbitron text-xs text-gray-500">{r.phase}</span>
                        <div className="font-orbitron font-bold text-white text-sm mt-0.5">{r.title}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-orbitron ${
                        r.status === 'done' ? 'bg-green-500/20 text-green-400' :
                        r.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-white/5 text-gray-500'
                      }`}>
                        {r.status === 'done' ? '✓ Done' : r.status === 'active' ? '⚡ Active' : '◦ Soon'}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {r.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
                          <span className={`mt-0.5 ${r.status === 'done' ? 'text-green-500' : r.status === 'active' ? 'text-blue-400' : 'text-gray-700'}`}>
                            {r.status === 'done' ? '✓' : '→'}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <h3 className="font-orbitron font-black text-white text-xl mb-4">FAQ</h3>
              <div className="space-y-2">
                {FAQ.map((item, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      openFaq === i ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/[0.06] bg-white/[0.01]'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                    >
                      <span className="font-medium text-sm text-white">{item.q}</span>
                      <span className={`ml-3 flex-shrink-0 text-gray-400 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>
                        +
                      </span>
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
