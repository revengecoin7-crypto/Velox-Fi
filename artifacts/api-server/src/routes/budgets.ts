import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, budgetsTable } from "@workspace/db";
import {
  ListBudgetsResponse,
  CreateBudgetBody,
  UpdateBudgetParams,
  UpdateBudgetBody,
  UpdateBudgetResponse,
  DeleteBudgetParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapBudget(b: typeof budgetsTable.$inferSelect) {
  return { ...b, limit: parseFloat(b.limit), spent: parseFloat(b.spent) };
}

router.get("/budgets", async (_req, res): Promise<void> => {
  const budgets = await db.select().from(budgetsTable).orderBy(budgetsTable.createdAt);
  res.json(ListBudgetsResponse.parse(budgets.map(mapBudget)));
});

router.post("/budgets", async (req, res): Promise<void> => {
  const parsed = CreateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [budget] = await db
    .insert(budgetsTable)
    .values({ ...parsed.data, limit: String(parsed.data.limit), spent: String(parsed.data.spent) })
    .returning();
  res.status(201).json(UpdateBudgetResponse.parse(mapBudget(budget)));
});

router.patch("/budgets/:id", async (req, res): Promise<void> => {
  const params = UpdateBudgetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.data.category != null) updateData.category = parsed.data.category;
  if (parsed.data.limit != null) updateData.limit = String(parsed.data.limit);
  if (parsed.data.spent != null) updateData.spent = String(parsed.data.spent);
  if (parsed.data.period != null) updateData.period = parsed.data.period;
  if ("color" in parsed.data) updateData.color = parsed.data.color;

  const [budget] = await db
    .update(budgetsTable)
    .set(updateData)
    .where(eq(budgetsTable.id, params.data.id))
    .returning();
  if (!budget) {
    res.status(404).json({ error: "Budget not found" });
    return;
  }
  res.json(UpdateBudgetResponse.parse(mapBudget(budget)));
});

router.delete("/budgets/:id", async (req, res): Promise<void> => {
  const params = DeleteBudgetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [budget] = await db.delete(budgetsTable).where(eq(budgetsTable.id, params.data.id)).returning();
  if (!budget) {
    res.status(404).json({ error: "Budget not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
