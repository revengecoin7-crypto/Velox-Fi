import { pgTable, serial, varchar, timestamp, unique } from "drizzle-orm/pg-core";

export const veloxfiAchievements = pgTable("veloxfi_achievements", {
  id:            serial("id").primaryKey(),
  username:      varchar("username", { length: 50 }).notNull(),
  achievementId: varchar("achievement_id", { length: 50 }).notNull(),
  earnedAt:      timestamp("earned_at").notNull().defaultNow(),
}, (t) => ({
  uniq: unique().on(t.username, t.achievementId),
}));
