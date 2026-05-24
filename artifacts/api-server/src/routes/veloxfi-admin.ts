import { Router } from "express";
import { db } from "@workspace/db";
import {
  veloxfiUsers,
  veloxfiBattles,
  veloxfiClaims,
  veloxfiWaitlist,
  veloxfiActivity,
  veloxfiAchievements,
  veloxfiMissions,
  veloxfiDailyActions,
  veloxfiPets,
  veloxfiPetAccessories,
  veloxfiWolfEarnings,
  veloxfiAuditLog,
} from "@workspace/db/schema";
import { eq, desc, sql, isNotNull, isNull } from "drizzle-orm";
import { sendConversionPaidEmail } from "../lib/mailer";

const BATTLE_SUPPLY_CAP = 95_000_000;

const ADMIN_PASSWORD = "veloxfi2025";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  const pw = req.headers["x-admin-password"];
  if (pw !== ADMIN_PASSWORD) { res.status(401).json({ error: "Unauthorized" }); return; }
  next();
}

router.post("/veloxfi/admin/verify", (req: any, res: any) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) res.json({ ok: true });
  else res.status(401).json({ error: "Invalid password" });
});

router.get("/veloxfi/admin/stats", requireAdmin as any, async (_req: any, res: any) => {
  try {
    const [userCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(veloxfiUsers);

    // New users today (registrations since UTC midnight).
    const [newToday] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(veloxfiUsers)
      .where(sql`created_at >= current_date`);

    // User list — kept here because the Users tab still consumes it.
    const users = await db
      .select({
        username:          veloxfiUsers.username,
        email:             veloxfiUsers.email,
        tokens:            veloxfiUsers.tokens,
        wolf:              veloxfiUsers.wolf,
        createdAt:         veloxfiUsers.createdAt,
        walletAddress:     veloxfiUsers.walletAddress,
        registrationIp:    veloxfiUsers.registrationIp,
        claimedAt:         veloxfiUsers.claimedAt,
      })
      .from(veloxfiUsers)
      .orderBy(desc(veloxfiUsers.createdAt));

    // Daily new-user registrations for the last 7 days — feeds the chart
    // that used to plot battles (which no longer exist).
    const dailyRegistrations = await db
      .select({
        date:  sql<string>`date_trunc('day', created_at)::date::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(veloxfiUsers)
      .where(sql`created_at >= current_date - interval '6 days'`)
      .groupBy(sql`date_trunc('day', created_at)::date`)
      .orderBy(sql`date_trunc('day', created_at)::date`);

    // Recent activity feed — replaces the legacy 'last 10 fights' list.
    const recentActivity = await db
      .select()
      .from(veloxfiActivity)
      .orderBy(desc(veloxfiActivity.createdAt))
      .limit(15);

    res.json({
      totalUsers:        userCount?.count   || 0,
      newUsersToday:     newToday?.count    || 0,
      users,
      dailyRegistrations,
      recentActivity,
    });
  } catch (e) {
    console.error("admin/stats error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Claims (from veloxfi_claims table) ────────────────────────────────────────

router.get("/veloxfi/admin/claims", requireAdmin as any, async (_req: any, res: any) => {
  try {
    const claims = await db
      .select()
      .from(veloxfiClaims)
      .orderBy(desc(veloxfiClaims.requestedAt));
    res.json(claims);
  } catch (e) {
    console.error("admin/claims error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/veloxfi/admin/claims/:id/paid", requireAdmin as any, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid claim id" }); return; }
    const [updated] = await db.update(veloxfiClaims)
      .set({ paidAt: new Date() })
      .where(eq(veloxfiClaims.id, id))
      .returning();
    if (updated) {
      // Look up the user's email for the confirmation email.
      const [u] = await db.select({ email: veloxfiUsers.email, username: veloxfiUsers.username })
        .from(veloxfiUsers).where(eq(veloxfiUsers.username, updated.username));
      if (u?.email) {
        sendConversionPaidEmail(u.email, u.username, updated.amount, updated.walletAddress ?? "").catch(() => {});
      }
    }
    res.json({ ok: true });
  } catch (e) {
    console.error("admin/claims paid error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// Reset a user's WOLF and/or $BATTLE balance to 0 — used to clean up
// suspect balances that came from the old /update-tokens backdoor.
router.put("/veloxfi/admin/users/:username/reset", requireAdmin as any, async (req: any, res: any) => {
  try {
    const username = String(req.params.username ?? "");
    const resetTokens = req.body?.tokens !== false;   // default true
    const resetWolf   = req.body?.wolf   !== false;   // default true
    const patch: { tokens?: number; wolf?: number } = {};
    if (resetTokens) patch.tokens = 0;
    if (resetWolf)   patch.wolf   = 0;
    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: "Nothing to reset." }); return;
    }
    const result = await db.update(veloxfiUsers).set(patch).where(eq(veloxfiUsers.username, username)).returning({ username: veloxfiUsers.username });
    if (result.length === 0) {
      res.status(404).json({ error: "User not found." }); return;
    }
    res.json({ ok: true, username, patch });
  } catch (e) {
    console.error("admin/users/reset error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// Full purge of every row that references a username, across all 12
// veloxfi tables. Used to clean up test accounts. Destructive — there is
// no undo. The order matters only loosely (no FK constraints), but we
// keep the parent veloxfi_users row last so partial failures don't
// orphan the user record.
router.delete("/veloxfi/admin/users/:username", requireAdmin as any, async (req: any, res: any) => {
  try {
    const username = String(req.params.username ?? "");
    if (!username) {
      res.status(400).json({ error: "Missing username." }); return;
    }

    // Existence check so the response is honest about what happened.
    const [existing] = await db.select({ u: veloxfiUsers.username }).from(veloxfiUsers).where(eq(veloxfiUsers.username, username));
    if (!existing) {
      res.status(404).json({ error: "User not found." }); return;
    }

    // Wipe child rows first.
    await db.delete(veloxfiActivity).where(eq(veloxfiActivity.username, username));
    await db.delete(veloxfiClaims).where(eq(veloxfiClaims.username, username));
    await db.delete(veloxfiBattles).where(eq(veloxfiBattles.username, username));
    await db.delete(veloxfiWolfEarnings).where(eq(veloxfiWolfEarnings.username, username));
    await db.delete(veloxfiMissions).where(eq(veloxfiMissions.username, username));
    await db.delete(veloxfiAchievements).where(eq(veloxfiAchievements.username, username));
    await db.delete(veloxfiAuditLog).where(eq(veloxfiAuditLog.username, username));
    await db.delete(veloxfiDailyActions).where(eq(veloxfiDailyActions.username, username));
    await db.delete(veloxfiPets).where(eq(veloxfiPets.username, username));
    await db.delete(veloxfiPetAccessories).where(eq(veloxfiPetAccessories.username, username));
    await db.delete(veloxfiWaitlist).where(eq(veloxfiWaitlist.username, username));

    // Other users may have this username as their referredBy. Clear that
    // pointer so the deleted account isn't dangling-referenced.
    await db.update(veloxfiUsers)
      .set({ referredBy: null })
      .where(eq(veloxfiUsers.referredBy, username));

    // Finally, the parent row.
    await db.delete(veloxfiUsers).where(eq(veloxfiUsers.username, username));

    res.json({ ok: true, deleted: username });
  } catch (e) {
    console.error("admin/users/delete error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

router.delete("/veloxfi/admin/claims/:id/paid", requireAdmin as any, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid claim id" }); return; }
    await db.update(veloxfiClaims).set({ paidAt: null }).where(eq(veloxfiClaims.id, id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── Supply / waitlist management ─────────────────────────────────────────────

router.get("/veloxfi/admin/supply", requireAdmin as any, async (_req: any, res: any) => {
  try {
    const [distRow] = await db
      .select({ total: sql<number>`coalesce(sum(${veloxfiUsers.tokens}), 0)::float8` })
      .from(veloxfiUsers);
    const distributed = Number(distRow?.total ?? 0);
    const remaining   = Math.max(0, BATTLE_SUPPLY_CAP - distributed);

    const [pendingRow] = await db
      .select({
        cnt:       sql<number>`count(*)::int`,
        battleSum: sql<number>`coalesce(sum(${veloxfiWaitlist.battleAmount}), 0)::float8`,
      })
      .from(veloxfiWaitlist)
      .where(isNull(veloxfiWaitlist.fulfilledAt));

    res.json({
      cap:               BATTLE_SUPPLY_CAP,
      distributed:       Math.round(distributed * 10000) / 10000,
      remaining:         Math.round(remaining * 10000) / 10000,
      percentUsed:       Math.round((distributed / BATTLE_SUPPLY_CAP) * 10000) / 100,
      waitlistCount:     pendingRow?.cnt ?? 0,
      waitlistBattleSum: Math.round(Number(pendingRow?.battleSum ?? 0) * 10000) / 10000,
    });
  } catch (e) {
    console.error("admin/supply error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/veloxfi/admin/waitlist", requireAdmin as any, async (_req: any, res: any) => {
  try {
    const entries = await db
      .select({
        id:            veloxfiWaitlist.id,
        username:      veloxfiWaitlist.username,
        wolfAmount:    veloxfiWaitlist.wolfAmount,
        battleAmount:  veloxfiWaitlist.battleAmount,
        walletAddress: veloxfiWaitlist.walletAddress,
        requestedAt:   veloxfiWaitlist.requestedAt,
        fulfilledAt:   veloxfiWaitlist.fulfilledAt,
      })
      .from(veloxfiWaitlist)
      .orderBy(desc(veloxfiWaitlist.requestedAt))
      .limit(200);
    res.json(entries);
  } catch (e) {
    console.error("admin/waitlist error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/veloxfi/admin/waitlist/:id/fulfill", requireAdmin as any, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [updated] = await db.update(veloxfiWaitlist)
      .set({ fulfilledAt: new Date() })
      .where(eq(veloxfiWaitlist.id, id))
      .returning();
    if (updated) {
      const [u] = await db.select({ email: veloxfiUsers.email, username: veloxfiUsers.username })
        .from(veloxfiUsers).where(eq(veloxfiUsers.username, updated.username));
      if (u?.email) {
        sendConversionPaidEmail(u.email, u.username, updated.battleAmount, updated.walletAddress ?? "").catch(() => {});
      }
    }
    res.json({ ok: true });
  } catch (e) {
    console.error("admin/waitlist/fulfill error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/veloxfi/admin/export-csv", requireAdmin as any, async (_req: any, res: any) => {
  try {
    const claims = await db
      .select()
      .from(veloxfiClaims)
      .orderBy(desc(veloxfiClaims.requestedAt));

    const rows = claims.map(c =>
      `${c.username},${c.walletAddress},${c.amount},${c.requestedAt.toISOString()},${c.paidAt ? c.paidAt.toISOString() : 'PENDING'}`
    );
    const csv = "username,wallet_address,amount,requested_at,paid_at\n" + rows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="veloxfi-claims.csv"');
    res.send(csv);
  } catch (e) {
    console.error("admin/export-csv error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
