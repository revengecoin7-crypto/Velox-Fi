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

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      if (cached) { res.json(cached.data); return; }
      res.status(502).json({ error: "upstream error", status: upstream.status });
      return;
    }
    const data = await upstream.json();
    cache[ids] = { data, at: Date.now() };
    res.json(data);
  } catch (err) {
    if (cached) { res.json(cached.data); return; }
    res.status(502).json({ error: "failed to fetch prices" });
  }
});

export default router;
