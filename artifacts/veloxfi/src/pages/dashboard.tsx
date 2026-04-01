import { 
  useGetDashboardSummary, 
  useGetSpendingByCategory, 
  useGetMonthlyTrend,
  useListTransactions
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { formatCurrency, formatDate, formatCompactCurrency } from "@/lib/format";
import { ArrowDownIcon, ArrowUpIcon, CreditCard, DollarSign, PiggyBank, Receipt } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: spending, isLoading: isLoadingSpending } = useGetSpendingByCategory();
  const { data: trend, isLoading: isLoadingTrend } = useGetMonthlyTrend();
  const { data: transactions, isLoading: isLoadingTransactions } = useListTransactions({ limit: 5 });

  const COLORS = ['hsl(188 100% 50%)', 'hsl(260 70% 60%)', 'hsl(140 70% 50%)', 'hsl(35 90% 60%)', 'hsl(280 60% 65%)'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Your financial cockpit.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Balance" 
          value={summary?.totalBalance} 
          icon={<DollarSign className="w-4 h-4 text-muted-foreground" />} 
          isLoading={isLoadingSummary} 
        />
        <StatCard 
          title="Total Income" 
          value={summary?.totalIncome} 
          icon={<ArrowUpIcon className="w-4 h-4 text-emerald-500" />} 
          isLoading={isLoadingSummary} 
        />
        <StatCard 
          title="Total Expenses" 
          value={summary?.totalExpenses} 
          icon={<ArrowDownIcon className="w-4 h-4 text-destructive" />} 
          isLoading={isLoadingSummary} 
        />
        <StatCard 
          title="Net Savings" 
          value={summary?.netSavings} 
          icon={<PiggyBank className="w-4 h-4 text-primary" />} 
          isLoading={isLoadingSummary} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
            <CardDescription>Income vs Expenses over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            {isLoadingTrend ? (
              <Skeleton className="w-full h-full" />
            ) : trend && trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => formatCompactCurrency(value)}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="income" fill="hsl(140 70% 50%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spending by Category */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Spending</CardTitle>
            <CardDescription>This month's expenses by category</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] flex flex-col items-center justify-center">
            {isLoadingSpending ? (
              <Skeleton className="w-48 h-48 rounded-full" />
            ) : spending && spending.length > 0 ? (
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spending}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="category"
                        stroke="none"
                      >
                        {spending.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {spending.slice(0, 4).map((s, i) => (
                    <div key={s.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground truncate max-w-[100px]">{s.category}</span>
                      </div>
                      <span className="font-mono font-medium">{formatCurrency(s.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-md min-h-[250px]">
                No spending data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </div>
          <Link href="/transactions" className="text-sm text-primary hover:underline" data-testid="link-view-all-transactions">
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="w-full h-12" />)}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors" data-testid={`row-recent-transaction-${t.id}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                      {t.type === 'income' ? <ArrowUpIcon className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{t.category} • {formatDate(t.date)}</p>
                    </div>
                  </div>
                  <div className={`font-mono font-bold ${t.type === 'income' ? 'text-emerald-500' : ''}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
              No recent transactions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, isLoading }: { title: string, value?: number, icon: React.ReactNode, isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-24 h-8" />
        ) : (
          <div className="text-2xl font-bold font-mono tracking-tight">{formatCurrency(value || 0)}</div>
        )}
      </CardContent>
    </Card>
  );
}
