import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const router = Router();

async function requireAuth(req: Request & { veloxfiUser?: typeof veloxfiUsers.$inferSelect }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized." }); return; }
  const token = auth.slice(7);
  const [user] = await db.select().from(veloxfiUsers).where(eq(veloxfiUsers.sessionToken, token)).limit(1);
  if (!user) { res.status(401).json({ error: "Invalid or expired session." }); return; }
  (req as any).veloxfiUser = user;
  next();
}

const REFERRAL_BONUS = 3;

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
        })
        .where(eq(veloxfiUsers.username, validReferrer));
    }

    res.json({
      username: user.username, tokens: user.tokens, email: user.email, token,
      referralBonus: validReferrer ? REFERRAL_BONUS : 0,
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
    res.json({ username: user.username, tokens: user.tokens, email: user.email, token });
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
    if (user.claimRequestedAt) {
      res.status(409).json({ error: "A claim has already been submitted for this account." }); return;
    }
    const now = new Date();
    await db.update(veloxfiUsers).set({ claimRequestedAt: now }).where(eq(veloxfiUsers.username, user.username));
    res.json({ ok: true, claimRequestedAt: now.toISOString() });
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
      .select({ username: veloxfiUsers.username, tokens: veloxfiUsers.tokens })
      .from(veloxfiUsers)
      .orderBy(veloxfiUsers.tokens)
      .limit(10);
    users.sort((a, b) => b.tokens - a.tokens);
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: "Server error." });
  }
});

export default router;
