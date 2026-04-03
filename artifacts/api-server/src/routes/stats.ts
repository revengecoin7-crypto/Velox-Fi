import { Router, type IRouter } from "express";
import { eq, sql, sum, count } from "drizzle-orm";
import { db, siteVisitorsTable, siteCountersTable, presalePurchasesTable } from "@workspace/db";

const router: IRouter = Router();

/* ── helpers ── */
async function getOrInitCounter(key: string): Promise<number> {
  await db
    .insert(siteCountersTable)
    .values({ key, count: 0 })
    .onConflictDoNothing();
  const rows = await db
    .select()
    .from(siteCountersTable)
    .where(eq(siteCountersTable.key, key));
  return rows[0]?.count ?? 0;
}

async function incrementCounter(key: string): Promise<number> {
  const rows = await db
    .insert(siteCountersTable)
    .values({ key, count: 1 })
    .onConflictDoUpdate({
      target: siteCountersTable.key,
      set: { count: sql`${siteCountersTable.count} + 1` },
    })
    .returning();
  return rows[0]?.count ?? 1;
}

/* POST /stats/visit — record a unique visitor (idempotent) */
router.post("/stats/visit", async (req, res): Promise<void> => {
  const { visitorId } = req.body as { visitorId?: string };
  if (!visitorId || typeof visitorId !== "string") {
    res.status(400).json({ error: "visitorId is required" });
    return;
  }

  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    "";

  try {
    await db
      .insert(siteVisitorsTable)
      .values({ visitorId, ip })
      .onConflictDoNothing();

    const [row] = await db
      .select({ total: count() })
      .from(siteVisitorsTable);

    res.json({ ok: true, totalVisitors: row?.total ?? 0 });
  } catch (err) {
    console.error("stats/visit error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* POST /stats/demo-coin — increment demo coin counter */
router.post("/stats/demo-coin", async (_req, res): Promise<void> => {
  try {
    const newCount = await incrementCounter("demo_coins");
    res.json({ ok: true, count: newCount });
  } catch (err) {
    console.error("stats/demo-coin error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* POST /stats/demo-battle — increment demo battle counter */
router.post("/stats/demo-battle", async (_req, res): Promise<void> => {
  try {
    const newCount = await incrementCounter("demo_battles");
    res.json({ ok: true, count: newCount });
  } catch (err) {
    console.error("stats/demo-battle error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* GET /stats/overview — all stats combined (admin) */
router.get("/stats/overview", async (_req, res): Promise<void> => {
  try {
    const [visitorRow] = await db
      .select({ total: count() })
      .from(siteVisitorsTable);

    const [purchaseRow] = await db
      .select({ total: count(), solTotal: sum(presalePurchasesTable.solAmount) })
      .from(presalePurchasesTable);

    const demoCoins   = await getOrInitCounter("demo_coins");
    const demoBattles = await getOrInitCounter("demo_battles");

    res.json({
      visitors:         visitorRow?.total ?? 0,
      totalSolRaised:   parseFloat(purchaseRow?.solTotal ?? "0") || 0,
      presalePurchases: purchaseRow?.total ?? 0,
      demoCoins,
      demoBattles,
    });
  } catch (err) {
    console.error("stats/overview error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
