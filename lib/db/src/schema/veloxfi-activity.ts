import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const veloxfiActivity = pgTable("veloxfi_activity", {
  id:        serial("id").primaryKey(),
  type:      varchar("type", { length: 30 }).notNull(),
  username:  varchar("username", { length: 50 }).notNull(),
  message:   varchar("message", { length: 220 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
