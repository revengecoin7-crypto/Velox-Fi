import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers, veloxfiBuyBonusClaims, veloxfiActivity } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyBuyTransaction, getBattleBalance, tierForSol } from "../lib/solana";

const router = Router();

// Local copy of the auth middleware — same shape as veloxfi-auth.ts. We
// duplicate so this route file doesn't pull a circular dep.
async function requireAuth(req: Request & { veloxfiUser?: typeof veloxfiUsers.$inferSelect }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized." }); return; }
  const token = auth.slice(7);
  const [user] = await db.select().from(veloxfiUsers).where(eq(veloxfiUsers.sessionToken, token)).limit(1);
  if (!user) { res.status(401).json({ error: "Invalid or expired session." }); return; }
  (req as any).veloxfiUser = user;
  next();
}

/** Claim a $BATTLE buy-tx for the buy-bonus multiplier. The tx must be a
 *  real on-chain buy where the user's registered wallet received $BATTLE.
 *  Re-using the same signature across users is impossible because of the
 *  unique constraint on tx_signature. */
router.post("/veloxfi/buy-bonus/claim", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser as typeof veloxfiUsers.$inferSelect;
    if (!user.walletAddress) {
      res.status(400).json({ error: "Save your Solana wallet address on the Wallet page first — the buy must be from that wallet." }); return;
    }

    const txSignature = String(req.body?.txSignature ?? "").trim();
    if (!txSignature) {
      res.status(400).json({ error: "Paste the transaction signature from your buy." }); return;
    }

    // Dedup check before hitting RPC — saves an unnecessary request.
    const [existing] = await db.select().from(veloxfiBuyBonusClaims).where(eq(veloxfiBuyBonusClaims.txSignature, txSignature));
    if (existing) {
      res.status(409).json({ error: "This transaction has already been claimed." }); return;
    }

    const verified = await verifyBuyTransaction(txSignature);
    if (!verified.ok) {
      res.status(400).json({ error: verified.error }); return;
    }

    if (verified.buyerWallet !== user.walletAddress) {
      res.status(403).json({ error: `This buy came from a different wallet (${verified.buyerWallet.slice(0, 6)}…${verified.buyerWallet.slice(-4)}). Only buys from your registered wallet count.` }); return;
    }

    // Tier upgrade — sum SOL with everything previously claimed.
    const newSolTotal     = Number(user.buyBonusSol ?? 0) + verified.solSpent;
    const newTier         = tierForSol(newSolTotal);
    const newBattleHeld   = Number(user.buyBonusBattleHeld ?? 0) + verified.battleReceived;

    await db.insert(veloxfiBuyBonusClaims).values({
      username:     user.username,
      txSignature,
      solAmount:    verified.solSpent,
      battleAmount: verified.battleReceived,
    });

    await db.update(veloxfiUsers).set({
      buyBonusSol:        newSolTotal,
      buyBonusTier:       newTier,
      buyBonusBattleHeld: newBattleHeld,
      lastSellCheckAt:    new Date(),
    }).where(eq(veloxfiUsers.username, user.username));

    await db.insert(veloxfiActivity).values({
      type:     "buy_bonus",
      username: user.username,
      message:  `claimed buy-bonus: ${verified.solSpent.toFixed(4)} SOL → ${newTier}x multiplier active`,
    });

    res.json({
      ok: true,
      solSpent:     verified.solSpent,
      battleReceived: verified.battleReceived,
      newSolTotal,
      previousTier: user.buyBonusTier,
      newTier,
    });
  } catch (e) {
    console.error("buy-bonus/claim error:", e);
    res.status(500).json({ error: "Server error verifying the transaction." });
  }
});

/** Read endpoint so the buy-bonus page can show the user's tier + history. */
router.get("/veloxfi/buy-bonus/status", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser as typeof veloxfiUsers.$inferSelect;
    const claims = await db
      .select()
      .from(veloxfiBuyBonusClaims)
      .where(eq(veloxfiBuyBonusClaims.username, user.username))
      .orderBy(desc(veloxfiBuyBonusClaims.claimedAt));

    // Live wallet balance for the sell-warning ribbon on the page. Best-effort;
    // null means RPC failed and we hide the warning.
    let currentBalance: number | null = null;
    if (user.walletAddress && Number(user.buyBonusBattleHeld ?? 0) > 0) {
      currentBalance = await getBattleBalance(user.walletAddress);
    }

    res.json({
      tier:               user.buyBonusTier ?? 1,
      totalSol:           user.buyBonusSol ?? 0,
      battleHeldExpected: user.buyBonusBattleHeld ?? 0,
      currentBalance,
      lastSellCheckAt:    user.lastSellCheckAt,
      claims,
    });
  } catch (e) {
    console.error("buy-bonus/status error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;
