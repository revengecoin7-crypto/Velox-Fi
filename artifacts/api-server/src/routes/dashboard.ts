import { Router, type IRouter } from "express";
import { sql, and, eq, gte, lt } from "drizzle-orm";
import { db, accountsTable, transactionsTable, budgetsTable, goalsTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetSpendingByCategoryQueryParams,
  GetSpendingByCategoryResponse,
  GetMonthlyTrendResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [accounts, transactions, budgets, goals] = await Promise.all([
    db.select().from(accountsTable),
    db.select().from(transactionsTable),
    db.select().from(budgetsTable),
    db.select().from(goalsTable),
  ]);

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyTransactions = transactions.filter((t) => new Date(t.date) >= startOfMonth);
  const totalIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpenses = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const summary = {
    totalBalance,
    totalIncome,
    totalExpenses,
    netSavings: totalIncome - totalExpenses,
    accountCount: accounts.length,
    transactionCount: transactions.length,
    budgetCount: budgets.length,
    goalCount: goals.length,
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/dashboard/spending-by-category", async (req, res): Promise<void> => {
  const queryParams = GetSpendingByCategoryQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  const monthStr = queryParams.data.month;
  let startDate: Date;
  let endDate: Date;

  if (monthStr) {
    const [year, month] = monthStr.split("-").map(Number);
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 1);
  } else {
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  const transactions = await db
    .select()
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.type, "expense"),
        gte(transactionsTable.date, startDate),
        lt(transactionsTable.date, endDate)
      )
    );

  const byCategory: Record<string, { amount: number; count: number }> = {};
  let total = 0;

  for (const t of transactions) {
    const amount = parseFloat(t.amount);
    if (!byCategory[t.category]) {
      byCategory[t.category] = { amount: 0, count: 0 };
    }
    byCategory[t.category].amount += amount;
    byCategory[t.category].count += 1;
    total += amount;
  }

  const result = Object.entries(byCategory)
    .map(([category, { amount, count }]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100 * 10) / 10 : 0,
      transactionCount: count,
    }))
    .sort((a, b) => b.amount - a.amount);

  res.json(GetSpendingByCategoryResponse.parse(result));
});

router.get("/dashboard/monthly-trend", async (_req, res): Promise<void> => {
  const now = new Date();
  const months: Array<{ month: string; income: number; expenses: number; net: number }> = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(and(gte(transactionsTable.date, date), lt(transactionsTable.date, nextDate)));

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthLabel = date.toLocaleString("default", { month: "short", year: "2-digit" });

    months.push({ month: monthLabel, income, expenses, net: income - expenses });
  }

  res.json(GetMonthlyTrendResponse.parse(months));
});

export default router;
