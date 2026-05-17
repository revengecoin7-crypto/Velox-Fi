import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers, veloxfiPets, veloxfiPetAccessories, veloxfiActivity } from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";

const router = Router();

async function requireAuth(req: Request & { veloxfiUser?: typeof veloxfiUsers.$inferSelect }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized." }); return; }
  const token = auth.slice(7);
  const [user] = await db.select().from(veloxfiUsers).where(eq(veloxfiUsers.sessionToken, token));
  if (!user) { res.status(401).json({ error: "Invalid session." }); return; }
  req.veloxfiUser = user;
  next();
}

// ── Config ────────────────────────────────────────────────────────────────
export const PET_STAGES = [
  { name: "Pup",     min: 0,    max: 100,   bonus: 5,  icon: "🐶", desc: "Just hatched. Wide eyes." },
  { name: "Cub",     min: 100,  max: 300,   bonus: 10, icon: "🦊", desc: "Growing fangs. Sharp ears." },
  { name: "Hunter",  min: 300,  max: 700,   bonus: 20, icon: "🐺", desc: "Quick on its feet. Hunts at dusk." },
  { name: "Stalker", min: 700,  max: 1500,  bonus: 35, icon: "🐺", desc: "Silent. Lethal. Carries scars." },
  { name: "Alpha",   min: 1500, max: 99999, bonus: 50, icon: "👑", desc: "The pack bows. Apex predator." },
];

export const ACCESSORIES: Record<string, { name: string; bonus: number; cost: number; rarity: string; icon: string }> = {
  collar:  { name: "Cyber collar",   bonus: 5,  cost:   500,  rarity: "common", icon: "⚙"  },
  goggles: { name: "Hunter goggles", bonus: 8,  cost:  1200,  rarity: "rare",   icon: "🥽" },
  cape:    { name: "Alpha cape",     bonus: 12, cost:  4000,  rarity: "epic",   icon: "🧣" },
  crown:   { name: "Pack crown",     bonus: 20, cost:  9000,  rarity: "legend", icon: "👑" },
  aura:    { name: "Plasma aura",    bonus: 25, cost: 14000,  rarity: "legend", icon: "✨" },
  cosmic:  { name: "Cosmic helmet",  bonus: 30, cost: 24000,  rarity: "mythic", icon: "🌌" },
};

const HUNGER_DECAY_PER_HOUR    = 4; // % per hour
const HAPPINESS_DECAY_PER_HOUR = 4;
const FEED_COOLDOWN_MS  = 24 * 60 * 60 * 1000;
const PLAY_COOLDOWN_MS  = 24 * 60 * 60 * 1000;
const FEED_XP_REWARD    = 30;
const PLAY_XP_REWARD    = 20;
const HEALTHY_THRESHOLD = 30; // hunger or happiness below this halves the bonus

// ── Helpers ────────────────────────────────────────────────────────────────
function stageFor(xp: number) {
  return PET_STAGES.find(s => xp >= s.min && xp < s.max) ?? PET_STAGES[0];
}

function decay(lastAt: Date | null, perHour: number): number {
  if (!lastAt) return 100;
  const hoursSince = (Date.now() - lastAt.getTime()) / 3600000;
  return Math.max(0, Math.min(100, Math.round(100 - hoursSince * perHour)));
}

async function getOrCreatePet(username: string) {
  const [existing] = await db.select().from(veloxfiPets).where(eq(veloxfiPets.username, username));
  if (existing) return existing;
  const [created] = await db.insert(veloxfiPets).values({ username, name: "AGENT_07", xp: 0 }).returning();
  return created;
}

// Used by mining/claim to combine the pet's stage + equipped accessories bonus.
// Healthy means hunger >= 30 AND happiness >= 30 — otherwise the bonus is halved.
export async function getPetBonusPercent(username: string): Promise<number> {
  const [pet] = await db.select().from(veloxfiPets).where(eq(veloxfiPets.username, username));
  if (!pet) return 0;

  const stage = stageFor(pet.xp);
  const accessories = await db.select().from(veloxfiPetAccessories)
    .where(and(eq(veloxfiPetAccessories.username, username), eq(veloxfiPetAccessories.equipped, true)));
  const gearBonus = accessories.reduce((sum, a) => sum + (ACCESSORIES[a.accessoryId]?.bonus ?? 0), 0);

  const hunger    = decay(pet.lastFedAt,    HUNGER_DECAY_PER_HOUR);
  const happiness = decay(pet.lastPlayedAt, HAPPINESS_DECAY_PER_HOUR);
  const total = stage.bonus + gearBonus;
  const healthy = hunger >= HEALTHY_THRESHOLD && happiness >= HEALTHY_THRESHOLD;
  return healthy ? total : Math.floor(total / 2);
}

// ── GET /veloxfi/pet/status ────────────────────────────────────────────────
router.get("/veloxfi/pet/status", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser as typeof veloxfiUsers.$inferSelect;
    const pet = await getOrCreatePet(user.username);
    const stage = stageFor(pet.xp);
    const nextStage = PET_STAGES[PET_STAGES.indexOf(stage) + 1] ?? null;
    const hunger    = decay(pet.lastFedAt,    HUNGER_DECAY_PER_HOUR);
    const happiness = decay(pet.lastPlayedAt, HAPPINESS_DECAY_PER_HOUR);
    const healthy   = hunger >= HEALTHY_THRESHOLD && happiness >= HEALTHY_THRESHOLD;

    const owned = await db.select().from(veloxfiPetAccessories).where(eq(veloxfiPetAccessories.username, user.username));
    const gearBonus = owned.filter(a => a.equipped).reduce((s, a) => s + (ACCESSORIES[a.accessoryId]?.bonus ?? 0), 0);

    const now = Date.now();
    const canFeed = !pet.lastFedAt    || (now - pet.lastFedAt.getTime())    >= FEED_COOLDOWN_MS;
    const canPlay = !pet.lastPlayedAt || (now - pet.lastPlayedAt.getTime()) >= PLAY_COOLDOWN_MS;
    const feedNextAt = pet.lastFedAt    ? pet.lastFedAt.getTime()    + FEED_COOLDOWN_MS : 0;
    const playNextAt = pet.lastPlayedAt ? pet.lastPlayedAt.getTime() + PLAY_COOLDOWN_MS : 0;

    const accessories = Object.keys(ACCESSORIES).map(id => {
      const def = ACCESSORIES[id];
      const row = owned.find(o => o.accessoryId === id);
      return { id, ...def, owned: !!row, equipped: row?.equipped ?? false };
    });

    res.json({
      name:        pet.name,
      xp:          pet.xp,
      stage:       { ...stage, index: PET_STAGES.indexOf(stage) },
      nextStage:   nextStage ? { name: nextStage.name, min: nextStage.min, icon: nextStage.icon } : null,
      stages:      PET_STAGES,
      hunger,
      happiness,
      healthy,
      bonus:       { stage: stage.bonus, gear: gearBonus, total: stage.bonus + gearBonus, healthyMultiplier: healthy ? 1 : 0.5 },
      canFeed,
      canPlay,
      feedNextAt,
      playNextAt,
      accessories,
      now,
      createdAt:   pet.createdAt,
    });
  } catch (e) {
    console.error("pet/status error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── POST /veloxfi/pet/rename ───────────────────────────────────────────────
router.post("/veloxfi/pet/rename", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser as typeof veloxfiUsers.$inferSelect;
    const raw = String(req.body?.name ?? "").trim();
    if (raw.length < 2 || raw.length > 32) {
      res.status(400).json({ error: "Name must be 2-32 characters." }); return;
    }
    await getOrCreatePet(user.username);
    await db.update(veloxfiPets).set({ name: raw }).where(eq(veloxfiPets.username, user.username));
    res.json({ ok: true, name: raw });
  } catch (e) {
    console.error("pet/rename error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── POST /veloxfi/pet/feed ─────────────────────────────────────────────────
router.post("/veloxfi/pet/feed", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser as typeof veloxfiUsers.$inferSelect;
    const pet = await getOrCreatePet(user.username);
    const now = Date.now();
    if (pet.lastFedAt && (now - pet.lastFedAt.getTime()) < FEED_COOLDOWN_MS) {
      res.status(409).json({ error: "Already fed today.", nextAtMs: pet.lastFedAt.getTime() + FEED_COOLDOWN_MS }); return;
    }
    const newXp = pet.xp + FEED_XP_REWARD;
    await db.update(veloxfiPets).set({ xp: newXp, lastFedAt: new Date() }).where(eq(veloxfiPets.username, user.username));
    await db.insert(veloxfiActivity).values({
      type: "pet_feed", username: user.username,
      message: `fed their wolf (+${FEED_XP_REWARD} pet XP)`,
    });
    res.json({ ok: true, xp: newXp, xpGained: FEED_XP_REWARD });
  } catch (e) {
    console.error("pet/feed error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── POST /veloxfi/pet/play ─────────────────────────────────────────────────
router.post("/veloxfi/pet/play", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser as typeof veloxfiUsers.$inferSelect;
    const pet = await getOrCreatePet(user.username);
    const now = Date.now();
    if (pet.lastPlayedAt && (now - pet.lastPlayedAt.getTime()) < PLAY_COOLDOWN_MS) {
      res.status(409).json({ error: "Already played today.", nextAtMs: pet.lastPlayedAt.getTime() + PLAY_COOLDOWN_MS }); return;
    }
    const newXp = pet.xp + PLAY_XP_REWARD;
    await db.update(veloxfiPets).set({ xp: newXp, lastPlayedAt: new Date() }).where(eq(veloxfiPets.username, user.username));
    await db.insert(veloxfiActivity).values({
      type: "pet_play", username: user.username,
      message: `played with their wolf (+${PLAY_XP_REWARD} pet XP)`,
    });
    res.json({ ok: true, xp: newXp, xpGained: PLAY_XP_REWARD });
  } catch (e) {
    console.error("pet/play error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── POST /veloxfi/pet/accessory/buy ────────────────────────────────────────
router.post("/veloxfi/pet/accessory/buy", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser as typeof veloxfiUsers.$inferSelect;
    const id = String(req.body?.accessoryId ?? "");
    const def = ACCESSORIES[id];
    if (!def) { res.status(400).json({ error: "Unknown accessory." }); return; }

    const [existing] = await db.select().from(veloxfiPetAccessories)
      .where(and(eq(veloxfiPetAccessories.username, user.username), eq(veloxfiPetAccessories.accessoryId, id)));
    if (existing) { res.status(409).json({ error: "Already owned." }); return; }

    if ((user.wolf ?? 0) < def.cost) {
      res.status(400).json({ error: `Need ${def.cost} WOLF, have ${user.wolf}.` }); return;
    }

    const newWolf = (user.wolf ?? 0) - def.cost;
    await db.update(veloxfiUsers).set({ wolf: newWolf }).where(eq(veloxfiUsers.username, user.username));
    await db.insert(veloxfiPetAccessories).values({ username: user.username, accessoryId: id, equipped: false });
    await db.insert(veloxfiActivity).values({
      type: "pet_buy", username: user.username,
      message: `bought ${def.name} for ${def.cost} WOLF`,
    });

    res.json({ ok: true, accessoryId: id, newWolfBalance: newWolf, cost: def.cost });
  } catch (e) {
    console.error("pet/accessory/buy error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

// ── POST /veloxfi/pet/accessory/equip ──────────────────────────────────────
router.post("/veloxfi/pet/accessory/equip", requireAuth as any, async (req: any, res) => {
  try {
    const user = req.veloxfiUser as typeof veloxfiUsers.$inferSelect;
    const id = String(req.body?.accessoryId ?? "");
    if (!ACCESSORIES[id]) { res.status(400).json({ error: "Unknown accessory." }); return; }

    const [existing] = await db.select().from(veloxfiPetAccessories)
      .where(and(eq(veloxfiPetAccessories.username, user.username), eq(veloxfiPetAccessories.accessoryId, id)));
    if (!existing) { res.status(400).json({ error: "Not owned." }); return; }

    await db.update(veloxfiPetAccessories)
      .set({ equipped: !existing.equipped })
      .where(eq(veloxfiPetAccessories.id, existing.id));

    res.json({ ok: true, accessoryId: id, equipped: !existing.equipped });
  } catch (e) {
    console.error("pet/accessory/equip error:", e);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;
