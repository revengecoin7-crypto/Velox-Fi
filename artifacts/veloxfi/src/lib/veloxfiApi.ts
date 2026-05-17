import { useEffect, useState } from "react";

// ── /veloxfi/stats ─────────────────────────────────────────────────────────
export interface VeloxfiStats {
  battlesToday:  number;
  tokensToday:   number;
  activeNow:     number;
  totalEarned:   number;
  holderCount:   number;
  minersOnline:  number;
  walletsLinked: number;
}

export function useVeloxfiStats(refreshMs = 30_000) {
  const [stats, setStats] = useState<VeloxfiStats | null>(null);
  useEffect(() => {
    const f = () => fetch("/api/veloxfi/stats").then(r => r.json()).then(setStats).catch(() => {});
    f();
    const id = setInterval(f, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);
  return stats;
}

// ── /veloxfi/leaderboard ───────────────────────────────────────────────────
export type LeaderboardSort   = "battle" | "wolf" | "xp" | "refs" | "earned";
export type LeaderboardPeriod = "all" | "today" | "week" | "month";

export interface LeaderboardEntry {
  rank:          number;
  username:      string;
  tokens:        number;
  wolf:          number;
  xp:            number;
  level:         number;
  referralCount: number;
  walletAddress: string | null;
  earnedAmount:  number;
  isYou:         boolean;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  yourEntry:   LeaderboardEntry | null;
  sort:        LeaderboardSort;
  period:      LeaderboardPeriod;
}

export function useLeaderboard(
  username?: string | null,
  limit = 50,
  sort: LeaderboardSort = "battle",
  period: LeaderboardPeriod = "all",
  refreshMs = 30_000,
) {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  useEffect(() => {
    const url = `/api/veloxfi/leaderboard?limit=${limit}&sort=${sort}&period=${period}${username ? `&username=${encodeURIComponent(username)}` : ""}`;
    const f = () => fetch(url).then(r => r.json()).then(setData).catch(() => {});
    f();
    const id = setInterval(f, refreshMs);
    return () => clearInterval(id);
  }, [username, limit, sort, period, refreshMs]);
  return data;
}

// ── /veloxfi/activity-feed ─────────────────────────────────────────────────
export interface ActivityEntry {
  id:        number;
  type:      string;
  username:  string;
  message:   string;
  createdAt: string;
}

export function useActivityFeed(refreshMs = 30_000) {
  const [feed, setFeed] = useState<ActivityEntry[]>([]);
  useEffect(() => {
    const f = () => fetch("/api/veloxfi/activity-feed").then(r => r.json()).then((d: ActivityEntry[]) => setFeed(Array.isArray(d) ? d : [])).catch(() => {});
    f();
    const id = setInterval(f, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);
  return feed;
}

// Convert an ISO timestamp into a relative "Xm ago" string.
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const s = Math.floor(diff / 1000);
  if (s < 10)   return "just now";
  if (s < 60)   return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)   return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// Shorten a Solana wallet address to "abcd…wxyz" for display.
export function shortAddr(addr: string | null | undefined): string {
  if (!addr || addr.length < 10) return addr ?? "";
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

// ── /veloxfi/daily/status ──────────────────────────────────────────────────
export interface DailyStatus {
  spin: { availableToday: boolean; lastReward: number | null; rewards: number[]; weights: number[] };
  chests: Record<string, { ready: boolean; nextAtMs: number; lastReward?: number }>;
  milestones: Record<string, { day: number; claimed: boolean; available: boolean; reward: number }>;
  bounties: Record<string, { claimed: boolean; available: boolean; reward: number }>;
  now: number;
}

export function useDailyStatus(token: string | null, refreshMs = 30_000) {
  const [data, setData] = useState<DailyStatus | null>(null);
  const refresh = () => {
    if (!token) { setData(null); return; }
    fetch("/api/veloxfi/daily/status", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {});
  };
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, refreshMs);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refreshMs]);
  return { status: data, refresh };
}

export async function dailyAction(token: string, path: string): Promise<{ ok: boolean; reward?: number; error?: string; nextAtMs?: number }> {
  const res = await fetch(`/api/veloxfi/daily${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data?.error ?? "Request failed", nextAtMs: data?.nextAtMs };
  return { ok: true, reward: data?.reward };
}
