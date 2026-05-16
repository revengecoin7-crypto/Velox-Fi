import { pgTable, serial, varchar, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";

export const veloxfiWaitlist = pgTable("veloxfi_waitlist", {
  id:            serial("id").primaryKey(),
  username:      varchar("username", { length: 50 }).notNull(),
  wolfAmount:    integer("wolf_amount").notNull(),
  battleAmount:  doublePrecision("battle_amount").notNull(),
  walletAddress: varchar("wallet_address", { length: 100 }),
  requestedAt:   timestamp("requested_at").notNull().defaultNow(),
  fulfilledAt:   timestamp("fulfilled_at"),
});
