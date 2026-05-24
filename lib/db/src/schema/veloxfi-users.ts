import { pgTable, varchar, integer, doublePrecision, timestamp, text } from "drizzle-orm/pg-core";

export const veloxfiUsers = pgTable("veloxfi_users", {
  username:         varchar("username", { length: 50 }).primaryKey(),
  email:            varchar("email", { length: 255 }).notNull().unique(),
  passwordHash:     text("password_hash").notNull(),
  tokens:           doublePrecision("tokens").notNull().default(0),
  wolf:             integer("wolf").notNull().default(0),
  wolfMiningStart:  timestamp("wolf_mining_start"),
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
  activeBattle:       text("active_battle"),
  xp:                 integer("xp").notNull().default(0),
  dailyStreak:        integer("daily_streak").notNull().default(0),
  lastMiningClaimAt:  timestamp("last_mining_claim_at"),
  emailVerified:      timestamp("email_verified"),
  emailVerifyToken:   text("email_verify_token"),
  lastMiningCompleteEmailAt: timestamp("last_mining_complete_email_at"),
  registrationIp:     varchar("registration_ip", { length: 64 }),
  // Buy bonus — multiplier earned by buying $BATTLE on pump.fun.
  // Cumulative SOL spent on verified buy txs; tier is the multiplier
  // applied to every reward path (mining + Daily Den).
  buyBonusSol:        doublePrecision("buy_bonus_sol").notNull().default(0),
  buyBonusTier:       integer("buy_bonus_tier").notNull().default(1),
  // Snapshot of $BATTLE balance at the moment of the last buy claim.
  // Used by the sell-detection scheduler to decide if the user dumped.
  buyBonusBattleHeld: doublePrecision("buy_bonus_battle_held").notNull().default(0),
  lastSellCheckAt:    timestamp("last_sell_check_at"),
});
