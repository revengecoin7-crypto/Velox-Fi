import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCreateGoal, 
  useUpdateGoal, 
  getListGoalsQueryKey,
  useListGoals
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const goalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.coerce.number().min(0.01, "Target amount must be greater than 0"),
  currentAmount: z.coerce.number().min(0).default(0),
  targetDate: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export default function GoalsForm() {
  const { id } = useParams();
  const isEditing = Boolean(id && id !== "new");
  const goalId = isEditing ? parseInt(id!) : 0;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals, isLoading: isLoadingGoals } = useListGoals({ query: { enabled: isEditing }});
  const goal = goals?.find(g => g.id === goalId);

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      targetDate: "",
      category: "",
      color: "#00e5ff",
    },
  });

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (goal && isEditing && initializedForId.current !== goalId) {
      initializedForId.current = goalId;
      form.reset({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : "",
        category: goal.category || "",
        color: goal.color || "#00e5ff",
      });
    }
  }, [goal, isEditing, goalId, form]);

  const onSubmit = (data: GoalFormValues) => {
    if (isEditing) {
      updateGoal.mutate(
        { id: goalId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
            toast({ title: "Goal updated successfully" });
            setLocation("/goals");
          },
          onError: (err) => {
            toast({ title: "Failed to update goal", description: err.error, variant: "destructive" });
          }
        }
      );
    } else {
      createGoal.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
            toast({ title: "Goal created successfully" });
            setLocation("/goals");
          },
          onError: (err) => {
            toast({ title: "Failed to create goal", description: err.error, variant: "destructive" });
          }
        }
      );
    }
  };

  const isPending = createGoal.isPending || updateGoal.isPending;

  if (isEditing && isLoadingGoals) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-48 h-8" />
        <Card><CardContent className="p-6"><Skeleton className="w-full h-64" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/goals")} data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight">
            {isEditing ? "Edit Goal" : "Create Goal"}
          </h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Emergency Fund, New Car" {...field} data-testid="input-goal-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                          <Input type="number" step="0.01" className="pl-7 font-mono" {...field} data-testid="input-goal-target" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Saved Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                          <Input type="number" step="0.01" className="pl-7 font-mono" {...field} data-testid="input-goal-current" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} data-testid="input-goal-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            type="color" 
                            {...field} 
                            value={field.value || "#00e5ff"} 
                            className="w-12 h-10 p-1 cursor-pointer"
                            data-testid="input-goal-color"
                          />
                          <Input 
                            type="text" 
                            {...field} 
                            value={field.value || "#00e5ff"} 
                            className="flex-1 font-mono uppercase"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setLocation("/goals")} data-testid="button-cancel-goal">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} data-testid="button-submit-goal">
                  {isPending ? "Saving..." : (isEditing ? "Update Goal" : "Create Goal")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
