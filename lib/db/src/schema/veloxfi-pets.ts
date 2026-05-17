import { pgTable, serial, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";

// One row per user — the pet wolf.
// hunger / happiness are reconstructed at read-time from lastFedAt/lastPlayedAt
// (they decay 4% per hour), so we only persist timestamps + xp + name.
export const veloxfiPets = pgTable("veloxfi_pets", {
  username:      varchar("username", { length: 50 }).primaryKey(),
  name:          varchar("name",     { length: 32 }).notNull().default("AGENT_07"),
  xp:            integer("xp").notNull().default(0),
  lastFedAt:     timestamp("last_fed_at"),
  lastPlayedAt:  timestamp("last_played_at"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
});

// One row per (username, accessoryId). equipped toggles independently per item.
export const veloxfiPetAccessories = pgTable("veloxfi_pet_accessories", {
  id:           serial("id").primaryKey(),
  username:     varchar("username",     { length: 50 }).notNull(),
  accessoryId:  varchar("accessory_id", { length: 30 }).notNull(),
  equipped:     boolean("equipped").notNull().default(false),
  purchasedAt:  timestamp("purchased_at").notNull().defaultNow(),
});
