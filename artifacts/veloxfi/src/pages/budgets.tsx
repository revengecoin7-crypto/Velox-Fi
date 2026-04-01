import { useListBudgets, useDeleteBudget, getListBudgetsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { PlusIcon, EditIcon, TrashIcon, PieChart } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Budgets() {
  const { data: budgets, isLoading } = useListBudgets();
  const deleteBudget = useDeleteBudget();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteBudget.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBudgetsQueryKey() });
        toast({ title: "Budget deleted" });
      },
      onError: (err) => {
        toast({ title: "Failed to delete budget", description: err.error, variant: "destructive" });
      },
      onSettled: () => setDeletingId(null)
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Keep your spending in check.</p>
        </div>
        <Link href="/budgets/new">
          <Button data-testid="button-new-budget">
            <PlusIcon className="w-4 h-4 mr-2" /> Create Budget
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : budgets && budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map(budget => {
            const percent = Math.min((budget.spent / budget.limit) * 100, 100);
            const isOver = budget.spent > budget.limit;
            const remaining = budget.limit - budget.spent;

            return (
              <Card key={budget.id} className="group overflow-hidden" data-testid={`card-budget-${budget.id}`}>
                <div 
                  className="h-2 w-full" 
                  style={{ backgroundColor: budget.color || 'hsl(var(--primary))' }} 
                />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{budget.category}</CardTitle>
                      <CardDescription className="capitalize">{budget.period}</CardDescription>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setLocation(`/budgets/${budget.id}`)} data-testid={`button-edit-budget-${budget.id}`}>
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" data-testid={`button-delete-budget-${budget.id}`}>
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Budget?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the budget tracking, but your actual transactions will not be deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(budget.id)}
                              disabled={deletingId === budget.id}
                            >
                              {deletingId === budget.id ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-2xl font-bold font-mono">
                      {formatCurrency(budget.spent)}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">
                      of {formatCurrency(budget.limit)}
                    </div>
                  </div>
                  
                  <Progress 
                    value={percent} 
                    className="h-3" 
                    indicatorClassName={isOver ? 'bg-destructive' : 'bg-primary'}
                    style={!isOver && budget.color ? { '--progress-color': budget.color } as any : {}}
                  />
                  
                  <div className={`text-sm font-medium mt-3 ${isOver ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {isOver ? (
                      `Over budget by ${formatCurrency(Math.abs(remaining))}`
                    ) : (
                      `${formatCurrency(remaining)} remaining`
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <PieChart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold">No budgets set</h3>
            <p className="text-muted-foreground mt-1 mb-4 max-w-sm">
              Create limits for your spending categories to stay on track.
            </p>
            <Link href="/budgets/new">
              <Button data-testid="button-empty-state-new-budget">Create Budget</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
