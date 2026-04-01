'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const BATTLES = [
  { id: 1, coin1: 'PEPE', coin2: 'DOGE', e1: '🐸', e2: '🐶', p1: 62, p2: 38, prize: '24.5', time: '02:34', players: 1247, hot: true },
  { id: 2, coin1: 'BONK', coin2: 'WIF', e1: '🔨', e2: '🎩', p1: 41, p2: 59, prize: '18.2', time: '01:12', players: 892, hot: false },
  { id: 3, coin1: 'POPCAT', coin2: 'MYRO', e1: '😸', e2: '🐕', p1: 55, p2: 45, prize: '31.7', time: '04:56', players: 2103, hot: true },
  { id: 4, coin1: 'FLOKI', coin2: 'SHIB', e1: '🦊', e2: '🐺', p1: 48, p2: 52, prize: '12.3', time: '00:45', players: 634, hot: false },
  { id: 5, coin1: 'SAMO', coin2: 'CHEEMS', e1: '🐕', e2: '🐩', p1: 71, p2: 29, prize: '9.8', time: '03:21', players: 445, hot: false },
  { id: 6, coin1: 'MEME', coin2: 'TURBO', e1: '😂', e2: '🏎️', p1: 33, p2: 67, prize: '45.1', time: '05:18', players: 3211, hot: true },
]

const LEADERBOARD = [
  { rank: 1, name: 'BONK', wins: 847, prize: '1,247.3', change: '+18.4%', up: true },
  { rank: 2, name: 'PEPE', wins: 723, prize: '982.1', change: '+12.7%', up: true },
  { rank: 3, name: 'WIF', wins: 651, prize: '871.4', change: '-3.2%', up: false },
  { rank: 4, name: 'DOGE', wins: 589, prize: '743.2', change: '+7.1%', up: true },
  { rank: 5, name: 'FLOKI', wins: 412, prize: '521.8', change: '+21.3%', up: true },
]

const STEPS = [
  { n: '01', title: 'Choose a Battle', desc: 'Browse live battles or create your own matchup between any Solana memecoins.', icon: '⚔️' },
  { n: '02', title: 'Pick Your Coin', desc: 'Stake SOL on the coin you think will win. The more you stake, the bigger your reward.', icon: '🎯' },
  { n: '03', title: 'Battle Begins', desc: 'Watch in real-time as votes pour in and live Pyth price feeds power the results.', icon: '⚡' },
  { n: '04', title: 'Winner Takes All', desc: 'Winners split the prize pool proportionally. Instant SPL payouts directly to your wallet.', icon: '🏆' },
]

function StatCard({ icon, value, label, sub, color }: { icon: string; value: string; label: string; sub: string; color: string }) {
  return (
    <div className="card-hover relative p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden group">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${color}`} />
      <div className="relative z-10">
        <div className="text-2xl mb-3">{icon}</div>
        <div className="font-orbitron font-black text-2xl sm:text-3xl text-white mb-1">{value}</div>
        <div className="text-sm text-gray-400 mb-1">{label}</div>
        <div className="text-xs text-green-400">{sub}</div>
      </div>
    </div>
  )
}

function BattleCard({ b }: { b: typeof BATTLES[0] }) {
  return (
    <div className="card-hover rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 hover:border-blue-500/25 group">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${b.hot ? 'text-orange-400 bg-orange-400/10' : 'text-gray-500 bg-white/5'}`}>
          {b.hot ? '🔥 HOT' : '⚡ LIVE'}
        </span>
        <span className="text-xs text-gray-500 font-mono">{b.players.toLocaleString()} players</span>
      </div>

      {/* VS layout */}
      <div className="grid grid-cols-3 items-center mb-4">
        <div className="text-center">
          <div className="text-4xl mb-2 group-hover:animate-float">{b.e1}</div>
          <div className="font-orbitron font-bold text-sm text-white">{b.coin1}</div>
          <div className="text-blue-400 font-mono font-bold text-xl mt-1">{b.p1}%</div>
        </div>
        <div className="text-center">
          <div className="font-orbitron font-black text-base text-gray-600">VS</div>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-2 group-hover:animate-float" style={{ animationDelay: '0.3s' }}>{b.e2}</div>
          <div className="font-orbitron font-bold text-sm text-white">{b.coin2}</div>
          <div className="text-purple-400 font-mono font-bold text-xl mt-1">{b.p2}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-gray-800/80 mb-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 battle-bar"
          style={{ width: `${b.p1}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wider">Prize Pool</div>
          <div className="font-orbitron font-bold text-white">{b.prize} SOL</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider">Time Left</div>
          <div className="font-mono font-bold text-yellow-400">{b.time}</div>
        </div>
        <Link
          href="/demo"
          className="btn-neon px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 font-orbitron text-xs font-bold hover:from-blue-500 hover:to-purple-500 transition-all"
        >
          JOIN →
        </Link>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [count, setCount] = useState(18432)

  useEffect(() => {
    const t = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 3)), 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <main className="min-h-screen">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 grid-bg">
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE ON SOLANA MAINNET · 247 BATTLES ACTIVE
          </div>

          {/* Main title */}
          <h1 className="font-orbitron font-black leading-none mb-6">
            <span className="block text-5xl sm:text-7xl md:text-8xl gradient-text">BATTLE.</span>
            <span className="block text-5xl sm:text-7xl md:text-8xl text-white">WIN.</span>
            <span className="block text-5xl sm:text-7xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">DOMINATE.</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            The ultimate memecoin battle arena on Solana. Pit your favorite coins against each other,
            stake SOL on the winner, and claim your share of the prize pool.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/demo" className="btn-neon px-8 py-4 rounded-xl font-orbitron font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02]">
              START BATTLING
            </Link>
            <Link href="/presale" className="btn-neon px-8 py-4 rounded-xl font-orbitron font-bold text-sm border border-white/15 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all hover:scale-[1.02]">
              JOIN PRESALE ✦
            </Link>
          </div>

          {/* Mini stats row */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              { v: '$12.4M', l: 'Total Volume' },
              { v: '247', l: 'Live Battles' },
              { v: `${count.toLocaleString()}`, l: 'Active Players' },
              { v: '0.2%', l: 'Platform Fee' },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="font-orbitron font-bold text-white">{s.v}</div>
                <div className="text-gray-600 text-xs">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-1.5 rounded-full bg-white/50 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── STAT CARDS ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="💰" value="$12.4M" label="Total Volume" sub="↑ +23.4% this week" color="bg-gradient-to-br from-blue-600/5 to-transparent" />
            <StatCard icon="⚔️" value="247" label="Active Battles" sub="Right now" color="bg-gradient-to-br from-red-600/5 to-transparent" />
            <StatCard icon="🏆" value="$1.2M" label="Prizes Distributed" sub="↑ All time" color="bg-gradient-to-br from-yellow-600/5 to-transparent" />
            <StatCard icon="👥" value={count.toLocaleString()} label="Active Players" sub="Online now" color="bg-gradient-to-br from-purple-600/5 to-transparent" />
          </div>
        </div>
      </section>

      {/* ─── LIVE BATTLES ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-orbitron font-black text-2xl sm:text-4xl text-white">LIVE BATTLES</h2>
              <p className="text-gray-500 text-sm mt-1">Join a battle and win prizes instantly</p>
            </div>
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="font-mono">{BATTLES.length} active</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BATTLES.map((b) => <BattleCard key={b.id} b={b} />)}
          </div>

          <div className="mt-8 text-center">
            <Link href="/demo" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 font-orbitron text-sm transition-all">
              View All Battles →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── LEADERBOARD + HOW IT WORKS ───────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10">

          {/* Leaderboard */}
          <div>
            <h2 className="font-orbitron font-black text-2xl sm:text-3xl text-white mb-1">TOP PERFORMERS</h2>
            <p className="text-gray-500 text-sm mb-6">This week&apos;s dominant coins</p>

            {/* Table header */}
            <div className="grid grid-cols-4 text-[10px] font-orbitron text-gray-600 uppercase tracking-widest px-4 mb-2">
              <span>Rank</span>
              <span>Coin</span>
              <span className="text-right">Prize (SOL)</span>
              <span className="text-right">7d</span>
            </div>

            <div className="space-y-2">
              {LEADERBOARD.map((item) => (
                <div key={item.rank} className="card-hover grid grid-cols-4 items-center p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:border-blue-500/20">
                  <div className={`font-orbitron font-black text-base ${
                    item.rank === 1 ? 'text-yellow-400' : item.rank === 2 ? 'text-gray-300' : item.rank === 3 ? 'text-orange-400' : 'text-gray-600'
                  }`}>
                    {item.rank <= 3 ? ['👑', '🥈', '🥉'][item.rank - 1] : `#${item.rank}`}
                  </div>
                  <div>
                    <div className="font-orbitron font-bold text-white text-sm">{item.name}</div>
                    <div className="text-[10px] text-gray-600">{item.wins} wins</div>
                  </div>
                  <div className="text-right font-mono text-sm text-white">{item.prize}</div>
                  <div className={`text-right text-xs font-mono ${item.up ? 'text-green-400' : 'text-red-400'}`}>
                    {item.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div>
            <h2 className="font-orbitron font-black text-2xl sm:text-3xl text-white mb-1">HOW IT WORKS</h2>
            <p className="text-gray-500 text-sm mb-6">Battle in 4 simple steps</p>

            <div className="space-y-4">
              {STEPS.map((s, i) => (
                <div key={s.n} className="card-hover flex gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:border-blue-500/20 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-orbitron text-xs text-blue-400">{s.n}</span>
                      <span className="font-orbitron font-bold text-white text-sm">{s.title}</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="absolute left-[2.5rem] mt-16 w-px h-4 bg-gradient-to-b from-blue-500/20 to-transparent hidden" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-white/10 overflow-hidden p-10 sm:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/8 to-purple-600/8" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-blue-600/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-1/4 w-60 h-40 bg-purple-600/20 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <div className="inline-block font-orbitron text-xs font-bold text-purple-400 border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 rounded-full mb-6">
                🚀 PRESALE NOW LIVE — 62% SOLD
              </div>
              <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white mb-4">
                READY TO BATTLE?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
                Join 18,000+ traders already battling. Get in early with our presale for exclusive benefits and bonus VFI tokens.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/demo" className="btn-neon px-8 py-4 rounded-xl font-orbitron font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/25 hover:scale-[1.02]">
                  TRY DEMO FREE
                </Link>
                <Link href="/presale" className="btn-neon px-8 py-4 rounded-xl font-orbitron font-bold text-sm border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/50 transition-all hover:scale-[1.02]">
                  JOIN PRESALE →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
