import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers, veloxfiBattles } from "@workspace/db/schema";
import { eq, desc, sql, gte, sum } from "drizzle-orm";
import { getSharedCoin, isSharedCacheUsable } from "../lib/coinCache";
import { fetchFromBinance } from "../lib/binanceFallback";

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

// ── Server-side battle auto-resolution ───────────────────────────────────────
// Called when a battle's endTime has passed. Fetches latest prices, determines
// winner, saves to battle history, awards tokens, clears active battle from DB.

const TIMEFRAME_REWARDS: Record<number, number> = { 300: 1, 900: 2, 1800: 3 };

async function fetchPriceForCoins(coinAId: string, coinBId: string): Promise<{ pA: number | null; pB: number | null }> {
  const ids = [coinAId, coinBId];
  let pA: number | null = null;
  let pB: number | null = null;

  // Try shared in-memory cache first (cheapest)
  if (isSharedCacheUsable()) {
    const cA = getSharedCoin(coinAId);
    const cB = getSharedCoin(coinBId);
    if (cA?.usd) pA = cA.usd;
    if (cB?.usd) pB = cB.usd;
    if (pA && pB) return { pA, pB };
  }

  // Try CoinGecko
  try {
    const cgUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids.join(","))}&order=market_cap_desc&per_page=10&page=1&sparkline=false`;
    const r = await fetch(cgUrl, { signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const arr = (await r.json()) as Array<{ id: string; current_price: number }>;
      for (const coin of arr) {
        if (coin.id === coinAId) pA = coin.current_price;
        if (coin.id === coinBId) pB = coin.current_price;
      }
      if (pA && pB) return { pA, pB };
    }
  } catch {}

  // Binance fallback
  try {
    const binance = await fetchFromBinance(ids);
    if (binance) {
      if (!pA && binance[coinAId]?.usd) pA = binance[coinAId].usd;
      if (!pB && binance[coinBId]?.usd) pB = binance[coinBId].usd;
    }
  } catch {}

  return { pA, pB };
}

router.post("/veloxfi/resolve-battle", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser;

    // Re-read user from DB to get fresh activeBattle
    const [freshUser] = await db.select().from(veloxfiUsers).where(eq(veloxfiUsers.username, user.username)).limit(1);
    if (!freshUser?.activeBattle) {
      res.status(404).json({ error: "No active battle found." });
      return;
    }

    let ab: any;
    try { ab = JSON.parse(freshUser.activeBattle); } catch {
      await db.update(veloxfiUsers).set({ activeBattle: null }).where(eq(veloxfiUsers.username, user.username));
      res.status(400).json({ error: "Invalid battle data." });
      return;
    }

    // Fetch final prices (fall back to entry prices if unavailable)
    const { pA: rawPA, pB: rawPB } = await fetchPriceForCoins(ab.coinAId, ab.coinBId);
    const finalPriceA = rawPA ?? ab.entryPriceA;
    const finalPriceB = rawPB ?? ab.entryPriceB;

    const changeA = ab.entryPriceA ? (finalPriceA - ab.entryPriceA) / ab.entryPriceA * 100 : 0;
    const changeB = ab.entryPriceB ? (finalPriceB - ab.entryPriceB) / ab.entryPriceB * 100 : 0;
    const actualWinner = changeA >= changeB ? ab.coinAId : ab.coinBId;
    const isCorrect = ab.pickedWinner === actualWinner;
    const reward = isCorrect ? (TIMEFRAME_REWARDS[ab.timeframe] || 1) : 0;

    // Save to battle history
    await db.insert(veloxfiBattles).values({
      username: freshUser.username,
      coinAId: ab.coinAId, coinBId: ab.coinBId,
      coinAName: ab.coinAName || ab.coinAId,
      coinBName: ab.coinBName || ab.coinBId,
      coinAEmoji: ab.coinAEmoji || "",
      coinBEmoji: ab.coinBEmoji || "",
      timeframe: parseInt(ab.timeframe) || 300,
      pickedWinner: ab.pickedWinner,
      actualWinner,
      result: isCorrect ? "win" : "loss",
      tokensEarned: reward,
      entryPriceA: ab.entryPriceA || 0,
      entryPriceB: ab.entryPriceB || 0,
      finalPriceA,
      finalPriceB,
      changeA,
      changeB,
    });

    // Award tokens if correct and clear active battle atomically
    const newTokens = freshUser.tokens + reward;
    await db.update(veloxfiUsers)
      .set({ activeBattle: null, tokens: newTokens })
      .where(eq(veloxfiUsers.username, freshUser.username));

    res.json({
      ok: true,
      isCorrect,
      actualWinner,
      pickedWinner: ab.pickedWinner,
      coinAId: ab.coinAId, coinBId: ab.coinBId,
      coinAName: ab.coinAName || ab.coinAId,
      coinBName: ab.coinBName || ab.coinBId,
      coinAEmoji: ab.coinAEmoji || "",
      coinBEmoji: ab.coinBEmoji || "",
      changeA, changeB,
      finalPriceA, finalPriceB,
      reward,
      newTokens,
      timeframe: ab.timeframe,
    });
  } catch (e) {
    console.error("veloxfi/resolve-battle POST error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;
