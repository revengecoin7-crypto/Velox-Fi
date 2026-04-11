import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers, veloxfiBattles } from "@workspace/db/schema";
import { eq, desc, sql, gte, sum } from "drizzle-orm";

const router = Router();

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized." }); return; }
  const token = auth.slice(7);
  const [user] = await db.select().from(veloxfiUsers).where(eq(veloxfiUsers.sessionToken, token)).limit(1);
  if (!user) { res.status(401).json({ error: "Invalid or expired session." }); return; }
  (req as any).veloxfiUser = user;
  next();
}

router.post("/veloxfi/battles", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const {
      coinAId, coinBId, coinAName, coinBName, coinAEmoji, coinBEmoji,
      timeframe, pickedWinner, actualWinner, result, tokensEarned,
      entryPriceA, entryPriceB, finalPriceA, finalPriceB, changeA, changeB,
    } = req.body;

    if (!coinAId || !coinBId || !result) {
      res.status(400).json({ error: "Missing required battle fields." });
      return;
    }

    await db.insert(veloxfiBattles).values({
      username: user.username,
      coinAId, coinBId,
      coinAName: coinAName || coinAId,
      coinBName: coinBName || coinBId,
      coinAEmoji: coinAEmoji || "",
      coinBEmoji: coinBEmoji || "",
      timeframe: parseInt(timeframe) || 300,
      pickedWinner, actualWinner, result,
      tokensEarned: parseInt(tokensEarned) || 0,
      entryPriceA: parseFloat(entryPriceA) || 0,
      entryPriceB: parseFloat(entryPriceB) || 0,
      finalPriceA: parseFloat(finalPriceA) || 0,
      finalPriceB: parseFloat(finalPriceB) || 0,
      changeA: parseFloat(changeA) || 0,
      changeB: parseFloat(changeB) || 0,
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("veloxfi/battles POST error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

router.get("/veloxfi/battles", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const battles = await db
      .select()
      .from(veloxfiBattles)
      .where(eq(veloxfiBattles.username, user.username))
      .orderBy(desc(veloxfiBattles.createdAt))
      .limit(20);
    res.json(battles);
  } catch (e) {
    console.error("veloxfi/battles GET error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

router.get("/veloxfi/profile", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;

    const [stats] = await db
      .select({
        totalBattles: sql<number>`count(*)::int`,
        totalWins:    sql<number>`sum(case when result = 'win' then 1 else 0 end)::int`,
        totalLosses:  sql<number>`sum(case when result = 'loss' then 1 else 0 end)::int`,
        totalTokens:  sql<number>`sum(tokens_earned)::int`,
      })
      .from(veloxfiBattles)
      .where(eq(veloxfiBattles.username, user.username));

    const battles = await db
      .select()
      .from(veloxfiBattles)
      .where(eq(veloxfiBattles.username, user.username))
      .orderBy(desc(veloxfiBattles.createdAt))
      .limit(20);

    const totalBattles = stats?.totalBattles || 0;
    const totalWins    = stats?.totalWins    || 0;
    const totalLosses  = stats?.totalLosses  || 0;
    const totalTokens  = stats?.totalTokens  || 0;
    const winPct       = totalBattles > 0 ? Math.round((totalWins / totalBattles) * 100) : 0;

    // Parse activeBattle JSON safely
    let activeBattle: object | null = null;
    if (user.activeBattle) {
      try { activeBattle = JSON.parse(user.activeBattle); } catch {}
    }
    // If battle endTime has passed, clear it
    if (activeBattle && (activeBattle as any).endTime && (activeBattle as any).endTime < Date.now()) {
      activeBattle = null;
      await db.update(veloxfiUsers).set({ activeBattle: null }).where(eq(veloxfiUsers.username, user.username));
    }

    res.json({
      username:       user.username,
      email:          user.email,
      tokens:         user.tokens,
      createdAt:      user.createdAt,
      referralCount:  user.referralCount,
      referralTokens: user.referralTokens,
      walletAddress:      user.walletAddress      ?? null,
      claimRequestedAt:   user.claimRequestedAt   ?? null,
      claimedAt:          user.claimedAt           ?? null,
      activeBattle,
      stats: { totalBattles, totalWins, totalLosses, winPct, totalTokens },
      battles,
    });
  } catch (e) {
    console.error("veloxfi/profile GET error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── Homepage stats bar ───────────────────────────────────────────────────────

router.get("/veloxfi/stats", async (_req, res) => {
  try {
    // Start of today in UTC
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // Battles today + tokens earned today — single query
    const [todayRow] = await db
      .select({
        battlesToday: sql<number>`count(*)::int`,
        tokensToday:  sql<number>`coalesce(sum(${veloxfiBattles.tokensEarned}),0)::int`,
      })
      .from(veloxfiBattles)
      .where(gte(veloxfiBattles.createdAt, todayStart));

    // Active now — count users with a non-null activeBattle whose endTime hasn't passed
    const [activeRow] = await db
      .select({ cnt: sql<number>`count(*)::int` })
      .from(veloxfiUsers)
      .where(
        sql`${veloxfiUsers.activeBattle} IS NOT NULL
            AND (${veloxfiUsers.activeBattle}::jsonb->>'endTime')::bigint > ${Date.now()}`
      );

    res.json({
      battlesToday: todayRow?.battlesToday ?? 0,
      tokensToday:  todayRow?.tokensToday  ?? 0,
      activeNow:    activeRow?.cnt         ?? 0,
    });
  } catch (e) {
    console.error("veloxfi/stats GET error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── Active battle persistence ────────────────────────────────────────────────

router.put("/veloxfi/active-battle", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    const battleData = req.body;
    if (!battleData || !battleData.coinAId || !battleData.coinBId) {
      res.status(400).json({ error: "Invalid battle data." }); return;
    }
    await db.update(veloxfiUsers)
      .set({ activeBattle: JSON.stringify(battleData) })
      .where(eq(veloxfiUsers.username, user.username));
    res.json({ ok: true });
  } catch (e) {
    console.error("veloxfi/active-battle PUT error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

router.delete("/veloxfi/active-battle", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;
    await db.update(veloxfiUsers)
      .set({ activeBattle: null })
      .where(eq(veloxfiUsers.username, user.username));
    res.json({ ok: true });
  } catch (e) {
    console.error("veloxfi/active-battle DELETE error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;
