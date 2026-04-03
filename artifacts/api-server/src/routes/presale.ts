import { Router, type IRouter } from "express";
import { eq, sum, desc } from "drizzle-orm";
import { db, presalePurchasesTable } from "@workspace/db";

const router: IRouter = Router();

const SOL_GOAL = 500;
const MIN_SOL = 0.1;
const MAX_SOL_PER_WALLET = 10;
const TOKENS_PER_SOL = 100_000;
const RECEIVING_WALLET = "9LQw7JXNZb97qtYcbXkcV3xUjc3ewmZdmBejQd2HiwNU";

/* GET /presale/stats — totals for the progress bar */
router.get("/presale/stats", async (_req, res): Promise<void> => {
  try {
    const rows = await db.select().from(presalePurchasesTable);
    const totalSol = rows.reduce((acc, r) => acc + parseFloat(r.solAmount), 0);
    const totalPurchases = rows.length;
    res.json({
      totalSol,
      totalPurchases,
      solGoal: SOL_GOAL,
      progressPct: Math.min((totalSol / SOL_GOAL) * 100, 100),
    });
  } catch (err) {
    console.error("presale/stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* GET /presale/wallet-total/:address — how much a wallet has spent */
router.get("/presale/wallet-total/:address", async (req, res): Promise<void> => {
  const { address } = req.params;
  try {
    const rows = await db
      .select()
      .from(presalePurchasesTable)
      .where(eq(presalePurchasesTable.walletAddress, address));
    const total = rows.reduce((acc, r) => acc + parseFloat(r.solAmount), 0);
    res.json({ walletAddress: address, totalSol: total, remaining: Math.max(0, MAX_SOL_PER_WALLET - total) });
  } catch (err) {
    console.error("presale/wallet-total error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* POST /presale/purchase — record a purchase after it's confirmed on-chain */
router.post("/presale/purchase", async (req, res): Promise<void> => {
  const { walletAddress, solAmount, txSignature } = req.body as {
    walletAddress?: string;
    solAmount?: number;
    txSignature?: string;
  };

  if (!walletAddress || typeof solAmount !== "number" || !txSignature) {
    res.status(400).json({ error: "walletAddress, solAmount, and txSignature are required" });
    return;
  }

  if (solAmount < MIN_SOL) {
    res.status(400).json({ error: `Minimum purchase is ${MIN_SOL} SOL` });
    return;
  }

  try {
    /* Check wallet cumulative total */
    const existing = await db
      .select()
      .from(presalePurchasesTable)
      .where(eq(presalePurchasesTable.walletAddress, walletAddress));
    const walletTotal = existing.reduce((acc, r) => acc + parseFloat(r.solAmount), 0);

    if (walletTotal + solAmount > MAX_SOL_PER_WALLET) {
      const remaining = Math.max(0, MAX_SOL_PER_WALLET - walletTotal);
      res.status(400).json({
        error: `Maximum ${MAX_SOL_PER_WALLET} SOL per wallet. You have ${walletTotal.toFixed(4)} SOL used, ${remaining.toFixed(4)} SOL remaining.`,
      });
      return;
    }

    const battleTokens = Math.floor(solAmount * TOKENS_PER_SOL);

    const [purchase] = await db
      .insert(presalePurchasesTable)
      .values({
        walletAddress,
        solAmount: String(solAmount),
        battleTokens: String(battleTokens),
        txSignature,
      })
      .returning();

    res.status(201).json({
      id: purchase.id,
      walletAddress: purchase.walletAddress,
      solAmount: parseFloat(purchase.solAmount),
      battleTokens: parseInt(purchase.battleTokens),
      txSignature: purchase.txSignature,
      createdAt: purchase.createdAt,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      res.status(409).json({ error: "Transaction already recorded" });
      return;
    }
    console.error("presale/purchase error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* GET /presale/purchases — list all purchases (admin) */
router.get("/presale/purchases", async (_req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(presalePurchasesTable)
      .orderBy(desc(presalePurchasesTable.createdAt));

    res.json(
      rows.map((r) => ({
        id: r.id,
        walletAddress: r.walletAddress,
        solAmount: parseFloat(r.solAmount),
        battleTokens: parseInt(r.battleTokens),
        txSignature: r.txSignature,
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    console.error("presale/purchases error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { RECEIVING_WALLET };
export default router;
