import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// ── API helpers ───────────────────────────────────────────────────────────────
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

function apiUrl(path: string) {
  return `${API_BASE}/api${path}`;
}

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<{ ok: boolean; data: T; status: number }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const r = await fetch(apiUrl(path), {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
    });
    let data: T;
    try { data = await r.json(); } catch { data = null as unknown as T; }
    return { ok: r.ok, data, status: r.status };
  } catch {
    return { ok: false, data: null as unknown as T, status: 0 };
  }
}

// ── Session storage ───────────────────────────────────────────────────────────
const SESSION_KEY = "vfx_session_v3";
const DAILY_KEY   = "vfx_daily_v3";

interface StoredSession { token: string; username: string; }
function loadSession(): StoredSession | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}
function saveSession(s: StoredSession) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

interface DailyData { lastDailyReward: string | null; dailyStreak: number; }
function loadDaily(): DailyData {
  try { return { lastDailyReward: null, dailyStreak: 0, ...JSON.parse(localStorage.getItem(DAILY_KEY) || "{}") }; }
  catch { return { lastDailyReward: null, dailyStreak: 0 }; }
}
function saveDaily(d: DailyData) { localStorage.setItem(DAILY_KEY, JSON.stringify(d)); }

// ── Constants ─────────────────────────────────────────────────────────────────
const DAILY_REWARDS = [50, 75, 100, 150, 200, 300, 500];
const MINING_DURATION_MS  = 4 * 60 * 60 * 1000;
const MAX_WOLF_PER_SESSION = 240;

export function getDailyRewardForStreak(streak: number): number {
  return DAILY_REWARDS[Math.min(Math.max(0, streak - 1), DAILY_REWARDS.length - 1)];
}
function todayStr() { return new Date().toISOString().slice(0, 10); }

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  username: string;
  email: string;
  wolf: number;
  battle: number;
  wallet: string | null;
  wolfMiningStart: number | null;
  lastDailyReward: string | null;
  dailyStreak: number;
  // legacy compat fields used by some pages
  id?: string;
  lastMineSession?: number | null;
  conversions?: never[];
  totalMined?: number;
}

interface MiningProgress {
  active: boolean;
  wolfEarned: number;
  minutesLeft: number;
  percentDone: number;
  secondsLeft: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (username: string, email: string, password: string, referredBy?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  // Mining
  startMiningSession: () => Promise<void>;
  claimMiningReward: () => Promise<number>;
  getMiningProgress: () => MiningProgress;
  // Convert
  requestConversion: (wolfAmount: number) => Promise<{ ok: boolean; error?: string; waitlisted?: boolean; battleRequested?: number }>;
  // Wallet
  setWallet: (address: string) => Promise<void>;
  // Daily
  canClaimDaily: () => boolean;
  getDailyRewardAmount: (streak: number) => number;
  claimDailyReward: () => { ok: boolean; wolf?: number; streak?: number };
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Build user object from API response ───────────────────────────────────────
function buildUser(api: Record<string, unknown>, daily: DailyData): User {
  const wolfMiningStart = api.wolfMiningStart
    ? new Date(api.wolfMiningStart as string).getTime()
    : null;
  // Prefer DB-tracked streak (set by mining/claim); fall back to localStorage
  // for users who haven't claimed yet under the new schema.
  const apiStreak = typeof api.dailyStreak === "number" ? api.dailyStreak : null;
  return {
    username:        String(api.username ?? ""),
    email:           String(api.email ?? ""),
    wolf:            Number(api.wolf ?? 0),
    battle:          Number(api.tokens ?? api.battle ?? 0),
    wallet:          (api.walletAddress as string) ?? null,
    wolfMiningStart,
    lastMineSession: wolfMiningStart,
    lastDailyReward: daily.lastDailyReward,
    dailyStreak:     apiStreak ?? daily.dailyStreak,
    id:              String(api.username ?? ""),
    conversions:     [],
    totalMined:      0,
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const session = loadSession();
    if (!session) { setIsLoading(false); return; }

    const daily = loadDaily();
    apiFetch<Record<string, unknown>>("/veloxfi/me", {}, session.token).then(({ ok, data }) => {
      if (ok && data?.username) {
        setToken(session.token);
        setUser(buildUser(data, daily));
      } else {
        clearSession();
      }
    }).finally(() => setIsLoading(false));
  }, []);

  async function refreshUser() {
    if (!token) return;
    const daily = loadDaily();
    const { ok, data } = await apiFetch<Record<string, unknown>>("/veloxfi/me", {}, token);
    if (ok && data?.username) setUser(buildUser(data, daily));
    else { clearSession(); setToken(null); setUser(null); }
  }

  async function login(username: string, password: string) {
    const { ok, data } = await apiFetch<Record<string, unknown>>("/veloxfi/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (!ok) return { ok: false, error: (data as any)?.error || "Login failed" };

    const tok = String(data.token);
    saveSession({ token: tok, username: String(data.username) });
    setToken(tok);

    const daily = loadDaily();
    // Fetch full profile (login response may lack wolfMiningStart etc.)
    const me = await apiFetch<Record<string, unknown>>("/veloxfi/me", {}, tok);
    setUser(buildUser(me.ok ? me.data : data, daily));
    return { ok: true };
  }

  async function register(username: string, email: string, password: string, referredBy?: string) {
    const { ok, data } = await apiFetch<Record<string, unknown>>("/veloxfi/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, referredBy }),
    });
    if (!ok) return { ok: false, error: (data as any)?.error || "Registration failed" };

    const tok = String(data.token);
    saveSession({ token: tok, username: String(data.username) });
    setToken(tok);
    setUser(buildUser(data, loadDaily()));
    return { ok: true };
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  // ── Mining ────────────────────────────────────────────────────────────────
  function getMiningProgress(): MiningProgress {
    const start = user?.wolfMiningStart ?? null;
    if (!start) return { active: false, wolfEarned: 0, minutesLeft: 240, percentDone: 0, secondsLeft: 14400 };

    const elapsedMs  = Date.now() - start;
    const elapsedMin = elapsedMs / 60000;
    const totalSecs  = 240 * 60;
    const elapsedSec = Math.floor(elapsedMs / 1000);

    if (elapsedMin >= 240) {
      return { active: false, wolfEarned: MAX_WOLF_PER_SESSION, minutesLeft: 0, percentDone: 100, secondsLeft: 0 };
    }
    return {
      active:       true,
      wolfEarned:   Math.floor(elapsedMin),
      minutesLeft:  240 - Math.floor(elapsedMin),
      percentDone:  (elapsedMin / 240) * 100,
      secondsLeft:  totalSecs - elapsedSec,
    };
  }

  async function startMiningSession() {
    if (!token) return;
    const { ok, data } = await apiFetch<Record<string, unknown>>("/veloxfi/mining/start", { method: "POST" }, token);
    if (ok && data.wolfMiningStart) {
      setUser(u => u ? { ...u, wolfMiningStart: new Date(data.wolfMiningStart as string).getTime(), lastMineSession: new Date(data.wolfMiningStart as string).getTime() } : u);
    }
  }

  async function claimMiningReward(): Promise<number> {
    if (!token) return 0;
    const { ok, data } = await apiFetch<Record<string, unknown>>("/veloxfi/mining/claim", { method: "POST" }, token);
    if (!ok) return 0;
    const wolfEarned = Number(data.wolfEarned ?? 0);
    const newStreak  = typeof data.dailyStreak === "number" ? data.dailyStreak : null;
    setUser(u => u ? {
      ...u,
      wolf:            Number(data.newWolfBalance ?? u.wolf),
      wolfMiningStart: null,
      lastMineSession: null,
      dailyStreak:     newStreak ?? u.dailyStreak,
    } : u);
    return wolfEarned;
  }

  // ── Convert ───────────────────────────────────────────────────────────────
  async function requestConversion(wolfAmount: number) {
    if (!token) return { ok: false, error: "Not logged in" };
    const { ok, data, status } = await apiFetch<Record<string, unknown>>("/veloxfi/convert-wolf", {
      method: "POST",
      body: JSON.stringify({ amount: wolfAmount }),
    }, token);

    // 202 = added to waitlist (pool depleted). WOLF stays untouched.
    if (status === 202 && data?.waitlisted) {
      return {
        ok: false,
        waitlisted: true,
        battleRequested: Number(data.battleRequested ?? 0),
        error: String(data.error ?? "Pool is currently depleted."),
      };
    }

    if (ok && data?.ok) {
      setUser(u => u ? { ...u, wolf: Number(data.newWolfBalance ?? u.wolf), battle: Number(data.newBattleBalance ?? u.battle) } : u);
      return { ok: true };
    }
    return { ok: false, error: (data as any)?.error || "Conversion failed" };
  }

  // ── Wallet ────────────────────────────────────────────────────────────────
  async function setWallet(address: string) {
    if (!token) return;
    const { ok, data } = await apiFetch<Record<string, unknown>>("/veloxfi/profile/wallet", {
      method: "PUT",
      body: JSON.stringify({ walletAddress: address }),
    }, token);
    if (ok) {
      setUser(u => u ? { ...u, wallet: String((data as any).walletAddress ?? address) } : u);
    }
  }

  // ── Daily reward (localStorage only) ─────────────────────────────────────
  function canClaimDaily(): boolean {
    if (!user) return false;
    return user.lastDailyReward !== todayStr();
  }

  function getDailyRewardAmount(streak: number): number {
    return getDailyRewardForStreak(streak);
  }

  function claimDailyReward(): { ok: boolean; wolf?: number; streak?: number } {
    if (!user) return { ok: false };
    if (user.lastDailyReward === todayStr()) return { ok: false };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const newStreak = user.lastDailyReward === yesterdayStr ? (user.dailyStreak || 0) + 1 : 1;
    const wolfReward = getDailyRewardForStreak(newStreak);

    const daily: DailyData = { lastDailyReward: todayStr(), dailyStreak: newStreak };
    saveDaily(daily);
    setUser(u => u ? { ...u, wolf: u.wolf + wolfReward, lastDailyReward: todayStr(), dailyStreak: newStreak } : u);
    return { ok: true, wolf: wolfReward, streak: newStreak };
  }

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      login, register, logout, refreshUser,
      startMiningSession, claimMiningReward, getMiningProgress,
      requestConversion,
      setWallet,
      canClaimDaily, getDailyRewardAmount, claimDailyReward,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
