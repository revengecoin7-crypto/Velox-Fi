import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, accountsTable } from "@workspace/db";
import {
  ListAccountsResponse,
  CreateAccountBody,
  GetAccountParams,
  GetAccountResponse,
  UpdateAccountParams,
  UpdateAccountBody,
  UpdateAccountResponse,
  DeleteAccountParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/accounts", async (req, res): Promise<void> => {
  const accounts = await db.select().from(accountsTable).orderBy(accountsTable.createdAt);
  const mapped = accounts.map((a) => ({
    ...a,
    balance: parseFloat(a.balance),
  }));
  res.json(ListAccountsResponse.parse(mapped));
});

router.post("/accounts", async (req, res): Promise<void> => {
  const parsed = CreateAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [account] = await db
    .insert(accountsTable)
    .values({ ...parsed.data, balance: String(parsed.data.balance) })
    .returning();
  res.status(201).json(GetAccountResponse.parse({ ...account, balance: parseFloat(account.balance) }));
});

router.get("/accounts/:id", async (req, res): Promise<void> => {
  const params = GetAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [account] = await db.select().from(accountsTable).where(eq(accountsTable.id, params.data.id));
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  res.json(GetAccountResponse.parse({ ...account, balance: parseFloat(account.balance) }));
});

router.patch("/accounts/:id", async (req, res): Promise<void> => {
  const params = UpdateAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.data.name != null) updateData.name = parsed.data.name;
  if (parsed.data.type != null) updateData.type = parsed.data.type;
  if (parsed.data.balance != null) updateData.balance = String(parsed.data.balance);
  if (parsed.data.currency != null) updateData.currency = parsed.data.currency;
  if ("institution" in parsed.data) updateData.institution = parsed.data.institution;
  if ("color" in parsed.data) updateData.color = parsed.data.color;

  const [account] = await db
    .update(accountsTable)
    .set(updateData)
    .where(eq(accountsTable.id, params.data.id))
    .returning();
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  res.json(UpdateAccountResponse.parse({ ...account, balance: parseFloat(account.balance) }));
});

router.delete("/accounts/:id", async (req, res): Promise<void> => {
  const params = DeleteAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [account] = await db.delete(accountsTable).where(eq(accountsTable.id, params.data.id)).returning();
  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
