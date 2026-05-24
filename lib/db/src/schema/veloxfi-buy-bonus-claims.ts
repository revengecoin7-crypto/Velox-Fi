import { pgTable, serial, varchar, doublePrecision, timestamp, text } from "drizzle-orm/pg-core";

// Every tx-signature that has been redeemed for buy-bonus credit. We
// dedupe on tx_signature so the same on-chain buy can't be claimed twice
// (across accounts or by the same user re-submitting).
export const veloxfiBuyBonusClaims = pgTable("veloxfi_buy_bonus_claims", {
  id:           serial("id").primaryKey(),
  username:     varchar("username", { length: 50 }).notNull(),
  txSignature:  text("tx_signature").notNull().unique(),
  solAmount:    doublePrecision("sol_amount").notNull(),
  battleAmount: doublePrecision("battle_amount").notNull(),
  claimedAt:    timestamp("claimed_at").notNull().defaultNow(),
});
