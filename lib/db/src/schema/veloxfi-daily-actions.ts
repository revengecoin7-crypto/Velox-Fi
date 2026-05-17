import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";

// One row per (username, actionType, performedAt) — used to enforce daily limits
// (spins, milestones, bounties) and cooldowns (treasure chests).
//
// actionType examples:
//   spin                — 1× per UTC day
//   chest_bronze        — 4h cooldown
//   chest_silver        — 8h cooldown
//   chest_gold          — 24h cooldown
//   milestone_3..30     — once-only per user
//   bounty_telegram     — once-only
//   bounty_x            — once-only
//   bounty_referral_N   — once per referral milestone (N=1,5,10,...)
export const veloxfiDailyActions = pgTable("veloxfi_daily_actions", {
  id:          serial("id").primaryKey(),
  username:    varchar("username",   { length: 50 }).notNull(),
  actionType:  varchar("action_type",{ length: 40 }).notNull(),
  rewardWolf:  integer("reward_wolf").notNull().default(0),
  performedAt: timestamp("performed_at").notNull().defaultNow(),
});
