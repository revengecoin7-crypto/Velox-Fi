'use client'
import { useState } from 'react'

type Tab = 'dashboard' | 'battles' | 'users' | 'transactions' | 'settings'

const BATTLES = [
  { id: 'BT-001', pair: 'PEPE vs DOGE', status: 'live', players: 1247, prize: '24.5 SOL', started: '14:22', ends: '14:52' },
  { id: 'BT-002', pair: 'BONK vs WIF', status: 'live', players: 892, prize: '18.2 SOL', started: '14:30', ends: '14:48' },
  { id: 'BT-003', pair: 'POPCAT vs MYRO', status: 'live', players: 2103, prize: '31.7 SOL', started: '14:15', ends: '15:02' },
  { id: 'BT-004', pair: 'FLOKI vs SHIB', status: 'ending', players: 634, prize: '12.3 SOL', started: '14:40', ends: '14:45' },
  { id: 'BT-005', pair: 'SAMO vs CHEEMS', status: 'completed', players: 445, prize: '9.8 SOL', started: '13:55', ends: '14:25' },
  { id: 'BT-006', pair: 'MEME vs TURBO', status: 'scheduled', players: 0, prize: '20.0 SOL', started: '—', ends: '15:30' },
  { id: 'BT-007', pair: 'BOME vs BOOK', status: 'completed', players: 2891, prize: '52.1 SOL', started: '13:00', ends: '13:30' },
]

const USERS = [
  { addr: '7xKj...9mNp', battles: 47, wagered: '234.5 SOL', won: '287.2 SOL', pnl: '+52.7', joined: '2025-01-12', status: 'active' },
  { addr: 'Bx3m...4qRt', battles: 23, wagered: '98.2 SOL', won: '91.4 SOL', pnl: '-6.8', joined: '2025-02-03', status: 'active' },
  { addr: 'Nm7p...2wXz', battles: 112, wagered: '1247.8 SOL', won: '1398.3 SOL', pnl: '+150.5', joined: '2025-01-01', status: 'vip' },
  { addr: 'Kq9s...7vLm', battles: 8, wagered: '12.4 SOL', won: '0 SOL', pnl: '-12.4', joined: '2025-03-28', status: 'active' },
  { addr: 'Wr2t...8nKp', battles: 67, wagered: '445.1 SOL', won: '512.8 SOL', pnl: '+67.7', joined: '2025-01-20', status: 'active' },
  { addr: 'Px4f...1mQs', battles: 3, wagered: '5.5 SOL', won: '0 SOL', pnl: '-5.5', joined: '2025-03-31', status: 'new' },
]

const TXS = [
  { hash: '3xKm...p9Qs', type: 'stake', user: '7xKj...9mNp', amount: '2.5 SOL', battle: 'BT-001', time: '14:43:22', status: 'confirmed' },
  { hash: 'Bq7r...2mLk', type: 'payout', user: 'Nm7p...2wXz', amount: '15.2 SOL', battle: 'BT-007', time: '14:43:01', status: 'confirmed' },
  { hash: 'Km2x...8pWn', type: 'stake', user: 'Kq9s...7vLm', amount: '0.5 SOL', battle: 'BT-002', time: '14:42:57', status: 'confirmed' },
  { hash: 'Wx9t...3nRp', type: 'fee', user: 'PLATFORM', amount: '0.5 SOL', battle: 'BT-007', time: '14:42:55', status: 'confirmed' },
  { hash: 'Lp4q...7mKs', type: 'stake', user: 'Bx3m...4qRt', amount: '1.0 SOL', battle: 'BT-003', time: '14:42:44', status: 'pending' },
  { hash: 'Nt8m...2vQr', type: 'payout', user: 'Wr2t...8nKp', amount: '8.3 SOL', battle: 'BT-007', time: '14:42:38', status: 'confirmed' },
]

function Badge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    live: 'bg-green-500/15 text-green-400 border-green-500/30',
    ending: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    completed: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    scheduled: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    active: 'bg-green-500/15 text-green-400 border-green-500/30',
    new: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    vip: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    confirmed: 'bg-green-500/15 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    stake: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    payout: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    fee: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  }
  return (
    <span className={`text-[10px] font-orbitron font-bold px-2 py-0.5 rounded-full border ${styles[status] ?? 'bg-white/10 text-white'}`}>
      {status.toUpperCase()}
    </span>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '▤' },
    { id: 'battles', label: 'Battles', icon: '⚔️' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'transactions', label: 'Transactions', icon: '↔' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ]

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-white/[0.06] bg-[#030610] fixed top-16 bottom-0 left-0 z-40">
        <div className="p-4">
          <div className="text-[10px] font-orbitron text-gray-600 uppercase tracking-widest mb-3">Admin Panel</div>
          <nav className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  tab === t.id
                    ? 'bg-blue-600/20 text-white border border-blue-500/20'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{t.icon}</span>
                <span className="font-medium">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-gray-500">System Online</span>
          </div>
          <div className="text-[10px] text-gray-700 font-mono">v1.0.0-beta</div>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#030610] flex">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs transition-all ${
              tab === t.id ? 'text-blue-400' : 'text-gray-600'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-56 p-4 sm:p-6 pb-20 md:pb-6">

        {/* ─── DASHBOARD ─── */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-orbitron font-black text-2xl text-white">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-0.5">Overview · April 1, 2025</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-neon px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-orbitron text-xs font-bold transition-all"
              >
                + New Battle
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Volume (24h)', value: '$48,231', sub: '↑ +12.4%', color: 'text-blue-400' },
                { label: 'Active Battles', value: '247', sub: '4 ending soon', color: 'text-green-400' },
                { label: 'Platform Revenue (24h)', value: '48.2 SOL', sub: '0.2% fee', color: 'text-purple-400' },
                { label: 'Online Users', value: '18,432', sub: '↑ +342 today', color: 'text-yellow-400' },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                  <div className="text-[10px] text-gray-600 uppercase font-orbitron tracking-wider mb-2">{s.label}</div>
                  <div className={`font-orbitron font-black text-xl ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Two column: recent battles + top users */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="font-orbitron font-bold text-white text-sm">Recent Battles</h3>
                  <button onClick={() => setTab('battles')} className="text-xs text-blue-400 hover:text-blue-300">View all</button>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {BATTLES.slice(0, 5).map((b) => (
                    <div key={b.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white font-medium">{b.pair}</div>
                        <div className="text-xs text-gray-600 font-mono mt-0.5">{b.id}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-mono">{b.prize}</span>
                        <Badge status={b.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="font-orbitron font-bold text-white text-sm">Top Users</h3>
                  <button onClick={() => setTab('users')} className="text-xs text-blue-400 hover:text-blue-300">View all</button>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {USERS.slice(0, 5).map((u) => (
                    <div key={u.addr} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white font-mono">{u.addr}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{u.battles} battles</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono ${u.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{u.pnl} SOL</span>
                        <Badge status={u.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Create Battle', icon: '⚔️', action: () => setShowCreateModal(true) },
                { label: 'Export Report', icon: '📊', action: () => {} },
                { label: 'Pause All', icon: '⏸', action: () => {} },
                { label: 'Emergency Stop', icon: '🛑', action: () => {} },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={a.action}
                  className={`p-4 rounded-xl border text-center transition-all hover:scale-[1.02] ${
                    a.label === 'Emergency Stop'
                      ? 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10'
                      : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15'
                  }`}
                >
                  <div className="text-2xl mb-2">{a.icon}</div>
                  <div className="text-xs text-gray-400 font-medium">{a.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── BATTLES ─── */}
        {tab === 'battles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-orbitron font-black text-2xl text-white">Battles</h1>
                <p className="text-gray-500 text-sm mt-0.5">{BATTLES.length} total · {BATTLES.filter(b => b.status === 'live').length} live</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-neon px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-orbitron text-xs font-bold"
              >
                + Create Battle
              </button>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['ID', 'Battle', 'Status', 'Players', 'Prize Pool', 'Started', 'Ends', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-orbitron text-gray-600 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {BATTLES.map((b) => (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.id}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium">{b.pair}</td>
                        <td className="px-4 py-3"><Badge status={b.status} /></td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-300">{b.players.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-sm text-white">{b.prize}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.started}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.ends}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {b.status === 'live' && (
                              <button className="text-[10px] px-2 py-1 rounded border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-colors">Pause</button>
                            )}
                            {b.status === 'scheduled' && (
                              <button className="text-[10px] px-2 py-1 rounded border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors">Start</button>
                            )}
                            <button className="text-[10px] px-2 py-1 rounded border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-colors">View</button>
                            {b.status !== 'live' && (
                              <button className="text-[10px] px-2 py-1 rounded border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">Delete</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── USERS ─── */}
        {tab === 'users' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-orbitron font-black text-2xl text-white">Users</h1>
              <p className="text-gray-500 text-sm mt-0.5">18,432 registered · 247 online</p>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Wallet', 'Battles', 'Wagered', 'Won', 'P&L', 'Joined', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-orbitron text-gray-600 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {USERS.map((u) => (
                      <tr key={u.addr} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-mono text-sm text-blue-400">{u.addr}</td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-300">{u.battles}</td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-300">{u.wagered}</td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-300">{u.won}</td>
                        <td className={`px-4 py-3 font-mono text-sm font-bold ${u.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {u.pnl} SOL
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 font-mono">{u.joined}</td>
                        <td className="px-4 py-3"><Badge status={u.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="text-[10px] px-2 py-1 rounded border border-white/10 text-gray-500 hover:text-white transition-colors">View</button>
                            <button className="text-[10px] px-2 py-1 rounded border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">Ban</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TRANSACTIONS ─── */}
        {tab === 'transactions' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-orbitron font-black text-2xl text-white">Transactions</h1>
              <p className="text-gray-500 text-sm mt-0.5">Real-time on-chain activity</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-2">
              {[
                { label: 'Volume (24h)', value: '$48,231', sub: '2,847 txs' },
                { label: 'Fees Collected', value: '48.2 SOL', sub: '$4,823' },
                { label: 'Pending', value: '3', sub: 'txs' },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                  <div className="text-[10px] text-gray-600 uppercase font-orbitron tracking-wider mb-1.5">{s.label}</div>
                  <div className="font-orbitron font-black text-xl text-white">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.sub}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Hash', 'Type', 'User', 'Amount', 'Battle', 'Time', 'Status'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-orbitron text-gray-600 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {TXS.map((tx) => (
                      <tr key={tx.hash} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-blue-400 hover:text-blue-300 cursor-pointer">{tx.hash}</td>
                        <td className="px-4 py-3"><Badge status={tx.type} /></td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-400">{tx.user}</td>
                        <td className="px-4 py-3 font-mono text-sm text-white">{tx.amount}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{tx.battle}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{tx.time}</td>
                        <td className="px-4 py-3"><Badge status={tx.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── SETTINGS ─── */}
        {tab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="font-orbitron font-black text-2xl text-white">Settings</h1>
              <p className="text-gray-500 text-sm mt-0.5">Platform configuration</p>
            </div>

            {[
              {
                section: 'Battle Settings',
                fields: [
                  { label: 'Default Battle Duration', type: 'select', options: ['5 min', '10 min', '15 min', '30 min'], value: '10 min' },
                  { label: 'Min Stake (SOL)', type: 'number', value: '0.1' },
                  { label: 'Max Stake (SOL)', type: 'number', value: '100' },
                  { label: 'Platform Fee (%)', type: 'number', value: '0.2' },
                ],
              },
              {
                section: 'Platform',
                fields: [
                  { label: 'Platform Status', type: 'select', options: ['Online', 'Maintenance', 'Emergency Stop'], value: 'Online' },
                  { label: 'Max Concurrent Battles', type: 'number', value: '500' },
                  { label: 'New Battles Allowed', type: 'select', options: ['Yes', 'No'], value: 'Yes' },
                ],
              },
            ].map((section) => (
              <div key={section.section} className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/[0.06]">
                  <h3 className="font-orbitron font-bold text-white text-sm">{section.section}</h3>
                </div>
                <div className="p-5 space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.label} className="flex items-center justify-between gap-4">
                      <label className="text-sm text-gray-400 min-w-0 flex-1">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          defaultValue={field.value}
                          className="bg-[#05080f] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/50 w-40"
                        >
                          {field.options!.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type="number"
                          defaultValue={field.value}
                          className="bg-[#05080f] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/50 w-40 font-mono"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <button className="btn-neon px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-orbitron font-bold text-sm">
                Save Changes
              </button>
              <button className="px-6 py-2.5 rounded-xl border border-white/10 font-orbitron font-bold text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all">
                Reset to Defaults
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Create Battle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0d1a] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-orbitron font-bold text-white text-lg">Create Battle</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white text-xl transition-colors">×</button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Coin 1 (e.g. PEPE)', placeholder: 'PEPE' },
                { label: 'Coin 2 (e.g. DOGE)', placeholder: 'DOGE' },
                { label: 'Prize Pool (SOL)', placeholder: '10.0' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs text-gray-500 font-orbitron uppercase tracking-wider mb-1.5 block">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    className="w-full bg-[#05080f] border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50 text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 font-orbitron uppercase tracking-wider mb-1.5 block">Duration</label>
                <select className="w-full bg-[#05080f] border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50 text-sm">
                  <option>5 minutes</option>
                  <option>10 minutes</option>
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-neon flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-orbitron font-bold text-sm"
              >
                CREATE BATTLE
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
