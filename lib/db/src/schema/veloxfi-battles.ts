import { pgTable, serial, varchar, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";

export const veloxfiBattles = pgTable("veloxfi_battles", {
  id:           serial("id").primaryKey(),
  username:     varchar("username", { length: 50 }).notNull(),
  coinAId:      varchar("coin_a_id",   { length: 50 }).notNull(),
  coinBId:      varchar("coin_b_id",   { length: 50 }).notNull(),
  coinAName:    varchar("coin_a_name", { length: 80 }).notNull(),
  coinBName:    varchar("coin_b_name", { length: 80 }).notNull(),
  coinAEmoji:   varchar("coin_a_emoji",{ length: 10 }).notNull().default(""),
  coinBEmoji:   varchar("coin_b_emoji",{ length: 10 }).notNull().default(""),
  timeframe:    integer("timeframe").notNull(),
  pickedWinner: varchar("picked_winner",{ length: 50 }).notNull(),
  actualWinner: varchar("actual_winner",{ length: 50 }).notNull(),
  result:       varchar("result",       { length: 10 }).notNull(), // 'win' | 'loss' | 'draw'
  tokensEarned: integer("tokens_earned").notNull().default(0),
  entryPriceA:  doublePrecision("entry_price_a").notNull(),
  entryPriceB:  doublePrecision("entry_price_b").notNull(),
  finalPriceA:  doublePrecision("final_price_a").notNull(),
  finalPriceB:  doublePrecision("final_price_b").notNull(),
  changeA:      doublePrecision("change_a").notNull(),
  changeB:      doublePrecision("change_b").notNull(),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
});
