import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.join(__dirname, "../../../cache/coins.json");

export interface CoinPrice {
  usd: number;
  usd_24h_change: number;
  usd_24h_vol: number;
  usd_market_cap: number;
}

interface PersistedCache {
  data: Record<string, CoinPrice>;
  at: number;
}

// Load from disk on startup so we have data immediately even after server restarts
function loadFromDisk(): PersistedCache {
  try {
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(raw) as PersistedCache;
  } catch {
    return { data: {}, at: 0 };
  }
}

function saveToDisk(cache: PersistedCache) {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
  } catch {}
}

let sharedCache: PersistedCache = loadFromDisk();

const LIVE_TTL   = 5 * 60_000;  // treat disk cache as "live" for 5 min
const STALE_TTL  = 60 * 60_000; // serve stale disk data for up to 1 hour

export function setSharedCoins(data: Record<string, CoinPrice>) {
  sharedCache = {
    data: { ...sharedCache.data, ...data },
    at: Date.now(),
  };
  saveToDisk(sharedCache);
}

export function getSharedCoin(id: string): CoinPrice | undefined {
  return sharedCache.data[id];
}

export function hasSharedCoin(id: string): boolean {
  return id in sharedCache.data;
}

/** True if the cache is fresh enough to be served as primary data */
export function isSharedCacheFresh(): boolean {
  return Date.now() - sharedCache.at < LIVE_TTL;
}

/** True if the cache is old but still usable as a fallback */
export function isSharedCacheUsable(): boolean {
  return sharedCache.at > 0 && Date.now() - sharedCache.at < STALE_TTL;
}
