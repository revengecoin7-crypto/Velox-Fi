// Central utility for all calculated user statistics
// Used across all pages — always derives from real account data

export interface UserStats {
  username: string;
  wolfBalance: number;
  battleBalance: number;
  dailyStreak: number;
  tier: { name: string; color: string; icon: string; bonus: number };
  level: number;
  levelName: string;
  hashRate: number;         // KH/s
  claimable: number;        // current claimable WOLF
  isOnline: boolean;
  walletAddress: string | null;
  xp: number;
  xpToNextLevel: number;
}

// Pack tiers based on WOLF balance
const TIERS = [
  { name: "Bronze",  icon: "🥉", min: 0,      max: 999,    color: "#CD7F32", bonus: 0   },
  { name: "Silver",  icon: "🥈", min: 1000,   max: 4999,   color: "#C0C0C0", bonus: 10  },
  { name: "Gold",    icon: "🥇", min: 5000,   max: 19999,  color: "#FFCC2B", bonus: 25  },
  { name: "Diamond", icon: "💎", min: 20000,  max: 99999,  color: "#08D1F2", bonus: 50  },
  { name: "Alpha",   icon: "👑", min: 100000, max: Infinity, color: "#FFD700", bonus: 100 },
];

// Level names based on totalMined
const LEVEL_NAMES: Record<number, string> = {
  1: "Rookie Wolf", 5: "Hunter", 10: "Stalker",
  15: "Plasma Wolf", 20: "Alpha Hunter", 25: "Pack Leader",
  30: "Shadow Fang", 40: "Apex Wolf", 50: "Alpha",
};

export function getTier(wolfBalance: number) {
  return TIERS.find(t => wolfBalance >= t.min && wolfBalance < t.max) ?? TIERS[0];
}

export function getLevel(totalMined: number): number {
  return Math.max(1, Math.floor(Math.sqrt(totalMined / 100)) + 1);
}

export function getLevelName(level: number): string {
  const keys = Object.keys(LEVEL_NAMES).map(Number).sort((a, b) => b - a);
  const key = keys.find(k => level >= k);
  return LEVEL_NAMES[key ?? 1] ?? "Rookie Wolf";
}

export function getHashRate(wolfBalance: number, tier: { bonus: number }): number {
  const base = 1.0;
  const multiplier = 1 + tier.bonus / 100;
  return Math.round(base * multiplier * 10) / 10;
}

export function getClaimable(wolfMiningStart: number | null): number {
  if (!wolfMiningStart) return 0;
  const hours = (Date.now() - wolfMiningStart) / 1000 / 3600;
  const rate = 14.2; // base $BATTLE per hour
  return Math.min(Math.floor(hours * rate), 2400); // cap at 2400 (one week)
}

export function getXpToNextLevel(level: number): number {
  return (level * level) * 100;
}

export function calcUserStats(user: {
  username: string;
  wolf: number;
  battle: number;
  dailyStreak: number;
  wolfMiningStart: number | null;
  wallet: string | null;
  totalMined?: number;
  lastDailyReward?: string | null;
} | null): UserStats {
  if (!user) {
    return {
      username: "AGENT_07",
      wolfBalance: 0,
      battleBalance: 0,
      dailyStreak: 0,
      tier: TIERS[0],
      level: 1,
      levelName: "Rookie Wolf",
      hashRate: 1.0,
      claimable: 0,
      isOnline: false,
      walletAddress: null,
      xp: 0,
      xpToNextLevel: 100,
    };
  }

  const tier = getTier(user.wolf);
  const totalMined = user.totalMined ?? user.wolf;
  const level = getLevel(totalMined);
  const xp = totalMined;
  const xpToNext = getXpToNextLevel(level);

  return {
    username: user.username,
    wolfBalance: user.wolf,
    battleBalance: user.battle,
    dailyStreak: user.dailyStreak,
    tier,
    level,
    levelName: getLevelName(level),
    hashRate: getHashRate(user.wolf, tier),
    claimable: getClaimable(user.wolfMiningStart),
    isOnline: true,
    walletAddress: user.wallet,
    xp,
    xpToNextLevel: xpToNext,
  };
}
