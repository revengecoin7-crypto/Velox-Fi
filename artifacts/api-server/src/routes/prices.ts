import { Router } from "express";

const router = Router();

const DEFAULT_IDS = "pepe,bonk,dogecoin,shiba-inu,floki,brett-based";

let cache: Record<string, { data: unknown; at: number }> = {};
const TTL = 30_000;

router.get("/prices", async (req, res) => {
  const ids = typeof req.query.ids === "string" && req.query.ids
    ? req.query.ids
    : DEFAULT_IDS;

  const cached = cache[ids];
  if (cached && Date.now() - cached.at < TTL) {
    res.json(cached.data);
    return;
  }

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`;

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      if (cached) { res.json(cached.data); return; }
      res.status(502).json({ error: "upstream error", status: upstream.status });
      return;
    }
    const arr = await upstream.json() as Array<{
      id: string;
      current_price: number;
      price_change_percentage_24h: number;
      total_volume: number;
      market_cap: number;
    }>;
    const data: Record<string, {
      usd: number;
      usd_24h_change: number;
      usd_24h_vol: number;
      usd_market_cap: number;
    }> = {};
    for (const coin of arr) {
      data[coin.id] = {
        usd: coin.current_price,
        usd_24h_change: coin.price_change_percentage_24h ?? 0,
        usd_24h_vol: coin.total_volume ?? 0,
        usd_market_cap: coin.market_cap ?? 0,
      };
    }
    cache[ids] = { data, at: Date.now() };
    res.json(data);
  } catch (err) {
    if (cached) { res.json(cached.data); return; }
    res.status(502).json({ error: "failed to fetch prices" });
  }
});

export default router;
