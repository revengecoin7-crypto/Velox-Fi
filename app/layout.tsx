import type { Metadata } from 'next'
import { Orbitron, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'VeloxFi — Memecoin Battle Platform on Solana',
  description: 'The ultimate memecoin battle arena on Solana. Battle your favorite coins, stake positions, and win massive SOL prizes.',
  keywords: 'memecoin, battle, solana, crypto, defi, veloxfi',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable}`}>
      <body className="bg-[#05080f] text-white min-h-screen antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
