import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";

// Append-only history of every WOLF a user earned and where it came from.
// Used to drive period-bound leaderboards (Today / Week / Month).
//
// source values:
//   'mining'    — mining/claim payout (includes tier + pet bonus)
//   'spin'      — daily spin reward
//   'chest'     — treasure chest open
//   'milestone' — streak milestone payout
//   'bounty'    — bounty claim
//   'referral'  — credited when someone registers with your referral code
export const veloxfiWolfEarnings = pgTable("veloxfi_wolf_earnings", {
  id:        serial("id").primaryKey(),
  username:  varchar("username", { length: 50 }).notNull(),
  source:    varchar("source",   { length: 20 }).notNull(),
  amount:    integer("amount").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
