import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface GameSession {
  id: string;
  game: string;
  wolf: number;
  date: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  wolf: number;
  battle: number;
  lastMineSession: number | null;
  conversions: Array<{ id: string; wolf: number; battle: number; date: string; status: string }>;
  wallet: string | null;
  gameHistory: GameSession[];
  lastDailyReward: string | null;
  dailyStreak: number;
  totalMined: number;
  totalGameWolf: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  addWolf: (amount: number) => void;
  startMiningSession: () => void;
  claimMiningReward: () => number;
  getMiningProgress: () => { active: boolean; wolfEarned: number; minutesLeft: number; percentDone: number; secondsLeft: number };
  requestConversion: (wolfAmount: number) => Promise<{ ok: boolean; error?: string }>;
  setWallet: (address: string) => void;
  claimDailyReward: () => { ok: boolean; wolf?: number; streak?: number };
  addGameSession: (game: string, wolf: number) => void;
  canClaimDaily: () => boolean;
  getDailyRewardAmount: (streak: number) => number;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "vfx_users_v2";
const SESSION_KEY = "vfx_session_v2";

type StoredUser = User & { password: string };

function loadUsers(): Record<string, StoredUser> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); }
  catch { return {}; }
}

function saveUsers(u: Record<string, StoredUser>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}

const DAILY_REWARDS = [50, 75, 100, 150, 200, 300, 500];

export function getDailyRewardForStreak(streak: number): number {
  const idx = Math.min(streak - 1, DAILY_REWARDS.length - 1);
  return DAILY_REWARDS[Math.max(0, idx)];
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem(SESSION_KEY);
    if (id) {
      const users = loadUsers();
      const u = users[id];
      if (u) {
        const { password: _p, ...rest } = u;
        const migrated: User = {
          gameHistory: [],
          lastDailyReward: null,
          dailyStreak: 0,
          totalMined: 0,
          totalGameWolf: 0,
          ...rest,
        };
        setUser(migrated);
      }
    }
    setIsLoading(false);
  }, []);

  function persist(updated: User) {
    const users = loadUsers();
    const existing = users[updated.id];
    if (!existing) return;
    users[updated.id] = { ...existing, ...updated };
    saveUsers(users);
    setUser(updated);
  }

  async function login(usernameOrEmail: string, password: string) {
    const users = loadUsers();
    const found = Object.values(users).find(
      u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password
    );
    if (!found) return { ok: false, error: "Invalid username or password" };
    localStorage.setItem(SESSION_KEY, found.id);
    const { password: _p, ...rest } = found;
    const migrated: User = {
      gameHistory: [],
      lastDailyReward: null,
      dailyStreak: 0,
      totalMined: 0,
      totalGameWolf: 0,
      ...rest,
    };
    setUser(migrated);
    return { ok: true };
  }

  async function register(username: string, email: string, password: string) {
    if (!username.trim() || !email.trim() || !password) return { ok: false, error: "All fields required" };
    const users = loadUsers();
    if (Object.values(users).some(u => u.username === username))
      return { ok: false, error: "Username already taken" };
    if (Object.values(users).some(u => u.email === email))
      return { ok: false, error: "Email already registered" };
    const id = crypto.randomUUID();
    const newUser: StoredUser = {
      id, username, email, password,
      wolf: 100, battle: 0, lastMineSession: null, conversions: [], wallet: null,
      gameHistory: [], lastDailyReward: null, dailyStreak: 0,
      totalMined: 0, totalGameWolf: 0,
    };
    users[id] = newUser;
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, id);
    const { password: _p, ...rest } = newUser;
    setUser(rest);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  function addWolf(amount: number) {
    if (!user) return;
    persist({ ...user, wolf: user.wolf + amount });
  }

  function startMiningSession() {
    if (!user) return;
    persist({ ...user, lastMineSession: Date.now() });
  }

  function claimMiningReward(): number {
    if (!user || !user.lastMineSession) return 0;
    const elapsedMin = (Date.now() - user.lastMineSession) / 60000;
    const earned = Math.min(Math.floor(elapsedMin), 240);
    persist({
      ...user,
      wolf: user.wolf + earned,
      lastMineSession: null,
      totalMined: (user.totalMined || 0) + earned,
    });
    return earned;
  }

  function getMiningProgress(): { active: boolean; wolfEarned: number; minutesLeft: number; percentDone: number; secondsLeft: number } {
    if (!user || !user.lastMineSession) {
      return { active: false, wolfEarned: 0, minutesLeft: 240, percentDone: 0, secondsLeft: 14400 };
    }
    const elapsedMs = Date.now() - user.lastMineSession;
    const elapsedMin = elapsedMs / 60000;
    const totalSecs = 240 * 60;
    const elapsedSecs = Math.floor(elapsedMs / 1000);
    if (elapsedMin >= 240) {
      return { active: false, wolfEarned: 240, minutesLeft: 0, percentDone: 100, secondsLeft: 0 };
    }
    const secondsLeft = totalSecs - elapsedSecs;
    return {
      active: true,
      wolfEarned: Math.floor(elapsedMin),
      minutesLeft: 240 - Math.floor(elapsedMin),
      percentDone: (elapsedMin / 240) * 100,
      secondsLeft,
    };
  }

  async function requestConversion(wolfAmount: number) {
    if (!user) return { ok: false, error: "Not logged in" };
    if (wolfAmount <= 0) return { ok: false, error: "Enter a valid WOLF amount" };
    if (user.wolf < wolfAmount) return { ok: false, error: "Insufficient WOLF balance" };
    const battleAmount = wolfAmount / 5000;
    const conv = {
      id: crypto.randomUUID(),
      wolf: wolfAmount,
      battle: battleAmount,
      date: new Date().toISOString(),
      status: "pending",
    };
    persist({ ...user, wolf: user.wolf - wolfAmount, conversions: [conv, ...user.conversions] });
    return { ok: true };
  }

  function setWallet(address: string) {
    if (!user) return;
    persist({ ...user, wallet: address });
  }

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
    persist({
      ...user,
      wolf: user.wolf + wolfReward,
      lastDailyReward: todayStr(),
      dailyStreak: newStreak,
    });
    return { ok: true, wolf: wolfReward, streak: newStreak };
  }

  function addGameSession(game: string, wolf: number) {
    if (!user) return;
    const session: GameSession = {
      id: crypto.randomUUID(),
      game,
      wolf,
      date: new Date().toISOString(),
    };
    persist({
      ...user,
      wolf: user.wolf + wolf,
      gameHistory: [session, ...(user.gameHistory || [])].slice(0, 50),
      totalGameWolf: (user.totalGameWolf || 0) + wolf,
    });
  }

  return (
    <AuthContext.Provider value={{
      user, isLoading, login, register, logout,
      addWolf, startMiningSession, claimMiningReward, getMiningProgress,
      requestConversion, setWallet, claimDailyReward, addGameSession,
      canClaimDaily, getDailyRewardAmount,
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
