import { Router } from "express";

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
  try {
    const upstream = await fetch(CG_MARKETS_URL);
    if (!upstream.ok) {
      if (cache) { res.json(cache.data); return; }
      res.status(502).json({ error: "upstream error", status: upstream.status });
      return;
    }
    const data: MarketCoin[] = await upstream.json();

    const top10 = data
      .filter((c) => c.price_change_percentage_24h !== null && c.price_change_percentage_24h !== undefined)
      .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
      .slice(0, 10);

    cache = { data: top10, at: Date.now() };
    res.json(top10);
  } catch (err) {
    if (cache) { res.json(cache.data); return; }
    res.status(502).json({ error: "failed to fetch memecoins" });
  }
});

export default router;
