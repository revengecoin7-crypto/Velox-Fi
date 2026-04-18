import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  wolf: number;
  battle: number;
  lastMineSession: number | null;
  conversions: Array<{ id: string; wolf: number; battle: number; date: string; status: string }>;
  wallet: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  addWolf: (amount: number) => void;
  startMiningSession: () => void;
  claimMiningReward: () => void;
  getMiningProgress: () => { active: boolean; wolfEarned: number; minutesLeft: number; percentDone: number };
  requestConversion: (wolfAmount: number) => Promise<{ ok: boolean; error?: string }>;
  setWallet: (address: string) => void;
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
        setUser(rest);
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
    setUser(rest);
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

  function claimMiningReward() {
    if (!user || !user.lastMineSession) return;
    const elapsedMin = (Date.now() - user.lastMineSession) / 60000;
    const earned = Math.min(Math.floor(elapsedMin), 240);
    persist({ ...user, wolf: user.wolf + earned, lastMineSession: null });
  }

  function getMiningProgress(): { active: boolean; wolfEarned: number; minutesLeft: number; percentDone: number } {
    if (!user || !user.lastMineSession) {
      return { active: false, wolfEarned: 0, minutesLeft: 240, percentDone: 0 };
    }
    const elapsedMin = (Date.now() - user.lastMineSession) / 60000;
    if (elapsedMin >= 240) {
      return { active: false, wolfEarned: 240, minutesLeft: 0, percentDone: 100 };
    }
    return {
      active: true,
      wolfEarned: Math.floor(elapsedMin),
      minutesLeft: 240 - Math.floor(elapsedMin),
      percentDone: (elapsedMin / 240) * 100,
    };
  }

  async function requestConversion(wolfAmount: number) {
    if (!user) return { ok: false, error: "Not logged in" };
    if (wolfAmount < 5000) return { ok: false, error: "Minimum conversion is 5,000 WOLF" };
    if (user.wolf < wolfAmount) return { ok: false, error: "Insufficient WOLF balance" };
    const battleAmount = Math.floor(wolfAmount / 5000);
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

  return (
    <AuthContext.Provider value={{
      user, isLoading, login, register, logout,
      addWolf, startMiningSession, claimMiningReward, getMiningProgress,
      requestConversion, setWallet,
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
