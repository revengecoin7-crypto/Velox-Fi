import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const presalePurchasesTable = pgTable("presale_purchases", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  solAmount: numeric("sol_amount", { precision: 15, scale: 9 }).notNull(),
  battleTokens: numeric("battle_tokens", { precision: 20, scale: 0 }).notNull(),
  txSignature: text("tx_signature").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPresalePurchaseSchema = createInsertSchema(presalePurchasesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPresalePurchase = z.infer<typeof insertPresalePurchaseSchema>;
export type PresalePurchase = typeof presalePurchasesTable.$inferSelect;
