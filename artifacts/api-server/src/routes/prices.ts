import { Router } from "express";

const router = Router();

const CG_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=pepe,bonk,dogecoin,shiba-inu,floki,brett-based&vs_currencies=usd&include_24hr_change=true";

let cache: { data: unknown; at: number } | null = null;
const TTL = 30_000;

router.get("/prices", async (_req, res) => {
  if (cache && Date.now() - cache.at < TTL) {
    res.json(cache.data);
    return;
  }
  try {
    const upstream = await fetch(CG_URL);
    if (!upstream.ok) {
      res.status(502).json({ error: "upstream error", status: upstream.status });
      return;
    }
    const data = await upstream.json();
    cache = { data, at: Date.now() };
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "failed to fetch prices" });
  }
});

export default router;
