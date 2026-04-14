import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const veloxfiGameSessions = pgTable("veloxfi_game_sessions", {
  id:         serial("id").primaryKey(),
  username:   varchar("username", { length: 50 }).notNull(),
  game:       varchar("game", { length: 30 }).notNull(), // 'rocket-miner' | 'crypto-snake' | 'battle-tetris'
  wolfEarned: integer("wolf_earned").notNull().default(0),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
});
