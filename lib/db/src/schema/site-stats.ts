import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

/* One row per unique visitor — visitor_id is the localStorage UUID */
export const siteVisitorsTable = pgTable("site_visitors", {
  visitorId: text("visitor_id").primaryKey(),
  ip:        text("ip").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export type SiteVisitor = typeof siteVisitorsTable.$inferSelect;

/* Generic key-value counters: demo_coins, demo_battles */
export const siteCountersTable = pgTable("site_counters", {
  key:   text("key").primaryKey(),
  count: integer("count").notNull().default(0),
});
export type SiteCounter = typeof siteCountersTable.$inferSelect;
