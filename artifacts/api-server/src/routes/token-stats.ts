import { Router } from "express";

const router = Router();

const CA = "HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump";
const TTL = 60_000; // 60 second cache

let cache: { data: TokenStats; at: number } | null = null;

interface TokenStats {
  price: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  priceChange24h: number;
  supply: number;
  name: string;
  symbol: string;
}

async function fetchPumpFun(): Promise<TokenStats | null> {
  try {
    const res = await fetch(`https://frontend-api.pump.fun/coins/${CA}`, {
      headers: { "User-Agent": "VeloxFi/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const d = await res.json();
    return {
      price: d.usd_market_cap && d.total_supply ? d.usd_market_cap / d.total_supply : 0,
      marketCap: d.usd_market_cap ?? 0,
      volume24h: d.volume ?? 0,
      holders: d.holder_count ?? 0,
      priceChange24h: d.price_change_24h ?? 0,
      supply: d.total_supply ?? 1_000_000_000,
      name: d.name ?? "BATTLE",
      symbol: d.symbol ?? "BATTLE",
    };
  } catch {
    return null;
  }
}

router.get("/veloxfi/token-stats", async (_req, res) => {
  // Serve cache if fresh
  if (cache && Date.now() - cache.at < TTL) {
    return res.json(cache.data);
  }

  const fresh = await fetchPumpFun();

  if (fresh) {
    cache = { data: fresh, at: Date.now() };
    return res.json(fresh);
  }

  // Fallback to stale cache or default values
  if (cache) return res.json(cache.data);

  return res.json({
    price: 0,
    marketCap: 0,
    volume24h: 0,
    holders: 0,
    priceChange24h: 0,
    supply: 1_000_000_000,
    name: "BATTLE",
    symbol: "BATTLE",
  });
});

export default router;
