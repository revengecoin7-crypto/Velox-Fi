import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers, veloxfiBattles, veloxfiAchievements, veloxfiMissions, veloxfiActivity, veloxfiGameSessions } from "@workspace/db/schema";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { getSharedCoin, isSharedCacheUsable } from "../lib/coinCache";
import { fetchFromBinance } from "../lib/binanceFallback";

const router = Router();

// ── Activity feed helpers ─────────────────────────────────────────────────────

const ACHIEVEMENT_NAMES: Record<string, string> = {
  first_blood:   'First Blood',
  on_a_roll:     'On a Roll',
  diamond_hands: 'Diamond Hands',
  hot_streak:    'Hot Streak',
  sharp_shooter: 'Sharp Shooter',
  top_dog:       'Top Dog',
  night_owl:     'Night Owl',
  speed_demon:   'Speed Demon',
  century_club:  'Century Club',
  legend:        'Legend',
};

function tfLabel(tf: number): string {
  if (tf === 300)  return '5-min';
  if (tf === 900)  return '15-min';
  if (tf === 1800) return '30-min';
  return `${Math.round(tf / 60)}-min`;
}

async function logActivity(type: string, username: string, message: string): Promise<void> {
  try {
    await db.insert(veloxfiActivity).values({ type, username, message });
  } catch (e) {
    console.error('logActivity error:', e);
  }
}

// ── XP / Level helpers ───────────────────────────────────────────────────────

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
  return {
    level,
    levelName:      getLevelName(level),
    currentLevelXP: totalXP - spent,
    nextLevelXP:    level < MAX ? xpToNext(level) : 0,
    totalXP,
  };
}

function calcBattleXP(result: string, timeframe: number): number {
  let xp = 10;
  if (result === 'win') xp += timeframe === 1800 ? 50 : 25;
  return xp;
}

// ── Achievement helpers ───────────────────────────────────────────────────────

async function checkAndAwardAchievements(
  username: string,
  currentTokens: number,
  allBattles: Array<{ result: string; timeframe: number; createdAt: Date }>,
  isCurrentWin: boolean,
  currentTimeframe: number,
): Promise<string[]> {
  const earnedRows = await db
    .select({ achievementId: veloxfiAchievements.achievementId })
    .from(veloxfiAchievements)
    .where(eq(veloxfiAchievements.username, username));
  const earnedSet = new Set(earnedRows.map(r => r.achievementId));

  const newlyEarned: string[] = [];
  const toInsert: Array<{ username: string; achievementId: string }> = [];

  function maybeAward(id: string, condition: boolean) {
    if (!earnedSet.has(id) && condition) {
      newlyEarned.push(id);
      toInsert.push({ username, achievementId: id });
      earnedSet.add(id);
    }
  }

  const totalBattles = allBattles.length;
  const totalWins    = allBattles.filter(b => b.result === 'win').length;
  const last3        = allBattles.slice(0, 3);
  const last5        = allBattles.slice(0, 5);

  maybeAward('first_blood',   totalBattles >= 1);
  maybeAward('on_a_roll',     last3.length >= 3 && last3.every(b => b.result === 'win'));
  maybeAward('diamond_hands', isCurrentWin && currentTimeframe === 1800);
  maybeAward('hot_streak',    last5.length >= 5 && last5.every(b => b.result === 'win'));
  maybeAward('sharp_shooter', totalWins >= 10);

  const [topUser] = await db
    .select({ username: veloxfiUsers.username })
    .from(veloxfiUsers)
    .orderBy(desc(veloxfiUsers.tokens))
    .limit(1);
  maybeAward('top_dog', topUser?.username === username && currentTokens > 0);

  if (isCurrentWin) {
    const hour = new Date().getUTCHours();
    maybeAward('night_owl', hour >= 0 && hour < 6);
  }

  maybeAward('speed_demon',  totalBattles >= 50);
  maybeAward('century_club', totalBattles >= 100);
  maybeAward('legend',       currentTokens >= 500);

  if (toInsert.length > 0) {
    await db.insert(veloxfiAchievements).values(toInsert).onConflictDoNothing();
  }

  return newlyEarned;
}

// ── Daily mission helpers ─────────────────────────────────────────────────────

function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

const MISSION_DEFS = [
  { key: 'm1', field: 'battlesPlayed' as const, rewardField: 'm1Rewarded' as const, target: 3, reward: 2, name: 'Play 3 Battles' },
  { key: 'm2', field: 'thirtyMinWins' as const, rewardField: 'm2Rewarded' as const, target: 1, reward: 3, name: 'Win a 30-Min Battle' },
  { key: 'm3', field: 'teamBattles'   as const, rewardField: 'm3Rewarded' as const, target: 1, reward: 1, name: 'Play a Team Battle' },
  { key: 'm4', field: 'referrals'     as const, rewardField: 'm4Rewarded' as const, target: 1, reward: 3, name: 'Invite Someone' },
] as const;

type MissionField   = typeof MISSION_DEFS[number]['field'];
type MissionRField  = typeof MISSION_DEFS[number]['rewardField'];

export async function updateAndCheckMissions(
  username: string,
  updates: Partial<Record<MissionField, number>>,
): Promise<Array<{ id: string; name: string; reward: number }>> {
  const missionDate = getTodayUTC();

  // Upsert: insert or increment counters
  await db.insert(veloxfiMissions)
    .values({
      username,
      missionDate,
      battlesPlayed: updates.battlesPlayed || 0,
      thirtyMinWins: updates.thirtyMinWins || 0,
      teamBattles:   updates.teamBattles   || 0,
      referrals:     updates.referrals     || 0,
    })
    .onConflictDoUpdate({
      target: [veloxfiMissions.username, veloxfiMissions.missionDate],
      set: {
        battlesPlayed: sql`${veloxfiMissions.battlesPlayed} + ${updates.battlesPlayed || 0}`,
        thirtyMinWins: sql`${veloxfiMissions.thirtyMinWins} + ${updates.thirtyMinWins || 0}`,
        teamBattles:   sql`${veloxfiMissions.teamBattles}   + ${updates.teamBattles   || 0}`,
        referrals:     sql`${veloxfiMissions.referrals}     + ${updates.referrals     || 0}`,
      },
    });

  const [mission] = await db
    .select()
    .from(veloxfiMissions)
    .where(and(eq(veloxfiMissions.username, username), eq(veloxfiMissions.missionDate, missionDate)))
    .limit(1);

  if (!mission) return [];

  const completed: Array<{ id: string; name: string; reward: number }> = [];
  const rewardSet: Partial<Record<MissionRField, boolean>> = {};
  let totalReward = 0;

  for (const def of MISSION_DEFS) {
    const progress = mission[def.field] as number;
    const rewarded = mission[def.rewardField] as boolean;
    if (progress >= def.target && !rewarded) {
      completed.push({ id: def.key, name: def.name, reward: def.reward });
      rewardSet[def.rewardField] = true;
      totalReward += def.reward;
    }
  }

  if (completed.length > 0) {
    await db.update(veloxfiMissions)
      .set(rewardSet as any)
      .where(and(eq(veloxfiMissions.username, username), eq(veloxfiMissions.missionDate, missionDate)));

    await db.update(veloxfiUsers)
      .set({ tokens: sql`${veloxfiUsers.tokens} + ${totalReward}` })
      .where(eq(veloxfiUsers.username, username));
  }

  return completed;
}

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
      isTeamBattle,
    } = req.body;

    if (!coinAId || !coinBId || !result) {
      res.status(400).json({ error: "Missing required battle fields." });
      return;
    }

    const tf = parseInt(timeframe) || 300;
    const isWin = result === 'win';

    await db.insert(veloxfiBattles).values({
      username: user.username,
      coinAId, coinBId,
      coinAName: coinAName || coinAId,
      coinBName: coinBName || coinBId,
      coinAEmoji: coinAEmoji || "",
      coinBEmoji: coinBEmoji || "",
      timeframe: tf,
      pickedWinner, actualWinner, result,
      tokensEarned: parseInt(tokensEarned) || 0,
      entryPriceA: parseFloat(entryPriceA) || 0,
      entryPriceB: parseFloat(entryPriceB) || 0,
      finalPriceA: parseFloat(finalPriceA) || 0,
      finalPriceB: parseFloat(finalPriceB) || 0,
      changeA: parseFloat(changeA) || 0,
      changeB: parseFloat(changeB) || 0,
    });

    // Award XP
    const xpGain    = calcBattleXP(result, tf);
    const oldXPInfo = getXPInfo(user.xp ?? 0);
    const newXP     = (user.xp ?? 0) + xpGain;
    const newXPInfo = getXPInfo(newXP);
    const leveledUp = newXPInfo.level > oldXPInfo.level;
    await db.update(veloxfiUsers).set({ xp: newXP }).where(eq(veloxfiUsers.username, user.username));

    // Re-read tokens (client may have updated them already)
    const [freshUser] = await db
      .select({ tokens: veloxfiUsers.tokens })
      .from(veloxfiUsers)
      .where(eq(veloxfiUsers.username, user.username))
      .limit(1);
    const currentTokens = freshUser?.tokens ?? user.tokens;

    // All battles for achievement check
    const allBattles = await db
      .select({ result: veloxfiBattles.result, timeframe: veloxfiBattles.timeframe, createdAt: veloxfiBattles.createdAt })
      .from(veloxfiBattles)
      .where(eq(veloxfiBattles.username, user.username))
      .orderBy(desc(veloxfiBattles.createdAt));

    // Parallel: achievements + missions
    const [newAchievements, completedMissions] = await Promise.all([
      checkAndAwardAchievements(user.username, currentTokens, allBattles, isWin, tf),
      updateAndCheckMissions(user.username, {
        battlesPlayed: 1,
        thirtyMinWins: isWin && tf === 1800 ? 1 : 0,
        teamBattles:   isTeamBattle ? 1 : 0,
      }),
    ]);

    // Log activity events (fire-and-forget)
    const aEmoji = req.body.coinAEmoji || '';
    const bEmoji = req.body.coinBEmoji || '';
    const aName  = req.body.coinAName  || coinAId;
    const bName  = req.body.coinBName  || coinBId;
    const actLogs: Promise<void>[] = [];
    if (isWin) {
      actLogs.push(logActivity('battle_win', user.username,
        `🏆 ${user.username} won ${aEmoji}${aName} vs ${bEmoji}${bName} — earned ${parseInt(tokensEarned) || 0} $BATTLE`));
    }
    if (leveledUp) {
      actLogs.push(logActivity('level_up', user.username,
        `⬆️ ${user.username} reached ${newXPInfo.levelName}`));
    }
    for (const achId of newAchievements) {
      const achName = ACHIEVEMENT_NAMES[achId] || achId;
      actLogs.push(logActivity('achievement', user.username,
        `🎯 ${user.username} unlocked ${achName}`));
    }
    await Promise.all(actLogs);

    res.json({
      ok: true,
      xpGain, newXP, leveledUp,
      newLevel:         newXPInfo.level,
      newLevelName:     newXPInfo.levelName,
      newAchievements,
      completedMissions,
    });
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

    const achievementRows = await db
      .select({ achievementId: veloxfiAchievements.achievementId, earnedAt: veloxfiAchievements.earnedAt })
      .from(veloxfiAchievements)
      .where(eq(veloxfiAchievements.username, user.username));

    // Today's missions
    const missionDate = getTodayUTC();
    const [todayMission] = await db
      .select()
      .from(veloxfiMissions)
      .where(and(eq(veloxfiMissions.username, user.username), eq(veloxfiMissions.missionDate, missionDate)))
      .limit(1);

    const missions = todayMission
      ? {
          date:          todayMission.missionDate,
          battlesPlayed: todayMission.battlesPlayed,
          thirtyMinWins: todayMission.thirtyMinWins,
          teamBattles:   todayMission.teamBattles,
          referrals:     todayMission.referrals,
          m1Rewarded:    todayMission.m1Rewarded,
          m2Rewarded:    todayMission.m2Rewarded,
          m3Rewarded:    todayMission.m3Rewarded,
          m4Rewarded:    todayMission.m4Rewarded,
        }
      : {
          date: missionDate,
          battlesPlayed: 0, thirtyMinWins: 0, teamBattles: 0, referrals: 0,
          m1Rewarded: false, m2Rewarded: false, m3Rewarded: false, m4Rewarded: false,
        };

    // All-time game activity per game (plays + wolf earned)
    const gameActivityRows = await db
      .select({
        game:      veloxfiGameSessions.game,
        plays:     sql<number>`count(*)::int`,
        totalWolf: sql<number>`coalesce(sum(${veloxfiGameSessions.wolfEarned}), 0)::int`,
      })
      .from(veloxfiGameSessions)
      .where(eq(veloxfiGameSessions.username, user.username))
      .groupBy(veloxfiGameSessions.game);

    // Today's game plays for mission progress
    const todayMidnight = new Date();
    todayMidnight.setUTCHours(0, 0, 0, 0);
    const todayGameRows = await db
      .select({
        game:  veloxfiGameSessions.game,
        plays: sql<number>`count(*)::int`,
      })
      .from(veloxfiGameSessions)
      .where(and(
        eq(veloxfiGameSessions.username, user.username),
        gte(veloxfiGameSessions.createdAt, todayMidnight),
      ))
      .groupBy(veloxfiGameSessions.game);

    const gameActivity: Record<string, { plays: number; totalWolf: number }> = {};
    gameActivityRows.forEach(r => { gameActivity[r.game] = { plays: r.plays, totalWolf: r.totalWolf }; });

    const todayByGame: Record<string, number> = {};
    todayGameRows.forEach(r => { todayByGame[r.game] = r.plays; });

    const gameMissions = {
      rocketMiner:  todayByGame['rocket-miner']  || 0,
      snake:        todayByGame['crypto-snake']   || 0,
      battleTetris: todayByGame['battle-tetris']  || 0,
      wolfRun:      todayByGame['wolf-run']       || 0,
    };

    const totalBattles = stats?.totalBattles || 0;
    const totalWins    = stats?.totalWins    || 0;
    const totalLosses  = stats?.totalLosses  || 0;
    const totalTokens  = stats?.totalTokens  || 0;
    const winPct       = totalBattles > 0 ? Math.round((totalWins / totalBattles) * 100) : 0;

    let activeBattle: object | null = null;
    if (user.activeBattle) {
      try { activeBattle = JSON.parse(user.activeBattle); } catch {}
    }

    const xpInfo = getXPInfo(user.xp ?? 0);
    res.json({
      username:       user.username,
      email:          user.email,
      tokens:         user.tokens,
      wolf:           user.wolf ?? 0,
      createdAt:      user.createdAt,
      referralCount:  user.referralCount,
      referralTokens: user.referralTokens,
      walletAddress:      user.walletAddress      ?? null,
      claimRequestedAt:   user.claimRequestedAt   ?? null,
      claimedAt:          user.claimedAt           ?? null,
      wolfMiningStart:    user.wolfMiningStart     ?? null,
      activeBattle,
      xp:             user.xp ?? 0,
      level:          xpInfo.level,
      levelName:      xpInfo.levelName,
      currentLevelXP: xpInfo.currentLevelXP,
      nextLevelXP:    xpInfo.nextLevelXP,
      stats:        { totalBattles, totalWins, totalLosses, winPct, totalTokens },
      battles,
      achievements: achievementRows.map(a => ({ id: a.achievementId, earnedAt: a.earnedAt })),
      missions,
      gameActivity,
      gameMissions,
    });
  } catch (e) {
    console.error("veloxfi/profile GET error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── Homepage stats bar ────────────────────────────────────────────────────────

router.get("/veloxfi/stats", async (_req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const [todayRow] = await db
      .select({
        battlesToday: sql<number>`count(*)::int`,
        tokensToday:  sql<number>`coalesce(sum(${veloxfiBattles.tokensEarned}),0)::int`,
      })
      .from(veloxfiBattles)
      .where(gte(veloxfiBattles.createdAt, todayStart));

    const [allTimeRow] = await db
      .select({ totalEarned: sql<number>`coalesce(sum(${veloxfiUsers.tokens}),0)::int` })
      .from(veloxfiUsers);

    const [activeRow] = await db
      .select({ cnt: sql<number>`count(*)::int` })
      .from(veloxfiUsers)
      .where(
        sql`${veloxfiUsers.activeBattle} IS NOT NULL
            AND (${veloxfiUsers.activeBattle}::jsonb->>'endTime')::bigint > ${Date.now()}`
      );

    res.json({
      battlesToday: todayRow?.battlesToday   ?? 0,
      tokensToday:  todayRow?.tokensToday    ?? 0,
      activeNow:    activeRow?.cnt           ?? 0,
      totalEarned:  allTimeRow?.totalEarned  ?? 0,
    });
  } catch (e) {
    console.error("veloxfi/stats GET error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── Active battle persistence ─────────────────────────────────────────────────

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

    const aEmoji = battleData.coinAEmoji || '';
    const bEmoji = battleData.coinBEmoji || '';
    const aName  = battleData.coinAName  || battleData.coinAId;
    const bName  = battleData.coinBName  || battleData.coinBId;
    const tf     = tfLabel(parseInt(battleData.timeframe) || 300);
    logActivity('battle_start', user.username,
      `⚔️ ${user.username} just started ${aEmoji}${aName} vs ${bEmoji}${bName} — ${tf} battle`);

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

// ── Server-side battle resolution ─────────────────────────────────────────────

const TIMEFRAME_REWARDS: Record<number, number> = { 300: 1, 900: 2, 1800: 3 };

async function fetchPriceForCoins(coinAId: string, coinBId: string): Promise<{ pA: number | null; pB: number | null }> {
  const ids = [coinAId, coinBId];
  let pA: number | null = null;
  let pB: number | null = null;

  if (isSharedCacheUsable()) {
    const cA = getSharedCoin(coinAId);
    const cB = getSharedCoin(coinBId);
    if (cA?.usd) pA = cA.usd;
    if (cB?.usd) pB = cB.usd;
    if (pA && pB) return { pA, pB };
  }

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

    const { pA: rawPA, pB: rawPB } = await fetchPriceForCoins(ab.coinAId, ab.coinBId);
    const finalPriceA = rawPA ?? ab.entryPriceA;
    const finalPriceB = rawPB ?? ab.entryPriceB;

    const changeA      = ab.entryPriceA ? (finalPriceA - ab.entryPriceA) / ab.entryPriceA * 100 : 0;
    const changeB      = ab.entryPriceB ? (finalPriceB - ab.entryPriceB) / ab.entryPriceB * 100 : 0;
    const actualWinner = changeA >= changeB ? ab.coinAId : ab.coinBId;
    const isCorrect    = ab.pickedWinner === actualWinner;
    const reward       = isCorrect ? (TIMEFRAME_REWARDS[ab.timeframe] || 1) : 0;
    const tf           = parseInt(ab.timeframe) || 300;

    await db.insert(veloxfiBattles).values({
      username: freshUser.username,
      coinAId: ab.coinAId, coinBId: ab.coinBId,
      coinAName: ab.coinAName || ab.coinAId,
      coinBName: ab.coinBName || ab.coinBId,
      coinAEmoji: ab.coinAEmoji || "",
      coinBEmoji: ab.coinBEmoji || "",
      timeframe: tf,
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

    const newTokens  = freshUser.tokens + reward;
    const xpGain     = calcBattleXP(isCorrect ? 'win' : 'loss', tf);
    const oldXPInfo  = getXPInfo(freshUser.xp ?? 0);
    const newXP      = (freshUser.xp ?? 0) + xpGain;
    const newXPInfo  = getXPInfo(newXP);
    const leveledUp  = newXPInfo.level > oldXPInfo.level;

    await db.update(veloxfiUsers)
      .set({ activeBattle: null, tokens: newTokens, xp: newXP })
      .where(eq(veloxfiUsers.username, freshUser.username));

    const allBattles = await db
      .select({ result: veloxfiBattles.result, timeframe: veloxfiBattles.timeframe, createdAt: veloxfiBattles.createdAt })
      .from(veloxfiBattles)
      .where(eq(veloxfiBattles.username, freshUser.username))
      .orderBy(desc(veloxfiBattles.createdAt));

    const [newAchievements, completedMissions] = await Promise.all([
      checkAndAwardAchievements(freshUser.username, newTokens, allBattles, isCorrect, tf),
      updateAndCheckMissions(freshUser.username, {
        battlesPlayed: 1,
        thirtyMinWins: isCorrect && tf === 1800 ? 1 : 0,
      }),
    ]);

    // Log activity events (fire-and-forget)
    const aeEmoji = ab.coinAEmoji || '';
    const beEmoji = ab.coinBEmoji || '';
    const aeName  = ab.coinAName  || ab.coinAId;
    const beName  = ab.coinBName  || ab.coinBId;
    const resolveActs: Promise<void>[] = [];
    if (isCorrect) {
      resolveActs.push(logActivity('battle_win', freshUser.username,
        `🏆 ${freshUser.username} won ${aeEmoji}${aeName} vs ${beEmoji}${beName} — earned ${reward} $BATTLE`));
    }
    if (leveledUp) {
      resolveActs.push(logActivity('level_up', freshUser.username,
        `⬆️ ${freshUser.username} reached ${newXPInfo.levelName}`));
    }
    for (const achId of newAchievements) {
      const achName = ACHIEVEMENT_NAMES[achId] || achId;
      resolveActs.push(logActivity('achievement', freshUser.username,
        `🎯 ${freshUser.username} unlocked ${achName}`));
    }
    await Promise.all(resolveActs);

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
      xpGain,
      newXP,
      leveledUp,
      newLevel:         newXPInfo.level,
      newLevelName:     newXPInfo.levelName,
      newAchievements,
      completedMissions,
    });
  } catch (e) {
    console.error("veloxfi/resolve-battle POST error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── Activity feed (public) ────────────────────────────────────────────────────

router.get("/veloxfi/activity-feed", async (_req, res) => {
  try {
    const activities = await db
      .select()
      .from(veloxfiActivity)
      .orderBy(desc(veloxfiActivity.id))
      .limit(20);
    res.json(activities);
  } catch (e) {
    console.error("veloxfi/activity-feed GET error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;
