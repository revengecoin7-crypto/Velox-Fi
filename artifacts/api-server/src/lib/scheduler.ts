import { db } from "@workspace/db";
import { veloxfiUsers } from "@workspace/db/schema";
import { and, eq, isNotNull, lt, or, isNull, sql } from "drizzle-orm";
import { sendMiningCompleteEmail } from "./mailer";

const MINING_DURATION_MS = 4 * 60 * 60 * 1000;   // 4 hours
const CHECK_INTERVAL_MS  = 5 * 60 * 1000;        // every 5 min

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

let started = false;
export function startScheduler() {
  if (started) return;
  started = true;
  // Run once at startup (give the DB a few seconds), then every 5 min.
  setTimeout(notifyCompletedSessions, 10_000);
  setInterval(notifyCompletedSessions, CHECK_INTERVAL_MS).unref?.();
  console.log("[scheduler] started — checking mining completions every 5 min");
}
