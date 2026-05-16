import { useEffect, useState } from "react";

export interface TokenStats {
  price: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  holders: number;
  priceChange24h: number;
  supply: number;
  name: string;
  symbol: string;
  source?: "dexscreener" | "pumpfun" | "fallback";
}

export function useTokenStats(refreshMs = 60_000) {
  const [stats, setStats] = useState<TokenStats | null>(null);
  useEffect(() => {
    const fetch_ = () =>
      fetch("/api/veloxfi/token-stats")
        .then(r => r.json())
        .then(setStats)
        .catch(() => {});
    fetch_();
    const id = setInterval(fetch_, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);
  return stats;
}

export function fmtPrice(n: number): string {
  if (n <= 0) return "$0.00";
  return n < 0.01 ? `$${n.toFixed(6)}` : `$${n.toFixed(4)}`;
}

export function fmtPctDelta(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}
