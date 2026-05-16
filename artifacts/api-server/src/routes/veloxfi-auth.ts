import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers, veloxfiClaims, veloxfiWaitlist } from "@workspace/db/schema";
import { eq, sql, isNull, desc } from "drizzle-orm";
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

    // Support login by username or email
    const isEmail = username.includes("@");
    const [user] = isEmail
      ? await db.select().from(veloxfiUsers).where(eq(veloxfiUsers.email, username)).limit(1)
      : await db.select().from(veloxfiUsers).where(eq(veloxfiUsers.username, username)).limit(1);
    if (!user) { res.status(401).json({ error: "Account not found." }); return; }

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

router.get("/veloxfi/me", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const meXPInfo = getXPInfo(user.xp ?? 0);
    res.json({
      username: user.username,
      email: user.email,
      tokens: user.tokens ?? 0,
      wolf: user.wolf ?? 0,
      walletAddress: user.walletAddress ?? null,
      wolfMiningStart: user.wolfMiningStart ?? null,
      xp: user.xp ?? 0,
      level: meXPInfo.level,
      levelName: meXPInfo.levelName,
    });
  } catch (e) {
    res.status(500).json({ error: "Server error." });
  }
});

router.get("/veloxfi/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "50")) || 50));
    const requester = typeof req.query.username === "string" ? req.query.username : null;

    const rows = await db
      .select({
        username:       veloxfiUsers.username,
        tokens:         veloxfiUsers.tokens,
        wolf:           veloxfiUsers.wolf,
        xp:             veloxfiUsers.xp,
        referralCount:  veloxfiUsers.referralCount,
        walletAddress:  veloxfiUsers.walletAddress,
        createdAt:      veloxfiUsers.createdAt,
      })
      .from(veloxfiUsers)
      .orderBy(desc(veloxfiUsers.tokens))
      .limit(limit);

    const leaderboard = rows.map((r, i) => ({
      rank:          i + 1,
      username:      r.username,
      tokens:        Number(r.tokens ?? 0),
      wolf:          r.wolf ?? 0,
      xp:            r.xp ?? 0,
      level:         Math.max(1, Math.floor((r.xp ?? 0) / 1000) + 1),
      referralCount: r.referralCount ?? 0,
      walletAddress: r.walletAddress ?? null,
      isYou:         requester != null && r.username.toLowerCase() === requester.toLowerCase(),
    }));

    // Find requester's rank if they're outside the returned page
    let yourEntry: typeof leaderboard[number] | null = null;
    if (requester && !leaderboard.some(l => l.isYou)) {
      const [me] = await db
        .select({
          username:      veloxfiUsers.username,
          tokens:        veloxfiUsers.tokens,
          wolf:          veloxfiUsers.wolf,
          xp:            veloxfiUsers.xp,
          referralCount: veloxfiUsers.referralCount,
          walletAddress: veloxfiUsers.walletAddress,
          createdAt:     veloxfiUsers.createdAt,
        })
        .from(veloxfiUsers)
        .where(eq(veloxfiUsers.username, requester));

      if (me) {
        const [{ rank }] = await db
          .select({ rank: sql<number>`(select count(*)::int from ${veloxfiUsers} u where u.tokens > ${me.tokens}) + 1` })
          .from(veloxfiUsers)
          .limit(1);
        yourEntry = {
          rank:          Number(rank),
          username:      me.username,
          tokens:        Number(me.tokens ?? 0),
          wolf:          me.wolf ?? 0,
          xp:            me.xp ?? 0,
          level:         Math.max(1, Math.floor((me.xp ?? 0) / 1000) + 1),
          referralCount: me.referralCount ?? 0,
          walletAddress: me.walletAddress ?? null,
          isYou:         true,
        };
      }
    }

    res.json({ leaderboard, yourEntry });
  } catch (e) {
    console.error("veloxfi/leaderboard error:", e);
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

// Total $BATTLE pool — limited to what the project owner has personally bought
// on pump.fun. Once distributed, new conversion requests go to a waitlist.
const BATTLE_SUPPLY_CAP = 95_000_000;

async function getDistributedBattle(): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${veloxfiUsers.tokens}), 0)::float8` })
    .from(veloxfiUsers);
  return Number(row?.total ?? 0);
}

router.get("/veloxfi/supply-status", async (_req, res) => {
  try {
    const distributed = await getDistributedBattle();
    const remaining   = Math.max(0, BATTLE_SUPPLY_CAP - distributed);
    const percentUsed = BATTLE_SUPPLY_CAP > 0 ? (distributed / BATTLE_SUPPLY_CAP) * 100 : 0;

    const [waitlistRow] = await db
      .select({ cnt: sql<number>`count(*)::int` })
      .from(veloxfiWaitlist)
      .where(isNull(veloxfiWaitlist.fulfilledAt));

    res.json({
      cap:           BATTLE_SUPPLY_CAP,
      distributed:   Math.round(distributed * 10000) / 10000,
      remaining:     Math.round(remaining * 10000) / 10000,
      percentUsed:   Math.round(percentUsed * 100) / 100,
      poolDepleted:  remaining <= 0,
      waitlistCount: waitlistRow?.cnt ?? 0,
    });
  } catch (e) {
    console.error("supply-status error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

router.post("/veloxfi/convert-wolf", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const amount = parseInt(req.body.amount) || 0;
    if (amount < 1) {
      res.status(400).json({ error: "Amount must be at least 1 WOLF." }); return;
    }
    const currentWolf = user.wolf ?? 0;
    if (amount > currentWolf) {
      res.status(400).json({ error: "Insufficient WOLF balance." }); return;
    }
    const battleEarned = amount / WOLF_PER_BATTLE;

    // Check supply cap — if exceeded, route the request to the waitlist
    // instead of distributing tokens we don't own.
    const distributed = await getDistributedBattle();
    if (distributed + battleEarned > BATTLE_SUPPLY_CAP) {
      const [entry] = await db.insert(veloxfiWaitlist).values({
        username:      user.username,
        wolfAmount:    amount,
        battleAmount:  battleEarned,
        walletAddress: user.walletAddress ?? null,
      }).returning({ id: veloxfiWaitlist.id });

      res.status(202).json({
        ok: false,
        waitlisted: true,
        waitlistId: entry?.id,
        battleRequested: battleEarned,
        remaining: Math.max(0, BATTLE_SUPPLY_CAP - distributed),
        error: "Pool is currently depleted. You've been added to the waitlist — your WOLF is untouched.",
      });
      return;
    }

    const newWolfBalance   = currentWolf - amount;
    const newBattleBalance = (user.tokens ?? 0) + battleEarned;
    await db.update(veloxfiUsers)
      .set({ wolf: newWolfBalance, tokens: newBattleBalance })
      .where(eq(veloxfiUsers.username, user.username));

    const newDistributed = distributed + battleEarned;
    const newRemaining   = Math.max(0, BATTLE_SUPPLY_CAP - newDistributed);

    res.json({
      ok: true,
      wolfSpent: amount,
      battleEarned,
      newWolfBalance,
      newBattleBalance,
      poolRemaining: Math.round(newRemaining * 10000) / 10000,
      poolPercentUsed: Math.round((newDistributed / BATTLE_SUPPLY_CAP) * 10000) / 100,
    });
  } catch (e) {
    console.error("convert-wolf error:", e);
    res.status(500).json({ error: "Server error." });
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

export default router;
