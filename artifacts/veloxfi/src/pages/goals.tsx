import { useListGoals, useDeleteGoal, getListGoalsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/format";
import { PlusIcon, EditIcon, TrashIcon, Target } from "lucide-react";
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

export default function Goals() {
  const { data: goals, isLoading } = useListGoals();
  const deleteGoal = useDeleteGoal();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteGoal.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        toast({ title: "Goal deleted" });
      },
      onError: (err) => {
        toast({ title: "Failed to delete goal", description: err.error, variant: "destructive" });
      },
      onSettled: () => setDeletingId(null)
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Track your progress toward what matters.</p>
        </div>
        <Link href="/goals/new">
          <Button data-testid="button-new-goal">
            <PlusIcon className="w-4 h-4 mr-2" /> Add Goal
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isComplete = percent >= 100;

            return (
              <Card key={goal.id} className="group overflow-hidden" data-testid={`card-goal-${goal.id}`}>
                <div 
                  className="h-2 w-full" 
                  style={{ backgroundColor: goal.color || 'hsl(var(--primary))' }} 
                />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{goal.name}</CardTitle>
                      {goal.targetDate && (
                        <CardDescription>Target: {formatDate(goal.targetDate)}</CardDescription>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setLocation(`/goals/${goal.id}`)} data-testid={`button-edit-goal-${goal.id}`}>
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" data-testid={`button-delete-goal-${goal.id}`}>
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the tracking for this goal.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(goal.id)}
                              disabled={deletingId === goal.id}
                            >
                              {deletingId === goal.id ? "Deleting..." : "Delete"}
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
                      {formatCurrency(goal.currentAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">
                      of {formatCurrency(goal.targetAmount)}
                    </div>
                  </div>
                  
                  <Progress 
                    value={percent} 
                    className="h-3" 
                    indicatorClassName={isComplete ? 'bg-emerald-500' : 'bg-primary'}
                    style={!isComplete && goal.color ? { '--progress-color': goal.color } as any : {}}
                  />
                  
                  <div className={`text-sm font-medium mt-3 ${isComplete ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    {isComplete ? (
                      "Goal accomplished!"
                    ) : (
                      `${percent.toFixed(1)}% complete`
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
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold">No goals yet</h3>
            <p className="text-muted-foreground mt-1 mb-4 max-w-sm">
              Setting savings goals is the first step toward achieving them.
            </p>
            <Link href="/goals/new">
              <Button data-testid="button-empty-state-new-goal">Add First Goal</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
