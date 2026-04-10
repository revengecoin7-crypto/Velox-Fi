import { pgTable, serial, varchar, integer, timestamp, text } from "drizzle-orm/pg-core";

export const veloxfiClaims = pgTable("veloxfi_claims", {
  id:            serial("id").primaryKey(),
  username:      varchar("username", { length: 50 }).notNull(),
  walletAddress: text("wallet_address").notNull(),
  amount:        integer("amount").notNull(),
  requestedAt:   timestamp("requested_at").notNull().defaultNow(),
  paidAt:        timestamp("paid_at"),
});
