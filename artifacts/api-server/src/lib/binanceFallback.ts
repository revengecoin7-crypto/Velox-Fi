/**
 * Binance.US fallback for price data when CoinGecko is rate-limited.
 * Only includes symbols verified to exist on Binance.US.
 * Provides: price, 24h % change, 24h USD volume.
 * Does NOT provide: market cap (will be 0 or pulled from stale shared cache).
 */

// CoinGecko ID → Binance.US trading symbol (verified valid)
const BINANCE_MAP: Record<string, string> = {
  "dogecoin":       "DOGEUSD",    // Binance.US uses USD not USDT for DOGE
  "shiba-inu":      "SHIBUSDT",
  "pepe":           "PEPEUSDT",
  "bonk":           "BONKUSDT",
  "floki":          "FLOKIUSDT",
  "dogwifhat":      "WIFUSDT",
  "neiro-ethereum": "NEIROUSDT",
  "brett-based":    "BRETTUSDT",
  "popcat":         "POPCATUSDT",
  "turbo":          "TURBOUSDT",
};

// Reverse map: Binance symbol → CoinGecko ID
const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(BINANCE_MAP).map(([cgId, sym]) => [sym, cgId])
);

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

export interface PriceResult {
  usd: number;
  usd_24h_change: number;
  usd_24h_vol: number;
  usd_market_cap: number;
}

export async function fetchFromBinance(cgIds: string[]): Promise<Record<string, PriceResult> | null> {
  const symbols = cgIds
    .map((id) => BINANCE_MAP[id])
    .filter(Boolean);

  if (!symbols.length) return null;

  try {
    const encoded = encodeURIComponent(JSON.stringify(symbols));
    const url = `https://api.binance.us/api/v3/ticker/24hr?symbols=${encoded}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const tickers = (await res.json()) as BinanceTicker[];
    if (!Array.isArray(tickers) || !tickers.length) return null;

    const out: Record<string, PriceResult> = {};
    for (const t of tickers) {
      const cgId = REVERSE_MAP[t.symbol];
      if (!cgId) continue;
      out[cgId] = {
        usd: parseFloat(t.lastPrice) || 0,
        usd_24h_change: parseFloat(t.priceChangePercent) || 0,
        usd_24h_vol: parseFloat(t.quoteVolume) || 0,
        usd_market_cap: 0, // not available from Binance
      };
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

/** Hardcoded popular memecoins used when CoinGecko /memecoins is unavailable */
export const FALLBACK_MEMECOIN_LIST: Array<{
  id: string; symbol: string; name: string; image: string;
}> = [
  { id: "dogecoin",       symbol: "doge",  name: "Dogecoin",      image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
  { id: "shiba-inu",      symbol: "shib",  name: "Shiba Inu",     image: "https://assets.coingecko.com/coins/images/11939/large/shiba.png" },
  { id: "pepe",           symbol: "pepe",  name: "Pepe",          image: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg" },
  { id: "bonk",           symbol: "bonk",  name: "Bonk",          image: "https://assets.coingecko.com/coins/images/28600/large/bonk.jpg" },
  { id: "floki",          symbol: "floki", name: "FLOKI",         image: "https://assets.coingecko.com/coins/images/16746/large/PNG_image.png" },
  { id: "dogwifhat",      symbol: "wif",   name: "dogwifhat",     image: "https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg" },
  { id: "neiro-ethereum", symbol: "neiro", name: "Neiro",         image: "https://assets.coingecko.com/coins/images/39480/large/neiro200.png" },
  { id: "brett-based",    symbol: "brett", name: "Brett (Based)", image: "https://assets.coingecko.com/coins/images/35529/large/Brett.png" },
  { id: "popcat",         symbol: "popcat",name: "Popcat",        image: "https://assets.coingecko.com/coins/images/39024/large/popcat.png" },
  { id: "turbo",          symbol: "turbo", name: "Turbo",         image: "https://assets.coingecko.com/coins/images/29908/large/turbo.jpg" },
];
