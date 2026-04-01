'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const BATTLES = [
  { id: 1, coin1: 'PEPE', coin2: 'DOGE', e1: '🐸', e2: '🐶', prize: 24.5, duration: 300 },
  { id: 2, coin1: 'BONK', coin2: 'WIF', e1: '🔨', e2: '🎩', prize: 18.2, duration: 180 },
  { id: 3, coin1: 'POPCAT', coin2: 'MYRO', e1: '😸', e2: '🐕', prize: 31.7, duration: 420 },
]

const FEED = [
  { user: '7xKj...9mNp', action: 'voted PEPE', amount: '2.5 SOL', time: '2s ago' },
  { user: 'Bx3m...4qRt', action: 'voted DOGE', amount: '1.0 SOL', time: '5s ago' },
  { user: 'Nm7p...2wXz', action: 'voted BONK', amount: '5.0 SOL', time: '8s ago' },
  { user: 'Kq9s...7vLm', action: 'voted WIF', amount: '0.5 SOL', time: '12s ago' },
  { user: 'Wr2t...8nKp', action: 'voted PEPE', amount: '3.2 SOL', time: '15s ago' },
  { user: 'Px4f...1mQs', action: 'voted POPCAT', amount: '1.8 SOL', time: '18s ago' },
]

export default function DemoPage() {
  const [selected, setSelected] = useState(BATTLES[0])
  const [voted, setVoted] = useState<null | 'coin1' | 'coin2'>(null)
  const [stakeAmount, setStakeAmount] = useState('1.0')
  const [pct1, setPct1] = useState(55)
  const [timeLeft, setTimeLeft] = useState(selected.duration)
  const [feed, setFeed] = useState(FEED)
  const [betConfirmed, setBetConfirmed] = useState(false)
  const [totalVotes, setTotalVotes] = useState(1247)

  useEffect(() => {
    setTimeLeft(selected.duration)
    setVoted(null)
    setBetConfirmed(false)
    setPct1(55)
  }, [selected])

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(t)
  }, [selected])

  useEffect(() => {
    const t = setInterval(() => {
      const delta = (Math.random() - 0.48) * 2
      setPct1((p) => Math.max(15, Math.min(85, p + delta)))
      setTotalVotes((v) => v + Math.floor(Math.random() * 4))
    }, 1500)
    return () => clearInterval(t)
  }, [])

  const handleVote = useCallback((side: 'coin1' | 'coin2') => {
    setVoted(side)
    setBetConfirmed(true)
    const newEntry = {
      user: 'You',
      action: `voted ${side === 'coin1' ? selected.coin1 : selected.coin2}`,
      amount: `${stakeAmount} SOL`,
      time: 'just now',
    }
    setFeed((f) => [newEntry, ...f.slice(0, 5)])
  }, [selected, stakeAmount])

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')
  const pct2 = 100 - Math.round(pct1)
  const p1 = Math.round(pct1)

  const potentialWin = voted
    ? (parseFloat(stakeAmount) * (selected.prize / (selected.prize * (voted === 'coin1' ? p1 : pct2) / 100))).toFixed(2)
    : '0.00'

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Demo disclaimer */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs mb-8">
          <span className="text-base">⚠️</span>
          <span>This is a demo — no real SOL is used. Connect a wallet to battle on mainnet.</span>
          <Link href="/presale" className="ml-auto text-yellow-300 underline underline-offset-2 hover:no-underline whitespace-nowrap">Join Presale →</Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Battle selector */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="font-orbitron font-black text-lg text-white">SELECT BATTLE</h2>
            {BATTLES.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelected(b)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected.id === b.id
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-orbitron font-bold text-white text-sm">
                    {b.e1} {b.coin1} vs {b.coin2} {b.e2}
                  </div>
                  {selected.id === b.id && (
                    <span className="text-[10px] text-blue-400 font-orbitron">ACTIVE</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">Prize: {b.prize} SOL</div>
              </button>
            ))}

            {/* Live feed */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="font-orbitron text-xs text-gray-400 font-bold">LIVE ACTIVITY</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {feed.map((item, i) => (
                  <div key={i} className={`px-4 py-3 text-xs ${i === 0 && item.user === 'You' ? 'bg-blue-500/5' : ''}`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`font-mono ${item.user === 'You' ? 'text-blue-400' : 'text-gray-500'}`}>{item.user}</span>
                      <span className="text-gray-600">{item.time}</span>
                    </div>
                    <div className="text-gray-400">
                      <span>{item.action}</span>
                      <span className="text-green-400 ml-1">+{item.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Battle arena */}
          <div className="lg:col-span-2 space-y-4">
            {/* Arena */}
            <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute top-0 right-1/4 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

              {/* Header */}
              <div className="relative flex items-center justify-between mb-6">
                <div>
                  <span className="font-orbitron font-black text-xl text-white">BATTLE ARENA</span>
                  <div className="text-xs text-gray-500 mt-0.5">{totalVotes.toLocaleString()} total votes</div>
                </div>
                <div className="text-center">
                  <div className="font-orbitron font-black text-2xl text-yellow-400">{minutes}:{seconds}</div>
                  <div className="text-[10px] text-gray-600 uppercase">Time Remaining</div>
                </div>
                <div className="text-right">
                  <div className="font-orbitron font-black text-xl text-white">{selected.prize} SOL</div>
                  <div className="text-[10px] text-gray-600 uppercase">Prize Pool</div>
                </div>
              </div>

              {/* Coins */}
              <div className="grid grid-cols-3 items-center gap-4 mb-6">
                {/* Coin 1 */}
                <div className={`text-center p-4 sm:p-6 rounded-xl border transition-all ${
                  voted === 'coin1'
                    ? 'border-blue-500/60 bg-blue-500/15 ring-pulse'
                    : voted === 'coin2'
                      ? 'border-white/[0.04] opacity-60'
                      : 'border-white/[0.07] hover:border-blue-500/30'
                }`}>
                  <div className="text-5xl sm:text-6xl mb-3">{selected.e1}</div>
                  <div className="font-orbitron font-black text-lg text-white mb-1">{selected.coin1}</div>
                  <div className="font-orbitron text-2xl sm:text-3xl text-blue-400 font-black">{p1}%</div>
                  {voted === 'coin1' && (
                    <div className="mt-2 text-xs text-blue-300 font-orbitron">✓ YOUR PICK</div>
                  )}
                </div>

                {/* VS divider */}
                <div className="text-center">
                  <div className="font-orbitron font-black text-2xl text-gray-600 mb-2">VS</div>
                  <div className="text-2xl">⚔️</div>
                </div>

                {/* Coin 2 */}
                <div className={`text-center p-4 sm:p-6 rounded-xl border transition-all ${
                  voted === 'coin2'
                    ? 'border-purple-500/60 bg-purple-500/15 ring-pulse'
                    : voted === 'coin1'
                      ? 'border-white/[0.04] opacity-60'
                      : 'border-white/[0.07] hover:border-purple-500/30'
                }`}>
                  <div className="text-5xl sm:text-6xl mb-3">{selected.e2}</div>
                  <div className="font-orbitron font-black text-lg text-white mb-1">{selected.coin2}</div>
                  <div className="font-orbitron text-2xl sm:text-3xl text-purple-400 font-black">{pct2}%</div>
                  {voted === 'coin2' && (
                    <div className="mt-2 text-xs text-purple-300 font-orbitron">✓ YOUR PICK</div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-4 rounded-full bg-gray-800/80 mb-2 overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out shimmer"
                  style={{ width: `${p1}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-600 font-mono mb-6">
                <span>{selected.coin1} {p1}%</span>
                <span>{pct2}% {selected.coin2}</span>
              </div>

              {/* Stake + Vote */}
              {!betConfirmed ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 font-orbitron uppercase tracking-wider mb-2 block">Stake Amount (SOL)</label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03]">
                        <span className="text-gray-500 text-sm">◎</span>
                        <input
                          type="number"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          className="flex-1 bg-transparent text-white font-mono focus:outline-none text-sm"
                          step="0.1"
                          min="0.1"
                        />
                      </div>
                      {['0.5', '1', '2', '5'].map((v) => (
                        <button
                          key={v}
                          onClick={() => setStakeAmount(v)}
                          className="px-2.5 py-1 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-xs font-mono transition-all"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleVote('coin1')}
                      className="btn-neon py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 font-orbitron font-bold text-sm hover:from-blue-500 hover:to-blue-400 transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20"
                    >
                      VOTE {selected.e1} {selected.coin1}
                    </button>
                    <button
                      onClick={() => handleVote('coin2')}
                      className="btn-neon py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 font-orbitron font-bold text-sm hover:from-purple-500 hover:to-purple-400 transition-all hover:scale-[1.02] shadow-lg shadow-purple-500/20"
                    >
                      VOTE {selected.e2} {selected.coin2}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5 text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <div className="font-orbitron font-bold text-green-400 mb-1">VOTE PLACED!</div>
                  <div className="text-gray-400 text-sm">
                    You staked <span className="text-white font-mono">{stakeAmount} SOL</span> on{' '}
                    <span className="text-white font-bold">{voted === 'coin1' ? `${selected.e1} ${selected.coin1}` : `${selected.e2} ${selected.coin2}`}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    Potential win: <span className="font-orbitron font-bold text-yellow-400">{potentialWin} SOL</span>
                  </div>
                  <button
                    onClick={() => { setVoted(null); setBetConfirmed(false) }}
                    className="mt-4 text-xs text-gray-500 hover:text-white underline underline-offset-2 transition-colors"
                  >
                    Change vote
                  </button>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Your Stake', value: betConfirmed ? `${stakeAmount} SOL` : '—', color: 'text-white' },
                { label: 'Potential Win', value: betConfirmed ? `${potentialWin} SOL` : '—', color: 'text-green-400' },
                { label: 'Time Remaining', value: `${minutes}:${seconds}`, color: 'text-yellow-400' },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] text-center">
                  <div className="text-[10px] text-gray-600 uppercase tracking-wider font-orbitron mb-1">{s.label}</div>
                  <div className={`font-orbitron font-bold text-lg ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="p-5 rounded-xl border border-purple-500/20 bg-purple-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="font-orbitron font-bold text-white text-sm mb-0.5">Want to battle with real SOL?</div>
                <div className="text-gray-500 text-xs">Join the presale to get early access + bonus VFI tokens</div>
              </div>
              <Link href="/presale" className="btn-neon px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all whitespace-nowrap">
                JOIN PRESALE →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
