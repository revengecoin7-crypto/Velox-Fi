import { pgTable, serial, varchar, integer, text, timestamp } from "drizzle-orm/pg-core";

// Append-only audit log for sensitive API calls. Use it to investigate abuse,
// trace exploits, or see "who changed what" later. Trim regularly if storage
// becomes a concern (e.g. delete rows older than 90 days via a cron job).
export const veloxfiAuditLog = pgTable("veloxfi_audit_log", {
  id:         serial("id").primaryKey(),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
  username:   varchar("username", { length: 50 }),               // null = unauthenticated
  ip:         varchar("ip",       { length: 64 }),
  method:     varchar("method",   { length: 10 }).notNull(),
  path:       varchar("path",     { length: 200 }).notNull(),
  status:     integer("status").notNull(),
  body:       text("body"),                                       // truncated JSON
  userAgent:  varchar("user_agent", { length: 200 }),
});
