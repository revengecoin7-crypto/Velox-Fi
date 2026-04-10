import { Router } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers, veloxfiBattles } from "@workspace/db/schema";
import { eq, desc, sql, isNotNull } from "drizzle-orm";

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

router.get("/veloxfi/admin/claims", requireAdmin as any, async (_req: any, res: any) => {
  try {
    const claims = await db
      .select({
        username:      veloxfiUsers.username,
        walletAddress: veloxfiUsers.walletAddress,
        tokens:        veloxfiUsers.tokens,
        claimedAt:     veloxfiUsers.claimedAt,
        createdAt:     veloxfiUsers.createdAt,
      })
      .from(veloxfiUsers)
      .where(isNotNull(veloxfiUsers.walletAddress))
      .orderBy(desc(veloxfiUsers.tokens));
    res.json(claims);
  } catch (e) {
    console.error("admin/claims error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/veloxfi/admin/claims/:username/paid", requireAdmin as any, async (req: any, res: any) => {
  try {
    const { username } = req.params;
    const [user] = await db.select({ username: veloxfiUsers.username }).from(veloxfiUsers).where(eq(veloxfiUsers.username, username)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    await db.update(veloxfiUsers).set({ claimedAt: new Date() }).where(eq(veloxfiUsers.username, username));
    res.json({ ok: true });
  } catch (e) {
    console.error("admin/claims paid error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/veloxfi/admin/claims/:username/paid", requireAdmin as any, async (req: any, res: any) => {
  try {
    const { username } = req.params;
    await db.update(veloxfiUsers).set({ claimedAt: null }).where(eq(veloxfiUsers.username, username));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/veloxfi/admin/export-csv", requireAdmin as any, async (_req: any, res: any) => {
  try {
    const users = await db
      .select({
        username:      veloxfiUsers.username,
        walletAddress: veloxfiUsers.walletAddress,
        tokens:        veloxfiUsers.tokens,
        claimedAt:     veloxfiUsers.claimedAt,
      })
      .from(veloxfiUsers)
      .where(isNotNull(veloxfiUsers.walletAddress))
      .orderBy(desc(veloxfiUsers.tokens));

    const rows = users.map(u =>
      `${u.username},${u.walletAddress},${u.tokens},${u.claimedAt ? 'PAID' : 'PENDING'}`
    );
    const csv = "username,wallet_address,token_balance,status\n" + rows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="veloxfi-claims.csv"');
    res.send(csv);
  } catch (e) {
    console.error("admin/export-csv error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
