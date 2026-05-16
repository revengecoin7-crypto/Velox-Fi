import { Router } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers, veloxfiBattles, veloxfiClaims, veloxfiWaitlist } from "@workspace/db/schema";
import { eq, desc, sql, isNotNull, isNull } from "drizzle-orm";

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

    const [battleStats] = await db
      .select({
        total:       sql<number>`count(*)::int`,
        tokensTotal: sql<number>`coalesce(sum(tokens_earned),0)::int`,
      })
      .from(veloxfiBattles);

    const [battlesTodayStats] = await db
      .select({
        total:       sql<number>`count(*)::int`,
        tokensTotal: sql<number>`coalesce(sum(tokens_earned),0)::int`,
      })
      .from(veloxfiBattles)
      .where(sql`created_at >= current_date`);

    const recentBattles = await db
      .select()
      .from(veloxfiBattles)
      .orderBy(desc(veloxfiBattles.createdAt))
      .limit(20);

    const users = await db
      .select({
        username:          veloxfiUsers.username,
        email:             veloxfiUsers.email,
        tokens:            veloxfiUsers.tokens,
        createdAt:         veloxfiUsers.createdAt,
        walletAddress:     veloxfiUsers.walletAddress,
        claimedAt:         veloxfiUsers.claimedAt,
        totalBattles:      sql<number>`count(${veloxfiBattles.id})::int`,
        totalTokensEarned: sql<number>`coalesce(sum(${veloxfiBattles.tokensEarned}),0)::int`,
      })
      .from(veloxfiUsers)
      .leftJoin(veloxfiBattles, eq(veloxfiUsers.username, veloxfiBattles.username))
      .groupBy(
        veloxfiUsers.username,
        veloxfiUsers.email,
        veloxfiUsers.tokens,
        veloxfiUsers.createdAt,
        veloxfiUsers.walletAddress,
        veloxfiUsers.claimedAt,
      )
      .orderBy(desc(veloxfiUsers.createdAt));

    const dailyBattles = await db
      .select({
        date:  sql<string>`date_trunc('day', created_at)::date::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(veloxfiBattles)
      .where(sql`created_at >= current_date - interval '6 days'`)
      .groupBy(sql`date_trunc('day', created_at)::date`)
      .orderBy(sql`date_trunc('day', created_at)::date`);

    res.json({
      totalUsers:      userCount?.count     || 0,
      battlesAllTime:  battleStats?.total   || 0,
      tokensAllTime:   battleStats?.tokensTotal || 0,
      battlesToday:    battlesTodayStats?.total       || 0,
      tokensToday:     battlesTodayStats?.tokensTotal || 0,
      recentBattles,
      users,
      dailyBattles,
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
    await db.update(veloxfiClaims).set({ paidAt: new Date() }).where(eq(veloxfiClaims.id, id));
    res.json({ ok: true });
  } catch (e) {
    console.error("admin/claims paid error:", e);
    res.status(500).json({ error: "Server error" });
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
    await db.update(veloxfiWaitlist)
      .set({ fulfilledAt: new Date() })
      .where(eq(veloxfiWaitlist.id, id));
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
