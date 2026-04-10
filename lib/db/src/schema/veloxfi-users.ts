import { pgTable, varchar, integer, timestamp, text } from "drizzle-orm/pg-core";

export const veloxfiUsers = pgTable("veloxfi_users", {
  username:      varchar("username", { length: 50 }).primaryKey(),
  email:         varchar("email", { length: 255 }).notNull().unique(),
  passwordHash:  text("password_hash").notNull(),
  tokens:        integer("tokens").notNull().default(0),
  sessionToken:  text("session_token"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
});
