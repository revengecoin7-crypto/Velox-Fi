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
  source: "jupiter" | "dexscreener" | "pumpfun" | "fallback";
}

let cache: { data: TokenStats; at: number } | null = null;

// Jupiter token search: works for pump.fun bonding-curve tokens BEFORE they
// migrate to Raydium (which is when DexScreener finally picks them up). Free,
// no key, returns price + mcap + liquidity + holders in a single call.
async function fetchJupiter(): Promise<TokenStats | null> {
  try {
    const res = await fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${CA}`, {
      headers: { "User-Agent": "VeloxFi/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const arr: any = await res.json();
    const t = Array.isArray(arr) ? arr.find((x: any) => x?.id === CA) ?? arr[0] : null;
    if (!t || !t.usdPrice) return null;
    return {
      price:          Number(t.usdPrice ?? 0),
      marketCap:      Number(t.mcap ?? t.fdv ?? 0),
      volume24h:      0, // Jupiter v2 doesn't expose 24h volume
      liquidity:      Number(t.liquidity ?? 0),
      holders:        Number(t.holderCount ?? 0),
      priceChange24h: 0, // Jupiter v2 doesn't expose 24h price change
      supply:         Number(t.totalSupply ?? t.circSupply ?? 1_000_000_000),
      name:           String(t.name   ?? "BATTLE"),
      symbol:         String(t.symbol ?? "BATTLE"),
      source:         "jupiter",
    };
  } catch {
    return null;
  }
}

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

  // Try DexScreener first (richest data — has 24h volume + price change). If
  // it returns null the token hasn't migrated to Raydium yet, so fall back to
  // Jupiter which covers pump.fun bonding-curve tokens. pump.fun's own API
  // (fetchPumpFun) is currently dead; kept as last resort.
  const fresh = (await fetchDexScreener()) ?? (await fetchJupiter()) ?? (await fetchPumpFun());

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
