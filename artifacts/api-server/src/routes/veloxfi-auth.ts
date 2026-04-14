import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers, veloxfiClaims, veloxfiGameSessions } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { updateAndCheckMissions } from "./veloxfi-battles";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const router = Router();

async function requireAuth(req: Request & { veloxfiUser?: typeof veloxfiUsers.$inferSelect }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    console.log(`[requireAuth] FAIL no/bad Authorization header on ${req.method} ${req.path} — got: ${auth ? auth.slice(0,20)+'...' : 'undefined'}`);
    res.status(401).json({ error: "Unauthorized." }); return;
  }
  const token = auth.slice(7);
  console.log(`[requireAuth] ${req.method} ${req.path} — token prefix: ${token.slice(0,8)}... (len ${token.length})`);
  const [user] = await db.select().from(veloxfiUsers).where(eq(veloxfiUsers.sessionToken, token)).limit(1);
  if (!user) {
    console.log(`[requireAuth] FAIL token not found in DB for ${req.method} ${req.path}`);
    res.status(401).json({ error: "Invalid or expired session." }); return;
  }
  console.log(`[requireAuth] OK user="${user.username}" on ${req.method} ${req.path}`);
  (req as any).veloxfiUser = user;
  next();
}

const REFERRAL_BONUS = 3;
const REFERRAL_XP    = 5;

// ── XP / Level helpers (mirrored from veloxfi-battles.ts) ────────────────────
function xpToNext(level: number): number {
  if (level <= 5)  return 100;
  if (level <= 10) return 150;
  if (level <= 20) return 200;
  if (level <= 35) return 300;
  return 500;
}
function getLevelName(level: number): string {
  if (level <= 5)  return 'Rookie Wolf';
  if (level <= 10) return 'Battle Wolf';
  if (level <= 20) return 'Alpha Wolf';
  if (level <= 35) return 'Cyber Wolf';
  return 'Legend Wolf';
}
function getXPInfo(totalXP: number) {
  const MAX = 50;
  let level = 1, spent = 0;
  while (level < MAX) {
    const needed = xpToNext(level);
    if (totalXP < spent + needed) break;
    spent += needed;
    level++;
  }
  return { level, levelName: getLevelName(level), currentLevelXP: totalXP - spent, nextLevelXP: level < MAX ? xpToNext(level) : 0, totalXP };
}

router.post("/veloxfi/register", async (req, res) => {
  try {
    const { username, email, password, referredBy } = req.body;
    if (!username || !email || !password) { res.status(400).json({ error: "Missing required fields." }); return; }
    if (username.length < 3) { res.status(400).json({ error: "Username must be at least 3 characters." }); return; }
    if (!/^[a-z0-9_]+$/.test(username)) { res.status(400).json({ error: "Username: only letters, numbers, underscores." }); return; }
    if (!email.includes("@")) { res.status(400).json({ error: "Enter a valid email address." }); return; }
    if (password.length < 6) { res.status(400).json({ error: "Password must be at least 6 characters." }); return; }

    const [existingUser] = await db.select().from(veloxfiUsers).where(eq(veloxfiUsers.username, username)).limit(1);
    if (existingUser) { res.status(409).json({ error: "Username already taken." }); return; }

    const [existingEmail] = await db.select({ username: veloxfiUsers.username }).from(veloxfiUsers).where(eq(veloxfiUsers.email, email)).limit(1);
    if (existingEmail) { res.status(409).json({ error: "Email already registered." }); return; }

    let validReferrer: string | null = null;
    if (referredBy && typeof referredBy === "string" && referredBy.trim()) {
      const refName = referredBy.trim().toLowerCase();
      if (refName !== username) {
        const [referrer] = await db.select({ username: veloxfiUsers.username }).from(veloxfiUsers).where(eq(veloxfiUsers.username, refName)).limit(1);
        if (referrer) validReferrer = referrer.username;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const token = randomUUID();
    const startingTokens = validReferrer ? REFERRAL_BONUS : 0;

    const [user] = await db
      .insert(veloxfiUsers)
      .values({
        username, email, passwordHash, tokens: startingTokens, sessionToken: token,
        referredBy: validReferrer ?? undefined,
      })
      .returning();

    if (validReferrer) {
      await db
        .update(veloxfiUsers)
        .set({
          tokens:         sql`${veloxfiUsers.tokens} + ${REFERRAL_BONUS}`,
          referralCount:  sql`${veloxfiUsers.referralCount} + 1`,
          referralTokens: sql`${veloxfiUsers.referralTokens} + ${REFERRAL_BONUS}`,
          xp:             sql`${veloxfiUsers.xp} + ${REFERRAL_XP}`,
        })
        .where(eq(veloxfiUsers.username, validReferrer));
      // Track mission progress for referrer (fire-and-forget, tokens already awarded above)
      updateAndCheckMissions(validReferrer, { referrals: 1 }).catch(() => {});
    }

    const regXPInfo = getXPInfo(user.xp ?? 0);
    res.json({
      username: user.username, tokens: user.tokens, wolf: user.wolf ?? 0, email: user.email, token,
      referralBonus: validReferrer ? REFERRAL_BONUS : 0,
      xp: user.xp ?? 0, level: regXPInfo.level, levelName: regXPInfo.levelName,
    });
  } catch (e) {
    console.error("register error:", e);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

router.post("/veloxfi/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) { res.status(400).json({ error: "Missing credentials." }); return; }

    const [user] = await db.select().from(veloxfiUsers).where(eq(veloxfiUsers.username, username)).limit(1);
    if (!user) { res.status(401).json({ error: "Username not found." }); return; }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: "Incorrect password." }); return; }

    const token = randomUUID();
    await db.update(veloxfiUsers).set({ sessionToken: token }).where(eq(veloxfiUsers.username, username));
    const loginXPInfo = getXPInfo(user.xp ?? 0);
    res.json({ username: user.username, tokens: user.tokens, wolf: user.wolf ?? 0, email: user.email, token, xp: user.xp ?? 0, level: loginXPInfo.level, levelName: loginXPInfo.levelName });
  } catch (e) {
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

router.get("/veloxfi/user/:username", requireAuth as any, async (req: any, res) => {
  const user = req.veloxfiUser;
  if (user.username !== req.params.username) { res.status(403).json({ error: "Forbidden." }); return; }
  res.json({
    username: user.username, tokens: user.tokens, email: user.email,
    referralCount: user.referralCount, referralTokens: user.referralTokens,
  });
});

router.post("/veloxfi/update-tokens", requireAuth as any, async (req: any, res) => {
  try {
    const { amount } = req.body;
    const user = req.veloxfiUser;
    const newTokens = user.tokens + (parseInt(amount) || 0);
    await db.update(veloxfiUsers).set({ tokens: newTokens }).where(eq(veloxfiUsers.username, user.username));
    res.json({ tokens: newTokens });
  } catch (e) {
    res.status(500).json({ error: "Server error." });
  }
});

router.post("/veloxfi/claim", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    if (!user.walletAddress) {
      res.status(400).json({ error: "You must save a wallet address before claiming." }); return;
    }
    if (user.tokens <= 0) {
      res.status(400).json({ error: "No tokens to claim." }); return;
    }
    const { amount } = req.body;
    const claimAmt = parseInt(amount, 10);
    if (!claimAmt || claimAmt <= 0) {
      res.status(400).json({ error: "Enter a valid amount to claim." }); return;
    }
    if (claimAmt > user.tokens) {
      res.status(400).json({ error: "Claim amount exceeds your token balance." }); return;
    }
    // Deduct tokens from balance
    const newTokens = user.tokens - claimAmt;
    await db.update(veloxfiUsers)
      .set({ tokens: newTokens })
      .where(eq(veloxfiUsers.username, user.username));
    // Insert a claim record
    await db.insert(veloxfiClaims).values({
      username:      user.username,
      walletAddress: user.walletAddress,
      amount:        claimAmt,
    });
    res.json({ ok: true, newTokens, claimAmt });
  } catch (e) {
    console.error("veloxfi/claim error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

router.put("/veloxfi/profile/wallet", requireAuth as any, async (req: any, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress || typeof walletAddress !== "string") {
      res.status(400).json({ error: "Wallet address is required." }); return;
    }
    const trimmed = walletAddress.trim();
    if (trimmed.length < 32 || trimmed.length > 44 || !/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)) {
      res.status(400).json({ error: "Invalid Solana wallet address. It should be 32–44 base58 characters." }); return;
    }
    await db.update(veloxfiUsers).set({ walletAddress: trimmed }).where(eq(veloxfiUsers.username, req.veloxfiUser.username));
    res.json({ ok: true, walletAddress: trimmed });
  } catch (e) {
    res.status(500).json({ error: "Server error." });
  }
});

router.get("/veloxfi/leaderboard", async (_req, res) => {
  try {
    const users = await db
      .select({ username: veloxfiUsers.username, tokens: veloxfiUsers.tokens, xp: veloxfiUsers.xp })
      .from(veloxfiUsers)
      .orderBy(veloxfiUsers.tokens)
      .limit(10);
    users.sort((a, b) => b.tokens - a.tokens);
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: "Server error." });
  }
});

// ── Wolf Mining ────────────────────────────────────────────────────────────────
const MINING_DURATION_MS  = 4 * 60 * 60 * 1000; // 4 hours
const WOLF_PER_MINUTE     = 1;
const MAX_WOLF_PER_SESSION = 240;                 // 4 hr * 60 min * 1

function getMiningStatus(user: typeof veloxfiUsers.$inferSelect) {
  const start = user.wolfMiningStart;
  if (!start) return { status: 'inactive' as const, secondsRemaining: 0, wolfEarned: 0 };
  const elapsedMs = Date.now() - start.getTime();
  if (elapsedMs >= MINING_DURATION_MS) {
    const wolfEarned = MAX_WOLF_PER_SESSION;
    return { status: 'complete' as const, secondsRemaining: 0, wolfEarned };
  }
  const secondsRemaining = Math.ceil((MINING_DURATION_MS - elapsedMs) / 1000);
  const wolfEarned = Math.floor(elapsedMs / 60000) * WOLF_PER_MINUTE;
  return { status: 'active' as const, secondsRemaining, wolfEarned };
}

router.get("/veloxfi/mining/status", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const mining = getMiningStatus(user);
    res.json({ ...mining, wolfBalance: user.wolf ?? 0, battleBalance: user.tokens });
  } catch (e) {
    res.status(500).json({ error: "Server error." });
  }
});

router.post("/veloxfi/mining/start", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const existing = getMiningStatus(user);
    if (existing.status === 'active') {
      res.status(400).json({ error: "Mining session already active." }); return;
    }
    if (existing.status === 'complete') {
      res.status(400).json({ error: "Claim your WOLF before starting a new session." }); return;
    }
    const now = new Date();
    await db.update(veloxfiUsers).set({ wolfMiningStart: now }).where(eq(veloxfiUsers.username, user.username));
    res.json({ ok: true, wolfMiningStart: now.toISOString() });
  } catch (e) {
    res.status(500).json({ error: "Server error." });
  }
});

router.post("/veloxfi/mining/claim", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const mining = getMiningStatus(user);
    if (mining.status === 'inactive') {
      res.status(400).json({ error: "No active mining session." }); return;
    }
    const wolfEarned = mining.status === 'complete'
      ? MAX_WOLF_PER_SESSION
      : Math.max(1, Math.floor(((Date.now() - user.wolfMiningStart!.getTime())) / 60000) * WOLF_PER_MINUTE);
    const newWolfBalance = (user.wolf ?? 0) + wolfEarned;
    await db.update(veloxfiUsers)
      .set({ wolf: newWolfBalance, wolfMiningStart: null })
      .where(eq(veloxfiUsers.username, user.username));
    res.json({ ok: true, wolfEarned, newWolfBalance, battleBalance: user.tokens });
  } catch (e) {
    res.status(500).json({ error: "Server error." });
  }
});

// ── Wolf → $BATTLE Conversion ────────────────────────────────────────────────
const WOLF_PER_BATTLE = 5000;

router.post("/veloxfi/convert-wolf", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const amount = parseInt(req.body.amount) || 0;
    if (amount < WOLF_PER_BATTLE || amount % WOLF_PER_BATTLE !== 0) {
      res.status(400).json({ error: `Amount must be a multiple of ${WOLF_PER_BATTLE.toLocaleString()} WOLF.` }); return;
    }
    const currentWolf = user.wolf ?? 0;
    if (amount > currentWolf) {
      res.status(400).json({ error: "Insufficient WOLF balance." }); return;
    }
    const battleEarned = Math.floor(amount / WOLF_PER_BATTLE);
    const newWolfBalance   = currentWolf - amount;
    const newBattleBalance = user.tokens + battleEarned;
    await db.update(veloxfiUsers)
      .set({ wolf: newWolfBalance, tokens: newBattleBalance })
      .where(eq(veloxfiUsers.username, user.username));
    res.json({ ok: true, wolfSpent: amount, battleEarned, newWolfBalance, newBattleBalance });
  } catch (e) {
    res.status(500).json({ error: "Server error." });
  }
});

// ── Rocket Miner: save earned WOLF ───────────────────────────────────────────
const ROCKET_MINER_MAX_WOLF = 120; // 1 WOLF/hit, ~1 coin/2s over 2-min session
const CRYPTO_SNAKE_MAX_WOLF = 120; // 1 WOLF/coin, cap at 120 per session

router.post("/veloxfi/game/rocket-miner/earn", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const raw = Number(req.body.wolfEarned);
    if (!Number.isFinite(raw) || raw <= 0) {
      res.status(400).json({ error: "No WOLF earned." }); return;
    }
    const wolfEarned = Math.min(Math.floor(raw), ROCKET_MINER_MAX_WOLF);
    const [updated] = await db.update(veloxfiUsers)
      .set({ wolf: sql`coalesce(wolf, 0) + ${wolfEarned}` })
      .where(eq(veloxfiUsers.username, user.username))
      .returning({ wolf: veloxfiUsers.wolf });
    if (!updated) {
      res.status(500).json({ error: "Failed to update balance." }); return;
    }
    await db.insert(veloxfiGameSessions).values({ username: user.username, game: 'rocket-miner', wolfEarned });
    res.json({ ok: true, wolfEarned, newWolfBalance: updated.wolf });
  } catch (e) {
    console.error("rocket-miner/earn error:", e);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ── Lightweight WOLF balance ──────────────────────────────────────────────────
router.get("/veloxfi/wolf-balance", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const [row] = await db
      .select({ wolf: veloxfiUsers.wolf })
      .from(veloxfiUsers)
      .where(eq(veloxfiUsers.username, user.username));
    res.json({ wolf: row?.wolf ?? 0 });
  } catch (e) {
    console.error("wolf-balance error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── Battle Tetris: save earned WOLF ──────────────────────────────────────────
const BATTLE_TETRIS_MAX_WOLF = 120; // 1 WOLF/line, cap 120 per session
router.post("/veloxfi/game/battle-tetris/earn", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const raw = Number(req.body.wolfEarned);
    if (!Number.isFinite(raw) || raw <= 0) {
      res.status(400).json({ error: "No WOLF earned." }); return;
    }
    const wolfEarned = Math.min(Math.floor(raw), BATTLE_TETRIS_MAX_WOLF);
    const [updated] = await db.update(veloxfiUsers)
      .set({ wolf: sql`coalesce(wolf, 0) + ${wolfEarned}` })
      .where(eq(veloxfiUsers.username, user.username))
      .returning({ wolf: veloxfiUsers.wolf });
    if (!updated) {
      res.status(500).json({ error: "Failed to update balance." }); return;
    }
    await db.insert(veloxfiGameSessions).values({ username: user.username, game: 'battle-tetris', wolfEarned });
    res.json({ ok: true, wolfEarned, newWolfBalance: updated.wolf });
  } catch (e) {
    console.error("battle-tetris/earn error:", e);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ── Crypto Snake: save earned WOLF ───────────────────────────────────────────
router.post("/veloxfi/game/crypto-snake/earn", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const raw = Number(req.body.wolfEarned);
    if (!Number.isFinite(raw) || raw <= 0) {
      res.status(400).json({ error: "No WOLF earned." }); return;
    }
    const wolfEarned = Math.min(Math.floor(raw), CRYPTO_SNAKE_MAX_WOLF);
    const [updated] = await db.update(veloxfiUsers)
      .set({ wolf: sql`coalesce(wolf, 0) + ${wolfEarned}` })
      .where(eq(veloxfiUsers.username, user.username))
      .returning({ wolf: veloxfiUsers.wolf });
    if (!updated) {
      res.status(500).json({ error: "Failed to update balance." }); return;
    }
    await db.insert(veloxfiGameSessions).values({ username: user.username, game: 'crypto-snake', wolfEarned });
    res.json({ ok: true, wolfEarned, newWolfBalance: updated.wolf });
  } catch (e) {
    console.error("crypto-snake/earn error:", e);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

export default router;
