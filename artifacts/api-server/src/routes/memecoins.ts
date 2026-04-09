import { Router } from "express";
import { setSharedCoins, isSharedCacheUsable, getSharedCoin } from "../lib/coinCache";
import { fetchFromBinance, FALLBACK_MEMECOIN_LIST } from "../lib/binanceFallback";

const router = Router();

const CG_MARKETS_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=meme-token&order=volume_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h";

interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

let cache: { data: MarketCoin[]; at: number } | null = null;
const TTL = 5 * 60_000; // 5 minutes

router.get("/memecoins", async (_req, res) => {
  if (cache && Date.now() - cache.at < TTL) {
    res.json(cache.data);
    return;
  }

  // --- Primary: CoinGecko ---
  try {
    const upstream = await fetch(CG_MARKETS_URL, { signal: AbortSignal.timeout(8000) });
    if (upstream.ok) {
      const data: MarketCoin[] = await upstream.json();
      const top10 = data
        .filter((c) => c.price_change_percentage_24h != null)
        .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
        .slice(0, 10);

      cache = { data: top10, at: Date.now() };

      const shared: Record<string, { usd: number; usd_24h_change: number; usd_24h_vol: number; usd_market_cap: number }> = {};
      for (const coin of data) {
        shared[coin.id] = {
          usd: coin.current_price,
          usd_24h_change: coin.price_change_percentage_24h ?? 0,
          usd_24h_vol: coin.total_volume ?? 0,
          usd_market_cap: coin.market_cap ?? 0,
        };
      }
      setSharedCoins(shared);
      res.json(top10);
      return;
    }
  } catch {}

  // --- Fallback: stale in-memory cache ---
  if (cache) {
    res.json(cache.data);
    return;
  }

  // --- Fallback: Binance.US prices for hardcoded coin list ---
  const ids = FALLBACK_MEMECOIN_LIST.map((c) => c.id);
  try {
    const binanceData = await fetchFromBinance(ids);
    if (binanceData && Object.keys(binanceData).length > 0) {
      const coins: MarketCoin[] = FALLBACK_MEMECOIN_LIST.map((meta) => {
        const p = binanceData[meta.id];
        return {
          id: meta.id,
          symbol: meta.symbol,
          name: meta.name,
          image: meta.image,
          current_price: p?.usd ?? 0,
          price_change_percentage_24h: p?.usd_24h_change ?? 0,
          market_cap: p?.usd_market_cap ?? 0,
          total_volume: p?.usd_24h_vol ?? 0,
        };
      }).filter((c) => c.current_price > 0);

      const top10 = coins
        .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
        .slice(0, 10);

      cache = { data: top10, at: Date.now() };

      const shared: Record<string, { usd: number; usd_24h_change: number; usd_24h_vol: number; usd_market_cap: number }> = {};
      for (const coin of top10) {
        shared[coin.id] = {
          usd: coin.current_price,
          usd_24h_change: coin.price_change_percentage_24h ?? 0,
          usd_24h_vol: coin.total_volume ?? 0,
          usd_market_cap: coin.market_cap ?? 0,
        };
      }
      setSharedCoins(shared);
      res.json(top10);
      return;
    }
  } catch {}

  // --- Last resort: stale shared disk cache ---
  if (isSharedCacheUsable()) {
    const coins: MarketCoin[] = FALLBACK_MEMECOIN_LIST.map((meta) => {
      const p = binanceCacheOrStale(meta.id);
      return {
        id: meta.id,
        symbol: meta.symbol,
        name: meta.name,
        image: meta.image,
        current_price: p?.usd ?? 0,
        price_change_percentage_24h: p?.usd_24h_change ?? 0,
        market_cap: p?.usd_market_cap ?? 0,
        total_volume: p?.usd_24h_vol ?? 0,
      };
    }).filter((c) => c.current_price > 0);

    if (coins.length) {
      res.json(coins.slice(0, 10));
      return;
    }
  }

  res.status(502).json({ error: "all upstream sources failed for memecoins" });
});

function binanceCacheOrStale(id: string) {
  return getSharedCoin(id) as { usd: number; usd_24h_change: number; usd_24h_vol: number; usd_market_cap: number } | undefined;
}

export default router;
