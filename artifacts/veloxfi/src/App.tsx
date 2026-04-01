import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Accounts from "@/pages/accounts";
import AccountsForm from "@/pages/accounts-form";
import Transactions from "@/pages/transactions";
import TransactionsForm from "@/pages/transactions-form";
import Budgets from "@/pages/budgets";
import BudgetsForm from "@/pages/budgets-form";
import Goals from "@/pages/goals";
import GoalsForm from "@/pages/goals-form";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        
        <Route path="/accounts" component={Accounts} />
        <Route path="/accounts/new" component={AccountsForm} />
        <Route path="/accounts/:id" component={AccountsForm} />
        
        <Route path="/transactions" component={Transactions} />
        <Route path="/transactions/new" component={TransactionsForm} />
        <Route path="/transactions/:id" component={TransactionsForm} />
        
        <Route path="/budgets" component={Budgets} />
        <Route path="/budgets/new" component={BudgetsForm} />
        <Route path="/budgets/:id" component={BudgetsForm} />
        
        <Route path="/goals" component={Goals} />
        <Route path="/goals/new" component={GoalsForm} />
        <Route path="/goals/:id" component={GoalsForm} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="veloxfi-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
