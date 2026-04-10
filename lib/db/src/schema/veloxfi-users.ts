import { pgTable, varchar, integer, timestamp, text } from "drizzle-orm/pg-core";

export const veloxfiUsers = pgTable("veloxfi_users", {
  username:         varchar("username", { length: 50 }).primaryKey(),
  email:            varchar("email", { length: 255 }).notNull().unique(),
  passwordHash:     text("password_hash").notNull(),
  tokens:           integer("tokens").notNull().default(0),
  sessionToken:     text("session_token"),
  createdAt:        timestamp("created_at").notNull().defaultNow(),
  referredBy:       varchar("referred_by", { length: 50 }),
  referralCount:    integer("referral_count").notNull().default(0),
  referralTokens:   integer("referral_tokens").notNull().default(0),
  resetToken:       text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  walletAddress:      text("wallet_address"),
  claimRequestedAt:   timestamp("claim_requested_at"),
  claimedAt:          timestamp("claimed_at"),
});
