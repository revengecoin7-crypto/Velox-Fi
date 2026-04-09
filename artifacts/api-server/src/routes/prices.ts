import { Router } from "express";
import {
  getSharedCoin,
  isSharedCacheFresh,
  isSharedCacheUsable,
  setSharedCoins,
  type CoinPrice,
} from "../lib/coinCache";
import { fetchFromBinance } from "../lib/binanceFallback";

const router = Router();

const DEFAULT_IDS = "pepe,bonk,dogecoin,shiba-inu,floki,brett-based";

let cache: Record<string, { data: Record<string, CoinPrice>; at: number }> = {};
const TTL = 60_000;

/** Pull whatever we have in the shared cache for a list of IDs */
function fromSharedCache(ids: string[]): Record<string, CoinPrice> {
  const out: Record<string, CoinPrice> = {};
  for (const id of ids) {
    const c = getSharedCoin(id);
    if (c) out[id] = c;
  }
  return out;
}

router.get("/prices", async (req, res) => {
  const ids =
    typeof req.query.ids === "string" && req.query.ids
      ? req.query.ids
      : DEFAULT_IDS;

  const requested = ids.split(",").map((s) => s.trim()).filter(Boolean);

  // 1. Fresh shared cache — serve whatever we have (partial is OK for the frontend)
  if (isSharedCacheFresh()) {
    const subset = fromSharedCache(requested);
    if (Object.keys(subset).length > 0) {
      res.json(subset);
      return;
    }
  }

  // 2. Exact in-memory cache hit
  const exact = cache[ids];
  if (exact && Date.now() - exact.at < TTL) {
    res.json(exact.data);
    return;
  }

  // 3. Cross-cache lookup (partial is fine)
  for (const entry of Object.values(cache)) {
    if (Date.now() - entry.at < TTL) {
      const subset: Record<string, CoinPrice> = {};
      requested.forEach((id) => { if (entry.data[id]) subset[id] = entry.data[id]; });
      if (Object.keys(subset).length > 0) {
        res.json(subset);
        return;
      }
    }
  }

  // 4. Fetch from CoinGecko (primary source — has market cap)
  let data: Record<string, CoinPrice> | null = null;
  const cgUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`;

  try {
    const upstream = await fetch(cgUrl, { signal: AbortSignal.timeout(8000) });
    if (upstream.ok) {
      const arr = (await upstream.json()) as Array<{
        id: string; current_price: number; price_change_percentage_24h: number;
        total_volume: number; market_cap: number;
      }>;
      if (arr.length) {
        data = {};
        for (const coin of arr) {
          data[coin.id] = {
            usd: coin.current_price,
            usd_24h_change: coin.price_change_percentage_24h ?? 0,
            usd_24h_vol: coin.total_volume ?? 0,
            usd_market_cap: coin.market_cap ?? 0,
          };
        }
      }
    }
  } catch {}

  // 5. Binance.US fallback — merge with stale shared cache for market cap
  if (!data) {
    const binanceData = await fetchFromBinance(requested);
    if (binanceData && Object.keys(binanceData).length > 0) {
      // For coins where market_cap is 0 (Binance doesn't have it), pull from stale shared cache
      for (const id of requested) {
        if (binanceData[id] && binanceData[id].usd_market_cap === 0) {
          const stale = getSharedCoin(id);
          if (stale?.usd_market_cap) binanceData[id].usd_market_cap = stale.usd_market_cap;
        }
        // Fill in any coin Binance couldn't provide from stale cache
        if (!binanceData[id]) {
          const stale = getSharedCoin(id);
          if (stale) binanceData[id] = stale;
        }
      }
      data = binanceData as Record<string, CoinPrice>;
    }
  }

  if (data && Object.keys(data).length > 0) {
    cache[ids] = { data, at: Date.now() };
    setSharedCoins(data);
    res.json(data);
    return;
  }

  // 6. Stale shared cache as last resort (partial is OK)
  if (isSharedCacheUsable()) {
    const subset = fromSharedCache(requested);
    if (Object.keys(subset).length > 0) {
      res.json(subset);
      return;
    }
  }

  if (exact) { res.json(exact.data); return; }
  res.status(502).json({ error: "all upstream price sources failed" });
});

export default router;
