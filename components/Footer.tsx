import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#030610] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-orbitron font-black">V</div>
              <span className="font-orbitron font-black text-lg">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">VELOX</span>
                <span className="text-white">FI</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              The ultimate memecoin battle arena on Solana. Battle, win, and dominate.
            </p>
            <div className="flex gap-3">
              {['𝕏', 'Tg', 'DC'].map((s) => (
                <button key={s} className="w-8 h-8 rounded-lg border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all flex items-center justify-center text-xs text-gray-400 hover:text-white">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-orbitron font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2">
              {[
                { label: 'Live Battles', href: '/demo' },
                { label: 'Leaderboard', href: '/' },
                { label: 'How It Works', href: '/' },
                { label: 'Tokenomics', href: '/presale' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Token */}
          <div>
            <h4 className="font-orbitron font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Token</h4>
            <ul className="space-y-2">
              {[
                { label: 'Presale', href: '/presale' },
                { label: 'Roadmap', href: '/presale' },
                { label: 'Whitepaper', href: '#' },
                { label: 'Audit', href: '#' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-orbitron font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Risk Disclaimer'].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © 2025 VeloxFi. Built on Solana.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            All systems operational
          </div>
          <p className="text-xs text-gray-700 max-w-sm text-center sm:text-right">
            Trading memecoins involves significant risk. Never invest more than you can afford to lose.
          </p>
        </div>
      </div>
    </footer>
  )
}
