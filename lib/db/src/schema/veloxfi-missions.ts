import { pgTable, serial, varchar, integer, boolean, unique } from "drizzle-orm/pg-core";

export const veloxfiMissions = pgTable("veloxfi_missions", {
  id:            serial("id").primaryKey(),
  username:      varchar("username", { length: 50 }).notNull(),
  missionDate:   varchar("mission_date", { length: 10 }).notNull(), // YYYY-MM-DD UTC
  battlesPlayed: integer("battles_played").notNull().default(0),
  thirtyMinWins: integer("thirty_min_wins").notNull().default(0),
  teamBattles:   integer("team_battles").notNull().default(0),
  referrals:     integer("referrals").notNull().default(0),
  m1Rewarded:    boolean("m1_rewarded").notNull().default(false),
  m2Rewarded:    boolean("m2_rewarded").notNull().default(false),
  m3Rewarded:    boolean("m3_rewarded").notNull().default(false),
  m4Rewarded:    boolean("m4_rewarded").notNull().default(false),
}, (t) => ({
  uniq: unique().on(t.username, t.missionDate),
}));
