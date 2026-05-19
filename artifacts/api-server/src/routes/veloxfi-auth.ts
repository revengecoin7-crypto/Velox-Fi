import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers, veloxfiClaims, veloxfiWaitlist, veloxfiActivity, veloxfiWolfEarnings } from "@workspace/db/schema";
import { getPetBonusPercent } from "./veloxfi-pet";
import { eq, sql, isNull, desc, gte, and, count } from "drizzle-orm";
import { updateAndCheckMissions } from "./veloxfi-battles";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { sendVerificationEmail } from "../lib/mailer";

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

// How many accounts a single IP can register within MAX_PER_IP_WINDOW.
// Soft enough for shared networks (family, office, cafe Wi-Fi);
// hard enough to frustrate someone trying to farm 20 accounts from one
// laptop to grab Daily Den rewards on each.
const MAX_ACCOUNTS_PER_IP   = 3;
const MAX_PER_IP_WINDOW_MS  = 24 * 60 * 60 * 1000;

function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded) && forwarded.length > 0) return String(forwarded[0]).split(",")[0].trim();
  return req.ip ?? "unknown";
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

    // Multi-account guard: how many accounts has this IP made in the last 24h?
    const ip = clientIp(req).slice(0, 64);
    const windowStart = new Date(Date.now() - MAX_PER_IP_WINDOW_MS);
    const [recentRow] = await db
      .select({ cnt: count() })
      .from(veloxfiUsers)
      .where(and(
        eq(veloxfiUsers.registrationIp, ip),
        gte(veloxfiUsers.createdAt, windowStart),
      ));
    if ((recentRow?.cnt ?? 0) >= MAX_ACCOUNTS_PER_IP) {
      res.status(429).json({
        error: `Too many accounts created from this network in the last 24 hours. Try again later, or contact support if you share a network with other wolves.`,
      });
      return;
    }

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
    const verifyToken = randomUUID();
    const startingTokens = validReferrer ? REFERRAL_BONUS : 0;

    const [user] = await db
      .insert(veloxfiUsers)
      .values({
        username, email, passwordHash, tokens: startingTokens, sessionToken: token,
        referredBy: validReferrer ?? undefined,
        emailVerifyToken: verifyToken,
        registrationIp: ip,
      })
      .returning();

    // Send verification email (fire-and-forget — registration succeeds either way).
    sendVerificationEmail(email, username, verifyToken).catch(() => {});

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

// Email verification — public endpoint, token comes from the email link.
router.get("/veloxfi/verify-email", async (req, res) => {
  try {
    const token = String(req.query.token ?? "").trim();
    if (!token) { res.status(400).json({ error: "Missing token." }); return; }
    const [user] = await db.select().from(veloxfiUsers).where(eq(veloxfiUsers.emailVerifyToken, token)).limit(1);
    if (!user) { res.status(400).json({ error: "Invalid or expired verification link." }); return; }
    if (user.emailVerified) { res.json({ ok: true, alreadyVerified: true, username: user.username }); return; }
    await db.update(veloxfiUsers)
      .set({ emailVerified: new Date(), emailVerifyToken: null })
      .where(eq(veloxfiUsers.username, user.username));
    res.json({ ok: true, username: user.username });
  } catch (e) {
    console.error("verify-email error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// Resend the verification email (must be logged in).
router.post("/veloxfi/resend-verification", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    if (user.emailVerified) { res.json({ ok: true, alreadyVerified: true }); return; }
    const newToken = randomUUID();
    await db.update(veloxfiUsers).set({ emailVerifyToken: newToken }).where(eq(veloxfiUsers.username, user.username));
    sendVerificationEmail(user.email, user.username, newToken).catch(() => {});
    res.json({ ok: true });
  } catch (e) {
    console.error("resend-verification error:", e);
    res.status(500).json({ error: "Server error." });
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

// Smallest withdrawal we'll process on-chain. Anything smaller costs more in
// Solana fees (~0.002 SOL rent per new recipient ATA) than the payout itself
// is worth at current $BATTLE price.
const MIN_WITHDRAW_BATTLE = 10;

router.post("/veloxfi/claim", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    if (!user.emailVerified) {
      res.status(403).json({ error: "Verify your email before withdrawing.", needsVerification: true }); return;
    }
    if (!user.walletAddress) {
      res.status(400).json({ error: "Save a Solana wallet address before withdrawing." }); return;
    }
    const numericTokens = Number(user.tokens ?? 0);
    if (numericTokens <= 0) {
      res.status(400).json({ error: "No $BATTLE to withdraw." }); return;
    }
    const claimAmt = Number(req.body.amount);
    if (!Number.isFinite(claimAmt) || claimAmt <= 0) {
      res.status(400).json({ error: "Enter a valid amount to withdraw." }); return;
    }
    if (claimAmt < MIN_WITHDRAW_BATTLE) {
      res.status(400).json({ error: `Minimum withdrawal is ${MIN_WITHDRAW_BATTLE} $BATTLE — keep mining to reach the threshold!` }); return;
    }
    if (claimAmt > numericTokens) {
      res.status(400).json({ error: "Withdraw amount exceeds your $BATTLE balance." }); return;
    }
    // Deduct $BATTLE from in-app balance and queue an admin payout request.
    const newTokens = numericTokens - claimAmt;
    await db.update(veloxfiUsers)
      .set({ tokens: newTokens })
      .where(eq(veloxfiUsers.username, user.username));
    await db.insert(veloxfiClaims).values({
      username:      user.username,
      walletAddress: user.walletAddress,
      amount:        claimAmt,
    });
    await db.insert(veloxfiActivity).values({
      type:     "withdraw",
      username: user.username,
      message:  `requested withdrawal of ${claimAmt} $BATTLE`,
    });
    res.json({ ok: true, newTokens, claimAmt });
  } catch (e) {
    console.error("veloxfi/claim error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// Return all withdrawal claims for the authenticated user, newest first.
// Used by the profile page to show "pending / paid" history.
router.get("/veloxfi/my-claims", requireAuth as any, async (req: any, res) => {
  try {
    const username = req.veloxfiUser.username;
    const claims = await db
      .select()
      .from(veloxfiClaims)
      .where(eq(veloxfiClaims.username, username))
      .orderBy(desc(veloxfiClaims.requestedAt));
    res.json(claims);
  } catch (e) {
    console.error("veloxfi/my-claims error:", e);
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
      dailyStreak: user.dailyStreak ?? 0,
      lastMiningClaimAt: user.lastMiningClaimAt ?? null,
      referralCount: user.referralCount ?? 0,
      referralTokens: user.referralTokens ?? 0,
      emailVerified: !!user.emailVerified,
    });
  } catch (e) {
    res.status(500).json({ error: "Server error." });
  }
});

// Map period query param to a start date (UTC) — null = no time filter.
function periodStart(period: string): Date | null {
  const now = new Date();
  if (period === "today") {
    const d = new Date(now); d.setUTCHours(0, 0, 0, 0); return d;
  }
  if (period === "week") {
    const d = new Date(now); d.setUTCDate(d.getUTCDate() - 7); return d;
  }
  if (period === "month") {
    const d = new Date(now); d.setUTCDate(d.getUTCDate() - 30); return d;
  }
  return null;
}

router.get("/veloxfi/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "50")) || 50));
    const requester = typeof req.query.username === "string" ? req.query.username : null;
    const sort   = String(req.query.sort   ?? "battle"); // battle|wolf|xp|refs|earned
    const period = String(req.query.period ?? "all");     // all|today|week|month

    // ── Earnings view: per-period sum from veloxfi_wolf_earnings ──────────
    if (sort === "earned") {
      const since = periodStart(period);
      const whereClause = since ? gte(veloxfiWolfEarnings.createdAt, since) : undefined;

      const earned = await db
        .select({
          username: veloxfiWolfEarnings.username,
          total:    sql<number>`coalesce(sum(${veloxfiWolfEarnings.amount}), 0)::int`,
        })
        .from(veloxfiWolfEarnings)
        .where(whereClause as any)
        .groupBy(veloxfiWolfEarnings.username)
        .orderBy(sql`coalesce(sum(${veloxfiWolfEarnings.amount}), 0) desc`)
        .limit(limit);

      // Pull user info for the winners in one round-trip.
      const usernames = earned.map(e => e.username);
      const users = usernames.length === 0 ? [] : await db
        .select({
          username: veloxfiUsers.username, tokens: veloxfiUsers.tokens, wolf: veloxfiUsers.wolf,
          xp: veloxfiUsers.xp, referralCount: veloxfiUsers.referralCount, walletAddress: veloxfiUsers.walletAddress,
        })
        .from(veloxfiUsers);
      const userByName = new Map(users.map(u => [u.username, u]));

      const leaderboard = earned.map((e, i) => {
        const u = userByName.get(e.username);
        return {
          rank:          i + 1,
          username:      e.username,
          tokens:        Number(u?.tokens ?? 0),
          wolf:          u?.wolf ?? 0,
          xp:            u?.xp ?? 0,
          level:         Math.max(1, Math.floor((u?.xp ?? 0) / 1000) + 1),
          referralCount: u?.referralCount ?? 0,
          walletAddress: u?.walletAddress ?? null,
          earnedAmount:  e.total,
          isYou:         requester != null && e.username.toLowerCase() === requester.toLowerCase(),
        };
      });

      let yourEntry: typeof leaderboard[number] | null = null;
      if (requester && !leaderboard.some(l => l.isYou)) {
        const [me] = await db
          .select({ total: sql<number>`coalesce(sum(${veloxfiWolfEarnings.amount}), 0)::int` })
          .from(veloxfiWolfEarnings)
          .where(and(eq(veloxfiWolfEarnings.username, requester), whereClause as any));
        if (me && me.total > 0) {
          const [{ rank }] = await db
            .select({
              rank: sql<number>`(select count(*)::int from (select username, coalesce(sum(amount),0) as t from ${veloxfiWolfEarnings} ${since ? sql`where created_at >= ${since}` : sql``} group by username) sub where sub.t > ${me.total}) + 1`,
            })
            .from(veloxfiWolfEarnings).limit(1);
          const u = (await db.select().from(veloxfiUsers).where(eq(veloxfiUsers.username, requester)))[0];
          yourEntry = {
            rank: Number(rank),
            username: requester,
            tokens: Number(u?.tokens ?? 0),
            wolf: u?.wolf ?? 0,
            xp: u?.xp ?? 0,
            level: Math.max(1, Math.floor((u?.xp ?? 0) / 1000) + 1),
            referralCount: u?.referralCount ?? 0,
            walletAddress: u?.walletAddress ?? null,
            earnedAmount: me.total,
            isYou: true,
          };
        }
      }

      res.json({ leaderboard, yourEntry, sort, period });
      return;
    }

    // ── Balance-based views: snapshot sort, period ignored ────────────────
    const sortCol =
      sort === "wolf" ? veloxfiUsers.wolf
      : sort === "xp" ? veloxfiUsers.xp
      : sort === "refs" ? veloxfiUsers.referralCount
      : veloxfiUsers.tokens; // 'battle' default

    const rows = await db
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
      .orderBy(desc(sortCol))
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
      earnedAmount:  0,
      isYou:         requester != null && r.username.toLowerCase() === requester.toLowerCase(),
    }));

    let yourEntry: typeof leaderboard[number] | null = null;
    if (requester && !leaderboard.some(l => l.isYou)) {
      const [me] = await db
        .select()
        .from(veloxfiUsers)
        .where(eq(veloxfiUsers.username, requester));
      if (me) {
        const meVal =
          sort === "wolf" ? (me.wolf ?? 0)
          : sort === "xp" ? (me.xp ?? 0)
          : sort === "refs" ? (me.referralCount ?? 0)
          : Number(me.tokens ?? 0);
        const [{ rank }] = await db
          .select({ rank: sql<number>`(select count(*)::int from ${veloxfiUsers} u where ${sortCol} > ${meVal}) + 1` })
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
          earnedAmount:  0,
          isYou:         true,
        };
      }
    }

    res.json({ leaderboard, yourEntry, sort, period });
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

// Tier bonus is awarded on each claim based on the user's WOLF balance
// at the moment of claiming (Bronze=0, Silver=10, Gold=25, Diamond=50, Alpha=100).
function tierBonusPercent(wolf: number): number {
  if (wolf >= 100_000) return 100;
  if (wolf >=  20_000) return 50;
  if (wolf >=   5_000) return 25;
  if (wolf >=   1_000) return 10;
  return 0;
}

function isSameUtcDay(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear()
      && a.getUTCMonth()    === b.getUTCMonth()
      && a.getUTCDate()     === b.getUTCDate();
}

function isYesterdayUtc(prev: Date, now: Date): boolean {
  const oneDay = new Date(now);
  oneDay.setUTCDate(oneDay.getUTCDate() - 1);
  return isSameUtcDay(prev, oneDay);
}

router.post("/veloxfi/mining/claim", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const mining = getMiningStatus(user);
    if (mining.status === 'inactive') {
      res.status(400).json({ error: "No active mining session." }); return;
    }

    // Base WOLF earned from elapsed minutes (capped at MAX_WOLF_PER_SESSION).
    const baseWolf = mining.status === 'complete'
      ? MAX_WOLF_PER_SESSION
      : Math.max(1, Math.floor(((Date.now() - user.wolfMiningStart!.getTime())) / 60000) * WOLF_PER_MINUTE);

    // Tier bonus from current WOLF balance + pet bonus from stage & equipped
    // accessories (halved if the pet is hungry or sad). Bonuses stack
    // additively, then multiplied with base.
    const tierPct = tierBonusPercent(user.wolf ?? 0);
    const petPct  = await getPetBonusPercent(user.username);
    const bonusPct = tierPct + petPct;
    const wolfEarned = Math.floor(baseWolf * (1 + bonusPct / 100));

    // Daily streak: increment if last claim was yesterday, reset if older,
    // unchanged if already claimed today, start at 1 if never claimed.
    const now = new Date();
    const prevClaim = user.lastMiningClaimAt ? new Date(user.lastMiningClaimAt) : null;
    let newStreak: number;
    if (!prevClaim)                       newStreak = 1;
    else if (isSameUtcDay(prevClaim, now)) newStreak = user.dailyStreak ?? 1;
    else if (isYesterdayUtc(prevClaim, now)) newStreak = (user.dailyStreak ?? 0) + 1;
    else                                   newStreak = 1;

    const newWolfBalance = (user.wolf ?? 0) + wolfEarned;
    const newXp          = (user.xp ?? 0) + wolfEarned; // 1 WOLF = 1 XP

    await db.update(veloxfiUsers)
      .set({
        wolf:              newWolfBalance,
        wolfMiningStart:   null,
        xp:                newXp,
        dailyStreak:       newStreak,
        lastMiningClaimAt: now,
      })
      .where(eq(veloxfiUsers.username, user.username));

    // Activity feed entry — visible in /mine live feed and admin.
    const bonusParts: string[] = [];
    if (tierPct > 0) bonusParts.push(`+${tierPct}% tier`);
    if (petPct  > 0) bonusParts.push(`+${petPct}% pet`);
    const bonusNote = bonusParts.length ? ` (${bonusParts.join(", ")})` : "";
    await db.insert(veloxfiActivity).values({
      type:     "claim",
      username: user.username,
      message:  `claimed ${wolfEarned} WOLF${bonusNote}`,
    });

    // Earnings log — feeds the period-bound leaderboard.
    await db.insert(veloxfiWolfEarnings).values({
      username: user.username,
      source:   "mining",
      amount:   wolfEarned,
    });

    res.json({
      ok: true,
      wolfEarned,
      baseWolf,
      tierBonusPct: tierPct,
      petBonusPct:  petPct,
      bonusPct,
      newWolfBalance,
      battleBalance: user.tokens,
      newXp,
      dailyStreak: newStreak,
    });
  } catch (e) {
    console.error("mining/claim error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── Wolf → $BATTLE Conversion ────────────────────────────────────────────────
const WOLF_PER_BATTLE = 5000;

// Total $BATTLE pool — limited to what the project owner has personally bought
// on pump.fun. Once distributed, new conversion requests go to a waitlist.
const BATTLE_SUPPLY_CAP = 95_000_000;

async function getDistributedBattle(): Promise<number> {
  // $BATTLE leaves the buyback pool either way: it can still be sitting in
  // a user's in-app balance, OR it has already been withdrawn (claim row).
  // Counting only user balances would cause the pool to "refill" the moment
  // a user clicks Withdraw, which is wrong — that $BATTLE is gone for good.
  const [users] = await db
    .select({ total: sql<number>`coalesce(sum(${veloxfiUsers.tokens}), 0)::float8` })
    .from(veloxfiUsers);
  const [claims] = await db
    .select({ total: sql<number>`coalesce(sum(${veloxfiClaims.amount}), 0)::float8` })
    .from(veloxfiClaims);
  return Number(users?.total ?? 0) + Number(claims?.total ?? 0);
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
    if (!user.emailVerified) {
      res.status(403).json({ error: "Verify your email before converting to $BATTLE.", needsVerification: true }); return;
    }
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
