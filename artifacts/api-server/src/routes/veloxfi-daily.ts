import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers, veloxfiActivity, veloxfiDailyActions, veloxfiWolfEarnings } from "@workspace/db/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import { sendMilestoneEmail } from "../lib/mailer";

const router = Router();

// ── Auth helper (mirrors veloxfi-auth.ts) ────────────────────────────────────
async function requireAuth(req: Request & { veloxfiUser?: typeof veloxfiUsers.$inferSelect }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized." }); return; }
  const token = auth.slice(7);
  const [user] = await db.select().from(veloxfiUsers).where(eq(veloxfiUsers.sessionToken, token));
  if (!user) { res.status(401).json({ error: "Invalid session." }); return; }
  req.veloxfiUser = user;
  next();
}

// ── Configuration ────────────────────────────────────────────────────────────
// Spin wheel — reward in WOLF (not $BATTLE — $BATTLE comes from the capped
// buyback pool only).
const SPIN_REWARDS = [25, 50, 100, 250, 500, 1000, 5000];
const SPIN_WEIGHTS = [22, 22, 18, 16, 12,   8,    2]; // % chance each, sum=100

// Treasure chests — cooldown in milliseconds + WOLF reward range.
const CHESTS: Record<string, { cooldownMs: number; min: number; max: number }> = {
  bronze: { cooldownMs:  4 * 60 * 60 * 1000, min:   50, max:  200 },
  silver: { cooldownMs:  8 * 60 * 60 * 1000, min:  200, max:  800 },
  gold:   { cooldownMs: 24 * 60 * 60 * 1000, min: 1000, max: 5000 },
};

// Streak milestones — once-only per user, paid out in WOLF.
const MILESTONES: Record<number, number> = { 3: 100, 7: 250, 14: 500, 21: 1000, 30: 2500 };

// Social / referral bounties — claim once per user, honor system for socials,
// referral bounty unlocks at the configured count.
const BOUNTIES: Record<string, { reward: number; require: "manual" | { referrals: number } }> = {
  bounty_telegram:    { reward: 100, require: "manual" },
  bounty_x:           { reward: 100, require: "manual" },
  bounty_referral_1:  { reward: 250, require: { referrals: 1 } },
  bounty_referral_5:  { reward: 1500, require: { referrals: 5 } },
  bounty_referral_10: { reward: 4000, require: { referrals: 10 } },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function startOfUtcDay(d = new Date()): Date {
  const out = new Date(d);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}

function pickWeighted(rewards: number[], weights: number[]): number {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < rewards.length; i++) {
    r -= weights[i];
    if (r <= 0) return rewards[i];
  }
  return rewards[rewards.length - 1];
}

async function awardWolf(username: string, amount: number) {
  await db.update(veloxfiUsers)
    .set({ wolf: (await db.select({ wolf: veloxfiUsers.wolf }).from(veloxfiUsers).where(eq(veloxfiUsers.username, username)))[0].wolf + amount })
    .where(eq(veloxfiUsers.username, username));
}

async function logAction(username: string, actionType: string, rewardWolf: number) {
  await db.insert(veloxfiDailyActions).values({ username, actionType, rewardWolf });
  // Also feed the period-bound leaderboard if there was a reward.
  if (rewardWolf > 0) {
    const source =
      actionType === "spin"                    ? "spin" :
      actionType.startsWith("chest_")          ? "chest" :
      actionType.startsWith("milestone_")      ? "milestone" :
      actionType.startsWith("bounty_")         ? "bounty" :
      "daily";
    await db.insert(veloxfiWolfEarnings).values({ username, source, amount: rewardWolf });
  }
}

// ── GET /veloxfi/daily/status ────────────────────────────────────────────────
router.get("/veloxfi/daily/status", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser as typeof veloxfiUsers.$inferSelect;
    const now = new Date();
    const dayStart = startOfUtcDay(now);

    const recent = await db
      .select()
      .from(veloxfiDailyActions)
      .where(eq(veloxfiDailyActions.username, user.username))
      .orderBy(desc(veloxfiDailyActions.performedAt))
      .limit(200);

    const spinToday = recent.find(a => a.actionType === "spin" && a.performedAt >= dayStart) ?? null;

    const chests: Record<string, { ready: boolean; nextAtMs: number; lastReward?: number }> = {};
    for (const tier of Object.keys(CHESTS)) {
      const last = recent.find(a => a.actionType === `chest_${tier}`);
      const cooldownMs = CHESTS[tier].cooldownMs;
      if (!last) {
        chests[tier] = { ready: true, nextAtMs: 0 };
      } else {
        const nextAt = last.performedAt.getTime() + cooldownMs;
        chests[tier] = { ready: now.getTime() >= nextAt, nextAtMs: nextAt, lastReward: last.rewardWolf };
      }
    }

    const milestones: Record<string, { claimed: boolean; available: boolean; reward: number; day: number }> = {};
    for (const dayStr of Object.keys(MILESTONES)) {
      const day = Number(dayStr);
      const claimed = recent.some(a => a.actionType === `milestone_${day}`);
      milestones[String(day)] = {
        day,
        claimed,
        available: !claimed && (user.dailyStreak ?? 0) >= day,
        reward: MILESTONES[day],
      };
    }

    const bounties: Record<string, { claimed: boolean; available: boolean; reward: number }> = {};
    for (const key of Object.keys(BOUNTIES)) {
      const def = BOUNTIES[key];
      const claimed = recent.some(a => a.actionType === key);
      let available = !claimed;
      if (def.require !== "manual") {
        available = available && (user.referralCount ?? 0) >= def.require.referrals;
      }
      bounties[key] = { claimed, available, reward: def.reward };
    }

    res.json({
      spin: {
        availableToday: !spinToday,
        lastReward: spinToday?.rewardWolf ?? null,
        rewards: SPIN_REWARDS,
        weights: SPIN_WEIGHTS,
      },
      chests,
      milestones,
      bounties,
      now: now.getTime(),
    });
  } catch (e) {
    console.error("daily/status error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── POST /veloxfi/daily/spin ─────────────────────────────────────────────────
router.post("/veloxfi/daily/spin", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser as typeof veloxfiUsers.$inferSelect;
    const dayStart = startOfUtcDay();

    const [already] = await db
      .select()
      .from(veloxfiDailyActions)
      .where(and(
        eq(veloxfiDailyActions.username, user.username),
        eq(veloxfiDailyActions.actionType, "spin"),
        gte(veloxfiDailyActions.performedAt, dayStart),
      ))
      .limit(1);

    if (already) { res.status(409).json({ error: "Already spun today.", lastReward: already.rewardWolf }); return; }

    const reward = pickWeighted(SPIN_REWARDS, SPIN_WEIGHTS);
    await awardWolf(user.username, reward);
    await logAction(user.username, "spin", reward);
    await db.insert(veloxfiActivity).values({
      type: "spin",
      username: user.username,
      message: `won ${reward} WOLF on the daily spin`,
    });

    res.json({ ok: true, reward, newWolfBalance: (user.wolf ?? 0) + reward });
  } catch (e) {
    console.error("daily/spin error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── POST /veloxfi/daily/chest/:tier ──────────────────────────────────────────
router.post("/veloxfi/daily/chest/:tier", requireAuth as any, async (req: any, res) => {
  try {
    const tier = String(req.params.tier);
    const def = CHESTS[tier];
    if (!def) { res.status(400).json({ error: "Unknown chest tier." }); return; }
    const user = req.veloxfiUser as typeof veloxfiUsers.$inferSelect;

    const [last] = await db
      .select()
      .from(veloxfiDailyActions)
      .where(and(
        eq(veloxfiDailyActions.username, user.username),
        eq(veloxfiDailyActions.actionType, `chest_${tier}`),
      ))
      .orderBy(desc(veloxfiDailyActions.performedAt))
      .limit(1);

    if (last) {
      const nextAt = last.performedAt.getTime() + def.cooldownMs;
      if (Date.now() < nextAt) {
        res.status(409).json({ error: "Chest on cooldown.", nextAtMs: nextAt });
        return;
      }
    }

    const reward = Math.floor(def.min + Math.random() * (def.max - def.min));
    await awardWolf(user.username, reward);
    await logAction(user.username, `chest_${tier}`, reward);
    await db.insert(veloxfiActivity).values({
      type: "chest",
      username: user.username,
      message: `opened a ${tier} chest for ${reward} WOLF`,
    });

    res.json({ ok: true, reward, tier, newWolfBalance: (user.wolf ?? 0) + reward });
  } catch (e) {
    console.error("daily/chest error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── POST /veloxfi/daily/milestone/:day ───────────────────────────────────────
router.post("/veloxfi/daily/milestone/:day", requireAuth as any, async (req: any, res) => {
  try {
    const day = parseInt(String(req.params.day), 10);
    const reward = MILESTONES[day];
    if (!reward) { res.status(400).json({ error: "Unknown milestone." }); return; }
    const user = req.veloxfiUser as typeof veloxfiUsers.$inferSelect;
    if ((user.dailyStreak ?? 0) < day) {
      res.status(400).json({ error: `Streak must be at least ${day} days.` }); return;
    }

    const [already] = await db
      .select()
      .from(veloxfiDailyActions)
      .where(and(
        eq(veloxfiDailyActions.username, user.username),
        eq(veloxfiDailyActions.actionType, `milestone_${day}`),
      ))
      .limit(1);
    if (already) { res.status(409).json({ error: "Milestone already claimed." }); return; }

    await awardWolf(user.username, reward);
    await logAction(user.username, `milestone_${day}`, reward);
    await db.insert(veloxfiActivity).values({
      type: "milestone",
      username: user.username,
      message: `hit day ${day} streak and claimed ${reward} WOLF`,
    });
    // Notify the user — best-effort, never blocks the claim response.
    sendMilestoneEmail(user.email, user.username, day, reward).catch(() => {});

    res.json({ ok: true, reward, day, newWolfBalance: (user.wolf ?? 0) + reward });
  } catch (e) {
    console.error("daily/milestone error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── POST /veloxfi/daily/bounty/:id ───────────────────────────────────────────
router.post("/veloxfi/daily/bounty/:id", requireAuth as any, async (req: any, res) => {
  try {
    const id = String(req.params.id);
    const def = BOUNTIES[id];
    if (!def) { res.status(400).json({ error: "Unknown bounty." }); return; }
    const user = req.veloxfiUser as typeof veloxfiUsers.$inferSelect;

    if (def.require !== "manual" && (user.referralCount ?? 0) < def.require.referrals) {
      res.status(400).json({ error: `Needs ${def.require.referrals} referrals.` }); return;
    }

    const [already] = await db
      .select()
      .from(veloxfiDailyActions)
      .where(and(
        eq(veloxfiDailyActions.username, user.username),
        eq(veloxfiDailyActions.actionType, id),
      ))
      .limit(1);
    if (already) { res.status(409).json({ error: "Bounty already claimed." }); return; }

    await awardWolf(user.username, def.reward);
    await logAction(user.username, id, def.reward);
    await db.insert(veloxfiActivity).values({
      type: "bounty",
      username: user.username,
      message: `claimed bounty ${id.replace("bounty_", "").replace("_", " ")} for ${def.reward} WOLF`,
    });

    res.json({ ok: true, reward: def.reward, id, newWolfBalance: (user.wolf ?? 0) + def.reward });
  } catch (e) {
    console.error("daily/bounty error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;
