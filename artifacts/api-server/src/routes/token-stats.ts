import { Router } from "express";

const router = Router();

const CA = "HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump";
const TTL = 60_000; // 60 second cache

interface TokenStats {
  price: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  holders: number;
  priceChange24h: number;
  supply: number;
  name: string;
  symbol: string;
  source: "dexscreener" | "pumpfun" | "fallback";
}

let cache: { data: TokenStats; at: number } | null = null;

// DexScreener: free, public, no key. Returns pairs across all DEXes the token trades on.
// We pick the pair with the highest USD liquidity as the canonical source.
async function fetchDexScreener(): Promise<TokenStats | null> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CA}`, {
      headers: { "User-Agent": "VeloxFi/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const d: any = await res.json();
    const pairs: any[] = Array.isArray(d?.pairs) ? d.pairs : [];
    if (pairs.length === 0) return null;

    const best = pairs.reduce((a, b) =>
      (b?.liquidity?.usd ?? 0) > (a?.liquidity?.usd ?? 0) ? b : a
    );

    const base = best?.baseToken ?? {};
    return {
      price:          Number(best?.priceUsd ?? 0),
      marketCap:      Number(best?.marketCap ?? best?.fdv ?? 0),
      volume24h:      Number(best?.volume?.h24 ?? 0),
      liquidity:      Number(best?.liquidity?.usd ?? 0),
      holders:        0, // DexScreener doesn't expose holder count
      priceChange24h: Number(best?.priceChange?.h24 ?? 0),
      supply:         1_000_000_000, // pump.fun standard
      name:           String(base?.name   ?? "BATTLE"),
      symbol:         String(base?.symbol ?? "BATTLE"),
      source:         "dexscreener",
    };
  } catch {
    return null;
  }
}

// Pump.fun internal API — undocumented and unstable, kept as a fallback.
async function fetchPumpFun(): Promise<TokenStats | null> {
  try {
    const res = await fetch(`https://frontend-api.pump.fun/coins/${CA}`, {
      headers: { "User-Agent": "VeloxFi/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const d: any = await res.json();
    return {
      price:          d.usd_market_cap && d.total_supply ? d.usd_market_cap / d.total_supply : 0,
      marketCap:      d.usd_market_cap ?? 0,
      volume24h:      d.volume ?? 0,
      liquidity:      0,
      holders:        d.holder_count ?? 0,
      priceChange24h: d.price_change_24h ?? 0,
      supply:         d.total_supply ?? 1_000_000_000,
      name:           d.name   ?? "BATTLE",
      symbol:         d.symbol ?? "BATTLE",
      source:         "pumpfun",
    };
  } catch {
    return null;
  }
}

router.get("/veloxfi/token-stats", async (_req, res) => {
  if (cache && Date.now() - cache.at < TTL) {
    return res.json(cache.data);
  }

  const fresh = (await fetchDexScreener()) ?? (await fetchPumpFun());

  if (fresh) {
    cache = { data: fresh, at: Date.now() };
    return res.json(fresh);
  }

  if (cache) return res.json(cache.data);

  return res.json({
    price: 0,
    marketCap: 0,
    volume24h: 0,
    liquidity: 0,
    holders: 0,
    priceChange24h: 0,
    supply: 1_000_000_000,
    name: "BATTLE",
    symbol: "BATTLE",
    source: "fallback",
  });
});

export default router;
