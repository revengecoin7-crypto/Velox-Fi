import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, transactionsTable, accountsTable } from "@workspace/db";
import {
  ListTransactionsQueryParams,
  ListTransactionsResponse,
  CreateTransactionBody,
  GetTransactionParams,
  GetTransactionResponse,
  UpdateTransactionParams,
  UpdateTransactionBody,
  UpdateTransactionResponse,
  DeleteTransactionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapTransaction(t: typeof transactionsTable.$inferSelect) {
  return { ...t, amount: parseFloat(t.amount) };
}

router.get("/transactions", async (req, res): Promise<void> => {
  const queryParams = ListTransactionsQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  const { accountId, category, limit } = queryParams.data;
  const conditions = [];
  if (accountId != null) conditions.push(eq(transactionsTable.accountId, accountId));
  if (category != null) conditions.push(eq(transactionsTable.category, category));

  let query = db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.date));

  const results = conditions.length > 0
    ? await query.where(and(...conditions)).limit(limit ?? 100)
    : await query.limit(limit ?? 100);

  res.json(ListTransactionsResponse.parse(results.map(mapTransaction)));
});

router.post("/transactions", async (req, res): Promise<void> => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [account] = await db.select().from(accountsTable).where(eq(accountsTable.id, parsed.data.accountId));
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  const [transaction] = await db
    .insert(transactionsTable)
    .values({
      ...parsed.data,
      amount: String(parsed.data.amount),
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    })
    .returning();

  const amountNum = parsed.data.amount;
  const newBalance = parsed.data.type === "income"
    ? parseFloat(account.balance) + amountNum
    : parseFloat(account.balance) - amountNum;

  await db
    .update(accountsTable)
    .set({ balance: String(newBalance) })
    .where(eq(accountsTable.id, parsed.data.accountId));

  res.status(201).json(GetTransactionResponse.parse(mapTransaction(transaction)));
});

router.get("/transactions/:id", async (req, res): Promise<void> => {
  const params = GetTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [transaction] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, params.data.id));
  if (!transaction) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  res.json(GetTransactionResponse.parse(mapTransaction(transaction)));
});

router.patch("/transactions/:id", async (req, res): Promise<void> => {
  const params = UpdateTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.accountId != null) updateData.accountId = parsed.data.accountId;
  if (parsed.data.amount != null) updateData.amount = String(parsed.data.amount);
  if (parsed.data.type != null) updateData.type = parsed.data.type;
  if (parsed.data.category != null) updateData.category = parsed.data.category;
  if (parsed.data.description != null) updateData.description = parsed.data.description;
  if (parsed.data.date != null) updateData.date = new Date(parsed.data.date);
  if ("notes" in parsed.data) updateData.notes = parsed.data.notes;

  const [transaction] = await db
    .update(transactionsTable)
    .set(updateData)
    .where(eq(transactionsTable.id, params.data.id))
    .returning();
  if (!transaction) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  res.json(UpdateTransactionResponse.parse(mapTransaction(transaction)));
});

router.delete("/transactions/:id", async (req, res): Promise<void> => {
  const params = DeleteTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [transaction] = await db.delete(transactionsTable).where(eq(transactionsTable.id, params.data.id)).returning();
  if (!transaction) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
