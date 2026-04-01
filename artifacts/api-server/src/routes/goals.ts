import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, goalsTable } from "@workspace/db";
import {
  ListGoalsResponse,
  CreateGoalBody,
  UpdateGoalParams,
  UpdateGoalBody,
  UpdateGoalResponse,
  DeleteGoalParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapGoal(g: typeof goalsTable.$inferSelect) {
  return {
    ...g,
    targetAmount: parseFloat(g.targetAmount),
    currentAmount: parseFloat(g.currentAmount),
  };
}

router.get("/goals", async (_req, res): Promise<void> => {
  const goals = await db.select().from(goalsTable).orderBy(goalsTable.createdAt);
  res.json(ListGoalsResponse.parse(goals.map(mapGoal)));
});

router.post("/goals", async (req, res): Promise<void> => {
  const parsed = CreateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [goal] = await db
    .insert(goalsTable)
    .values({
      ...parsed.data,
      targetAmount: String(parsed.data.targetAmount),
      currentAmount: String(parsed.data.currentAmount ?? 0),
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
    })
    .returning();
  res.status(201).json(UpdateGoalResponse.parse(mapGoal(goal)));
});

router.patch("/goals/:id", async (req, res): Promise<void> => {
  const params = UpdateGoalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.data.name != null) updateData.name = parsed.data.name;
  if (parsed.data.targetAmount != null) updateData.targetAmount = String(parsed.data.targetAmount);
  if (parsed.data.currentAmount != null) updateData.currentAmount = String(parsed.data.currentAmount);
  if ("targetDate" in parsed.data) updateData.targetDate = parsed.data.targetDate ? new Date(parsed.data.targetDate) : null;
  if ("category" in parsed.data) updateData.category = parsed.data.category;
  if ("color" in parsed.data) updateData.color = parsed.data.color;

  const [goal] = await db
    .update(goalsTable)
    .set(updateData)
    .where(eq(goalsTable.id, params.data.id))
    .returning();
  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  res.json(UpdateGoalResponse.parse(mapGoal(goal)));
});

router.delete("/goals/:id", async (req, res): Promise<void> => {
  const params = DeleteGoalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [goal] = await db.delete(goalsTable).where(eq(goalsTable.id, params.data.id)).returning();
  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
