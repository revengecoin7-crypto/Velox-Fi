import { db } from "@workspace/db";
import { veloxfiUsers } from "@workspace/db/schema";
import { and, eq, gt, isNotNull, lt, or, isNull, sql } from "drizzle-orm";
import { sendMiningCompleteEmail } from "./mailer";
import { getBattleBalance } from "./solana";

const MINING_DURATION_MS  = 4 * 60 * 60 * 1000;   // 4 hours
const CHECK_INTERVAL_MS   = 5 * 60 * 1000;        // every 5 min
const SELL_CHECK_EVERY_MS = 30 * 60 * 1000;       // every 30 min

/**
 * Finds users whose mining session has completed but who haven't been
 * notified yet for THIS session, and emails them. The 'this session'
 * check works because we store the wolfMiningStart timestamp at session
 * start and clear it on claim — so as long as lastMiningCompleteEmailAt
 * is null or older than the current wolfMiningStart, we owe them a mail.
 */
async function notifyCompletedSessions() {
  const fourHoursAgo = new Date(Date.now() - MINING_DURATION_MS);
  try {
    const rows = await db
      .select({
        username:        veloxfiUsers.username,
        email:           veloxfiUsers.email,
        wolfMiningStart: veloxfiUsers.wolfMiningStart,
      })
      .from(veloxfiUsers)
      .where(and(
        isNotNull(veloxfiUsers.wolfMiningStart),
        lt(veloxfiUsers.wolfMiningStart, fourHoursAgo),
        or(
          isNull(veloxfiUsers.lastMiningCompleteEmailAt),
          // Email was sent for an earlier session (older than current start).
          sql`${veloxfiUsers.lastMiningCompleteEmailAt} < ${veloxfiUsers.wolfMiningStart}`,
        ),
      ));

    if (rows.length === 0) return;

    for (const u of rows) {
      // Best effort — failure of one user shouldn't stop the rest.
      try {
        await sendMiningCompleteEmail(u.email, u.username);
        await db.update(veloxfiUsers)
          .set({ lastMiningCompleteEmailAt: new Date() })
          .where(eq(veloxfiUsers.username, u.username));
      } catch (e) {
        console.error("[scheduler] mining email failed for", u.username, e);
      }
    }
  } catch (e) {
    console.error("[scheduler] notifyCompletedSessions error:", e);
  }
}

/**
 * Walks every user with a buy-bonus tier > 1 and compares their current
 * on-chain $BATTLE balance to the snapshot taken at claim time. If they've
 * dumped (current < expected × 95%), we strip the multiplier and reset
 * their cumulative SOL — they have to re-buy to restore the bonus.
 *
 * RPC is best-effort: a failed balance fetch leaves the user untouched
 * so a transient network blip doesn't punish them.
 */
async function sellCheck() {
  try {
    const rows = await db
      .select({
        username:           veloxfiUsers.username,
        walletAddress:      veloxfiUsers.walletAddress,
        buyBonusBattleHeld: veloxfiUsers.buyBonusBattleHeld,
      })
      .from(veloxfiUsers)
      .where(and(
        gt(veloxfiUsers.buyBonusTier, 1),
        isNotNull(veloxfiUsers.walletAddress),
      ));

    if (rows.length === 0) return;

    for (const u of rows) {
      if (!u.walletAddress) continue;
      const expected = Number(u.buyBonusBattleHeld ?? 0);
      if (expected <= 0) continue;
      const current = await getBattleBalance(u.walletAddress);
      if (current === null) continue; // RPC failed — try again next round
      const threshold = expected * 0.95; // 5% tolerance for dust / fees
      if (current < threshold) {
        await db.update(veloxfiUsers)
          .set({
            buyBonusTier:       1,
            buyBonusSol:        0,
            buyBonusBattleHeld: 0,
            lastSellCheckAt:    new Date(),
          })
          .where(eq(veloxfiUsers.username, u.username));
        console.log(`[scheduler] sell detected — reset ${u.username}: expected ${expected.toFixed(2)}, current ${current.toFixed(2)} \$BATTLE`);
      } else {
        await db.update(veloxfiUsers)
          .set({ lastSellCheckAt: new Date() })
          .where(eq(veloxfiUsers.username, u.username));
      }
    }
  } catch (e) {
    console.error("[scheduler] sellCheck error:", e);
  }
}

let started = false;
export function startScheduler() {
  if (started) return;
  started = true;
  // Run once at startup (give the DB a few seconds), then every 5 min.
  setTimeout(notifyCompletedSessions, 10_000);
  setInterval(notifyCompletedSessions, CHECK_INTERVAL_MS).unref?.();
  // Sell-check runs less often — RPC calls are expensive and we don't need
  // sub-minute precision on the dump detection.
  setTimeout(sellCheck, 60_000);
  setInterval(sellCheck, SELL_CHECK_EVERY_MS).unref?.();
  console.log("[scheduler] started — mining email every 5 min, sell-check every 30 min");
}
